import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaRegSmile } from 'react-icons/fa';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const JourneyConfirmation = () => {
  const navigate = useNavigate();
  
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const handleYes = () => {
    navigate('/schedule-journey');
  };

  const handleNo = () => {
    navigate('/thank-you');
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center"
        >
          <FaRocket className="text-5xl text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8">
            "Champions aren't made in the gyms. Champions are made from something they have deep inside them - a desire, a dream, a vision."
          </p>
          <p className="text-gray-400 mb-8">
            Are you ready to transform your athletic potential into excellence?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleYes}
              className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaRocket />
              Yes, Let's Begin!
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNo}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <FaRegSmile />
              Maybe Later
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JourneyConfirmation;