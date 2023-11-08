import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  TOKEN_MINT,
  GOV_POOL_OWNER,
  TAXOVATE_PROGRAM_ID,
} from "#/lib/constants";
import { IDL } from "#/lib/IDL";
import toast from "react-hot-toast";

function getProgram(wallet: AnchorWallet) {
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);
  return new Program(IDL, TAXOVATE_PROGRAM_ID, provider);
}

async function getTaxAccount(wallet: AnchorWallet) {
  const program = getProgram(wallet);
  const publicKey = wallet.publicKey;
  const [taxAccount, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), publicKey.toBuffer()],
    program.programId
  );
  return { taxAccount, bump };
}

async function getTaxAccountInfo(wallet: AnchorWallet) {
  try {
    const program = getProgram(wallet);
    const { taxAccount } = await getTaxAccount(wallet);
    const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
    return taxAccountData;
  } catch (e) {
    return null;
  }
}

async function initialize(log = true, wallet: AnchorWallet) {
  try {
    const program = getProgram(wallet);
    const { taxAccount } = await getTaxAccount(wallet);
    const taxAccountData = await program.account.taxAccount.fetch(taxAccount);
    if (log) console.log("Tax account PDA", taxAccount.toBase58());
    if (log) console.log("Tax paid:", taxAccountData.taxPaid.toNumber());
    if (log) console.log("On Income:", taxAccountData.taxedIncome.toNumber());
    toast.success("Tax Account already initialized", { position: "top-left" });
  } catch (e) {
    const connection = new Connection("https://api.devnet.solana.com");
    const program = getProgram(wallet);
    const { taxAccount } = await getTaxAccount(wallet);
    const transaction = await program.methods
      .initialize()
      .accounts({
        taxAccount,
      })
      .transaction();

    // init token accounts
    const pdaTokenAccountAddress = getAssociatedTokenAddressSync(
      TOKEN_MINT,
      taxAccount,
      true
    );
    const userTokenAccountAddress = getAssociatedTokenAddressSync(
      TOKEN_MINT,
      wallet.publicKey
    );
    transaction.add(
      createAssociatedTokenAccountInstruction(wallet.publicKey, pdaTokenAccountAddress, taxAccount, TOKEN_MINT)
    );
    transaction.add(
      createAssociatedTokenAccountInstruction(wallet.publicKey, userTokenAccountAddress, wallet.publicKey, TOKEN_MINT)
    );
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;

    // sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const tx = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log("Initialize Tx", tx);
    window.open(
      "https://explorer.solana.com/tx/" + tx + "?cluster=devnet",
      "_blank"
    );
    toast.success("Initialized Tax Accounts");
  }
}

async function createClaim(log = true, wallet: AnchorWallet, claimAmount: number, incomeAmount: number, taxCode: string, proof: string) {
  const program = getProgram(wallet);
  const { taxAccount } = await getTaxAccount(wallet);
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
      taxCode, // Tax Code applicable for deduction
      new BN(claimAmount), // Claimed amount
      new BN(incomeAmount), // For the income amount
      proof // Proof of claim
    )
    .accounts({
      taxAccount,
      claim: claimAccount,
    })
    .rpc();
  toast.success("Claim created", { position: "top-left" });
  window.open(
    "https://explorer.solana.com/tx/" + tx + "?cluster=devnet",
    "_blank"
  );
  return claimAccount;
}

async function reviewClaim(
  approve: boolean,
  claimAccount: anchor.web3.PublicKey,
  log = true,
  wallet: AnchorWallet
) {
  const program = getProgram(wallet);
  const { taxAccount } = await getTaxAccount(wallet);
  const claimAccountData = await program.account.claim.fetch(claimAccount);
  const tx = await program.methods
    .reviewClaim(claimAccountData.id, approve)
    .accounts({
      taxAccount,
      claim: claimAccount,
    })
    .rpc();
  const claimAccountDataReviewed =
    await program.account.claim.fetch(claimAccount);
  if (log)
    console.log("Claim account data after review", claimAccountDataReviewed);
}

async function withdrawMoney(
  _amount: number,
  log = true,
  wallet: AnchorWallet
) {
  const program = getProgram(wallet);
  const { taxAccount, bump } = await getTaxAccount(wallet);
  const amount = new BN(_amount);
  const taxAccountATA = await getAssociatedTokenAddress(
    TOKEN_MINT,
    taxAccount,
    true
  );
  const userATA = await getAssociatedTokenAddress(TOKEN_MINT, wallet.publicKey);
  const govPoolATA = await getAssociatedTokenAddress(
    TOKEN_MINT,
    GOV_POOL_OWNER
  );
  const tx = await program.methods
    .withdraw(amount, bump)
    .accounts({
      taxAccount,
      fromAta: taxAccountATA,
      toAta: userATA,
      tokenProgram: TOKEN_PROGRAM_ID,
      govAta: govPoolATA,
    })
    .rpc();
  toast.success("Withdrawl Successful", { position: "top-left" });
  if (log) console.log("Withdrawl Tx", tx);
  window.open(
    "https://explorer.solana.com/tx/" + tx + "?cluster=devnet",
    "_blank"
  );
}

async function getTokenBalance(publicKey: PublicKey) {
  const connection = new Connection("https://api.devnet.solana.com");
  try {
    const ata = await getAssociatedTokenAddress(TOKEN_MINT, publicKey, true);
    const balance = await connection.getTokenAccountBalance(ata);
    return Number(balance.value.amount) / 10 ** balance.value.decimals;
  } catch (e) {
    // console.log(e);
    return 0;
  }
}

export {
  initialize,
  createClaim,
  reviewClaim,
  withdrawMoney,
  getTaxAccountInfo,
  getTaxAccount,
  getTokenBalance,
};
