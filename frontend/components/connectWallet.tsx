import { Button } from '@nextui-org/react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const ConnectWalletButton = () => {
  const { visible, setVisible } = useWalletModal();
  const handleClick = () => {
    setVisible(true);
  }
  return (
    <Button
      onClick={handleClick}
      isLoading={visible}
      color='secondary'
      size='lg'
    >
      Connect Wallet
    </Button>
  );
};