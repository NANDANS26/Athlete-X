import { FaDumbbell, FaChartLine, FaSearch, FaHeartbeat, FaBell, FaUsers } from 'react-icons/fa';
import FeatureCard from './FeatureCard';

const Features = () => {
  const features = [
    {
      icon: <FaDumbbell />,
      title: "AI-Generated Training & Diet Plans",
      description: "Personalized workout and nutrition plans powered by AI",
      preview: "View your customized 12-week training program with daily meal suggestions"
    },
    {
      icon: <FaChartLine />,
      title: "Smart Performance Analytics",
      description: "Track and analyze your progress with advanced metrics",
      preview: "Your strength has increased by 15% in the last month!"
    },
    {
      icon: <FaSearch />,
      title: "AI-Powered Scouting & Recruitment",
      description: "Get discovered by top recruiters and teams",
      preview: "3 new scouts have viewed your profile this week"
    },
    {
      icon: <FaHeartbeat />,
      title: "Injury Prevention & Recovery",
      description: "Stay healthy with AI-driven insights",
      preview: "Current injury risk: 12% - Consider rest day"
    },
    {
      icon: <FaBell />,
      title: "Live Notifications",
      description: "Never miss important updates and opportunities",
      preview: "New contract offer from Team Elite!"
    },
    {
      icon: <FaUsers />,
      title: "Athlete Networking",
      description: "Connect with fellow athletes and coaches",
      preview: "Join the conversation with 10k+ athletes"
    }
  ];

  return (
    <section className="py-20 px-4 bg-dark">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Join the Future of Sports Management?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;