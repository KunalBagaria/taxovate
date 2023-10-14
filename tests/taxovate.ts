import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Taxovate } from "../target/types/taxovate";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";

describe("taxovate", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  // Replace as appropriate
  const tokenMint = new anchor.web3.PublicKey("4mam4mhRsaRogML5os2uRSFs4MgkCdQghkwMZk8YMN1y");
  const govPoolOwner = new anchor.web3.PublicKey("AjsnLCea7MuBTu5YPi9FfegSJWGz2TByoMq6sLpH1PPr");

  const program = anchor.workspace.Taxovate as Program<Taxovate>;
  const [taxAccount, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user"), anchor.Wallet.local().publicKey.toBuffer()],
    program.programId
  );

  async function initialize(log = true) {
    try {
      const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
      if (log) console.log("Tax account PDA", taxAccount);
      if (log) console.log("Tax account data", taxAccountData);
    } catch (e) {
      const tx = await program.methods
        .initialize()
        .accounts({
          taxAccount,
        })
        .rpc();
      const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
      if (log) console.log("Tax account PDA", taxAccount);
      if (log) console.log("Tax account data", taxAccountData);
    }
  }

  async function createClaim(log = true) {
    const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
    const newClaimId = new BN(taxAccountData.claimsCount).add(new BN(1));
    const [claimAccount] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("claim"),
        taxAccount.toBytes(),
        newClaimId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    const tx = await program.methods
      .createClaim(
        newClaimId, // New Claim ID
        "420", // Tax Code applicable for deduction
        new BN(1), // Claimed amount
        new BN(8), // For the income amount
        "No proof needed :)" // Proof of claim
      )
      .accounts({
        taxAccount,
        claim: claimAccount,
      })
      .rpc();
    const claimAccountData = await program.account.claim.fetch(claimAccount);
    if (log) console.log("Claim account data", claimAccountData);
    return claimAccount;
  }

  async function reviewClaim(approve: boolean, claimAccount: anchor.web3.PublicKey, log = true) {
    const claimAccountData = await program.account.claim.fetch(claimAccount);
    const tx = await program.methods.reviewClaim(claimAccountData.id, approve).accounts({
      taxAccount,
      claim: claimAccount,
    }).rpc();
    const claimAccountDataReviewed = await program.account.claim.fetch(claimAccount);
    if (log) console.log("Claim account data after review", claimAccountDataReviewed);
  }

  async function withdrawMoney(_amount: number, log = true) {
    const amount = new BN(_amount * (10 ** 6));
    const taxAccountATA = await getAssociatedTokenAddress(tokenMint, taxAccount, true);
    const userATA = await getAssociatedTokenAddress(tokenMint, anchor.Wallet.local().publicKey);
    const govPoolATA = await getAssociatedTokenAddress(tokenMint, govPoolOwner);

    const tx = await program.methods.withdraw(amount, bump).accounts({
      taxAccount,
      fromAta: taxAccountATA,
      toAta: userATA,
      tokenProgram: TOKEN_PROGRAM_ID,
      govAta: govPoolATA,
    }).rpc();
    console.log("Withdrawal tx", tx);

    const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
    if (log) console.log("Tax paid:", taxAccountData.taxPaid.toNumber());
  }

  it("Should initialize a tax account", async () => {
    await initialize(true);
  });

  it("Should make a withdrawal", async () => {
    await withdrawMoney(300000, true);
  });

  it("Should create a tax deduction claim", async () => {
    await createClaim(false);
  });

  it("Should approve a tax deduction claim", async () => {
    const claimAccount = await createClaim(false);
    await reviewClaim(true, claimAccount, false);
  });

});
