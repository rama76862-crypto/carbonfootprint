export const EMISSION_FACTORS = {
  transport: {
    car: 0.171,      // kg CO2 per km
    flight: 0.254,   // kg CO2 per km
    bus: 0.082,      // kg CO2 per km
    train: 0.041,    // kg CO2 per km
    bike: 0.0        // kg CO2 per km
  },
  home: {
    electricity: 0.385, // kg CO2 per kWh
    gas: 0.185          // kg CO2 per unit (kWh equivalent)
  },
  food: {
    meat_heavy: 2.9,  // kg CO2 per day
    omnivore: 1.7,    // kg CO2 per day
    vegetarian: 1.2,  // kg CO2 per day
    vegan: 0.7        // kg CO2 per day
  },
  shopping: {
    spend_usd: 0.120   // kg CO2 per USD spent
  }
};

export const GLOBAL_AVERAGE = 4.7; // tonnes CO2 / year
export const INDIA_AVERAGE = 1.9;  // tonnes CO2 / year
export const TARGET = 2.0;         // Paris Agreement target tonnes CO2 / year

export const COUNTRY_AVERAGES = {
  'India': 1.9,
  'United States': 14.7,
  'China': 7.6,
  'Germany': 7.9,
  'United Kingdom': 4.7,
  'Brazil': 2.2,
  'Japan': 8.6,
  'Australia': 15.0,
  'Canada': 14.2,
  'Global Average': 4.7
};

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const TIPS_DATA = [
  {
    id: 1,
    category: 'home',
    title: 'Switch to LED Lighting',
    description: 'Replace traditional incandescent light bulbs with energy-efficient LED bulbs. They use up to 75% less energy.',
    savingKg: 150,
    difficulty: 'easy',
    icon: 'zap'
  },
  {
    id: 2,
    category: 'food',
    title: 'Plant-Based 3 Days a Week',
    description: 'Swap meat and dairy for plant-based alternatives three days each week to significantly cut down food-related emissions.',
    savingKg: 450,
    difficulty: 'medium',
    icon: 'utensils'
  },
  {
    id: 3,
    category: 'transport',
    title: 'Use Public Transit',
    description: 'Take the bus or train instead of driving your car. It reduces emissions per passenger mile dramatically.',
    savingKg: 1200,
    difficulty: 'medium',
    icon: 'bus'
  },
  {
    id: 4,
    category: 'home',
    title: 'Adjust Your Thermostat',
    description: 'Turn your thermostat down by 1°C in winter (or up in summer). You will save money and cut heating/cooling emissions.',
    savingKg: 300,
    difficulty: 'easy',
    icon: 'thermometer'
  },
  {
    id: 5,
    category: 'food',
    title: 'Vegetarian Lifestyle',
    description: 'Adopt a vegetarian diet. Excluding meat from your diet prevents substantial agricultural carbon emissions.',
    savingKg: 800,
    difficulty: 'hard',
    icon: 'leaf'
  },
  {
    id: 6,
    category: 'transport',
    title: 'Reduce Air Travel',
    description: 'Skip one medium-haul flight per year or choose trains for intercity travel. Flights release carbon directly into the high atmosphere.',
    savingKg: 1500,
    difficulty: 'hard',
    icon: 'plane'
  },
  {
    id: 7,
    category: 'shopping',
    title: 'Thrift and Buy Second-Hand',
    description: 'Purchase pre-owned clothes, books, and furniture. It bypasses the carbon footprint of manufacturing and shipping new goods.',
    savingKg: 200,
    difficulty: 'easy',
    icon: 'shopping-bag'
  },
  {
    id: 8,
    category: 'home',
    title: 'Wash Laundry in Cold Water',
    description: 'About 75% to 90% of all energy your washing machine uses goes toward heating the water. Cold washes save energy and protect clothes.',
    savingKg: 75,
    difficulty: 'easy',
    icon: 'droplet'
  },
  {
    id: 9,
    category: 'food',
    title: 'Zero Food Waste',
    description: 'Plan meals, store food correctly, and compost scraps. Decomposing organic waste in landfills produces highly potent methane gas.',
    savingKg: 350,
    difficulty: 'medium',
    icon: 'trash-2'
  },
  {
    id: 10,
    category: 'transport',
    title: 'Start Carpooling',
    description: 'Share your commute with colleagues or friends. Splitting a ride cuts driving emissions in half or more.',
    savingKg: 600,
    difficulty: 'medium',
    icon: 'users'
  },
  {
    id: 11,
    category: 'home',
    title: 'Install Rooftop Solar',
    description: 'Generate your own clean electricity using solar photovoltaic panels. Excess power can often be fed back into the grid.',
    savingKg: 2500,
    difficulty: 'hard',
    icon: 'sun'
  },
  {
    id: 12,
    category: 'home',
    title: 'Unplug Standby Appliances',
    description: 'Unplug chargers, TVs, and computers when not in use. "Vampire power" accounts for up to 10% of household energy usage.',
    savingKg: 80,
    difficulty: 'easy',
    icon: 'power'
  },
  {
    id: 13,
    category: 'food',
    title: 'Adopt a Vegan Diet',
    description: 'Transition to a fully plant-based vegan diet. This is one of the single biggest ways to reduce your individual environmental impact.',
    savingKg: 1500,
    difficulty: 'hard',
    icon: 'heart'
  },
  {
    id: 14,
    category: 'food',
    title: 'Buy Local Produce',
    description: 'Choose seasonal vegetables and fruits grown locally. This reduces the carbon emissions from long-distance transport ("food miles").',
    savingKg: 150,
    difficulty: 'easy',
    icon: 'map-pin'
  },
  {
    id: 15,
    category: 'shopping',
    title: 'Recycle Right',
    description: 'Properly sort plastic, glass, paper, and aluminum. Manufacturing products from recycled materials requires far less energy.',
    savingKg: 120,
    difficulty: 'easy',
    icon: 'recycle'
  },
  {
    id: 16,
    category: 'home',
    title: 'Energy Star Appliances',
    description: 'When replacing appliances, look for highly rated energy-efficient models. They pay for themselves in reduced energy bills.',
    savingKg: 500,
    difficulty: 'medium',
    icon: 'cpu'
  },
  {
    id: 17,
    category: 'transport',
    title: 'Maintain Car Tire Pressure',
    description: 'Keep tires inflated to the recommended level. Under-inflated tires increase fuel consumption by causing engine strain.',
    savingKg: 100,
    difficulty: 'easy',
    icon: 'gauge'
  },
  {
    id: 18,
    category: 'transport',
    title: 'Walk or Bike Short Trips',
    description: 'For trips under 3 kilometers, choose walking or cycling. It provides health benefits and generates zero emissions.',
    savingKg: 400,
    difficulty: 'easy',
    icon: 'bike'
  },
  {
    id: 19,
    category: 'shopping',
    title: 'Mindful Shopping Choices',
    description: 'Avoid fast fashion and unnecessary consumer electronics. Purchase high-quality items designed to last, repairing them when broken.',
    savingKg: 180,
    difficulty: 'medium',
    icon: 'credit-card'
  },
  {
    id: 20,
    category: 'shopping',
    title: 'Say No to Single-Use Plastic',
    description: 'Always carry a reusable water bottle, coffee cup, and shopping tote. Plastic production and incineration release immense carbon.',
    savingKg: 50,
    difficulty: 'easy',
    icon: 'container'
  }
];
