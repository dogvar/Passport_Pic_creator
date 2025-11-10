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

// Types for the new AI Wardrobe feature
export interface AttireOption extends Option {
  // Can be extended with image URLs for thumbnails in the future
}

export type WardrobeCategory = 'man' | 'woman' | 'boy' | 'girl';

export type WardrobeCollection = {
  [key in WardrobeCategory]: AttireOption[];
};
