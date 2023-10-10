import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Taxovate } from "../target/types/taxovate";

describe("taxovate", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Taxovate as Program<Taxovate>;

  it("Tax account is initialized!", async () => {
    const [taxAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user")],
      program.programId
    );
    const tx = await program.methods
      .initialize()
      .accounts({
        taxAccount,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

});
