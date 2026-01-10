// API service for communicating with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    const response = await this.request<{ token: string; user: any; gameState: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Game state endpoints
  async getGameState() {
    return this.request<{ gameState: any }>('/gamestate');
  }

  async initializeGame(petName: string, petType: string) {
    return this.request('/gamestate/initialize', {
      method: 'POST',
      body: JSON.stringify({ petName, petType }),
    });
  }

  async addSteps(steps: number) {
    return this.request('/gamestate/steps', {
      method: 'POST',
      body: JSON.stringify({ steps }),
    });
  }

  async claimCoins() {
    return this.request('/gamestate/claim-coins', {
      method: 'POST',
    });
  }

  async petCare(action: 'feed' | 'play' | 'heal' | 'boost') {
    return this.request('/gamestate/care', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async hatchEgg() {
    return this.request('/gamestate/hatch', {
      method: 'POST',
    });
  }

  async updateEnvironment(environment: string) {
    return this.request('/gamestate/environment', {
      method: 'PUT',
      body: JSON.stringify({ environment }),
    });
  }

  async updateSettings(settings: any) {
    return this.request('/gamestate/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Challenge endpoints
  async getChallenges() {
    return this.request('/challenges');
  }

  async claimChallenge(challengeId: string) {
    return this.request(`/challenges/${challengeId}/claim`, {
      method: 'POST',
    });
  }

  // Achievement endpoints
  async getAchievements() {
    return this.request('/achievements');
  }
}

export const apiService = new ApiService();
export default apiService;

