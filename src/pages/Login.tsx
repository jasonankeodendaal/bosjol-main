import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Login() {
  const { data, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    login();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden font-sans">
      {/* 4D Background Layer 1: Moving Particles/Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px]"></div>
      </div>

      {/* 4D Background Layer 2: Venue Logo as Depth Layer */}
      <motion.div 
        animate={{ 
          scale: [1.05, 1.1, 1.05],
          rotate: [0, 1, 0, -1, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-1000 grayscale" 
        style={{ backgroundImage: `url('${data?.welcome?.logoVenue || data?.welcome?.bgImage}')` }}
      ></motion.div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/60 to-primary/90 backdrop-blur-[4px]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 bg-white/[0.03] backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-md text-white relative overflow-hidden"
      >
        {/* Card Internal Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green/10 blur-3xl opacity-50 -z-10"></div>
        
        <div className="flex justify-center items-center gap-6 md:gap-10 mb-8 md:mb-10">
             {data?.welcome?.logoMain && (
                <motion.img 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  src={data.welcome.logoMain} 
                  alt="Company Logo" 
                  className="h-12 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]" 
                />
             )}
             <div className="w-px h-6 md:h-8 bg-white/10"></div>
             {data?.welcome?.logoVenue && (
                <motion.img 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  src={data.welcome.logoVenue} 
                  alt="Venue Logo" 
                  className="h-12 md:h-16 object-contain opacity-80" 
                />
             )}
        </div>
        
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight uppercase">Admin Access</h2>
          <p className="text-white/40 text-[10px] mt-2 uppercase tracking-[0.3em]">Locked Environment</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div className="space-y-3 md:space-y-4">
            <input 
              type="email" 
              placeholder="IDENTITY / EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs font-mono tracking-widest focus:border-green focus:ring-1 focus:ring-green outline-none transition-all placeholder:text-white/20"
            />
            <input 
              type="password" 
              placeholder="ACCESS CODE / PASSWORD" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs font-mono tracking-widest focus:border-green focus:ring-1 focus:ring-green outline-none transition-all placeholder:text-white/20"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 md:py-5 bg-green text-primary font-bold rounded-xl md:rounded-2xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(74,222,128,0.2)] text-[10px] md:text-xs uppercase tracking-[0.2em] mt-2"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/5 text-center flex flex-col gap-4 md:gap-6">
            <button className="flex items-center justify-center gap-3 w-full py-3 md:py-4 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white">
               <svg className="w-4 h-4" viewBox="0 0 24 24">
                 <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                 <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.16-2.85-.02-5.34-1.91-6.23-4.5H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                 <path fill="currentColor" d="M5.77 14.23c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.23H2.18C1.43 8.72 1 10.33 1 12s.43 3.28 1.18 4.77l3.59-2.77z"/>
                 <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.23l3.59 2.77c.89-2.59 3.38-4.5 6.23-4.62z"/>
               </svg>
               Google Authentication
            </button>
            
            <Link 
              to="/" 
              className="group flex items-center justify-center gap-2 text-white/20 hover:text-white transition-all text-[10px] uppercase tracking-[0.4em]"
            >
              <ArrowLeft size={10} className="transform group-hover:-translate-x-1 transition-transform" />
              <span>Back to System</span>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
