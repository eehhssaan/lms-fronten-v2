import React, { createContext, useContext, useState, useEffect } from "react";
import { Layout } from "@/types/presentation";
import { DEFAULT_LAYOUTS } from "@/constants/layouts";

interface LayoutsContextType {
  layouts: Record<string, Layout>;
  defaultLayoutId: string;
  loading: boolean;
  error: string | null;
}

const LayoutsContext = createContext<LayoutsContextType>({
  layouts: {},
  defaultLayoutId: "",
  loading: true,
  error: null,
});

export const useLayouts = () => useContext(LayoutsContext);

export const LayoutsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [layouts, setLayouts] =
    useState<Record<string, Layout>>(DEFAULT_LAYOUTS);
  const [defaultLayoutId, setDefaultLayoutId] =
    useState<string>("title-content");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <LayoutsContext.Provider
      value={{ layouts, defaultLayoutId, loading, error }}
    >
      {children}
    </LayoutsContext.Provider>
  );
};
