'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface HITLContextType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
}

const HITLContext = createContext<HITLContextType>({
  pendingCount: 2,
  setPendingCount: () => {},
});

export function HITLProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(2);

  return (
    <HITLContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </HITLContext.Provider>
  );
}

export function useHITLCount() {
  return useContext(HITLContext);
}
