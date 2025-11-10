// Fix: Provide full content for constants.ts
import { CountrySpec, OptionGroup } from "./types";

export const PASSPORT_BG_PROMPTS = {
    'white': 'a professional, plain, flat, and even solid white background',
    'off-white': 'a professional, plain, flat, and even solid off-white background',
    'light grey': 'a professional, plain, flat, and even solid light grey background',
    'cream': 'a professional, plain, flat, and even solid cream background',
    'light blue': 'a professional, plain, flat, and even solid light blue background',
};

// Fix: Added missing PASSPORT_VALIDATION_PROMPT constant.
export const PASSPORT_VALIDATION_PROMPT = `
You are a strict passport photo compliance officer. Your task is to analyze the uploaded image and determine if it's a suitable starting point for a passport photo. It doesn't need to be perfect, but it must meet some basic criteria.

The image is suitable if it meets ALL the following criteria:
1.  **Single Subject**: Contains only one person.
2.  **Clear View**: The person's face is clearly visible, facing forward, and not obscured by hair, hands, or other objects.
3.  **Eyes Open**: Both eyes are open.
4.  **No Obstructions**: The person is not wearing glasses, sunglasses, hats, headphones, or any head coverings (unless for religious or medical reasons, but for this check, assume none are allowed).
5.  **Lighting**: The face is generally well-lit without harsh shadows.
6.  **Focus**: The image is in focus and not blurry.
7.  **Expression**: The person has a relatively neutral expression (a slight smile is okay, but a wide grin or other expressive face is not).

Return your response as a JSON object with two keys: "isValid" (boolean) and "feedback" (string).
- If the image fails ANY of these criteria, set "isValid" to false and provide a single, concise sentence in "feedback" explaining the main reason for rejection (e.g., "The subject's face is obscured by shadows.", "The photo is blurry.", "Please remove glasses for the photo.", "The subject is not facing the camera directly.").
- If the image is suitable, set "isValid" to true and set "feedback" to "The photo is a good starting point for a passport photo."`;

export const COUNTRY_SPECS: CountrySpec[] = [
    { 
        name: 'United States', 
        photoSizeMM: { width: 51, height: 51 }, // 2x2 inches
        headHeightPercentage: { min: 50, max: 69 },
        allowedBackgrounds: ['white', 'off-white'],
        otherRequirements: [
            'Subject must have a neutral facial expression with both eyes open.',
            'Taken in the last 6 months to reflect your current appearance.',
            'Full face in view, facing the camera directly.',
            'No glasses (unless a medical statement is provided).',
            'Photo must be in color.'
        ]
    },
    { 
        name: 'United Kingdom', 
        photoSizeMM: { width: 35, height: 45 },
        headHeightPercentage: { min: 64, max: 75 }, // Head height between 29mm and 34mm
        allowedBackgrounds: ['light grey', 'cream'],
        otherRequirements: [
            'Neutral expression and mouth closed.',
            'Nothing covering the face.',
            'No shadows on the face or behind you.',
            'Eyes must be open and visible, with no hair in front of them.',
            'No red-eye.'
        ]
    },
    { 
        name: 'Schengen Area', 
        photoSizeMM: { width: 35, height: 45 },
        headHeightPercentage: { min: 70, max: 80 }, // Head height between 32mm and 36mm
        allowedBackgrounds: ['light grey', 'light blue', 'white'],
        otherRequirements: [
            'The face must be sharply focused, clear, and with high contrast.',
            'The head must be facing forward, not tilted.',
            'Mouth must be closed. A neutral expression is required.',
            'The photo must be no more than 6 months old.'
        ]
    },
    { 
        name: 'Canada', 
        photoSizeMM: { width: 50, height: 70 },
        headHeightPercentage: { min: 44, max: 51 }, // Head height between 31mm and 36mm
        allowedBackgrounds: ['white', 'light grey'],
        otherRequirements: [
            'A neutral facial expression (no smiling, mouth closed) is required.',
            'The photo must be clear, sharp, and in focus.',
            'Uniform lighting and no shadows, glare, or flash reflections.',
            'Face and shoulders must be centered and squared to the camera.'
        ]
    },
    { 
        name: 'Australia', 
        photoSizeMM: { width: 35, height: 45 },
        headHeightPercentage: { min: 71, max: 80 }, // Head height between 32mm and 36mm
        allowedBackgrounds: ['light grey', 'white'],
        otherRequirements: [
            'Good quality, colour print, less than six months old.',
            'Clear, focused image with no marks or \'red eye\'.',
            'Plain white or light grey background that contrasts with your face.',
            'Uniform lighting (no shadows or reflections) on the face.'
        ]
    },
];

export const PASSPORT_FORMAL_ATTIRE: { label: string, value: string }[] = [
    { label: "No Change", value: "no change" },
    { label: "Dark Suit, White Shirt, Tie", value: "a professional dark business suit, a crisp white collared shirt, and a classic tie" },
    { label: "Dark Blouse/Jacket", value: "a professional dark blazer or blouse with a high neckline" }
];

export const PORTRAIT_ASPECT_RATIOS: { label: string, value: string }[] = [
    { label: "Portrait (4:5)", value: "4:5" },
    { label: "Square (1:1)", value: "1:1" },
    { label: "Landscape (16:9)", value: "16:9" },
    { label: "Widescreen (2:1)", value: "2:1" }
];

export const PORTRAIT_PROMPT_BUILDER_OPTIONS: OptionGroup[] = [
    {
        label: "Setting",
        options: [
            { label: "Modern Office", value: "in a bright, modern office with a blurred background" },
            { label: "Lush Garden", value: "in a vibrant, lush garden with soft, natural light" },
            { label: "City Rooftop", value: "on a city rooftop at dusk with a stunning skyline view" },
            { label: "Cozy Library", value: "in a cozy, classic library filled with books" },
            { label: "Minimalist Studio", value: "against a clean, minimalist studio backdrop" },
        ]
    },
    {
        label: "Pose / Action",
        options: [
            { label: "Standing Confidently", value: "standing confidently, with shoulders slightly angled" },
            { label: "Sitting at a Desk", value: "sitting at a clean, modern desk, looking towards the camera" },
            { label: "Leaning Casually", value: "leaning casually against a textured wall" },
            { label: "Candid Laughter", value: "in a moment of candid, natural laughter" },
            { label: "Holding a Coffee Mug", value: "holding a warm coffee mug with both hands" },
        ]
    },
    {
        label: "Expression",
        options: [
            { label: "Gentle Smile", value: "with a gentle, friendly, and approachable smile" },
            { label: "Neutral & Focused", value: "with a neutral and focused expression, looking directly at the camera" },
            { label: "Confident Look", value: "with a confident, determined look" },
            { label: "Thoughtful Gaze", value: "with a thoughtful gaze, looking slightly away from the camera" },
        ]
    }
];


type Attire = { name: string; prompt: string };
type Wardrobe = {
  upper: Attire[];
  lower: Attire[];
};
type AttireCollection = {
  [key: string]: Wardrobe;
};

export const PORTRAIT_ATTIRE: AttireCollection = {
    'Man': {
        upper: [
            { name: "No Change", prompt: "" },
            { name: "Crisp White T-Shirt", prompt: "wearing a crisp, clean white t-shirt" },
            { name: "Navy Blue Suit Jacket", prompt: "wearing a well-fitted navy blue suit jacket over a white dress shirt" },
            { name: "Casual Denim Shirt", prompt: "wearing a casual, light-wash denim shirt" },
            { name: "Gray Hoodie", prompt: "wearing a comfortable gray hoodie" },
            { name: "Black Leather Jacket", prompt: "wearing a stylish black leather jacket over a t-shirt" },
        ],
        lower: [
            { name: "No Change", prompt: "" },
            { name: "Dark Wash Jeans", prompt: "wearing dark wash denim jeans" },
            { name: "Khaki Chinos", prompt: "wearing classic khaki chinos" },
            { name: "Black Trousers", prompt: "wearing sharp black trousers" },
        ]
    },
    'Woman': {
        upper: [
            { name: "No Change", prompt: "" },
            { name: "Silk Blouse", prompt: "wearing an elegant silk blouse" },
            { name: "Black Blazer", prompt: "wearing a professional, tailored black blazer" },
            { name: "Knit Sweater", prompt: "wearing a cozy, cream-colored knit sweater" },
            { name: "Striped T-Shirt", prompt: "wearing a classic striped long-sleeve t-shirt" },
            { name: "Trench Coat", prompt: "wearing a timeless trench coat" },
        ],
        lower: [
            { name: "No Change", prompt: "" },
            { name: "Tailored Trousers", prompt: "wearing smart, tailored trousers" },
            { name: "A-Line Skirt", prompt: "wearing a flattering A-line skirt" },
            { name: "Slim-Fit Jeans", prompt: "wearing stylish slim-fit jeans" },
        ]
    },
    'Boy': {
        upper: [
            { name: "No Change", prompt: "" },
            { name: "Graphic T-Shirt", prompt: "wearing a fun graphic t-shirt" },
            { name: "Polo Shirt", prompt: "wearing a smart polo shirt" },
            { name: "Zip-Up Hoodie", prompt: "wearing a sporty zip-up hoodie" },
            { name: "Collared Shirt", prompt: "wearing a neat collared button-down shirt" },
        ],
        lower: [
            { name: "No Change", prompt: "" },
            { name: "Jeans", prompt: "wearing comfortable jeans" },
            { name: "Cargo Shorts", prompt: "wearing practical cargo shorts" },
            { name: "Jogger Pants", prompt: "wearing trendy jogger pants" },
        ]
    },
     'Girl': {
        upper: [
            { name: "No Change", prompt: "" },
            { name: "Embroidered Top", prompt: "wearing a cute top with embroidery" },
            { name: "Denim Jacket", prompt: "wearing a classic denim jacket" },
            { name: "Cozy Cardigan", prompt: "wearing a soft, cozy cardigan" },
            { name: "Peter Pan Collar Blouse", prompt: "wearing a sweet blouse with a Peter Pan collar" },
        ],
        lower: [
            { name: "No Change", prompt: "" },
            { name: "Jean Skirt", prompt: "wearing a stylish jean skirt" },
            { name: "Leggings", prompt: "wearing comfortable, colorful leggings" },
            { name: "Tutu Skirt", prompt: "wearing a fun tutu skirt" },
        ]
    },
};