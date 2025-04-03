'use client';

import React from 'react';
import { Box, Flex } from 'rebass';
import { keyframes } from '@emotion/react';

// Define spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Define pulse animation
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

interface LoaderProps {
  size?: number;
  color?: string;
  type?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 40, 
  color = '#4A4A4A', 
  type = 'spinner',
  text
}) => {
  // Spinner loader
  if (type === 'spinner') {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center" p={3}>
        <Box
          css={{
            width: size,
            height: size,
            border: `4px solid rgba(0, 0, 0, 0.1)`,
            borderRadius: '50%',
            borderTopColor: color,
            animation: `${spin} 1s ease-in-out infinite`,
          }}
        />
        {text && (
          <Box mt={3} color="text" fontSize={1}>
            {text}
          </Box>
        )}
      </Flex>
    );
  }

  // Dots loader
  if (type === 'dots') {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center" p={3}>
        <Flex>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              mx={1}
              css={{
                width: size / 3,
                height: size / 3,
                backgroundColor: color,
                borderRadius: '50%',
                animation: `${pulse} 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </Flex>
        {text && (
          <Box mt={3} color="text" fontSize={1}>
            {text}
          </Box>
        )}
      </Flex>
    );
  }

  // Pulse loader
  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="center" p={3}>
      <Box
        css={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      />
      {text && (
        <Box mt={3} color="text" fontSize={1}>
          {text}
        </Box>
      )}
    </Flex>
  );
};

export default Loader;
