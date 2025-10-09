import { SavedItemsManager } from './savedItems';

// Activity types
export const ACTIVITY_TYPES = {
  SAVED: 'saved',
  REMOVED: 'removed',
  LIKED: 'liked',
  RATED: 'rated',
  WATCHED: 'watched',
  READ: 'read',
  JOINED: 'joined'
};

// Activity Manager for tracking user interactions
export class ActivityManager {
  static STORAGE_KEY = 'mynextread_user_activities';
  static MAX_ACTIVITIES = 50; // Keep only the last 50 activities

  // Get all user activities
  static getActivities() {
    try {
      const activities = localStorage.getItem(this.STORAGE_KEY);
      return activities ? JSON.parse(activities) : [];
    } catch (error) {
      console.error('Error loading activities:', error);
      return [];
    }
  }

  // Add a new activity
  static addActivity(type, item, additionalData = {}) {
    try {
      const activities = this.getActivities();
      
      const newActivity = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        type,
        timestamp: new Date().toISOString(),
        item: {
          id: item.id,
          title: item.title,
          type: item.type, // ANIME, MANGA, NOVEL
          image: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || item.image,
          bannerImage: item.bannerImage, // For background use
          score: item.score,
          genres: item.genres || [],
          status: item.status,
          description: item.description,
          averageScore: item.averageScore,
          episodes: item.episodes,
          chapters: item.chapters,
          year: item.startDate?.year
        },
        ...additionalData
      };

      // Add to beginning of array (most recent first)
      activities.unshift(newActivity);

      // Keep only the last MAX_ACTIVITIES
      const trimmedActivities = activities.slice(0, this.MAX_ACTIVITIES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedActivities));
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('activityAdded', { 
        detail: newActivity 
      }));
      
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  }

  // Track when user saves an item
  static trackSave(item) {
    return this.addActivity(ACTIVITY_TYPES.SAVED, item, {
      action: 'Added to library'
    });
  }

  // Track when user removes an item
  static trackRemove(item) {
    return this.addActivity(ACTIVITY_TYPES.REMOVED, item, {
      action: 'Removed from library'
    });
  }

  // Track when user likes an item
  static trackLike(item) {
    return this.addActivity(ACTIVITY_TYPES.LIKED, item, {
      action: 'Liked'
    });
  }

  // Track when user rates an item
  static trackRating(item, rating) {
    return this.addActivity(ACTIVITY_TYPES.RATED, item, {
      action: 'Rated',
      rating
    });
  }

  // Track when user marks as watched/read
  static trackComplete(item) {
    const action = item.type === 'ANIME' ? 'Watched' : 'Read';
    const type = item.type === 'ANIME' ? ACTIVITY_TYPES.WATCHED : ACTIVITY_TYPES.READ;
    
    return this.addActivity(type, item, {
      action
    });
  }

  // Get activities filtered by type
  static getActivitiesByType(type) {
    return this.getActivities().filter(activity => activity.type === type);
  }

  // Get recent activities (last N days)
  static getRecentActivities(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.getActivities().filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= cutoffDate;
    });
  }

  // Get activity stats
  static getActivityStats() {
    const activities = this.getActivities();
    
    const stats = {
      total: activities.length,
      saved: activities.filter(a => a.type === ACTIVITY_TYPES.SAVED).length,
      liked: activities.filter(a => a.type === ACTIVITY_TYPES.LIKED).length,
      watched: activities.filter(a => a.type === ACTIVITY_TYPES.WATCHED).length,
      read: activities.filter(a => a.type === ACTIVITY_TYPES.READ).length,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= weekAgo) stats.thisWeek++;
      if (activityDate >= monthAgo) stats.thisMonth++;
    });

    return stats;
  }

  // Clear all activities
  static clearActivities() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('activitiesCleared'));
      return true;
    } catch (error) {
      console.error('Error clearing activities:', error);
      return false;
    }
  }



  // Format activity for display
  static formatActivity(activity) {
    const timeAgo = this.getTimeAgo(activity.timestamp);
    
    return {
      ...activity,
      timeAgo,
      displayText: this.getDisplayText(activity),
      icon: this.getActivityIcon(activity.type),
      color: this.getActivityColor(activity.type, activity.item.type)
    };
  }

  // Get human-readable time ago
  static getTimeAgo(timestamp) {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityDate.toLocaleDateString();
  }

  // Get display text for activity
  static getDisplayText(activity) {
    const { action, item } = activity;
    return `${action} "${item.title}"`;
  }

  // Get icon for activity type
  static getActivityIcon(type) {
    switch (type) {
      case ACTIVITY_TYPES.SAVED: return 'Heart';
      case ACTIVITY_TYPES.REMOVED: return 'HeartOff';
      case ACTIVITY_TYPES.LIKED: return 'ThumbsUp';
      case ACTIVITY_TYPES.RATED: return 'Star';
      case ACTIVITY_TYPES.WATCHED: return 'Play';
      case ACTIVITY_TYPES.READ: return 'BookOpen';
      default: return 'Activity';
    }
  }

  // Get color for activity
  static getActivityColor(type, itemType) {
    // Base color on item type (anime/manga/novel)
    if (itemType === 'ANIME') return 'bg-anime-purple/20 text-anime-purple border-anime-purple/30';
    if (itemType === 'MANGA') return 'bg-anime-pink/20 text-anime-pink border-anime-pink/30';
    if (itemType === 'NOVEL') return 'bg-anime-cyan/20 text-anime-cyan border-anime-cyan/30';
    
    // Fallback colors based on activity type
    switch (type) {
      case ACTIVITY_TYPES.SAVED: return 'bg-anime-pink/20 text-anime-pink border-anime-pink/30';
      case ACTIVITY_TYPES.LIKED: return 'bg-anime-cyan/20 text-anime-cyan border-anime-cyan/30';
      case ACTIVITY_TYPES.WATCHED:
      case ACTIVITY_TYPES.READ: return 'bg-anime-purple/20 text-anime-purple border-anime-purple/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }
}

// Hook the SavedItemsManager to track activities
const originalToggleSave = SavedItemsManager.toggleSave;
SavedItemsManager.toggleSave = function(item) {
  const wasAlreadySaved = this.isItemSaved(item.id);
  const result = originalToggleSave.call(this, item);
  
  if (result) {
    if (wasAlreadySaved) {
      ActivityManager.trackRemove(item);
    } else {
      ActivityManager.trackSave(item);
    }
  }
  
  return result;
};

export default ActivityManager;