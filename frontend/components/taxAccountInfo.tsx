import {
  getTaxAccount,
  getTaxAccountInfo,
  getTokenBalance,
} from "#/lib/contractInteraction";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export function TaxInfo() {
  const anchorWallet = useAnchorWallet();
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [incomeTaxed, setIncomeTaxed] = useState(0);
  const [taxPaid, setTaxPaid] = useState(0);
  const [claims, setClaims] = useState(0);

  async function update() {
    if (!anchorWallet) return;
    const taxAccountPDA = await getTaxAccount(anchorWallet);
    const taxAccountData = await getTaxAccountInfo(anchorWallet);
    if (!taxAccountData) return;
    const taxedIncome = taxAccountData.taxedIncome.toNumber();
    const taxPaid_ = taxAccountData.taxPaid.toNumber();
    const claimsCreated = taxAccountData.claimsCount.toNumber();
    const balance = await getTokenBalance(taxAccountPDA.taxAccount);
    console.log("Account Refresh:", {
      taxAccount: taxAccountPDA.taxAccount.toBase58(),
      taxedIncome,
      taxPaid: taxPaid_,
      balance,
    });
    setBalance(balance);
    setAccount(taxAccountPDA.taxAccount.toBase58());
    setIncomeTaxed(taxedIncome);
    setTaxPaid(taxPaid_);
    setClaims(claimsCreated);
  }

  return (
    <>
      {account && (
        <div className="account-details">
          <h1 className="account-info">Account Address: {account}</h1>
          <h1 className="account-info">
            Account Balance: {balance.toLocaleString()}
          </h1>
          <h1 className="account-info">
            Income Taxed: {incomeTaxed.toLocaleString()}
          </h1>
          <h1 className="account-info">Tax Paid: {taxPaid.toLocaleString()}</h1>
          <h1 className="account-info">Claims Created: {claims}</h1>
        </div>
      )}

      <Button className="refresh-btn" color="primary" onClick={update}>Refresh Account</Button>
    </>
  );
}
