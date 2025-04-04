import { ReactNode } from "react";
import { Box, Flex, Text } from "rebass";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: 4,
          maxWidth: "500px",
          width: "90%",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Text fontSize={3} fontWeight="bold" mb={3} color="primary">
          {title}
        </Text>

        <Box mb={4}>
          {typeof message === "string" ? <Text>{message}</Text> : message}
        </Box>

        <Flex justifyContent="flex-end" sx={{ gap: 3 }}>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
