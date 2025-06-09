/**
 * Converts font size from pt to px with a scaling factor
 * @param fontSize Font size in pt (e.g., "12pt")
 * @param scale Scaling factor to apply
 * @returns Font size in px with scaling applied
 */
export const getResponsiveFontSize = (
  fontSize: string,
  scale: number
): string => {
  // Input is in pt, convert to px with scaling
  const pt = parseInt(fontSize.replace("pt", ""));
  return `${Math.round(pt * 1.333 * scale)}px`;
};
