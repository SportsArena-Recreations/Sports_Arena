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
import { GlitchButton } from "@/components/ui/glitch-button";
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

      {/* How It Works Section */}
      <section className="py-20 md:py-32 px-6 bg-black relative border-t border-white/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={tournamentsBg} alt="Soccer Field" className="h-full w-full object-cover opacity-[0.15] grayscale mix-blend-luminosity" />
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-[2px]" />
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
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
                <div className="w-24 h-24 rounded-full bg-[#050505] border border-white/5 flex items-center justify-center mb-8 relative shadow-[0_0_30px_rgba(255,255,255,0.01)] transition-transform duration-500 group-hover:scale-110 group-hover:border-white/20 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-3xl font-display font-bold tracking-tighter text-white inline-block relative z-10 transition-colors">
                    {item.step}
                  </span>
                </div>
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

      {/* CTA */}
      < section className="hero-gradient py-20" >
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Play?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Book your facility today or register your team for the next tournament.
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
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
      </section >
    </div >
  );
};

export default Index;
