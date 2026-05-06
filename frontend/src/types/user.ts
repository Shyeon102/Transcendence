export interface User {
  id: number
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  bio?: string
  favoriteGenres?: number[]
  favoriteCountries?: string[]
  isStaff?: boolean
}