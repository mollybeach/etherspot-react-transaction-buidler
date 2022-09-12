import { uniqueId } from 'lodash';
import { Asset } from '../providers/EtherspotContextProvider';
import { SelectOption } from '../components/SelectInput/SelectInput';
import {
  Chain,
} from './chain';

export const formatAssetAmountInput = (
  amount: string,
  decimals: number = 18,
): string => {
  const formattedAmount = amount
    .replace(/[^.\d]/g, '')
    .replace(/^(\d*\.?)|(\d*)\.?/g, "$1$2")

  if (decimals === 0) return formattedAmount.split('.')[0];

  if (!formattedAmount.includes('.')) return formattedAmount;

  const [integer, fraction] = formattedAmount.split('.');

  if (!fraction) return `${integer}.`;

  const fixedFraction = fraction.slice(0, decimals);

  return `${integer}.${fixedFraction}`;
};

export const formatAmountDisplay = (amountRaw: string | number): string => {
  const amount = typeof amountRaw === 'number' ? `${amountRaw}` : amountRaw;

  // check string to avoid underflow
  if (amount.startsWith('0.01') || amount.startsWith('0.00')) {
    const [,fraction] = amount.split('.');
    let smallAmount = '~0.';

    [...fraction].every((digitString) => {
      if (digitString === '0') {
        smallAmount = `${smallAmount}0`;
        return true;
      }
      smallAmount = `${smallAmount}${digitString}`;
      return false;
    });

    return smallAmount;
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(+amount);
};

export const humanizeHexString = (
  hexString: string,
  startCharsCount: number = 5,
  endCharsCount: number = 4,
  separator: string = '...',
) => {
  const totalTruncatedSum = startCharsCount + endCharsCount + separator.length;

  const words = hexString.toString().split(' ');
  const firstWord = words[0];

  if (words.length === 1) {
    if (firstWord.length <= totalTruncatedSum) return firstWord;
    return `${firstWord.slice(0, startCharsCount)}${separator}${firstWord.slice(-endCharsCount)}`;
  }

  return hexString;
};


export const getTimeBasedUniqueId = (): string => uniqueId(`${+new Date()}-`);

export const mapAssetIntoSelectOption = (asset: Asset): SelectOption => ({
  title: asset.symbol,
  value: asset.address,
  iconUrl: asset.logoURI,
});

export const mapChainIntoSelectOption = (chain: Chain): SelectOption => ({
  value: chain.chainId,
  title: chain.title,
  iconUrl: chain.title,
});

