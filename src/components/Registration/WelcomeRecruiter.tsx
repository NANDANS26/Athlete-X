import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaRocket, FaChartLine, FaSearch, FaHandshake } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface RecruiterData {
  fullName: string;
  organization: string;
  recruiterType: string;
  sportSpecialization: string;
}

const WelcomeRecruiter = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState<RecruiterData | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const quotes = [
    {
      text: "The difference between the impossible and the possible lies in determination.",
      author: "Tommy Lasorda"
    },
    {
      text: "Talent wins games, but teamwork and intelligence win championships.",
      author: "Michael Jordan"
    },
    {
      text: "The key is not the will to win... everybody has that. It is the will to prepare to win that is important.",
      author: "Bobby Knight"
    }
  ];

  const features = [
    {
      icon: <FaSearch className="text-primary text-3xl" />,
      title: "AI-Powered Scouting",
      description: "Discover top talent with our advanced AI algorithms"
    },
    {
      icon: <FaChartLine className="text-green-500 text-3xl" />,
      title: "Performance Analytics",
      description: "Track and analyze athlete performance in real-time"
    },
    {
      icon: <FaHandshake className="text-yellow-500 text-3xl" />,
      title: "Contract Management",
      description: "Streamline recruitment and contract processes"
    }
  ];

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const recruiterDoc = await getDoc(doc(db, 'recruiters', userId));
        if (recruiterDoc.exists()) {
          setRecruiterData(recruiterDoc.data() as RecruiterData);
        }
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
      }
    };

    fetchRecruiterData();

    // Rotate quotes every 5 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    // Auto-redirect to dashboard after 10 seconds
    const redirectTimeout = setTimeout(() => {
      navigate('/dashboard/recruiter');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimeout);
    };
  }, [navigate]);

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <FaUserTie className="text-5xl text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome, {recruiterData?.fullName}!
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">
            {recruiterData?.organization && `${recruiterData.organization} • `}
            {recruiterData?.recruiterType} • {recruiterData?.sportSpecialization} Specialist
          </p>
          <p className="text-gray-400">
            Your journey to discovering exceptional talent begins now
          </p>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-xl text-center mb-12"
        >
          <p className="text-2xl italic mb-4">"{quotes[currentQuoteIndex].text}"</p>
          <p className="text-gray-400">— {quotes[currentQuoteIndex].author}</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-center"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/recruiter')}
            className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg 
              font-semibold transition-colors inline-flex items-center gap-2"
          >
            <FaRocket />
            Continue to Dashboard
          </motion.button>
          <p className="text-gray-400 mt-4">
            Auto-redirecting to your dashboard in a few seconds...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeRecruiter;