import { useState, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { openPdfInNewTab } from "../utils/openPdf";
import { FileText, Download, Play, X } from "lucide-react";
import { useAdmin } from "../context/AdminContext";

export default function Sports() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, loading } = useAdmin();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "30%"]);

  if (loading) return null;

  const sportData = data.sportsPages?.find((s) => s.slug === slug);
  if (!sportData) {
    return <Navigate to="/" />; // or 404
  }

  return (
    <PageTransition>
      <div ref={containerRef} className="relative min-h-screen">
        {/* HERO SECTION */}
        <div className="relative w-full h-screen">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary/40 z-10" />
            <img
              src={sportData.heroImage}
              alt="Sports featured"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
            <h4 className="text-white font-sans tracking-[0.2em] font-bold uppercase text-xs mb-3 drop-shadow-md">
              {sportData.heroCategory}
            </h4>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white tracking-tight uppercase max-w-5xl drop-shadow-lg">
              {sportData.heroTitle}
            </h1>
          </div>
        </div>

        <div className="relative z-20 pt-10">
          {/* THE STORY BEHIND IT */}
          <section className="max-w-3xl mx-auto px-6 py-24">
            <h2
              className="text-4xl md:text-5xl font-display tracking-tight text-primary mb-10 font-bold"
              dangerouslySetInnerHTML={{ __html: sportData.storyTitle }}
            />
            <div className="w-16 h-1 bg-green rounded-full mb-10" />

            <div className="text-primary leading-relaxed text-lg space-y-8">
              <p dangerouslySetInnerHTML={{ __html: sportData.storyText1 }} />
              <p dangerouslySetInnerHTML={{ __html: sportData.storyText2 }} />
            </div>
          </section>

          {/* RULES & FORMS PDF SECT */}
          {sportData.pdfs && sportData.pdfs.length > 0 && (
            <section className="relative py-16 overflow-hidden bg-primary/5 mx-4 md:mx-10 rounded-[3rem]">
              <div className="absolute top-1/2 -right-20 w-80 h-80 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 -z-10" />

              <div className="max-w-4xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-10"
                >
                  <h3 className="text-2xl font-display font-medium tracking-wide text-primary uppercase mb-2">
                    Official Documentation
                  </h3>
                  <p className="text-primary font-medium text-base">
                    Download necessary forms, regulations, and tournament
                    brackets.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sportData.pdfs.map((pdf, idx) => (
                    <motion.div
                      key={pdf.id || idx}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, ease: "easeOut" }}
                    >
                      <button
                        onClick={() => openPdfInNewTab(pdf)}
                        className="group relative w-full text-left flex items-center gap-4 bg-white/70 backdrop-blur-sm border border-primary/10 rounded-xl p-4 hover:border-green hover:bg-white hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                      >
                        {/* Interactive Accent Indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/10 group-hover:bg-green transition-colors duration-300" />
                        
                        {/* Elite Minimal Thumbnail Case */}
                        <div className="w-12 h-16 bg-primary/5 rounded-lg flex-shrink-0 flex items-center justify-center border border-primary/5 relative overflow-hidden group-hover:bg-green/5 transition-colors duration-300">
                          {pdf.thumbnail ? (
                            <img
                              src={pdf.thumbnail}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt=""
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-primary/40 group-hover:text-green transition-colors duration-300" />
                          )}
                        </div>

                        {/* Text and meta descriptors */}
                        <div className="flex-grow min-w-0 pr-2">
                          <span className="text-[10px] font-mono tracking-widest text-primary/50 uppercase block mb-1 font-bold">
                            DOC-{String(idx + 1).padStart(2, "0")}
                          </span>
                          <h4 className="font-bold text-sm text-primary leading-tight line-clamp-2 group-hover:text-green transition-colors duration-200">
                            {pdf.title}
                          </h4>
                          <span className="text-xs text-primary/50 font-mono block mt-1.5">
                            {pdf.size || "SECURE PDF"}
                          </span>
                        </div>

                        {/* Action icon indicator */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-primary/5 flex items-center justify-center bg-primary/5 group-hover:bg-green group-hover:border-green group-hover:text-primary text-primary transition-all duration-300">
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* DYNAMIC IMAGE GALLERY */}
          {sportData.gallery && sportData.gallery.length > 0 && (
            <section className="py-20 px-6 max-w-6xl mx-auto">
              <h3 className="text-center text-xl font-display font-medium tracking-widest text-primary uppercase mb-10 opacity-80">
                Visual <span className="text-green">Archives</span>
              </h3>

              <div className="flex flex-wrap gap-4 justify-center">
                {sportData.gallery.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className={`relative overflow-hidden cursor-pointer rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 ${
                      idx === 0 || idx === 3
                        ? "w-full md:w-[58%]"
                        : "w-full md:w-[38%]"
                    } h-[250px] md:h-[300px] group`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <motion.div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <motion.img
                      src={img}
                      loading="lazy"
                      alt={`Sport image ${idx + 1}`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7 }}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* VIDEO SHOWCASE */}
          <section className="relative py-24 mx-4 md:mx-10 rounded-[3rem] mb-10 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-primary z-0" />

            {sportData.videoBg &&
            (sportData.videoBg.includes("video") ||
              sportData.videoBg.endsWith(".mp4")) ? (
              <video
                src={sportData.videoBg}
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px] mix-blend-luminosity z-0"
                autoPlay
                muted
                loop
              />
            ) : (
              <img
                src={sportData.videoBg}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px] mix-blend-luminosity z-0"
                alt="Video Background"
              />
            )}

            <div className="relative z-20 text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-20 h-20 bg-lime rounded-full shadow-[0_0_30px_rgba(214,224,26,0.4)] flex items-center justify-center mx-auto mb-6 cursor-pointer hover:scale-110 transition-transform duration-300"
              >
                <Play
                  className="w-8 h-8 text-primary pl-1"
                  fill="currentColor"
                />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-display font-medium uppercase tracking-wide text-white">
                {sportData.videoText}
              </h3>
              <p className="mt-2 text-white/90 text-sm tracking-widest uppercase">
                {sportData.videoSubtext}
              </p>
            </div>
          </section>
        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl p-4 sm:p-10"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-6 right-6 text-primary/50 hover:text-green bg-white p-2 rounded-full shadow-md transition-all z-[110]"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X size={24} />
              </button>

              <motion.img
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                src={selectedImage}
                alt="Enlarged"
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-3xl shadow-2xl ring-1 ring-primary/5 relative z-[105]"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
