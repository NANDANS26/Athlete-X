import { motion } from 'framer-motion';
import { FaUserPlus, FaDumbbell, FaStar } from 'react-icons/fa';

const steps = [
  {
    icon: <FaUserPlus />,
    title: "Join & Set Up Profile",
    description: "Select your sport & preferences"
  },
  {
    icon: <FaDumbbell />,
    title: "AI-Powered Training & Tracking",
    description: "Log workouts, meals, & get AI insights"
  },
  {
    icon: <FaStar />,
    title: "Get Noticed & Recruited",
    description: "AI helps find the best opportunities"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">
          How It Works – Simple, Fast & Effective
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="text-5xl text-primary mb-6"
              >
                {step.icon}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;