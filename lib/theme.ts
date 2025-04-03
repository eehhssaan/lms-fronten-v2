import { theme } from '@rebass/preset';

// MUJI-inspired theme with neutral color palette
export const mujiTheme = {
  ...theme,
  colors: {
    text: '#333333',
    background: '#F7F7F7',
    primary: '#4A4A4A',
    secondary: '#7C7C7C',
    accent: '#A0A0A0',
    muted: '#E0E0E0',
    highlight: '#F0F0F0',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    info: '#1976D2',
    white: '#FFFFFF',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 700,
  },
  lineHeights: {
    body: 1.6,
    heading: 1.25,
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    avatar: 48,
    container: 1200,
  },
  radii: {
    default: 4,
    circle: 99999,
  },
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05)',
  },
  buttons: {
    primary: {
      color: 'white',
      bg: 'primary',
      '&:hover': {
        bg: '#3A3A3A',
      },
    },
    secondary: {
      color: 'white',
      bg: 'secondary',
      '&:hover': {
        bg: '#6C6C6C',
      },
    },
    outline: {
      color: 'primary',
      bg: 'transparent',
      borderColor: 'muted',
      border: '1px solid',
      '&:hover': {
        bg: 'background',
      },
    },
    ghost: {
      color: 'primary',
      bg: 'transparent',
      '&:hover': {
        bg: 'highlight',
      },
    },
  },
  cards: {
    primary: {
      padding: 3,
      borderRadius: 'default',
      backgroundColor: 'white',
      boxShadow: 'card',
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  forms: {
    input: {
      borderColor: 'muted',
      borderRadius: 'default',
      padding: 2,
      '&:focus': {
        borderColor: 'accent',
        outline: 'none',
      },
    },
    select: {
      borderColor: 'muted',
      borderRadius: 'default',
      padding: 2,
      '&:focus': {
        borderColor: 'accent',
        outline: 'none',
      },
    },
    textarea: {
      borderColor: 'muted',
      borderRadius: 'default',
      padding: 2,
      '&:focus': {
        borderColor: 'accent',
        outline: 'none',
      },
    },
    label: {
      fontWeight: 'bold',
      mb: 1,
    },
  },
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      mt: 3,
      mb: 3,
    },
    display: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
      fontSize: [5, 6, 7],
    },
    caps: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  variants: {
    badge: {
      display: 'inline-block',
      px: 2,
      py: 1,
      borderRadius: 'default',
      fontWeight: 'bold',
      fontSize: 0,
    },
    card: {
      p: 3,
      borderRadius: 'default',
      bg: 'white',
      boxShadow: 'card',
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      ...theme.text.heading,
      fontSize: 5,
    },
    h2: {
      ...theme.text.heading,
      fontSize: 4,
    },
    h3: {
      ...theme.text.heading,
      fontSize: 3,
    },
    h4: {
      ...theme.text.heading,
      fontSize: 2,
    },
    h5: {
      ...theme.text.heading,
      fontSize: 1,
    },
    h6: {
      ...theme.text.heading,
      fontSize: 0,
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    a: {
      color: 'primary',
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    img: {
      maxWidth: '100%',
    },
  },
};

export default mujiTheme;
