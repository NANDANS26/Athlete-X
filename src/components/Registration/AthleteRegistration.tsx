import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FaUser, FaWeight, FaHeartbeat, FaUtensils, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface FormData {
  // Basic Information
  fullName: string;
  age: number;
  gender: string;
  sport: string;
  position: string;
  country: string;

  // Body Measurements & Health
  height: number;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  restingHeartRate: number;
  sleepHours: number;

  // Medical & Training Details
  pastInjuries: string;
  medicalConditions: string;
  allergies: string;
  trainingGoal: string;
  trainingIntensity: string;

  // Nutrition & Diet
  dietType: string;
  waterIntake: number;
  eatingHabits: string;
  takesSupplements: boolean;
  supplementList?: string;
}

// Sport-specific positions
const sportPositions: { [key: string]: string[] } = {
  Football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  Basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  Tennis: ['Singles Player', 'Doubles Specialist'],
  Boxing: ['Lightweight', 'Middleweight', 'Heavyweight'],
  Badminton: ['Singles Player', 'Doubles Specialist', 'Mixed Doubles'],
  Cricket: ['Batsman', 'Bowler', 'All-rounder', 'Wicket Keeper'],
  Rugby: ['Forward', 'Back', 'Scrum-half', 'Fly-half'],
  Athletics: ['Sprinter', 'Long Distance', 'High Jump', 'Long Jump', 'Shot Put'],
  Hockey: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  Swimming: ['Freestyle', 'Butterfly', 'Backstroke', 'Breaststroke', 'Individual Medley']
};

const AthleteRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formComplete, setFormComplete] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    age: 0,
    gender: '',
    sport: '',
    position: '',
    country: '',
    height: 0,
    weight: 0,
    bodyFat: undefined,
    muscleMass: undefined,
    restingHeartRate: 0,
    sleepHours: 0,
    pastInjuries: '',
    medicalConditions: '',
    allergies: '',
    trainingGoal: '',
    trainingIntensity: '',
    dietType: '',
    waterIntake: 0,
    eatingHabits: '',
    takesSupplements: false,
    supplementList: ''
  });

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    // Reset position when sport changes
    if (formData.sport) {
      setFormData(prev => ({ ...prev, position: '' }));
    }
  }, [formData.sport]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Basic Information
        return formData.fullName && formData.age && formData.gender && formData.sport && formData.position && formData.country;
      case 2: // Body Measurements & Health
        return formData.height && formData.weight && formData.restingHeartRate && formData.sleepHours;
      case 3: // Medical & Training Details
        return formData.trainingGoal && formData.trainingIntensity;
      case 4: // Nutrition & Diet
        return formData.dietType && formData.waterIntake && formData.eatingHabits;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
        setError('');
      } else {
        setFormComplete(true);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      await setDoc(doc(db, 'athletes', userId), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      navigate('/journey-confirmation');
    } catch (err) {
      console.error('Error saving data:', err);
      setError('Failed to save your profile. Please try again.');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaUser className="text-primary" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter your age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Sport *</label>
                  <select
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Sport</option>
                    {Object.keys(sportPositions).map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    disabled={!formData.sport}
                  >
                    <option value="">Select Position</option>
                    {formData.sport && sportPositions[formData.sport].map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Country/Region *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaWeight className="text-primary" />
              Body Measurements & Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter your height"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter your weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Body Fat % (Optional)
                  </label>
                  <input
                    type="number"
                    name="bodyFat"
                    value={formData.bodyFat || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter body fat percentage"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Muscle Mass % (Optional)
                  </label>
                  <input
                    type="number"
                    name="muscleMass"
                    value={formData.muscleMass || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter muscle mass percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Resting Heart Rate (BPM) *
                  </label>
                  <input
                    type="number"
                    name="restingHeartRate"
                    value={formData.restingHeartRate || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter resting heart rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Average Sleep Hours *
                  </label>
                  <input
                    type="number"
                    name="sleepHours"
                    value={formData.sleepHours || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="24"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter average sleep hours"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaHeartbeat className="text-primary" />
              Medical & Training Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Past Injuries</label>
                  <textarea
                    name="pastInjuries"
                    value={formData.pastInjuries}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="List any past injuries"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Medical Conditions
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="List any medical conditions"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Allergies</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="List any allergies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Primary Training Goal *
                  </label>
                  <select
                    name="trainingGoal"
                    value={formData.trainingGoal}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Training Goal</option>
                    <option value="Speed & Agility">Speed & Agility</option>
                    <option value="Strength & Power">Strength & Power</option>
                    <option value="Endurance & Stamina">Endurance & Stamina</option>
                    <option value="Muscle Growth">Muscle Growth</option>
                    <option value="Overall Athletic Performance">Overall Athletic Performance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Training Intensity Level *
                  </label>
                  <select
                    name="trainingIntensity"
                    value={formData.trainingIntensity}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Intensity Level</option>
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Intense">Intense</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FaUtensils className="text-primary" />
              Nutrition & Diet Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Diet Type *</label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Diet Type</option>
                    <option value="High-Protein">High-Protein</option>
                    <option value="Vegan/Vegetarian">Vegan/Vegetarian</option>
                    <option value="High-Carb">High-Carb</option>
                    <option value="Keto/Low-Carb">Keto/Low-Carb</option>
                    <option value="Balanced Diet">Balanced Diet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Daily Water Intake (Liters) *
                  </label>
                  <input
                    type="number"
                    name="waterIntake"
                    value={formData.waterIntake || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                    placeholder="Enter daily water intake"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Current Eating Habits *
                  </label>
                  <select
                    name="eatingHabits"
                    value={formData.eatingHabits}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="">Select Eating Habits</option>
                    <option value="3 Full Meals">Eats 3 Full Meals</option>
                    <option value="5-6 Small Meals">Eats 5-6 Small Meals</option>
                    <option value="Skips Meals Often">Skips Meals Often</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Do You Take Supplements?
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="takesSupplements"
                        checked={formData.takesSupplements}
                        onChange={handleInputChange}
                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-300
                          focus:ring-primary"
                      />
                      <span>Yes, I take supplements</span>
                    </label>
                  </div>
                </div>

                {formData.takesSupplements && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Supplement List
                    </label>
                    <textarea
                      name="supplementList"
                      value={formData.supplementList}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 rounded-lg p-3 focus:ring-2 focus:ring-purple-400 text-white"
                      placeholder="List your supplements"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
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

      <div className="relative z-10 w-full max-w-6xl mx-4 my-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Build Your Athletic Profile</h1>
            <p className="text-xl text-gray-300">
              Let's create your personalized training experience
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2" />
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: currentStep >= step ? 1 : 0.8,
                  backgroundColor: currentStep >= step ? 'rgb(100, 108, 255)' : 'rgb(75, 85, 99)'
                }}
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {currentStep > step ? <FaCheck /> : step}
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2"
            >
              <FaInfoCircle />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 
                    rounded-lg transition-colors"
                >
                  <FaTimes />
                  Back
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={currentStep === 4 && formComplete ? handleSubmit : handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-3 ml-auto rounded-lg transition-colors
                  ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-secondary'}`}
              >
                {currentStep === 4 ? (
                  isLoading ? 'Creating Profile...' : 'Complete Profile'
                ) : (
                  <>
                    Next
                    <FaCheck />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AthleteRegistration;