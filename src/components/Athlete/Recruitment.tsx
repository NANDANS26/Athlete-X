import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandshake, FaTrophy, FaChartLine, FaBell, FaFileContract } from 'react-icons/fa';
import type { AthleteData } from './AthleteDashboard';

interface RecruitmentProps {
  athleteData: AthleteData;
}

interface Offer {
  id: string;
  type: 'contract' | 'scholarship' | 'tryout';
  organization: string;
  title: string;
  description: string;
  value?: string;
  deadline: string;
  status: 'new' | 'pending' | 'accepted' | 'declined';
}

const Recruitment = ({ athleteData }: RecruitmentProps) => {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      type: 'contract',
      organization: 'Elite Sports Club',
      title: 'Professional Contract Offer',
      description: 'Full-time professional contract with performance bonuses',
      value: '$75,000/year',
      deadline: '2024-03-15',
      status: 'new'
    },
    {
      id: '2',
      type: 'scholarship',
      organization: 'State University',
      title: 'Athletic Scholarship',
      description: 'Full athletic scholarship including tuition and accommodation',
      value: '$45,000/year',
      deadline: '2024-04-01',
      status: 'pending'
    },
    {
      id: '3',
      type: 'tryout',
      organization: 'National Team',
      title: 'National Team Tryout',
      description: 'Invitation to national team selection camp',
      deadline: '2024-03-20',
      status: 'new'
    }
  ]);

  const [careerMetrics] = useState({
    matchesPlayed: 45,
    winRate: 78,
    performanceRating: 8.5,
    recruitmentScore: 85
  });

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const aiInsights = [
    "Your recent performance metrics indicate high interest from professional clubs",
    "Consider the State University offer for long-term career development",
    "Your market value has increased by 25% in the last 3 months",
    "Recommended: Attend the National Team tryout for exposure"
  ];

  // Simulate real-time data updates
  

  const handleOfferAction = (offerId: string, action: 'accept' | 'decline') => {
    setOffers(prev => prev.map(offer => 
      offer.id === offerId
        ? { ...offer, status: action === 'accept' ? 'accepted' : 'declined' }
        : offer
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'accepted':
        return 'text-blue-500';
      case 'declined':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
  };

  const closeModal = () => {
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recruitment & Offers</h1>
          <p className="text-gray-400">
            AI-powered career opportunities for {athleteData.sport}
          </p>
        </div>
      </div>

      {/* Career Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaTrophy className="text-yellow-500 text-xl" />
            <h3 className="font-semibold">Matches</h3>
          </div>
          <p className="text-3xl font-bold">{careerMetrics.matchesPlayed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-green-500 text-xl" />
            <h3 className="font-semibold">Win Rate</h3>
          </div>
          <p className="text-3xl font-bold">{careerMetrics.winRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-blue-500 text-xl" />
            <h3 className="font-semibold">Performance</h3>
          </div>
          <p className="text-3xl font-bold">{careerMetrics.performanceRating}/10</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaHandshake className="text-purple-500 text-xl" />
            <h3 className="font-semibold">Recruitment</h3>
          </div>
          <p className="text-3xl font-bold">{careerMetrics.recruitmentScore}/100</p>
        </motion.div>
      </div>

      {/* Active Offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaFileContract className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">Active Offers</h2>
        </div>

        <div className="space-y-4">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 p-6 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{offer.title}</h3>
                  <p className="text-gray-400 text-sm">{offer.organization}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(offer.status)} bg-white/10`}>
                  {offer.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{offer.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  {offer.value && (
                    <p className="text-sm">
                      <span className="text-gray-400">Value:</span>{' '}
                      <span className="text-primary">{offer.value}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-gray-400">Deadline:</span>{' '}
                    {new Date(offer.deadline).toLocaleDateString()}
                  </p>
                </div>

                {offer.status === 'new' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOfferAction(offer.id, 'accept');
                      }}
                      className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOfferAction(offer.id, 'decline');
                      }}
                      className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Decline
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaBell className="text-primary text-2xl" />
          <h2 className="text-xl font-semibold">AI Career Insights</h2>
        </div>

        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-white/5 p-4 rounded-lg"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <p>{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Offer Letter Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-8 rounded-xl max-w-2xl w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Offer Letter</h2>
            <div className="space-y-4">
              <p><strong>Organization:</strong> {selectedOffer.organization}</p>
              <p><strong>Title:</strong> {selectedOffer.title}</p>
              <p><strong>Description:</strong> {selectedOffer.description}</p>
              {selectedOffer.value && <p><strong>Value:</strong> {selectedOffer.value}</p>}
              <p><strong>Deadline:</strong> {new Date(selectedOffer.deadline).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={getStatusColor(selectedOffer.status)}>{selectedOffer.status.toUpperCase()}</span></p>
            </div>
            <button
              onClick={closeModal}
              className="mt-6 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;