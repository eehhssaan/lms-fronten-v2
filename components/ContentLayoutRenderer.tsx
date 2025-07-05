import React from "react";
import { Box, Flex, Text } from "rebass";
import { ContentLayout } from "./ContentLayoutSelector";
import { ContentItem } from "@/types/presentation";

interface ContentLayoutRendererProps {
  layout: ContentLayout;
  items: ContentItem[];
  textStyle: any;
  onItemChange: (
    index: number,
    field: "title" | "detail",
    value: string
  ) => void;
}

const ContentLayoutRenderer: React.FC<ContentLayoutRendererProps> = ({
  layout,
  items,
  textStyle,
  onItemChange,
}) => {
  const renderVerticalList = () => (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      {items.map((item, index) => (
        <Box
          key={index}
          mb={2}
          sx={{
            borderRadius: "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: "2px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type="text"
            value={item.title}
            onChange={(e) => onItemChange(index, "title", e.target.value)}
            style={{
              ...textStyle,
              fontWeight: "bold",
              width: "100%",
              maxHeight: "32px",
              border: "none",
              outline: "none",
              fontSize: "20px",
              color: "#8B4513",
            }}
          />
          <textarea
            value={item.detail}
            onChange={(e) => onItemChange(index, "detail", e.target.value)}
            style={{
              ...textStyle,
              width: "100%",
              border: "none",
              outline: "none",
              resize: "none",
              // backgroundColor: "transparent",
              fontSize: "20px",
              color: "#8B4513",
              lineHeight: "1.5",
              minHeight: "60px",
              padding: "2px",
            }}
          />
        </Box>
      ))}
    </Box>
  );

  const renderHorizontalArrows = () => (
    <Flex height="100%">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Box flex={1} height="100%">
            <input
              type="text"
              value={item.title}
              onChange={(e) => onItemChange(index, "title", e.target.value)}
              style={{
                ...textStyle,
                fontWeight: "bold",
                marginBottom: "0.5rem",
                height: "32px",
                width: "100%",
                border: "none",
                outline: "none",
              }}
            />
            <textarea
              value={item.detail}
              onChange={(e) => onItemChange(index, "detail", e.target.value)}
              style={{
                ...textStyle,
                width: "100%",
                height: "calc(100% - 40px)", // Subtract title height + margin
                maxHeight: "calc(100vh - 200px)", // Prevent extending beyond viewport
                border: "none",
                outline: "none",
                resize: "none",
                overflow: "auto",
              }}
            />
          </Box>
          {index < items.length - 1 && (
            <Box alignSelf="center" mx={2}>
              →
            </Box>
          )}
        </React.Fragment>
      ))}
    </Flex>
  );

  const renderNumberedBullets = () => (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      {items.map((item, index) => (
        <Flex
          key={index}
          mb={2}
          sx={{
            backgroundColor: "rgba(49, 130, 206, 0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: "8px",
            minHeight: "60px",
            alignItems: "center",
          }}
        >
          <Box
            mr={3}
            sx={{
              minWidth: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#3182ce",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Box flex={1}>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onItemChange(index, "title", e.target.value)}
              style={{
                ...textStyle,
                fontWeight: "bold",
                width: "100%",
                height: "32px",
                border: "none",
                outline: "none",
                fontSize: "20px",
                backgroundColor: "transparent",
                color: "#8B4513",
                marginBottom: "2px",
                textAlign: "left",
              }}
            />
            <textarea
              value={item.detail}
              onChange={(e) => onItemChange(index, "detail", e.target.value)}
              style={{
                ...textStyle,
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                backgroundColor: "transparent",
                fontSize: "20px",
                color: "#8B4513",
                lineHeight: "1.5",
                minHeight: "60px",
                padding: "4px",
                textAlign: "left",
              }}
            />
          </Box>
        </Flex>
      ))}
    </Box>
  );

  const renderBlankBullets = () => (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
    >
      {items.map((item, index) => (
        <Flex
          key={index}
          mb={2}
          sx={{
            backgroundColor: "rgba(49, 130, 206, 0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: "8px",
            minHeight: "60px",
            alignItems: "center",
          }}
        >
          <Box
            mr={3}
            sx={{
              minWidth: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#3182ce",
              flexShrink: 0,
            }}
          />
          <Box flex={1}>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onItemChange(index, "title", e.target.value)}
              style={{
                ...textStyle,
                fontWeight: "bold",
                width: "100%",
                height: "32px",
                border: "none",
                outline: "none",
                fontSize: "20px",
                backgroundColor: "transparent",
                color: "#8B4513",
                marginBottom: "2px",
                textAlign: "left",
              }}
            />
            <textarea
              value={item.detail}
              onChange={(e) => onItemChange(index, "detail", e.target.value)}
              style={{
                ...textStyle,
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                backgroundColor: "transparent",
                fontSize: "20px",
                color: "#8B4513",
                lineHeight: "1.5",
                minHeight: "60px",
                padding: "4px",
                textAlign: "left",
              }}
            />
          </Box>
        </Flex>
      ))}
    </Box>
  );

  const renderPyramid = () => {
    const totalItems = items.length;
    const isInsidePyramid = layout === "inside-pyramid";

    return (
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        {items.map((item, index) => {
          const reverseIndex = totalItems - index - 1;
          const widthPercentage = isInsidePyramid
            ? 75 + reverseIndex * (25 / totalItems)
            : 100 - reverseIndex * (25 / totalItems);
          const marginLeftPercentage = (100 - widthPercentage) / 2;

          return (
            <Box
              key={index}
              mb={1}
              height={`${100 / totalItems}%`}
              sx={{
                width: `${widthPercentage}%`,
                marginLeft: `${marginLeftPercentage}%`,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Box
                sx={{
                  width: "150px",
                  minWidth: "150px",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onItemChange(index, "title", e.target.value)}
                  style={{
                    ...textStyle,
                    fontWeight: "bold",
                    width: "100%",
                    height: "32px",
                    border: "none",
                    outline: "none",
                    fontSize: "18px",
                    backgroundColor: "transparent",
                    textAlign: "right",
                    padding: "0 8px",
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "rgba(49, 130, 206, 0.05)",
                  // padding: "5px",
                  borderRadius: "8px",
                  border: "1px solid rgba(49, 130, 206, 0.1)",
                  height: "100%",
                  flex: 1,
                  display: "flex",
                }}
              >
                <textarea
                  value={item.detail}
                  onChange={(e) =>
                    onItemChange(index, "detail", e.target.value)
                  }
                  style={{
                    ...textStyle,
                    width: "100%",
                    flex: 1,
                    border: "none",
                    outline: "none",
                    resize: "none",
                    backgroundColor: "transparent",
                    textAlign: "center",
                    overflow: "auto",
                    // lineHeight: "1.5",
                    padding: "8px",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderCircle = () => (
    <Box position="relative" width="100%" height="700px">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
        }}
      >
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          <circle
            cx="300"
            cy="300"
            r="120"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
        </svg>

        {items.map((item, index) => {
          const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
          const radius = 120;
          const x = 300 + radius * Math.cos(angle);
          const y = 325 + radius * Math.sin(angle);

          return (
            <Box
              key={index}
              sx={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
                width: "200px",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(49, 130, 206, 0.05)",
                borderRadius: "8px",
                border: "1px solid rgba(49, 130, 206, 0.1)",
                padding: "8px",
              }}
            >
              <input
                type="text"
                value={item.title}
                onChange={(e) => onItemChange(index, "title", e.target.value)}
                style={{
                  ...textStyle,
                  fontWeight: "bold",
                  width: "100%",
                  height: "32px",
                  border: "none",
                  outline: "none",
                  fontSize: "20px",
                  backgroundColor: "transparent",
                  color: "#8B4513",
                  textAlign: "center",
                }}
              />
              <textarea
                value={item.detail}
                onChange={(e) => onItemChange(index, "detail", e.target.value)}
                style={{
                  ...textStyle,
                  width: "100%",
                  flex: 1,
                  minHeight: "100px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  backgroundColor: "transparent",
                  fontSize: "20px",
                  color: "#8B4513",
                  textAlign: "center",
                  lineHeight: "1.5",
                  padding: "4px",
                }}
              />
            </Box>
          );
        })}

        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          {items.map((_, index) => {
            const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
            const radius = 120;
            const x = 300 + radius * Math.cos(angle);
            const y = 300 + radius * Math.sin(angle);

            return (
              <line
                key={index}
                x1="300"
                y1="300"
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </Box>
    </Box>
  );

  switch (layout) {
    case "horizontal-arrows":
      return renderHorizontalArrows();
    case "numbered-bullets":
      return renderNumberedBullets();
    case "blank-bullets":
      return renderBlankBullets();
    case "inside-pyramid":
    case "outside-pyramid":
      return renderPyramid();
    case "circle":
    case "cycle":
    case "flower":
    case "ring":
      return renderCircle();
    case "vertical":
    default:
      return renderVerticalList();
  }
};

export default ContentLayoutRenderer;
