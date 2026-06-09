import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const { data } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const isExcludedPath = location.pathname === '/admin' || location.pathname === '/login';

  useEffect(() => {
    if (isExcludedPath) {
      setIsVisible(false);
      return;
    }

    // Auto-transition after 3 seconds
    const timer = setTimeout(() => {
      handleEnter();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isExcludedPath]);

  const handleEnter = () => {
    setIsVisible(false);
    navigate('/');
  };

  if (isExcludedPath) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary text-white"
        >
          {/* Venue logo as background */}
          <div 
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center transition-opacity duration-1000" 
            style={{ backgroundImage: `url('${data?.welcome?.bgImage || data?.welcome?.logoVenue}')` }}
          ></div>
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 z-10 p-6 text-center w-full max-w-2xl"
          >
            {/* Logos Side by Side */}
            <div className="flex justify-center items-center gap-4 md:gap-12 mb-4 w-full">
               {data?.welcome?.logoMain && (
                  <motion.img 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={data.welcome.logoMain} 
                    alt="Company Logo" 
                    className="h-16 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]" 
                  />
               )}
               {data?.welcome?.logoMain && data?.welcome?.logoVenue && (
                 <div className="w-px h-10 md:h-24 bg-white/20"></div>
               )}
               {data?.welcome?.logoVenue && (
                  <motion.img 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    src={data.welcome.logoVenue} 
                    alt="Venue Logo" 
                    className="h-16 md:h-32 object-contain opacity-90" 
                  />
               )}
            </div>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-6xl font-display font-bold uppercase tracking-[0.2em] text-white"
            >
              Welcome
            </motion.h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-1 bg-green rounded-full"
            ></motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/60 text-sm uppercase tracking-widest mt-4"
            >
              Loading Experience...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
