import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaPlus, FaTrash, FaRobot, FaAppleAlt, FaClock, FaCalendar, FaSpinner } from 'react-icons/fa';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { AthleteData } from './AthleteDashboard';
import { getNutritionSuggestions } from '../services/gemini';

interface NutritionProps {
  athleteData: AthleteData;
}

interface MealEntry {
  id?: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
  timestamp: Date;
  mealType: string;
}

interface DailyMealPlan {
  breakfast: {
    time: string;
    suggestions: string[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  lunch: {
    time: string;
    suggestions: string[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
  dinner: {
    time: string;
    suggestions: string[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  };
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

const weeklyMealPlan: WeeklyMealPlan = {
  Monday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Oatmeal with fruit', 'Greek yogurt with granola'],
      macros: { calories: 400, protein: 20, carbs: 50, fats: 10 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Grilled chicken salad', 'Quinoa bowl'],
      macros: { calories: 500, protein: 30, carbs: 40, fats: 15 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Baked salmon with veggies', 'Brown rice with tofu'],
      macros: { calories: 600, protein: 35, carbs: 45, fats: 20 }
    }
  },
  Tuesday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Scrambled eggs with toast', 'Smoothie with protein powder'],
      macros: { calories: 450, protein: 25, carbs: 40, fats: 15 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Turkey wrap with avocado', 'Mixed greens salad'],
      macros: { calories: 550, protein: 35, carbs: 45, fats: 20 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Grilled chicken with sweet potato', 'Steamed broccoli'],
      macros: { calories: 650, protein: 40, carbs: 50, fats: 25 }
    }
  },
  Wednesday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Pancakes with honey', 'Fresh fruit bowl'],
      macros: { calories: 500, protein: 15, carbs: 70, fats: 10 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Pasta with marinara sauce', 'Garlic bread'],
      macros: { calories: 600, protein: 20, carbs: 80, fats: 15 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Beef stir-fry with rice', 'Steamed vegetables'],
      macros: { calories: 700, protein: 40, carbs: 60, fats: 25 }
    }
  },
  Thursday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Avocado toast', 'Orange juice'],
      macros: { calories: 450, protein: 10, carbs: 60, fats: 20 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Chicken Caesar wrap', 'Side salad'],
      macros: { calories: 550, protein: 30, carbs: 40, fats: 25 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Grilled fish with quinoa', 'Roasted asparagus'],
      macros: { calories: 600, protein: 35, carbs: 50, fats: 20 }
    }
  },
  Friday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Smoothie bowl with granola', 'Green tea'],
      macros: { calories: 400, protein: 15, carbs: 50, fats: 10 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Vegetable stir-fry with tofu', 'Brown rice'],
      macros: { calories: 500, protein: 20, carbs: 60, fats: 15 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Pizza with whole wheat crust', 'Side salad'],
      macros: { calories: 700, protein: 25, carbs: 80, fats: 30 }
    }
  },
  Saturday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['French toast with syrup', 'Fresh berries'],
      macros: { calories: 500, protein: 15, carbs: 70, fats: 15 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Burger with sweet potato fries', 'Coleslaw'],
      macros: { calories: 800, protein: 35, carbs: 90, fats: 35 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Grilled steak with mashed potatoes', 'Steamed green beans'],
      macros: { calories: 900, protein: 50, carbs: 60, fats: 40 }
    }
  },
  Sunday: {
    breakfast: {
      time: '7:00 AM',
      suggestions: ['Pancakes with maple syrup', 'Bacon'],
      macros: { calories: 600, protein: 20, carbs: 80, fats: 25 }
    },
    lunch: {
      time: '12:00 PM',
      suggestions: ['Roast chicken with vegetables', 'Mashed potatoes'],
      macros: { calories: 700, protein: 40, carbs: 50, fats: 30 }
    },
    dinner: {
      time: '7:00 PM',
      suggestions: ['Vegetable lasagna', 'Garlic bread'],
      macros: { calories: 600, protein: 25, carbs: 70, fats: 20 }
    }
  }
};

const Nutrition = ({ athleteData }: NutritionProps) => {
  const [showMealForm, setShowMealForm] = useState(true);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [newMeal, setNewMeal] = useState<Omit<MealEntry, 'id' | 'userId' | 'timestamp'>>({
    foodName: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    date: new Date().toISOString().split('T')[0],
    mealType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlanAndInsights, setShowPlanAndInsights] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [nutritionData, setNutritionData] = useState<{ name: string; value: number }[]>([]);

  const fetchAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getNutritionSuggestions(
        athleteData.sport,
        athleteData.position,
        meals,
        athleteData.trainingGoal
      );

      // Parse and format the AI output
      const parsedSuggestions = parseAISuggestions(suggestions);
      setAiSuggestions(parsedSuggestions);

      // Extract nutritional data for the pie chart
      const macros = {
        protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
        carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
        fats: meals.reduce((sum, meal) => sum + meal.fats, 0),
      };

      setNutritionData([
        { name: 'Protein', value: macros.protein },
        { name: 'Carbs', value: macros.carbs },
        { name: 'Fats', value: macros.fats },
      ]);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setError('Failed to fetch AI suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const parseAISuggestions = (suggestions: string): string => {
    // Example parsing logic (adjust based on your AI output format)
    const lines = suggestions.split('\n').filter(line => line.trim() !== '');
    const keyPoints = lines
      .map(line => line.replace(/\*\*/g, '').replace(/- /g, '• ').trim())
      .slice(0, 10); // Limit to 10 points
    return keyPoints.join('\n');
  };

  useEffect(() => {
    if (meals.length > 0) {
      fetchAISuggestions();
    }
  }, [meals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      const mealData: MealEntry = {
        ...newMeal,
        userId,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'meals'), mealData);

      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', userId),
        where('date', '==', newMeal.date)
      );

      const querySnapshot = await getDocs(mealsQuery);
      const mealDataFetched = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as MealEntry[];

      setMeals(mealDataFetched.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setNewMeal({
        foodName: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        date: new Date().toISOString().split('T')[0],
        mealType: ''
      });

      setShowPlanAndInsights(true);
      await fetchAISuggestions();
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId: string) => {
    try {
      await deleteDoc(doc(db, 'meals', mealId));

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const mealsQuery = query(
        collection(db, 'meals'),
        where('userId', '==', userId),
        where('date', '==', newMeal.date)
      );

      const querySnapshot = await getDocs(mealsQuery);
      const mealData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate()
        } as MealEntry;
      });

      setMeals(mealData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Colors for the pie chart

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition Tracker</h1>
          <p className="text-gray-400">
            Track and optimize your nutrition for peak performance
          </p>
        </div>
      </div>

      {/* Meal Entry Form */}
      <AnimatePresence>
        {showMealForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 p-6 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaUtensils className="text-primary text-2xl" />
              <h2 className="text-xl font-semibold">Add New Meal</h2>
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Food Name *</label>
                  <input
                    type="text"
                    name="foodName"
                    value={newMeal.foodName}
                    onChange={(e) => setNewMeal({ ...newMeal, foodName: e.target.value })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Meal Type *</label>
                  <select
                    name="mealType"
                    value={newMeal.mealType}
                    onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Meal Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={newMeal.date}
                    onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Calories *</label>
                  <input
                    type="number"
                    name="calories"
                    value={newMeal.calories || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Protein (g) *</label>
                  <input
                    type="number"
                    name="protein"
                    value={newMeal.protein || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Carbs (g) *</label>
                  <input
                    type="number"
                    name="carbs"
                    value={newMeal.carbs || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fats (g) *</label>
                  <input
                    type="number"
                    name="fats"
                    value={newMeal.fats || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, fats: Number(e.target.value) })}
                    className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Meal'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meal History */}
      {meals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaUtensils className="text-primary text-2xl" />
              <h2 className="text-xl font-semibold">Today's Meals</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMealForm(true)}
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="inline-block mr-2" />
              Add New Meal
            </motion.button>
          </div>

          <div className="space-y-4">
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{meal.foodName}</h3>
                    <p className="text-sm text-gray-400">
                      {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} • {meal.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold">{meal.calories} kcal</p>
                      <p className="text-sm text-gray-400">
                        P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => meal.id && handleDelete(meal.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Nutrition Plan */}
      {showPlanAndInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-8 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <FaCalendar className="text-primary text-3xl" />
            <h2 className="text-2xl font-bold">Weekly Nutrition Plan</h2>
          </div>

          <div className="space-y-8">
            {Object.entries(weeklyMealPlan).map(([day, plan]) => (
              <div key={day} className="bg-white/5 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-xl mb-6 text-primary border-b border-white/10 pb-4">{day}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(plan).map(([mealType, meal]) => (
                    <div key={mealType} className="bg-white/10 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        {mealType === 'breakfast' && <FaAppleAlt className="text-yellow-500 text-2xl" />}
                        {mealType === 'lunch' && <FaUtensils className="text-green-500 text-2xl" />}
                        {mealType === 'dinner' && <FaClock className="text-blue-500 text-2xl" />}
                        <h4 className="text-lg font-semibold text-gray-200">
                          {mealType.charAt(0).toUpperCase() + mealType.slice(1)} • {meal.time}
                        </h4>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {meal.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-primary">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>

                      <div className="text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Calories:</span>
                          <span>{meal.macros.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Protein:</span>
                          <span>{meal.macros.protein}g</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Carbs:</span>
                          <span>{meal.macros.carbs}g</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Fats:</span>
                          <span>{meal.macros.fats}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Nutrition Insights */}
      {showPlanAndInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">AI Nutrition Insights</h2>
          </div>

          {isLoadingSuggestions ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FaSpinner className="text-4xl text-primary animate-spin mb-4" />
              <p className="text-gray-400">Analyzing your nutrition data...</p>
            </div>
          ) : aiSuggestions ? (
            <div className="prose prose-invert max-w-none">
              {aiSuggestions.split('\n').map((line, index) => {
                if (line.startsWith('•')) {
                  return (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="m-0 text-gray-300">{line.substring(1).trim()}</p>
                    </div>
                  );
                }
                if (line.trim().length === 0) {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="mb-4 text-gray-300">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              Add your meals to receive personalized AI nutrition insights.
            </p>
          )}

          {/* Pie Chart for Nutritional Data */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Nutritional Breakdown</h3>
            <PieChart width={400} height={300}>
              <Pie
                data={nutritionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {nutritionData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAISuggestions} disabled={isLoadingSuggestions || meals.length === 0}
            className="mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRobot />
            Refresh Insights
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Nutrition;