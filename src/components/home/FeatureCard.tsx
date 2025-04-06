import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  preview: string;
}

const FeatureCard = ({ icon, title, description, preview }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white/10 p-6 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="text-4xl text-primary">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      
      <div className="absolute inset-0 bg-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
        <p className="text-white text-center p-4">{preview}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;