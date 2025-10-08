import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../utils/animations.jsx';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Share2, 
  Save, 
  X,
  BookOpen, 
  Activity, 
  Settings, 
  Heart, 
  Sparkles, 
  Search, 
  Lock, 
  Bell, 
  LogOut,
  Camera,
  TrendingUp,
  Clock
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    favoriteGenres: [],
    createdAt: '',
    stats: {
      savedItems: 0,
      recommendations: 0,
      readingTime: '0 hours'
    }
  });

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser && currentUser.profileData) {
        const profile = currentUser.profileData;
        setUserData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || currentUser.email || '',
          bio: profile.bio || '',
          favoriteGenres: profile.favoriteGenres || [],
          createdAt: profile.createdAt || '',
          stats: profile.stats || {
            savedItems: 0,
            recommendations: 0,
            readingTime: '0 hours'
          }
        });
      } else if (currentUser) {
        // Fallback to basic user info
        setUserData({
          firstName: currentUser.displayName?.split(' ')[0] || '',
          lastName: currentUser.displayName?.split(' ')[1] || '',
          email: currentUser.email || '',
          bio: '',
          favoriteGenres: [],
          createdAt: '',
          stats: {
            savedItems: 0,
            recommendations: 0,
            readingTime: '0 hours'
          }
        });
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleInputChange = (e) => {
    if (e.target.name === 'favoriteGenres') {
      const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
      setUserData({
        ...userData,
        favoriteGenres: genres
      });
    } else {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const result = await updateUserProfile(currentUser.uid, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        favoriteGenres: userData.favoriteGenres
      });
      
      if (result.success) {
        setIsEditing(false);
      } else {
        console.error('Failed to update profile:', result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Redirect if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view your profile</p>
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold">
                {userData.firstName && userData.lastName 
                  ? `${userData.firstName[0] || ''}${userData.lastName[0] || ''}`
                  : currentUser?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userData.firstName && userData.lastName 
                  ? `${userData.firstName} ${userData.lastName}`
                  : currentUser?.displayName || 'User'}
              </h1>
              <div className="flex items-center justify-center md:justify-start text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Member since {formatJoinDate(userData.createdAt)}</span>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{userData.stats.savedItems}</div>
                  <div className="text-xs text-gray-400">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-400">{userData.stats.recommendations}</div>
                  <div className="text-xs text-gray-400">Recommended</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ml-auto flex space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span className="hidden md:inline">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
              
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden md:inline">Share Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                      ) : (
                        <p className="text-white py-3">{userData.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        />
                      ) : (
                        <p className="text-white py-3">{userData.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    ) : (
                      <p className="text-white py-3">{userData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={userData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell us about yourself and your anime/manga interests..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none placeholder-gray-400"
                      />
                    ) : (
                      <p className="text-white py-3">{userData.bio || 'No bio added yet.'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Favorite Genres
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="favoriteGenres"
                        value={userData.favoriteGenres.join(', ')}
                        onChange={handleInputChange}
                        placeholder="Action, Romance, Sci-Fi, Adventure..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                      />
                    ) : (
                      <div className="py-3">
                        {userData.favoriteGenres.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {userData.favoriteGenres.map((genre, index) => (
                              <span
                                key={index}
                                className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400">No favorite genres selected yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  {userData.stats.savedItems === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No recent activity yet.</p>
                      <p className="text-sm text-gray-500 mt-2">Start exploring anime and manga to see your activity here!</p>
                    </div>
                  ) : (
                    [
                      { action: 'Joined', item: 'MyNextRead', time: formatJoinDate(userData.createdAt), type: 'system', icon: Calendar }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'anime' ? 'bg-purple-500/20 text-purple-400' : 
                          activity.type === 'manga' ? 'bg-pink-500/20 text-pink-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          <activity.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="text-gray-400">{activity.action}</span> {activity.item}
                          </p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Account</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-lg transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <span>Change Password</span>
                    </div>
                  </button>
                  
                  <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 p-3 rounded-lg transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <span>Notifications</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 p-3 rounded-lg transition-colors text-left text-red-400"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Security */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-400" />
                  Account Security
                </h3>
                <div className="space-y-3">
                  <Link 
                    to="/change-password"
                    className="w-full bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-gray-400">Update your account password</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </Link>
                  
                  <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-left flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium">Email Settings</p>
                        <p className="text-sm text-gray-400">Manage your email preferences</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-pink-400" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Episodes</p>
                      <p className="text-sm text-gray-400">Get notified when new episodes are released</p>
                    </div>
                    <button className="bg-purple-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Chapters</p>
                      <p className="text-sm text-gray-400">Get notified when new manga chapters are available</p>
                    </div>
                    <button className="bg-purple-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recommendations</p>
                      <p className="text-sm text-gray-400">Get personalized content recommendations</p>
                    </div>
                    <button className="bg-gray-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-400" />
                  Privacy
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-400">Control who can see your profile</p>
                    </div>
                    <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activity Tracking</p>
                      <p className="text-sm text-gray-400">Allow tracking of your viewing activity</p>
                    </div>
                    <button className="bg-purple-600 relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-red-800/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center text-red-400">
                  <span className="w-5 h-5 mr-2">⚠️</span>
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 p-4 rounded-lg transition-colors text-left text-red-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-red-300/70">Permanently delete your account and all data</p>
                      </div>
                      <span className="text-red-400">→</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Profile;