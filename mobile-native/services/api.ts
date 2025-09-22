import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV, getApiUrl } from '../config/env';

class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders();
    const url = getApiUrl(endpoint);
    
    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear storage
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          throw new Error('Authentication failed');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`API Response: ${endpoint}`, data);
        return data;
      }
      return response.text();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth methods
  async login(userName: string, password: string) {
    return this.request('/api/Account/Login', {
      method: 'POST',
      body: JSON.stringify({ userName, password }),
    });
  }

  async register(email: string, userName: string, password: string) {
    return this.request('/api/Account/Register', {
      method: 'POST',
      body: JSON.stringify({ email, userName, password }),
    });
  }

  async googleAuth(idToken: string) {
    return this.request('/api/Account/GoogleAuth', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async logout() {
    return this.request('/api/Account/Logout', { method: 'POST' });
  }

  async getUserClaims() {
    return this.request('/api/Account/UserClaims');
  }

  async changePassword(oldPassword: string, newPassword: string, repeatPassword: string) {
    return this.request('/api/Account/ChangePassword', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword, repeatPassword }),
    });
  }

  // Games methods
  async getGames(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    return this.request(`/api/Games${queryString ? `?${queryString}` : ''}`);
  }

  async getGame(id: string) {
    return this.request(`/api/Games/${id}`);
  }

  async getBestRatedGames() {
    return this.request('/api/Games/bestrated');
  }

  async getBestSellers() {
    return this.request('/api/Games/bestsellers');
  }

  async getGameOverview(gameId: string) {
    return this.request(`/api/Games/${gameId}/overview`);
  }

  // Reviews
  async getGameReviews(gameId: string) {
    return this.request(`/api/Reviews/product/${gameId}`);
  }

  async addReview(gameId: string, rating: number, considerations: string) {
    return this.request('/api/Reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: gameId,
        rating: rating,
        considerations: considerations,
      }),
    });
  }

  // Filter data methods
  async getGenres() {
    return this.request('/api/Genres');
  }

  async getPlatforms() {
    return this.request('/api/Platforms');
  }

  async getCompanies() {
    return this.request('/api/Companies');
  }

  // Cart methods
  async getCart() {
    return this.request('/api/Cart');
  }

  async addToCart(gameId: string, quantity: number) {
    return this.request('/api/Cart/add', {
      method: 'POST',
      body: JSON.stringify({ gameId, quantity }),
    });
  }

  async updateCart(gameId: string, quantity: number) {
    return this.request('/api/Cart/update', {
      method: 'PUT',
      body: JSON.stringify({ gameId, quantity }),
    });
  }

  async removeFromCart(gameId: string) {
    return this.request(`/api/Cart/remove/${gameId}`, { method: 'DELETE' });
  }

  // Favorites methods
  async getFavorites() {
    return this.request('/api/Favorites');
  }

  async addToFavorites(gameId: string) {
    return this.request('/api/Favorites', {
      method: 'POST',
      body: JSON.stringify(gameId),
    });
  }

  async removeFromFavorites(gameId: string) {
    return this.request(`/api/Favorites/${gameId}`, { method: 'DELETE' });
  }

  // Orders methods
  async getMyOrders(page = 1, pageSize = 10) {
    return this.request(`/api/Orders/my?page=${page}&pageSize=${pageSize}`);
  }

  async createOrder(paymentMethodId: string, address: string) {
    return this.request('/api/Orders', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId, address }),
    });
  }

  async cancelOrder(id: string) {
    return this.request(`/api/Orders/${id}`, { method: 'DELETE' });
  }

  // Payment methods
  async getPaymentMethods() {
    return this.request('/api/Account/PaymentMethods');
  }

  async addPaymentMethod(data: any) {
    return this.request('/api/Account/PaymentMethod', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.request(`/api/Account/PaymentMethod/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/api/Account/PaymentMethodDelete/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();