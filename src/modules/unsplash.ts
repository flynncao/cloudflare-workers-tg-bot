import axios from 'axios'
import 'dotenv/config'

const UNSPLASH_API_BASE = 'https://api.unsplash.com'
const accessKey = process.env.UNSPLASH_ACCESS_KEY || ''

interface UnsplashPhoto {
  id: string
  created_at: string
  updated_at: string
  width: number
  height: number
  color: string
  blur_hash: string
  description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    id: string
    username: string
    name: string
    portfolio_url: string | null
    bio: string | null
    location: string | null
    links: {
      self: string
      html: string
      photos: string
      portfolio: string
    }
    profile_image: {
      small: string
      medium: string
      large: string
    }
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
}

interface getRandomParams {
  query?: string
  orientation?: 'landscape' | 'portrait' | 'squarish'
  collections?: string
  topics?: string
  username?: string
  content_filter?: 'low' | 'high'
  count?: number
}

const unsplashApi = axios.create({
  baseURL: UNSPLASH_API_BASE,
  headers: {
    'Authorization': `Client-ID ${accessKey}`,
    'Accept-Version': 'v1',
  },
})

export const photos = {
  getRandom: async (params: getRandomParams = {}): Promise<{
    response: UnsplashPhoto | UnsplashPhoto[]
    errors?: string[]
  }> => {
    try {
      const response = await unsplashApi.get<UnsplashPhoto | UnsplashPhoto[]>('/photos/random', {
        params: {
          query: params.query || 'tokyo night',
          orientation: params.orientation || 'landscape',
          collections: params.collections,
          topics: params.topics,
          username: params.username,
          content_filter: params.content_filter || 'low',
          count: params.count,
        },
      })

      return {
        response: response.data,
      }
    }
    catch (error: any) {
      console.error('Unsplash API error:', error.response?.data || error.message)
      return {
        response: [] as UnsplashPhoto[],
        errors: [error.response?.data?.errors?.[0] || error.message || 'Unknown error'],
      }
    }
  },
}

export default {
  photos,
}
