
import { PassportCountry, Option, PortraitStyle } from './types';

export const PASSPORT_COUNTRIES: PassportCountry[] = [
  {
    name: 'United States',
    dimensions: '2x2 inches',
    aspectRatio: 1,
    headHeightPercentage: [50, 69],
    allowedBackgrounds: ['white', 'off-white'],
  },
  {
    name: 'Schengen Area / EU',
    dimensions: '35x45 mm',
    aspectRatio: 35 / 45,
    headHeightPercentage: [70, 80],
    allowedBackgrounds: ['light grey', 'light blue'],
  },
  {
    name: 'United Kingdom',
    dimensions: '35x45 mm',
    aspectRatio: 35 / 45,
    headHeightPercentage: [70, 80],
    allowedBackgrounds: ['cream', 'light grey'],
  },
  {
    name: 'Canada',
    dimensions: '50x70 mm',
    aspectRatio: 50 / 70,
    headHeightPercentage: [44, 51], // 31-36mm head height on 70mm photo
    allowedBackgrounds: ['white', 'light-coloured'],
  },
  {
    name: 'China',
    dimensions: '33x48 mm',
    aspectRatio: 33 / 48,
    headHeightPercentage: [58, 75], // 28-33mm on 48mm photo
    allowedBackgrounds: ['white'],
  },
];

export const FORMAL_ATTIRE: Option[] = [
  { value: 'a dark suit with a white shirt and a tie', label: 'Dark Suit & Tie' },
  { value: 'a professional black blazer', label: 'Black Blazer' },
  { value: 'a simple collared shirt', label: 'Collared Shirt' },
  { value: 'no change to attire', label: 'No Change' },
];

export const PORTRAIT_STYLES: PortraitStyle[] = [
    {
        name: 'Corporate Headshot',
        prompt: 'Generate a professional corporate headshot. The person should be wearing business attire against a blurred office background. The lighting should be soft and flattering, creating a confident and approachable look. High-resolution, photorealistic.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/corporate.jpg'
    },
    {
        name: 'Cinematic',
        prompt: 'Create a cinematic-style portrait with dramatic lighting (Rembrandt or split lighting). The background should be dark and moody. The person\\\'s expression should be thoughtful and intense. Emphasize texture and detail. High-resolution, photorealistic.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/cinematic.jpg'
    },
    {
        name: 'Vintage Film',
        prompt: 'Generate a portrait that looks like it was shot on vintage film (e.g., Kodachrome or Polaroid). Add subtle film grain, warm tones, and soft focus. The background should be a retro-style setting. The person should have a nostalgic expression. High-resolution, photorealistic.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/vintage.jpg'
    },
    {
        name: 'Fantasy Art',
        prompt: 'Transform the person into a fantasy character (e.g., an elf or a mage). Add fantastical elements like glowing magical effects, intricate fantasy armor or robes, and an enchanted forest or castle background. The style should be epic and illustrative. High-resolution, painterly.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/fantasy.jpg'
    },
    {
        name: 'Minimalist B&W',
        prompt: 'Create a powerful black and white portrait. Use high contrast lighting to sculpt the face. The background should be a solid dark grey. The focus should be entirely on the person\\\'s expression and form. Timeless and classic. High-resolution, photorealistic.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/bw.jpg'
    },
    {
        name: 'Futuristic Sci-Fi',
        prompt: 'Generate a futuristic, sci-fi themed portrait. The person should be wearing sleek, modern clothing or cybernetic enhancements. The background should be a neon-lit cityscape or a starship interior. Use cool, blue and purple tones. High-resolution, photorealistic.',
        thumbnail: 'https://storage.googleapis.com/gemini-ui-params/demo-assets/thumbnails/scifi.jpg'
    }
];
