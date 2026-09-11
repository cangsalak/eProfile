'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PageHeaderContextType {
  extraContent: ReactNode | null;
  setExtraContent: (content: ReactNode | null) => void;
  customTitle: string | null;
  setCustomTitle: (title: string | null) => void;
  customSubtitle: string | null;
  setCustomSubtitle: (subtitle: string | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType>({
  extraContent: null,
  setExtraContent: () => {},
  customTitle: null,
  setCustomTitle: () => {},
  customSubtitle: null,
  setCustomSubtitle: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [extraContent, setExtraContent] = useState<ReactNode | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customSubtitle, setCustomSubtitle] = useState<string | null>(null);

  return (
    <PageHeaderContext.Provider
      value={{
        extraContent,
        setExtraContent,
        customTitle,
        setCustomTitle,
        customSubtitle,
        setCustomSubtitle,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  return useContext(PageHeaderContext);
}

/**
 * Convenience component to mount sub-menu tabs / action buttons into the Header's right slot
 */
export function PageHeaderExtra({ children }: { children: ReactNode }) {
  const { setExtraContent } = usePageHeader();

  useEffect(() => {
    setExtraContent(children);
    return () => {
      setExtraContent(null);
    };
  }, [children, setExtraContent]);

  return null;
}
