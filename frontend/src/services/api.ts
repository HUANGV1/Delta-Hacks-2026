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
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Try to parse JSON, but handle cases where response might not be JSON
      let data: any;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      try {
        const text = await response.text();
        if (text) {
          data = isJson ? JSON.parse(text) : { message: text };
        } else {
          data = {};
        }
      } catch (parseError) {
        // If JSON parsing fails, create a meaningful error
        data = {
          message: `Server returned invalid response (${response.status} ${response.statusText})`,
        };
      }

      if (!response.ok) {
        // Provide more specific error messages
        let errorMessage = data.message || 'Request failed';
        
        // Handle specific status codes
        if (response.status === 400) {
          errorMessage = data.message || 'Invalid request. Please check your input.';
          if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((e: any) => e.msg || e.message || e).join(', ');
          }
        } else if (response.status === 401) {
          errorMessage = data.message || 'Authentication failed. Please check your credentials.';
        } else if (response.status === 403) {
          errorMessage = data.message || 'Access denied.';
        } else if (response.status === 404) {
          errorMessage = data.message || 'Resource not found.';
        } else if (response.status === 409) {
          errorMessage = data.message || 'Conflict. This resource already exists.';
        } else if (response.status >= 500) {
          errorMessage = data.message || 'Server error. Please try again later.';
        }

        return {
          success: false,
          message: errorMessage,
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      // Handle network errors and other fetch failures
      let errorMessage = 'Network error';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('API request error:', error);
      return {
        success: false,
        message: errorMessage,
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

