import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { PageTransition } from '../components/PageTransition';
import { BrandLogoStrip } from '../components/BrandLogoStrip';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin, HeroMedia } from '../context/AdminContext';

function HeroMediaCarousel({ media }: { media: HeroMedia[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!media || media.length <= 1) return;

    let timeoutId: number;

    const currentMedia = media[currentIndex];
    // We handle the auto-advance logic based on media type.
    // If it's a video, the onEnded event will trigger the next slide.
    // However, if the video fails to load or play, we need a fallback.
    // Wait, the prompt says "auto play video start to finish and loop slowly between all images and videos".
    if (currentMedia.type === 'image') {
      timeoutId = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 5000); // 5 seconds for images
    } else {
       // if it's video, we rely on the video's onEnded event. But add a safety timeout just in case it's broken.
       timeoutId = window.setTimeout(() => {
          const videoElement = document.getElementById(`hero-video-${currentIndex}`) as HTMLVideoElement;
          if (videoElement && videoElement.readyState < 3) {
            // Video hasn't loaded / couldn't play, switch immediately
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
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
           key={currentIndex}
           initial={{ opacity: 0, scale: 1.05 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
           className="absolute inset-0 w-full h-full filter mix-blend-multiply opacity-50"
        >
          {media[currentIndex].type === 'video' || media[currentIndex].url.match(/\.(mp4|webm|ogg)$/) || media[currentIndex].url.includes('video') ? (
            <video
              id={`hero-video-${currentIndex}`}
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
              alt="Hero Media" 
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const { data, loading } = useAdmin();

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const milestonesRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (milestonesRef.current) {
      const { scrollLeft, clientWidth } = milestonesRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      milestonesRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) return null;

  return (
    <PageTransition>
      <div ref={containerRef} className="relative min-h-[150vh]">
        
        {/* HERO SECTION */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="h-screen relative w-full overflow-hidden flex items-center justify-center pt-16"
        >
          {/* Background image overlay */}
          <div className="absolute inset-0 bg-white/40 z-10" />
          <HeroMediaCarousel media={data.home.heroMedia} />
          
          {/* Hero Content */}
          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold tracking-tighter leading-none mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-700 to-green drop-shadow-sm uppercase py-2"
              dangerouslySetInnerHTML={{ __html: data.home.heroTitle }}
            />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg md:text-2xl font-serif italic text-primary max-w-2xl mx-auto mb-10 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white/50"
              dangerouslySetInnerHTML={{ __html: data.home.heroSubtitle }}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
            >
              <Link 
                to="/sports" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:shadow-green/20 transition-all duration-300"
              >
                {/* Button background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green to-lime transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />
                
                <span className="relative z-10 font-display tracking-widest uppercase text-sm font-medium">
                  Explore Sports
                </span>
                <ArrowRight className="relative z-10 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <BrandLogoStrip logos={data.home.brandLogos} />

        {/* MEET THE OWNER SECTION (FREE VIEW) */}
        <div className="relative z-20 pt-24 pb-24">
          {/* Intro block */}
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] w-full max-w-[500px] mx-auto md:mx-0 group"
            >
              <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 -z-10" />
              <img 
                src={data.home.ownerImage} 
                alt="Owner"
                loading="lazy"
                className="w-full h-full object-cover rounded-[4rem] shadow-2xl relative z-10"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl md:text-5xl font-display font-medium text-primary tracking-wide leading-tight">
                <span className="text-green uppercase text-xs tracking-[0.3em] block mb-2 font-bold">The Vision</span>
                {data.home.ownerTitle}
              </h2>
              
              <div className="w-12 h-1 bg-gradient-to-r from-green to-lime rounded-full" />
              
              <div className="space-y-4 text-primary/90 leading-relaxed text-sm md:text-base">
                <p dangerouslySetInnerHTML={{ __html: data.home.ownerText1 }} />
                <p className="italic font-medium text-primary border-l-4 border-lime pl-4" dangerouslySetInnerHTML={{ __html: data.home.ownerText2 }} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* SPLIT SECTION FADE */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center">
           <div className="absolute inset-0 bg-purple-900 z-0" />
           <motion.img 
             initial={{ scale: 1.2 }}
             whileInView={{ scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.5 }}
             src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop"
             className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay filter blur-[2px]"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-900/20 to-white z-10" />
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ duration: 0.8 }}
             className="relative z-20 text-center px-6"
           >
             <h3 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold text-white uppercase tracking-widest drop-shadow-lg">
               A Legacy in <span className="text-green text-shadow-sm">Motion</span>
             </h3>
           </motion.div>
        </div>

        {/* STORY MAP SECTION (REDESIGNED FREE VIEW) */}
        <div className="relative z-20 pt-16 pb-32">
          <div className="max-w-6xl mx-auto px-6 overflow-hidden">
            <div className="text-center mb-16 relative z-20">
               <motion.span 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="text-green uppercase text-xs tracking-[0.4em] font-bold block mb-4"
               >
                 Our Journey
               </motion.span>
              <h3 className="text-4xl md:text-6xl font-display font-medium text-primary tracking-tight">Growth Story</h3>
            </div>

            <div className="relative">
               <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/50 backdrop-blur-sm p-3 rounded-full md:hidden shadow-lg"
              >
                 <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              
              <div ref={milestonesRef} className="flex md:flex-col overflow-x-auto md:overflow-visible gap-8 md:gap-24 relative pb-8 md:pb-0 scroll-smooth md:px-0 px-6 md:snap-none snap-x snap-mandatory">
                {data.home.milestones.map((item, idx) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex-none w-[80vw] snap-center md:w-full flex flex-col md:flex-row items-center gap-8 md:gap-20 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''} relative z-10`}
                >
                  {/* Refined Year Text Overlay (Filled 3D Effect) */}
                  <div 
                    className={`absolute top-1/2 -translate-y-1/2 font-display font-bold text-6xl md:text-8xl lg:text-9xl text-primary/[0.05] select-none pointer-events-none z-0 transform ${idx % 2 !== 0 ? '-left-2' : '-right-2'}`}
                    style={{ 
                      WebkitTextStroke: '1px rgba(0,0,0,0.05)', 
                      filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.05))',
                      userSelect: 'none' 
                    }}
                  >
                    {item.year}
                  </div>

                  <div className="w-full md:w-[55%] relative z-20" style={{ willChange: 'transform' }}>
                    <motion.div
                      whileHover={{ scale: 0.98 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <img 
                        src={item.img} 
                        alt={item.title}
                        loading="lazy"
                        className="w-full aspect-[16/10] object-cover rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                        style={{ willChange: 'filter' }}
                      />
                    </motion.div>
                  </div>

                  <div className={`w-full md:w-[45%] relative z-20 flex flex-col justify-center`}>
                     <motion.div 
                       initial={{ opacity: 0, x: idx % 2 !== 0 ? 20 : -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.3, duration: 0.8 }}
                       className="space-y-6"
                     >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-[1px] bg-green" />
                          <span className="text-green font-display font-bold text-2xl tracking-widest">{item.year}</span>
                        </div>
                        <h4 className="text-3xl md:text-5xl font-display font-medium text-primary leading-[1.1]">{item.title}</h4>
                        <p className="text-primary/70 text-lg md:text-xl leading-relaxed max-w-lg font-light">{item.desc}</p>
                     </motion.div>
                  </div>
                </motion.div>
              ))}
              </div>

              <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/50 backdrop-blur-sm p-3 rounded-full md:hidden shadow-lg"
              >
                 <ChevronRight className="w-6 h-6 text-primary" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
