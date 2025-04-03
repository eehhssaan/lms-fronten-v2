import { Box, Flex } from 'rebass';

export default function Loading() {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: '200px',
        width: '100%'
      }}
    >
      <Box
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'border',
          borderTopColor: 'primary',
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            to: {
              transform: 'rotate(360deg)'
            }
          }
        }}
      />
    </Flex>
  );
}
