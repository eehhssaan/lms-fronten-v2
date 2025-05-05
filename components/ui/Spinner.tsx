import React from "react";
import { Box } from "rebass";

interface SpinnerProps {
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24 }) => {
  return (
    <Box
      as="span"
      sx={{
        display: "inline-block",
        width: size,
        height: size,
        border: "2px solid rgba(0, 0, 0, 0.1)",
        borderTopColor: "primary",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        "@keyframes spin": {
          to: {
            transform: "rotate(360deg)",
          },
        },
      }}
    />
  );
};
