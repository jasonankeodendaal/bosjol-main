
import { motion } from 'motion/react';

export function BrandLogoStrip({ logos }: { logos: string[] }) {
  if (!logos || logos.length === 0) return null;

  return (
    <div className="w-full bg-white py-12 border-y border-primary/5 overflow-hidden">
      <motion.div
        className="flex gap-16 items-center w-max"
        animate={{ x: ["0%", "-20%"] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...logos, ...logos, ...logos, ...logos, ...logos].map((logo, index) => (
          <img 
            key={index} 
            src={logo} 
            alt="Brand Logo" 
            className="h-16 w-auto object-contain" 
          />
        ))}
      </motion.div>
    </div>
  );
}
