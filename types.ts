export type FeatureMode = 'passport' | 'portrait';

export interface Option {
  value: string;
  label: string;
}

export interface PassportCountry {
  name: string;
  dimensions: string;
  aspectRatio: number;
  headHeightPercentage: [number, number];
  allowedBackgrounds: string[];
}

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
}

export interface AttireOption {
  name: string;
  prompt: string;
}

export interface WardrobeCategory {
  upper: AttireOption[];
  lower: AttireOption[];
}

export interface WardrobeCollection {
  [key: string]: WardrobeCategory;
}
