export type Budget = "$" | "$$" | "$$$" | "$$$$";

export type Tag =
  | "Romantic"
  | "Family Friendly"
  | "Large Groups"
  | "Rooftop"
  | "Outdoor Seating"
  | "Vegetarian Friendly"
  | "Vegan Options"
  | "Late Night"
  | "Brunch"
  | "Cocktail Bar"
  | "Live Music"
  | "Pet Friendly"
  | "Trendy"
  | "Traditional"
  | "Fine Dining"
  | "Casual"
  | "Quick Bites";

export interface Review {
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export type RestaurantType = "ai" | "google" | "curated";

export type RestaurantBadge = "AI Suggested" | "Popular" | "Featured" | "Trending";

export interface Restaurant {
  id: string;
  name: string;
  area: string;
  city: string;
  cuisine: string;
  budget: Budget;
  rating: number;
  totalReviews: number;
  description: string;
  topDishes: string[];
  tags: Tag[];
  reviews: Review[];
  imageColor: string;
  isManuallyAdded?: boolean;
  type?: RestaurantType;
  badges?: RestaurantBadge[];
  distanceKm?: number;
  goodFor?: string[];
  // Google-specific fields
  address?: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  placeId?: string;
  geometry?: {
    lat: number;
    lng: number;
  };
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export const CUISINES = [
  "All",
  "Indian",
  "Italian",
  "Japanese",
  "Chinese",
  "Mexican",
  "American",
  "Mediterranean",
  "Thai",
  "Korean",
  "French",
  "Middle Eastern",
  "Continental",
  "Seafood",
  "Steakhouse",
  "Fusion",
];

export const TAGS: Tag[] = [
  "Romantic",
  "Family Friendly",
  "Large Groups",
  "Rooftop",
  "Outdoor Seating",
  "Vegetarian Friendly",
  "Vegan Options",
  "Late Night",
  "Brunch",
  "Cocktail Bar",
  "Live Music",
  "Pet Friendly",
  "Trendy",
  "Traditional",
  "Fine Dining",
  "Casual",
  "Quick Bites",
];

export const BUDGETS: Budget[] = ["$", "$$", "$$$", "$$$$"];

export const TIME_SLOTS = [
  { label: "Lunch — 12:00 PM", value: "lunch-12" },
  { label: "Lunch — 1:00 PM", value: "lunch-13" },
  { label: "Lunch — 2:00 PM", value: "lunch-14" },
  { label: "Dinner — 6:00 PM", value: "dinner-18" },
  { label: "Dinner — 7:00 PM", value: "dinner-19" },
  { label: "Dinner — 7:30 PM", value: "dinner-1930" },
  { label: "Dinner — 8:00 PM", value: "dinner-20" },
  { label: "Dinner — 8:30 PM", value: "dinner-2030" },
  { label: "Dinner — 9:00 PM", value: "dinner-21" },
  { label: "Late Night — 10:00 PM", value: "late-22" },
  { label: "Late Night — 11:00 PM", value: "late-23" },
];

export const SEED_MEMBERS: GroupMember[] = [
  { id: "u1", name: "Priya", avatar: "P", color: "#c44a20" },
  { id: "u2", name: "Arjun", avatar: "A", color: "#d97706" },
  { id: "u3", name: "Meera", avatar: "M", color: "#7c3aed" },
  { id: "u4", name: "Rohan", avatar: "R", color: "#059669" },
  { id: "u5", name: "Zara", avatar: "Z", color: "#db2777" },
];

export const SEED_RESTAURANTS: Restaurant[] = [
  // Mumbai
  {
    id: "mum-1",
    name: "Trishna",
    area: "Fort",
    city: "Mumbai",
    cuisine: "Seafood",
    budget: "$$$",
    rating: 4.7,
    totalReviews: 3241,
    description:
      "A legendary Mumbai institution since 1981, Trishna is the city's most beloved seafood restaurant. Famous for its butter pepper garlic crab, the restaurant has been drawing food lovers from across the world with its expertly spiced coastal Indian fare.",
    topDishes: [
      "Butter Pepper Garlic Crab",
      "Koliwada Prawns",
      "Pomfret Rechad",
      "Clam Sukka",
    ],
    tags: ["Traditional", "Fine Dining", "Romantic"],
  imageColor: "from-blue-800 to-teal-700",
  type: "curated",
  badges: ["Featured"],
  reviews: [
      {
        author: "Vikram S.",
        avatar: "V",
        rating: 5,
        text: "The butter pepper garlic crab is absolutely transcendent. I've had this dish at restaurants around the world and nothing compares.",
        date: "2 weeks ago",
      },
      {
        author: "Sophie L.",
        avatar: "S",
        rating: 5,
        text: "Worth every rupee. The koliwada prawns were perfectly spiced and the service was attentive without being intrusive.",
        date: "1 month ago",
      },
      {
        author: "Rahul M.",
        avatar: "R",
        rating: 4,
        text: "Classic Mumbai experience. Book well in advance — tables are nearly impossible to get on weekends.",
        date: "3 weeks ago",
      },
    ],
  },
  {
    id: "mum-2",
    name: "Bastian",
    area: "Bandra West",
    city: "Mumbai",
    cuisine: "Seafood",
    budget: "$$$",
    rating: 4.5,
    totalReviews: 2108,
    description:
      "Bastian brought a whole new energy to Mumbai's dining scene when it opened. Set across multiple floors with a stunning rooftop, it blends coastal European and Asian flavors into a menu that feels genuinely exciting. The bar program is exceptional.",
    topDishes: [
      "Truffle Fries",
      "Lobster Mac & Cheese",
      "Prawn Toast",
      "Miso Black Cod",
    ],
    tags: ["Rooftop", "Trendy", "Cocktail Bar", "Large Groups"],
    imageColor: "from-indigo-800 to-blue-600",
    type: "curated",
    badges: ["Trending"],
    reviews: [
      {
        author: "Ananya K.",
        avatar: "A",
        rating: 5,
        text: "The rooftop at sunset is magical. The lobster mac and cheese is criminally good.",
        date: "1 week ago",
      },
      {
        author: "James T.",
        avatar: "J",
        rating: 4,
        text: "Great cocktails, incredible view. Slightly loud but that's part of the vibe. The miso black cod was the highlight.",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "mum-3",
    name: "Peshwari",
    area: "Andheri East",
    city: "Mumbai",
    cuisine: "Indian",
    budget: "$$",
    rating: 4.6,
    totalReviews: 1876,
    description:
      "Housed inside the ITC Maratha, Peshwari replicates the grandeur of North-West Frontier cuisine with a menu that celebrates slow-cooked meats, clay oven breads, and robust spices. The dal bukhara is slow-cooked for 18 hours.",
    topDishes: [
      "Dal Bukhara",
      "Sikandari Raan",
      "Murgh Malai Kebab",
      "Peshwari Naan",
    ],
    tags: ["Traditional", "Fine Dining", "Family Friendly"],
    imageColor: "from-amber-900 to-orange-700",
    reviews: [
      {
        author: "Deepika R.",
        avatar: "D",
        rating: 5,
        text: "The dal bukhara alone justifies the trip. Creamy, smoky perfection that I've been thinking about for weeks.",
        date: "3 days ago",
      },
      {
        author: "Marco B.",
        avatar: "M",
        rating: 5,
        text: "Best Indian food I've ever had and I've been eating Indian food for 30 years. The raan was extraordinary.",
        date: "1 month ago",
      },
    ],
  },
  {
    id: "mum-4",
    name: "The Bombay Canteen",
    area: "Lower Parel",
    city: "Mumbai",
    cuisine: "Indian",
    budget: "$$",
    rating: 4.4,
    totalReviews: 3902,
    description:
      "TBC is the restaurant that proved modern Indian food could be both inventive and deeply respectful of tradition. Their seasonal menus draw on regional Indian ingredients and techniques, presented with warmth and a genuine sense of fun.",
    topDishes: [
      "Keema Pav",
      "Prawn Ghee Roast",
      "Thepla Tacos",
      "Kokum & Coconut Sorbet",
    ],
    tags: ["Trendy", "Casual", "Cocktail Bar", "Vegetarian Friendly"],
    imageColor: "from-terracotta-700 to-amber-600",
    reviews: [
      {
        author: "Sneha P.",
        avatar: "S",
        rating: 5,
        text: "TBC never disappoints. The keema pav is comfort food elevated to an art form. Always something new and exciting on the menu.",
        date: "5 days ago",
      },
      {
        author: "David C.",
        avatar: "D",
        rating: 4,
        text: "Innovative without being gimmicky. The cocktail pairings are brilliant and the staff genuinely know their menu.",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "mum-5",
    name: "Chez Remy",
    area: "Colaba",
    city: "Mumbai",
    cuisine: "French",
    budget: "$$$",
    rating: 4.3,
    totalReviews: 987,
    description:
      "A quiet gem in Colaba, Chez Remy brings authentic French bistro cooking to Mumbai. The quaint interiors, candlelit tables, and menu of classic French dishes make it the city's most romantic dining destination.",
    topDishes: [
      "Duck Confit",
      "French Onion Soup",
      "Crème Brûlée",
      "Bouillabaisse",
    ],
    tags: ["Romantic", "Fine Dining", "Outdoor Seating"],
    imageColor: "from-slate-800 to-slate-600",
    reviews: [
      {
        author: "Kavya M.",
        avatar: "K",
        rating: 5,
        text: "Took my partner here for our anniversary — it was absolutely perfect. The duck confit was flawless and the wine list is superb.",
        date: "1 week ago",
      },
    ],
  },
  // Delhi
  {
    id: "del-1",
    name: "Indian Accent",
    area: "Lodhi Estate",
    city: "Delhi",
    cuisine: "Indian",
    budget: "$$$$",
    rating: 4.8,
    totalReviews: 4123,
    description:
      "Consistently ranked among Asia's 50 Best Restaurants, Indian Accent is the definitive modern Indian dining experience. Chef Manish Mehrotra's tasting menus are a meditation on the subcontinent's vast culinary heritage, reimagined with extraordinary technical precision.",
    topDishes: [
      "Doda Burfi French Toast",
      "Wild Mushroom Kullad",
      "Meetha Achaar Pork Ribs",
      "Mishti Doi Cheesecake",
    ],
    tags: ["Fine Dining", "Romantic", "Trendy"],
    imageColor: "from-purple-900 to-purple-700",
    reviews: [
      {
        author: "Amara O.",
        avatar: "A",
        rating: 5,
        text: "One of the best meals of my life. The doda burfi french toast is pure genius — sweet, salty, perfectly textured.",
        date: "1 week ago",
      },
      {
        author: "Tarun G.",
        avatar: "T",
        rating: 5,
        text: "The tasting menu is a 3-hour journey through India's flavors. Worth every penny. Book 3 weeks in advance.",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "del-2",
    name: "Bukhara",
    area: "Chanakyapuri",
    city: "Delhi",
    cuisine: "Indian",
    budget: "$$$",
    rating: 4.6,
    totalReviews: 5678,
    description:
      "ITC Maurya's flagship restaurant has been serving North-West Frontier cuisine since 1977. Bill Clinton declared their dal makhani his favorite dish. You eat with your hands here — bibs provided. It's a legendary institution.",
    topDishes: [
      "Dal Makhani",
      "Sikandari Raan",
      "Tandoori Lobster",
      "Murgh Malai Kebab",
    ],
    tags: ["Traditional", "Fine Dining", "Large Groups"],
    imageColor: "from-stone-800 to-amber-800",
    reviews: [
      {
        author: "Preethi N.",
        avatar: "P",
        rating: 5,
        text: "A meal at Bukhara is a pilgrimage. The dal has been simmering for decades and you can taste the history.",
        date: "3 days ago",
      },
      {
        author: "Sarah J.",
        avatar: "S",
        rating: 5,
        text: "The experience of eating with your hands while wearing a bib in a 5-star hotel is uniquely Bukhara. The food is genuinely extraordinary.",
        date: "1 month ago",
      },
    ],
  },
  {
    id: "del-3",
    name: "Lavaash by Saby",
    area: "Mehrauli",
    city: "Delhi",
    cuisine: "Fusion",
    budget: "$$",
    rating: 4.4,
    totalReviews: 1543,
    description:
      "Set in a stunning Mehrauli heritage haveli, Lavaash celebrates Armenian-influenced Bengali cuisine — a culinary tradition born from the Armenian community that once thrived in Kolkata. Chef Sabyasachi Gorai's menu is unlike anything else in India.",
    topDishes: [
      "Lavaash Kebab Rolls",
      "Dak Bungalow Chicken",
      "Kolkata Biryani",
      "Rose Sandesh",
    ],
    tags: ["Trendy", "Romantic", "Outdoor Seating", "Traditional"],
    imageColor: "from-rose-900 to-red-700",
    reviews: [
      {
        author: "Neel S.",
        avatar: "N",
        rating: 5,
        text: "The setting is breathtaking and the food is genuinely unique. The Armenian-Bengali fusion sounds odd but works brilliantly.",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "del-4",
    name: "Karim's",
    area: "Jama Masjid, Old Delhi",
    city: "Delhi",
    cuisine: "Indian",
    budget: "$",
    rating: 4.5,
    totalReviews: 8921,
    description:
      "Established in 1913 by Haji Karimuddin, descendant of cooks to the Mughal emperors, Karim's is Old Delhi's most iconic restaurant. The mutton dishes here follow recipes handed down through six generations. A non-negotiable Delhi experience.",
    topDishes: [
      "Mutton Korma",
      "Nalli Nihari",
      "Seekh Kebab",
      "Shahi Tukda",
    ],
    tags: ["Traditional", "Casual", "Family Friendly"],
    imageColor: "from-orange-900 to-yellow-800",
    reviews: [
      {
        author: "Harsh T.",
        avatar: "H",
        rating: 5,
        text: "The nihari is life-changing. Rich, slow-cooked, marrow-deep. This is the food that made Delhi famous.",
        date: "1 week ago",
      },
      {
        author: "Emma W.",
        avatar: "E",
        rating: 4,
        text: "Buzzy, chaotic, absolutely wonderful. The seekh kebabs are addictive. Go hungry.",
        date: "3 weeks ago",
      },
    ],
  },
  {
    id: "del-5",
    name: "Big Chill",
    area: "Khan Market",
    city: "Delhi",
    cuisine: "Italian",
    budget: "$$",
    rating: 4.3,
    totalReviews: 6234,
    description:
      "Delhi's most beloved casual Italian restaurant chain. Big Chill's retro-diner vibe, excellent pasta, and legendary dessert counter have made it an institution for Delhi's professional class. The cheesecakes alone are worth the visit.",
    topDishes: [
      "Big Chill Pasta Bake",
      "New York Cheesecake",
      "Baked Lasagna",
      "Devil's Delight Shake",
    ],
    tags: ["Casual", "Family Friendly", "Quick Bites"],
    imageColor: "from-red-800 to-red-600",
    reviews: [
      {
        author: "Riya B.",
        avatar: "R",
        rating: 5,
        text: "A Delhi institution. The pasta bake is comfort food at its finest. The queue is always worth it.",
        date: "4 days ago",
      },
    ],
  },
  // Bangalore
  {
    id: "blr-1",
    name: "Karavalli",
    area: "Shivajinagar",
    city: "Bangalore",
    cuisine: "Seafood",
    budget: "$$$",
    rating: 4.7,
    totalReviews: 2876,
    description:
      "Gateway Hotel's flagship restaurant is the gold standard for coastal Karnataka and Kerala cuisine. The thatched roof and Kerala heritage decor create an immersive atmosphere, while the menu navigates the diverse coastal cuisines of South India with authority.",
    topDishes: [
      "Neer Dosa with Crab Curry",
      "Mangalorean Gassi",
      "Kerala Prawn Moilee",
      "Coconut Pudding",
    ],
    tags: ["Traditional", "Fine Dining", "Family Friendly"],
    imageColor: "from-green-900 to-teal-800",
    reviews: [
      {
        author: "Sindhu K.",
        avatar: "S",
        rating: 5,
        text: "The neer dosa with crab curry is the most satisfying dish I've had in Bangalore. Perfect every single time.",
        date: "1 week ago",
      },
      {
        author: "Alex P.",
        avatar: "A",
        rating: 5,
        text: "Best South Indian coastal food I've found anywhere. The ambiance transports you straight to Kerala.",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "blr-2",
    name: "Arbor Brewing Company",
    area: "Indiranagar",
    city: "Bangalore",
    cuisine: "American",
    budget: "$$",
    rating: 4.2,
    totalReviews: 3102,
    description:
      "Michigan's beloved craft brewery transplanted to Bangalore's trendiest neighborhood. ABC brews all its beers on-site and serves them alongside American pub food that punches well above its weight. A Bangalore tech scene institution.",
    topDishes: [
      "The 50-Mile Burger",
      "Smoked Chicken Wings",
      "Beer Battered Fish & Chips",
      "Mac & Cheese",
    ],
    tags: ["Casual", "Large Groups", "Live Music", "Late Night"],
    imageColor: "from-yellow-900 to-amber-700",
    reviews: [
      {
        author: "Kiran M.",
        avatar: "K",
        rating: 5,
        text: "The perfect post-work spot. Great craft beers, solid food, and a relaxed vibe. The 50-Mile Burger is incredible.",
        date: "3 days ago",
      },
    ],
  },
  {
    id: "blr-3",
    name: "Brahmin's Coffee Bar",
    area: "Basavanagudi",
    city: "Bangalore",
    cuisine: "Indian",
    budget: "$",
    rating: 4.6,
    totalReviews: 7834,
    description:
      "Since 1952, Brahmin's has been serving the definitive Bangalore breakfast. Their idli-vada with tiffin sambar is legendary — arrived at through seven decades of daily refinement. Strictly morning hours; arrive early or you will queue.",
    topDishes: [
      "Idli Vada",
      "Masala Dosa",
      "Filter Coffee",
      "Kesari Bath",
    ],
    tags: ["Traditional", "Quick Bites", "Casual"],
    imageColor: "from-orange-800 to-amber-600",
    reviews: [
      {
        author: "Divya A.",
        avatar: "D",
        rating: 5,
        text: "The idli here has the perfect texture — pillowy, light, with a sambar that's been perfected over generations. Sacred.",
        date: "2 days ago",
      },
    ],
  },
  {
    id: "blr-4",
    name: "Toit",
    area: "Indiranagar",
    city: "Bangalore",
    cuisine: "Fusion",
    budget: "$$",
    rating: 4.4,
    totalReviews: 4521,
    description:
      "One of Bangalore's finest craft breweries, Toit is sprawling, vibrant, and perpetually packed. The food menu borrows from across the world while the beer menu showcases India's most exciting indigenous brewing. The rooftop is a must on dry evenings.",
    topDishes: [
      "Toit Nachos",
      "Pulled Pork Sandwich",
      "Butter Chicken Pizza",
      "Beermisu",
    ],
    tags: ["Rooftop", "Large Groups", "Casual", "Cocktail Bar", "Live Music"],
    imageColor: "from-amber-800 to-orange-600",
    reviews: [
      {
        author: "Arjun V.",
        avatar: "A",
        rating: 4,
        text: "Toit is Bangalore in a pint glass — buzzing, multicultural, unpretentious. The butter chicken pizza is an unexpected triumph.",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "blr-5",
    name: "Jamavar",
    area: "UB City",
    city: "Bangalore",
    cuisine: "Indian",
    budget: "$$$",
    rating: 4.6,
    totalReviews: 1987,
    description:
      "The LeEla Palaces' flagship restaurant brings Indian culinary grandeur to UB City's gleaming luxury mall. Chef Surender Mohan's menu is a royal journey through the subcontinent's most celebrated dishes, executed with flawless technique.",
    topDishes: [
      "Saffron & Almond Korma",
      "Jamavar Dal",
      "Tandoori Salmon",
      "Gulab Jamun Cheesecake",
    ],
    tags: ["Fine Dining", "Romantic", "Traditional"],
    imageColor: "from-yellow-900 to-orange-800",
    reviews: [
      {
        author: "Pooja N.",
        avatar: "P",
        rating: 5,
        text: "Perfect for a special occasion. The saffron korma is the finest I've had anywhere. Service is impeccable.",
        date: "3 weeks ago",
      },
    ],
  },
  // London
  {
    id: "lon-1",
    name: "Dishoom",
    area: "Covent Garden",
    city: "London",
    cuisine: "Indian",
    budget: "$$",
    rating: 4.7,
    totalReviews: 12453,
    description:
      "The most celebrated Indian restaurant in the UK, Dishoom's homage to Bombay's Irani cafés has created a cultural moment. The breakfast is revelatory, the black dal served at dinner has a cult following, and the space — all aged mirrors, ceiling fans, and vintage Bollywood posters — is a joy.",
    topDishes: [
      "Black Dal",
      "Bacon Naan Roll",
      "Pau Bhaji",
      "Chicken Ruby Murray",
    ],
    tags: ["Traditional", "Casual", "Family Friendly", "Brunch"],
    imageColor: "from-stone-800 to-terracotta-700",
    reviews: [
      {
        author: "Oliver H.",
        avatar: "O",
        rating: 5,
        text: "I've been here hundreds of times and it never loses its magic. The black dal changes you. Worth any queue.",
        date: "2 days ago",
      },
      {
        author: "Priya S.",
        avatar: "P",
        rating: 5,
        text: "As a Mumbaikar, Dishoom genuinely captures something real about the old Irani cafés. The nostalgia is real.",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "lon-2",
    name: "The Clove Club",
    area: "Shoreditch",
    city: "London",
    cuisine: "Continental",
    budget: "$$$$",
    rating: 4.8,
    totalReviews: 3241,
    description:
      "A permanent fixture on the World's 50 Best Restaurants list, The Clove Club serves tasting menus of extraordinary refinement in a converted Shoreditch Town Hall. The cooking celebrates British ingredients with rare technical brilliance.",
    topDishes: [
      "Buttermilk Fried Chicken & Pine Salt",
      "Aged Beef Tartare",
      "Cornish Crab Custard",
      "Raw Orkney Scallop",
    ],
    tags: ["Fine Dining", "Romantic", "Trendy"],
    imageColor: "from-slate-900 to-blue-900",
    reviews: [
      {
        author: "Charlotte B.",
        avatar: "C",
        rating: 5,
        text: "Genuinely transformative dining. The buttermilk fried chicken amuse bouche alone is worth the price of the tasting menu.",
        date: "1 month ago",
      },
    ],
  },
  {
    id: "lon-3",
    name: "Padella",
    area: "Borough Market",
    city: "London",
    cuisine: "Italian",
    budget: "$",
    rating: 4.6,
    totalReviews: 8765,
    description:
      "London's favorite casual Italian, Padella makes exceptional fresh pasta at prices that feel almost illegal. The pici cacio e pepe and tagliarini with 8-hour Dexter beef shin are as good as anything you'd find in Rome. Queue from the moment it opens.",
    topDishes: [
      "Pici Cacio e Pepe",
      "Tagliarini Beef Shin Ragu",
      "Ricotta Ravioli",
      "Burrata",
    ],
    tags: ["Casual", "Quick Bites", "Family Friendly"],
    imageColor: "from-green-800 to-green-600",
    reviews: [
      {
        author: "Jack R.",
        avatar: "J",
        rating: 5,
        text: "The best value meal in London. The pici cacio e pepe is better than anything I've eaten in Italy. Not kidding.",
        date: "3 days ago",
      },
      {
        author: "Elena M.",
        avatar: "E",
        rating: 5,
        text: "The pasta is silky, perfectly cooked, and generously portioned. The 45-minute queue is genuinely worth it.",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "lon-4",
    name: "Bao",
    area: "Fitzrovia",
    city: "London",
    cuisine: "Taiwanese",
    budget: "$$",
    rating: 4.5,
    totalReviews: 5432,
    description:
      "The restaurant that put Taiwanese bao into London's culinary consciousness. Bao's pillowy steamed buns filled with braised pork, confit chicken, and more have spawned a thousand imitators but none match the original. The fried horlicks ice cream is mandatory.",
    topDishes: [
      "Classic Bao",
      "Daikon Bao",
      "Fried Horlicks Ice Cream",
      "Hoisin Chicken Bao",
    ],
    tags: ["Trendy", "Casual", "Late Night"],
    imageColor: "from-pink-900 to-red-800",
    reviews: [
      {
        author: "Lucy T.",
        avatar: "L",
        rating: 5,
        text: "Addictive. The classic bao with braised pork and peanut powder is one of London's great snacks. The horlicks ice cream is genius.",
        date: "4 days ago",
      },
    ],
  },
  {
    id: "lon-5",
    name: "Hawksmoor",
    area: "Seven Dials",
    city: "London",
    cuisine: "Steakhouse",
    budget: "$$$",
    rating: 4.7,
    totalReviews: 6789,
    description:
      "Britain's finest steakhouse, full stop. Hawksmoor sources rare-breed British cattle for their dry-aged cuts and pairs them with perfect triple-cooked chips, bone marrow gravy, and one of London's best cocktail lists. A proper celebration restaurant.",
    topDishes: [
      "Porterhouse for Two",
      "Bone Marrow & Parsley Salad",
      "Triple Cooked Chips",
      "Chocolate & Salted Caramel Tart",
    ],
    tags: ["Fine Dining", "Romantic", "Cocktail Bar", "Large Groups"],
    imageColor: "from-red-950 to-stone-900",
    reviews: [
      {
        author: "George M.",
        avatar: "G",
        rating: 5,
        text: "The definitive London steak experience. The beef quality is extraordinary. The cocktails are among the best in the city.",
        date: "2 weeks ago",
      },
      {
        author: "Fatima A.",
        avatar: "F",
        rating: 5,
        text: "Took my entire team here for a leaving dinner and it was perfect. The bone marrow starter alone was worth the whole evening.",
        date: "1 month ago",
      },
    ],
  },
];
