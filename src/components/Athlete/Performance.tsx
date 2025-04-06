import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaBolt,
  FaHeartbeat,
  FaTrophy,
  FaBed,
  FaChartLine,
  FaDumbbell,
  FaWeight,
  FaRulerVertical,
  FaPercentage,
  FaFire,
  FaBrain,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
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
  BarChart,
  Bar,
} from "recharts";
import type { AthleteData } from "./AthleteDashboard";
import { getPerformancePredictions } from "../services/gemini";

interface PerformanceProps {
  athleteData: AthleteData;
}

interface BodyMetrics {
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
  bmi: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  icon: JSX.Element;
  type: "personal" | "competition" | "milestone";
}

interface PerformanceMetric {
  date: string;
  speed: number;
  strength: number;
  endurance: number;
  agility: number;
  technique: number;
}

const Performance = ({ athleteData }: PerformanceProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("month");
  const [bodyMetrics] = useState<BodyMetrics>({
    weight: 75,
    height: 180,
    bodyFat: 15,
    muscleMass: 45,
    bmi: 23.1,
  });
  const [bodyMetricsHistory, setBodyMetricsHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [recentImprovements, setRecentImprovements] = useState<
    { metric: string; change: string; trend: string; period: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic performance predictions every 30 seconds
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      try {
        const predictions = await getPerformancePredictions();
        console.log("API Response:", predictions);

        setRecentImprovements([
          {
            metric: "Sprint Speed",
            change: predictions.sprintSpeed,
            trend: "up",
            period: "30 days",
          },
          {
            metric: "Strength",
            change: predictions.strength,
            trend: "up",
            period: "30 days",
          },
          {
            metric: "Endurance",
            change: predictions.endurance,
            trend: "up",
            period: "30 days",
          },
          {
            metric: "Body Fat",
            change: predictions.bodyFat,
            trend: "down",
            period: "30 days",
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch performance predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately
    fetchPerformanceData();

    // Fetch data every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Log state changes
  useEffect(() => {
    console.log("Recent Improvements Updated:", recentImprovements);
  }, [recentImprovements]);

  // Generate sample performance data
  useEffect(() => {
    const generateData = () => {
      const data: PerformanceMetric[] = [];
      const now = new Date();
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString(),
          speed: 70 + Math.random() * 20 + i / 2,
          strength: 65 + Math.random() * 25 + i / 3,
          endurance: 75 + Math.random() * 15 + i / 4,
          agility: 80 + Math.random() * 10 + i / 2,
          technique: 85 + Math.random() * 10 + i / 3,
        });
      }
      setPerformanceData(data);

      // Generate body metrics history
      const metricsHistory = [];
      for (let i = 12; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        metricsHistory.push({
          date: date.toLocaleDateString(),
          weight: 75 - i / 4 + Math.random(),
          bodyFat: 15 - i / 6 + Math.random(),
          muscleMass: 45 + i / 8 + Math.random(),
        });
      }
      setBodyMetricsHistory(metricsHistory);

      // Sample achievements
      setAchievements([
        {
          id: "1",
          title: "Speed Milestone",
          description: "Achieved top sprint speed of 32 km/h",
          date: new Date(),
          icon: <FaBolt className="text-yellow-500" />,
          type: "personal",
        },
        {
          id: "2",
          title: "Strength Record",
          description: "New personal best in bench press: 100kg",
          date: new Date(Date.now() - 86400000),
          icon: <FaDumbbell className="text-blue-500" />,
          type: "personal",
        },
        {
          id: "3",
          title: "Tournament Victory",
          description: "First place in regional championship",
          date: new Date(Date.now() - 172800000),
          icon: <FaTrophy className="text-yellow-500" />,
          type: "competition",
        },
      ]);
    };

    generateData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <FaArrowUp className="text-green-500" />;
      case "down":
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaMinus className="text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
          <p className="text-gray-400">
            Track your progress and achievements in {athleteData.sport}
          </p>
        </div>
      </div>

      {/* Quick Stats & Recent Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Show loading skeleton or spinner
          Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 p-6 rounded-xl"
            >
              <div className="animate-pulse">
                <div className="h-6 w-24 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-700 rounded mb-1"></div>
                <div className="h-4 w-32 bg-gray-700 rounded"></div>
              </div>
            </motion.div>
          ))
        ) : (
          // Show actual data
          recentImprovements.map((improvement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{improvement.metric}</h3>
                {getTrendIcon(improvement.trend)}
              </div>
              <div className="text-2xl font-bold mb-1">{improvement.change}</div>
              <p className="text-sm text-gray-400">Last {improvement.period}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Performance Trends</h2>
          </div>
          <div className="flex gap-2">
            {["month"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe as any)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedTimeframe === timeframe
                    ? "bg-primary text-white"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid #666",
                }}
              />
              <Line type="monotone" dataKey="speed" name="Speed" stroke="#646cff" strokeWidth={2} />
              <Line type="monotone" dataKey="strength" name="Strength" stroke="#ff7043" strokeWidth={2} />
              <Line type="monotone" dataKey="endurance" name="Endurance" stroke="#4caf50" strokeWidth={2} />
              <Line type="monotone" dataKey="technique" name="Technique" stroke="#ff4081" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Body Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaWeight className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Body Composition</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaWeight className="text-blue-500" />
                <span>Weight</span>
              </div>
              <div className="text-2xl font-bold">{bodyMetrics.weight} kg</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaRulerVertical className="text-green-500" />
                <span>Height</span>
              </div>
              <div className="text-2xl font-bold">{bodyMetrics.height} cm</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaPercentage className="text-red-500" />
                <span>Body Fat</span>
              </div>
              <div className="text-2xl font-bold">{bodyMetrics.bodyFat}%</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaDumbbell className="text-purple-500" />
                <span>Muscle Mass</span>
              </div>
              <div className="text-2xl font-bold">{bodyMetrics.muscleMass}%</div>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bodyMetricsHistory.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid #666",
                  }}
                />
                <Bar dataKey="weight" name="Weight" fill="#646cff" />
                <Bar dataKey="bodyFat" name="Body Fat %" fill="#ff4081" />
                <Bar dataKey="muscleMass" name="Muscle Mass" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaChartBar className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Skill Analysis</h2>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: "Speed", A: 85 },
                { subject: "Strength", A: 80 },
                { subject: "Endurance", A: 75 },
                { subject: "Agility", A: 90 },
                { subject: "Technique", A: 85 },
                { subject: "Mental", A: 88 },
              ]}>
                <PolarGrid stroke="#444" />
                <PolarAngleAxis dataKey="subject" stroke="#888" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
                <Radar name="Skills" dataKey="A" stroke="#646cff" fill="#646cff" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaTrophy className="text-yellow-500 text-2xl" />
          <h2 className="text-xl font-semibold">Recent Achievements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-4 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                {achievement.icon}
                <h3 className="font-semibold">{achievement.title}</h3>
              </div>
              <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
              <p className="text-xs text-gray-500">{achievement.date.toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Training Load & Recovery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaHeartbeat className="text-red-500 text-2xl" />
          <h2 className="text-xl font-semibold">Training Load & Recovery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Weekly Training Load</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span>Current</span>
                    <span className="text-primary">850 AU</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: "75%" }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Target</div>
                  <div>1000 AU</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Recovery Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span>Current</span>
                    <span className="text-green-500">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2" style={{ width: "85%" }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="text-green-500">Optimal</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Recovery Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaBed className="text-purple-500 mt-1" />
                <div>
                  <p className="font-semibold">Sleep Quality</p>
                  <p className="text-sm text-gray-400">
                    Maintain 8+ hours of sleep for optimal recovery
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaFire className="text-orange-500 mt-1" />
                <div>
                  <p className="font-semibold">Active Recovery</p>
                  <p className="text-sm text-gray-400">
                    Light mobility work recommended for next session
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaBrain className="text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">Mental Recovery</p>
                  <p className="text-sm text-gray-400">
                    Practice mindfulness for 10 minutes daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Performance;