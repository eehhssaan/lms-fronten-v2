import React, { useEffect } from "react";
import { Box, Flex, Text } from "rebass";
import { ContentLayout } from "./ContentLayoutSelector";
import { ContentItem } from "@/types/presentation";
import { useAutoScaleFont } from "@/hooks/useAutoScaleFont";

interface ContentLayoutRendererProps {
  layout: ContentLayout;
  items: ContentItem[];
  textStyle: any;
  onItemChange: (
    index: number,
    field: "title" | "detail",
    value: string
  ) => void;
  isMiniPreview?: boolean;
}

const AutoScalingContent: React.FC<{
  value: string;
  onChange: (value: string) => void;
  style: any;
  minFontSize?: number;
  maxFontSize?: number;
  isMiniPreview?: boolean;
}> = ({
  value,
  onChange,
  style,
  minFontSize = 12,
  maxFontSize = 20,
  isMiniPreview,
}) => {
  const { fontSize, contentRef } = useAutoScaleFont(value, {
    minFontSize,
    maxFontSize,
  });

  useEffect(() => {
    const el = contentRef.current;
    if (el && !isMiniPreview) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    } else if (el && isMiniPreview) {
      el.style.height = "auto";
      el.style.height = "16px";
    }
  }, [value, contentRef]);

  return (
    <div style={{ width: "100%" }}>
      <textarea
        ref={contentRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...style,
          fontSize: `${fontSize}px`,
          width: "100%",
          overflow: "hidden",
          resize: "none",
          height: "auto",
        }}
      />
    </div>
  );
};

const ContentLayoutRenderer: React.FC<ContentLayoutRendererProps> = ({
  layout,
  items,
  textStyle,
  onItemChange,
  isMiniPreview = false,
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
          mb={isMiniPreview ? 0.5 : 2}
          sx={{
            borderRadius: isMiniPreview ? "2px" : "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: isMiniPreview ? "1px" : "2px",
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
              maxHeight: isMiniPreview ? "16px" : "32px",
              border: "none",
              outline: "none",
              fontSize: isMiniPreview ? "7px" : "20px",
              color: "#8B4513",
            }}
          />
          <AutoScalingContent
            value={item.detail}
            onChange={(value) => onItemChange(index, "detail", value)}
            style={{
              ...textStyle,
              border: "none",
              outline: "none",
              resize: "none",
              color: "#8B4513",
              lineHeight: isMiniPreview ? "1.1" : "1.5",
              padding: isMiniPreview ? "1px" : "2px",
            }}
            minFontSize={isMiniPreview ? 6 : 12}
            maxFontSize={isMiniPreview ? 8 : 20}
          />
        </Box>
      ))}
    </Box>
  );

  const renderHorizontalArrows = () => (
    <Box
      height="100%"
      position="relative"
      sx={{ padding: isMiniPreview ? "0.20px" : "4px" }}
    >
      <Flex
        height="100%"
        alignItems="stretch"
        sx={{
          gap: isMiniPreview ? "0.0625" : "0.25rem",
          position: "relative",
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Box
              flex={1}
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: isMiniPreview ? "2px" : "8px",
                height: "100%",
                minHeight: isMiniPreview ? "60px" : "200px",
                position: "relative",
                gap: isMiniPreview ? "0.25rem" : "1rem",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  justifyContent: "center",
                  gap: isMiniPreview ? "0.25rem" : "1rem",
                }}
              >
                <Box
                  sx={{
                    padding: isMiniPreview ? "0.25rem" : "1rem",
                  }}
                >
                  <AutoScalingContent
                    value={item.title}
                    onChange={(value) => onItemChange(index, "title", value)}
                    style={{
                      ...textStyle,
                      fontWeight: "bold",
                      width: "100%",
                      border: "none",
                      outline: "none",
                      textAlign: "center",
                      fontSize: isMiniPreview ? "7px" : "24px",
                      resize: "none",
                    }}
                    minFontSize={isMiniPreview ? 6 : 18}
                    maxFontSize={isMiniPreview ? 8 : 24}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AutoScalingContent
                    value={item.detail}
                    onChange={(value) => onItemChange(index, "detail", value)}
                    style={{
                      ...textStyle,
                      border: "none",
                      outline: "none",
                      resize: "none",
                      overflow: "auto",
                      textAlign: "center",
                    }}
                    minFontSize={isMiniPreview ? 6 : 14}
                    maxFontSize={isMiniPreview ? 8 : 20}
                  />
                </Box>
              </Box>
            </Box>
            {/* {index < items.length - 1 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isMiniPreview ? "12px" : "60px",
                  alignSelf: "center",
                }}
              >
                <Box
                  sx={{
                    color: "#3182ce",
                    fontSize: isMiniPreview ? "10px" : "32px",
                    fontWeight: "bold",
                  }}
                >
                  →
                </Box>
              </Box>
            )} */}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
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
          mb={isMiniPreview ? 0.5 : 2}
          sx={{
            backgroundColor: "rgba(49, 130, 206, 0.05)",
            borderRadius: isMiniPreview ? "2px" : "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: isMiniPreview ? "2px" : "8px",
            minHeight: isMiniPreview ? "20px" : "60px",
            alignItems: "center",
          }}
        >
          <Box
            mr={isMiniPreview ? 1 : 3}
            sx={{
              minWidth: isMiniPreview ? "14px" : "32px",
              height: isMiniPreview ? "14px" : "32px",
              borderRadius: "50%",
              backgroundColor: "#3182ce",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: isMiniPreview ? "8px" : "16px",
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
                height: isMiniPreview ? "12px" : "32px",
                border: "none",
                outline: "none",
                fontSize: isMiniPreview ? "7px" : "20px",
                backgroundColor: "transparent",
                color: "#8B4513",
                marginBottom: isMiniPreview ? "1px" : "2px",
                textAlign: "left",
              }}
            />
            <AutoScalingContent
              value={item.detail}
              onChange={(value) => onItemChange(index, "detail", value)}
              style={{
                ...textStyle,
                border: "none",
                outline: "none",
                resize: "none",
                backgroundColor: "transparent",
                color: "#8B4513",
                lineHeight: isMiniPreview ? "1.1" : "1.5",
                padding: isMiniPreview ? "1px" : "4px",
                textAlign: "left",
              }}
              minFontSize={isMiniPreview ? 6 : 12}
              maxFontSize={isMiniPreview ? 8 : 20}
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
          mb={isMiniPreview ? 0.5 : 2}
          sx={{
            backgroundColor: "rgba(49, 130, 206, 0.05)",
            borderRadius: isMiniPreview ? "2px" : "8px",
            border: "1px solid rgba(49, 130, 206, 0.1)",
            padding: isMiniPreview ? "2px" : "8px",
            minHeight: isMiniPreview ? "20px" : "60px",
            alignItems: "center",
          }}
        >
          <Box
            mr={isMiniPreview ? 1 : 3}
            sx={{
              minWidth: isMiniPreview ? "6px" : "12px",
              height: isMiniPreview ? "6px" : "12px",
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
                height: isMiniPreview ? "12px" : "32px",
                border: "none",
                outline: "none",
                fontSize: isMiniPreview ? "7px" : "20px",
                backgroundColor: "transparent",
                color: "#8B4513",
                marginBottom: isMiniPreview ? "1px" : "2px",
                textAlign: "left",
              }}
            />
            <AutoScalingContent
              value={item.detail}
              onChange={(value) => onItemChange(index, "detail", value)}
              style={{
                ...textStyle,
                border: "none",
                outline: "none",
                resize: "none",
                backgroundColor: "transparent",
                color: "#8B4513",
                lineHeight: isMiniPreview ? "1.1" : "1.5",
                padding: isMiniPreview ? "1px" : "4px",
                textAlign: "left",
              }}
              minFontSize={isMiniPreview ? 6 : 12}
              maxFontSize={isMiniPreview ? 8 : 20}
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
        sx={{
          transform: isMiniPreview ? "scale(0.8)" : "none",
          transformOrigin: "center center",
        }}
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
              mb={isMiniPreview ? 0.25 : 1}
              height={`${100 / totalItems}%`}
              sx={{
                width: `${widthPercentage}%`,
                marginLeft: `${marginLeftPercentage}%`,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: isMiniPreview ? "4px" : "16px",
              }}
            >
              <Box
                sx={{
                  width: isMiniPreview ? "60px" : "150px",
                  minWidth: isMiniPreview ? "60px" : "150px",
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
                    height: isMiniPreview ? "12px" : "32px",
                    border: "none",
                    outline: "none",
                    fontSize: isMiniPreview ? "7px" : "18px",
                    backgroundColor: "transparent",
                    textAlign: "right",
                    padding: isMiniPreview ? "1px 2px" : "0 8px",
                  }}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: "rgba(49, 130, 206, 0.05)",
                  borderRadius: isMiniPreview ? "2px" : "8px",
                  border: "1px solid rgba(49, 130, 206, 0.1)",
                  height: "100%",
                  flex: 1,
                  display: "flex",
                  minHeight: isMiniPreview ? "16px" : undefined,
                }}
              >
                <AutoScalingContent
                  value={item.detail}
                  onChange={(value) => onItemChange(index, "detail", value)}
                  style={{
                    ...textStyle,
                    border: "none",
                    outline: "none",
                    resize: "none",
                    backgroundColor: "transparent",
                    textAlign: "center",
                    overflow: "auto",
                    padding: isMiniPreview ? "1px" : "8px",
                  }}
                  minFontSize={isMiniPreview ? 6 : 12}
                  maxFontSize={isMiniPreview ? 8 : 20}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderCircle = () => (
    <Box
      position="relative"
      width="100%"
      height={isMiniPreview ? "120px" : "700px"}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMiniPreview ? "100px" : "600px",
          height: isMiniPreview ? "100px" : "600px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0, // SVG will be underneath
            pointerEvents: "none",
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
              cx={isMiniPreview ? "50" : "300"}
              cy={isMiniPreview ? "55" : "335"}
              r={isMiniPreview ? "25" : "150"}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={isMiniPreview ? "2" : "5"}
              z="0.1"
            />
          </svg>
        </Box>

        {items.map((item, index) => {
          const angle = (index * 2 * Math.PI) / items.length - Math.PI / 2;
          const radius = isMiniPreview ? 25 : 120;
          const centerX = isMiniPreview ? 50 : 300;
          const centerY = isMiniPreview ? 50 : 300;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <Box
              key={index}
              sx={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -35%)",
                width: isMiniPreview ? "42px" : "205px",
                minHeight: isMiniPreview ? "42px" : "205px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                transition: "all 0.3s ease",
                backgroundColor: "rgb(247, 247, 247)",
                borderRadius: "50%",
                border: isMiniPreview
                  ? "none"
                  : "1px solid rgba(49, 130, 206, 0.1)",
                padding: isMiniPreview ? "1px" : "8px",
                zIndex: 1,
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
                  height: isMiniPreview ? "8px" : "32px",
                  border: "none",
                  outline: "none",
                  fontSize: isMiniPreview ? "5px" : "20px",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  padding: 0,
                }}
              />
              <AutoScalingContent
                value={item.detail}
                onChange={(value) => onItemChange(index, "detail", value)}
                style={{
                  ...textStyle,

                  border: "none",
                  outline: "none",
                  resize: "none",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: isMiniPreview ? "1" : "1.5",
                  padding: 0,
                  margin: 0,
                }}
                minFontSize={isMiniPreview ? 4 : 12}
                maxFontSize={isMiniPreview ? 5 : 14}
                isMiniPreview={isMiniPreview}
              />
            </Box>
          );
        })}

        {/* <svg
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
            const radius = isMiniPreview ? 25 : 120;
            const centerX = isMiniPreview ? 50 : 300;
            const centerY = isMiniPreview ? 50 : 300;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={isMiniPreview ? "0.25" : "1"}
              />
            );
          })}
        </svg> */}
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
