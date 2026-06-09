import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PageTransition } from '../components/PageTransition';
import { useAdmin } from '../context/AdminContext';

export default function Contact() {
  const { data, loading } = useAdmin();
  const [formData, setFormData] = useState<Record<string, string>>({});

  if (loading) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct WhatsApp message
    const messageLines = [
      `*New Inquiry via Bosjol Website*`,
      ...Object.entries(formData).map(([key, value]) => `*${key}:* ${value}`)
    ];
    
    const whatsappMessage = encodeURIComponent(messageLines.join('\n'));
    const phoneNumber = data.company.phone.replace(/[^0-9+]/g, '');
    
    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
  };

  const handleFieldChange = (label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  return (
    <PageTransition>
      <div className="min-h-[90vh] pt-32 pb-20 relative overflow-hidden flex items-center">
        {/* Subtle geometry background */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full h-[80vh] flex items-center justify-end pointer-events-none z-0 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-lime/10 rounded-full blur-[100px] translate-x-1/3" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Header Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <h1 
                className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wide text-primary leading-tight flex flex-col"
                dangerouslySetInnerHTML={{ __html: data.contact.title }}
              />
              <p 
                className="mt-4 text-primary/80 font-normal text-base max-w-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.contact.subtitle }}
              />
            </div>

            <div className="space-y-4 text-sm font-medium uppercase tracking-widest text-primary/90">
              <a href={`mailto:${data.company.email}`} className="flex items-center gap-3 hover:text-green cursor-pointer transition-colors w-fit">
                <div className="w-8 h-[2px] bg-primary/20" />
                <p>{data.company.email}</p>
              </a>
              <a href={`tel:${data.company.phone}`} className="flex items-center gap-3 hover:text-green cursor-pointer transition-colors w-fit">
                <div className="w-8 h-[2px] bg-primary/20" />
                <p>{data.company.phone}</p>
              </a>
              <div className="flex items-center gap-3 hover:text-green cursor-pointer transition-colors">
                <div className="w-8 h-[2px] bg-primary/20" />
                <p>{data.company.address}</p>
              </div>
            </div>
          </motion.div>

          {/* Form Structure */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-[2rem] shadow-xl border border-primary/5 p-8 relative flex flex-col justify-center"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              {data.contact.formFields?.map(field => (
                <div key={field.id} className="space-y-1">
                  {field.type === 'text' || field.type === 'email' ? (
                     <input 
                       type={field.type} 
                       placeholder={field.placeholder} 
                       required
                       onChange={(e) => handleFieldChange(field.placeholder, e.target.value)}
                       className="w-full bg-primary/5 rounded-xl px-4 py-3 text-primary text-sm font-sans placeholder:text-primary/40 focus:outline-none focus:ring-1 focus:ring-green transition-all"
                     />
                  ) : field.type === 'dropdown' ? (
                     <select 
                       required
                       onChange={(e) => handleFieldChange(field.placeholder, e.target.value)}
                       className="w-full bg-primary/5 rounded-xl px-4 py-3 text-primary text-sm font-sans focus:outline-none focus:ring-1 focus:ring-green transition-all appearance-none cursor-pointer"
                     >
                       <option value="" disabled selected className="text-primary/40">{field.placeholder}</option>
                       {field.options?.split(',').map((opt, i) => (
                         <option key={i} value={opt.trim()} className="text-primary">{opt.trim()}</option>
                       ))}
                     </select>
                  ) : field.type === 'textarea' ? (
                     <textarea 
                       placeholder={field.placeholder} 
                       rows={4}
                       required
                       onChange={(e) => handleFieldChange(field.placeholder, e.target.value)}
                       className="w-full bg-primary/5 rounded-xl px-4 py-3 text-primary text-sm font-sans placeholder:text-primary/40 focus:outline-none focus:ring-1 focus:ring-green transition-all resize-none"
                     />
                  ) : null}
                </div>
              ))}

              <button className="w-full py-4 mt-2 bg-primary text-white rounded-xl font-display font-medium uppercase tracking-wide hover:bg-green shadow-md hover:shadow-lg transition-all duration-300">
                Send via WhatsApp
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
