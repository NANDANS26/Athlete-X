import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileContract, FaRobot, FaUserTie, FaChartLine, FaComments, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Import the JSON data (replace with your actual JSON data)
import athletesData from '../config/athlete.json'; // Adjust the path as needed

interface Athlete {
  id: string;
  name: string;
  sport: string;
  age: number;
  marketValue: number;
  image: string;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected'; // Specific status values
  position: string;
  awards?: string | null; // Allow awards to be string or null
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'professional' | 'scholarship' | 'endorsement';
  description: string;
}

const ContractManagement = () => {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [contractTerms, setContractTerms] = useState({
    salary: 50000,
    duration: 2,
    bonuses: true,
    incentives: []
  });
  const [selectedSport, setSelectedSport] = useState<string>('');

  // Mock contract templates
  const contractTemplates: ContractTemplate[] = [
    {
      id: '1',
      name: 'Professional Contract',
      type: 'professional',
      description: 'Standard professional contract with performance bonuses'
    },
    {
      id: '2',
      name: 'University Scholarship',
      type: 'scholarship',
      description: 'Full athletic scholarship including tuition and accommodation'
    },
    {
      id: '3',
      name: 'Endorsement Deal',
      type: 'endorsement',
      description: 'Brand partnership and sponsorship agreement'
    }
  ];

  // Filter athletes by selected sport
  const filteredAthletes = selectedSport
    ? athletesData[selectedSport as keyof typeof athletesData].map((player) => ({
        id: player.Name.replace(/\s+/g, '-').toLowerCase(),
        name: player.Name,
        sport: selectedSport,
        age: player.Age,
        marketValue: Math.floor(Math.random() * 100000) + 50000, // Random market value for demo
        image: player.Image,
        status: ['pending', 'negotiating', 'accepted', 'rejected'][Math.floor(Math.random() * 4)] as 'pending' | 'negotiating' | 'accepted' | 'rejected',
        position: player.Position,
        awards: player.Awards ?? null // Ensure awards is either string or null
      }))
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'negotiating':
        return 'text-blue-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Function to send the contract
  const handleSendContract = () => {
    if (!selectedAthlete || !selectedTemplate) {
      alert('Please select an athlete and a contract template.');
      return;
    }

    // Simulate sending the contract
    console.log('Contract sent to:', selectedAthlete.name);
    console.log('Contract Terms:', contractTerms);

    // Show a confirmation message
    alert(`Contract sent to ${selectedAthlete.name}. Awaiting response.`);
  };

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Athletes */}
        <div className="bg-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUserTie className="text-2xl text-primary" />
            <h2 className="text-xl font-semibold">Shortlisted Athletes</h2>
          </div>

          {/* Sport Filter Dropdown */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
          >
            <option value="">Select Sport</option>
            {Object.keys(athletesData).map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>

          <div className="space-y-4">
            {filteredAthletes.map((athlete) => (
              <motion.div
                key={athlete.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAthlete(athlete)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedAthlete?.id === athlete.id
                    ? 'bg-primary/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{athlete.name}</h3>
                    <p className="text-sm text-gray-400">
                      {athlete.sport} • {athlete.position} • {athlete.age} years
                    </p>
                    {athlete.awards && (
                      <p className="text-sm text-gray-400 mt-1">
                        Awards: {athlete.awards}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm ${getStatusColor(athlete.status)}`}>
                    {athlete.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Middle Panel - Contract Creation */}
        <div className="bg-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaFileContract className="text-2xl text-primary" />
            <h2 className="text-xl font-semibold">Contract Details</h2>
          </div>

          {selectedAthlete ? (
            <div className="space-y-6">
              {/* Contract Templates */}
              <div className="space-y-4">
                <h3 className="font-semibold">Select Template</h3>
                {contractTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-primary/20'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Contract Terms */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Customize Terms</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Salary (Annual)</label>
                    <input
                      type="range"
                      min="10000"
                      max="100000"
                      step="5000"
                      value={contractTerms.salary}
                      onChange={(e) => setContractTerms(prev => ({
                        ...prev,
                        salary: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${contractTerms.salary.toLocaleString()}</span>
                      <span className="text-primary">Market Value: ${selectedAthlete.marketValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Contract Duration (Years)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={contractTerms.duration}
                      onChange={(e) => setContractTerms(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="text-sm">{contractTerms.duration} years</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contractTerms.bonuses}
                      onChange={(e) => setContractTerms(prev => ({
                        ...prev,
                        bonuses: e.target.checked
                      }))}
                    />
                    <label className="text-sm">Include Performance Bonuses</label>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <div className="bg-primary/20 p-4 rounded-lg flex items-start gap-3">
                <FaRobot className="text-primary text-xl mt-1" />
                <div>
                  <p className="text-sm font-semibold">AI Suggestion</p>
                  <p className="text-sm">Based on market trends, consider offering a 3-year contract with performance-based incentives.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendContract}
                  className="flex-1 bg-primary hover:bg-secondary text-white py-3 rounded-lg transition-colors"
                >
                  Send Contract
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChat(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg transition-colors"
                >
                  Negotiate
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select an athlete to create a contract
            </div>
          )}
        </div>

        {/* Right Panel - Status & Chat */}
        <div className="bg-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaChartLine className="text-2xl text-primary" />
            <h2 className="text-xl font-semibold">Contract Status</h2>
          </div>

          {selectedAthlete ? (
            <div className="space-y-6">
              {/* Status Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500" />
                  <div>
                    <h4 className="font-semibold">Contract Created</h4>
                    <p className="text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaSpinner className="text-yellow-500 animate-spin" />
                  <div>
                    <h4 className="font-semibold">Awaiting Response</h4>
                    <p className="text-sm text-gray-400">Expires in 48 hours</p>
                  </div>
                </div>
              </div>

              {/* Chat Section */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10 pt-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FaComments className="text-primary" />
                      <h3 className="font-semibold">Negotiation Chat</h3>
                    </div>

                    <div className="h-64 bg-white/5 rounded-lg p-4 mb-4 overflow-y-auto">
                      {/* Chat messages would go here */}
                      <p className="text-gray-400 text-center">Start negotiating terms</p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary hover:bg-secondary text-white px-6 rounded-lg transition-colors"
                      >
                        Send
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No active contracts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractManagement;