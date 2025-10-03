// AniList GraphQL API service
const ANILIST_API_URL = 'https://graphql.anilist.co';

// GraphQL queries
const TRENDING_QUERY = `
  query ($type: MediaType, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: $type, sort: TRENDING_DESC, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        averageScore
        meanScore
        genres
        status
        episodes
        chapters
        volumes
        format
        description
        startDate {
          year
          month
          day
        }
        studios {
          nodes {
            name
          }
        }
        staff {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(search: $search, type: $type, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        averageScore
        meanScore
        genres
        status
        episodes
        chapters
        volumes
        format
        description
        startDate {
          year
          month
          day
        }
        studios {
          nodes {
            name
          }
        }
        staff {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

const MEDIA_DETAIL_QUERY = `
  query ($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      averageScore
      meanScore
      popularity
      favourites
      genres
      tags {
        name
        description
        rank
      }
      status
      episodes
      chapters
      volumes
      format
      duration
      source
      season
      seasonYear
      description
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      studios {
        nodes {
          name
          isAnimationStudio
        }
      }
      staff {
        edges {
          role
          node {
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      characters {
        edges {
          role
          node {
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              english
              romaji
            }
            coverImage {
              medium
            }
            type
            format
          }
        }
      }
      recommendations {
        nodes {
          rating
          mediaRecommendation {
            id
            title {
              english
              romaji
            }
            coverImage {
              medium
            }
            type
            format
            averageScore
          }
        }
      }
      externalLinks {
        url
        site
        type
        language
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }
    }
  }
`;

// API service class
class AniListService {
  static async makeRequest(query, variables = {}, retries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(ANILIST_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        return data.data;
      } catch (error) {
        lastError = error;
        console.warn(`AniList API attempt ${attempt}/${retries} failed:`, error.message);
        
        // If it's the last attempt, throw the error
        if (attempt === retries) {
          console.error('AniList API Error after all retries:', error);
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }

  static async getTrending(type = 'ANIME', page = 1, perPage = 24) {
    // Convert our internal types to AniList API types
    const apiType = type === 'NOVEL' ? 'MANGA' : type.toUpperCase();
    
    const variables = {
      type: apiType,
      page,
      perPage
    };

    const data = await this.makeRequest(TRENDING_QUERY, variables);
    
    // If we requested novels, filter to only show novel format items
    if (type === 'NOVEL') {
      data.Page.media = data.Page.media.filter(media => media.format === 'NOVEL');
    }
    
    return data.Page;
  }

  static async search(searchTerm, type = 'ANIME', page = 1, perPage = 24) {
    // Convert our internal types to AniList API types
    const apiType = type === 'NOVEL' ? 'MANGA' : type.toUpperCase();
    
    const variables = {
      search: searchTerm,
      type: apiType,
      page,
      perPage
    };

    const data = await this.makeRequest(SEARCH_QUERY, variables);
    
    // If we requested novels, filter to only show novel format items
    if (type === 'NOVEL') {
      data.Page.media = data.Page.media.filter(media => media.format === 'NOVEL');
    }
    
    return data.Page;
  }

  static async getMediaDetail(id, type = 'ANIME') {
    // Convert our internal types to AniList API types
    const apiType = type === 'novel' ? 'MANGA' : type.toUpperCase();
    
    const variables = {
      id: parseInt(id),
      type: apiType
    };

    const data = await this.makeRequest(MEDIA_DETAIL_QUERY, variables);
    return data.Media;
  }

  static formatMediaItem(media) {
    return {
      id: media.id,
      title: media.title.english || media.title.romaji || media.title.native,
      nativeTitle: media.title.native,
      cover: media.coverImage.large || media.coverImage.medium,
      banner: media.bannerImage,
      score: media.averageScore || media.meanScore,
      genres: media.genres || [],
      status: media.status,
      episodes: media.episodes,
      chapters: media.chapters,
      volumes: media.volumes,
      format: media.format,
      description: media.description,
      year: media.startDate?.year,
      studios: media.studios?.nodes?.map(studio => studio.name) || [],
      staff: media.staff?.edges?.map(edge => ({
        role: edge.role,
        name: edge.node.name.full
      })) || [],
      color: media.coverImage.color
    };
  }
}

export default AniListService;