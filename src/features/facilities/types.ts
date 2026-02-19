export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  description: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  imageUrl: string;
  status: "available" | "maintenance" | "closed";
  rules?: string[];
}

export type FacilityType =
  | "basketball"
  | "soccer"
  | "tennis"
  | "volleyball"
  | "swimming"
  | "badminton"
  | "multipurpose";

export interface TimeSlot {
  id: string;
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  price: number;
}
