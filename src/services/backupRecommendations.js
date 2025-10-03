// Backup Recommendation Service - Static fallback data when APIs fail
export const BackupRecommendations = {
  // Popular anime recommendations by genre
  anime: {
    Action: [
      {
        id: 'backup_1',
        title: 'Attack on Titan',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiMF.jpg',
        genres: ['Action', 'Drama', 'Fantasy'],
        score: 90,
        year: 2013,
        format: 'TV',
        description: 'Humanity fights for survival against giant humanoid Titans.',
        type: 'anime'
      },
      {
        id: 'backup_2',
        title: 'Demon Slayer',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg',
        genres: ['Action', 'Supernatural', 'Historical'],
        score: 87,
        year: 2019,
        format: 'TV',
        description: 'A young boy becomes a demon slayer to save his sister.',
        type: 'anime'
      },
      {
        id: 'backup_3',
        title: 'Jujutsu Kaisen',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFubq.jpg',
        genres: ['Action', 'School', 'Supernatural'],
        score: 86,
        year: 2020,
        format: 'TV',
        description: 'Students fight cursed spirits in modern Japan.',
        type: 'anime'
      }
    ],
    Romance: [
      {
        id: 'backup_4',
        title: 'Your Name',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-XIr6Kd1F8mVf.jpg',
        genres: ['Romance', 'Drama', 'Supernatural'],
        score: 85,
        year: 2016,
        format: 'MOVIE',
        description: 'Two teenagers share a profound, magical connection.',
        type: 'anime'
      },
      {
        id: 'backup_5',
        title: 'Horimiya',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-h8epAVynWUau.jpg',
        genres: ['Romance', 'School', 'Slice of Life'],
        score: 82,
        year: 2021,
        format: 'TV',
        description: 'High school students discover each other\'s hidden sides.',
        type: 'anime'
      },
      {
        id: 'backup_6',
        title: 'Toradora!',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx4224-KBCharOtgRYz.jpg',
        genres: ['Romance', 'Comedy', 'School'],
        score: 81,
        year: 2008,
        format: 'TV',
        description: 'Two students help each other pursue their crushes.',
        type: 'anime'
      }
    ],
    Comedy: [
      {
        id: 'backup_7',
        title: 'One Piece',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg',
        genres: ['Action', 'Adventure', 'Comedy'],
        score: 90,
        year: 1999,
        format: 'TV',
        description: 'A pirate crew searches for the ultimate treasure.',
        type: 'anime'
      },
      {
        id: 'backup_8',
        title: 'Spy x Family',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-ReiDayV6a8yN.jpg',
        genres: ['Comedy', 'Action', 'Family'],
        score: 86,
        year: 2022,
        format: 'TV',
        description: 'A spy, assassin, and telepath form a fake family.',
        type: 'anime'
      }
    ],
    Drama: [
      {
        id: 'backup_9',
        title: 'A Silent Voice',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20954-UMb6Kl7CnvRz.jpg',
        genres: ['Drama', 'Romance', 'School'],
        score: 89,
        year: 2016,
        format: 'MOVIE',
        description: 'A bully seeks redemption with his deaf classmate.',
        type: 'anime'
      }
    ],
    Fantasy: [
      {
        id: 'backup_10',
        title: 'Spirited Away',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx199-CEKQBT9AoHJw.jpg',
        genres: ['Adventure', 'Family', 'Fantasy'],
        score: 92,
        year: 2001,
        format: 'MOVIE',
        description: 'A girl enters a world ruled by gods and witches.',
        type: 'anime'
      }
    ]
  },

  // Popular manga recommendations by genre
  manga: {
    Action: [
      {
        id: 'backup_11',
        title: 'One Piece',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-7XiP5mTxzA52.jpg',
        genres: ['Action', 'Adventure', 'Comedy'],
        score: 92,
        year: 1997,
        format: 'MANGA',
        description: 'Epic pirate adventure seeking the One Piece treasure.',
        type: 'manga'
      },
      {
        id: 'backup_12',
        title: 'Chainsaw Man',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-74YTFlQzcFPg.jpg',
        genres: ['Action', 'Horror', 'Supernatural'],
        score: 85,
        year: 2018,
        format: 'MANGA',
        description: 'A young man becomes a devil hunter with chainsaw powers.',
        type: 'manga'
      }
    ],
    Romance: [
      {
        id: 'backup_13',
        title: 'Kaguya-sama: Love is War',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86635-EdaLQmsn92Cf.jpg',
        genres: ['Comedy', 'Romance', 'School'],
        score: 87,
        year: 2015,
        format: 'MANGA',
        description: 'Two student council members wage a war of love.',
        type: 'manga'
      }
    ],
    Drama: [
      {
        id: 'backup_14',
        title: 'Monster',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30001-NuQjMRt0FdWT.jpg',
        genres: ['Drama', 'Mystery', 'Psychological'],
        score: 94,
        year: 1994,
        format: 'MANGA',
        description: 'A doctor hunts a serial killer he once saved.',
        type: 'manga'
      }
    ]
  },

  // Popular light novels by genre
  novel: {
    Fantasy: [
      {
        id: 'backup_15',
        title: 'Sword Art Online',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx61893-aADoRDpB0Vrb.jpg',
        genres: ['Adventure', 'Romance', 'Sci-Fi'],
        score: 75,
        year: 2009,
        format: 'NOVEL',
        description: 'Players trapped in a virtual reality MMORPG.',
        type: 'novel'
      },
      {
        id: 'backup_16',
        title: 'Re:Zero',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85882-6iYcZVyOUGGZ.jpg',
        genres: ['Drama', 'Fantasy', 'Psychological'],
        score: 82,
        year: 2012,
        format: 'NOVEL',
        description: 'A boy gains the power to return from death.',
        type: 'novel'
      }
    ],
    Romance: [
      {
        id: 'backup_17',
        title: 'Oregairu',
        cover: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx70449-M8iBMz6lOWLE.jpg',
        genres: ['Comedy', 'Romance', 'School'],
        score: 78,
        year: 2011,
        format: 'NOVEL',
        description: 'A cynical student joins the service club.',
        type: 'novel'
      }
    ]
  }
};

// Get recommendations by filters
export const getBackupRecommendations = (filterOptions) => {
  const { genres, minRating, type } = filterOptions;
  let candidates = [];

  // Determine which categories to search
  const searchTypes = type === 'all' ? ['anime', 'manga', 'novel'] : [type];
  
  // Collect all matching items
  searchTypes.forEach(searchType => {
    const categoryData = BackupRecommendations[searchType];
    if (!categoryData) return;

    // If specific genres selected, search those genres
    if (genres.length > 0) {
      genres.forEach(genre => {
        if (categoryData[genre]) {
          candidates.push(...categoryData[genre]);
        }
      });
    } else {
      // No specific genres, get from all genres
      Object.values(categoryData).forEach(genreItems => {
        candidates.push(...genreItems);
      });
    }
  });

  // Filter by minimum rating
  candidates = candidates.filter(item => item.score >= minRating);

  // Remove duplicates
  const uniqueCandidates = candidates.filter((item, index, arr) => 
    arr.findIndex(i => i.id === item.id) === index
  );

  // Filter by selected genres if specified
  if (genres.length > 0) {
    return uniqueCandidates.filter(item => 
      genres.some(selectedGenre => 
        item.genres.some(itemGenre => 
          itemGenre.toLowerCase().includes(selectedGenre.toLowerCase())
        )
      )
    );
  }

  return uniqueCandidates;
};

// Get random recommendation
export const getRandomBackupRecommendation = (type = 'all') => {
  const searchTypes = type === 'all' ? ['anime', 'manga', 'novel'] : [type];
  let allItems = [];

  searchTypes.forEach(searchType => {
    const categoryData = BackupRecommendations[searchType];
    if (categoryData) {
      Object.values(categoryData).forEach(genreItems => {
        allItems.push(...genreItems);
      });
    }
  });

  if (allItems.length === 0) return null;
  
  return allItems[Math.floor(Math.random() * allItems.length)];
};

// Get recommendations based on saved items
export const getBackupRecommendationsFromSaved = (savedItems) => {
  if (savedItems.length === 0) return [];

  // Analyze saved items
  const genreCounts = {};
  const typeCounts = { anime: 0, manga: 0, novel: 0 };

  savedItems.forEach(item => {
    item.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    typeCounts[item.type]++;
  });

  // Find most liked genres
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre);

  // Find preferred type
  const preferredType = Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0][0];

  // Get recommendations using preferred patterns
  return getBackupRecommendations({
    genres: topGenres,
    minRating: 75,
    type: preferredType
  });
};