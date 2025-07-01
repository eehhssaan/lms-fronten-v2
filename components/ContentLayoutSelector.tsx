import React from "react";
import { Box, Flex, Text } from "rebass";
import { createPortal } from "react-dom";

export type ContentLayout =
  | "vertical" // Default stacked layout
  | "horizontal-arrows"
  | "numbered-bullets"
  | "blank-bullets"
  | "inside-pyramid"
  | "outside-pyramid"
  | "circle"
  | "cycle"
  | "flower"
  | "ring";

interface ContentLayoutSelectorProps {
  currentLayout: ContentLayout;
  onLayoutChange: (layout: ContentLayout) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VerticalIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="4"
      y="10"
      width="16"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="4"
      y="16"
      width="16"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const HorizontalArrowsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <rect
      x="2"
      y="6"
      width="6"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M8 12h8m0 0l-4-4m4 4l-4 4" strokeWidth="2" />
    <rect
      x="16"
      y="6"
      width="6"
      height="12"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const NumberedBulletsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <text x="2" y="8" fontSize="8" fill="currentColor">
      1.
    </text>
    <line x1="8" y1="7" x2="22" y2="7" strokeWidth="2" />
    <text x="2" y="16" fontSize="8" fill="currentColor">
      2.
    </text>
    <line x1="8" y1="15" x2="22" y2="15" strokeWidth="2" />
    <text x="2" y="24" fontSize="8" fill="currentColor">
      3.
    </text>
    <line x1="8" y1="23" x2="22" y2="23" strokeWidth="2" />
  </svg>
);

const BlankBulletsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="4" cy="7" r="2" />
    <line x1="8" y1="7" x2="22" y2="7" strokeWidth="2" />
    <circle cx="4" cy="15" r="2" />
    <line x1="8" y1="15" x2="22" y2="15" strokeWidth="2" />
    <circle cx="4" cy="23" r="2" />
    <line x1="8" y1="23" x2="22" y2="23" strokeWidth="2" />
  </svg>
);

const PyramidIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <rect x="4" y="4" width="16" height="4" rx="1" strokeWidth="2" />
    <rect x="6" y="10" width="12" height="4" rx="1" strokeWidth="2" />
    <rect x="8" y="16" width="8" height="4" rx="1" strokeWidth="2" />
  </svg>
);

const CircleIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="8" strokeWidth="2" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="20" cy="12" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="4" cy="12" r="2" />
  </svg>
);

const layoutOptions: Array<{
  id: ContentLayout;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: "vertical",
    label: "Vertical List",
    icon: <VerticalIcon />,
    description: "Stack items vertically",
  },
  {
    id: "horizontal-arrows",
    label: "Horizontal Flow",
    icon: <HorizontalArrowsIcon />,
    description: "Arrange items horizontally with arrows",
  },
  {
    id: "numbered-bullets",
    label: "Numbered List",
    icon: <NumberedBulletsIcon />,
    description: "Numbered items in a list",
  },
  {
    id: "blank-bullets",
    label: "Bullet Points",
    icon: <BlankBulletsIcon />,
    description: "Items with bullet points",
  },
  {
    id: "inside-pyramid",
    label: "Pyramid In",
    icon: <PyramidIcon />,
    description: "Items in decreasing width",
  },
  {
    id: "outside-pyramid",
    label: "Pyramid Out",
    icon: <PyramidIcon />,
    description: "Items in increasing width",
  },
  {
    id: "circle",
    label: "Circle",
    icon: <CircleIcon />,
    description: "Items arranged in a circle",
  },
];

const ContentLayoutSelector: React.FC<ContentLayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Flex justifyContent="space-between" alignItems="center" mb={3}>
          <Text fontSize={20} fontWeight="bold">
            Select Content Layout
          </Text>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
              color: "#666",
            }}
          >
            ×
          </button>
        </Flex>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "16px",
            padding: "8px",
          }}
        >
          {layoutOptions.map((option) => (
            <Box
              key={option.id}
              onClick={() => {
                onLayoutChange(option.id);
                onClose();
              }}
              sx={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor:
                  currentLayout === option.id
                    ? "#3182ce"
                    : "rgba(0, 0, 0, 0.1)",
                backgroundColor:
                  currentLayout === option.id
                    ? "rgba(49, 130, 206, 0.1)"
                    : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#3182ce",
                  backgroundColor: "rgba(49, 130, 206, 0.05)",
                },
              }}
            >
              <Flex alignItems="center" mb={2}>
                <Box
                  sx={{
                    color: currentLayout === option.id ? "#3182ce" : "#666",
                    marginRight: "12px",
                  }}
                >
                  {option.icon}
                </Box>
                <Text
                  fontWeight={currentLayout === option.id ? "bold" : "normal"}
                  color={currentLayout === option.id ? "#3182ce" : "inherit"}
                >
                  {option.label}
                </Text>
              </Flex>
              <Text fontSize={14} color="#666">
                {option.description}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return createPortal(modalContent, document.body);
};

export default ContentLayoutSelector;
