import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Taxovate } from "../target/types/taxovate";
import { BN } from "bn.js";

describe("taxovate", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Taxovate as Program<Taxovate>;
  const [taxAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user")],
    program.programId
  );

  async function initialize() {
    try {
      const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
      console.log("Tax account data", taxAccountData);
    } catch (e) {
      const tx = await program.methods
        .initialize()
        .accounts({
          taxAccount,
        })
        .rpc();
      console.log("Your transaction signature", tx);
      const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
      console.log("Tax account data", taxAccountData);
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
        newClaimId,
        "420",
        new BN(0),
        new BN(0),
        "No proof needed :)"
      )
      .accounts({
        taxAccount,
        claim: claimAccount,
      })
      .rpc();
    if (!log) console.log("Your transaction signature", tx);
    const claimAccountData = await program.account.claim.fetch(claimAccount);
    if (!log) console.log("Claim account data", claimAccountData);
    return claimAccount;
  }

  async function reviewClaim(approve: boolean, claimAccount: anchor.web3.PublicKey) {
    const claimAccountData = await program.account.claim.fetch(claimAccount);
    const tx = await program.methods.reviewClaim(claimAccountData.id, approve).accounts({
      taxAccount,
      claim: claimAccount,
    }).rpc();
    console.log("Your transaction signature", tx);
    const claimAccountDataReviewed = await program.account.claim.fetch(claimAccount);
    console.log("Claim account data after review", claimAccountDataReviewed);
  }

  it("Should initialize a tax account", async () => {
    await initialize();
  });

  it("Should create a tax deduction claim", async () => {
    await createClaim();
  });

  it("Should approve a tax deduction claim", async () => {
    const claimAccount = await createClaim(false);
    await reviewClaim(true, claimAccount);
  });

});
