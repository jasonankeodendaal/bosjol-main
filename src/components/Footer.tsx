import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  const { data } = useAdmin();
  const location = useLocation();
  const isVenue = location.pathname === '/bos-venue';

  return (
    <footer className="bg-white text-primary pb-16 pt-16 px-6 border-t border-primary/5 relative overflow-hidden mt-10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              {data?.company?.logo ? (
                <img 
                  src={data.company.logo} 
                  alt="Logo" 
                  loading="lazy"
                  className="h-12 object-contain group-hover:scale-105 transition-transform" 
                />
              ) : (
                <span className="text-2xl font-display font-medium tracking-widest text-primary">
                  {data?.company?.name || 'BOSJOL'}
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed text-primary/60 max-w-xs">
              Elevating the standard of sports and celebratory excellence in Mpumalanga. Multi-sport hub, premium event venue.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 rounded-xl bg-primary/5 hover:bg-green hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-primary/5 hover:bg-green hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>
            </div>
          </div>
          
          {/* Links Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/40 mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-sm font-medium hover:text-green transition-colors flex items-center gap-2 group">Home <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
                <li><Link to="/sports" className="text-sm font-medium hover:text-green transition-colors flex items-center gap-2 group">Sports <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
                <li><Link to="/bos-venue" className="text-sm font-medium hover:text-green transition-colors flex items-center gap-2 group">Bos Venue <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
                <li><Link to="/contact" className="text-sm font-medium hover:text-green transition-colors flex items-center gap-2 group">Contact <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/40 mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link to="#" className="text-sm font-medium hover:text-green transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-sm font-medium hover:text-green transition-colors">Terms of Service</Link></li>
                <li><Link to="/login" className="text-sm font-medium hover:text-green transition-colors opacity-40">Admin Access</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/40 mb-6">Connect</h4>
            <div className="space-y-4">
              {data?.company?.address && (
                <div className="flex gap-4 group">
                  <div className="p-2 rounded-lg bg-green/10 text-green shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="text-sm text-primary/70 leading-relaxed font-medium transition-colors group-hover:text-primary">
                    {data.company.address}
                  </span>
                </div>
              )}
              {data?.company?.phone && (
                <a href={`tel:${data.company.phone}`} className="flex gap-4 group">
                  <div className="p-2 rounded-lg bg-green/10 text-green shrink-0">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm text-primary/70 font-medium transition-colors group-hover:text-green">
                    {data.company.phone}
                  </span>
                </a>
              )}
              {data?.company?.email && (
                <a href={`mailto:${data.company.email}`} className="flex gap-4 group">
                  <div className="p-2 rounded-lg bg-green/10 text-green shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm text-primary/70 font-medium transition-colors group-hover:text-green break-all">
                    {data.company.email}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
            © {new Date().getFullYear()} {data?.company?.name || 'Bosjol'}. Crafted for Champions.
          </p>
          <div className="flex gap-8 items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 italic">Move Fearlessly.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

