import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');

  // Redirect if not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    setFirebaseError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.currentPassword.length < 6) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setFirebaseError('');

    try {
      // TODO: Implement password change with Firebase
      // This would involve reauthenticating the user first, then updating password
      console.log('Change password attempt:', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Simulate success for now
      setTimeout(() => {
        setIsSuccess(true);
        setIsLoading(false);
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect after success
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Password change error:', error);
      setFirebaseError('Failed to change password. Please try again.');
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Changed Successfully!</h2>
          <p className="text-gray-400 mb-6">Your password has been updated securely.</p>
          <p className="text-sm text-gray-500">Redirecting to profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Change Password</h1>
            <p className="text-gray-400">Update your account password</p>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          {/* Firebase Error Display */}
          {firebaseError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm text-center">{firebaseError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-red-400 text-xs">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-400 text-xs">{errors.newPassword}</p>}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 pr-12 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-800/30 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-400 mb-2">Password requirements:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Different from your current password</li>
                <li>• Consider using a mix of letters, numbers, and symbols</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing Password...
                </div>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            For your security, you'll be logged out of all devices after changing your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;