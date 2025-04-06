import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaHeartbeat, FaRunning, FaBrain, FaExclamationTriangle, FaAppleAlt, FaChartBar, FaSearch, FaRobot } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import athleteData from '../config/athlete.json'; // Import the JSON data

interface AthleteInsight {
  id: string;
  name: string;
  sport: string;
  age: number;
  metrics: {
    trainingEfficiency: number;
    nutritionBalance: number;
    recoveryRate: number;
    injuryRisk: number;
    performance: number;
    potential: number;
  };
  trends: {
    date: string;
    performance: number;
    recovery: number;
    nutrition: number;
  }[];
  alerts: {
    type: 'success' | 'warning' | 'danger';
    message: string;
    timestamp: Date;
  }[];
  recommendations: string[];
}

interface AthleteComparison {
  Name: string;
  Age: number;
  Place: string;
  Position: string;
  Awards: string | null;
  Image: string;
  performanceScore: number; // Make this required
}

const AIInsights = () => {
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteInsight | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'performance' | 'nutrition' | 'injury' | 'comparison'>('performance');
  const [comparisonData, setComparisonData] = useState<AthleteComparison[]>([]);

  // Simulate fetching athlete data
  useEffect(() => {
    const mockAthlete: AthleteInsight = {
      id: '1',
      name: 'John Smith',
      sport: 'Football',
      age: 22,
      metrics: {
        trainingEfficiency: 85,
        nutritionBalance: 78,
        recoveryRate: 92,
        injuryRisk: 15,
        performance: 88,
        potential: 95
      },
      trends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        performance: 70 + Math.random() * 20,
        recovery: 75 + Math.random() * 15,
        nutrition: 80 + Math.random() * 10
      })),
      alerts: [
        {
          type: 'warning',
          message: 'Slight decrease in recovery rate detected',
          timestamp: new Date()
        }
      ],
      recommendations: [
        'Increase protein intake by 20g daily',
        'Add two rest days this week',
        'Focus on explosive power training'
      ]
    };

    setSelectedAthlete(mockAthlete);
  }, []);

  // Fetch comparison data based on the selected athlete's sport
  useEffect(() => {
    if (selectedAthlete) {
      const sport = selectedAthlete.sport;
      const athletesInSport = athleteData[sport as keyof typeof athleteData] || [];
      // Add a random performance score to each athlete for ranking
      const athletesWithScores = athletesInSport.map((athlete) => ({
        ...athlete,
        performanceScore: Math.floor(Math.random() * 100) // Ensure this is always defined
      }));
      setComparisonData(athletesWithScores.sort((a, b) => b.performanceScore - a.performanceScore)); // Sort by performance score
    }
  }, [selectedAthlete]);

  // Simulate real-time updates to the leaderboard
  useEffect(() => {
    if (activeTab === 'comparison') {
      const interval = setInterval(() => {
        setComparisonData((prevData) => {
          return prevData
            .map((athlete) => ({
              ...athlete,
              performanceScore: Math.max(0, Math.min(100, athlete.performanceScore + Math.floor(Math.random() * 10 - 5))) // Randomly adjust scores
            }))
            .sort((a, b) => b.performanceScore - a.performanceScore); // Sort by performance score
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [activeTab]);

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaRunning className="text-primary text-xl" />
            <h3 className="font-semibold">Training Efficiency</h3>
          </div>
          <div className="text-3xl font-bold mb-2">
            {selectedAthlete?.metrics.trainingEfficiency}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${selectedAthlete?.metrics.trainingEfficiency}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaHeartbeat className="text-red-500 text-xl" />
            <h3 className="font-semibold">Recovery Rate</h3>
          </div>
          <div className="text-3xl font-bold mb-2">
            {selectedAthlete?.metrics.recoveryRate}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${selectedAthlete?.metrics.recoveryRate}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaBrain className="text-purple-500 text-xl" />
            <h3 className="font-semibold">Performance Potential</h3>
          </div>
          <div className="text-3xl font-bold mb-2">
            {selectedAthlete?.metrics.potential}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${selectedAthlete?.metrics.potential}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-6">Performance Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedAthlete?.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #666'
                }}
              />
              <Line
                type="monotone"
                dataKey="performance"
                name="Performance"
                stroke="#646cff"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaRobot className="text-primary text-xl" />
          <h3 className="text-xl font-semibold">AI Recommendations</h3>
        </div>
        <div className="space-y-4">
          {selectedAthlete?.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-white/5 p-4 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p>{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderNutritionAnalysis = () => (
    <div className="space-y-6">
      {/* Nutrition Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 p-6 rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-6">Macronutrient Balance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Protein', value: 30 },
                    { name: 'Carbs', value: 50 },
                    { name: 'Fats', value: 20 }
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  <Cell fill="#646cff" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 p-6 rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-6">Hydration & Recovery</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Daily Water Intake</span>
                <span className="text-primary">2.8L / 3.5L</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: '80%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Electrolyte Balance</span>
                <span className="text-green-500">Optimal</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2"
                  style={{ width: '95%' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Nutrition Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaAppleAlt className="text-green-500 text-xl" />
          <h3 className="text-xl font-semibold">Nutrition Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Deficiencies Detected</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Iron levels slightly low
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Vitamin D supplementation needed
              </li>
            </ul>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Recommended Foods</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Increase leafy greens intake
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Add fatty fish twice per week
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderInjuryAnalysis = () => (
    <div className="space-y-6">
      {/* Injury Risk Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaExclamationTriangle className="text-yellow-500 text-xl" />
          <h3 className="text-xl font-semibold">Injury Risk Assessment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span>Overall Risk Level</span>
                <span className={selectedAthlete?.metrics.injuryRisk! > 50 ? 'text-red-500' : 'text-green-500'}>
                  {selectedAthlete?.metrics.injuryRisk}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    selectedAthlete?.metrics.injuryRisk! > 50 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${selectedAthlete?.metrics.injuryRisk}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                • Training load: Moderate
              </p>
              <p className="text-sm text-gray-400">
                • Recovery status: Optimal
              </p>
              <p className="text-sm text-gray-400">
                • Previous injuries: None reported
              </p>
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Prevention Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Implement proper warm-up routine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Focus on flexibility training
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Regular recovery sessions
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Body Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <h3 className="text-xl font-semibold mb-6">Body Stress Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {['Knees', 'Lower Back', 'Shoulders', 'Ankles'].map((part, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{part}</h3>
                  <span className="text-green-500">Low Risk</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2"
                    style={{ width: '25%' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="bg-white/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-4">Recovery Protocol</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaHeartbeat className="text-red-500" />
                <div>
                  <p className="font-semibold">Active Recovery</p>
                  <p className="text-sm text-gray-400">
                    Light cardio and mobility work
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaBrain className="text-purple-500" />
                <div>
                  <p className="font-semibold">Mental Recovery</p>
                  <p className="text-sm text-gray-400">
                    Stress management techniques
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderAthleteComparison = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaChartBar className="text-primary text-xl" />
          <h3 className="text-xl font-semibold">Athlete Leaderboard</h3>
        </div>
        <div className="space-y-4">
          {comparisonData.map((athlete, index) => (
            <motion.div
              key={athlete.Name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                  <span className="text-primary font-semibold">{index + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={athlete.Image}
                    alt={athlete.Name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{athlete.Name}</h3>
                    <p className="text-sm text-gray-400">{athlete.Position}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${athlete.performanceScore}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{athlete.performanceScore}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark p-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">AI Performance Insights</h1>
          <p className="text-gray-400">
            AI-powered analysis and recommendations for athlete performance
          </p>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes..."
            className="w-full md:w-64 bg-white/10 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8">
        {[
          { id: 'performance', label: 'Performance', icon: FaChartLine },
          { id: 'nutrition', label: 'Nutrition', icon: FaAppleAlt },
          { id: 'injury', label: 'Injury Analysis', icon: FaExclamationTriangle },
          { id: 'comparison', label: 'Athlete Comparison', icon: FaChartBar }
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <tab.icon />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'performance' && renderPerformanceAnalysis()}
        {activeTab === 'nutrition' && renderNutritionAnalysis()}
        {activeTab === 'injury' && renderInjuryAnalysis()}
        {activeTab === 'comparison' && renderAthleteComparison()}
      </AnimatePresence>
    </div>
  );
};

export default AIInsights;