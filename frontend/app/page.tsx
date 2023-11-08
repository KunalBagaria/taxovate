"use client";

import Image from "next/image";
import logo from "#/images/logo.svg";

import { Poppins } from "next/font/google";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectWalletButton } from "#/components/connectWallet";
import { InitializeTaxAccount } from "#/components/initialize";
import { TaxInfo } from "#/components/taxAccountInfo";
import { WithdrawFunds } from "#/components/withdraw";
import { SubmitClaim } from "#/components/claims";
import { RequestTestTokens } from "#/components/requestTokens";

const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export default function Page() {
  const { publicKey } = useWallet();
  return (
    <>
      <main className={fontPoppins.className}>
        {!publicKey && (
          <>
            <Image className="lg-logo" src={logo} alt="Logo" />
            <ConnectWalletButton></ConnectWalletButton>
          </>
        )}
        {publicKey && (
          <div className="content">
            <Image className="sm-logo" src={logo} alt="Logo" />
            <div className="max-w-container">
              <p>
                {
                  "A proof-of-concept for paying taxes in real time and fixing the traditional taxation system which is filled with inefficiencies, costly professional services, and annual stress over financial record-keeping."
                }
              </p>
              <TaxInfo />

              <div className="content-child">
                <InitializeTaxAccount />
                <RequestTestTokens />
                <WithdrawFunds />
                <SubmitClaim />
              </div>


            </div>
          </div>
        )}
      </main>
    </>
  );
}
