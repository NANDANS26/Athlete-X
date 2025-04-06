import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaHeart, FaComment, FaShare, FaTrophy, FaUserFriends, FaSearch, FaRobot } from 'react-icons/fa';
import type { AthleteData } from './AthleteDashboard';

interface SocialProps {
  athleteData: AthleteData;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    sport: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: Date;
  isAIInsight?: boolean;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  sport: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  achievements: string[];
}

const Social = ({ athleteData }: SocialProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard' | 'network'>('feed');
  const [newPost, setNewPost] = useState('');

  // Simulate fetching posts from Firebase
  useEffect(() => {
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Thompson',
          avatar: 'https://i.pravatar.cc/150?img=1',
          sport: 'Track & Field'
        },
        content: 'Just broke my personal record in the 100m sprint! 🏃‍♀️💨 Hard work pays off!',
        likes: 42,
        comments: 8,
        shares: 3,
        timestamp: new Date()
      },
      {
        id: '2',
        author: {
          name: 'AI Coach',
          avatar: 'https://i.pravatar.cc/150?img=3',
          sport: 'Performance Analysis'
        },
        content: 'Based on recent training data, athletes who incorporate plyometric exercises show a 15% improvement in explosive power. Try adding box jumps to your routine! 📊🤖',
        likes: 89,
        comments: 12,
        shares: 15,
        timestamp: new Date(Date.now() - 3600000),
        isAIInsight: true
      }
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Michael Chen',
        sport: 'Swimming',
        score: 98,
        trend: 'up',
        achievements: ['Speed Demon', 'Consistency King']
      },
      {
        id: '2',
        name: 'Emma Rodriguez',
        sport: 'Basketball',
        score: 95,
        trend: 'stable',
        achievements: ['Team Player', 'Rising Star']
      }
    ];

    setPosts(mockPosts);
    setLeaderboard(mockLeaderboard);
  }, []);

  const handlePostSubmit = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: athleteData.name,
        avatar: 'https://i.pravatar.cc/150?img=3',
        sport: athleteData.sport
      },
      content: newPost,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date()
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Athlete Community</h1>
          <p className="text-gray-400">
            Connect, share, and grow with fellow athletes
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4">
        {[
          { id: 'feed', label: 'Social Feed', icon: FaUserFriends },
          { id: 'leaderboard', label: 'Leaderboard', icon: FaTrophy },
          { id: 'network', label: 'My Network', icon: FaUser }
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors
              ${activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
          >
            <tab.icon />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts/Feed Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Post Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your training achievements..."
              className="w-full bg-white/5 rounded-lg p-4 text-white placeholder-gray-400 
                focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all duration-300 
                resize-none h-32"
            />
            <div className="flex justify-end mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePostSubmit}
                className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg 
                  transition-colors"
              >
                Post Update
              </motion.button>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/10 backdrop-blur-lg p-6 rounded-xl ${
                  post.isAIInsight ? 'border border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{post.author.name}</h3>
                      {post.isAIInsight && (
                        <FaRobot className="text-primary" />
                      )}
                      <span className="text-gray-400 text-sm">• {post.author.sport}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post content"
                        className="rounded-lg mb-4 w-full"
                      />
                    )}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaHeart /> {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                        <FaComment /> {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors">
                        <FaShare /> {post.shares}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search athletes..."
                className="w-full bg-white/5 rounded-lg py-3 pl-10 pr-4 text-white 
                  placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-white/10 
                  transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Top Athletes
            </h2>
            <div className="space-y-4">
              {leaderboard.map((athlete, index) => (
                <motion.div
                  key={athlete.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-lg"
                >
                  <div className="text-2xl font-bold text-primary">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{athlete.name}</h3>
                    <p className="text-sm text-gray-400">{athlete.sport}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{athlete.score}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaRobot className="text-primary" />
              AI Suggestions
            </h2>
            <p className="text-gray-400 text-sm">
              Based on your profile and activities, you might want to connect with these athletes:
            </p>
            {/* AI suggestions would go here */}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Social;