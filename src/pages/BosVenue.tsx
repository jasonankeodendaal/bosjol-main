import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { useAdmin, HeroMedia } from "../context/AdminContext";
import { openPdfInNewTab } from "../utils/openPdf";
import { useLocation, Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  FileText,
  Download,
} from "lucide-react";

function HeroMediaCarousel({ media }: { media: HeroMedia[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!media || media.length <= 1) return;

    let timeoutId: number;

    const currentMedia = media[currentIndex];
    if (currentMedia.type === "image") {
      timeoutId = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 5000);
    } else {
      timeoutId = window.setTimeout(() => {
        const videoElement = document.getElementById(
          `venue-hero-video-${currentIndex}`,
        ) as HTMLVideoElement;
        if (videoElement && videoElement.readyState < 3) {
          setCurrentIndex((prev) => (prev + 1) % media.length);
        }
      }, 8000);
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, media]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-[60vh] md:h-[80vh] overflow-hidden rounded-b-[3rem] shadow-2xl">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full filter mix-blend-multiply opacity-70 bg-black"
        >
          {media[currentIndex].type === "video" ||
          media[currentIndex].url.match(/\.(mp4|webm|ogg)$/) ||
          media[currentIndex].url.includes("video") ? (
            <video
              id={`venue-hero-video-${currentIndex}`}
              src={media[currentIndex].url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onEnded={handleNext}
            />
          ) : (
            <img
              src={media[currentIndex].url}
              alt="Venue Hero Media"
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

export default function BosVenue() {
  const { data, loading } = useAdmin();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"home" | "events" | "contact">(
    "home",
  );
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // For event modal

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "events" || tab === "contact") {
      setActiveTab((prev) => {
        if (prev !== tab) {
          window.scrollTo({ top: 0, behavior: "auto" });
          return tab;
        }
        return prev;
      });
    } else {
      setActiveTab((prev) => {
        if (prev !== "home") {
          window.scrollTo({ top: 0, behavior: "auto" });
          return "home";
        }
        return prev;
      });
    }
  }, [location]);

  if (loading) return null;

  const venue = data.bosVenue;

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedEvent]);

  const renderHome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24"
    >
      <div className="relative w-full min-h-[60vh] md:min-h-[80vh] mb-24 md:mb-32 flex flex-col justify-center">
        <HeroMediaCarousel media={venue.home.heroMedia} />
        <div className="relative z-10 flex flex-col items-center justify-center py-32 px-4 text-center mt-12 md:mt-0">
          {venue.logo ? (
            <img
              src={venue.logo}
              alt="Venue Logo"
              className="h-24 md:h-32 mb-8 object-contain drop-shadow-lg"
            />
          ) : (
            <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tight text-white drop-shadow-2xl mb-8 mt-12 md:mt-0">
              {venue.home.heroTitle}
            </h1>
          )}
          <p className="text-xl md:text-3xl font-sans font-medium text-white drop-shadow-lg">
            {venue.home.heroSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2
            className="text-4xl md:text-6xl font-display font-bold text-primary mb-8"
            dangerouslySetInnerHTML={{ __html: venue.home.storyTitle }}
          />
          <div className="w-12 h-1 bg-gradient-to-r from-green to-lime rounded-full mb-8" />
          <div className="space-y-6 text-lg text-primary font-sans">
            <p dangerouslySetInnerHTML={{ __html: venue.home.storyText1 }} />
            <p dangerouslySetInnerHTML={{ __html: venue.home.storyText2 }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {venue.home.showcaseImages.map((src, i) => (
            <motion.img
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              src={src}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover rounded-2xl shadow-lg"
              alt="Venue Showcase"
            />
          ))}
        </div>
      </div>

      {/* Side by Side Rules Section */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {venue.rules.map((rule, idx) => (
            <motion.div
              key={rule.id || idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/5"
            >
              <h3 className="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center text-green text-sm">
                  0{idx + 1}
                </div>
                {rule.title}
              </h3>
              <ul className="space-y-4">
                {rule.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-4 items-start text-primary/80 font-sans"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green mt-2 px-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PDF Downloads Section */}
      <div className="relative mb-24 overflow-hidden rounded-[3rem] mx-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${venue.bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/40" />

        <div className="relative z-10 p-12 md:p-20 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            RULES & PRICING
          </h2>
          <p className="text-white/60 font-sans text-lg mb-12 max-w-2xl mx-auto">
            Download our official documentation for detailed pricing structures
            and venue guidelines.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {venue.rulesPdfs.map((pdf, idx) => (
              <div
                key={pdf.id || idx}
                onClick={(e) => {
                  e.preventDefault();
                  openPdfInNewTab(pdf);
                }}
                className="group relative bg-white/5 cursor-pointer backdrop-blur-md border border-white/10 hover:border-green/40 p-5 rounded-2xl hover:bg-white/[0.08] transition-all duration-300 flex items-center gap-4 w-full overflow-hidden text-left"
              >
                {/* Micro accent block gradient */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Left brand line indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/10 group-hover:bg-green transition-colors duration-300" />

                {/* Compact premium thumbnail container */}
                <div className="w-12 h-16 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:bg-green/10 transition-colors duration-300">
                  {pdf.thumbnail ? (
                    <img
                      src={pdf.thumbnail}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt=""
                    />
                  ) : (
                    <FileText className="text-white/40 group-hover:text-green w-5 h-5 transition-colors duration-300" />
                  )}
                </div>

                {/* Title & metadata content */}
                <div className="flex-grow min-w-0 pr-2">
                  <span className="text-[10px] font-mono tracking-widest text-green uppercase block mb-1">
                    Official Guide
                  </span>
                  <h4 className="text-white font-sans font-semibold text-sm leading-tight group-hover:text-green transition-colors duration-300 line-clamp-2">
                    {pdf.title}
                  </h4>
                  <p className="text-white/40 text-xs font-mono mt-1.5">
                    {pdf.size || "SECURE_PDF"}
                  </p>
                </div>

                {/* High-class action arrow button */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-green group-hover:border-green group-hover:text-primary text-white transition-all duration-300">
                  <svg
                    className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 bg-primary/5 rounded-[3rem] p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green/10 rounded-full blur-[60px] pointer-events-none" />
        <h3 className="text-2xl font-display font-bold uppercase tracking-widest text-primary mb-6">
          Company Details
        </h3>
        <p className="font-sans text-xl text-primary mb-2">
          {venue.companyName}
        </p>
        <p className="font-sans text-primary/80 mb-2 flex items-center justify-center gap-2">
          <MapPin size={16} /> {venue.address}
        </p>
        <p className="font-sans text-primary/80 mb-2 flex items-center justify-center gap-2">
          <Mail size={16} />
          <a
            href={`mailto:${venue.email}`}
            className="hover:text-green transition-colors"
          >
            {venue.email}
          </a>
        </p>
        <p className="font-sans text-primary/80 mb-2 flex items-center justify-center gap-2">
          <Phone size={16} />
          <a
            href={`tel:${venue.phone}`}
            className="hover:text-green transition-colors"
          >
            {venue.phone}
          </a>
        </p>
        {data.seo.localSEO.openingHours && (
          <p className="font-sans text-primary/80 mb-8 flex items-center justify-center gap-2">
            <Clock size={16} /> {data.seo.localSEO.openingHours}
          </p>
        )}

        <div className="flex justify-center gap-6">
          {venue.socials.map((s, idx) => (
            <a
              key={s.id || idx}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all group"
            >
              {s.icon ? (
                <img
                  src={s.icon}
                  className="w-6 h-6 object-contain opacity-70 group-hover:opacity-100"
                />
              ) : (
                <div className="text-primary/70">{s.name.substring(0, 2)}</div>
              )}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderEvents = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 pt-32 px-6 max-w-7xl mx-auto min-h-[80vh]"
    >
      <div className="text-center mb-20 relative">
        <h2 className="text-6xl md:text-9xl font-display font-bold text-primary mb-4 uppercase tracking-tighter opacity-[0.03] absolute left-0 right-0 top-[-2rem] select-none pointer-events-none text-center w-full">
          History
        </h2>
        <h2 className="text-5xl md:text-7xl font-display font-bold text-primary relative z-10 uppercase tracking-tight">
          Past Events
        </h2>
        <div className="w-24 h-1.5 bg-green mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {venue.events.map((ev, idx) => (
          <motion.div
            key={ev.id || idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: idx * 0.1,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => setSelectedEvent(ev)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl mb-6">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent transition-opacity duration-500 group-hover:opacity-70" />

                  {ev.media[0] &&
                    (ev.media[0].match(/\.(mp4|webm|ogg)$/) ||
                    ev.media[0].includes("video") ? (
                      <video
                        src={ev.media[0]}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                    ) : (
                      <img
                        src={ev.media[0]}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                    ))}

              <div className="absolute bottom-10 left-10 right-10 z-20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-[2px] bg-green"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-green/90">
                    {ev.date}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight uppercase tracking-wide group-hover:text-green transition-colors">
                  {ev.title}
                </h3>
              </div>

              <div className="absolute inset-4 border border-white/10 rounded-[2rem] z-0 transition-all duration-500 group-hover:inset-6"></div>
            </div>

            <div className="px-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 text-left">
              <p className="text-primary/50 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                View Experience <ArrowLeft size={12} className="rotate-180" />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white overflow-y-auto overflow-x-hidden custom-scrollbar"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen relative flex flex-col"
            >
              {/* Header mimicking the screenshot */}
              <div className="sticky top-0 z-[110] px-6 py-4 md:px-20 md:py-8 flex justify-between items-center bg-white border-b border-primary/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-6">
                  {venue.logo && (
                    <img
                      src={venue.logo}
                      alt="Venue"
                      className="h-8 md:h-12 object-contain"
                    />
                  )}
                  <div className="w-px h-6 bg-primary/10" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-primary/40">
                    {selectedEvent.date}
                  </span>
                </div>

                <div className="flex items-center gap-12">
                  <nav className="hidden lg:flex items-center gap-8">
                    {["HOME", "SPORTS", "BOS VENUE", "GET IN TOUCH"].map(
                      (item) => (
                        <span
                          key={item}
                          className={`text-[10px] font-bold uppercase tracking-[0.3em] cursor-pointer transition-colors ${item === "BOS VENUE" ? "text-primary border-b-2 border-primary pb-1" : "text-primary/60 hover:text-primary"}`}
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </nav>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="max-w-[1400px] mx-auto w-full px-6 md:px-20 py-12">
                {/* Back Button as per request underline */}
                <div className="mb-20">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-primary/30 hover:text-primary transition-all text-sm font-medium border-b border-primary/10 pb-0.5 hover:border-primary/40"
                  >
                    back button
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-32 items-start">
                  {/* Left Column: Content */}
                  <div className="lg:col-span-7">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.2,
                        duration: 1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <div className="inline-flex items-center gap-3 mb-10 px-5 py-2 bg-primary/[0.03] rounded-full border border-primary/5">
                        <CalendarIcon size={14} className="text-primary/40" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary/60">
                          {selectedEvent.date}
                        </span>
                      </div>

                      <h2 className="text-6xl md:text-[8rem] font-display font-bold text-[#4a2e0a] mb-12 leading-[0.8] tracking-tighter uppercase whitespace-pre-line">
                        {selectedEvent.title}
                      </h2>

                      <div className="w-20 h-1 bg-[#4a2e0a] mb-20" />

                      <div
                        className="prose prose-xl md:prose-2xl font-sans text-primary/80 leading-relaxed max-w-2xl"
                        dangerouslySetInnerHTML={{
                          __html: selectedEvent.story,
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Right Column: Featured Image & Meta Info at bottom right */}
                  <div className="lg:col-span-5 flex flex-col justify-between min-h-[60vh] lg:sticky lg:top-40">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 1.2 }}
                      className="relative aspect-[3/4.5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] group"
                    >
                      {selectedEvent.media[0] &&
                        (selectedEvent.media[0].match(/\.(mp4|webm|ogg)$/) ||
                        selectedEvent.media[0].includes("video") ? (
                          <video
                            src={selectedEvent.media[0]}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <img
                            src={selectedEvent.media[0]}
                            className="w-full h-full object-cover"
                          />
                        ))}
                    </motion.div>

                    <div className="mt-20 space-y-12">
                      <div className="flex justify-between items-end border-b border-primary/5 pb-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">
                          Location
                        </p>
                        <p className="text-right text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                          {venue.companyName}
                        </p>
                      </div>
                      <div className="flex justify-between items-end border-b border-primary/5 pb-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">
                          Timeline
                        </p>
                        <p className="text-right text-[10px] font-bold text-primary/80 uppercase tracking-widest">
                          {selectedEvent.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width Gallery */}
                <div className="mt-32 md:mt-48">
                  <div className="flex items-center gap-10 mb-20">
                    <h4 className="text-primary text-xs uppercase tracking-[0.6em] font-black whitespace-nowrap">
                      Cinematic Gallery
                    </h4>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {selectedEvent.media
                      .slice(1)
                      .map((item: string, i: number) => (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (i % 3) * 0.15 }}
                          key={i}
                          className={`relative group rounded-[2.5rem] overflow-hidden shadow-2xl ${
                            i % 4 === 0
                              ? "md:col-span-2 aspect-video"
                              : "aspect-square"
                          }`}
                        >
                          {item.match(/\.(mp4|webm|ogg)$/) ||
                          item.includes("video") ? (
                            <video
                              src={item}
                              className="w-full h-full object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={item}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s] ease-out"
                            />
                          )}
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-all pointer-events-none rounded-[2.5rem] m-2"></div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                <div className="mt-40 text-center pb-20">
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex flex-col items-center gap-6 group"
                  >
                    <div className="w-px h-24 bg-gradient-to-b from-green via-primary/20 to-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-primary/40 group-hover:text-primary transition-colors">
                      Return to History
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const [venueFormData, setVenueFormData] = useState({
    name: "",
    surname: "",
    telephone: "",
    email: "",
    message: "",
  });

  const handleVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const messageLines = [
      `*New Inquiry for Bos Venue*`,
      `*Name:* ${venueFormData.name} ${venueFormData.surname}`,
      `*Phone:* +27${venueFormData.telephone}`,
      `*Email:* ${venueFormData.email}`,
      `*Message:* ${venueFormData.message}`
    ];
    
    const whatsappMessage = encodeURIComponent(messageLines.join('\n'));
    const phoneNumber = venue.phone.replace(/[^0-9+]/g, '');
    
    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
  };

  const renderContact = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 pt-32 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col md:flex-row gap-16"
    >
      <div className="flex-1 md:pr-12">
        <h2 className="text-6xl md:text-8xl font-display font-bold text-primary mb-6 leading-none tracking-tight">
          {venue.contact.title}
        </h2>
        <p className="text-2xl text-primary font-sans font-medium mb-12">
          {venue.contact.subtitle}
        </p>

        <div className="space-y-8 mt-12 bg-primary/5 p-10 rounded-[3rem]">
          <p className="font-sans text-xl text-primary mb-2">
            {venue.companyName}
          </p>
          <p className="font-sans text-lg text-primary/80 flex items-center gap-3">
            <MapPin size={24} /> {venue.address}
          </p>
          <p className="font-sans text-lg text-primary/80 flex items-center gap-3">
            <Mail size={24} />
            <a
              href={`mailto:${venue.email}`}
              className="hover:text-green transition-colors"
            >
              {venue.email}
            </a>
          </p>
          <p className="font-sans text-lg text-primary/80 flex items-center gap-3">
            <Phone size={24} />
            <a
              href={`tel:${venue.phone}`}
              className="hover:text-green transition-colors"
            >
              {venue.phone}
            </a>
          </p>
          {data.seo.localSEO.openingHours && (
            <p className="font-sans text-lg text-primary/80 flex items-center gap-3">
              <Clock size={24} /> {data.seo.localSEO.openingHours}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] p-10 shadow-xl border border-primary/5">
        <form
          className="space-y-6"
          onSubmit={handleVenueSubmit}
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
                Name
              </label>
              <input
                type="text"
                value={venueFormData.name}
                onChange={(e) => setVenueFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-primary/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
                Surname
              </label>
              <input
                type="text"
                value={venueFormData.surname}
                onChange={(e) => setVenueFormData(p => ({ ...p, surname: e.target.value }))}
                className="w-full bg-primary/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green transition-all"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
                Telephone
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 font-bold text-sm">
                  +27
                </span>
                <input
                  type="tel"
                  value={venueFormData.telephone}
                  onChange={(e) => setVenueFormData(p => ({ ...p, telephone: e.target.value }))}
                  className="w-full bg-primary/5 rounded-xl pl-14 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green transition-all"
                  placeholder="80 000 0000"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={venueFormData.email}
                onChange={(e) => setVenueFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-primary/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/70 uppercase tracking-widest mb-2">
              Message Breakdown
            </label>
            <textarea
              rows={5}
              value={venueFormData.message}
              onChange={(e) => setVenueFormData(p => ({ ...p, message: e.target.value }))}
              className="w-full bg-primary/5 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green transition-all"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-green hover:text-primary transition-colors text-sm shadow-md mt-4"
          >
            Send via WhatsApp
          </button>
        </form>
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div
        className="min-h-screen relative overflow-x-hidden"
        style={{
          backgroundColor: "var(--color-bg)",
        }}
      >
        {/* Fixed Background Image if exists */}
        {venue.bgImage && (
          <div
            className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url(${venue.bgImage})`,
            }}
          />
        )}

        <div
          className="absolute inset-0 z-0 backdrop-blur-[2px]"
          style={{
            backgroundColor: `var(--color-bg)`,
            opacity:
              (venue.bgOpacity !== undefined ? venue.bgOpacity : 80) / 100,
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {activeTab === "home" && renderHome()}
              {activeTab === "events" && renderEvents()}
              {activeTab === "contact" && renderContact()}
            </AnimatePresence>
          </div>

          {/* Tiny Venue Footer */}
          <footer className="mt-auto py-6 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between px-8 text-xs text-primary/60 font-sans tracking-wide">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              {venue.logo && (
                <img
                  src={venue.logo}
                  alt="Venue"
                  className="h-6 object-contain opacity-50"
                />
              )}
              <p>
                &copy; {new Date().getFullYear()} {venue.companyName}. All
                rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              {venue.socials.map((s, idx) => (
                <a
                  key={s.id || idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-green transition-colors flex items-center gap-1"
                >
                  {s.icon && (
                    <img src={s.icon} className="w-3 h-3 opacity-60" />
                  )}{" "}
                  {s.name}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}
