import { CountrySpec, Option, Scene, WardrobeItem } from './types';

// Passport Photo Constants

export const COUNTRY_SPECS: CountrySpec[] = [
  {
    name: 'United States',
    photoSizeMM: { width: 51, height: 51 }, // 2x2 inches
    headHeightPercentage: { min: 50, max: 69 },
    allowedBackgrounds: ['white', 'off-white'],
    otherRequirements: [
      'Subject must directly face the camera.',
      'Expression must be neutral with both eyes open.',
      'No shadows on the face or background.',
      'No glasses (unless a medical statement is provided).',
      'No hats or head coverings (unless for religious or medical reasons with a signed statement).',
    ],
  },
  {
    name: 'Schengen Visa (Europe)',
    photoSizeMM: { width: 35, height: 45 },
    headHeightPercentage: { min: 70, max: 80 },
    allowedBackgrounds: ['light grey', 'light blue', 'white'],
    otherRequirements: [
        'Subject must directly face the camera.',
        'Expression must be neutral with mouth closed.',
        'The photo must be recent, taken within the last 6 months.',
        'No reflections, shadows, or red-eye.',
    ],
  },
  {
    name: 'Canada',
    photoSizeMM: { width: 50, height: 70 },
    headHeightPercentage: { min: 44, max: 51 }, // 31mm to 36mm head height
    allowedBackgrounds: ['white', 'light-colored'],
    otherRequirements: [
      'The back of the photos must include the date the photo was taken, and the name and complete address of the photo studio.',
      'Expression must be neutral.',
      'Must show the top of the shoulders.',
    ],
  },
   {
    name: 'China',
    photoSizeMM: { width: 33, height: 48 },
    headHeightPercentage: { min: 58, max: 75 },
    allowedBackgrounds: ['white'],
    otherRequirements: [
      'No jewelry that obstructs facial features.',
      'Ears must be visible.',
      'A white background is strictly required.',
      'The space between the head and the top edge should be 3-5mm.'
    ],
  },
];

export const PASSPORT_BG_PROMPTS: { [key: string]: string } = {
  'white': 'a plain, uniform, and solid bright white background',
  'off-white': 'a plain, uniform, and solid off-white background',
  'light grey': 'a plain, uniform, and solid light grey background',
  'light blue': 'a plain, uniform, and solid light blue background',
  'light-colored': 'a plain, uniform, and solid light-colored background, typically white or light grey',
};

export const PASSPORT_FORMAL_ATTIRE: Option[] = [
  { label: 'Keep Original Attire', value: 'no change' },
  { label: 'Dark Suit, White Shirt, Tie', value: 'a formal dark business suit with a crisp white collared shirt and a conservative tie' },
  { label: 'Dark Suit, White Shirt (No Tie)', value: 'a formal dark business suit with a crisp white collared shirt, buttoned up' },
  { label: 'Blouse (Formal)', value: 'a simple, high-necked formal blouse in a solid dark color like navy or black' },
  { label: 'Collared Shirt (Dark)', value: 'a simple, dark-colored collared polo or dress shirt' },
];

export const PASSPORT_VALIDATION_PROMPT = `
  Analyze the user-provided image to determine if it's suitable as a starting point for a passport photo. 
  The user is about to convert this into an official passport photo. 
  Check for the following potential issues and provide a clear, user-friendly "feedback" message if any are found.
  The 'isValid' flag should be false if any critical issue is detected.

  Critical Issues (isValid: false):
  1.  **Face not visible or obstructed**: Is the face heavily shadowed, turned away, covered by hands/hair, or otherwise not clearly visible?
  2.  **Multiple people**: Are there multiple people in the photo?
  3.  **Non-human subject**: Is the subject an animal, cartoon, or object?
  4.  **Extreme angle**: Is the photo taken from a very high or low angle?
  5.  **Very low resolution/blurry**: Is the image extremely blurry or pixelated?
  6.  **Wearing hats, sunglasses, or headphones**: Are there any accessories that would obviously disqualify a passport photo? (Regular glasses are okay for this initial check).

  Warnings (isValid: true, but provide feedback):
  1.  **Busy Background**: "The background is a bit busy, but our AI will replace it for you."
  2.  **Smiling or non-neutral expression**: "Your expression isn't neutral, but our AI will attempt to correct it. For best results, use a photo with a neutral expression."
  3.  **Uneven lighting**: "The lighting is a bit uneven, but our AI will try to fix it."

  If the image is good, set 'isValid' to true and provide positive feedback like "This photo is a great starting point!".
  Your response must be in JSON format.
`;

// Portrait Generator Constants

export const PORTRAIT_SCENES: Scene[] = [
    { id: 'office', name: 'Professional Office', prompt: 'a modern, bright, and professional office setting, with a blurred background of bookshelves and a window', thumbnail: '/thumbnails/office.jpg' },
    { id: 'cafe', name: 'Cozy Cafe', prompt: 'a warm and inviting cafe with soft lighting, sitting at a wooden table with a latte', thumbnail: '/thumbnails/cafe.jpg' },
    { id: 'outdoor_park', name: 'Sunny Park', prompt: 'an outdoor park on a sunny day with lush green trees and foliage blurred in the background', thumbnail: '/thumbnails/outdoor_park.jpg' },
    { id: 'studio_gray', name: 'Studio (Gray)', prompt: 'a professional photo studio with a solid, textured medium-gray background and professional lighting', thumbnail: '/thumbnails/studio_gray.jpg' },
    { id: 'library', name: 'Classic Library', prompt: 'a classic library with rich, dark wood bookshelves filled with old books, creating a studious and elegant atmosphere', thumbnail: '/thumbnails/library.jpg' },
    { id: 'city_street', name: 'Urban Street', prompt: 'a vibrant city street with blurred background lights (bokeh), giving a modern and dynamic feel', thumbnail: '/thumbnails/city_street.jpg' },
];

export const PORTRAIT_WARDROBE: WardrobeItem[] = [
    { id: 'no_change', name: 'Keep Original', prompt: 'The person\'s clothing must remain completely unchanged from the original photo.', thumbnail: '/thumbnails/no_change.png' },
    { id: 'business_suit', name: 'Business Suit', prompt: 'wearing a sharp, well-fitted dark navy blue or charcoal gray business suit with a crisp white shirt.', thumbnail: '/thumbnails/business_suit.jpg' },
    { id: 'casual_sweater', name: 'Casual Sweater', prompt: 'wearing a comfortable and stylish merino wool sweater in a neutral color like gray or beige.', thumbnail: '/thumbnails/casual_sweater.jpg' },
    { id: 'blouse', name: 'Elegant Blouse', prompt: 'wearing a professional and elegant silk blouse in a jewel tone like emerald green or sapphire blue.', thumbnail: '/thumbnails/blouse.jpg' },
    { id: 'turtleneck', name: 'Black Turtleneck', prompt: 'wearing a classic, sophisticated black turtleneck sweater.', thumbnail: '/thumbnails/turtleneck.jpg' },
    { id: 'denim_jacket', name: 'Denim Jacket', prompt: 'wearing a stylish, modern denim jacket over a simple white t-shirt for a creative and approachable look.', thumbnail: '/thumbnails/denim_jacket.jpg' },
];
