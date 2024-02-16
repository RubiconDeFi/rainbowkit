import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import { useConfig } from 'wagmi';
import type { Chain } from 'wagmi/chains';
import { provideRainbowKitChains } from './provideRainbowKitChains';

export interface RainbowKitChain extends Chain {
  iconUrl?: string | (() => Promise<string>) | null;
  iconBackground?: string;
}

interface RainbowKitChainContextValue {
  chains: RainbowKitChain[];
  initialChainId?: number;
}

const RainbowKitChainContext = createContext<RainbowKitChainContextValue>({
  chains: [],
});

interface RainbowKitChainProviderProps {
  initialChain?: Chain | number;
  children: ReactNode;
  chains?: readonly [Chain, ...Chain[]];
}

export function RainbowKitChainProvider({
  children,
  initialChain,
  chains,
}: RainbowKitChainProviderProps) {
  const { chains: configChains } = useConfig();
  const ids = configChains.map((c) => c.id);

  for (const chain of chains || []) {
    if (!ids.includes(chain.id))
      throw `Chain spagooty ${chain.name} (${chain.id}) is not provided in wagmi config`;
  }

  return (
    <RainbowKitChainContext.Provider
      value={useMemo(
        () => ({
          chains: provideRainbowKitChains(chains || configChains),
          initialChainId:
            typeof initialChain === 'number' ? initialChain : initialChain?.id,
        }),
        [chains, initialChain, configChains],
      )}
    >
      {children}
    </RainbowKitChainContext.Provider>
  );
}

export const useRainbowKitChains = () =>
  useContext(RainbowKitChainContext).chains;

export const useInitialChainId = () =>
  useContext(RainbowKitChainContext).initialChainId;

export const useRainbowKitChainsById = () => {
  const rainbowkitChains = useRainbowKitChains();

  return useMemo(() => {
    const rainbowkitChainsById: Record<number, RainbowKitChain> = {};

    for (const rkChain of rainbowkitChains) {
      rainbowkitChainsById[rkChain.id] = rkChain;
    }

    return rainbowkitChainsById;
  }, [rainbowkitChains]);
};
