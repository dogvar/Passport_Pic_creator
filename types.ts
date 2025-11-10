export type FeatureMode = 'passport' | 'portrait';

export interface PassportCountry {
  name: string;
  dimensions: string;
  aspectRatio: number; // width / height
  headHeightPercentage: [number, number]; // [min, max]
  allowedBackgrounds: string[];
}

export interface Option {
  label: string;
  value: string;
}

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
}
