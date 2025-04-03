import { Box } from 'rebass';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  size = 'medium',
  style,
  className
}: ButtonProps) {
  const sizeStyles = {
    small: { py: 1, px: 2, fontSize: 1 },
    medium: { py: 2, px: 3, fontSize: 2 },
    large: { py: 3, px: 4, fontSize: 3 }
  };

  const variantStyles = {
    primary: {
      bg: 'primary',
      color: 'white',
      '&:hover': {
        bg: 'text',
      }
    },
    secondary: {
      bg: 'accent',
      color: 'text',
      '&:hover': {
        bg: 'secondary',
        color: 'white'
      }
    }
  };

  return (
    <Box
      as="button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
      sx={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        borderRadius: 'default',
        fontWeight: 'bold',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {children}
    </Box>
  );
}
