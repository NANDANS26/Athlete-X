import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "This platform completely transformed my training! The AI suggestions helped me improve my speed by 20% in just 3 months!",
    author: "Michael Chen",
    role: "Professional Sprinter"
  },
  {
    quote: "Finding new talent has never been this easy. The AI-driven scouting tool is a game-changer.",
    author: "Sarah Thompson",
    role: "College Recruiter"
  },
  {
    quote: "The injury prevention insights have been invaluable. Haven't had a major setback since joining!",
    author: "James Wilson",
    role: "Professional Athlete"
  }
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-4 bg-dark">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          See What Our Athletes & Coaches Say
        </h2>
        
        <div className="relative h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center text-center"
            >
              <p className="text-xl mb-6 italic">"{testimonials[current].quote}"</p>
              <p className="font-semibold">{testimonials[current].author}</p>
              <p className="text-gray-400">{testimonials[current].role}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;