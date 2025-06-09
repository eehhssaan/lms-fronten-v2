import { Slide, SlideElement, TextFormat } from "@/types/presentation";

export const transformSlideElements = (
  slide: Slide,
  layoutElements: SlideElement[]
): Array<{
  type: string;
  value: string;
  format: TextFormat;
}> => {
  return layoutElements.map((layoutElement: SlideElement) => {
    // Extract formatting properties from the layout element and ensure correct types
    const layoutFormat: TextFormat = {
      fontSize:
        typeof layoutElement.fontSize === "number"
          ? `${layoutElement.fontSize}pt`
          : layoutElement.fontSize,
      fontFamily: layoutElement.fontFamily,
      color: layoutElement.color,
      backgroundColor: layoutElement.backgroundColor,
      bold: layoutElement.bold,
      italic: layoutElement.italic,
      underline: layoutElement.underline,
      textAlign: layoutElement.textAlign,
      lineHeight:
        typeof layoutElement.lineHeight === "number"
          ? `${layoutElement.lineHeight}`
          : layoutElement.lineHeight,
      letterSpacing:
        typeof layoutElement.letterSpacing === "number"
          ? `${layoutElement.letterSpacing}px`
          : layoutElement.letterSpacing,
      textTransform: layoutElement.textTransform,
    };

    if (layoutElement.type === "title") {
      return {
        type: "title",
        value: slide.title || "",
        format: layoutFormat,
      };
    } else if (layoutElement.type === "content") {
      // Find content element from slide.elements or use empty string
      const contentElement = slide.elements?.find(
        (el) => el.type === "content"
      );
      return {
        type: "content",
        value: contentElement?.value || "",
        format: layoutFormat,
      };
    } else if (layoutElement.type === "image") {
      // Find image element from slide.elements or use empty string
      const imageElement = slide.elements?.find((el) => el.type === "image");
      return {
        type: "image",
        value: imageElement?.value || "",
        format: layoutFormat,
      };
    } else {
      return {
        type: layoutElement.type,
        value: "",
        format: layoutFormat,
      };
    }
  });
};
