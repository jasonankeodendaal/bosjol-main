import React from 'react';
import { motion } from 'motion/react';
import { useAdmin } from '../context/AdminContext';
import { useParams } from 'react-router-dom';

export default function LegalPage() {
  const { data } = useAdmin();
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'disclaimer' }>();

  const title = type === 'privacy' ? 'Privacy Policy' : type === 'terms' ? 'Terms of Service' : 'Legal Disclaimer';
  const content = type === 'privacy' ? data?.legal?.privacyPolicy : type === 'terms' ? data?.legal?.termsOfService : data?.legal?.legalDisclaimer;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto"
    >
      <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-12 tracking-tight">
        {title}
      </h1>
      <div className="prose prose-primary max-w-none text-primary/80 font-sans leading-relaxed">
        {content || 'Content not yet defined.'}
      </div>
    </motion.div>
  );
}
