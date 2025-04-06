import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaExclamationTriangle,
  FaHotjar,
  FaFirstAid,
  FaTint,
  FaBed,
  FaBatteryHalf,
  FaHeart,
  FaFire,
  FaSmile,
} from 'react-icons/fa';
import type { AthleteData } from './AthleteDashboard';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface InjuryPreventionProps {
  athleteData: AthleteData;
}

interface BodyPart {
  name: string;
  risk: number;
  status: 'high' | 'moderate' | 'low';
  recommendation: string;
}

interface RecoveryMetric {
  name: string;
  value: number;
  icon: JSX.Element;
  status: 'optimal' | 'suboptimal' | 'critical';
}

const InjuryPrevention = ({ athleteData }: InjuryPreventionProps) => {
  const [overallRisk, setOverallRisk] = useState(30);
  const [recoveryStatus, setRecoveryStatus] = useState(85);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([
    { name: 'Knees', risk: 65, status: 'moderate', recommendation: 'Focus on knee stability exercises' },
    { name: 'Lower Back', risk: 45, status: 'moderate', recommendation: 'Add core strengthening exercises' },
    { name: 'Shoulders', risk: 25, status: 'low', recommendation: 'Maintain current routine' },
    { name: 'Ankles', risk: 80, status: 'high', recommendation: 'Reduce high-impact activities' },
    { name: 'Hamstrings', risk: 50, status: 'moderate', recommendation: 'Incorporate dynamic stretching' },
    { name: 'Quadriceps', risk: 40, status: 'low', recommendation: 'Monitor for fatigue' },
    { name: 'Calves', risk: 70, status: 'high', recommendation: 'Use compression sleeves' },
  ]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetric[]>([
    { name: 'Hydration', value: 75, icon: <FaTint className="text-blue-400" />, status: 'suboptimal' },
    { name: 'Sleep Quality', value: 90, icon: <FaBed className="text-purple-400" />, status: 'optimal' },
    { name: 'Muscle Fatigue', value: 60, icon: <FaBatteryHalf className="text-yellow-400" />, status: 'suboptimal' },
    { name: 'HRV', value: 85, icon: <FaHeart className="text-red-400" />, status: 'optimal' },
    { name: 'Muscle Soreness', value: 40, icon: <FaFire className="text-orange-400" />, status: 'critical' },
    { name: 'Stress Levels', value: 55, icon: <FaSmile className="text-green-400" />, status: 'suboptimal' },
  ]);

  const [geminiResponse, setGeminiResponse] = useState<string[] | null>(null);

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY); // Replace with your Gemini API key

  // Fetch Gemini AI response
  const fetchGeminiResponse = async (prompt: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response (remove *, -, or other unwanted characters)
      const cleanedText = text.replace(/[*\-]/g, ''); // Remove * and -

      // Split the response into individual points
      const tips = cleanedText
        .split('\n') // Split by newlines
        .filter((point) => point.trim() !== '') // Remove empty lines
        .slice(0, 5); // Limit to 5 points

      setGeminiResponse(tips);
    } catch (error) {
      console.error('Error fetching Gemini AI response:', error);
      setGeminiResponse(['Failed to fetch tips. Please try again later.']);
    }
  };

  // Handle body part click
  const handleBodyPartClick = (partName: string) => {
    setSelectedBodyPart(partName);
    const prompt = `Provide 4-5 concise bullet points for injury prevention tips for ${partName} in ${athleteData.sport} for a ${athleteData.position}.`;
    fetchGeminiResponse(prompt);
  };

  // Simulate real-time updates (once per minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setOverallRisk((prev) => Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5))));
      setRecoveryStatus((prev) => Math.max(0, Math.min(100, prev + (Math.random() * 6 - 3))));

      setBodyParts((prev) =>
        prev.map((part) => ({
          ...part,
          risk: Math.max(0, Math.min(100, part.risk + (Math.random() * 8 - 4))),
          status: part.risk > 70 ? 'high' : part.risk > 40 ? 'moderate' : 'low',
        }))
      );

      setRecoveryMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value: Math.max(0, Math.min(100, metric.value + (Math.random() * 6 - 3))),
          status: metric.value > 80 ? 'optimal' : metric.value > 50 ? 'suboptimal' : 'critical',
        }))
      );

      // Add notifications for high-risk body parts
      const highRiskParts = bodyParts.filter((part) => part.risk > 70);
      if (highRiskParts.length > 0) {
        setNotifications((prev) => [
          ...prev,
          `High risk detected for ${highRiskParts.map((part) => part.name).join(', ')}`,
        ]);
      }
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [bodyParts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-red-500';
      case 'moderate':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Injury Prevention & Recovery</h1>
          <p className="text-gray-400">AI-powered injury prevention for {athleteData.sport} ({athleteData.position})</p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 p-4 rounded-xl"
        >
          <div className="flex items-center gap-4">
            <FaExclamationTriangle className="text-red-500 text-2xl" />
            <div>
              <h2 className="text-xl font-semibold">High Risk Alerts</h2>
              <ul className="text-gray-300">
                {notifications.map((notification, index) => (
                  <li key={index}>{notification}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl ${
          overallRisk > 70 ? 'bg-red-500/20' : overallRisk > 40 ? 'bg-yellow-500/20' : 'bg-green-500/20'
        }`}
      >
        <div className="flex items-center gap-4">
          <FaExclamationTriangle
            className={`text-3xl ${
              overallRisk > 70 ? 'text-red-500' : overallRisk > 40 ? 'text-yellow-500' : 'text-green-500'
            }`}
          />
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {overallRisk > 70 ? 'High Risk Alert!' : overallRisk > 40 ? 'Moderate Risk Warning' : 'Low Risk Status'}
            </h2>
            <p className="text-gray-300">
              {overallRisk > 70
                ? 'Immediate action required to prevent injury'
                : overallRisk > 40
                ? 'Monitor and take precautionary measures'
                : 'Safe to continue with current training plan'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Body Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaHotjar className="text-red-500 text-2xl" />
            <h2 className="text-xl font-semibold">Body Stress Map</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {bodyParts.map((part, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 p-4 rounded-lg cursor-pointer ${
                  selectedBodyPart === part.name ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleBodyPartClick(part.name)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{part.name}</h3>
                  <span className={`text-sm ${getStatusColor(part.status)}`}>{part.status.toUpperCase()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-300 ${
                      part.status === 'high' ? 'bg-red-500' : part.status === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${part.risk}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{part.recommendation}</p>
              </motion.div>
            ))}
          </div>

          {/* Gemini AI Response */}
          {selectedBodyPart && geminiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-white/5 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">AI-Powered Tips for {selectedBodyPart}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {geminiResponse.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Recovery Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaFirstAid className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Recovery Status</h2>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span>Overall Recovery</span>
              <span>{Math.round(recoveryStatus)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-primary rounded-full h-4 transition-all duration-300"
                style={{ width: `${recoveryStatus}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {recoveryMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  {metric.icon}
                  <h3 className="font-semibold">{metric.name}</h3>
                  <span className={`text-sm ${getStatusColor(metric.status)}`}>{metric.status.toUpperCase()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 transition-all duration-300 ${
                      metric.status === 'optimal' ? 'bg-green-500' : metric.status === 'suboptimal' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">{metric.value}%</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InjuryPrevention;