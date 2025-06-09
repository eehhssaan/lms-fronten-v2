import React, { createContext, useContext, useState, useEffect } from "react";
import { getLayouts } from "@/lib/api/presentations";
import { Layout } from "@/types/presentation";
import { toast } from "react-hot-toast";

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
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [defaultLayoutId, setDefaultLayoutId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        setLoading(true);
        const response = await getLayouts();
        if (response.success) {
          const layoutsMap = response.data.reduce(
            (acc: Record<string, Layout>, layout: Layout) => {
              acc[layout._id] = layout;
              return acc;
            },
            {}
          );
          setLayouts(layoutsMap);

          // Find and set the default layout
          const defaultLayout = response.data.find(
            (layout: Layout) => layout.isDefault
          );
          if (defaultLayout) {
            setDefaultLayoutId(defaultLayout._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch layouts:", error);
        setError("Failed to fetch layouts");
        toast.error("Failed to load layouts");
      } finally {
        setLoading(false);
      }
    };

    fetchLayouts();
  }, []);

  return (
    <LayoutsContext.Provider
      value={{ layouts, defaultLayoutId, loading, error }}
    >
      {children}
    </LayoutsContext.Provider>
  );
};
