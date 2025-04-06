import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaClock, FaUtensils, FaDumbbell, FaChartLine, FaHeartbeat, FaHandshake, FaCog, FaRobot, FaBell, FaUsers, FaChartBar } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Overview from './Overview';
import WearableSync from './WearableSync';
import TrainingPlans from './TrainingPlans';
import Nutrition from './Nutrition';
import Performance from './Performance';
import InjuryPrevention from './InjuryPrevention';
import Recruitment from './Recruitment';
import Settings from './Settings';
import AIInsights from './AIInsights';
import Notifications from './Notifications';
import Social from './Social';
import LiveComparison from './LiveComparison';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export type AthleteData = {
  name: string;
  sport: string;
  position: string;
  fitnessLevel: string;
  [key: string]: any;
};

const menuItems = [
  { icon: FaHome, label: 'Overview', id: 'overview' },
  { icon: FaClock, label: 'Wearable Sync', id: 'wearable' },
  { icon: FaUtensils, label: 'Nutrition', id: 'nutrition' },
  { icon: FaDumbbell, label: 'Training Plans', id: 'training' },
  { icon: FaChartLine, label: 'Performance', id: 'performance' },
  { icon: FaHeartbeat, label: 'Injury Prevention', id: 'injury' },
  { icon: FaHandshake, label: 'Recruitment', id: 'recruitment' },
  { icon: FaRobot, label: 'AI Insights', id: 'ai-insights' },
  { icon: FaBell, label: 'Notifications', id: 'notifications' },
  { icon: FaUsers, label: 'Community', id: 'social' },
  { icon: FaChartBar, label: 'Live Comparison', id: 'comparison' },
  { icon: FaCog, label: 'Settings', id: 'settings' }
];

const AthleteDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const athleteDoc = await getDoc(doc(db, 'athletes', userId));
        if (athleteDoc.exists()) {
          setAthleteData(athleteDoc.data() as AthleteData);
        }
      } catch (error) {
        console.error('Error fetching athlete data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!athleteData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-gray-400">No athlete data found</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return <Overview athleteData={athleteData} />;
      case 'wearable':
        return <WearableSync />;
      case 'nutrition':
        return <Nutrition athleteData={athleteData} />;
      case 'training':
        return <TrainingPlans athleteData={athleteData} />;
      case 'performance':
        return <Performance athleteData={athleteData} />;
      case 'injury':
        return <InjuryPrevention athleteData={athleteData} />;
      case 'recruitment':
        return <Recruitment athleteData={athleteData} />;
      case 'ai-insights':
        return <AIInsights athleteData={athleteData} />;
      case 'notifications':
        return <Notifications athleteData={athleteData} />;
      case 'social':
        return <Social athleteData={athleteData} />;
      case 'comparison':
        return <LiveComparison athleteData={athleteData} />;
      case 'settings':
        return <Settings athleteData={athleteData} />;
      default:
        return <Overview athleteData={athleteData} />;
    }
  };

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-8"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default AthleteDashboard;