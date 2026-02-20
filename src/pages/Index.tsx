import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Facility } from "@/features/facilities/types";
import { Tournament } from "@/features/tournaments/types";
import { ArrowRight, MoveRight, Trophy, Users, Smartphone, Video, ShieldCheck, Coffee } from "lucide-react";

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
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-6 md:mb-8 leading-[1.1] md:leading-[1.0] flex items-center justify-center font-display"
          >
            <TypewriterText
              texts={["Elevate your game.", "Dominate the pitch.", "Train like a pro.", "Master your craft."]}
              className="text-white block bg-clip-text"
              cursorClassName="bg-white w-[3px] md:w-[7px] h-[0.9em] md:h-[0.85em] align-middle inline-block rounded-full ml-1 md:ml-2"
              cursorChar=""
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-10 md:mb-12 font-medium tracking-tight px-4 md:px-0"
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
              className="w-full sm:w-auto px-8 py-4 sm:py-4 rounded-full bg-white text-black font-semibold tracking-tight hover:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Book a Facility
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/tournaments"
              className="w-full sm:w-auto px-8 py-4 sm:py-4 rounded-full bg-transparent border border-white/20 text-white font-semibold tracking-tight hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              Explore Tournaments
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sports Offered Marquee */}
      <section className="py-16 border-b border-white/5 overflow-hidden bg-[#020202]">
        <div className="container mx-auto px-6 mb-8 text-center text-xs font-semibold tracking-widest uppercase text-white/30">
          World-Class Facilities For
        </div>
        <div className="flex justify-center gap-8 md:gap-16 opacity-40 mix-blend-screen text-xl md:text-2xl font-bold font-display tracking-tight text-white flex-wrap text-center items-center">
          <span>BASKETBALL</span>
          <span className="text-white/20 hidden md:block">•</span>
          <span>SOCCER</span>
          <span className="text-white/20 hidden md:block">•</span>
          <span>TENNIS</span>
          <span className="text-white/20 hidden md:block">•</span>
          <span>VOLLEYBALL</span>
          <span className="text-white/20 hidden md:block">•</span>
          <span>SWIMMING</span>
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
      <section className="py-20 md:py-32 px-6 bg-[#020202]">
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
      </section>

      {/* Facilities Section */}
      <section className="py-20 md:py-32 px-6 border-t border-white/5">
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
      </section>

      {/* Tournaments Section */}
      <section className="relative py-20 md:py-32 px-6 border-t border-white/5 overflow-hidden">
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
      </section>

      {/* Footer / CTA */}
      <section className="relative py-24 md:py-48 px-6 bg-black overflow-hidden border-t border-white/5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <div className="absolute left-1/2 -top-40 -translate-x-1/2 w-[600px] h-[300px] bg-white/[0.05] blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="container mx-auto text-center max-w-3xl relative z-10"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 md:mb-6">Ready to play?</h2>
          <p className="text-lg md:text-2xl text-white/50 mb-10 md:mb-12 tracking-tight">Step into the arena. Experience sports like never before.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/facilities"
              className="inline-flex w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-semibold tracking-tight hover:scale-[0.98] transition-transform text-lg items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-black/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              Start Booking
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
