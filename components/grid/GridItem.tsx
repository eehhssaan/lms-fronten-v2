import React from "react";
import { Box } from "rebass";

interface GridItemProps {
  children: React.ReactNode;
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
  style?: React.CSSProperties;
  showBounds?: boolean;
}

const GridItem: React.FC<GridItemProps> = ({
  children,
  columnStart,
  columnEnd,
  rowStart,
  rowEnd,
  style,
  showBounds = true,
}) => {
  return (
    <Box
      sx={{
        gridColumnStart: columnStart,
        gridColumnEnd: columnEnd,
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
        ...(showBounds && {
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "2px dashed rgba(255, 0, 0, 0.3)",
            backgroundColor: "rgba(255, 0, 0, 0.05)",
            pointerEvents: "none",
            zIndex: 0,
          },
          "&::after": {
            content: `"${columnStart},${rowStart} → ${columnEnd},${rowEnd}"`,
            position: "absolute",
            top: "2px",
            left: "2px",
            fontSize: "10px",
            color: "rgba(255, 0, 0, 0.5)",
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
      {children}
    </Box>
  );
};

export default GridItem;
