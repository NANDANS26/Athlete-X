import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaDumbbell, FaRunning, FaHeart, FaYinYang, FaBrain, FaTrophy, FaChartLine, FaWater, FaBed, FaMedal, FaExclamationTriangle, FaSpinner, FaCheckCircle, FaSync
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AthleteData } from './AthleteDashboard';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface TrainingPlansProps {
  athleteData: AthleteData;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  intensity: string;
  targetHeartRate?: string;
  notes?: string;
  sportSpecific?: boolean;
}

interface WorkoutSection {
  title: string;
  exercises: Exercise[];
  type: 'strength' | 'cardio' | 'recovery' | 'sport-specific';
  intensity: 'high' | 'medium' | 'low';
}

type WorkoutData = {
  [key: string]: {
    strength: WorkoutSection[];
    endurance: WorkoutSection[];
    speed: WorkoutSection[];
    recovery: WorkoutSection[];
  };
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  progress: number;
  target: number;
  unit: string;
}

interface HealthMetrics {
  heartRate: number;
  fatigueLevel: number;
  recoveryScore: number;
  sleepQuality: number;
  hydrationLevel: number;
  stressLevel: number;
}


interface RecommendationCardProps {
  title: string;
  icon: JSX.Element;
  description: string;
  details: React.ReactNode;
}

interface TrainingDistributionChartProps {
  data: { name: string; value: number }[];
}

interface ToDoListProps {
  items: string[];
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  progress: number;
  target: number;
}

const workoutData: WorkoutData = {
  today: {
    strength: [
      {
        title: 'Strength Training',
        type: 'strength',
        intensity: 'high',
        exercises: [
          { name: 'Deadlifts', sets: 4, reps: '8-10', intensity: 'High' },
          { name: 'Bench Press', sets: 4, reps: '8-10', intensity: 'High' },
        ],
      },
    ],
    endurance: [
      {
        title: 'Endurance Training',
        type: 'cardio',
        intensity: 'medium',
        exercises: [
          { name: 'Long Run', sets: 1, reps: '30 mins', intensity: 'Medium' },
        ],
      },
    ],
    speed: [
      {
        title: 'Speed Training',
        type: 'sport-specific',
        intensity: 'high',
        exercises: [
          { name: 'Sprint Intervals', sets: 6, reps: '30s', intensity: 'High' },
        ],
      },
    ],
    recovery: [
      {
        title: 'Recovery Session',
        type: 'recovery',
        intensity: 'low',
        exercises: [
          { name: 'Yoga Flow', sets: 1, reps: '20 mins', intensity: 'Low' },
        ],
      },
    ],
  },
  tomorrow: {
    strength: [
      {
        title: 'Strength Training',
        type: 'strength',
        intensity: 'medium',
        exercises: [
          { name: 'Squats', sets: 3, reps: '10-12', intensity: 'Medium' },
        ],
      },
    ],
    endurance: [
      {
        title: 'Endurance Training',
        type: 'cardio',
        intensity: 'high',
        exercises: [
          { name: 'Cycling', sets: 1, reps: '45 mins', intensity: 'High' },
        ],
      },
    ],
    speed: [
      {
        title: 'Speed Training',
        type: 'sport-specific',
        intensity: 'high',
        exercises: [
          { name: 'Agility Drills', sets: 5, reps: '1 min', intensity: 'High' },
        ],
      },
    ],
    recovery: [
      {
        title: 'Recovery Session',
        type: 'recovery',
        intensity: 'low',
        exercises: [
          { name: 'Foam Rolling', sets: 1, reps: '15 mins', intensity: 'Low' },
        ],
      },
    ],
  },
  day3: {
    strength: [
      {
        title: 'Strength Training',
        type: 'strength',
        intensity: 'high',
        exercises: [
          { name: 'Pull-Ups', sets: 4, reps: '8-10', intensity: 'High' },
        ],
      },
    ],
    endurance: [
      {
        title: 'Endurance Training',
        type: 'cardio',
        intensity: 'medium',
        exercises: [
          { name: 'Swimming', sets: 1, reps: '30 mins', intensity: 'Medium' },
        ],
      },
    ],
    speed: [
      {
        title: 'Speed Training',
        type: 'sport-specific',
        intensity: 'high',
        exercises: [
          { name: 'Plyometrics', sets: 6, reps: '30s', intensity: 'High' },
        ],
      },
    ],
    recovery: [
      {
        title: 'Recovery Session',
        type: 'recovery',
        intensity: 'low',
        exercises: [
          { name: 'Stretching', sets: 1, reps: '20 mins', intensity: 'Low' },
        ],
      },
    ],
  },
};

const TrainingPlans = ({ athleteData }: TrainingPlansProps) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [selectedGoal, setSelectedGoal] = useState('strength');
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    heartRate: 75,
    fatigueLevel: 30,
    recoveryScore: 85,
    sleepQuality: 90,
    hydrationLevel: 75,
    stressLevel: 25,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoadingAI] = useState(false);
  
  // Static data for Health Status, Training Recommendations, and Training Focus
  const [staticHealthStatus, setStaticHealthStatus] = useState({
    overall: 'Your health status is good, but there are areas for improvement.',
    concerns: [
      'Slight fatigue detected. Consider reducing training intensity for 1-2 days.',
      'Hydration levels could be better. Aim to drink at least 3 liters of water daily.',
    ],
    positives: [
      'Recovery score is excellent. Keep up the good work!',
      'Sleep quality is optimal. Maintain a consistent sleep schedule.',
    ],
  });

  const [staticTrainingRecommendations, setStaticTrainingRecommendations] = useState({
    intensity: 'Moderate',
    focusAreas: [
      'Strength training: Focus on compound lifts like squats and deadlifts.',
      'Endurance: Incorporate long-distance runs or cycling sessions.',
    ],
    modifications: [
      'Increase protein intake to support muscle recovery.',
      'Add more recovery days to prevent overtraining.',
    ],
  });

  const [staticTrainingDistribution, setStaticTrainingDistribution] = useState({
    strength: 30,
    cardio: 30,
    flexibility: 20,
    recovery: 10,
    skillWork: 10,
  });

  // Randomize static data on component mount
  useEffect(() => {
    const randomizeData = () => {
      const randomHealthStatus = {
        overall: 'Your health status is good, but there are areas for improvement.',
        concerns: [
          'Slight fatigue detected. Consider reducing training intensity for 1-2 days.',
          'Hydration levels could be better. Aim to drink at least 3 liters of water daily.',
        ],
        positives: [
          'Recovery score is excellent. Keep up the good work!',
          'Sleep quality is optimal. Maintain a consistent sleep schedule.',
        ],
      };

      const randomTrainingRecommendations = {
        intensity: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        focusAreas: [
          'Strength training: Focus on compound lifts like squats and deadlifts.',
          'Endurance: Incorporate long-distance runs or cycling sessions.',
        ],
        modifications: [
          'Increase protein intake to support muscle recovery.',
          'Add more recovery days to prevent overtraining.',
        ],
      };

      const randomTrainingDistribution = {
        strength: Math.floor(Math.random() * 40) + 10,
        cardio: Math.floor(Math.random() * 40) + 10,
        flexibility: Math.floor(Math.random() * 20) + 10,
        recovery: Math.floor(Math.random() * 20) + 10,
        skillWork: Math.floor(Math.random() * 20) + 10,
      };

      setStaticHealthStatus(randomHealthStatus);
      setStaticTrainingRecommendations(randomTrainingRecommendations);
      setStaticTrainingDistribution(randomTrainingDistribution);
    };

    randomizeData();
  }, []);

  // Calculate Fatigue Level
  const calculateFatigueLevel = (metrics: HealthMetrics): number => {
    const { heartRate, sleepQuality, stressLevel, hydrationLevel } = metrics;
    const fatigueScore =
      heartRate * 0.3 +
      (100 - sleepQuality) * 0.2 +
      stressLevel * 0.3 +
      (100 - hydrationLevel) * 0.2;
    return Math.min(100, Math.max(0, Math.round(fatigueScore)));
  };

  // Calculate Recovery Score
  const calculateRecoveryScore = (metrics: HealthMetrics): number => {
    const { sleepQuality, stressLevel, hydrationLevel } = metrics;
    const recoveryScore =
      sleepQuality * 0.4 +
      (100 - stressLevel) * 0.3 +
      hydrationLevel * 0.3;
    return Math.min(100, Math.max(0, Math.round(recoveryScore)));
  };

  // Fetch real-time health metrics from Firebase
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', userId, 'healthMetrics', 'latest'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as HealthMetrics;
          setHealthMetrics((prev) => ({
            ...prev,
            heartRate: data.heartRate || prev.heartRate,
            sleepQuality: data.sleepQuality || prev.sleepQuality,
            hydrationLevel: data.hydrationLevel || prev.hydrationLevel,
            stressLevel: data.stressLevel || prev.stressLevel,
          }));
          console.log('Fetched latest health metrics:', data);
        } else {
          console.log('No health metrics found in Firebase');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Simulate Health Metrics Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics((prev) => {
        const newHydrationLevel = Math.max(0, Math.min(100, prev.hydrationLevel + Math.floor(Math.random() * 3) - 1));
        const newStressLevel = Math.max(0, Math.min(100, prev.stressLevel + Math.floor(Math.random() * 4) - 2));

        return {
          ...prev,
          heartRate: prev.heartRate + Math.floor(Math.random() * 3) - 1,
          fatigueLevel: calculateFatigueLevel({
            ...prev,
            hydrationLevel: newHydrationLevel,
            stressLevel: newStressLevel,
          }),
          recoveryScore: calculateRecoveryScore({
            ...prev,
            hydrationLevel: newHydrationLevel,
            stressLevel: newStressLevel,
          }),
          sleepQuality: prev.sleepQuality,
          hydrationLevel: newHydrationLevel,
          stressLevel: newStressLevel,
        };
      });
      console.log("Updated Health Metrics:", healthMetrics);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Achievements
  useEffect(() => {
    setAchievements([
      {
        id: '1',
        title: 'Consistency King',
        description: 'Complete workouts for 7 consecutive days',
        icon: <FaTrophy className="text-yellow-500" />,
        progress: 5,
        target: 7,
        unit: 'days',
      },
      {
        id: '2',
        title: 'Heart Rate Master',
        description: 'Maintain target heart rate zone for 30 minutes',
        icon: <FaHeart className="text-red-500" />,
        progress: 25,
        target: 30,
        unit: 'minutes',
      },
      {
        id: '3',
        title: 'Recovery Pro',
        description: 'Achieve 90% recovery score for 5 days',
        icon: <FaYinYang className="text-blue-500" />,
        progress: 3,
        target: 5,
        unit: 'days',
      },
    ]);
  }, []);

  const generateWorkout = (): WorkoutSection[] => {
    const dayWorkouts = workoutData[selectedDay as keyof typeof workoutData];
    const focusWorkouts = dayWorkouts[selectedGoal as keyof typeof dayWorkouts];

    const workout: WorkoutSection[] = [
      {
        title: 'Warm-up',
        type: 'cardio',
        intensity: 'low',
        exercises: [
          {
            name: 'Dynamic Stretching',
            sets: 1,
            reps: '10 each',
            duration: '10 mins',
            intensity: 'Low',
            notes: 'Focus on major muscle groups',
          },
        ],
      },
      ...focusWorkouts,
      {
        title: 'Cool-down',
        type: 'recovery',
        intensity: 'low',
        exercises: [
          {
            name: 'Static Stretching',
            sets: 1,
            reps: '30s each',
            duration: '10 mins',
            intensity: 'Low',
          },
        ],
      },
    ];

    return workout;
  };

  const workout = generateWorkout();

  const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  const RecommendationCard = ({ title, icon, description, details }: RecommendationCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-4 rounded-lg cursor-pointer"
        role="button"
        aria-label="Expand recommendation"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-300 mt-2">{description}</p>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {details}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const TrainingDistributionChart = ({ data }: TrainingDistributionChartProps) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const ToDoList = ({ items }: ToDoListProps) => {
    const [completedItems, setCompletedItems] = useState<string[]>([]);

    const toggleItem = (item: string) => {
      if (completedItems.includes(item)) {
        setCompletedItems(completedItems.filter((i) => i !== item));
      } else {
        setCompletedItems([...completedItems, item]);
      }
    };

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
            role="button"
            aria-label="Toggle task completion"
            tabIndex={0}
            onClick={() => toggleItem(item)}
            onKeyDown={(e) => e.key === 'Enter' && toggleItem(item)}
          >
            <input
              type="checkbox"
              checked={completedItems.includes(item)}
              readOnly
              className="w-4 h-4"
            />
            <span className={`text-sm ${completedItems.includes(item) ? 'line-through text-gray-400' : 'text-gray-300'}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const AchievementBadge = ({ title, description, progress, target }: AchievementBadgeProps) => {
    const progressPercentage = (progress / target) * 100;

    return (
      <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <FaMedal className="text-yellow-500 text-xl" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mt-2">{description}</p>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-gray-400">
                {progress}/{target}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
            />
          </div>
        </div>
      </div>
    );
  };

  const PersonalizedInsights = ({ name, sport, position, healthMetrics }: { name: string; sport: string; position: string; healthMetrics: HealthMetrics }) => {
    return (
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Hi, {name}!</h2>
        <p className="text-gray-300">
          As a {position} in {sport}, here are some insights tailored for you:
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center gap-2">
            <FaHeart className="text-red-500" />
            Your heart rate is {healthMetrics.heartRate} BPM.
          </li>
          <li className="flex items-center gap-2">
            <FaWater className="text-blue-500" />
            Your hydration level is {healthMetrics.hydrationLevel}%.
          </li>
        </ul>
      </div>
    );
  };

  const renderAIRecommendations = () => {
    if (isLoadingAI) {
      return (
        <div className="flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin" />
          <p>Loading AI recommendations...</p>
        </div>
      );
    }

    // Transform training distribution data for the pie chart
    const trainingDistributionData = Object.entries(
      staticTrainingDistribution
    ).map(([name, value]) => ({ name, value }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Personalized Insights */}
        <PersonalizedInsights
          name={athleteData.name}
          sport={athleteData.sport}
          position={athleteData.position}
          healthMetrics={healthMetrics}
        />

        {/* Health Status */}
        <RecommendationCard
          title="Health Status"
          icon={<FaHeart className="text-red-500 text-xl" />}
          description={staticHealthStatus.overall}
          details={
            <div className="space-y-4">
              <h4 className="font-semibold">Key Insights:</h4>
              <ul className="space-y-2">
                {staticHealthStatus.concerns.map((concern, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <FaExclamationTriangle className="text-red-400" />
                    {concern}
                  </li>
                ))}
                {staticHealthStatus.positives.map((positive, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-green-400" />
                    {positive}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-300">
                <strong>Tip:</strong> Focus on improving hydration and sleep quality for better recovery.
              </p>
            </div>
          }
        />

        {/* Training Recommendations */}
        <RecommendationCard
          title="Training Recommendations"
          icon={<FaDumbbell className="text-primary text-xl" />}
          description="Here's how you can optimize your training:"
          details={
            <div className="space-y-4">
              <h4 className="font-semibold">Focus Areas:</h4>
              <ToDoList items={staticTrainingRecommendations.focusAreas} />
              <h4 className="font-semibold mt-4">Modifications:</h4>
              <ul className="space-y-2">
                {staticTrainingRecommendations.modifications.map((modification, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <FaSync className="text-blue-400" />
                    {modification}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-300">
                <strong>Tip:</strong> Adjust your training intensity based on your recovery score.
              </p>
            </div>
          }
        />

        {/* Training Distribution */}
        <RecommendationCard
          title="Training Focus"
          icon={<FaChartLine className="text-primary text-xl" />}
          description="Your recommended training distribution:"
          details={
            <div className="space-y-4">
              <TrainingDistributionChart data={trainingDistributionData} />
              <p className="text-sm text-gray-300">
                <strong>Tip:</strong> Balance your training across strength, cardio, and recovery for optimal performance.
              </p>
            </div>
          }
        />

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AchievementBadge
            title="Hydration Hero"
            description="Drink 3 liters of water for 7 consecutive days."
            progress={5}
            target={7}
          />
          <AchievementBadge
            title="Recovery Pro"
            description="Achieve a recovery score of 90% for 5 days."
            progress={3}
            target={5}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Training Plans</h1>
          <p className="text-gray-400">
            AI-powered workouts tailored for {athleteData.sport} - {athleteData.position}
          </p>
        </div>

        <div className="flex gap-2">
          {['today', 'tomorrow', 'day3'].map((day) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDay === day
                  ? 'bg-primary text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaHeart className="text-red-500 text-xl" />
            <h3 className="font-semibold">Heart Rate</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.heartRate} BPM</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaRunning className="text-blue-500 text-xl" />
            <h3 className="font-semibold">Fatigue</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.fatigueLevel}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaYinYang className="text-green-500 text-xl" />
            <h3 className="font-semibold">Recovery</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.recoveryScore}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaBed className="text-purple-500 text-xl" />
            <h3 className="font-semibold">Sleep</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.sleepQuality}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaWater className="text-blue-500 text-xl" />
            <h3 className="font-semibold">Hydration</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.hydrationLevel}%</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <FaBrain className="text-yellow-500 text-xl" />
            <h3 className="font-semibold">Stress</h3>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.stressLevel}%</p>
        </div>
      </motion.div>

      {/* Training Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Training Focus</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          {['strength', 'endurance', 'speed', 'recovery'].map((goal) => (
            <motion.button
              key={goal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGoal(goal)}
              className={`px-6 py-3 rounded-lg capitalize ${
                selectedGoal === goal
                  ? 'bg-primary text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              {goal}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Workout Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaDumbbell className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">{selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}'s Workout Plan</h2>
        </div>

        <div className="space-y-6">
          {workout.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {section.title}
                {section.type === 'recovery' && <FaYinYang className="text-purple-500" />}
              </h3>
              <div className="space-y-4">
                {section.exercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className="bg-white/5 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-gray-400">
                          {exercise.sets} {exercise.sets > 1 ? 'sets' : 'set'} × {exercise.reps}
                          {exercise.duration && ` • ${exercise.duration}`}
                        </p>
                      </div>
                      <span className={`text-sm ${getIntensityColor(exercise.intensity)}`}>
                        {exercise.intensity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaMedal className="text-yellow-500 text-2xl" />
          <h2 className="text-xl font-semibold">Achievements</h2>
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
              <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-primary">
                      {Math.round((achievement.progress / achievement.target) * 100)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-gray-400">
                      {achievement.progress}/{achievement.target} {achievement.unit}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                  <div
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Recommendations */}
      {renderAIRecommendations()}
    </div>
  );
};

export default TrainingPlans;