import { BigNumber, ethers } from 'ethers';
import { TokenListToken } from 'etherspot/dist/sdk/assets/classes/token-list-token';
import { IAssetWithBalance } from '../providers/EtherspotContextProvider';

// Based on: https://chainid.network/
export const CHAIN_ID = {
  ETHEREUM_MAINNET: 1,
  POLYGON: 137,
  BINANCE: 56,
  XDAI: 100,
  AVALANCHE: 43114,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  AURORA: 1313161554,
  FANTOM: 250,
  CELO: 42220,
  MOONBEAM: 1284,
  GNOSIS:100
};

export interface Chain {
  chainId: number;
  title: string;
  iconUrl: string;
  explorerUrl: string;
}

export const supportedChains: Chain[] = [
  {
    chainId: CHAIN_ID.ETHEREUM_MAINNET,
    title: 'Ethereum',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/ethereum.png',
    explorerUrl: 'https://etherscan.io/tx/',
  },
  {
    chainId: CHAIN_ID.POLYGON,
    title: 'Polygon',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/polygon.svg',
    explorerUrl: 'https://polygonscan.com/tx/',
  },
  {
    chainId: CHAIN_ID.BINANCE,
    title: 'BNB Chain',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/binance.svg',
    explorerUrl: 'https://bscscan.com/tx/',
  },
  {
    chainId: CHAIN_ID.XDAI,
    title: 'Gnosis Chain (xDai)',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/gnosis.png',
    explorerUrl: 'https://blockscout.com/xdai/mainnet/tx/',
  },
  {
    chainId: CHAIN_ID.AVALANCHE,
    title: 'Avalanche',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/avalanche.svg',
    explorerUrl: 'https://snowtrace.io/tx/',
  },
  {
    chainId: CHAIN_ID.OPTIMISM,
    title: 'Optimism',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/optimism.png',
    explorerUrl: 'https://optimistic.etherscan.io/tx/',
  },
  {
    chainId: CHAIN_ID.ARBITRUM,
    title: 'Arbitrum',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/arbitrum.svg',
    explorerUrl: 'https://arbiscan.io/tx/',
  },
  {
    chainId: CHAIN_ID.AURORA,
    title: 'Aurora',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/aurora.svg',
    explorerUrl: 'https://aurorascan.dev/tx/',
  },
  {
    chainId: CHAIN_ID.FANTOM,
    title: 'Fantom',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/fantom.svg',
    explorerUrl: 'https://ftmscan.com/tx/',
  },
  {
    chainId: CHAIN_ID.MOONBEAM,
    title: 'Moonbeam',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/moonbeam.png',
    explorerUrl: 'https://moonscan.io/tx/',
  },
  {
    chainId: CHAIN_ID.CELO,
    title: 'CELO',
    iconUrl: 'https://public.etherspot.io/buidler/chain_logos/celo.png',
    explorerUrl: 'https://explorer.celo.org/mainnet/tx/',
  },
];

export const nativeAssetPerChainId: { [chainId: number]: TokenListToken } = {
  [CHAIN_ID.ETHEREUM_MAINNET]: {
    chainId: CHAIN_ID.ETHEREUM_MAINNET,
    address: ethers.constants.AddressZero,
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/ethereum.png',
  },
  [CHAIN_ID.POLYGON]: {
    chainId: CHAIN_ID.POLYGON,
    address: ethers.constants.AddressZero,
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/native_tokens/matic.png',
  },
  [CHAIN_ID.BINANCE]: {
    chainId: CHAIN_ID.BINANCE,
    address: ethers.constants.AddressZero,
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/binance.svg',
  },
  [CHAIN_ID.XDAI]: {
    chainId: CHAIN_ID.XDAI,
    address: ethers.constants.AddressZero,
    name: 'xDAI',
    symbol: 'XDAI',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/native_tokens/xdai.png',
  },
  [CHAIN_ID.AVALANCHE]: {
    chainId: CHAIN_ID.AVALANCHE,
    address: ethers.constants.AddressZero,
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/avalanche.svg',
  },
  [CHAIN_ID.OPTIMISM]: {
    chainId: CHAIN_ID.OPTIMISM,
    address: ethers.constants.AddressZero,
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/avalanche.svg',
  },
  [CHAIN_ID.AURORA]: {
    chainId: CHAIN_ID.AURORA,
    address: ethers.constants.AddressZero,
    name: 'Aurora',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/aurora.svg',
  },
  [CHAIN_ID.ARBITRUM]: {
    chainId: CHAIN_ID.ARBITRUM,
    address: ethers.constants.AddressZero,
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/arbitrum.svg',
  },
  [CHAIN_ID.FANTOM]: {
    chainId: CHAIN_ID.FANTOM,
    address: ethers.constants.AddressZero,
    name: 'Fantom',
    symbol: 'FTM',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/fantom.svg',
  },
  [CHAIN_ID.MOONBEAM]: {
    chainId: CHAIN_ID.MOONBEAM,
    address: ethers.constants.AddressZero,
    name: 'Moonbeam',
    symbol: 'GLMR',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/moonbeam.png',
  },
  [CHAIN_ID.CELO]: {
    chainId: CHAIN_ID.CELO,
    address: ethers.constants.AddressZero,
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
    logoURI: 'https://public.etherspot.io/buidler/chain_logos/celo.png',
  },
};

export const klimaAsset: IAssetWithBalance = {
  address: '0x4e78011Ce80ee02d2c3e649Fb657E45898257815',
  chainId: CHAIN_ID.POLYGON,
  name: 'Klima DAO',
  symbol: 'sKLIMA',
  decimals: 9,
  logoURI: 'https://public.etherspot.io/buidler/chain_logos/klimadao.png',
  balance: BigNumber.from(0),
  assetPriceUsd: null,
  balanceWorthUsd: null,
}

export const plrDaoAsset: IAssetWithBalance = {
  address: '0xa6b37fC85d870711C56FbcB8afe2f8dB049AE774',
  chainId: CHAIN_ID.POLYGON,
  name: 'Pillar DAO',
  symbol: 'PillarDAO',
  decimals: 18,
  logoURI: 'https://public.pillar.fi/files/pillar-dao-member-badge.png',
  balance: BigNumber.from(0),
  assetPriceUsd: null,
  balanceWorthUsd: null,
}

export const plrDaoConstants={
  stakingAddress: '0x4D70a031Fc76DA6a9bC0C922101A05FA95c3A227',
  polygonAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
}

export const changeToChain = async (chainId: number): Promise<boolean> => {
  // @ts-ignore
  if (!window?.ethereum) {
    alert('Unsupported browser!');
    return false;
  }

  const supportedChain = supportedChains.find((supportedChain) => supportedChain.chainId === chainId);
  if (!supportedChain) {
    alert('Unsupported chain!');
    return false;
  }

  try {
    // @ts-ignore
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.utils.hexlify(chainId) }], // chainId must be in hexadecimal numbers
    });
    return true;
  } catch (error) {
    // @ts-ignore
    if (error.code === 4902) {
      try {
        // @ts-ignore
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              title: supportedChain.title,
              chainId: ethers.utils.hexlify(chainId),
            },
          ],
        });
        return true;
      } catch (e) {
        //
      }
    }
  }

  alert(`Please manually switch to ${supportedChain.title}.`);
  return false;
}
