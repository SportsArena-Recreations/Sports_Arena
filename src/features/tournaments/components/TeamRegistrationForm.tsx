import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface TeamRegistrationFormProps {
  tournamentName: string;
  entryFee: number;
}

export function TeamRegistrationForm({ tournamentName, entryFee }: TeamRegistrationFormProps) {
  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    playerCount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Submitted!",
      description: `Team "${formData.teamName}" has been registered for ${tournamentName}.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-display font-semibold mb-1">Registration Fee</h4>
        <p className="text-2xl font-bold text-primary">{entryFee === 0 ? "Free" : `₦${entryFee.toLocaleString()}`}</p>
      </div>

      <div>
        <Label htmlFor="teamName">Team Name</Label>
        <Input id="teamName" value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="captainName">Captain Name</Label>
          <Input id="captainName" value={formData.captainName} onChange={(e) => setFormData({ ...formData, captainName: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="captainEmail">Captain Email</Label>
          <Input id="captainEmail" type="email" value={formData.captainEmail} onChange={(e) => setFormData({ ...formData, captainEmail: e.target.value })} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="captainPhone">Phone</Label>
          <Input id="captainPhone" value={formData.captainPhone} onChange={(e) => setFormData({ ...formData, captainPhone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="playerCount">Number of Players</Label>
          <Input id="playerCount" type="number" min="2" value={formData.playerCount} onChange={(e) => setFormData({ ...formData, playerCount: e.target.value })} required />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Register Team
      </Button>
    </form>
  );
}
