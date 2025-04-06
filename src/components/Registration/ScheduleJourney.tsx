import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaRocket } from 'react-icons/fa';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

const ScheduleJourney = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      // Update athlete document with schedule preferences
      await updateDoc(doc(db, 'athletes', userId), {
        journeyStartDate: startDate,
        preferredTrainingTime: preferredTime,
        scheduleSet: true,
        updatedAt: new Date().toISOString()
      });

      navigate('/athlete-onboarding');
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Failed to save your preferences. Please try again.');
      setLoading(false);
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4"
      >
        <div className="text-center mb-8">
          <FaCalendarAlt className="text-5xl text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Schedule Your Journey</h2>
          <p className="text-gray-300">
            Let's plan your path to excellence. When would you like to begin?
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              When do you want to start?
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Preferred Training Time
            </label>
            <div className="relative">
              <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                required
              >
                <option value="">Select preferred time</option>
                <option value="early_morning">Early Morning (5 AM - 8 AM)</option>
                <option value="morning">Morning (8 AM - 11 AM)</option>
                <option value="afternoon">Afternoon (11 AM - 3 PM)</option>
                <option value="evening">Evening (3 PM - 7 PM)</option>
                <option value="night">Night (7 PM - 10 PM)</option>
              </select>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-primary hover:bg-secondary 
              text-white py-3 rounded-lg font-semibold transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <FaRocket />
            {loading ? 'Saving...' : 'Start My Journey'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleJourney;