export interface ArenaConfig {
  name: string;
  tagline: string;
  logo?: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  currency: string;
  locale: string;
}

export const arenaConfig: ArenaConfig = {
  name: "Apex Sports Arena",
  tagline: "Where Champions Play",
  contact: {
    email: "info@apexarena.com",
    phone: "(555) 123-4567",
    address: "1200 Championship Drive",
    city: "Austin",
    state: "TX",
    zip: "78701",
  },
  social: {
    facebook: "https://facebook.com/apexarena",
    twitter: "https://twitter.com/apexarena",
    instagram: "https://instagram.com/apexarena",
  },
  operatingHours: {
    weekday: "6:00 AM - 11:00 PM",
    weekend: "7:00 AM - 10:00 PM",
  },
  currency: "USD",
  locale: "en-US",
};
