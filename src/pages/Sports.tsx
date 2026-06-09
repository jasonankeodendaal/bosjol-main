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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
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
          <section className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
              <div>
                <h2
                  className="text-2xl md:text-4xl font-display tracking-tight text-primary mb-4 md:mb-6 font-bold"
                  dangerouslySetInnerHTML={{ __html: sportData.storyTitle }}
                />
                <div className="w-12 h-1 bg-green rounded-full mb-6 md:mb-8" />
              </div>
              <div className="text-primary leading-relaxed text-sm md:text-base space-y-4">
                <p dangerouslySetInnerHTML={{ __html: sportData.storyText1 }} />
                <p dangerouslySetInnerHTML={{ __html: sportData.storyText2 }} />
              </div>
            </div>
          </section>

          {/* RULES & FORMS PDF SECT */}
          {sportData.pdfs && sportData.pdfs.length > 0 && (
            <section className="relative py-8 md:py-12 overflow-hidden bg-primary/5 mx-2 md:mx-10 rounded-2xl md:rounded-[2rem]">
              <div className="absolute top-1/2 -right-20 w-80 h-80 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 -z-10" />

              <div className="max-w-5xl mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <h3 className="text-lg md:text-xl font-display font-medium tracking-wide text-primary uppercase">
                    Official Documentation
                  </h3>
                  <p className="text-primary/70 font-medium text-xs md:text-sm">
                    Download necessary forms and regulations.
                  </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {sportData.pdfs.map((pdf, idx) => (
                    <motion.div
                      key={pdf.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, ease: "easeOut" }}
                    >
                      <button
                        onClick={() => openPdfInNewTab(pdf)}
                        className="group relative w-full text-left flex flex-col gap-2 bg-white/70 backdrop-blur-sm border border-primary/10 rounded-xl p-3 hover:border-green hover:bg-white hover:shadow-sm transition-all duration-300"
                      >
                         <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/5 group-hover:bg-green/5">
                            <FileText className="w-4 h-4 text-primary/40 group-hover:text-green" />
                         </div>
                         <h4 className="font-bold text-xs text-primary leading-tight line-clamp-2">
                           {pdf.title}
                         </h4>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* DYNAMIC IMAGE GALLERY */}
          {sportData.gallery && sportData.gallery.length > 0 && (
            <section className="py-8 md:py-12 px-2 md:px-10 max-w-7xl mx-auto">
              <h3 className="text-left text-sm font-display font-medium tracking-widest text-primary uppercase mb-6 opacity-80">
                Visual <span className="text-green">Archives</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {sportData.gallery.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative overflow-hidden cursor-pointer rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 aspect-square group"
                    onClick={() => setSelectedImage(img)}
                  >
                    <motion.div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.img
                      src={img}
                      loading="lazy"
                      alt={`Sport image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* VIDEO SHOWCASE */}
          <section className="relative py-16 mx-2 md:mx-10 rounded-2xl md:rounded-[2rem] mb-10 overflow-hidden flex items-center justify-center">
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
                onClick={() => {
                  if (sportData.videoFile) {
                    setSelectedVideo(sportData.videoFile);
                  }
                }}
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

          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-10"
              onClick={() => setSelectedVideo(null)}
            >
              <button
                className="absolute top-6 right-6 text-white/50 hover:text-green bg-black/50 p-2 rounded-full shadow-md transition-all z-[110]"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVideo(null);
                }}
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl relative z-[105]"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={selectedVideo}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
