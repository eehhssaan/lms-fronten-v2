export interface SlideElement {
  type: string;
  x: string | number;
  y: string | number;
  width: string | number;
  height: string | number;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  placeholder?: string;
}

export interface Layout {
  id: string;
  name: string;
  description: string;
  elements: SlideElement[];
  thumbnail?: string; // Optional path to thumbnail image
}

export const layouts: Record<string, Layout> = {
  titleOnly: {
    id: "titleOnly",
    name: "Title Only",
    description: "A slide with only a title",
    elements: [
      {
        type: "title",
        x: "10%",
        y: "40%",
        width: "80%",
        height: "20%",
        fontSize: 48,
        textAlign: "center",
        placeholder: "Click to add title",
      },
    ],
  },
  titleAndContent: {
    id: "titleAndContent",
    name: "Title and Content",
    description: "A slide with a title and content",
    elements: [
      {
        type: "title",
        x: "10%",
        y: "5%",
        width: "80%",
        height: "15%",
        fontSize: 40,
        textAlign: "center",
        placeholder: "Click to add title",
      },
      {
        type: "content",
        x: "10%",
        y: "25%",
        width: "80%",
        height: "70%",
        fontSize: 24,
        textAlign: "left",
        placeholder: "Click to add content",
      },
    ],
  },
  twoColumn: {
    id: "twoColumn",
    name: "Two Column",
    description: "A slide with two columns of content",
    elements: [
      {
        type: "title",
        x: "10%",
        y: "5%",
        width: "80%",
        height: "15%",
        fontSize: 40,
        textAlign: "center",
        placeholder: "Click to add title",
      },
      {
        type: "leftContent",
        x: "10%",
        y: "25%",
        width: "38%",
        height: "70%",
        fontSize: 24,
        textAlign: "left",
        placeholder: "Left column content",
      },
      {
        type: "rightContent",
        x: "52%",
        y: "25%",
        width: "38%",
        height: "70%",
        fontSize: 24,
        textAlign: "left",
        placeholder: "Right column content",
      },
    ],
  },
  titleAndTwoContent: {
    id: "titleAndTwoContent",
    name: "Title and Two Content",
    description: "Title with two content areas stacked vertically",
    elements: [
      {
        type: "title",
        x: "10%",
        y: "5%",
        width: "80%",
        height: "15%",
        fontSize: "40",
        textAlign: "left",
        placeholder: "Enter title",
      },
      {
        type: "topContent",
        x: "10%",
        y: "25%",
        width: "80%",
        height: "30%",
        fontSize: "24",
        textAlign: "left",
        placeholder: "Top content",
      },
      {
        type: "bottomContent",
        x: "10%",
        y: "60%",
        width: "80%",
        height: "30%",
        fontSize: "24",
        textAlign: "left",
        placeholder: "Bottom content",
      },
    ],
  },
  comparison: {
    id: "comparison",
    name: "Comparison",
    description: "Compare two items side by side",
    elements: [
      {
        type: "title",
        x: "10%",
        y: "5%",
        width: "80%",
        height: "15%",
        fontSize: 40,
        textAlign: "center",
        placeholder: "Comparison Title",
      },
      {
        type: "leftTitle",
        x: "10%",
        y: "25%",
        width: "38%",
        height: "10%",
        fontSize: 32,
        textAlign: "center",
        placeholder: "Left Title",
      },
      {
        type: "rightTitle",
        x: "52%",
        y: "25%",
        width: "38%",
        height: "10%",
        fontSize: 32,
        textAlign: "center",
        placeholder: "Right Title",
      },
      {
        type: "leftContent",
        x: "10%",
        y: "40%",
        width: "38%",
        height: "50%",
        fontSize: 24,
        textAlign: "left",
        placeholder: "Left content",
      },
      {
        type: "rightContent",
        x: "52%",
        y: "40%",
        width: "38%",
        height: "50%",
        fontSize: 24,
        textAlign: "left",
        placeholder: "Right content",
      },
    ],
  },
  contentOnly: {
    id: "contentOnly",
    name: "Content Only",
    description: "A slide with only content",
    elements: [
      {
        type: "content",
        x: "10%",
        y: "10%",
        width: "80%",
        height: "80%",
        fontSize: 32,
        textAlign: "left",
        placeholder: "Click to add content",
      },
    ],
  },
};

export default layouts;
