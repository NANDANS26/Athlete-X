import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaRobot, FaRunning, FaHeartbeat, FaBrain, FaDumbbell, FaStopwatch } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import athletesData from '../config/athlete.json';

interface RawPlayer {
  Name: string;
  Age: number;
  "Height (cm)": number;
  "Weight (kg)": number;
  Position: string;
  "Bench Press (kg)": number;
  "Squat (kg)": number;
  "Sprint Time (sec)": number;
  "Vertical Jump (cm)": number;
  "Max Running Distance (km)": number;
  Awards: string | null;
  Image: string;
}

interface Athlete {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  position: string;
  metrics: {
    benchPress: number;
    squat: number;
    sprintTime: number;
    verticalJump: number;
    maxRunningDistance: number;
    speed: number;
    strength: number;
    endurance: number;
    agility: number;
    recovery: number;
    mentalHealth: number;
  };
  skillScore: number;
  recentTrend: 'up' | 'down' | 'stable';
  awards?: string;
  image: string;
}

const AthletePerformanceTracking = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric] = useState('speed');
  const [performanceData, setPerformanceData] = useState<{date: string, speed: number, strength: number, endurance: number, agility: number}[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

  // Load and transform athlete data
  useEffect(() => {
    const footballPlayers = (athletesData as {Football: RawPlayer[]}).Football;
    
    const formattedAthletes = footballPlayers.map((player) => {
      const speedScore = Math.min(100, 100 - (player["Sprint Time (sec)"] * 10));
      const strengthScore = (player["Bench Press (kg)"] * 0.4 + player["Squat (kg)"] * 0.6) / 2;
      const enduranceScore = Math.min(100, player["Max Running Distance (km)"] * 2);
      const agilityScore = Math.min(100, player["Vertical Jump (cm)"] * 2);

      return {
        id: player.Name.toLowerCase().replace(/\s+/g, '-'),
        name: player.Name,
        age: player.Age,
        height: player["Height (cm)"],
        weight: player["Weight (kg)"],
        position: player.Position,
        metrics: {
          benchPress: player["Bench Press (kg)"],
          squat: player["Squat (kg)"],
          sprintTime: player["Sprint Time (sec)"],
          verticalJump: player["Vertical Jump (cm)"],
          maxRunningDistance: player["Max Running Distance (km)"],
          speed: speedScore,
          strength: strengthScore,
          endurance: enduranceScore,
          agility: agilityScore,
          recovery: 70 + Math.random() * 25,
          mentalHealth: 70 + Math.random() * 25,
        },
        skillScore: Math.floor(
          speedScore * 0.2 +
          strengthScore * 0.2 +
          enduranceScore * 0.2 +
          agilityScore * 0.2 +
          (70 + Math.random() * 25) * 0.2
        ),
        recentTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        awards: player.Awards || undefined,
        image: player.Image,
      };
    });

    setAthletes(formattedAthletes);
  }, []);

  // Generate performance data
  useEffect(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(),
        speed: 70 + Math.random() * 20,
        strength: 65 + Math.random() * 25,
        endurance: 75 + Math.random() * 15,
        agility: 80 + Math.random() * 10,
      });
    }
    
    setPerformanceData(data);
  }, []);

  const filteredAthletes = useMemo(() => {
    return athletes.filter(athlete => 
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [athletes, searchQuery]);

  const getMetricColor = (value: number) => {
    if (value >= 85) return 'text-green-500';
    if (value >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatNumber = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  const renderMetricCard = (title: string, value: number, icon: JSX.Element, unit?: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 p-4 rounded-lg flex flex-col gap-2"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary text-xl">{icon}</div>
        <div>
          <h3 className="font-medium text-sm text-gray-300">{title}</h3>
          <p className={`text-xl font-bold ${getMetricColor(value)}`}>
            {formatNumber(value)}
            {unit && <span className="text-sm ml-1 text-gray-400">{unit}</span>}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
        <div
          className={`h-1.5 rounded-full ${
            value >= 85 ? 'bg-green-500' : 
            value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athletes..."
            className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Athlete List */}
        <div className="lg:col-span-1 bg-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4 text-white">Athletes</h2>
          <div className="space-y-3">
            {filteredAthletes.map((athlete) => (
              <motion.div
                key={athlete.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAthlete(athlete)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedAthlete?.id === athlete.id ? 'bg-blue-500/20' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-white">{athlete.name}</h3>
                    <p className="text-sm text-gray-300">{athlete.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{athlete.skillScore}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {selectedAthlete ? (
            <>
              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-700 pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-t-lg ${
                    activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-t-lg ${
                    activeTab === 'analysis' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Analysis
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Athlete Profile */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img
                          src={selectedAthlete.image}
                          alt={selectedAthlete.name}
                          className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                        />
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white">{selectedAthlete.name}</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-gray-400">Age</p>
                              <p className="text-white">{selectedAthlete.age}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Height</p>
                              <p className="text-white">{selectedAthlete.height} cm</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Weight</p>
                              <p className="text-white">{selectedAthlete.weight} kg</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-sm text-gray-400">Skill Score</p>
                          <p className="text-3xl font-bold text-blue-400">{selectedAthlete.skillScore}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Performance Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {renderMetricCard('Speed', selectedAthlete.metrics.speed, <FaRunning />)}
                        {renderMetricCard('Strength', selectedAthlete.metrics.strength, <FaDumbbell />)}
                        {renderMetricCard('Endurance', selectedAthlete.metrics.endurance, <FaStopwatch />)}
                        {renderMetricCard('Agility', selectedAthlete.metrics.agility, <FaRunning />)}
                        {renderMetricCard('Recovery', selectedAthlete.metrics.recovery, <FaHeartbeat />)}
                        {renderMetricCard('Mental', selectedAthlete.metrics.mentalHealth, <FaBrain />)}
                      </div>
                    </div>

                    {/* Physical Stats */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Physical Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {renderMetricCard('Bench', selectedAthlete.metrics.benchPress, <FaDumbbell />, 'kg')}
                        {renderMetricCard('Squat', selectedAthlete.metrics.squat, <FaDumbbell />, 'kg')}
                        {renderMetricCard('Sprint', selectedAthlete.metrics.sprintTime, <FaRunning />, 's')}
                        {renderMetricCard('Jump', selectedAthlete.metrics.verticalJump, <FaRunning />, 'cm')}
                      </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Performance Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey={selectedMetric}
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Radar Chart */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white">Skills Radar</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={[
                              { subject: 'Speed', A: selectedAthlete.metrics.speed },
                              { subject: 'Strength', A: selectedAthlete.metrics.strength },
                              { subject: 'Endurance', A: selectedAthlete.metrics.endurance },
                              { subject: 'Agility', A: selectedAthlete.metrics.agility },
                              { subject: 'Recovery', A: selectedAthlete.metrics.recovery },
                              { subject: 'Mental', A: selectedAthlete.metrics.mentalHealth },
                            ]}
                          >
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                            <Radar
                              name="Athlete"
                              dataKey="A"
                              stroke="#3B82F6"
                              fill="#3B82F6"
                              fillOpacity={0.3}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                borderColor: '#374151',
                                borderRadius: '0.5rem',
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <FaRobot className="text-blue-400" /> AI Recommendations
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-400 mb-2">Strength Training</h4>
                          <p className="text-gray-300">
                            Focus on maintaining your current strength levels with 3 sessions per week.
                          </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-400 mb-2">Endurance</h4>
                          <p className="text-gray-300">
                            Incorporate interval training twice weekly to improve your endurance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="bg-gray-800 rounded-xl p-8 flex items-center justify-center h-64">
              <p className="text-gray-400">Select an athlete to view performance data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthletePerformanceTracking;