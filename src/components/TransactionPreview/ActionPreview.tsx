import React, { useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { ethers } from 'ethers';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import {BiCheck} from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import { BsClockHistory } from 'react-icons/bs';
import {FaSignature} from 'react-icons/fa';
import { CHAIN_ID_TO_NETWORK_NAME } from 'etherspot/dist/sdk/network/constants';

// Components
import Card from '../Card';
import { ClickableText, Text } from '../Text';
import RouteOption from '../RouteOption';
import { CombinedRoundedImages, RoundedImage } from '../Image';
import GasTokenSelect from '../GasTokenSelect';

// Utils
import { getTransactionExplorerLink, isERC20ApprovalTransactionData } from '../../utils/transaction';
import { formatAmountDisplay, humanizeHexString, copyToClipboard, getTypeOfAddress } from '../../utils/common';
import { Chain, CHAIN_ID, klimaAsset, nativeAssetPerChainId, supportedChains } from '../../utils/chain';
import { Theme } from '../../utils/theme';

// Constants
import { TRANSACTION_BLOCK_TYPE } from '../../constants/transactionBuilderConstants';
import { CROSS_CHAIN_ACTION_STATUS } from '../../constants/transactionDispatcherConstants';
import moment from 'moment';

// Hooks
import { useEtherspot } from '../../hooks';

// Types
import { AssetBridgeActionPreview, AssetSwapActionPreview, ICrossChainAction, SendAssetActionPreview } from '../../types/crossChainAction';
import useAssetPriceUsd from '../../hooks/useAssetPriceUsd';
import HoneySwapRoute from '../HoneySwapRoute/HoneySwapRoute';
import { GNOSIS_USDC_CONTRACT_ADDRESS } from '../../constants/assetConstants';

const TransactionAction = styled.div<{ border?: boolean }>`
  position: relative;
  margin-bottom: 18px;
  background: ${({ theme }) => theme.color.background.selectInputExpanded};
  color: ${({ theme }) => theme.color.text.selectInputExpanded};
  border-radius: 8px;
  padding: 12px;
  word-break: break-all;

  ${({ border = false, theme }) => border && `border: 1px solid ${theme.color.background.textInputBorder};`}
`;

const TransactionStatusAction = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const DoubleTransactionActionsInSingleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;

  ${TransactionAction}:first-child {
    margin-right: 13px;
    width: calc(50% - 13px);
  }

  ${TransactionAction}:last-child {
    width: 50%;
  }
`;

const Label = styled.label`
  display: inline-block;
  color: ${({ theme }) => theme.color.text.innerLabel};
  margin-bottom: 14px;
  font-size: 14px;
`;

const ValueWrapper = styled.div<{ marginTop?: number }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ marginTop }) => marginTop && `margin-top: ${marginTop}px;`}
`;

const ValueBlock = styled.div`
  margin-right: 20px;
`;

const ValueText = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-top: 3px;
`;

const SignButton = styled(FaSignature)<{ disabled?: boolean }>`
  margin-right: 10px;
  padding: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.5;
  }

  ${({ color }) => color && `color: ${color};`}
  ${({ disabled }) => disabled && `opacity: 0.5;`}
`;

const EditButton = styled(HiOutlinePencilAlt)<{ disabled?: boolean }>`
  margin-right: 10px;
  padding: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  ${({ color }) => color && `color: ${color};`}
  ${({ disabled }) => disabled && `opacity: 0.5;`}
`;

const TransactionStatusWrapper = styled(TransactionAction)<{ border?: boolean }>`
  padding: 18px 14px;
  margin-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  ${({ border = false, theme }) => border && `border: 1px solid ${theme.color.background.textInputBorder};`}
`;

const TransactionStatusMessageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const TransactionStatusClock = styled(Text).attrs({ medium: true })`
  color: ${({ theme }) => theme.color.text.outerLabel};
  font-size: 16px;
  margin-right: 12px;
`;

const StatusIconWrapper = styled.span<{ color?: string }>`
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  ${({ color }) => color && `background: ${color};`}
  color: #fff;
  margin-right: 10px;
  text-align: center;
`;

const RouteWrapper = styled.div`
  position: relative;
  background: ${({ theme }) => theme.color.background.card};
  color: ${({ theme }) => theme.color.text.selectInput};
  border-radius: 8px;
  padding: 8px 14px;
  word-break: break-all;
  margin-top: 6px;
  margin-bottom: 14px;
`;

const Row = styled.div.attrs((props: { center: boolean }) => props)`
  display: flex;
  flex-direction: row;
  ${({ center }) => center && 'align-items: center;'};
`;

const PrepareTransaction = styled.div`
  position: relative;
  margin-bottom: 18px;
  color: ${({ theme }) => theme.color.text.selectInput};
  border-radius: 8px;
  padding: 8px 14px;
  word-break: break-all;
  display: flex;
`;

const PrepareTransactionWrapper = styled.div`
  position: relative;
  margin-bottom: 18px;
  background: ${({ theme }) => theme.color.background.selectInput};
  color: ${({ theme }) => theme.color.text.selectInput};
  border-radius: 8px;
  padding: 8px 14px;
  word-break: break-all;
  width: 100%;
`;

const ColoredText = styled.div`
  color: ${({ theme }) => theme.color.text.reviewLabel};
  padding: 14px;
  word-break: initial;
`;

interface TransactionPreviewInterface {
  crossChainAction: ICrossChainAction;
  onRemove?: () => void;
  onSign?: () => void;
  onEdit?: () => void;
  signButtonDisabled?: boolean;
  editButtonDisabled?: boolean;
  showEditButton?: boolean;
  isSubmitted?: boolean;
  showSignButton?: boolean;
  setIsTransactionDone?: (value: boolean) => void;
  showStatus?: boolean;
  showGasAssetSelect?: boolean;
  hideActionPreviewHeader?: boolean;
}

const TransactionStatus = ({
  crossChainAction,
  setIsTransactionDone,
  web3ProviderChainId,
}: {
  crossChainAction: ICrossChainAction;
  setIsTransactionDone?: (value: boolean) => void;
  web3ProviderChainId?: number;
}) => {
  const theme: Theme = useTheme();
  const { getSdkForChainId, web3Provider } = useEtherspot();
  const [isGettingExplorerLink, setIsGettingExplorerLink] = useState<boolean>(false);
  const [, setSecondsAfter] = useState<number>(0);
  const [prevStatus, setPrevStatus] = useState<{ [id: string]: string }>({});
  const [isTokenApproved, setIsTokenApproved] = useState(false);

  const { chainId, batchHash: transactionsBatchHash } = crossChainAction;

  const previewTransaction = (transactionHash?: string, approvalTransaction: boolean = false) => {
    // show cross chain tx explorer link if bridge action
    if (crossChainAction.type === TRANSACTION_BLOCK_TYPE.ASSET_BRIDGE && !approvalTransaction) {
      const explorerLink =
        crossChainAction?.preview?.route?.steps?.[0]?.tool === 'connext'
          ? `https://connextscan.io/tx/${transactionHash}?source=search`
          : `https://socketscan.io/tx/${transactionHash}`;
      window.open(explorerLink, '_blank');
      return;
    }

    const explorerLink = getTransactionExplorerLink(chainId, transactionHash);

    if (!explorerLink) {
      alert('The transaction hash is not yet available. Please try again later.');
      return;
    }

    window.open(explorerLink, '_blank');
  };

  const previewBatchTransaction = async (approvalTransaction: boolean = false) => {
    if (isGettingExplorerLink) return;

    setIsGettingExplorerLink(true);

    if (crossChainAction.type === TRANSACTION_BLOCK_TYPE.KLIMA_STAKE && !approvalTransaction) {
      setIsGettingExplorerLink(false);
      previewTransaction(crossChainAction.transactionHash, approvalTransaction);
      return;
    }

    if (crossChainAction.type === TRANSACTION_BLOCK_TYPE.HONEY_SWAP_LP && !approvalTransaction) {
      setIsGettingExplorerLink(false);
      previewTransaction(crossChainAction.transactionHash, approvalTransaction);
      return;
    }

    const sdk = getSdkForChainId(chainId);
    if (!transactionsBatchHash || !sdk) {
      alert('The transaction hash is not yet available. Please try again later.');
      setIsGettingExplorerLink(false);
      return;
    }

    let transactionHash = '';
    try {
      const submittedBatch = await sdk.getGatewaySubmittedBatch({
        hash: transactionsBatchHash,
      });
      const { transaction } = submittedBatch;
      transactionHash = transaction?.hash ?? '';
    } catch (e) {
      //
    }

    setIsGettingExplorerLink(false);
    previewTransaction(transactionHash, approvalTransaction);
  };

  useEffect(() => {
    if (crossChainAction.transactions.every((transaction) => !!transaction.finishTimestamp)) return;
    let intervalId = setInterval(() => setSecondsAfter((current) => current + 1), 1000);
    return () => {
      if (!intervalId) return;
      clearInterval(intervalId);
    };
  }, []);

  // only show first on sdk batch transactions
  const statusPreviewTransactions = crossChainAction.useWeb3Provider
    ? crossChainAction.transactions
    : [crossChainAction.transactions[0]];

  const hasApprovalTransaction =
    crossChainAction.useWeb3Provider && isERC20ApprovalTransactionData(statusPreviewTransactions[0].data as string);

  return (
    <>
      {statusPreviewTransactions.map((transaction, index) => {
        const isNetworkSwitchRequired =
          web3ProviderChainId &&
          (crossChainAction.type === TRANSACTION_BLOCK_TYPE.ASSET_BRIDGE ||
            crossChainAction.type === TRANSACTION_BLOCK_TYPE.ASSET_SWAP) &&
          crossChainAction.useWeb3Provider &&
          // @ts-ignore
          web3Provider?.type !== 'WalletConnect' &&
          web3ProviderChainId !== crossChainAction.chainId &&
          transaction.status === CROSS_CHAIN_ACTION_STATUS.UNSENT;

        const transactionStatus = isNetworkSwitchRequired
          ? CROSS_CHAIN_ACTION_STATUS.SWITCH_NETWORK
          : transaction.status || CROSS_CHAIN_ACTION_STATUS.PENDING;

        const showAsApproval =
          crossChainAction.useWeb3Provider && isERC20ApprovalTransactionData(transaction.data as string) && index === 0; // show first tx approval only, bridge tx that are index > 0 can include approval method too

        let switchNetworkName;
        if (isNetworkSwitchRequired) {
          const network = supportedChains.find((supportedChain) => supportedChain.chainId === crossChainAction.chainId);
          switchNetworkName = network?.title ?? CHAIN_ID_TO_NETWORK_NAME[crossChainAction.chainId].toUpperCase();
        }

        const actionStatusToTitle: { [transactionStatus: string]: string } = {
          [CROSS_CHAIN_ACTION_STATUS.SWITCH_NETWORK]: `Switch Network to ${switchNetworkName}`,
          [CROSS_CHAIN_ACTION_STATUS.UNSENT]: crossChainAction.useWeb3Provider ? 'Submit transaction' : 'Sign message',
          [CROSS_CHAIN_ACTION_STATUS.PENDING]: 'Waiting for transaction',
          [CROSS_CHAIN_ACTION_STATUS.RECEIVING]: 'Waiting for funds from Bridge',
          [CROSS_CHAIN_ACTION_STATUS.ESTIMATING]: 'Estimating second transaction',
          [CROSS_CHAIN_ACTION_STATUS.FAILED]: 'Transaction failed',
          [CROSS_CHAIN_ACTION_STATUS.REJECTED_BY_USER]: 'Rejected by user',
          [CROSS_CHAIN_ACTION_STATUS.CONFIRMED]: showAsApproval ? 'Transaction approved' : 'Transaction completed',
        };

        const actionStatusToIconBackgroundColor: {
          [transactionStatus: string]: string | undefined;
        } = {
          [CROSS_CHAIN_ACTION_STATUS.SWITCH_NETWORK]: theme?.color?.background?.statusIconPending,
          [CROSS_CHAIN_ACTION_STATUS.UNSENT]: theme?.color?.background?.statusIconPending,
          [CROSS_CHAIN_ACTION_STATUS.PENDING]: theme?.color?.background?.statusIconPending,
          [CROSS_CHAIN_ACTION_STATUS.FAILED]: theme?.color?.background?.statusIconFailed,
          [CROSS_CHAIN_ACTION_STATUS.RECEIVING]: theme?.color?.background?.statusIconPending,
          [CROSS_CHAIN_ACTION_STATUS.ESTIMATING]: theme?.color?.background?.statusIconPending,
          [CROSS_CHAIN_ACTION_STATUS.REJECTED_BY_USER]: theme?.color?.background?.statusIconFailed,
          [CROSS_CHAIN_ACTION_STATUS.CONFIRMED]: theme?.color?.background?.statusIconSuccess,
        };

        const actionStatusIconBackgroundColor = actionStatusToIconBackgroundColor[transactionStatus];
        const actionStatusTitle = actionStatusToTitle[transactionStatus];

        if (!actionStatusTitle) return null;

        const getStatusComponent = useMemo(() => {
          switch (transactionStatus) {
            case CROSS_CHAIN_ACTION_STATUS.CONFIRMED:
              return <BiCheck size={16} />;
            case CROSS_CHAIN_ACTION_STATUS.PENDING:
              return <BsClockHistory size={14} />;
            case CROSS_CHAIN_ACTION_STATUS.RECEIVING:
              return <BsClockHistory size={14} />;
            case CROSS_CHAIN_ACTION_STATUS.ESTIMATING:
              return <BsClockHistory size={14} />;
            case CROSS_CHAIN_ACTION_STATUS.UNSENT:
              return <BsClockHistory size={14} />;
            case CROSS_CHAIN_ACTION_STATUS.FAILED:
              return <IoClose size={15} />;
            case CROSS_CHAIN_ACTION_STATUS.REJECTED_BY_USER:
              return <IoClose size={15} />;
            case CROSS_CHAIN_ACTION_STATUS.SWITCH_NETWORK:
              return <BsClockHistory size={14} />;
            default:
              return null;
          }
        }, [transactionStatus]);

        useEffect(() => {
          let timeout: any;
          if (
            transactionStatus !== CROSS_CHAIN_ACTION_STATUS.UNSENT &&
            transactionStatus === CROSS_CHAIN_ACTION_STATUS.PENDING &&
            !prevStatus[index]
          ) {
            setPrevStatus((current) => ({ ...current, [index]: transactionStatus }));
            timeout = setTimeout(() => {
              setPrevStatus((current) => ({ ...current, [index]: undefined }));
            }, 2000);
          } else {
            setPrevStatus((current) => ({ ...current, [index]: undefined }));
          }
          if (
            (transactionStatus === CROSS_CHAIN_ACTION_STATUS.CONFIRMED ||
              transactionStatus === CROSS_CHAIN_ACTION_STATUS.FAILED ||
              transactionStatus === CROSS_CHAIN_ACTION_STATUS.REJECTED_BY_USER) &&
            setIsTransactionDone
          ) {
            setIsTransactionDone(true);
          }
          if (transactionStatus === CROSS_CHAIN_ACTION_STATUS.CONFIRMED) {
            setIsTokenApproved(true);
          }
          if (timeout) {
            //@ts-ignore
            return () => clearTimeout(timeout);
          }
        }, [transactionStatus]);

        if (hasApprovalTransaction && !showAsApproval && !isTokenApproved) {
          return null;
        }

        return (
          <TransactionStatusAction
            key={`tx-status-${transaction.transactionHash || crossChainAction.batchHash || 'no-hash'}-${index}`}
          >
            {prevStatus[index] ? (
              <TransactionStatusWrapper border>
                <TransactionStatusMessageWrapper>
                  <StatusIconWrapper color={theme?.color?.background?.statusIconSuccess}>
                    <BiCheck size={16} />
                  </StatusIconWrapper>
                  <Text size={16} medium>
                    {crossChainAction.useWeb3Provider ? 'Submit transaction' : 'Sign message'}
                  </Text>
                </TransactionStatusMessageWrapper>
              </TransactionStatusWrapper>
            ) : (
              <>
                {transaction?.submitTimestamp &&
                  (transactionStatus === CROSS_CHAIN_ACTION_STATUS.PENDING ||
                    transactionStatus === CROSS_CHAIN_ACTION_STATUS.RECEIVING) && (
                    <TransactionStatusClock>
                      {!!transaction.finishTimestamp &&
                        moment(moment(transaction.finishTimestamp).diff(moment(transaction.submitTimestamp))).format(
                          'mm:ss'
                        )}
                      {!transaction.finishTimestamp &&
                        moment(moment().diff(moment(transaction.submitTimestamp))).format('mm:ss')}
                    </TransactionStatusClock>
                  )}
                <TransactionStatusWrapper border>
                  <TransactionStatusMessageWrapper>
                    {!!actionStatusIconBackgroundColor && (
                      <StatusIconWrapper color={actionStatusIconBackgroundColor}>
                        {getStatusComponent}
                      </StatusIconWrapper>
                    )}
                    <Text size={16} medium>
                      {showAsApproval ? `Approve: ${actionStatusTitle.toLowerCase()}` : actionStatusTitle}
                    </Text>
                  </TransactionStatusMessageWrapper>
                  {transaction?.submitTimestamp && (
                    <ClickableText
                      disabled={isGettingExplorerLink}
                      onClick={() => {
                        if (crossChainAction.useWeb3Provider) {
                          previewTransaction(transaction.transactionHash, showAsApproval);
                          return;
                        }
                        previewBatchTransaction(showAsApproval);
                      }}
                    >
                      <Text size={16} color={theme?.color?.text?.transactionStatusLink} medium>
                        Tx
                      </Text>
                    </ClickableText>
                  )}
                </TransactionStatusWrapper>
              </>
            )}
          </TransactionStatusAction>
        );
      })}
    </>
  );
};

const ActionPreview = ({
  crossChainAction,
  onRemove,
  onSign,
  onEdit,
  signButtonDisabled = false,
  editButtonDisabled = false,
  showSignButton = false,
  showEditButton = false,
  isSubmitted = false,
  setIsTransactionDone,
  showStatus = true,
  showGasAssetSelect = false,
  hideActionPreviewHeader = false,
}: TransactionPreviewInterface) => {
  const [timer, setTimer] = useState(0);
  const { accountAddress, providerAddress, web3Provider } = useEtherspot();
  const theme: Theme = useTheme();

  const { preview, chainId, type, estimated, isEstimating } = crossChainAction;

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isSubmitted) {
      setInterval(() => {
        setTimer(timer + 1);
      }, 1000);
    }
    if (interval) {
      clearInterval(interval);
    }
  }, [isSubmitted, timer]);

  const onEditButtonClick = () => {
    if (editButtonDisabled || !onEdit) return;
    onEdit();
  };

  const onSignButtonClick = () => {
    if (signButtonDisabled || !onSign) return;
    onSign();
  };

  const showCloseButton = !!onRemove;

  const cost = useMemo(() => {
    if (isEstimating) return 'Estimating...';
    if (!estimated || !estimated?.gasCost) {
      if (
        crossChainAction.type === TRANSACTION_BLOCK_TYPE.KLIMA_STAKE &&
        crossChainAction.useWeb3Provider &&
        crossChainAction.gasCost
      ) {
        return formatAmountDisplay(crossChainAction.gasCost, '$');
      }
      return estimated?.errorMessage;
    }
    const gasCostNumericString =
      estimated.feeAmount && crossChainAction.gasTokenDecimals
        ? ethers.utils.formatUnits(estimated.feeAmount, crossChainAction.gasTokenDecimals)
        : ethers.utils.formatUnits(estimated.gasCost, nativeAssetPerChainId[chainId].decimals);

    const gasAssetSymbol =
      estimated.feeAmount && crossChainAction.gasTokenSymbol
        ? crossChainAction.gasTokenSymbol
        : nativeAssetPerChainId[chainId].symbol;

    const gasCostFormatted = `${formatAmountDisplay(gasCostNumericString)} ${gasAssetSymbol}`;
    if (!estimated.usdPrice) return gasCostFormatted;

    return formatAmountDisplay(`${+gasCostNumericString * +estimated.usdPrice}`, '$');
  }, [isEstimating, estimated]);

  const additionalTopButtons = [
    !hideActionPreviewHeader && showSignButton && (
      <SignButton
        color={theme?.color?.background?.closeButton}
        disabled={signButtonDisabled}
        onClick={onSignButtonClick}
      />
    ),
    !hideActionPreviewHeader && showEditButton && (
      <EditButton
        color={theme?.color?.background?.closeButton}
        disabled={editButtonDisabled}
        onClick={onEditButtonClick}
      />
    ),
  ];

  if (type === TRANSACTION_BLOCK_TYPE.KLIMA_STAKE) {
    const { fromAsset, fromChainId, toAsset, providerName, providerIconUrl, receiverAddress } = preview;

    const fromNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === fromChainId);

    const toNetwork = supportedChains[1];

    const toChainTitle = toNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[CHAIN_ID.POLYGON].toUpperCase();

    const fromChainTitle = fromNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[fromChainId].toUpperCase();

    const fromAmount = formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));
    const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));

    const senderAddress = crossChainAction.useWeb3Provider ? providerAddress : accountAddress;
    const targetAssetPriceUsd = useAssetPriceUsd(klimaAsset.chainId, klimaAsset.address);
    const fromAssetPriceUsd = useAssetPriceUsd(fromChainId, fromAsset.address);

    return (
      <Card
        title="Klima DAO Staking"
        onCloseButtonClick={onRemove}
        showCloseButton={showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        <DoubleTransactionActionsInSingleRow>
          <TransactionAction>
            <Label>You send {fromAssetPriceUsd && formatAmountDisplay(+fromAmount * fromAssetPriceUsd, '$')}</Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={fromAsset.symbol}
                url={fromAsset.iconUrl}
                smallImageTitle={fromChainTitle}
                smallImageUrl={fromNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={1} medium block>
                  {fromAmount} {fromAsset.symbol}
                </Text>
                <Text size={12}>On {fromChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
          <TransactionAction>
            <Label>
              You receive {targetAssetPriceUsd && formatAmountDisplay(+toAmount * targetAssetPriceUsd, '$')}
            </Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={toAsset.symbol}
                url={toAsset.iconUrl}
                smallImageTitle={toChainTitle}
                smallImageUrl={toNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={3} medium block>
                  {toAmount} {toAsset.symbol}
                </Text>
                <Text size={12}>On {toChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
        </DoubleTransactionActionsInSingleRow>
        {!!senderAddress && !!receiverAddress && (
          <TransactionAction>
            <Text size={16} medium>
              <>
                From &nbsp;
                <ClickableText onClick={() => copyToClipboard(senderAddress)}>
                  {getTypeOfAddress(senderAddress, accountAddress, providerAddress)}
                </ClickableText>
                &nbsp;
              </>
              to &nbsp;
              <ClickableText onClick={() => copyToClipboard(receiverAddress)}>
                {getTypeOfAddress(receiverAddress, accountAddress, providerAddress)}
              </ClickableText>
            </Text>
          </TransactionAction>
        )}
        <TransactionAction>
          <Label>Route</Label>
          <ValueWrapper>
            <RoundedImage title={providerName ?? 'Unknown'} url={providerIconUrl} size={24} marginTop={-5} />
            <ValueBlock>
              <ValueText>
                <span>
                  {toAmount} {toAsset.symbol}
                </span>
                <Text color={theme.color?.text?.innerLabel} marginLeft={6} medium block>
                  via {providerName}
                </Text>
              </ValueText>
              <ValueText>
                <span>{targetAssetPriceUsd && formatAmountDisplay(+toAmount * targetAssetPriceUsd, '$')}</span>
                {!!cost && (
                  <>
                    <Text size={12} marginLeft={8} color={theme.color?.text?.innerLabel} medium block>
                      Gas price
                    </Text>
                    <Text marginLeft={4} medium>
                      {cost}
                    </Text>
                  </>
                )}
              </ValueText>
            </ValueBlock>
          </ValueWrapper>
        </TransactionAction>
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        <TransactionStatus
          crossChainAction={crossChainAction}
          setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
        />
        {crossChainAction.transactions[crossChainAction.transactions.length - 1].status ===
          CROSS_CHAIN_ACTION_STATUS.CONFIRMED && (
          <TransactionStatus
            crossChainAction={crossChainAction.destinationCrossChainAction[0]}
            setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
          />
        )}
      </Card>
    );
  }

  if (type === TRANSACTION_BLOCK_TYPE.ASSET_BRIDGE) {
    const { fromAsset, toAsset, fromChainId, toChainId, receiverAddress, route }: AssetBridgeActionPreview = preview;
    const fromNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === fromChainId);
    const toNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === toChainId);

    const fromChainTitle = fromNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[fromChainId].toUpperCase();
    const toChainTitle = toNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[toChainId].toUpperCase();

    const fromAmount = formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));
    const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));

    const senderAddress = crossChainAction.useWeb3Provider ? providerAddress : accountAddress;

    let gasCost = route?.gasCostUSD;
    let [firstSteps] = route.steps;
    const {
      estimate: { feeCosts },
    } = firstSteps;
    let totalFees = 0;
    feeCosts?.forEach(({ amountUSD = 0 }) => {
      totalFees += +amountUSD;
    });
  
    return (
      <Card
        title="Asset bridge"
        onCloseButtonClick={onRemove}
        showCloseButton={showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        <DoubleTransactionActionsInSingleRow>
          <TransactionAction>
            <Label>You send</Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={fromAsset.symbol}
                url={fromAsset.iconUrl}
                smallImageTitle={fromChainTitle}
                smallImageUrl={fromNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={1} medium block>
                  {fromAmount} {fromAsset.symbol}
                </Text>
                <Text size={12}>On {fromChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
          <TransactionAction>
            <Label>You receive</Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={toAsset.symbol}
                url={toAsset.iconUrl}
                smallImageTitle={toChainTitle}
                smallImageUrl={toNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={3} medium block>
                  {toAmount} {toAsset.symbol}
                </Text>
                <Text size={12}>On {toChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
        </DoubleTransactionActionsInSingleRow>
        {!!senderAddress && !!receiverAddress && (
          <TransactionAction>
            <Text size={16} medium>
              <>
                From &nbsp;
                <ClickableText onClick={() => copyToClipboard(senderAddress)}>
                  {getTypeOfAddress(senderAddress, accountAddress, providerAddress)}
                </ClickableText>
                &nbsp;
              </>
              to &nbsp;
              <ClickableText onClick={() => copyToClipboard(receiverAddress)}>
                {getTypeOfAddress(receiverAddress, accountAddress, providerAddress)}
              </ClickableText>
            </Text>
          </TransactionAction>
        )}
        {!!route && (
          <TransactionAction>
            <Label>Route</Label>
            <RouteOption
              route={route}
              cost={gasCost ? formatAmountDisplay(gasCost, '$', 2) : cost}
              fees={formatAmountDisplay(totalFees, '$', 2)}
              showActions
            />
          </TransactionAction>
        )}
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        {showStatus && (
          <TransactionStatus
            crossChainAction={crossChainAction}
            setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
            web3ProviderChainId={web3Provider?.web3?.networkVersion && Number(web3Provider?.web3?.networkVersion)}
          />
        )}
      </Card>
    );
  }

  const previewSend = (preview: SendAssetActionPreview | null, network: Chain | undefined, chainTitle: string) => {
    if (!preview) return null;

    const { asset, fromAddress } = preview;
    const amount = formatAmountDisplay(ethers.utils.formatUnits(asset.amount, asset.decimals));
    const receiverAddress = preview.receiverAddress as string;

    return (
      <>
        <TransactionAction>
          <Label>You send</Label>
          <ValueWrapper>
            <CombinedRoundedImages
              title={asset.symbol}
              url={asset.iconUrl}
              smallImageTitle={chainTitle}
              smallImageUrl={network?.iconUrl}
            />
            <ValueBlock>
              <Text size={16} marginBottom={1} medium block>
                {amount} {asset.symbol}
              </Text>
              <Text size={12}>On {chainTitle}</Text>
            </ValueBlock>
            <ValueBlock>
              <Text size={12} marginBottom={2} color={theme.color?.text?.innerLabel} medium block>
                Gas price
              </Text>
              <Text size={16} medium>
                {cost ?? 'N/A'}
              </Text>
            </ValueBlock>
          </ValueWrapper>
          <ValueWrapper marginTop={8}>
            <Text size={16} medium>
              {!!fromAddress && (
                <>
                  From &nbsp;
                  <ClickableText onClick={() => copyToClipboard(fromAddress)}>
                    {getTypeOfAddress(fromAddress, accountAddress, providerAddress)}
                  </ClickableText>
                  &nbsp;
                </>
              )}
              {fromAddress ? 'to' : 'To'}
              &nbsp;
              <ClickableText onClick={() => copyToClipboard(receiverAddress)}>
                {getTypeOfAddress(receiverAddress, accountAddress, providerAddress)}
              </ClickableText>
            </Text>
          </ValueWrapper>
        </TransactionAction>
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
      </>
    );
  };

  const previewSwap = (preview: AssetSwapActionPreview | null, network: Chain | undefined, chainTitle: string) => {
    if (!preview) return null;

    const { fromAsset, toAsset } = preview;
    const fromAmount = formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));
    const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));

    return (
      <DoubleTransactionActionsInSingleRow>
        <TransactionAction>
          <Label>You send</Label>
          <ValueWrapper>
            <CombinedRoundedImages
              title={fromAsset.symbol}
              url={fromAsset.iconUrl}
              smallImageTitle={chainTitle}
              smallImageUrl={network?.iconUrl}
            />
            <div>
              <Text size={16} marginBottom={1} medium block>
                {fromAmount} {fromAsset.symbol}
              </Text>
              <Text size={12}>On {chainTitle}</Text>
            </div>
          </ValueWrapper>
        </TransactionAction>
        <TransactionAction>
          <Label>You receive</Label>
          <ValueWrapper>
            <CombinedRoundedImages
              title={toAsset.symbol}
              url={toAsset.iconUrl}
              smallImageTitle={chainTitle}
              smallImageUrl={network?.iconUrl}
            />
            <div>
              <Text size={16} marginBottom={3} medium block>
                {toAmount} {toAsset.symbol}
              </Text>
              <Text size={12}>On {chainTitle}</Text>
            </div>
          </ValueWrapper>
        </TransactionAction>
      </DoubleTransactionActionsInSingleRow>
    );
  };

  if (type === TRANSACTION_BLOCK_TYPE.PLR_DAO_STAKE) {
    const {
      isUnStake,
      hasEnoughPLR,
      fromAsset,
      fromChainId,
      toAsset,
      receiverAddress,
      enableAssetSwap,
      enableAssetBridge,
      route,
    } = preview;

    const previewList = crossChainAction?.batchTransactions?.length
      ? crossChainAction?.batchTransactions.map((action) =>
          action.type === TRANSACTION_BLOCK_TYPE.PLR_DAO_STAKE ? action.preview : null
        )
      : [crossChainAction.preview];

    const enablePlrStaking = !enableAssetSwap && !enableAssetBridge;

    const fromNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === fromChainId);

    const toNetwork = supportedChains[1];

    const toChainTitle = toNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[CHAIN_ID.POLYGON].toUpperCase();

    const fromChainTitle = fromNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[fromChainId].toUpperCase();

    const fromAmount = isUnStake
      ? fromAsset.amount
      : formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));

    const toAmount = enablePlrStaking ? toAsset.amount : formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount));

    const senderAddress = crossChainAction.useWeb3Provider ? providerAddress : accountAddress;

    let gasCost;
    let totalFees = 0;
    if (!!route && enableAssetBridge) {
      gasCost = route?.gasCostUSD;
      const [firstSteps] = route.steps;
      const {
        estimate: { feeCosts },
      } = firstSteps;
      totalFees = 0;
      feeCosts?.forEach(({ amountUSD = 0 }) => {
        totalFees += +amountUSD;
      });
    }

    return (
      <Card
        title={hasEnoughPLR || isUnStake ? 'Pillar DAO NFT Membership' : 'Swap more assets to PLR on Polygon'}
        onCloseButtonClick={onRemove}
        showCloseButton={!isUnStake && showCloseButton}
        additionalTopButtons={!isUnStake ? additionalTopButtons : []}
      >
        {enablePlrStaking ? (
          <>
            <DoubleTransactionActionsInSingleRow>
              <TransactionAction>
                <ColoredText>You send</ColoredText>
                <ValueWrapper>
                  <CombinedRoundedImages
                    title={fromAsset.symbol}
                    url={fromAsset.iconUrl}
                    smallImageTitle={fromChainTitle}
                    smallImageUrl={fromNetwork?.iconUrl}
                  />
                  <div>
                    <Text size={16} marginBottom={1} medium block>
                      {fromAmount} {fromAsset.symbol}
                    </Text>
                    <Text size={12}>On {fromChainTitle}</Text>
                  </div>
                </ValueWrapper>
              </TransactionAction>
              <TransactionAction>
                <ColoredText>You receive</ColoredText>
                <ValueWrapper>
                  <CombinedRoundedImages
                    title={toAsset.symbol}
                    url={toAsset.iconUrl}
                    smallImageTitle={toChainTitle}
                    smallImageUrl={toNetwork?.iconUrl}
                  />
                  <div>
                    <Text size={16} marginBottom={3} medium block>
                      {toAmount} {toAsset.symbol}
                    </Text>
                    <Text size={12}>On {toChainTitle}</Text>
                  </div>
                </ValueWrapper>
              </TransactionAction>
            </DoubleTransactionActionsInSingleRow>
            {!!senderAddress && !!receiverAddress && (
              <TransactionAction>
                <Text size={16} medium>
                  <>
                    From &nbsp;
                    <ClickableText onClick={() => copyToClipboard(senderAddress)}>
                      {humanizeHexString(senderAddress)}
                    </ClickableText>
                    &nbsp;
                  </>
                  to &nbsp;
                  <ClickableText onClick={() => copyToClipboard(receiverAddress)}>
                    {humanizeHexString(receiverAddress)}
                  </ClickableText>
                </Text>
              </TransactionAction>
            )}
          </>
        ) : (
          <>
            {previewList.map((preview) => {
              if (!preview) return null;
              if ('toAsset' in preview) {
                return (
                  <DoubleTransactionActionsInSingleRow>
                    <TransactionAction>
                      <ColoredText>You send</ColoredText>
                      <ValueWrapper>
                        <CombinedRoundedImages
                          title={fromAsset.symbol}
                          url={fromAsset.iconUrl}
                          smallImageTitle={fromChainTitle}
                          smallImageUrl={fromNetwork?.iconUrl}
                        />
                        <div>
                          <Text size={16} marginBottom={1} medium block>
                            {fromAmount} {fromAsset.symbol}
                          </Text>
                          <Text size={12}>On {fromChainTitle}</Text>
                        </div>
                      </ValueWrapper>
                    </TransactionAction>
                    <TransactionAction>
                      <ColoredText>You receive</ColoredText>
                      <ValueWrapper>
                        <CombinedRoundedImages
                          title={toAsset.symbol}
                          url={toAsset.iconUrl}
                          smallImageTitle={toChainTitle}
                          smallImageUrl={toNetwork?.iconUrl}
                        />
                        <div>
                          <Text size={16} marginBottom={3} medium block>
                            {toAmount} {toAsset.symbol}
                          </Text>
                          <Text size={12}>On {toChainTitle}</Text>
                        </div>
                      </ValueWrapper>
                    </TransactionAction>
                  </DoubleTransactionActionsInSingleRow>
                );
              }
            })}
          </>
        )}
        {(enableAssetSwap || enableAssetBridge) && (
          <TransactionAction>
            <Label>Route</Label>
            {!!route && enableAssetBridge && (
              <RouteOption
                route={route}
                cost={formatAmountDisplay(gasCost || 0, '$', 2)}
                fees={formatAmountDisplay(totalFees, '$', 2)}
                showActions
              />
            )}
            {enableAssetSwap && (
              <RouteWrapper>
                {previewList.map((preview) => {
                  if (!preview) return null;
                  if (!('toAsset' in preview)) return null;
                  const { fromAsset, toAsset, providerName, providerIconUrl } = preview;

                  const fromAmount = formatAmountDisplay(
                    ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals)
                  );
                  const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));
                  return (
                    <Row>
                      <RoundedImage
                        style={{ marginTop: 2 }}
                        title={providerName ?? 'Unknown'}
                        url={providerIconUrl}
                        size={10}
                      />
                      <ValueBlock>
                        <Text size={12} marginBottom={2} regular block>
                          {`Swap on ${fromChainTitle} via ${providerName}`}
                        </Text>
                        <Text size={12} regular block>
                          {`${fromAmount} ${fromAsset.symbol} → ${toAmount} ${toAsset.symbol}`}
                        </Text>
                      </ValueBlock>
                    </Row>
                  );
                })}
              </RouteWrapper>
            )}
          </TransactionAction>
        )}
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        <TransactionStatus
          crossChainAction={crossChainAction}
          setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
          web3ProviderChainId={web3Provider?.web3?.networkVersion && Number(web3Provider?.web3?.networkVersion)}
        />
      </Card>
    );
  }

  if (type === TRANSACTION_BLOCK_TYPE.SEND_ASSET) {
    const previewList = crossChainAction?.batchTransactions?.length
      ? crossChainAction?.batchTransactions.map((action) =>
          action.type === TRANSACTION_BLOCK_TYPE.SEND_ASSET ? action.preview : null
        )
      : [crossChainAction.preview];

    const network = supportedChains.find((supportedChain) => supportedChain.chainId === chainId);
    const chainTitle = network?.title ?? CHAIN_ID_TO_NETWORK_NAME[chainId].toUpperCase();

    return (
      <Card
        title="Send asset"
        onCloseButtonClick={onRemove}
        showCloseButton={showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        {previewList.map((preview) => previewSend(preview, network, chainTitle))}

        {previewList.length > 1 && (
          <TransactionAction>
            <Text size={16} medium>
              {`${previewList.length} calls are batched in one transaction`}
            </Text>
          </TransactionAction>
        )}

        {showStatus && (
          <TransactionStatus
            crossChainAction={crossChainAction}
            setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
          />
        )}
      </Card>
    );
  }

  if (type === TRANSACTION_BLOCK_TYPE.ASSET_SWAP) {
    const previewList = crossChainAction?.batchTransactions?.length
      ? crossChainAction?.batchTransactions.map((action) =>
          action.type === TRANSACTION_BLOCK_TYPE.ASSET_SWAP ||
          (!!action.multiCallData && action.type === TRANSACTION_BLOCK_TYPE.SEND_ASSET)
            ? action.preview
            : null
        )
      : [crossChainAction.preview];

    const network = supportedChains.find((supportedChain) => supportedChain.chainId === chainId);
    const chainTitle = network?.title ?? CHAIN_ID_TO_NETWORK_NAME[chainId].toUpperCase();

    return (
      <Card
        title="Swap asset"
        onCloseButtonClick={onRemove}
        showCloseButton={showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        {previewList.map((preview) => {
          if (!preview) return null;
          if ('toAsset' in preview) {
            return previewSwap(preview as AssetSwapActionPreview, network, chainTitle);
          }
          if ('asset' in preview) {
            return previewSend(preview as SendAssetActionPreview, network, chainTitle);
          }
        })}

        {previewList.length > 1 && (
          <TransactionAction>
            <Text size={16} medium>
              {`${previewList.length} calls are batched in one transaction`}
            </Text>
          </TransactionAction>
        )}

        <TransactionAction>
          <Label>Route</Label>
          {!!cost && (
            <Row center>
              <Text size={12} marginBottom={2} color={theme.color?.text?.innerLabel} medium block>
                Gas price
              </Text>
              <Text size={14} marginLeft={4} medium>
                {cost}
              </Text>
            </Row>
          )}

          <RouteWrapper>
            {previewList.map((preview) => {
              if (!preview) return null;
              if (!('toAsset' in preview)) return null;
              const { fromAsset, toAsset, providerName, providerIconUrl } = preview;

              const fromAmount = formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));
              const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));
              return (
                <Row>
                  <RoundedImage style={{ marginTop: 2 }} title={providerName} url={providerIconUrl} size={10} />
                  <ValueBlock>
                    <Text size={12} marginBottom={2} regular block>
                      {`Swap on ${chainTitle} via ${providerName}`}
                    </Text>
                    <Text size={12} regular block>
                      {`${fromAmount} ${fromAsset.symbol} → ${toAmount} ${toAsset.symbol}`}
                    </Text>
                  </ValueBlock>
                </Row>
              );
            })}
          </RouteWrapper>
        </TransactionAction>
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        {showStatus && (
          <TransactionStatus
            crossChainAction={crossChainAction}
            setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
            web3ProviderChainId={web3Provider?.web3?.networkVersion && Number(web3Provider?.web3?.networkVersion)}
          />
        )}
      </Card>
    );
  }

  if (type === TRANSACTION_BLOCK_TYPE.PLR_STAKING_V2) {
    const { fromAsset, toAsset, fromChainId, toChainId, receiverAddress, swap } = preview;

    const fromNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === fromChainId);
    const toNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === toChainId);

    const fromChainTitle = fromNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[fromChainId].toUpperCase();
    const toChainTitle = toNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[toChainId].toUpperCase();

    const fromAmount = formatAmountDisplay(ethers.utils.formatUnits(fromAsset.amount, fromAsset.decimals));
    const toAmount = formatAmountDisplay(ethers.utils.formatUnits(toAsset.amount, toAsset.decimals));

    const senderAddress = crossChainAction.useWeb3Provider ? providerAddress : accountAddress;

    const cardTitle = swap ? 'Asset swap' : 'PLR stake';

    let gasCost;
    let totalFees = 0;
    if (swap?.type === 'CROSS_CHAIN_SWAP' && swap?.route) {
      gasCost = swap?.route?.gasCostUSD;
      const [firstSteps] = swap?.route.steps;
      const {
        estimate: { feeCosts },
      } = firstSteps;
      totalFees = 0;
      feeCosts?.forEach(({ amountUSD = 0 }) => {
        totalFees += +amountUSD;
      });
    }
    
    return (
      <Card
        title={cardTitle}
        onCloseButtonClick={onRemove}
        showCloseButton={showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        <DoubleTransactionActionsInSingleRow>
          <TransactionAction>
            <Label>You send</Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={fromAsset.symbol}
                url={fromAsset.iconUrl}
                smallImageTitle={fromChainTitle}
                smallImageUrl={fromNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={1} medium block>
                  {fromAmount} {fromAsset.symbol}
                </Text>
                <Text size={12}>On {fromChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
          <TransactionAction>
            <Label>You receive</Label>
            <ValueWrapper>
              <CombinedRoundedImages
                title={toAsset.symbol}
                url={toAsset.iconUrl}
                smallImageTitle={toChainTitle}
                smallImageUrl={toNetwork?.iconUrl}
              />
              <div>
                <Text size={16} marginBottom={3} medium block>
                  {toAmount} {toAsset.symbol}
                </Text>
                <Text size={12}>On {toChainTitle}</Text>
              </div>
            </ValueWrapper>
          </TransactionAction>
        </DoubleTransactionActionsInSingleRow>
        {!!senderAddress && !!receiverAddress && (
          <TransactionAction>
            <Text size={16} medium>
              <>
                From &nbsp;
                <ClickableText onClick={() => copyToClipboard(senderAddress)}>
                  {humanizeHexString(senderAddress)}
                </ClickableText>
                &nbsp;
              </>
              to &nbsp;
              <ClickableText onClick={() => copyToClipboard(receiverAddress)}>
                {humanizeHexString(receiverAddress)}
              </ClickableText>
            </Text>
          </TransactionAction>
        )}
        {swap?.type === 'CROSS_CHAIN_SWAP' && swap?.route && (
          <TransactionAction>
            <Label>Route</Label>
            <RouteOption
              route={swap.route}
              cost={gasCost ? formatAmountDisplay(gasCost, '$', 2) : cost}
              fees={formatAmountDisplay(totalFees, '$', 2)}
              showActions
            />
          </TransactionAction>
        )}
        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        {showStatus && (
          <TransactionStatus crossChainAction={crossChainAction} setIsTransactionDone={setIsTransactionDone} />
        )}
      </Card>
    );
  }

  if (type === TRANSACTION_BLOCK_TYPE.HONEY_SWAP_LP) {
    const {
      fromAsset,
      fromChainId,
      route,
      token1,
      token2,
      offer1,
      offer2,
      tokenOneAmount,
      tokenTwoAmount,
    } = preview;

    const fromNetwork = supportedChains.find((supportedChain) => supportedChain.chainId === fromChainId);

    const toNetwork = supportedChains[1];

    const fromChainTitle = fromNetwork?.title ?? CHAIN_ID_TO_NETWORK_NAME[fromChainId].toUpperCase();

    const senderAddress = crossChainAction.useWeb3Provider ? providerAddress : accountAddress;

    let gasCost;
    let totalFees = 0;
    if (!!route) {
      gasCost = route?.gasCostUSD;
      const [firstSteps] = route.steps;
      const {
        estimate: { feeCosts },
      } = firstSteps;
      totalFees = 0;
      feeCosts?.forEach(({ amountUSD = 0 }) => {
        totalFees += +amountUSD;
      });
    }

    return (
      <Card
        title={!hideActionPreviewHeader ? "Honeyswap Liquidity Pool" : undefined}
        onCloseButtonClick={!hideActionPreviewHeader ? onRemove : () => {}}
        showCloseButton={!hideActionPreviewHeader && showCloseButton}
        additionalTopButtons={additionalTopButtons}
      >
        <TransactionAction border>
          <Label>You send</Label>
          <ValueWrapper>
            <CombinedRoundedImages
              title={fromAsset.symbol}
              url={fromAsset.iconUrl}
              smallImageTitle={fromChainTitle}
              smallImageUrl={fromNetwork?.iconUrl}
            />
            <div>
              <Text size={16} marginBottom={1} medium block>
                {fromAsset.amount} {fromAsset.symbol}
              </Text>
              <Text size={12}>On {fromChainTitle}</Text>
            </div>
          </ValueWrapper>
        </TransactionAction>
        {!!route && (
          <TransactionAction border>
            <Label>Route</Label>
            <HoneySwapRoute
              route={route}
              cost={formatAmountDisplay(gasCost || 0, '$', 2)}
              fees={formatAmountDisplay(totalFees, '$', 2)}
              token1={token1}
              token2={token2}
              offer1={offer1}
              offer2={offer2}
              tokenAmount={token1.address === GNOSIS_USDC_CONTRACT_ADDRESS ? tokenOneAmount : tokenTwoAmount}
            />
          </TransactionAction>
        )}

        {showGasAssetSelect && <GasTokenSelect crossChainAction={crossChainAction} />}
        <TransactionStatus
          crossChainAction={crossChainAction}
          setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
        />
        {crossChainAction.transactions[crossChainAction.transactions.length - 1].status === CROSS_CHAIN_ACTION_STATUS.CONFIRMED
          && !!crossChainAction.destinationCrossChainAction.length
          && (
          <TransactionStatus
            crossChainAction={crossChainAction.destinationCrossChainAction[0]}
            setIsTransactionDone={setIsTransactionDone ? setIsTransactionDone : (value: boolean) => {}}
          />
        )}
      </Card>
    );
  }

  return null;
};

export default ActionPreview;
