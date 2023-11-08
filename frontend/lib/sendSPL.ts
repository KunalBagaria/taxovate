import { toast } from "react-hot-toast";
import {
  Keypair,
  PublicKey,
  Connection,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { DEVNET_ENDPOINT } from "./constants";

export function getConnection() {
  const connection = new Connection(
    DEVNET_ENDPOINT,
    {
      commitment: "processed",
    }
  );
  return connection;
}

async function getTransferTokenTransaction(
  amount: number,
  decimals: number,
  fromAddress: PublicKey,
  toAddress: PublicKey,
  mintAddress: PublicKey
) {
  const connection = getConnection();
  const senderAccountAddress = getAssociatedTokenAddressSync(
    mintAddress,
    fromAddress
  );
  const receiverAccountAddress = getAssociatedTokenAddressSync(
    mintAddress,
    toAddress
  );
  const receiverAccount = await connection.getAccountInfo(
    receiverAccountAddress
  );

  const transaction = new Transaction();

  if (receiverAccount === null) {
    console.log("Receiver account does not exist");
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromAddress,
        receiverAccountAddress,
        toAddress,
        mintAddress
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      senderAccountAddress,
      receiverAccountAddress,
      fromAddress,
      Number(amount) * 10 ** decimals
    )
  );

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromAddress;

  return transaction;
}

export const sendSPL = async (
  mint: PublicKey,
  fromWallet: Keypair,
  toWallet: PublicKey,
  amount: number,
  decimals = 6
) => {
  const connection = getConnection();
  const transaction = await getTransferTokenTransaction(
    amount,
    decimals,
    fromWallet.publicKey,
    toWallet,
    mint
  );
  transaction.sign(fromWallet);
  try {
    const txid = await connection.sendRawTransaction(transaction.serialize());
    return txid;
  } catch (e) {
    console.log(e);
    return;
  }
};