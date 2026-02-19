import { Facility, TimeSlot } from "./types";

export const mockFacilities: Facility[] = [
  {
    id: "f1",
    name: "Championship Court",
    type: "basketball",
    description: "Professional-grade indoor basketball court with hardwood flooring, scoreboards, and seating for 500 spectators.",
    capacity: 500,
    pricePerHour: 120,
    amenities: ["Scoreboard", "Locker rooms", "Spectator seating", "Sound system", "Air conditioning"],
    imageUrl: "/placeholder.svg",
    status: "available",
    rules: ["No food or drinks on the court", "Non-marking shoes required", "Maximum 30 players at a time"],
  },
  {
    id: "f2",
    name: "Premier Soccer Pitch",
    type: "soccer",
    description: "Full-size indoor turf soccer field with FIFA-standard dimensions and LED lighting.",
    capacity: 200,
    pricePerHour: 200,
    amenities: ["Artificial turf", "LED lighting", "Team benches", "Goal posts", "Locker rooms"],
    imageUrl: "/placeholder.svg",
    status: "available",
    rules: ["Turf shoes only", "No slide tackles", "Teams must wear matching jerseys"],
  },
  {
    id: "f3",
    name: "Ace Tennis Center",
    type: "tennis",
    description: "4 professional indoor tennis courts with cushioned surfaces and climate control.",
    capacity: 80,
    pricePerHour: 60,
    amenities: ["Climate control", "Ball machine rental", "Pro shop", "Viewing gallery"],
    imageUrl: "/placeholder.svg",
    status: "available",
  },
  {
    id: "f4",
    name: "Aquatic Center",
    type: "swimming",
    description: "Olympic-size swimming pool with 8 lanes, diving boards, and heated water.",
    capacity: 150,
    pricePerHour: 90,
    amenities: ["Heated pool", "Diving boards", "Lane dividers", "Lifeguard on duty", "Showers"],
    imageUrl: "/placeholder.svg",
    status: "available",
  },
  {
    id: "f5",
    name: "Volleyball Arena",
    type: "volleyball",
    description: "2 indoor volleyball courts with professional nets and sand court option.",
    capacity: 120,
    pricePerHour: 75,
    amenities: ["Professional nets", "Sand court", "Bleacher seating", "Scoreboard"],
    imageUrl: "/placeholder.svg",
    status: "maintenance",
  },
  {
    id: "f6",
    name: "Multi-Sport Hall",
    type: "multipurpose",
    description: "Versatile 10,000 sq ft hall configurable for badminton, futsal, or events.",
    capacity: 300,
    pricePerHour: 150,
    amenities: ["Configurable layout", "Sound system", "Stage area", "Parking"],
    imageUrl: "/placeholder.svg",
    status: "available",
  },
];

export const mockTimeSlots: TimeSlot[] = (() => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    for (let h = 6; h < 22; h++) {
      const isBooked = Math.random() < 0.3;
      slots.push({
        id: `ts-${dateStr}-${h}`,
        facilityId: "f1",
        date: dateStr,
        startTime: `${h.toString().padStart(2, "0")}:00`,
        endTime: `${(h + 1).toString().padStart(2, "0")}:00`,
        status: isBooked ? "booked" : "available",
        price: 120,
      });
    }
  }
  return slots;
})();
