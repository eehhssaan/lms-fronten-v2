import React from "react";
import { Box } from "rebass";

interface GridContainerProps {
  children: React.ReactNode;
  columns?: number;
  rows?: number;
  gap?: number;
  style?: React.CSSProperties;
  showGrid?: boolean;
}

const GridContainer: React.FC<GridContainerProps> = ({
  children,
  columns = 12,
  rows = 6,
  gap = 8,
  style,
  showGrid = true,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: `${gap}px`,
        width: "100%",
        height: "100%",
        position: "relative",
        ...style,
        ...(showGrid && {
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${100 / columns}% ${100 / rows}%`,
            pointerEvents: "none",
            zIndex: 1,
          },
          "& > *": {
            position: "relative",
            zIndex: 2,
          },
        }),
      }}
    >
      {showGrid &&
        Array.from({ length: columns }).map((_, i) => (
          <Box
            key={`col-${i}`}
            sx={{
              position: "absolute",
              top: "-20px",
              left: `${(i * 100) / columns}%`,
              width: `${100 / columns}%`,
              textAlign: "center",
              fontSize: "12px",
              color: "blue",
              opacity: 0.5,
            }}
          >
            {i + 1}
          </Box>
        ))}

      {showGrid &&
        Array.from({ length: rows }).map((_, i) => (
          <Box
            key={`row-${i}`}
            sx={{
              position: "absolute",
              left: "-20px",
              top: `${(i * 100) / rows}%`,
              height: `${100 / rows}%`,
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              color: "blue",
              opacity: 0.5,
            }}
          >
            {i + 1}
          </Box>
        ))}

      {children}
    </Box>
  );
};

export default GridContainer;
