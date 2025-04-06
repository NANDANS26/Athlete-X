import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaArrowUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-primary">Home</a></li>
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Features</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
              <li><a href="#" className="hover:text-primary">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Social Media</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:text-primary transition-colors"><FaTwitter /></a>
              <a href="#" className="text-2xl hover:text-primary transition-colors"><FaLinkedin /></a>
              <a href="#" className="text-2xl hover:text-primary transition-colors"><FaInstagram /></a>
              <a href="#" className="text-2xl hover:text-primary transition-colors"><FaYoutube /></a>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p className="text-gray-400">
              We're revolutionizing athlete management and recruitment through AI-powered solutions.
              Join us in shaping the future of sports.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Athlete Management Solution. All rights reserved.</p>
          <p className="mt-2">
            <button onClick={() => navigate('/terms-and-conditions')} className="hover:text-primary">
            terms-and-conditions     
            </button>

            <button onClick={() => navigate('/privacy-policy')} className="hover:text-primary">
            Privacy Policy
            </button>
          </p>
        </div>
      </div>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-primary hover:bg-secondary p-4 rounded-full text-white shadow-lg transition-colors"
        >
          <FaArrowUp />
        </motion.button>
      )}
    </footer>
  );
};

export default Footer;
