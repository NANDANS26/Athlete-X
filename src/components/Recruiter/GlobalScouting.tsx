import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaRobot, FaStar, FaChartLine, FaGlobe, FaUserPlus, FaVideo, FaBrain, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Athlete {
  id: string;
  name: string;
  age: number;
  sport: string;
  country: string;
  position: string;
  skillScore: number;
  recentPerformance: string;
  strengths: string[];
  weaknesses: string[];
  recruitmentInterest: number;
  image: string;
  metrics: {
    speed: number;
    strength: number;
    endurance: number;
    agility: number;
    mentalStrength: number;
    injuryRisk: number;
  };
  recentMatches: {
    date: string;
    opponent: string;
    performance: number;
    highlights: string;
  }[];
  wearableData?: {
    heartRate: number;
    distance: number;
    intensity: number;
    recovery: number;
  };
}

interface Filter {
  sport: string;
  country: string;
  ageRange: string;
  skillLevel: string;
  position: string;
  injuryRisk: string;
}

const GlobalScouting = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filter>({
    sport: '',
    country: '',
    ageRange: '',
    skillLevel: '',
    position: '',
    injuryRisk: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);

  // Simulate fetching athletes data
  useEffect(() => {
    const mockAthletes: Athlete[] = [
      {
        id: '1',
        name: 'Alex Johnson',
        age: 19,
        sport: 'Football',
        country: 'England',
        position: 'Forward',
        skillScore: 92,
        recentPerformance: 'Scored 3 goals in last match',
        strengths: ['Speed', 'Ball Control', 'Shot Accuracy'],
        weaknesses: ['Aerial Duels'],
        recruitmentInterest: 85,
        image: 'https://i.pravatar.cc/150?img=1',
        metrics: {
          speed: 90,
          strength: 85,
          endurance: 88,
          agility: 92,
          mentalStrength: 85,
          injuryRisk: 15
        },
        recentMatches: [
          {
            date: '2024-02-15',
            opponent: 'Team A',
            performance: 95,
            highlights: 'Hat-trick performance'
          }
        ],
        wearableData: {
          heartRate: 72,
          distance: 12.5,
          intensity: 85,
          recovery: 92
        }
      },
      {
        id: '2',
        name: 'Maria Garcia',
        age: 20,
        sport: 'Football',
        country: 'Spain',
        position: 'Midfielder',
        skillScore: 88,
        recentPerformance: '2 assists in last match',
        strengths: ['Vision', 'Passing', 'Technique'],
        weaknesses: ['Physical Strength'],
        recruitmentInterest: 75,
        image: 'https://i.pravatar.cc/150?img=2',
        metrics: {
          speed: 85,
          strength: 80,
          endurance: 90,
          agility: 88,
          mentalStrength: 92,
          injuryRisk: 20
        },
        recentMatches: [
          {
            date: '2024-02-14',
            opponent: 'Team B',
            performance: 88,
            highlights: 'Masterful midfield control'
          }
        ],
        wearableData: {
          heartRate: 68,
          distance: 11.8,
          intensity: 82,
          recovery: 88
        }
      }
    ];

    setAthletes(mockAthletes);
    setFilteredAthletes(mockAthletes);

    // Simulate AI recommendations
    setAiRecommendations([
      'Alex Johnson shows exceptional potential with recent performance improvements',
      'Maria Garcia\'s playing style would complement your team\'s midfield',
      'Based on your preferences, consider scouting players with high mental strength'
    ]);
  }, []);

  // Filter athletes based on search and filters
  useEffect(() => {
    let result = [...athletes];

    // Search filter
    if (searchQuery) {
      result = result.filter(athlete =>
        athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        athlete.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.sport) {
      result = result.filter(athlete => athlete.sport === filters.sport);
    }
    if (filters.country) {
      result = result.filter(athlete => athlete.country === filters.country);
    }
    if (filters.position) {
      result = result.filter(athlete => athlete.position === filters.position);
    }
    if (filters.skillLevel) {
      result = result.filter(athlete => {
        switch (filters.skillLevel) {
          case 'high':
            return athlete.skillScore >= 85;
          case 'medium':
            return athlete.skillScore >= 70 && athlete.skillScore < 85;
          case 'low':
            return athlete.skillScore < 70;
          default:
            return true;
        }
      });
    }
    if (filters.injuryRisk) {
      result = result.filter(athlete => {
        switch (filters.injuryRisk) {
          case 'low':
            return athlete.metrics.injuryRisk <= 20;
          case 'medium':
            return athlete.metrics.injuryRisk > 20 && athlete.metrics.injuryRisk <= 50;
          case 'high':
            return athlete.metrics.injuryRisk > 50;
          default:
            return true;
        }
      });
    }

    setFilteredAthletes(result);
  }, [searchQuery, filters, athletes]);

  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthletes(prev =>
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId].slice(-3)
    );
  };

  const getMetricColor = (value: number) => {
    if (value >= 85) return 'text-green-500';
    if (value >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-dark p-8">
      {/* Search & Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athletes globally..."
              className="w-full bg-white/10 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 bg-primary px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
          >
            <FaFilter />
            Advanced Filters
          </motion.button>
        </div>

        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/10 p-6 rounded-xl mb-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <select
                  value={filters.sport}
                  onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
                  className="bg-white/5 rounded-lg px-4 py-2"
                >
                  <option value="">All Sports</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Tennis">Tennis</option>
                </select>

                <select
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                  className="bg-white/5 rounded-lg px-4 py-2"
                >
                  <option value="">All Countries</option>
                  <option value="England">England</option>
                  <option value="Spain">Spain</option>
                  <option value="France">France</option>
                </select>

                <select
                  value={filters.position}
                  onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                  className="bg-white/5 rounded-lg px-4 py-2"
                >
                  <option value="">All Positions</option>
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                </select>

                <select
                  value={filters.skillLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="bg-white/5 rounded-lg px-4 py-2"
                >
                  <option value="">All Skill Levels</option>
                  <option value="high">High (85+)</option>
                  <option value="medium">Medium (70-84)</option>
                  <option value="low">Low (&lt;70)</option>
                </select>

                <select
                  value={filters.injuryRisk}
                  onChange={(e) => setFilters(prev => ({ ...prev, injuryRisk: e.target.value }))}
                  className="bg-white/5 rounded-lg px-4 py-2"
                >
                  <option value="">All Injury Risks</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaRobot className="text-2xl text-primary" />
          <h2 className="text-xl font-semibold">AI Talent Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiRecommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-4 rounded-lg"
            >
              <p className="text-gray-300">{recommendation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAthletes.map((athlete) => (
          <motion.div
            key={athlete.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 rounded-xl overflow-hidden"
          >
            <div className="relative">
              <img
                src={athlete.image}
                alt={athlete.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAthleteSelect(athlete.id)}
                  className={`p-2 rounded-full ${
                    selectedAthletes.includes(athlete.id)
                      ? 'bg-primary text-white'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <FaStar />
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{athlete.name}</h3>
                  <p className="text-gray-400">
                    {athlete.age} years • {athlete.position}
                  </p>
                  <p className="text-gray-400">
                    <FaGlobe className="inline-block mr-1" />
                    {athlete.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {athlete.skillScore}
                  </div>
                  <p className="text-sm text-gray-400">Skill Score</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Speed</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${athlete.metrics.speed}%` }}
                        />
                      </div>
                      <span className={`text-sm ${getMetricColor(athlete.metrics.speed)}`}>
                        {athlete.metrics.speed}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Strength</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 rounded-full h-2"
                          style={{ width: `${athlete.metrics.strength}%` }}
                        />
                      </div>
                      <span className={`text-sm ${getMetricColor(athlete.metrics.strength)}`}>
                        {athlete.metrics.strength}
                      </span>
                    </div>
                  </div>
                </div>

                {athlete.wearableData && (
                  <div className="bg-white/5 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Live Wearable Data</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Heart Rate:</span>
                        <span className="ml-1">{athlete.wearableData.heartRate} BPM</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Distance:</span>
                        <span className="ml-1">{athlete.wearableData.distance} km</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Recent Performance</h4>
                  <p>{athlete.recentPerformance}</p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Key Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {athlete.strengths.map((strength, index) => (
                      <span
                        key={index}
                        className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-sm"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-lg transition-colors"
                    >
                      <FaUserPlus className="inline-block mr-2" />
                      Scout
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
                    >
                      <FaVideo className="inline-block mr-2" />
                      Videos
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Panel */}
      <AnimatePresence>
        {selectedAthletes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg p-6 border-t border-white/20"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Compare Selected Athletes ({selectedAthletes.length}/3)
                </h3>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowComparison(true)}
                    className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <FaChartLine className="inline-block mr-2" />
                    Compare Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAthletes([])}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-6 py-2 rounded-lg transition-colors"
                  >
                    <FaTimes className="inline-block mr-2" />
                    Clear
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4">
                {selectedAthletes.map(id => {
                  const athlete = athletes.find(a => a.id === id);
                  return athlete ? (
                    <div key={id} className="flex-1 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={athlete.image}
                          alt={athlete.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{athlete.name}</h4>
                          <p className="text-sm text-gray-400">
                            {athlete.position} • {athlete.country}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-2xl font-bold text-primary">
                            {athlete.skillScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && selectedAthletes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark p-8 rounded-xl max-w-4xl w-full mx-4 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowComparison(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>

              <h2 className="text-2xl font-bold mb-6">Athlete Comparison</h2>

              <div className="space-y-8">
                {/* Radar Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'Speed', A: 90, B: 85 },
                      { subject: 'Strength', A: 85, B: 80 },
                      { subject: 'Endurance', A: 88, B: 90 },
                      { subject: 'Agility', A: 92, B: 88 },
                      { subject: 'Mental', A: 85, B: 92 }
                    ]}>
                      <PolarGrid stroke="#444" />
                      <PolarAngleAxis dataKey="subject" stroke="#888" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888" />
                      <Radar name="Athlete A" dataKey="A" stroke="#646cff" fill="#646cff" fillOpacity={0.3} />
                      <Radar name="Athlete B" dataKey="B" stroke="#00ff88" fill="#00ff88" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Speed</span>
                          <span className="text-primary">90 vs 85</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '90%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Strength</span>
                          <span className="text-primary">85 vs 80</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Risk Assessment</h3>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FaExclamationTriangle className="text-yellow-500" />
                          <span>Injury Risk</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Athlete A shows 15% lower injury risk compared to Athlete B
                        </p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FaBrain className="text-purple-500" />
                          <span>Mental Strength</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Athlete B demonstrates superior mental resilience
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalScouting;