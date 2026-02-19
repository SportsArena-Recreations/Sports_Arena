import { TimeSlot } from "@/features/facilities/types";
import { cn } from "@/lib/utils";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot?: string;
  onSelect: (slotId: string) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSelect }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {slots.map((slot) => {
        const isAvailable = slot.status === "available";
        const isSelected = slot.id === selectedSlot;
        return (
          <button
            key={slot.id}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(slot.id)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all",
              isAvailable && !isSelected &&
                "border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer",
              isSelected &&
                "border-primary bg-primary text-primary-foreground",
              !isAvailable &&
                "border-border bg-muted/50 text-muted-foreground/40 cursor-not-allowed line-through"
            )}
          >
            <div className="text-xs">{slot.startTime}</div>
            <div className="text-[10px] opacity-70">
              {isAvailable ? `$${slot.price}` : "Booked"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
