import React, { createContext } from 'react';

import { SelectOption } from '../components/SelectInput/SelectInput';

export interface TransactionBuilderModalContextData {
  initialized: boolean;
  data: {
    showSelectModal: (options: SelectOption[], callback: (option: SelectOption) => void) => void;
    hideSelectModal: () => void;
    showConfirmModal: (message: string, callback: () => void) => void;
    hideConfirmModal: () => void;
    showAlertModal: (message: string) => void;
    hideAlertModal: () => void;
  }
}

const TransactionBuilderModalContext = createContext<TransactionBuilderModalContextData>({
  initialized: false,
  data: {
    showSelectModal: () => {},
    hideSelectModal: () => {},
    hideConfirmModal: () => {},
    showConfirmModal: () => {},
    hideAlertModal: () => {},
    showAlertModal: () => {},
  }
});

export default TransactionBuilderModalContext;
