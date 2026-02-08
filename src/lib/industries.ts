export const INDUSTRIES = [
  "Batteries",
  "Clean Energy",
  "Construction",
  "Consulting",
  "Education",
  "Finance",
  "Healthcare",
  "Infrastructure",
  "Legal",
  "Manufacturing",
  "Media",
  "Real Estate",
  "Retail",
  "Solar",
  "Software",
  "Technology",
  "Telecommunications",
  "Transportation",
  "Venture Capital",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
