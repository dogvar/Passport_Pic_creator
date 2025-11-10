// Fix: Provide full content for types.ts
export type FeatureMode = 'passport' | 'portrait';

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
}

export interface Option {
  label: string;
  value: string;
}

export interface OptionGroup {
    label: string;
    options: Option[];
}

export interface CountrySpec {
  name: string;
  photoSizeMM: { width: number; height: number; };
  headHeightPercentage: { min: number; max: number; };
  allowedBackgrounds: string[];
  otherRequirements: string[];
}
