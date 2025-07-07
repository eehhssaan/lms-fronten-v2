import { useEffect, useRef, useState } from "react";

interface AutoScaleFontOptions {
  minFontSize?: number;
  maxFontSize?: number;
  step?: number;
}

export const useAutoScaleFont = (
  content: string,
  options: AutoScaleFontOptions = {}
) => {
  const { minFontSize = 12, maxFontSize = 20, step = 0.5 } = options;

  const [fontSize, setFontSize] = useState(maxFontSize);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const calculateOptimalFontSize = () => {
      const container = containerRef.current;
      const content = contentRef.current;

      if (!container || !content) return;

      // Reset font size to max to get the natural content size
      content.style.fontSize = `${maxFontSize}px`;

      // Get container dimensions
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Binary search for optimal font size
      let low = minFontSize;
      let high = maxFontSize;
      let optimal = maxFontSize;

      while (low <= high) {
        const mid = low + (high - low) / 2;
        content.style.fontSize = `${mid}px`;

        const isOverflowing =
          content.scrollHeight > containerHeight ||
          content.scrollWidth > containerWidth;

        if (isOverflowing) {
          high = mid - step;
        } else {
          optimal = mid;
          low = mid + step;
        }
      }

      setFontSize(Math.max(minFontSize, optimal));
    };

    calculateOptimalFontSize();

    // Add resize observer to recalculate on container size changes
    const resizeObserver = new ResizeObserver(calculateOptimalFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [content, minFontSize, maxFontSize, step]);

  return { fontSize, containerRef, contentRef };
};
