import { NextApiRequest, NextApiResponse } from "next";
import { Keypair, PublicKey } from "@solana/web3.js";
import { sendSPL } from "#/lib/sendSPL";
import { TOKEN_MINT } from "#/lib/constants";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    const { publicKey } = req.body;
    const jsonStringKeypair = process.env["KEYPAIR"]!;
    const keypairArray = JSON.parse(jsonStringKeypair);
    const keypairUint = Uint8Array.from(keypairArray);
    const keypair = Keypair.fromSecretKey(keypairUint);
    const toWallet = new PublicKey(publicKey);
    const transaction = await sendSPL(TOKEN_MINT, keypair, toWallet, 1_000_000);
    if (transaction) {
      res.status(200).json({
        signature: transaction
      })
    } else {
      res.status(500).json({
        error: "Error while sending transaction"
      })
    }
  } catch (e) {
    res.status(500).json({
      error: e
    })
  }
}

export default handler;