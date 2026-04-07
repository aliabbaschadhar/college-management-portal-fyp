// Centralized color palette for the College Management Portal
export const colors = {
  // Primary Blue (Navy) - used for headers, primary buttons, key UI elements
  primary: "#003B73",

  // Secondary Cyan (Highlights) - used for accents, links, hover states
  secondary: "#4FC3F7",

  // Light Blue (Card backgrounds) - used for card/section backgrounds
  lightBlue: "#E3F2FD",

  // Dark Grey (Text) - used for body text and headings
  darkGrey: "#424242",

  // Soft Grey (Borders) - used for borders, dividers, subtle UI elements
  softGrey: "#E8E8E8",

  // White - used for page backgrounds, card surfaces
  white: "#FFFFFF",
} as const;

// Tailwind-compatible CSS variable names mapped to the palette
export const colorVars = {
  "--color-primary-navy": colors.primary,
  "--color-secondary-cyan": colors.secondary,
  "--color-light-blue": colors.lightBlue,
  "--color-dark-grey": colors.darkGrey,
  "--color-soft-grey": colors.softGrey,
  "--color-white": colors.white,
} as const;

export type ColorKey = keyof typeof colors;
