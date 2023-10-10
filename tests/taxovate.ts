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

  it("Should initialize a tax account", async () => {
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
    }
  });

  it("Should create a tax deduction claim", async () => {
    const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
    const newClaimId = new BN(taxAccountData.claimsCount).add(new BN(1));

    const [claimAccount] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("claim"),
        taxAccount.toBytes(),
        newClaimId.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    console.log("Claim account", claimAccount.toBase58());

    const tx = await program.methods.createClaim(newClaimId, "420", new BN(0), "No proof needed :)")
      .accounts({
        taxAccount,
        claim: claimAccount,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const claimAccountData = await program.account.claim.fetch(claimAccount);
    console.log("Claim account data", claimAccountData);
  });

});
