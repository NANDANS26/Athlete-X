import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const checkUserRegistration = async (userId: string) => {
    try {
      // Check athlete collection first
      const athleteDoc = await getDoc(doc(db, 'athletes', userId));
      if (athleteDoc.exists()) {
        const athleteData = athleteDoc.data();
        // Check if registration is complete
        if (athleteData.onboardingCompleted) {
          return navigate('/dashboard/athlete');
        } else if (athleteData.scheduleSet) {
          return navigate('/athlete-onboarding');
        } else if (athleteData.journeyStartDate) {
          return navigate('/schedule-journey');
        }
        return navigate('/athlete-registration');
      }

      // Check recruiter collection
      const recruiterDoc = await getDoc(doc(db, 'recruiters', userId));
      if (recruiterDoc.exists()) {
        const recruiterData = recruiterDoc.data();
        // Check if registration is complete
        if (recruiterData.profileComplete) {
          return navigate('/dashboard/recruiter');
        }
        return navigate('/recruiter-registration');
      }

      // If no data found in either collection, send to role selection
      return navigate('/select-role');
    } catch (error) {
      console.error('Error checking user registration:', error);
      setError('Error checking registration status');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkUserRegistration(userCredential.user.uid);
    } catch (error) {
      setError('Invalid email or password');
      setIsShaking(true);
      setIsLoading(false);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await checkUserRegistration(result.user.uid);
    } catch (error) {
      setError('Google sign-in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: 'transparent' } },
          fpsLimit: 120,
          particles: {
            color: { value: '#3b82f6' },
            links: { color: '#3b82f6', distance: 150, enable: true, opacity: 0.5, width: 1 },
            move: { enable: true, speed: 2 },
            number: { density: { enable: true, area: 800 }, value: 100 },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black/80"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`relative bg-black/50 p-10 rounded-3xl backdrop-blur-lg w-full max-w-md mx-4 
          ${isShaking ? 'animate-shake' : ''} shadow-2xl hover:shadow-blue-500/40 
          transition-all duration-300 transform hover:-translate-y-2 border border-white/10`}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
        >
          Welcome Back! 🚀
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-black/20 rounded-lg py-3 px-10 text-white placeholder-blue-300 
                focus:ring-2 focus:ring-blue-500 focus:bg-black/30 transition-all duration-300"
              disabled={isLoading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/20 rounded-lg py-3 px-10 text-white placeholder-blue-300 
                focus:ring-2 focus:ring-blue-500 focus:bg-black/30 transition-all duration-300"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-200 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </motion.div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-blue-300">
              <input type="checkbox" className="mr-2 accent-blue-500" />
              Remember me
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-200 transition-colors">
              Forgot Password?
            </a>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 12px rgba(59, 130, 246, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
              text-white py-3 rounded-lg font-semibold transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </motion.button>
        </form>

        <div className="mt-6 relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-blue-300">Or continue with</span>
        </div>

        <motion.button
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 
            text-white py-3 rounded-lg font-semibold transition-all duration-300"
        >
          <FaGoogle />
          Sign in with Google
        </motion.button>

        <p className="mt-8 text-center text-blue-300">
          New to our platform?{' '}
          <button onClick={() => navigate('/signup')} className="text-blue-400 hover:text-blue-200 transition-colors">
            Sign up here
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
