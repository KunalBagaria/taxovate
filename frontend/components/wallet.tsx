import toast from 'react-hot-toast';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  useWalletModal
} from '@solana/wallet-adapter-react-ui';
import { DEVNET_ENDPOINT, MAINNET_ENDPOINT } from '#/lib/constants';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const clusterApiUrl = (cluster: 'devnet' | 'mainnet-beta') => (
  cluster === 'devnet'
    ? DEVNET_ENDPOINT
    : MAINNET_ENDPOINT
);

export const Wallet = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ConnectWallet = ({
  children,
  noFullSize,
  noToast,
  afterConnect
}: {
  children: React.ReactNode;
  noFullSize?: boolean;
  noToast?: boolean;
  afterConnect?: any;
}) => {
  const { wallet, connect, publicKey } = useWallet();
  const { visible, setVisible } = useWalletModal();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const req = !publicKey && wallet && wallet.readyState === 'Installed' && clicked;
    if (req) {
      try {
        connect();
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (publicKey && !noToast) toast.success('Connected to wallet');
    if (afterConnect) afterConnect();
  }, [
    wallet,
    visible,
    publicKey,
    clicked
  ]);

  const handleConnect = () => {
    if (wallet) return;
    setVisible(true);
  }

  return (
    <div
      style={{
        width: noFullSize ? 'max-content' : '100%',
        height: noFullSize ? 'max-content' : '100%'
      }}
      onClick={() => {
        setClicked(true);
        handleConnect();
      }}
    >
      {children}
    </div>
  );
};