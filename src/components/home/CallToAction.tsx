import { motion } from 'framer-motion';
import { FaRocket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-secondary p-12 rounded-2xl"
        >
          <h2 className="text-4xl font-bold mb-6">
            Join Now & Take Your Performance to the Next Level!
          </h2>
          
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-lg text-xl font-semibold mx-auto animate-pulse-glow"
          >
            <FaRocket />
            Sign Up Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;