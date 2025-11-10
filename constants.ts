import { PassportCountry, WardrobeCollection } from './types';

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

export const PORTRAIT_ATTIRE: WardrobeCollection = {
  "Man": {
    upper: [
      { name: 'No Change', prompt: 'Keep the original upper body clothing.' },
      { name: 'Dark Suit & Tie', prompt: 'a dark, well-fitted suit with a white dress shirt and a tie' },
      { name: 'Black Leather Jacket', prompt: 'a stylish black leather jacket over a simple t-shirt' },
      { name: 'Casual Hoodie', prompt: 'a comfortable, stylish hoodie' },
      { name: 'Tuxedo', prompt: 'a classic black tuxedo with a white shirt and bow tie' },
    ],
    lower: [
      { name: 'No Change', prompt: 'Keep the original lower body clothing.' },
      { name: 'Suit Trousers', prompt: 'dark suit trousers' },
      { name: 'Dark Wash Jeans', prompt: 'well-fitted dark wash jeans' },
      { name: 'Chinos', prompt: 'casual chino pants' },
      { name: 'Tuxedo Pants', prompt: 'black tuxedo pants with a satin stripe' },
    ]
  },
  "Woman": {
    upper: [
        { name: 'No Change', prompt: 'Keep the original upper body clothing.' },
        { name: 'Professional Blazer', prompt: 'a professional, tailored blazer over a silk blouse' },
        { name: 'Elegant Evening Gown', prompt: 'the top part of an elegant evening gown' },
        { name: 'Knit Sweater', prompt: 'a cozy, fashionable knit sweater' },
        { name: 'Denim Jacket', prompt: 'a classic denim jacket over a casual top' },
    ],
    lower: [
      { name: 'No Change', prompt: 'Keep the original lower body clothing.' },
      { name: 'Tailored Trousers', prompt: 'professional tailored trousers' },
      { name: 'A-Line Skirt', prompt: 'a stylish A-line skirt' },
      { name: 'Fitted Jeans', prompt: 'modern, well-fitted jeans' },
      { name: 'Maxi Skirt', prompt: 'a flowing maxi skirt' },
    ]
  },
  "Boy": {
    upper: [
      { name: 'No Change', prompt: 'Keep the original upper body clothing.' },
      { name: 'Collared Polo Shirt', prompt: 'a smart collared polo shirt' },
      { name: 'Graphic T-Shirt', prompt: 'a fun graphic t-shirt' },
      { name: 'Zip-Up Hoodie', prompt: 'a sporty zip-up hoodie' },
      { name: 'Button-Up Shirt', prompt: 'a button-up dress shirt' },
    ],
    lower: [
      { name: 'No Change', prompt: 'Keep the original lower body clothing.' },
      { name: 'Khaki Shorts', prompt: 'khaki shorts' },
      { name: 'Jeans', prompt: 'classic blue jeans' },
      { name: 'Cargo Pants', prompt: 'cargo pants' },
      { name: 'Dress Pants', prompt: 'formal dress pants' },
    ]
  },
  "Girl": {
    upper: [
      { name: 'No Change', prompt: 'Keep the original upper body clothing.' },
      { name: 'Sundress Top', prompt: 'the top part of a bright, cheerful sundress' },
      { name: 'Cardigan Sweater', prompt: 'a cute cardigan sweater over a simple top' },
      { name: 'T-shirt with Print', prompt: 'a t-shirt with a playful print' },
      { name: 'Ruffled Blouse', prompt: 'a stylish blouse with ruffles' },
    ],
    lower: [
      { name: 'No Change', prompt: 'Keep the original lower body clothing.' },
      { name: 'Denim Skirt', prompt: 'a denim skirt' },
      { name: 'Leggings', prompt: 'comfortable leggings' },
      { name: 'Jeans', prompt: 'stylish jeans' },
      { name: 'Pleated Skirt', prompt: 'a pleated school-style skirt' },
    ]
  },
};
