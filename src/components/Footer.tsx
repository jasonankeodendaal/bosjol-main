import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, ArrowRight } from 'lucide-react';

export function Footer() {
  const { data } = useAdmin();
  const location = useLocation();
  const isVenue = location.pathname === '/bos-venue';

  const footerData = isVenue ? {
    name: data?.bosVenue?.companyName || 'BOS VENUE',
    email: data?.bosVenue?.email || data?.company?.email,
    phone: data?.bosVenue?.phone || data?.company?.phone,
    address: data?.bosVenue?.address || data?.company?.address,
    logo: data?.bosVenue?.logo || data?.company?.logo,
    socials: data?.bosVenue?.socials?.length ? data.bosVenue.socials : data?.socials,
    description: data?.bosVenue?.footerDescription || "Multi-sport hub, premium event venue. Celebrations at their best in Mpumalanga."
  } : {
    name: data?.company?.name || 'BOSJOL',
    email: data?.company?.email,
    phone: data?.company?.phone,
    address: data?.company?.address,
    logo: data?.company?.logo,
    socials: data?.socials,
    description: "Elevating the standard of sports and celebratory excellence in Mpumalanga. Multi-sport hub, premium event venue."
  };

  return (
    <footer className="bg-white text-primary pb-8 pt-8 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand Info */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 group">
              {footerData.logo ? (
                <img 
                  src={footerData.logo} 
                  alt="Logo" 
                  loading="lazy"
                  className="h-10 object-contain group-hover:scale-105 transition-transform" 
                />
              ) : (
                <span className="text-xl font-display font-medium tracking-widest text-primary">
                  {footerData.name}
                </span>
              )}
            </Link>
            <p className="text-xs leading-relaxed text-primary/60 max-w-xs">
              {footerData.description}
            </p>
            <div className="flex gap-3">
              {footerData.socials?.map((s: any, idx: number) => (
                <a 
                  key={s.id || idx} 
                  href={s.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-primary/5 hover:bg-green hover:text-white transition-all duration-300"
                >
                  {s.name.toLowerCase().includes('instagram') ? <Instagram size={16} /> : 
                   s.name.toLowerCase().includes('facebook') ? <Facebook size={16} /> : 
                   <ArrowRight size={16} />}
                </a>
              ))}
              {(!footerData.socials || footerData.socials.length === 0) && (
                <>
                  <a href="#" className="p-2 rounded-lg bg-primary/5 hover:bg-green hover:text-white transition-all duration-300">
                    <Instagram size={16} />
                  </a>
                  <a href="#" className="p-2 rounded-lg bg-primary/5 hover:bg-green hover:text-white transition-all duration-300">
                    <Facebook size={16} />
                  </a>
                </>
              )}
            </div>
          </div>
          
          {/* Links Grid - already was 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-6 md:col-span-2">
            <div>
              <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/40 mb-3">Explore</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/" className="font-medium hover:text-green transition-colors">Home</Link></li>
                <li><Link to="/sports" className="font-medium hover:text-green transition-colors">Sports</Link></li>
                <li><Link to="/bos-venue" className="font-medium hover:text-green transition-colors">Bos Venue</Link></li>
                <li><Link to="/contact" className="font-medium hover:text-green transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/40 mb-3">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/legal/privacy" className="font-medium hover:text-green transition-colors">Privacy</Link></li>
                <li><Link to="/legal/terms" className="font-medium hover:text-green transition-colors">Terms</Link></li>
                <li><Link to="/legal/disclaimer" className="font-medium hover:text-green transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
 
          {/* Contact Details */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary/40 mb-3">Connect</h4>
            <div className="space-y-2 text-xs">
              {footerData.address && (
                <div className="flex gap-2 group text-primary/70">
                  <span className="shrink-0"><MapPin size={14} /></span>
                  <span>{footerData.address}</span>
                </div>
              )}
              {footerData.phone && (
                <a href={`tel:${footerData.phone}`} className="flex gap-2 group text-primary/70 hover:text-green">
                  <span className="shrink-0"><Phone size={14} /></span>
                  <span>{footerData.phone}</span>
                </a>
              )}
              {footerData.email && (
                <a href={`mailto:${footerData.email}`} className="flex gap-2 group text-primary/70 hover:text-green">
                  <span className="shrink-0"><Mail size={14} /></span>
                  <span className="break-all">{footerData.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40">
            © {new Date().getFullYear()} {footerData.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}

