import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
} from "@nextui-org/react";
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { requestTokens } from "#/lib/networkRequests";

export function RequestTestTokens() {
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!anchorWallet) return;
    setLoading(true);
    const data = await requestTokens(anchorWallet.publicKey.toBase58());
    setLoading(false);
    const { signature } = data;
    if (!signature) return;
    window.open(`https://explorer.solana.com/transaction/${data.signature}?cluster=devnet`, '_blank');
  }

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Request Tokens required for testing the POC</p>
          <p className="text-small text-default-500">Note: These tokens only exist in Devnet and have no real value</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <Button
          color="primary"
          onClick={handleClick}
          isLoading={loading}
        >
          Request
        </Button>
      </CardBody>
    </Card>
  );
}