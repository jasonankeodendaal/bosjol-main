import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, ArrowLeft, Home, Trophy, Calendar, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data } = useAdmin();

  const isVenuePage = location.pathname === '/bos-venue' || location.pathname.startsWith('/sports/');
  const textColor = isVenuePage && !scrolled ? 'text-white' : 'text-primary/90';
  const activeTextColor = isVenuePage && !scrolled ? 'text-white font-bold' : 'text-green font-bold';
  const hoverTextColor = isVenuePage && !scrolled ? 'hover:text-white' : 'hover:text-green';

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { 
      name: 'Sports', 
      path: data.sportsPages && data.sportsPages.length > 0 ? `/sports/${data.sportsPages[0].slug}` : '#',
      icon: Trophy,
      dropdown: data.sportsPages?.map((s) => ({
        name: s.navName,
        path: `/sports/${s.slug}`
      })) || []
    },
    { name: 'Contact', path: '/contact', icon: MessageCircle },
    { 
      name: 'Bos Venue', 
      path: '/bos-venue',
      icon: Calendar,
      dropdown: [
        { name: 'Home', path: '/bos-venue' },
        { name: 'Previous Events', path: '/bos-venue?tab=events' },
        { name: 'Get In Touch', path: '/bos-venue?tab=contact' }
      ]
    },
  ];

  return (
    <>
      {/* --- TOP HEADER --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ease-out ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-2xl py-3 shadow-lg border-b border-primary/10' 
            : isVenuePage 
              ? 'bg-black/40 backdrop-blur-md py-5 border-b border-white/10' 
              : 'bg-white/5 backdrop-blur-lg py-6 md:py-8 border-b border-white/10'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="relative z-50 flex items-center group">
            {location.pathname === '/bos-venue' && data?.bosVenue?.logo ? (
               <img 
                 src={data.bosVenue.logo} 
                 alt="Venue Logo" 
                 className={`object-contain transition-transform duration-700 group-hover:scale-105 ${!scrolled && isVenuePage ? 'brightness-100' : 'brightness-90'}`} 
                 style={{ height: data.bosVenue.logoHeight || (window.innerWidth < 768 ? 32 : 44) }}
               />
            ) : data?.company?.logo ? (
              <img 
                src={data.company.logo} 
                alt="Logo" 
                className={`object-contain transition-all duration-700 group-hover:scale-105 ${!scrolled && isVenuePage ? 'brightness-100' : 'brightness-90'}`} 
                style={{ height: data.company.logoHeight || (window.innerWidth < 768 ? 32 : 44) }}
              />
            ) : (
              <span className={`text-lg md:text-xl font-display font-medium tracking-[0.2em] transition-all group-hover:tracking-[0.25em] ${isVenuePage && !scrolled ? 'text-white' : 'text-primary'}`}>
                 {data?.company?.name || 'BOSJOL'}
              </span>
            )}
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <div className="flex items-center gap-1 cursor-pointer py-2" tabIndex={0}>
                    <Link
                      to={link.path}
                      className={`text-sm tracking-[0.12em] uppercase font-bold transition-all relative pb-1 ${hoverTextColor} ${
                        location.pathname === link.path ? activeTextColor : textColor
                      }`}
                    >
                      {link.name}
                      {location.pathname === link.path && (
                        <motion.div layoutId="navline" className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isVenuePage && !scrolled ? 'bg-white' : 'bg-green'}`} />
                      )}
                    </Link>
                    <ChevronDown size={14} className={`${isVenuePage && !scrolled ? 'text-white' : 'text-primary'} group-hover:text-green transition-transform duration-300 group-hover:rotate-180`} />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl border border-primary/5 py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex flex-col z-[100] scale-95 group-hover:scale-100">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-primary/5" />
                      {link.dropdown.map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          to={subItem.path}
                          className="px-6 py-2.5 text-xs uppercase tracking-widest font-bold text-primary/80 hover:text-green hover:bg-primary/5 transition-all flex items-center justify-between group/item"
                        >
                          {subItem.name}
                          <ArrowLeft size={10} className="rotate-180 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <Link
                      to={link.path}
                      className={`text-sm tracking-[0.12em] uppercase font-bold transition-all relative pb-1 ${hoverTextColor} ${
                        location.pathname === link.path ? activeTextColor : textColor
                      }`}
                    >
                      {link.name}
                      {location.pathname === link.path && (
                        <motion.div layoutId="navline" className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isVenuePage && !scrolled ? 'bg-white' : 'bg-green'}`} />
                      )}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
             {/* Mobile Menu trigger */}
             <button 
               className="md:hidden relative z-50 p-2 -mr-2 text-primary"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} className={isVenuePage && !scrolled ? 'text-white' : 'text-primary'} />}
             </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-primary z-[55] flex flex-col p-8 pt-24"
          >
            <div className="space-y-8">
              <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-bold mb-4">Quick Navigation</p>
              {links.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-4"
                >
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-3xl font-display font-medium tracking-wide uppercase transition-colors ${
                      location.pathname === link.path ? 'text-green' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {link.dropdown && (
                    <div className="flex flex-wrap gap-2 pl-4 border-l border-white/10 ml-1">
                      {link.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-3 py-1.5 rounded-full border border-white/20 text-white/60 text-xs font-bold uppercase tracking-widest hover:border-green hover:text-green transition-all"
                        >
                           {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              
              <div className="pt-8 mt-8 border-t border-white/10 space-y-6">
                 <Link to="/login" className="block text-white/50 text-sm uppercase tracking-widest font-bold hover:text-green">
                   Admin Login
                 </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
