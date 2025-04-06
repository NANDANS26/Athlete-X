import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBrain,
  FaChartLine,
  FaDumbbell,
  FaHeartbeat,
  FaRunning,
  FaSpinner,
  FaLightbulb,
  FaRocket,
  FaChartBar,
  FaRegSmile,
  FaUtensils,
  FaBed,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AthleteData } from './AthleteDashboard';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface AIInsightsProps {
  athleteData: AthleteData;
}

interface Insight {
  id: string;
  type: 'performance' | 'training' | 'nutrition' | 'recovery';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface PerformanceMetric {
  date: string;
  value: number;
  benchmark: number;
}

interface Quote {
  text: string;
  author: string;
}

interface NutritionPlan {
  day: string;
  meals: string[];
  calories: number;
}

interface RecoveryMetric {
  type: string;
  value: number;
  target: number;
}

interface GrowthData {
  date: string;
  performance: number;
  recovery: number;
  nutrition: number;
}

const AIInsights = ({ athleteData }: AIInsightsProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState<Quote | null>(null);
  const [strengthMetrics, setStrengthMetrics] = useState<any[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetric[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Generate insights using Gemini AI
  const generateInsights = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Generate personalized insights for a ${athleteData.sport} athlete playing ${athleteData.position} position.
        Include:
        1. Performance analysis
        2. Training recommendations
        3. Recovery suggestions
        4. Nutrition tips
        Format as JSON with structure:
        {
          "insights": [
            {
              "type": "performance|training|nutrition|recovery",
              "title": "string",
              "description": "string",
              "recommendation": "string",
              "priority": "high|medium|low"
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean the response (remove Markdown formatting)
      const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      // Parse the cleaned response
      const response = JSON.parse(cleanedResponse);

      if (!response.insights) {
        throw new Error("Invalid response format from Gemini AI");
      }

      const formattedInsights = response.insights.map((insight: any, index: number) => ({
        ...insight,
        id: `insight-${index}`,
        timestamp: new Date(),
      }));

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]); // Fallback to empty insights
    }
  };

  // Generate motivational quote
  const generateQuote = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(
        `Generate an inspiring sports quote relevant for a ${athleteData.sport} athlete.`
      );
      const quote = result.response.text().split(' - ');
      setMotivationalQuote({
        text: quote[0],
        author: quote[1] || 'Anonymous',
      });
    } catch (error) {
      console.error('Error generating quote:', error);
      setMotivationalQuote(null); // Fallback to no quote
    }
  };

  // Generate nutrition plans
  const generateNutritionPlans = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Generate a 7-day nutrition plan for a ${athleteData.sport} athlete. Include meals and calorie counts.
        Format the response as a valid JSON object with the following structure:
        {
          "plans": [
            {
              "day": "string",
              "meals": ["string"],
              "calories": number
            }
          ]
        }
        Do not include any additional text or explanations. Only return the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean the response (remove Markdown formatting and extra text)
      const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      // Validate if the response is valid JSON
      try {
        const response = JSON.parse(cleanedResponse);
        if (!response.plans) {
          throw new Error("Invalid response format from Gemini AI");
        }
        setNutritionPlans(response.plans);
      } catch (error) {
        console.error("Invalid JSON response:", cleanedResponse);
        setNutritionPlans([]); // Fallback to empty plans
      }
    } catch (error) {
      console.error('Error generating nutrition plans:', error);
      setNutritionPlans([]); // Fallback to empty plans
    }
  };

  // Generate recovery metrics
  const generateRecoveryMetrics = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Generate recovery metrics for a ${athleteData.sport} athlete. Include sleep quality, heart rate variability, and recovery scores.
        Format the response as a valid JSON object with the following structure:
        {
          "metrics": [
            {
              "type": "string",
              "value": number,
              "target": number
            }
          ]
        }
        Do not include any additional text or explanations. Only return the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean the response (remove Markdown formatting and extra text)
      const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      // Validate if the response is valid JSON
      try {
        const response = JSON.parse(cleanedResponse);
        if (!response.metrics) {
          throw new Error("Invalid response format from Gemini AI");
        }
        setRecoveryMetrics(response.metrics);
      } catch (error) {
        console.error("Invalid JSON response:", cleanedResponse);
        setRecoveryMetrics([]); // Fallback to empty metrics
      }
    } catch (error) {
      console.error('Error generating recovery metrics:', error);
      setRecoveryMetrics([]); // Fallback to empty metrics
    }
  };

  // Generate growth data
  const generateGrowthData = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Generate overall growth data for a ${athleteData.sport} athlete over the last month.
        Include performance, recovery, and nutrition scores.
        Format the response as a valid JSON object with the following structure:
        {
          "growthData": [
            {
              "date": "string",
              "performance": number,
              "recovery": number,
              "nutrition": number
            }
          ]
        }
        Do not include any additional text or explanations. Only return the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean the response (remove Markdown formatting and extra text)
      const cleanedResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

      // Validate if the response is valid JSON
      try {
        const response = JSON.parse(cleanedResponse);
        if (!response.growthData) {
          throw new Error("Invalid response format from Gemini AI");
        }
        setGrowthData(response.growthData);
      } catch (error) {
        console.error("Invalid JSON response:", cleanedResponse);
        setGrowthData([]); // Fallback to empty growth data
      }
    } catch (error) {
      console.error('Error generating growth data:', error);
      setGrowthData([]); // Fallback to empty growth data
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          generateInsights(),
          generateQuote(),
          generateNutritionPlans(),
          generateRecoveryMetrics(),
          generateGrowthData(),
          // Generate sample performance data
          setPerformanceData(
            Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
              value: 70 + Math.random() * 20,
              benchmark: 75,
            }))
          ),
          // Generate sample strength metrics
          setStrengthMetrics([
            { attribute: 'Speed', value: 80, average: 70 },
            { attribute: 'Power', value: 85, average: 75 },
            { attribute: 'Endurance', value: 75, average: 70 },
            { attribute: 'Agility', value: 90, average: 80 },
            { attribute: 'Recovery', value: 85, average: 75 },
          ]),
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [athleteData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-dark text-white' : 'bg-white text-dark'} min-h-screen p-8`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Performance Insights</h1>
          <p className="text-gray-400">
            Personalized analysis and recommendations powered by AI
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {theme === 'dark' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-800" />}
        </button>
      </div>

      {/* Motivational Quote */}
      {motivationalQuote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-xl text-center mb-8"
        >
          <FaLightbulb className="text-yellow-500 text-3xl mx-auto mb-4" />
          <p className="text-xl italic mb-2">"{motivationalQuote.text}"</p>
          <p className="text-gray-400">- {motivationalQuote.author}</p>
        </motion.div>
      )}

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaChartLine className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Performance Trend</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #666',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Your Performance"
                  stroke="#646cff"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  name="Benchmark"
                  stroke="#888"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Strength Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaChartBar className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Strength Analysis</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strengthMetrics}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="attribute" stroke="#888" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
                <Radar
                  name="Your Stats"
                  dataKey="value"
                  stroke="#646cff"
                  fill="#646cff"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="#888"
                  fill="#888"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Nutrition Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaUtensils className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Nutrition Plans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nutritionPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">{plan.day}</h3>
              <ul className="text-sm text-gray-400 mb-3">
                {plan.meals.map((meal, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaHeartbeat className="text-red-500" />
                    {meal}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400">Calories: {plan.calories}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recovery Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaBed className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Recovery Metrics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recoveryMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-4 rounded-lg"
            >
              <h3 className="font-semibold mb-2">{metric.type}</h3>
              <p className="text-sm text-gray-400 mb-2">
                Value: {metric.value} / Target: {metric.target}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(metric.value / metric.target) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Overall Growth Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Overall Growth</h2>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #666',
                }}
              />
              <Line
                type="monotone"
                dataKey="performance"
                name="Performance"
                stroke="#646cff"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke="#ff6464"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="nutrition"
                name="Nutrition"
                stroke="#64ff64"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* AI Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaBrain className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">AI-Generated Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 p-4 rounded-lg cursor-pointer"
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-center gap-2 mb-2">
                {insight.type === 'performance' && <FaChartLine className="text-blue-500" />}
                {insight.type === 'training' && <FaDumbbell className="text-green-500" />}
                {insight.type === 'nutrition' && <FaHeartbeat className="text-red-500" />}
                {insight.type === 'recovery' && <FaRunning className="text-purple-500" />}
                <h3 className="font-semibold">{insight.title}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${getPriorityColor(insight.priority)}`}>
                  {insight.priority.toUpperCase()} Priority
                </span>
                <span className="text-xs text-gray-500">
                  {insight.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Selected Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark p-6 rounded-xl max-w-lg w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                {selectedInsight.type === 'performance' && <FaChartLine className="text-blue-500 text-2xl" />}
                {selectedInsight.type === 'training' && <FaDumbbell className="text-green-500 text-2xl" />}
                {selectedInsight.type === 'nutrition' && <FaHeartbeat className="text-red-500 text-2xl" />}
                {selectedInsight.type === 'recovery' && <FaRunning className="text-purple-500 text-2xl" />}
                <h2 className="text-2xl font-bold">{selectedInsight.title}</h2>
              </div>
              <p className="text-gray-300 mb-4">{selectedInsight.description}</p>
              <div className="bg-white/5 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">AI Recommendation:</h3>
                <p className="text-gray-400">{selectedInsight.recommendation}</p>
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedInsight(null)}
                  className="bg-primary hover:bg-secondary px-4 py-2 rounded-lg"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateInsights}
          className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
        >
          <FaRocket className="text-2xl text-primary mb-2" />
          <h3 className="font-semibold">Refresh Insights</h3>
          <p className="text-sm text-gray-400">Get new AI analysis</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateQuote}
          className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors"
        >
          <FaRegSmile className="text-2xl text-yellow-500 mb-2" />
          <h3 className="font-semibold">New Quote</h3>
          <p className="text-sm text-gray-400">Get inspired</p>
        </motion.button>
      </div>
    </div>
  );
};

export default AIInsights;