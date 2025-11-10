export type FeatureMode = 'passport' | 'portrait';

export interface ValidationResult {
  isValid: boolean;
  feedback: string;
}

export interface Option {
  label: string;
  value: string;
}

export interface CountrySpec {
  name: string;
  photoSizeMM: {
    width: number;
    height: number;
  };
  headHeightPercentage: {
    min: number;
    max: number;
  };
  allowedBackgrounds: string[];
  otherRequirements: string[];
}

export interface WardrobeItem {
    id: string;
    name: string;
    prompt: string;
    thumbnail: string;
}

export interface Scene {
    id: string;
    name: string;
    prompt: string;
    thumbnail: string;
}
