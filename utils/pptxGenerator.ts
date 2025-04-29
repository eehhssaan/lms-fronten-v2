import pptxgen from "pptxgenjs";

interface Slide {
  title: string;
  content: string;
  type: string;
}

interface Metadata {
  title: string;
  subtitle: string;
  author: string;
}

export const generatePresentation = async (
  slides: Slide[],
  metadata: Metadata
): Promise<string> => {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = metadata.author;
  pptx.title = metadata.title;

  // Add title slide
  const titleSlide = pptx.addSlide();
  titleSlide.addText(metadata.title, {
    x: 1,
    y: 1,
    w: "80%",
    h: 2,
    fontSize: 44,
    bold: true,
    color: "363636",
    align: "center",
  });
  titleSlide.addText(metadata.subtitle, {
    x: 1,
    y: 3,
    w: "80%",
    h: 1.5,
    fontSize: 24,
    color: "666666",
    align: "center",
  });

  // Add content slides
  slides.forEach((slideContent) => {
    const slide = pptx.addSlide();
    slide.addText(slideContent.title, {
      x: 1,
      y: 1,
      w: "80%",
      h: 1.5,
      fontSize: 32,
      bold: true,
      color: "363636",
    });
    slide.addText(slideContent.content, {
      x: 1,
      y: 2.5,
      w: "80%",
      h: 4,
      fontSize: 18,
      color: "363636",
      bullet: true,
    });
  });

  // Generate and return base64 string
  const base64 = await pptx.write({ outputType: "base64" });
  return base64 as string;
};
