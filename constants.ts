import { PassportCountry, Option } from './types';

export const PASSPORT_COUNTRIES: PassportCountry[] = [
  { 
    name: 'United States', 
    dimensions: '2x2 inches (51x51 mm)', 
    aspectRatio: 1, 
    headHeightPercentage: [50, 69],
    allowedBackgrounds: ['white'] 
  },
  { 
    name: 'United Kingdom', 
    dimensions: '45x35 mm', 
    aspectRatio: 35 / 45, 
    headHeightPercentage: [64, 75], // 29mm-34mm of 45mm height
    allowedBackgrounds: ['light grey', 'cream'] 
  },
  { 
    name: 'Canada', 
    dimensions: '70x50 mm', 
    aspectRatio: 50 / 70, 
    headHeightPercentage: [44, 50], // 31mm-36mm of 70mm height
    allowedBackgrounds: ['white', 'light-colored plain'] 
  },
  { 
    name: 'Australia', 
    dimensions: '45-50mm high and 35-40mm wide', 
    aspectRatio: 35 / 45, 
    headHeightPercentage: [66, 80], // 32mm-36mm of 45-50mm height (approx)
    allowedBackgrounds: ['light grey', 'white'] 
  },
  { 
    name: 'Schengen Area', 
    dimensions: '45x35 mm', 
    aspectRatio: 35 / 45, 
    headHeightPercentage: [70, 80],
    allowedBackgrounds: ['light grey', 'light blue', 'white'] 
  },
  { 
    name: 'China', 
    dimensions: '48x33 mm', 
    aspectRatio: 33 / 48, 
    headHeightPercentage: [58, 75], // 28mm-33mm of 48mm height
    allowedBackgrounds: ['white'] 
  },
  { 
    name: 'India', 
    dimensions: '2x2 inches (51x51 mm)', 
    aspectRatio: 1, 
    headHeightPercentage: [60, 70],
    allowedBackgrounds: ['white'] 
  },
];

export const FORMAL_ATTIRE: Option[] = [
  { label: 'Dark Suit, White Shirt, Tie', value: 'a dark business suit with a white collared shirt and a tie' },
  { label: 'Dark Suit, Blouse', value: 'a dark business suit with a professional blouse' },
  { label: 'Collared Shirt and Tie', value: 'a collared shirt and a tie' },
  { label: 'Professional Blouse', value: 'a professional, high-collared blouse' },
  { label: 'No Change', value: 'no change to attire' },
];

export const PORTRAIT_BACKGROUNDS: Option[] = [
  { label: 'Modern Office', value: 'a bright, modern office with blurred background' },
  { label: 'Outdoor Cityscape', value: 'an outdoor urban cityscape with soft, natural light' },
  { label: 'Bookshelf Wall', value: 'a wall lined with bookshelves, giving a scholarly feel' },
  { label: 'Neutral Gray Wall', value: 'a plain, textured neutral gray wall' },
  { label: 'Nature Scene', value: 'a serene nature scene with soft, diffused light' },
];

export const PORTRAIT_POSES: Option[] = [
  { label: 'Professional Standard', value: 'standard professional headshot pose' },
  { label: 'Slight Head Tilt', value: 'a slight, engaging head tilt' },
  { label: 'Leaning Forward', value: 'subtly leaning forward, looking confident' },
  { label: 'Shoulders Angled', value: 'shoulders angled slightly away from the camera' },
];

export const PORTRAIT_EXPRESSIONS: Option[] = [
  { label: 'Friendly Smile', value: 'a warm and friendly smile' },
  { label: 'Confident Look', value: 'a confident, serious expression' },
  { label: 'Approachable', value: 'a gentle, approachable expression' },
  { label: 'Thoughtful', value: 'a thoughtful and engaged expression' },
];

export const PORTRAIT_STYLES: Option[] = [
  { label: 'Standard Color', value: 'a standard, vibrant color style' },
  { label: 'Black and White', value: 'a classic, high-contrast black and white filter' },
  { label: 'Warm Tones', value: 'a filter that adds warm, inviting tones' },
  { label: 'Cool Tones', value: 'a filter that adds cool, professional tones' },
  { label: 'Cinematic', value: 'a dramatic, cinematic style with enhanced contrast and color grading' },
];
