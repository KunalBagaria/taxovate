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
import { initialize } from "#/lib/contractInteraction";

export function InitializeTaxAccount() {
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!anchorWallet) return;
    setLoading(true);
    await initialize(true, anchorWallet);
    setLoading(false);
  }

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Initialize the Tax Account</p>
          <p className="text-small text-default-500">We need to initialize the PDA that will hold the user funds</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <Button
          color="primary"
          onClick={handleClick}
          isLoading={loading}
        >
          Initialize
        </Button>
      </CardBody>
    </Card>
  );
}
