import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface BookingFormProps {
  facilityName: string;
  selectedSlot?: { date: string; startTime: string; endTime: string; price: number };
}

export function BookingForm({ facilityName, selectedSlot }: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Booking Submitted!",
      description: `Your booking for ${facilityName} on ${selectedSlot?.date} at ${selectedSlot?.startTime} has been submitted.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-display font-semibold mb-2">Booking Summary</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Facility: {facilityName}</p>
          {selectedSlot ? (
            <>
              <p>Date: {selectedSlot.date}</p>
              <p>Time: {selectedSlot.startTime} - {selectedSlot.endTime}</p>
              <p className="font-semibold text-foreground">Total: ₦{selectedSlot.price.toLocaleString("en-NG")}</p>
            </>
          ) : (
            <p className="text-warning">Please select a time slot above</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      </div>
      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
      </div>

      <Button type="submit" className="w-full" disabled={!selectedSlot}>
        Confirm Booking
      </Button>
    </form>
  );
}
