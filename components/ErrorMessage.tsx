import { Box, Text } from 'rebass';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Box
      className="alert alert-error"
      mb={3}
    >
      <Text fontWeight="bold" mb={1}>Error</Text>
      <Text>{message}</Text>
    </Box>
  );
}
