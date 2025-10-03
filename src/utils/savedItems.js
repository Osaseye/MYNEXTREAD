// Utility functions for managing saved items in localStorage

const SAVED_ITEMS_KEY = 'mynextread_saved_items';

export const SavedItemsManager = {
  // Get all saved items
  getSavedItems() {
    try {
      const saved = localStorage.getItem(SAVED_ITEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting saved items:', error);
      return [];
    }
  },

  // Check if an item is saved
  isItemSaved(itemId) {
    const savedItems = this.getSavedItems();
    return savedItems.some(item => item.id === itemId);
  },

  // Save an item
  saveItem(media) {
    try {
      const savedItems = this.getSavedItems();
      
      // Don't save if already saved
      if (this.isItemSaved(media.id)) {
        return false;
      }

      // Create a lightweight version for storage
      let type = 'manga'; // default
      if (['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].includes(media.format)) {
        type = 'anime';
      } else if (['NOVEL'].includes(media.format)) {
        type = 'novel';
      }

      const itemToSave = {
        id: media.id,
        title: media.title,
        cover: media.cover,
        score: media.score,
        genres: media.genres,
        status: media.status,
        format: media.format,
        year: media.year,
        type: type,
        savedAt: new Date().toISOString()
      };

      savedItems.push(itemToSave);
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedItems));
      return true;
    } catch (error) {
      console.error('Error saving item:', error);
      return false;
    }
  },

  // Remove an item
  removeItem(itemId) {
    try {
      const savedItems = this.getSavedItems();
      const filteredItems = savedItems.filter(item => item.id !== itemId);
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  },

  // Toggle save state
  toggleSave(media) {
    if (this.isItemSaved(media.id)) {
      return this.removeItem(media.id);
    } else {
      return this.saveItem(media);
    }
  },

  // Get saved items by type
  getSavedItemsByType(type) {
    const savedItems = this.getSavedItems();
    return savedItems.filter(item => item.type === type);
  },

  // Clear all saved items
  clearAll() {
    try {
      localStorage.removeItem(SAVED_ITEMS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing saved items:', error);
      return false;
    }
  }
};