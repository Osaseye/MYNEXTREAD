# MyNextRead Firestore Database Structure

## Collections Overview

### 1. `users` Collection
**Document ID**: User's Firebase Auth UID  
**Purpose**: Store comprehensive user profiles and preferences

#### User Document Structure:
```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  displayName: "John Doe",
  bio: "", // User's bio description
  favoriteGenres: [], // Array of preferred anime/manga genres
  createdAt: "2025-10-04T12:00:00.000Z",
  lastLoginAt: "2025-10-04T12:00:00.000Z",
  updatedAt: "2025-10-04T12:00:00.000Z", // Added when profile is updated
  
  preferences: {
    theme: "dark", // "dark" or "light"
    notifications: true
  },
  
  stats: {
    savedItems: 0, // Number of saved anime/manga
    recommendations: 0, // Number of recommendations given/received
    readingTime: "0 hours" // Total reading/watching time
  }
}
```

## Future Collections (Recommended)

### 2. `savedItems` Collection
**Document ID**: Auto-generated  
**Purpose**: Store user's saved anime/manga items

```javascript
{
  userId: "user_firebase_uid",
  itemType: "anime" | "manga" | "webtoon",
  itemId: "anilist_id_or_external_id",
  title: "Item Title",
  status: "want_to_watch" | "watching" | "completed" | "dropped" | "on_hold",
  rating: 1-10, // User's rating
  notes: "Personal notes",
  dateAdded: "2025-10-04T12:00:00.000Z",
  dateCompleted: "2025-10-04T12:00:00.000Z" // if completed
}
```

### 3. `recommendations` Collection
**Document ID**: Auto-generated  
**Purpose**: Store AI-generated recommendations

```javascript
{
  userId: "user_firebase_uid",
  recommendationType: "anime" | "manga" | "webtoon",
  items: [
    {
      id: "anilist_id",
      title: "Recommended Title",
      reason: "Why this was recommended",
      confidence: 0.95 // AI confidence score
    }
  ],
  generatedAt: "2025-10-04T12:00:00.000Z",
  viewed: false,
  feedback: "liked" | "disliked" | null
}
```

### 4. `userPreferences` Collection (Optional - could be part of users)
**Document ID**: User's Firebase Auth UID  
**Purpose**: Detailed user preferences for recommendations

```javascript
{
  userId: "user_firebase_uid",
  favoriteGenres: ["Action", "Romance", "Sci-Fi"],
  avoidGenres: ["Horror", "Ecchi"],
  preferredLength: "any" | "short" | "medium" | "long",
  platforms: ["Netflix", "Crunchyroll", "Funimation"],
  language: "sub" | "dub" | "both",
  maturityRating: "all" | "teen" | "mature"
}
```

## Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /savedItems/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /recommendations/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Current Implementation Status

✅ **Implemented**: 
- User profile creation during registration
- User profile updates
- Authentication state management
- Last login tracking

📋 **Ready for Implementation**:
- Saved items functionality
- Recommendations storage
- User statistics tracking
- Advanced preferences

## Notes

1. **Automatic Profile Creation**: When users register, a complete profile document is automatically created in Firestore
2. **Real-time Updates**: All user data updates immediately in Firestore
3. **Scalable Structure**: The design supports future features like social features, reviews, etc.
4. **Security First**: Each user can only access their own data
5. **Analytics Ready**: Structure supports usage analytics and recommendation improvements