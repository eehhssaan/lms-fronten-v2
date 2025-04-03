'use client';

import React from 'react';
import { Box, Text, Button, Flex } from 'rebass';

interface ErrorDisplayProps {
  error: string | Error;
  retry?: () => void;
  style?: React.CSSProperties;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, retry, style }) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      sx={{
        bg: 'white',
        border: '1px solid',
        borderColor: 'error',
        borderRadius: 'default',
        boxShadow: 'sm',
        ...style
      }}
    >
      <Box
        mb={3}
        sx={{
          width: 50,
          height: 50,
          bg: '#FFF0F0',
          borderRadius: 'circle',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V14M12 17.5V18M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Box>
      
      <Text fontWeight="bold" fontSize={2} color="error" mb={2}>
        An error occurred
      </Text>
      
      <Text textAlign="center" mb={3} color="text">
        {errorMessage}
      </Text>
      
      {retry && (
        <Button
          onClick={retry}
          variant="outline"
          sx={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            color: 'text',
            borderColor: 'muted',
            '&:hover': {
              bg: 'background'
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
            <path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.2766 17.9845 5.27498C16.8482 4.27335 15.4745 3.60225 14 3.35C12.5255 3.09775 11.0078 3.28317 9.6346 3.88344C8.26142 4.48371 7.08334 5.47879 6.2 6.75L1 13M23 11L17.8 17.25C16.9167 18.5212 15.7386 19.5163 14.3654 20.1166C12.9922 20.7168 11.4745 20.9023 10 20.65C8.52548 20.3977 7.15185 19.7266 6.01547 18.725C4.87909 17.7234 4.01717 16.4332 3.51 15L3.5 15" 
                  stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Try Again
        </Button>
      )}
    </Flex>
  );
};

export default ErrorDisplay;
