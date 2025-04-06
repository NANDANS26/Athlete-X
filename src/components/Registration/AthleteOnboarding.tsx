import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaDumbbell, FaUtensils, FaHeart, FaBrain, FaCheckCircle, FaRocket, FaSpinner } from 'react-icons/fa';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { generateNutritionPlan, generateTrainingPlan } from '../services/gemini';

interface AthleteData {
  sport: string;
  position: string;
  trainingGoal: string;
}

interface Meal {
  mealType: string;
  foodItems: string;
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface NutritionDay {
  day: string;
  meals: Meal[];
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

interface TrainingSession {
  focus: string;
  exercises: Exercise[];
  duration: string;
  intensity: string;
}

interface TrainingDay {
  day: string;
  sessions: TrainingSession[];
}

const AthleteOnboarding = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [showOath, setShowOath] = useState(false);
  const [loading, setLoading] = useState(false);
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionDay[]>([]);
  const [trainingPlan, setTrainingPlan] = useState<TrainingDay[]>([]);
  const [generatingPlans, setGeneratingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const cleanAndParseJSON = (jsonString: string): any => {
    try {
      // First try to parse directly
      return JSON.parse(jsonString);
    } catch (originalError) {
      try {
        // Clean common issues
        let cleaned = jsonString
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        // Fix trailing commas
        cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

        // Remove any comments
        cleaned = cleaned.replace(/\/\/.*$/gm, '');

        // Try parsing again
        const result = JSON.parse(cleaned);
        return result;
      } catch (cleanedError) {
        console.error('Failed to parse JSON after cleaning:', {
          originalError,
          cleanedError,
          originalString: jsonString
        });
        throw new Error('The AI service returned invalid data. Please try again.');
      }
    }
  };

  const fetchAthleteData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        navigate('/login');
        return;
      }

      const athleteDoc = await getDoc(doc(db, 'athletes', userId));
      if (!athleteDoc.exists()) {
        throw new Error('Athlete profile not found');
      }

      const data = athleteDoc.data();
      if (!data.sport || !data.position || !data.trainingGoal) {
        throw new Error('Incomplete athlete profile');
      }

      setAthleteData(data as AthleteData);
      setGeneratingPlans(true);
      setError(null);

      const [nutritionPlanResult, trainingPlanResult] = await Promise.all([
        generateNutritionPlan(data.sport, data.position, data.trainingGoal),
        generateTrainingPlan(data.sport, data.position, data.trainingGoal),
      ]);

      const nutritionData = cleanAndParseJSON(nutritionPlanResult);
      const trainingData = cleanAndParseJSON(trainingPlanResult);

      if (!nutritionData.days || !trainingData.days) {
        throw new Error('Invalid plan structure received from AI');
      }

      setNutritionPlan(nutritionData.days);
      setTrainingPlan(trainingData.days);
    } catch (error) {
      console.error('Error in fetchAthleteData:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate plans');
      setNutritionPlan([]);
      setTrainingPlan([]);
    } finally {
      setGeneratingPlans(false);
    }
  };

  useEffect(() => {
    fetchAthleteData();
  }, []);

  const NutritionTable = ({ days }: { days: NutritionDay[] }) => {
    if (days.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No nutrition plan available</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={fetchAthleteData}
            className="mt-4 px-4 py-2 bg-primary/80 hover:bg-primary rounded-lg transition-colors"
          >
            Retry Generation
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {days.map((day) => (
          <div key={day.day} className="bg-white/5 rounded-lg overflow-hidden">
            <h3 className="text-xl font-bold p-4 bg-white/10">{day.day}</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left">Meal</th>
                  <th className="p-3 text-left">Food Items</th>
                  <th className="p-3 text-left">Calories</th>
                  <th className="p-3 text-left">Macros (P/C/F)</th>
                </tr>
              </thead>
              <tbody>
                {day.meals.map((meal, index) => (
                  <tr key={index} className="border-b border-white/10 last:border-0">
                    <td className="p-3 font-medium">{meal.mealType}</td>
                    <td className="p-3">{meal.foodItems}</td>
                    <td className="p-3">{meal.calories} kcal</td>
                    <td className="p-3">
                      {meal.macronutrients.protein}g / {meal.macronutrients.carbs}g / {meal.macronutrients.fats}g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const TrainingTable = ({ days }: { days: TrainingDay[] }) => {
    if (days.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No training plan available</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={fetchAthleteData}
            className="mt-4 px-4 py-2 bg-primary/80 hover:bg-primary rounded-lg transition-colors"
          >
            Retry Generation
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {days.map((day) => (
          <div key={day.day} className="bg-white/5 rounded-lg overflow-hidden">
            <h3 className="text-xl font-bold p-4 bg-white/10">{day.day}</h3>
            {day.sessions.map((session, sessionIndex) => (
              <div key={sessionIndex} className="mb-6 last:mb-0">
                <div className="px-4 py-2 bg-white/5">
                  <h4 className="font-semibold">
                    {session.focus} • {session.duration} • {session.intensity} Intensity
                  </h4>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-left">Exercise</th>
                      <th className="p-3 text-left">Sets × Reps</th>
                      <th className="p-3 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.exercises.map((exercise, exIndex) => (
                      <tr key={exIndex} className="border-b border-white/10 last:border-0">
                        <td className="p-3 font-medium">{exercise.name}</td>
                        <td className="p-3">{exercise.sets} × {exercise.reps}</td>
                        <td className="p-3 text-gray-300">{exercise.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const sections = [
    {
      title: "Your Path to Excellence",
      icon: <FaRocket className="text-5xl text-primary mb-6" />,
      content: (
        <div className="space-y-6">
          <p className="text-xl text-gray-300">
            Welcome to your personalized journey to athletic excellence. We've crafted a comprehensive
            program tailored to your goals as a {athleteData?.sport || "professional"} athlete.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaHeart className="text-red-500" />
                Dedication Required
              </h3>
              <p className="text-sm text-gray-400">
                2-3 hours daily commitment for optimal results
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaBrain className="text-purple-500" />
                Mental Preparation
              </h3>
              <p className="text-sm text-gray-400">
                Focus, discipline, and unwavering determination
              </p>
              
            </div>
          </div>
          <p className="text-gray-400 mt-4">
              Please wait while the Nutrition and Training Plans is being generated by AI.....
          </p>
        </div>
      ),
    },
    {
      title: "Nutrition Plan",
      icon: <FaUtensils className="text-5xl text-green-500 mb-6" />,
      content: (
        <div className="space-y-6">
          {generatingPlans ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="text-4xl text-primary animate-spin mb-4" />
              <p className="text-lg text-gray-300">Generating your personalized nutrition plan...</p>
            </div>
          ) : (
            <div className="p-1 rounded-lg max-h-[60vh] overflow-y-auto">
              <NutritionTable days={nutritionPlan} />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Training Schedule",
      icon: <FaDumbbell className="text-5xl text-yellow-500 mb-6" />,
      content: (
        <div className="space-y-6">
          {generatingPlans ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="text-4xl text-primary animate-spin mb-4" />
              <p className="text-lg text-gray-300">Generating your personalized training plan...</p>
            </div>
          ) : (
            <div className="p-1 rounded-lg max-h-[60vh] overflow-y-auto">
              <TrainingTable days={trainingPlan} />
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      setShowOath(true);
    }
  };

  const handleTakeOath = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      await updateDoc(doc(db, 'athletes', userId), {
        onboardingCompleted: true,
        oathTaken: true,
        nutritionPlan: JSON.stringify(nutritionPlan),
        trainingPlan: JSON.stringify(trainingPlan),
        updatedAt: new Date().toISOString(),
      });

      navigate('/dashboard/athlete');
    } catch (error) {
      console.error('Error updating athlete:', error);
      setError('Failed to save your plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <AnimatePresence mode="wait">
        {!showOath ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-4xl w-full mx-4 my-8"
          >
            <div className="text-center mb-8">
              {sections[currentSection].icon}
              <h2 className="text-3xl font-bold mb-4">{sections[currentSection].title}</h2>
            </div>

            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              {sections[currentSection].content}
            </motion.div>

            <div className="flex justify-between items-center">
              {currentSection > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentSection((prev) => prev - 1)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Previous
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="px-6 py-2 bg-primary hover:bg-secondary rounded-lg transition-colors ml-auto"
                disabled={generatingPlans}
              >
                {currentSection === sections.length - 1 ? "Take the Oath" : "Next"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="oath"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-2xl w-full mx-4 text-center"
          >
            <FaCheckCircle className="text-6xl text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Athlete's Oath</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              I solemnly swear to:
              <br /><br />
              Dedicate myself to the pursuit of athletic excellence
              <br />
              Follow my training and nutrition plan with discipline
              <br />
              Never give up in the face of challenges
              <br />
              Represent myself and my sport with honor
              <br /><br />
              This is my commitment to excellence.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTakeOath}
              disabled={loading || nutritionPlan.length === 0 || trainingPlan.length === 0}
              className={`flex items-center justify-center gap-2 bg-primary hover:bg-secondary 
                text-white px-8 py-3 rounded-lg mx-auto ${loading || nutritionPlan.length === 0 || trainingPlan.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaRocket />
              {loading ? "Processing..." : "I Accept This Oath"}
            </motion.button>
            {(nutritionPlan.length === 0 || trainingPlan.length === 0) && (
              <p className="text-red-400 mt-4">Please ensure both plans are generated before taking the oath</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AthleteOnboarding;