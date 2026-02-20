import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { arenaConfig } from "@/config/arena.config";
import { Button } from "@/components/ui/button";
import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import { facilityService } from "@/features/facilities/services/facility.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Facility } from "@/features/facilities/types";
import { Tournament } from "@/features/tournaments/types";
import { ArrowRight, MapPin, Clock, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-arena.jpg";

const Index = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    facilityService.getAll().then((res) => setFacilities(res.data.slice(0, 3)));
    tournamentService.getAll().then((res) => setTournaments(res.data.slice(0, 2)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Arena" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
        </div>
        <div className="container relative z-10 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
              {arenaConfig.tagline}
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-background md:text-6xl">
              {arenaConfig.name}
            </h1>
            <p className="mt-4 text-lg text-background/80 max-w-lg">
              Book world-class facilities, join tournaments, and elevate your game at the premier sports destination.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/facilities">
                <Button size="lg" className="gap-2 font-semibold">
                  Book a Facility
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="gap-2 border-2 border-white bg-transparent text-white font-bold hover:bg-white/20 hover:text-white">
                  View Tournaments
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { icon: MapPin, label: "Facilities", value: "6+" },
            { icon: Trophy, label: "Tournaments/Year", value: "20+" },
            { icon: Clock, label: "Open Daily", value: "17hrs" },
            { icon: Trophy, label: "Teams Registered", value: "100+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <stat.icon size={24} className="mx-auto mb-2 text-primary" />
              <div className="font-display text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Our Facilities</h2>
            <p className="mt-1 text-muted-foreground">World-class venues for every sport</p>
          </div>
          <Link to="/facilities" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((f) => (
            <FacilityCard key={f.id} facility={f} />
          ))}
        </div>
      </section>

      {/* Tournaments */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Upcoming Tournaments</h2>
              <p className="mt-1 text-muted-foreground">Compete, connect, and conquer</p>
            </div>
            <Link to="/tournaments" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Play?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Book your facility today or register your team for the next tournament.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/facilities">
              <Button size="lg" variant="secondary" className="font-semibold">
                Book Now
              </Button>
            </Link>
            <Link to="/tournaments">
              <Button size="lg" variant="outline" className="gap-2 border-2 border-white bg-transparent text-white font-bold hover:bg-white/20 hover:text-white">
                Join a Tournament
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
