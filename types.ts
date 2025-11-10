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

export interface CountrySpec {
  name: string;
  width: number;
  height: number;
  background: 'white' | 'light grey' | 'blue';
}
