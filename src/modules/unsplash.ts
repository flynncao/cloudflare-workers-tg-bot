const UNSPLASH_API_BASE = 'https://api.unsplash.com'
let accessKey = ''

export function initUnsplash(key: string): void {
  accessKey = key
}

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

async function fetchUnsplash<T>(endpoint: string, params?: Record<string, any>): Promise<{
  data: T | null
  errors?: string[]
}> {
  try {
    const url = new URL(`${UNSPLASH_API_BASE}${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { errors?: string[] }
      return {
        data: null,
        errors: [errorData?.errors?.[0] || `HTTP ${response.status}: ${response.statusText}`],
      }
    }

    const data = (await response.json()) as T
    return { data }
  }
  catch (error: any) {
    console.error('Unsplash API error:', error.message)
    return {
      data: null,
      errors: [error.message || 'Unknown error'],
    }
  }
}

export const photos = {
  getRandom: async (params: getRandomParams = {}): Promise<{
    response: UnsplashPhoto | UnsplashPhoto[]
    errors?: string[]
  }> => {
    const result = await fetchUnsplash<UnsplashPhoto | UnsplashPhoto[]>('/photos/random', {
      query: params.query || 'tokyo night',
      orientation: params.orientation || 'landscape',
      collections: params.collections,
      topics: params.topics,
      username: params.username,
      content_filter: params.content_filter || 'low',
      count: params.count,
    })

    if (result.errors) {
      return {
        response: [] as UnsplashPhoto[],
        errors: result.errors,
      }
    }

    return {
      response: result.data as UnsplashPhoto | UnsplashPhoto[],
    }
  },
}

export default {
  photos,
}
