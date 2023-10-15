import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  CardFooter,
  Input,
} from "@nextui-org/react";
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { withdrawMoney } from "#/lib/contractInteraction";

export function WithdrawFunds() {
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  async function handleClick() {
    if (!anchorWallet) return;
    setLoading(true);
    await withdrawMoney(amount, true, anchorWallet);
    setLoading(false);
  }

  return (
    <Card className="max-w-[400px]">

      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Withdraw Funds</p>
          <p className="text-small text-default-500">
            Withdrawing funds will pay the applicable taxes and update our tax account
          </p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody>
        <Input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
      </CardBody>

      <Divider />

      <CardFooter>
        <Button color="primary" onClick={handleClick} isLoading={loading}>
          Withdraw
        </Button>
      </CardFooter>

    </Card>
  );
}
