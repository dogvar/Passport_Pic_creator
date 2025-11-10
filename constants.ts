// Fix: Provide full content for constants.ts
import { CountrySpec } from "./types";

export const PASSPORT_BG_PROMPTS = {
    'white': 'a professional, plain, flat, and even solid white background, suitable for a passport photo',
    'light grey': 'a professional, plain, flat, and even solid light grey background, suitable for a passport photo',
    'blue': 'a professional, plain, flat, and even solid light blue background, suitable for a passport photo',
};

export const COUNTRY_SPECS: CountrySpec[] = [
    { name: 'United States', width: 2, height: 2, background: 'white' },
    { name: 'United Kingdom', width: 35, height: 45, background: 'light grey' },
    { name: 'Canada', width: 50, height: 70, background: 'white' },
    { name: 'Australia', width: 35, height: 45, background: 'light grey' },
    { name: 'China', width: 33, height: 48, background: 'white' },
    { name: 'India', width: 2, height: 2, background: 'white' },
    { name: 'Schengen Area', width: 35, height: 45, background: 'light grey' },
];

export const PASSPORT_VALIDATION_PROMPT = `
You are an expert passport photo compliance checker.
Analyze the provided image and determine if it meets the common requirements for a passport photo.
Do not be overly strict, but flag major issues.
Common requirements:
- The person should be looking directly at the camera.
- The facial expression should be neutral with both eyes open.
- The head should be centered and not tilted.
- No shadows on the face or background.
- No glasses, hats, or head coverings (unless for religious or medical reasons).
- The photo should be clear and in focus.

Return your response as a JSON object with two keys: "isValid" (boolean) and "feedback" (string).
The "feedback" should be a concise, user-friendly message explaining why the photo is not valid, or confirming it's good to proceed if it is valid.
Example of good feedback for a valid photo: "The photo looks good and seems to meet standard passport requirements."
Example of good feedback for an invalid photo: "The person is not looking directly at the camera. Please upload a photo where you are facing forward."
`;

export const PORTRAIT_SCENES = {
  'Professional': [
    { name: 'Modern Office', prompt: 'a modern, bright, professional office setting with blurred background' },
    { name: 'Corporate Headshot', prompt: 'a classic corporate headshot background, solid neutral color' },
    { name: 'University Campus', prompt: 'a beautiful university campus background, slightly blurred' },
    { name: 'Outdoors - Business Park', prompt: 'an outdoor setting in a modern business park, with greenery' },
  ],
  'Casual': [
    { name: 'Cozy Cafe', prompt: 'the interior of a cozy, warm cafe with soft lighting' },
    { name: 'City Street', prompt: 'a vibrant city street scene, with bokeh lights in the background' },
    { name: 'Park Bench', prompt: 'sitting on a bench in a beautiful, sunny park' },
    { name: 'By the Beach', prompt: 'a beautiful, serene beach at sunset' },
  ],
  'Creative': [
    { name: 'Art Studio', prompt: 'an artist\'s studio, with canvases and paint supplies in the background' },
    { name: 'Neon Cityscape', prompt: 'a futuristic cityscape at night with neon lights' },
    { name: 'Enchanted Forest', prompt: 'a magical, enchanted forest with mystical lighting' },
    { name: 'Abstract Colors', prompt: 'a vibrant, abstract background with swirling colors' },
  ]
};

type Attire = { name: string; prompt: string };
type Wardrobe = {
  upper: Attire[];
  lower: Attire[];
};
type AttireCollection = {
  [key: string]: Wardrobe;
};

export const PORTRAIT_ATTIRE: AttireCollection = {
    'Professional': {
        upper: [
            { name: "Business Suit Jacket", prompt: "wearing a dark business suit jacket over a light-colored dress shirt" },
            { name: "Blouse", prompt: "wearing a professional silk blouse" },
            { name: "Polo Shirt", prompt: "wearing a smart polo shirt" },
            { name: "Sweater over Shirt", prompt: "wearing a v-neck sweater over a collared shirt" },
        ],
        lower: [
            { name: "Matching Suit Trousers", prompt: "" },
            { name: "Business Skirt", prompt: "" },
            { name: "Smart Trousers", prompt: "" },
        ]
    },
    'Casual': {
        upper: [
            { name: "T-Shirt", prompt: "wearing a plain, comfortable t-shirt" },
            { name: "Hoodie", prompt: "wearing a stylish zip-up hoodie" },
            { name: "Denim Jacket", prompt: "wearing a classic denim jacket" },
            { name: "Flannel Shirt", prompt: "wearing an open flannel shirt over a t-shirt" },
        ],
        lower: [
            { name: "Jeans", prompt: "" },
            { name: "Chinos", prompt: "" },
            { name: "Shorts", prompt: "" },
        ]
    },
    'Creative': {
        upper: [
            { name: "Leather Jacket", prompt: "wearing a cool leather jacket" },
            { name: "Band T-Shirt", prompt: "wearing a vintage band t-shirt" },
            { name: "Artistic Smock", prompt: "wearing an artist's smock with paint splatters" },
            { name: "Bohemian Top", prompt: "wearing a flowy, bohemian-style embroidered top" },
        ],
        lower: [
             { name: "Ripped Jeans", prompt: "" },
             { name: "Cargo Pants", prompt: "" },
             { name: "Flowy Skirt", prompt: "" },
        ]
    }
};
