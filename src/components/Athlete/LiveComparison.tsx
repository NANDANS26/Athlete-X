import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartLine, FaDumbbell, FaBrain, FaUsers, 
  FaTrophy, FaRunning, FaCrown, FaHistory, 
  FaUserFriends, FaMedal, FaStar} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell,
  Legend
} from 'recharts';
import athletesData from '../config/athlete.json';

// In LiveComparison.tsx, update the Athlete interface to:
interface Athlete {
  name: string;       // Changed from Name to name
  sport: string;
  position: string;   // Keep as is
  fitnessLevel?: string;
  age?: number;       // Optional
  [key: string]: any; // Keep the index signature
}

interface ComparisonMetric {
  category: string;
  athlete: number;
  pastBest: number;
  average: number;
  top: number;
}

interface ProgressData {
  date: string;
  performance: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  position: string;
  score: number;
  image?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const LiveComparison = ({ athleteData }: { athleteData: Athlete }) => {
  const [comparisonType, setComparisonType] = useState<'self' | 'peers' | 'elite'>('peers');
  const [fitnessMetrics, setFitnessMetrics] = useState<ComparisonMetric[]>([]);
  const [skillMetrics, setSkillMetrics] = useState<ComparisonMetric[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRank, setCurrentRank] = useState('Top 15%');
  const [improvement] = useState(12.5);

  const getRandomValue = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getSportAthletes = (): Athlete[] => {
    return (athletesData as any)[athleteData.sport] || [];
  };

  const getPeerAthletes = (): Athlete[] => {
    return getSportAthletes().filter((a: Athlete) => 
      a.Position === athleteData.Position && 
      a.Name !== athleteData.Name
    );
  };

  const getEliteAthletes = (): Athlete[] => {
    return [...getSportAthletes()]
      .sort((a: Athlete, b: Athlete) => (b['Bench Press (kg)'] || 0) - (a['Bench Press (kg)'] || 0))
      .slice(0, 5);
  };

  const calculateAverages = (athletes: Athlete[], metric: string): number => {
    const values = athletes.map(a => a[metric]).filter(v => v !== undefined) as number[];
    if (values.length === 0) return getRandomValue(50, 80);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const generateLeaderboard = (): LeaderboardEntry[] => {
    return getSportAthletes()
      .map((athlete) => ({
        name: athlete.Name,
        position: athlete.Position,
        score: calculateAthleteScore(athlete),
        image: athlete.Image
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))
      .slice(0, 10);
  };

  const calculateAthleteScore = (athlete: Athlete): number => {
    const strength = athlete['Bench Press (kg)'] || getRandomValue(70, 120);
    const speed = 100 - ((athlete['Sprint Time (sec)'] || getRandomValue(4, 6)) * 10);
    const endurance = athlete['Max Running Distance (km)'] || getRandomValue(5, 15);
    return (strength + speed + endurance) / 3;
  };

  useEffect(() => {
    const generateData = () => {
      setLoading(true);
      
      // Generate progress data (last 7 days)
      const progress: ProgressData[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        progress.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          performance: getRandomValue(70, 90)
        });
      }
      setProgressData(progress);

      // Generate leaderboard
      setLeaderboard(generateLeaderboard());

      // Get comparison groups
      let comparisonGroup: Athlete[] = [];
      if (comparisonType === 'peers') {
        comparisonGroup = getPeerAthletes();
        setCurrentRank(`Top ${getRandomValue(10, 20)}%`);
      } else if (comparisonType === 'elite') {
        comparisonGroup = getEliteAthletes();
        setCurrentRank(`Top ${getRandomValue(1, 5)}%`);
      }

      // Generate fitness metrics
      const fitness: ComparisonMetric[] = [
        {
          category: 'Bench Press',
          athlete: athleteData['Bench Press (kg)'] || getRandomValue(70, 120),
          pastBest: (athleteData['Bench Press (kg)'] || getRandomValue(80, 130)) * 1.1,
          average: calculateAverages(comparisonGroup, 'Bench Press (kg)'),
          top: Math.max(...comparisonGroup.map(a => a['Bench Press (kg)'] || getRandomValue(100, 150)))
        },
        {
          category: 'Squat',
          athlete: athleteData['Squat (kg)'] || getRandomValue(90, 150),
          pastBest: (athleteData['Squat (kg)'] || getRandomValue(100, 160)) * 1.1,
          average: calculateAverages(comparisonGroup, 'Squat (kg)'),
          top: Math.max(...comparisonGroup.map(a => a['Squat (kg)'] || getRandomValue(120, 180)))
        },
        {
          category: 'Vertical Jump',
          athlete: athleteData['Vertical Jump (cm)'] || getRandomValue(50, 70),
          pastBest: (athleteData['Vertical Jump (cm)'] || getRandomValue(55, 75)) * 1.05,
          average: calculateAverages(comparisonGroup, 'Vertical Jump (cm)'),
          top: Math.max(...comparisonGroup.map(a => a['Vertical Jump (cm)'] || getRandomValue(60, 80)))
        },
        {
          category: 'Sprint Time',
          athlete: athleteData['Sprint Time (sec)'] || getRandomValue(4, 6),
          pastBest: (athleteData['Sprint Time (sec)'] || getRandomValue(3.8, 5.5)) * 0.95,
          average: calculateAverages(comparisonGroup, 'Sprint Time (sec)'),
          top: Math.min(...comparisonGroup.map(a => a['Sprint Time (sec)'] || getRandomValue(3.5, 5)))
        }
      ];
      setFitnessMetrics(fitness);

      // Generate skill metrics
      let skills: ComparisonMetric[] = [];
      if (athleteData.Position === 'Javelin Throw') {
        skills = [
          {
            category: 'Throw Distance',
            athlete: athleteData['Throw Distance (m)'] || getRandomValue(75, 85),
            pastBest: 89.94,
            average: getRandomValue(70, 80),
            top: 90.0
          },
          {
            category: 'Run-up Speed',
            athlete: athleteData['Run-up Speed (km/h)'] || getRandomValue(25, 30),
            pastBest: getRandomValue(28, 32),
            average: getRandomValue(24, 28),
            top: getRandomValue(30, 35)
          },
          {
            category: 'Release Angle',
            athlete: athleteData['Release Angle (°)'] || getRandomValue(32, 38),
            pastBest: getRandomValue(35, 40),
            average: getRandomValue(30, 36),
            top: getRandomValue(38, 42)
          },
          {
            category: 'Consistency',
            athlete: athleteData['Consistency Score'] || getRandomValue(75, 85),
            pastBest: getRandomValue(85, 90),
            average: getRandomValue(70, 80),
            top: getRandomValue(90, 95)
          }
        ];
      } else {
        skills = [
          {
            category: 'Performance',
            athlete: getRandomValue(70, 90),
            pastBest: getRandomValue(80, 95),
            average: getRandomValue(65, 80),
            top: getRandomValue(90, 100)
          },
          {
            category: 'Technique',
            athlete: getRandomValue(75, 85),
            pastBest: getRandomValue(80, 90),
            average: getRandomValue(70, 80),
            top: getRandomValue(90, 95)
          },
          {
            category: 'Endurance',
            athlete: getRandomValue(70, 85),
            pastBest: getRandomValue(75, 90),
            average: getRandomValue(65, 80),
            top: getRandomValue(85, 95)
          },
          {
            category: 'Agility',
            athlete: getRandomValue(65, 80),
            pastBest: getRandomValue(70, 85),
            average: getRandomValue(60, 75),
            top: getRandomValue(80, 90)
          }
        ];
      }
      setSkillMetrics(skills);

      // Generate AI insights
      const newInsights = [
        `Your ${fitness[0].category} is ${fitness[0].athlete > fitness[0].average ? 'above' : 'below'} average`,
        `Consider focusing on ${fitness.sort((a,b) => (a.athlete/a.average) - (b.athlete/b.average))[0].category} for improvement`,
        comparisonType === 'elite' ? 
          "Elite comparison shows areas needing work to reach top level" :
          "Peer comparison shows you're competitive in your group",
        "Your recovery rate is excellent - maintain your current sleep and nutrition habits",
        "Try adding plyometric exercises 2x/week to improve your vertical jump"
      ];
      setInsights(newInsights);

      setLoading(false);
    };

    generateData();
  }, [athleteData, comparisonType]);

  const comparisonTypes = [
    { id: 'self', label: 'Self Comparison', icon: FaHistory },
    { id: 'peers', label: 'Peer Comparison', icon: FaUserFriends },
    { id: 'elite', label: 'Elite Benchmarking', icon: FaCrown },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Radar chart data
  const radarData = skillMetrics.map(metric => ({
    subject: metric.category,
    A: metric.athlete,
    B: metric.average,
    C: metric.top,
    fullMark: 100
  }));

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Performance Comparison</h1>
          <p className="text-gray-400">
            Comparing {athleteData.Name} in {athleteData.sport}
          </p>
        </div>
      </div>

      {/* Comparison Type Selection */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <FaUsers className="text-primary text-lg" />
          <h3 className="font-semibold">Comparison Type</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {comparisonTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setComparisonType(type.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm
                ${comparisonType === type.id
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              <type.icon />
              {type.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Personal Performance Overview */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Personal Performance Overview</h2>
          </div>
          <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
            <span className="text-sm font-medium">Current Rank:</span>
            <span className="font-bold">{currentRank}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Graph */}
          <div className="md:col-span-2 h-64">
            <h3 className="text-lg font-medium mb-3">Last 7 Days Performance</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
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
                  stroke="#646cff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Performance Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Improvement</span>
                <span className="font-bold text-green-400">
                  {improvement}% {improvement > 0 ? '↑' : '↓'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Consistency Score</span>
                <span className="font-bold text-green-400">88/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Peak Performance</span>
                <span className="font-bold text-yellow-400">92</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fitness & Strength Metrics */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaDumbbell className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Fitness & Strength Metrics</h2>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Metric</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">You</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Your Past Best</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  {comparisonType === 'self' ? 'Current Average' : 
                   comparisonType === 'peers' ? 'Peer Average' : 'Elite Average'}
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  {comparisonType === 'self' ? 'Your Target' : 
                   comparisonType === 'peers' ? 'Top Peer' : 'World Record'}
                </th>
              </tr>
            </thead>
            <tbody>
              {fitnessMetrics.map((metric, index) => {
                const isAboveAverage = metric.athlete > metric.average;
                const isBelowPast = metric.athlete < metric.pastBest;
                
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">{metric.category}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      isAboveAverage ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.athlete.toFixed(1)}
                    </td>
                    <td className={`py-3 px-4 text-right ${
                      isBelowPast ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {metric.pastBest.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {metric.average.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-yellow-400 font-medium">
                      {metric.top.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Performance Comparison Bar Chart */}
        <div className="h-80">
          <h3 className="text-lg font-medium mb-3">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={fitnessMetrics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#888" />
              <YAxis dataKey="category" type="category" stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #666',
                }}
              />
              <Bar dataKey="athlete" name="You" animationDuration={1500}>
                {fitnessMetrics.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Skill-Based Comparisons */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaRunning className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">
            {athleteData.Position} Skill Metrics
          </h2>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Metric</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">You</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Your Past Best</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  {comparisonType === 'self' ? 'Current Average' : 
                   comparisonType === 'peers' ? 'Peer Average' : 'Elite Average'}
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">
                  {comparisonType === 'self' ? 'Your Target' : 
                   comparisonType === 'peers' ? 'Top Peer' : 'World Record'}
                </th>
              </tr>
            </thead>
            <tbody>
              {skillMetrics.map((metric, index) => {
                const isAboveAverage = metric.athlete > metric.average;
                const isBelowPast = metric.athlete < metric.pastBest;
                
                return (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">{metric.category}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      isAboveAverage ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.athlete.toFixed(1)}
                    </td>
                    <td className={`py-3 px-4 text-right ${
                      isBelowPast ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {metric.pastBest.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {metric.average.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right text-yellow-400 font-medium">
                      {metric.top.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Enhanced Skill Radar Chart */}
        <div className="h-96">
          <h3 className="text-lg font-medium mb-3">Skill Radar Chart</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid gridType="circle" stroke="#444" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#fff', fontSize: 12 }}
                stroke="#888"
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#888' }}
                stroke="#888"
              />
              <Radar 
                name="You" 
                dataKey="A" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6} 
                animationDuration={1500}
              />
              <Radar 
                name="Average" 
                dataKey="B" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.4} 
                animationDuration={1500}
              />
              <Radar 
                name="Top" 
                dataKey="C" 
                stroke="#ffc658" 
                fill="#ffc658" 
                fillOpacity={0.3} 
                animationDuration={1500}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid #666',
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaTrophy className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">
            {athleteData.sport} Leaderboard
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Athlete</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Position</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Performance Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} className={`border-b border-white/5 hover:bg-white/5 ${
                  entry.name === athleteData.Name ? 'bg-primary/10' : ''
                }`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 ? (
                        <FaMedal className={
                          entry.rank === 1 ? 'text-yellow-400' : 
                          entry.rank === 2 ? 'text-gray-300' : 'text-amber-600'
                        } />
                      ) : (
                        <span className="text-gray-400">{entry.rank}</span>
                      )}
                      {entry.name === athleteData.Name && <FaStar className="text-yellow-400" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {entry.image && (
                        <img 
                          src={entry.image} 
                          alt={entry.name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className={entry.name === athleteData.Name ? 'font-bold text-primary' : ''}>
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{entry.position}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {entry.score.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI Insights & Suggestions */}
      <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaBrain className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">AI Insights & Suggestions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/50">
            <h3 className="font-semibold text-green-400 mb-3">Your Strengths</h3>
            <ul className="space-y-2">
              {insights.filter((_, i) => i % 3 === 0).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/50">
            <h3 className="font-semibold text-red-400 mb-3">Areas to Improve</h3>
            <ul className="space-y-2">
              {insights.filter((_, i) => i % 3 === 1).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Plan */}
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
            <h3 className="font-semibold text-blue-400 mb-3">Recommended Action Plan</h3>
            <ul className="space-y-2">
              {insights.filter((_, i) => i % 3 === 2).map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveComparison;