import { Box, Text } from "rebass";
import { useEffect } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  message,
  type,
  onClose,
  duration = 3000,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 4,
        right: 4,
        backgroundColor: type === "success" ? "success" : "error",
        color: "white",
        padding: 3,
        borderRadius: "4px",
        boxShadow: "large",
        maxWidth: "300px",
        animation: "slideIn 0.3s ease-out",
        zIndex: 1000,
        "@keyframes slideIn": {
          from: {
            transform: "translateX(100%)",
            opacity: 0,
          },
          to: {
            transform: "translateX(0)",
            opacity: 1,
          },
        },
      }}
      onClick={onClose}
    >
      <Text fontSize={2}>{message}</Text>
    </Box>
  );
}
