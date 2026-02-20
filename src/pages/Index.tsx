import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Facility } from "@/features/facilities/types";
import { Tournament } from "@/features/tournaments/types";
import { ArrowRight, MoveRight } from "lucide-react";

import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import heroImage from "@/assets/african_sports_hero.png";

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
          <img src={heroImage} alt="African Athletes" className="h-full w-full object-cover opacity-[0.25] grayscale mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 uppercase tracking-[0.2em] text-xs font-semibold text-white/50"
          >
            The Premier Sports Destination
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter mb-8 leading-[0.95]"
          >
            Elevate your game.
            <br className="hidden md:block" />
            <span className="text-white/40">Master your craft.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 font-medium tracking-tight"
          >
            Book world-class facilities and join premium tournaments. Built to inspire athletes across Africa and beyond.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/facilities"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold tracking-tight hover:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Book a Facility
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/tournaments"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-semibold tracking-tight hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              Explore Tournaments
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-16 border-y border-white/10"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
            <div>
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">6+</div>
              <div className="text-xs md:text-sm font-medium text-white/50 tracking-wide uppercase">Premium Facilities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">20+</div>
              <div className="text-xs md:text-sm font-medium text-white/50 tracking-wide uppercase">Tournaments / Year</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">17<span className="text-2xl">h</span></div>
              <div className="text-xs md:text-sm font-medium text-white/50 tracking-wide uppercase">Open Daily</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">100+</div>
              <div className="text-xs md:text-sm font-medium text-white/50 tracking-wide uppercase">Teams Registered</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Facilities Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">The Facilities.</h2>
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
      </section>

      {/* Tournaments Section */}
      <section className="py-24 md:py-32 px-6 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
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
      </section>

      {/* Footer / CTA */}
      <section className="py-32 md:py-48 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="container mx-auto text-center max-w-3xl"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Ready to play?</h2>
          <p className="text-xl md:text-2xl text-white/50 mb-12 tracking-tight">Step into the arena. Experience sports like never before.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/facilities"
              className="inline-flex w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-semibold tracking-tight hover:scale-[0.98] transition-transform text-lg items-center justify-center"
            >
              Start Booking
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
