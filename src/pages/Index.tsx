import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { facilityService } from "@/features/facilities/services/facility.service";
import { tournamentService } from "@/features/tournaments/services/tournament.service";
import { Facility } from "@/features/facilities/types";
import { Tournament } from "@/features/tournaments/types";
import { ArrowRight, MoveRight, Trophy, Users, Smartphone, Dumbbell, ShieldCheck, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { arenaConfig } from "@/config/arena.config";

import { FacilityCard } from "@/features/facilities/components/FacilityCard";
import { TournamentCard } from "@/features/tournaments/components/TournamentCard";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { GlitchButton } from "@/components/ui/glitch-button";
import { RollingBall } from "@/components/ui/rolling-ball";
import heroImage from "@/assets/african_sports_hero.png";
import tournamentsBg from "@/assets/african_soccer_sunny.png";
import proTournamentsBg from "@/assets/pro_tournaments_bg.png";
import certifiedRefereesBg from "@/assets/certified_referees_bg.png";
import { Footer } from "@/components/layout/Footer";

const features = [
  { icon: Trophy, title: "Pro-Level Tournaments", desc: "Compete in properly organized leagues and knockout tournaments featuring top regional talents." },
  { icon: Dumbbell, title: "Pro-Grade Gear", desc: "Don't want to carry your gear? Rent professional-grade balls, bibs, and rackets directly at the venue." },
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
      <section className="relative pt-[120px] pb-10 px-6 overflow-hidden flex flex-col items-center min-h-[100dvh]">
        <div className="absolute inset-0 z-0 selection:bg-transparent">
          <img src={heroImage} alt="African Athletes" className="h-full w-full object-cover opacity-[0.4] grayscale mix-blend-overlay" />
          {/* Gradient that is solid black at the bottom and fades to transparent past the middle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center justify-between flex-1 w-full flex-grow">
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
            className="flex flex-col items-center justify-center flex-1 w-full"
          >
            <span className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm border border-white/10">
              {arenaConfig.tagline}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-white mb-8 md:mb-12 font-bold tracking-tight whitespace-nowrap min-h-[1.2em] flex items-center justify-center">
              <TypewriterText
                texts={["Elevate your game.", "Dominate the pitch.", "Train like a pro.", "Master your craft."]}
                className="inline-block"
                cursorClassName="bg-white/90 w-[4px] md:w-[5px] h-[0.85em] align-middle inline-block rounded-full ml-1 md:ml-2"
                cursorChar=""
              />
            </h1>
            <p className="text-lg md:text-2xl text-white/50 max-w-2xl text-center leading-relaxed">
              Book world-class facilities and join premium tournaments. Built to inspire athletes across Africa and beyond.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mt-auto pt-16"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full px-4 sm:px-0">
              <Link to="/facilities" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 text-sm font-semibold tracking-widest uppercase bg-transparent text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-full px-8 transition-all flex justify-center items-center shadow-none">
                  Book a Facility <ArrowRight size={16} className="ml-3" />
                </button>
              </Link>
              <Link to="/tournaments" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 text-sm font-semibold tracking-widest uppercase bg-transparent text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-full px-8 transition-all flex justify-center items-center shadow-none">
                  Explore Tournaments
                </button>
              </Link>
            </div>
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
        </div>
      </section>

      {/* Live Arena Pulse Replacement */}
      <section className="py-16 md:py-24 bg-[#050505] border-b border-white/5 relative overflow-hidden cursor-default">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">

            {/* Live Status Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full md:w-1/3 flex-shrink-0 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-green-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse" />
                </div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 border border-white/10 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md">
                  Live Feed
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Arena Pulse</h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed">Real-time status of our courts and facilities.</p>
              </div>
            </motion.div>

            {/* Scrolling Activity Tickers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full bg-[#080808] border border-white/5 rounded-3xl p-6 relative overflow-hidden min-h-[220px] flex flex-col justify-center gap-5"
            >
              <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-[#080808] to-transparent z-10 pointer-events-none" />

              {/* Ticker Row 1 */}
              <motion.div
                className="flex gap-5 whitespace-nowrap items-center w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={`row1-${i}`} className="flex gap-5 items-center text-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-white/[0.03] border border-white/5 px-5 py-3 rounded-2xl text-white/80 transition-colors hover:bg-white/[0.05]">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Court 1</span>
                      <span>Football Match in Progress</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-white/[0.03] border border-white/5 px-5 py-3 rounded-2xl text-white/80 transition-colors hover:bg-white/[0.05]">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Court 2</span>
                      <span>Private Basketball Session</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      <span className="text-[10px] font-bold tracking-widest text-green-500/50 uppercase">Court 3</span>
                      <span>Available to Book</span>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Ticker Row 2 (Moves Opposite Direction) */}
              <motion.div
                className="flex gap-5 whitespace-nowrap items-center w-max"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={`row2-${i}`} className="flex gap-5 items-center text-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-white/[0.03] border border-white/5 px-5 py-3 rounded-2xl text-white/80 transition-colors hover:bg-white/[0.05]">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Main Pitch</span>
                      <span>Tournament Final • 20:00</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      <span className="text-[10px] font-bold tracking-widest text-green-500/50 uppercase">Tennis 1</span>
                      <span>Available to Book</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 bg-white/[0.03] border border-white/5 px-5 py-3 rounded-2xl text-white/80 transition-colors hover:bg-white/[0.05]">
                      <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">VIP Lounge</span>
                      <span>At capacity</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:auto-rows-[280px]">
            {/* 1. Pro-Level Tournaments (Large 2x2 Feature) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 lg:row-span-2 rounded-[2rem] border border-white/10 p-10 md:p-12 relative overflow-hidden group flex flex-col justify-end min-h-[400px]"
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0">
                <img
                  src={proTournamentsBg}
                  alt="Pro Tournaments"
                  className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity group-hover:scale-105 group-hover:opacity-50 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none" />

              <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 z-10">
                <Trophy size={120} strokeWidth={1} />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white relative z-20 group-hover:text-white/90 transition-colors">{features[0].title}</h3>
              <p className="text-white/60 text-lg md:text-xl relative z-20 max-w-sm">{features[0].desc}</p>
            </motion.div>

            {/* 2. Pro-Grade Gear (Wide 2x1) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 lg:row-span-1 rounded-[2rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-10 relative overflow-hidden group flex items-start flex-col justify-center"
            >
              <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-30 group-hover:-translate-y-4 transition-all duration-700">
                <Dumbbell size={140} strokeWidth={0.5} />
              </div>
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-6 backdrop-blur-md relative z-10 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                <Dumbbell size={20} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-white relative z-10 mt-auto">{features[1].title}</h3>
              <p className="text-white/50 text-sm md:text-base relative z-10 max-w-sm">{features[1].desc}</p>
            </motion.div>

            {/* 3. Certified Referees (Block 1x1) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-1 lg:row-span-1 rounded-[2rem] border border-white/10 p-8 relative overflow-hidden group flex flex-col justify-between"
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0">
                <img
                  src={certifiedRefereesBg}
                  alt="Certified Referees"
                  className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
              </div>

              <ShieldCheck size={32} className="text-white/80 group-hover:text-white transition-colors relative z-10" strokeWidth={1.5} />
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight mb-2 text-white">{features[2].title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{features[2].desc}</p>
              </div>
            </motion.div>

            {/* 4. Find Opponents (Block 1x1 Dashed) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-1 lg:row-span-1 rounded-[2rem] bg-transparent border border-dashed border-white/30 p-8 relative overflow-hidden group flex flex-col justify-between hover:border-white/60 hover:bg-white/[0.03] transition-colors"
            >
              <Users size={32} className="text-white/80" strokeWidth={1.5} />
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-white">{features[3].title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{features[3].desc}</p>
              </div>
            </motion.div>

            {/* 5. Seamless Booking (Wide 2x1) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 lg:row-span-1 rounded-[2rem] bg-[#050505] border border-white/5 p-8 relative overflow-hidden group flex items-center gap-8 hover:border-white/10 transition-colors"
            >
              <div className="hidden sm:flex h-24 w-24 rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 items-center justify-center text-white flex-shrink-0 group-hover:rotate-6 transition-transform duration-500">
                <Smartphone size={40} strokeWidth={1} />
              </div>
              <div>
                <div className="sm:hidden mb-4 bg-white/10 w-fit p-3 rounded-xl"><Smartphone size={24} /></div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">{features[4].title}</h3>
                <p className="text-white/50 text-sm md:text-base">{features[4].desc}</p>
              </div>
            </motion.div>

            {/* 6. VIP Lounges (Wide 2x1) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 lg:row-span-1 rounded-[2rem] bg-gradient-to-r from-[#020202] to-[#111] border border-white/5 p-8 relative overflow-hidden group flex flex-col sm:flex-row justify-between sm:items-center gap-6"
            >
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">{features[5].title}</h3>
                <p className="text-white/50 text-sm md:text-base max-w-xs">{features[5].desc}</p>
              </div>
              <div className="h-16 w-16 bg-white border border-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-500">
                <Coffee size={24} strokeWidth={2} />
              </div>
            </motion.div>
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

          <div className="relative w-full overflow-hidden flex flex-col justify-center py-10 -mx-6 px-6">
            {/* Extended Dark Masking Edges for deep fade out */}
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-80 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 md:w-80 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />

            {/* Auto-scrolling Infinite Marquee */}
            <motion.div
              className="flex gap-6 md:gap-8 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            >
              {[...facilities, ...facilities, ...facilities, ...facilities, ...facilities].map((f, i) => (
                <div key={`${f.id}-${i}`} className="w-[320px] md:w-[450px] flex-shrink-0 group/card">
                  <FacilityCard facility={f} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section >

      {/* How It Works Section */}
      <section className="py-20 md:py-32 px-6 bg-black relative overflow-hidden">
        {/* Background Image with Smooth Edge Fades */}
        <div className="absolute inset-0 z-0">
          <img src={tournamentsBg} alt="Soccer Field" className="h-full w-full object-cover opacity-[0.15] grayscale mix-blend-luminosity" />
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
        </div>

        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-white/[0.01] blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-white/[0.015] blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 relative inline-block text-white">
                How it works.
              </h2>
              <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto tracking-tight">From your phone to the court in three simple steps.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative px-4 md:px-0">
            {/* Connecting Track & Rolling Ball (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[16.66%] right-[16.66%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent">
              {/* Rolling 8-Ball */}
              <RollingBall
                initial={{ left: "0%" }}
                whileInView={{ left: ["0%", "0%", "50%", "50%", "100%", "100%", "50%", "0%"] }}
                viewport={{ margin: "-50px" }}
                transition={{
                  duration: 6,
                  times: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 0.925, 1],
                  ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "linear", "linear"],
                  repeat: Infinity,
                }}
              />
            </div>

            {[
              {
                step: "01",
                title: "Find your arena",
                desc: "Browse through our network of premium, verified sports facilities in your area."
              },
              {
                step: "02",
                title: "Book your slot",
                desc: "Select your preferred date and time. Book instantly with zero hidden fees."
              },
              {
                step: "03",
                title: "Play the game",
                desc: "Arrive at the venue, present your digital pass, and dominate the match."
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 mb-8" />
                <h3 className="text-2xl font-bold tracking-tight mb-4 text-white group-hover:text-white/90 transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/40 leading-relaxed text-sm md:text-base max-w-[280px]">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fade-in wrapper for CTA and Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* CTA */}
        <section className="bg-gradient-to-b from-black to-card py-24 md:py-32 relative overflow-hidden">
          <div className="container text-center relative z-10">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl tracking-tighter">
              Ready to Play?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/60 text-lg">
              Book your facility today or register your team for the next tournament.
            </p>
            <div className="mt-10 flex justify-center items-center gap-4">
              <Link to="/facilities">
                <Button size="lg" variant="secondary" className="font-semibold px-8 py-6 rounded-full text-lg shadow-xl shadow-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 bg-black text-white hover:text-white transition-all">
                  Book Now
                </Button>
              </Link>
              <Link to="/tournaments" className="-mt-1">
                <GlitchButton>
                  Join a Tournament
                </GlitchButton>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </motion.div>
    </div>
  );
};

export default Index;
