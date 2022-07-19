import React, { useContext } from 'react';

import { EtherspotContext } from '../contexts';
import { EtherspotContextData } from '../contexts/EtherspotContext';

const useEtherspot = () => {
  const context = useContext<EtherspotContextData>(EtherspotContext);

  if (context === null) {
    throw new Error('No parent <EtherspotContextProvider />');
  }

  return context.data;
};

export default useEtherspot;
