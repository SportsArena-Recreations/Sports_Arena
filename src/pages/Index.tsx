import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Facility } from "@/features/facilities/types";
import { Tournament } from "@/features/tournaments/types";
import { ArrowRight, MoveRight, Trophy, Users, Smartphone, Video, ShieldCheck, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { arenaConfig } from "@/config/arena.config";

import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import { TypewriterText } from "@/components/ui/typewriter-text";
import heroImage from "@/assets/african_sports_hero.png";
import tournamentsBg from "@/assets/african_soccer_sunny.png";

const features = [
  { icon: Trophy, title: "Pro-Level Tournaments", desc: "Compete in properly organized leagues and knockout tournaments featuring top regional talents." },
  { icon: Video, title: "Match Highlights", desc: "Select arenas equipped with AI cameras that automatically record and clip your best plays." },
  { icon: ShieldCheck, title: "Certified Referees", desc: "Every official match is handled by certified, professional referees to ensure fair play." },
  { icon: Users, title: "Find Opponents", desc: "Can't find a team? Join our community and instantly match with teams of similar skill." },
  { icon: Smartphone, title: "Seamless Booking", desc: "Book courts and fields instantly through our platform with zero hidden fees." },
  { icon: Coffee, title: "VIP Lounges", desc: "Unwind after an intense session in our premium recovery lounges and cafes." },
];

const Index = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    facilityService.getAll().then((res) => setFacilities(res.data.slice(0, 3)));
    tournamentService.getAll().then((res) => setTournaments(res.data.slice(0, 2)));
  }, []);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-white/30 font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6 overflow-hidden flex items-center min-h-[90vh]">
        <div className="absolute inset-0 z-0 selection:bg-transparent">
          <img src={heroImage} alt="African Athletes" className="h-full w-full object-cover opacity-[0.4] grayscale mix-blend-overlay" />
          {/* Gradient that is solid black at the bottom and fades to transparent past the middle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 uppercase tracking-[0.2em] text-xs font-semibold text-white/50"
          >
            The Premier Sports Destination
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center"
          >
            <span className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent">
              {arenaConfig.tagline}
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white">
              {arenaConfig.name}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl text-center leading-relaxed">
              Book world-class facilities, join tournaments, and elevate your game at the premier sports destination.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link to="/facilities">
                <Button size="lg" className="gap-2 font-semibold bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] transition-all">
                  Book a Facility
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="gap-2 border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 rounded-full px-8 py-6 text-lg transition-colors backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.02)]">
                  View Tournaments
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 md:py-20 bg-[#060606] border-b border-white/5"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0 divide-x-0 md:divide-x divide-white/10 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-white">6+</div>
              <div className="text-xs font-semibold text-white/40 tracking-widest uppercase">Premium Facilities</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-white">20+</div>
              <div className="text-xs font-semibold text-white/40 tracking-widest uppercase">Tournaments / Year</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-white">17<span className="text-2xl">h</span></div>
              <div className="text-xs font-semibold text-white/40 tracking-widest uppercase">Open Daily</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-white">100+</div>
              <div className="text-xs font-semibold text-white/40 tracking-widest uppercase">Teams Registered</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      < section className="py-20 md:py-32 px-6 bg-[#020202]" >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-left md:text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 relative inline-block">
              Built for champions.
            </h2>
            <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto tracking-tight">Everything you need to perform at your highest level, all in one place.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative p-8 md:p-10 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors duration-500 overflow-hidden flex flex-col items-start"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="h-16 w-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-8 text-white shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500 ease-out relative z-10">
                  <feature.icon size={28} strokeWidth={1.5} className="opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <h3 className="text-2xl font-semibold tracking-tight mb-4 text-white relative z-10 group-hover:text-white transition-colors duration-500">
                  {feature.title}
                </h3>

                <p className="text-white/40 leading-relaxed text-sm md:text-base relative z-10 group-hover:text-white/60 transition-colors duration-500">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Facilities Section */}
      < section className="py-20 md:py-32 px-6 border-t border-white/5" >
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">The Venues.</h2>
              <p className="text-xl md:text-2xl text-white/50 tracking-tight">Engineered for peak performance.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/facilities" className="text-white hover:text-white/70 transition-colors flex items-center gap-2 font-medium tracking-tight">
                View all venues <MoveRight size={18} />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {facilities.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <FacilityCard facility={f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Tournaments Section */}
      < section className="relative py-20 md:py-32 px-6 border-t border-white/5 overflow-hidden" >
        <div className="absolute inset-0 z-0">
          <img src={tournamentsBg} alt="Soccer Field" className="h-full w-full object-cover opacity-[0.15] grayscale mix-blend-luminosity" />
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-[2px]" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Competitions.</h2>
              <p className="text-xl md:text-2xl text-white/50 tracking-tight">Prove your worth on the biggest stage.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/tournaments" className="text-white hover:text-white/70 transition-colors flex items-center gap-2 font-medium tracking-tight">
                View all tournaments <MoveRight size={18} />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {tournaments.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <TournamentCard tournament={t} />
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA */}
      < section className="hero-gradient py-20" >
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
      </section >
    </div >
  );
};

export default Index;
