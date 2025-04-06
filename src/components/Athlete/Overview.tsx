import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaWalking, FaFire, FaBed, FaTint } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { AthleteData } from './AthleteDashboard';

interface OverviewProps {
  athleteData: AthleteData;
}

const Overview = ({ athleteData }: OverviewProps) => {
  // Check if user is new
  const isNewUser = !athleteData.hasPreviousData;

  // Default stats for a new user
  const defaultStats = {
    heartRate: 0,
    steps: 0,
    calories: 0,
    sleep: 0,
    hydration: 0
  };

  // Load real-time stats from database/local storage
  const [liveStats, setLiveStats] = useState(isNewUser ? defaultStats : athleteData.stats);

  // Weekly progress data (only available if user has history)
  const weeklyProgress = !isNewUser
    ? [
        { day: 'Mon', steps: 5000, calories: 1200, hydration: 60, sleep: 6.5 },
        { day: 'Tue', steps: 7000, calories: 1300, hydration: 65, sleep: 7.0 },
        { day: 'Wed', steps: 8500, calories: 1400, hydration: 70, sleep: 6.8 },
        { day: 'Thu', steps: 9000, calories: 1500, hydration: 75, sleep: 7.2 },
        { day: 'Fri', steps: 10000, calories: 1600, hydration: 80, sleep: 7.5 },
        { day: 'Sat', steps: 11000, calories: 1750, hydration: 85, sleep: 8.0 },
        { day: 'Sun', steps: 12000, calories: 1800, hydration: 90, sleep: 8.5 }
      ]
    : null;

  // Generate AI insights only if data exists
  const generateInsights = () => {
    if (isNewUser) {
      return [
        "Welcome to your fitness journey! Start tracking your progress to unlock personalized insights.",
        "Set a daily step goal to stay active and motivated.",
        "Track your hydration to ensure you're drinking enough water throughout the day.",
        "Log your meals to monitor calorie intake and maintain a balanced diet.",
        "Prioritize sleep for better recovery and performance."
      ];
    }

    const insights = [];
    if (liveStats.hydration < 70) insights.push("Your hydration is below target. Aim for at least 3 liters of water daily.");
    if (liveStats.sleep < 7) insights.push("Increase sleep duration to 7-9 hours for optimal recovery.");
    if (liveStats.calories < 1300) insights.push("Increase calorie intake to fuel your workouts and recovery.");
    if (liveStats.steps < 5000) insights.push("Aim for at least 5,000 steps daily to stay active.");
    if (liveStats.heartRate > 100) insights.push("Your heart rate is elevated. Consider taking a break or practicing deep breathing.");
    return insights.length ? insights : ["Keep up the great work! You're on track."];
  };

  // Simulate real-time updates (only for returning users)
  useEffect(() => {
    if (!isNewUser) {
      const interval = setInterval(() => {
        setLiveStats((prevStats: { steps: number; calories: number; }) => ({
          ...prevStats,
          heartRate: 75 + Math.floor(Math.random() * 10),
          steps: prevStats.steps + Math.floor(Math.random() * 200),
          calories: prevStats.calories + Math.floor(Math.random() * 50)
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isNewUser]);

  const aiInsights = generateInsights();

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {athleteData.name}! 👋</h1>
          <p className="text-gray-400">{isNewUser ? "Start tracking your fitness journey!" : "Here's your daily progress and insights"}</p>
        </div>
      </motion.div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Heart Rate", value: `${liveStats.heartRate} BPM`, icon: <FaHeartbeat className="text-red-500" /> },
          { label: "Steps", value: liveStats.steps, icon: <FaWalking className="text-blue-500" /> },
          { label: "Calories", value: `${liveStats.calories} kcal`, icon: <FaFire className="text-orange-500" /> },
          { label: "Sleep", value: `${liveStats.sleep} hrs`, icon: <FaBed className="text-purple-500" /> },
          { label: "Hydration", value: `${liveStats.hydration}%`, icon: <FaTint className="text-blue-500" /> }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white/10 backdrop-blur-lg p-4 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              {stat.icon}
              <span className="text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">AI Insights 🤖</h2>
        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }} className="flex items-center gap-3 text-gray-300">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p>{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Progress Chart (Only for returning users) */}
      {!isNewUser && weeklyProgress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Weekly Steps & Calories 📈</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="steps" stroke="#4A90E2" strokeWidth={2} />
                <Line type="monotone" dataKey="calories" stroke="#FF7043" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Hydration & Sleep Quality 💧😴</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="hydration" fill="#4A90E2" />
                <Bar dataKey="sleep" fill="#FF7043" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Overview;