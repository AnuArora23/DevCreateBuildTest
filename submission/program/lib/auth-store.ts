// Authentication store for NGO users
export interface NGOUser {
  id: string
  email: string
  password: string // In production, this would be hashed
  organizationName: string
  role: "admin" | "coordinator" | "volunteer"
  createdAt: string
}

export interface AuthSession {
  userId: string
  email: string
  organizationName: string
  role: string
  loginTime: string
}

class AuthStore {
  private USERS_KEY = "relief_connect_ngo_users"
  private SESSION_KEY = "relief_connect_session"

  // Get predefined NGO users (for demo purposes)
  private getDefaultUsers(): NGOUser[] {
    return [
      {
        id: "user_1",
        email: "admin@redcrescent.org",
        password: "admin123", // In production, use proper hashing
        organizationName: "Pakistan Red Crescent Society",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_2",
        email: "coordinator@edhi.org",
        password: "edhi123",
        organizationName: "Edhi Foundation",
        role: "coordinator",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_3",
        email: "relief@alkhidmat.org",
        password: "alkhidmat123",
        organizationName: "Al-Khidmat Foundation",
        role: "coordinator",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_4",
        email: "admin@jdc.org",
        password: "jdc123",
        organizationName: "JDC Foundation",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_5",
        email: "volunteer@chhipa.org",
        password: "chhipa123",
        organizationName: "Chhipa Welfare Association",
        role: "volunteer",
        createdAt: new Date().toISOString(),
      },
    ]
  }

  // Initialize users in localStorage
  private initializeUsers(): void {
    if (typeof window === "undefined") return
    const existing = localStorage.getItem(this.USERS_KEY)
    if (!existing) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.getDefaultUsers()))
    }
  }

  // Get all users
  getUsers(): NGOUser[] {
    if (typeof window === "undefined") return []
    this.initializeUsers()
    const data = localStorage.getItem(this.USERS_KEY)
    return data ? JSON.parse(data) : this.getDefaultUsers()
  }

  // Login
  login(email: string, password: string): { success: boolean; message: string; session?: AuthSession } {
    const users = this.getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    if (user.password !== password) {
      return { success: false, message: "Invalid email or password" }
    }

    // Create session
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      organizationName: user.organizationName,
      role: user.role,
      loginTime: new Date().toISOString(),
    }

    this.saveSession(session)

    return {
      success: true,
      message: "Login successful",
      session,
    }
  }

  // Save session
  private saveSession(session: AuthSession): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
  }

  // Get current session
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(this.SESSION_KEY)
    return data ? JSON.parse(data) : null
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getSession() !== null
  }

  // Logout
  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.SESSION_KEY)
  }

  // Add new user (for admin functionality)
  addUser(user: Omit<NGOUser, "id" | "createdAt">): NGOUser {
    const users = this.getUsers()
    const newUser: NGOUser = {
      ...user,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    }
    return newUser
  }

  // Update user
  updateUser(id: string, updates: Partial<NGOUser>): void {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      if (typeof window !== "undefined") {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
      }
    }
  }

  // Delete user
  deleteUser(id: string): void {
    const users = this.getUsers()
    const filtered = users.filter((u) => u.id !== id)
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(filtered))
    }
  }
}

export const authStore = new AuthStore()
