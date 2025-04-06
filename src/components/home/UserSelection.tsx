import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRunning, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const UserSelection = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const handleRoleSelection = (role: 'athlete' | 'recruiter') => {
    if (role === 'athlete') {
      navigate('/athlete-registration');
    } else {
      navigate('/recruiter-registration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 120,
          particles: {
            color: { value: "#646cff" },
            links: { color: "#646cff", distance: 150, enable: true, opacity: 0.5, width: 1 },
            move: { enable: true, speed: 1 },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
          },
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Who Are You?</h1>
          <p className="text-xl text-gray-300">Select your role to proceed</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredCard('athlete')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => handleRoleSelection('athlete')}
            className={`cursor-pointer bg-white/10 backdrop-blur-lg rounded-xl p-8 
              transition-all duration-300 ${
                hoveredCard === 'athlete' ? 'shadow-lg shadow-primary/50' : ''
              }`}
          >
            <div className="flex flex-col items-center text-center">
              <FaRunning className="text-6xl text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">I'm an Athlete</h3>
              <p className="text-gray-300">
                Track your performance, improve with AI insights, and get discovered by top recruiters!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredCard('recruiter')}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => handleRoleSelection('recruiter')}
            className={`cursor-pointer bg-white/10 backdrop-blur-lg rounded-xl p-8 
              transition-all duration-300 ${
                hoveredCard === 'recruiter' ? 'shadow-lg shadow-secondary/50' : ''
              }`}
          >
            <div className="flex flex-col items-center text-center">
              <FaUserTie className="text-6xl text-secondary mb-6" />
              <h3 className="text-2xl font-bold mb-4">I'm a Recruiter</h3>
              <p className="text-gray-300">
                Discover top talent, track performance analytics, and recruit the best athletes globally!
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-gray-400"
        >
          <p>Need help? Our AI assistant can guide you through the selection process!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserSelection;