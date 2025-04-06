import { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaUserTie, FaFootballBall, FaGlobe, FaPhone, FaBullseye, FaRobot, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Particles from 'react-particles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface FormData {
  fullName: string;
  organization: string;
  recruiterType: string;
  sportSpecialization: string;
  experience: number;
  ageGroup: string;
  region: string;
  email: string;
  phone: string;
  goals: string;
}

const RecruiterRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    organization: '',
    recruiterType: '',
    sportSpecialization: '',
    experience: 0,
    ageGroup: '',
    region: '',
    email: auth.currentUser?.email ?? '',
    phone: '',
    goals: ''
  });

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Generate AI suggestions based on input
    if (name === 'sportSpecialization') {
      setAiSuggestion(`Pro Tip: ${value} recruiters often find success focusing on specific positions and physical attributes.`);
    } else if (name === 'ageGroup') {
      setAiSuggestion(`Consider that ${value} athletes typically require different evaluation criteria and development paths.`);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.organization && formData.recruiterType;
      case 2:
        return formData.sportSpecialization && formData.experience && formData.ageGroup;
      case 3:
        return formData.region && formData.email && formData.phone;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value).length;
    return (filledFields / totalFields) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user logged in');

      // Save to Firestore with additional metadata
      await setDoc(doc(db, 'recruiters', userId), {
        ...formData,
        userId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        profileComplete: true
      });

      // Navigate to welcome page after successful save
      navigate('/welcome-recruiter');
    } catch (err) {
      console.error('Error saving recruiter data:', err);
      setError('Failed to save data. Please try again.');
      setIsLoading(false);
    }
  };

  // Enhanced select component with custom styling
  const CustomSelect = ({ name, value, onChange, options, icon, placeholder }: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    icon: JSX.Element;
    placeholder: string;
  }) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 pr-10 focus:ring-2 focus:ring-purple-400 text-white
          appearance-none cursor-pointer hover:bg-white/10 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <FaChevronDown className="transition-transform group-hover:rotate-180" />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="relative">
                <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                />
              </div>

              <div className="relative">
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="Organization/Club/Team Name (Optional)"
                  className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                />
              </div>

              <CustomSelect
                name="recruiterType"
                value={formData.recruiterType}
                onChange={handleInputChange}
                icon={<FaUserTie />}
                placeholder="Select Recruiter Type"
                options={[
                  { value: 'Coach', label: 'Coach' },
                  { value: 'Scout', label: 'Scout' },
                  { value: 'Team Manager', label: 'Team Manager' },
                  { value: 'University Representative', label: 'University Representative' },
                  { value: 'Independent', label: 'Independent Recruiter' }
                ]}
                
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold mb-4">Specialization</h3>
            <div className="space-y-4">
              <CustomSelect
                name="sportSpecialization"
                value={formData.sportSpecialization}
                onChange={handleInputChange}
                icon={<FaFootballBall />}
                placeholder="Select Sport"
                options={[
                  { value: 'Football', label: 'Football' },
                  { value: 'Basketball', label: 'Basketball' },
                  { value: 'Cricket', label: 'Cricket' },
                  { value: 'Tennis', label: 'Tennis' },
                  { value: 'Swimming', label: 'Swimming' },
                  { value: 'Athletics', label: 'Athletics' }
                ]}
              />

              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="Years of Experience"
                min="0"
                className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
              />

              <CustomSelect
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleInputChange}
                icon={<FaUserTie />}
                placeholder="Preferred Athlete Age Group"
                options={[
                  { value: 'U-16', label: 'Under 16' },
                  { value: 'U-21', label: 'Under 21' },
                  { value: 'Professional', label: 'Professional' },
                  { value: 'All', label: 'All Age Groups' }
                ]}
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold mb-4">Contact & Goals</h3>
            <div className="space-y-4">
              <CustomSelect
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                icon={<FaGlobe />}
                placeholder="Recruitment Region"
                options={[
                  { value: 'Local', label: 'Local' },
                  { value: 'National', label: 'National' },
                  { value: 'International', label: 'International' }
                ]}
              />

              <div className="relative">
                <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                />
              </div>

              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                />
              </div>

              <div className="relative">
                <FaBullseye className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  placeholder="What are your recruitment goals?"
                  className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
                />
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

      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center mb-2">Complete Your Recruiter Profile</h2>
          <p className="text-center text-gray-300 mb-8">Help us understand your recruitment needs</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Profile Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
          </div>

          {/* AI Suggestion */}
          <AnimatePresence mode="wait">
            {aiSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-primary/20 p-4 rounded-lg flex items-start gap-3"
              >
                <FaRobot className="text-primary text-xl mt-1" />
                <p className="text-sm">{aiSuggestion}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={handleBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </motion.button>
              )}
              
              <motion.button
                type="button"
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`px-6 py-2 bg-primary rounded-lg hover:bg-secondary 
                  transition-colors ml-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {currentStep === 3 ? (isLoading ? 'Creating Profile...' : 'Complete Setup') : 'Next'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterRegistration;