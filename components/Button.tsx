import { ElementType } from "react";
import { Button as RebassButton } from "rebass";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  as?: ElementType;
  href?: string;
  sx?: any;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  as,
  href,
  sx = {},
  ...props
}: ButtonProps) {
  const sizeStyles = {
    small: {
      px: 2,
      py: 1,
      fontSize: 1,
    },
    medium: {
      px: 3,
      py: 2,
      fontSize: 2,
    },
    large: {
      px: 4,
      py: 3,
      fontSize: 3,
    },
  };

  const variantStyles = {
    primary: {
      bg: "#007bff",
      color: "white",
      border: "1px solid #0056b3",
      "&:hover": {
        bg: "#0056b3",
      },
      "&:disabled": {
        bg: "#cce5ff",
        borderColor: "#b8daff",
        color: "#004085",
        cursor: "not-allowed",
      },
    },
    secondary: {
      bg: "#f8f9fa",
      color: "#212529",
      border: "1px solid #dee2e6",
      "&:hover": {
        bg: "#e2e6ea",
        borderColor: "#dae0e5",
      },
      "&:disabled": {
        bg: "#e9ecef",
        color: "#6c757d",
        cursor: "not-allowed",
      },
    },
  };

  return (
    <RebassButton
      as={as}
      onClick={onClick}
      disabled={disabled}
      href={href}
      sx={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: fullWidth ? "100%" : "auto",
        cursor: "pointer",
        borderRadius: "4px",
        transition: "all 0.2s ease-in-out",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        "&:focus": {
          outline: "none",
          boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.1)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </RebassButton>
  );
}
