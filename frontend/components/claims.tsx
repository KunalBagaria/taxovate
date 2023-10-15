import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  CardFooter,
  Input,
  Select,
  SelectItem
} from "@nextui-org/react";
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { createClaim, withdrawMoney } from "#/lib/contractInteraction";

export function SubmitClaim() {
  const anchorWallet = useAnchorWallet();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [incomeAmount, setIncomeAmount] = useState(0);
  const [proof, setProof] = useState('');
  const [taxCode, setTaxCode] = useState('');

  async function handleClick() {
    if (!anchorWallet) return;
    setLoading(true);
    await createClaim(
      false,
      anchorWallet,
      amount,
      incomeAmount,
      taxCode,
      proof
    );
    setLoading(false);
  }

  const deductionTypes = [
    "Home loan",
    "Education expenses",
    "Life insurance",
    "Public Provident Fund",
    "Tuition payments",
    "National Pension scheme",
    "National Savings Certificates",
    "Standard deduction",
    "Bank fixed deposits",
    "Charitable contribution deductions in the United States",
    "Equity Linked Savings Scheme",
    "House rent",
    "Medical insurance",
    "Post Office Senior citizens Savings Scheme",
    "Post office time deposit",
    "Section 80C",
    "Children allowance",
    "Deduction for preventive health check",
    "Registered retirement savings plan",
    "Section 80D medical insurance",
    "Section 80EE interest on home loan",
    "Section 80G - donations",
    "Section 80ttb interest income",
  ]

  return (
    <Card className="max-w-[400px]">

      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">Submit a Tax Claim</p>
          <p className="text-small text-default-500">
            If someone is eligible for a tax deduction, they can submit a claim to get the tax refund
          </p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="claims-body">
        <Input type="number" placeholder="Claim Amount" onChange={(e) => setAmount(Number(e.target.value))} />
        <Input type="number" placeholder="For Taxed Income" onChange={(e) => setIncomeAmount(Number(e.target.value))} />
        <Select
          isRequired
          label="Tax Deduction Type"
          placeholder="Select a Tax Deduction Type"
          onChange={(e) => setTaxCode(e.target.value)}
        >
          {deductionTypes.map((d, index) => (
            <SelectItem key={index} value={d}>
              {d}
            </SelectItem>
          ))}
        </Select>
        <Input placeholder="Proof" onChange={(e) => setProof(e.target.value)} />
      </CardBody>

      <Divider />

      <CardFooter>
        <Button color="primary" onClick={handleClick} isLoading={loading}>
          Submit Claim
        </Button>
      </CardFooter>

    </Card>
  );
}
