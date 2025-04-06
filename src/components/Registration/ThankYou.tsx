import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaRegSmile, FaHome } from 'react-icons/fa';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const ThankYou = () => {
  const navigate = useNavigate();
  
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
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
        className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4 text-center"
      >
        <FaRegSmile className="text-6xl text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Thank You for Your Interest!</h2>
        <p className="text-xl text-gray-300 mb-8">
          We understand that timing is everything. When you're ready to begin your journey to athletic excellence, we'll be here to support you.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg mx-auto"
        >
          <FaHome />
          Return Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ThankYou;