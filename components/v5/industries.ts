import type { PhotoKey } from "./photos";

/**
 * Which finder chip an industry or role leads to. Resolved against the live
 * LMS groups/categories by name at runtime (see resolveHint in HomeV5), so a
 * renamed group id in the LMS doesn't break the mapping.
 */
export type FilterHint = "all" | "food" | "alcohol" | "harassment" | "boh" | "foh";

export type Industry = {
  key: string;
  name: string;
  /** One line under the name in the hero caption. */
  blurb: string;
  photo: PhotoKey;
  filter: FilterHint;
  /** Font Awesome class. */
  icon: string;
};

export const INDUSTRIES: Industry[] = [
  {
    key: "restaurants",
    name: "Restaurants",
    blurb: "Food handler cards, manager certification and HR compliance for the whole floor.",
    photo: "restaurant",
    filter: "food",
    icon: "fa-utensils"
  },
  {
    key: "bars",
    name: "Bars & nightlife",
    blurb: "State-approved alcohol server training — TABC, California RBS, Florida RVT and more.",
    photo: "bar",
    filter: "alcohol",
    icon: "fa-cocktail"
  },
  {
    key: "hotels",
    name: "Hotels & resorts",
    blurb: "Room service to rooftop bar: food, alcohol and harassment training in one place.",
    photo: "hotel",
    filter: "all",
    icon: "fa-concierge-bell"
  },
  {
    key: "cafes",
    name: "Cafés & quick service",
    blurb: "Fast food-handler training built for high-turnover counters and drive-thrus.",
    photo: "cafe",
    filter: "foh",
    icon: "fa-mug-hot"
  },
  {
    key: "grocery",
    name: "Grocery & convenience",
    blurb: "Deli, bakery and beer-and-wine counters covered — accepted by your health department.",
    photo: "grocery",
    filter: "food",
    icon: "fa-shopping-basket"
  },
  {
    key: "catering",
    name: "Catering & events",
    blurb: "Seasonal crews certified in an afternoon, with certificates ready before the event.",
    photo: "catering",
    filter: "all",
    icon: "fa-glass-cheers"
  }
];

export type Role = {
  name: string;
  /** What this role most often takes with us. */
  takes: string;
  photo: PhotoKey;
};

export const ROLES: Role[] = [
  { name: "Server", takes: "Food Handler · Alcohol Server", photo: "restaurant" },
  { name: "Bartender", takes: "Alcohol Server (TABC, RBS)", photo: "bar" },
  { name: "Line cook", takes: "Food Handler · Back of House", photo: "kitchen" },
  { name: "Host", takes: "Front of House · Harassment Prevention", photo: "host" },
  { name: "General manager", takes: "Food Manager · Harassment Prevention", photo: "manager" },
  { name: "Barista", takes: "Food Handler", photo: "cafe" },
  { name: "Front desk", takes: "Harassment Prevention", photo: "hotel" },
  { name: "Caterer", takes: "Food Handler · Food Manager", photo: "catering" },
  { name: "Dish & prep", takes: "Food Handler · Back of House", photo: "dishwasher" },
  { name: "Taproom server", takes: "Alcohol Server", photo: "brewery" },
  { name: "Grocery clerk", takes: "Food Handler", photo: "grocery" },
  { name: "Food truck owner", takes: "Food Manager · Food Handler", photo: "foodtruck" },
  { name: "Delivery driver", takes: "Food Handler", photo: "delivery" },
  { name: "Lounge staff", takes: "Alcohol Server · Front of House", photo: "hotelbar" }
];

/** The states most of our learners are in — quick picks under the map. */
export const POPULAR_STATES = ["TX", "CA", "FL", "NY", "IL", "AZ"];
