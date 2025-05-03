import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const LoadingStateContext = createContext();
const LoadingActionsContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const actionsValue = useMemo(() => ({
    startLoading,
    stopLoading,
  }), [startLoading, stopLoading]);

  return (
    <LoadingActionsContext.Provider value={actionsValue}>
      <LoadingStateContext.Provider value={isLoading}>
        {children}
      </LoadingStateContext.Provider>
    </LoadingActionsContext.Provider>
  );
};

export const useLoadingState = () => {
  const context = useContext(LoadingStateContext);
  if (context === undefined) {
    throw new Error('useLoadingState must be used within a LoadingProvider');
  }
  return context;
};

export const useLoadingActions = () => {
  const context = useContext(LoadingActionsContext);
  if (!context) {
    throw new Error('useLoadingActions must be used within a LoadingProvider');
  }
  return context;
};