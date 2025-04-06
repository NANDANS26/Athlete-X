import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  menuItems: {
    icon: IconType;
    label: string;
    id: string;
  }[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ menuItems, activeSection, onSectionChange }: SidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-white/5 backdrop-blur-lg border-r border-white/10"
    >
      <div className="h-full flex flex-col">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-primary">Recruiter Hub</h2>
        </div>

        <nav className="flex-1 px-4 py-2">
          {menuItems.map(({ icon: Icon, label, id }) => (
            <motion.button
              key={id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSectionChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors
                ${activeSection === id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:bg-white/10'
                }`}
            >
              <Icon />
              <span>{label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10"
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;