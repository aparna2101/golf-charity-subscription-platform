const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (options.body instanceof FormData) delete headers['Content-Type'];

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Auth
  signup(data: { email: string; password: string; first_name: string; last_name: string; phone?: string; charity_id?: number; charity_contribution_pct?: number }) {
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
  }
  verifyOtp(email: string, otp: string) {
    return this.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });
  }
  login(email: string, password: string) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }
  getProfile() { return this.request('/auth/profile'); }
  updateProfile(data: Record<string, any>) { return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  updatePassword(current_password: string, new_password: string) {
    return this.request('/auth/password', { method: 'PUT', body: JSON.stringify({ current_password, new_password }) });
  }

  // Scores
  getScores() { return this.request('/scores'); }
  addScore(score: number, play_date: string) { return this.request('/scores', { method: 'POST', body: JSON.stringify({ score, play_date }) }); }
  updateScore(id: number, data: { score?: number; play_date?: string }) { return this.request(`/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteScore(id: number) { return this.request(`/scores/${id}`, { method: 'DELETE' }); }

  // Charities
  getCharities(params?: { search?: string; category?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.featured) query.set('featured', 'true');
    return this.request(`/charities?${query}`);
  }
  getCharity(id: string) { return this.request(`/charities/${id}`); }

  // Draws
  getDraws() { return this.request('/draws'); }
  getMyDrawResults() { return this.request('/draws/my-results'); }
  getNextDraw() { return this.request('/draws/next'); }
  createDraw(data: { draw_date: string; prize_pool?: number }) { return this.request('/draws', { method: 'POST', body: JSON.stringify(data) }); }
  simulateDraw(id: number) { return this.request(`/draws/${id}/simulate`, { method: 'POST' }); }
  publishDraw(id: number) { return this.request(`/draws/${id}/publish`, { method: 'POST' }); }

  // Subscriptions (Razorpay)
  getSubscription() { return this.request('/subscriptions'); }
  createSubscriptionOrder(plan: 'Monthly' | 'Yearly') {
    return this.request('/subscriptions/create-order', { method: 'POST', body: JSON.stringify({ plan }) });
  }
  verifyPayment(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; plan: string }) {
    return this.request('/subscriptions/verify-payment', { method: 'POST', body: JSON.stringify(data) });
  }
  cancelSubscription() { return this.request('/subscriptions/cancel', { method: 'POST' }); }

  // Payments
  getPayments() { return this.request('/payments'); }

  // Winners
  getWinners() { return this.request('/winners'); }
  getMyWinnings() { return this.request('/winners/my'); }

  // Reports
  getAdminStats() { return this.request('/reports/admin'); }
  getUserDashboard() { return this.request('/reports/dashboard'); }
  getDrawStats() { return this.request('/admin/draw-stats'); }

  // Admin: Users
  getUsers() { return this.request('/users'); }
  adminUpdateUser(id: number, data: Record<string, any>) { return this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  adminDeleteUser(id: number) { return this.request(`/admin/users/${id}`, { method: 'DELETE' }); }

  // Admin: Scores
  getAdminScores(_userId?: number) { return this.request('/admin/scores'); }
  adminUpdateScore(id: number, data: { score?: number; play_date?: string }) { return this.request(`/admin/scores/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  adminDeleteScore(id: number) { return this.request(`/admin/scores/${id}`, { method: 'DELETE' }); }

  // Admin: Charities
  adminAddCharity(data: { name: string; description?: string; category?: string; location?: string }) {
    return this.request('/admin/charities', { method: 'POST', body: JSON.stringify(data) });
  }
  adminUpdateCharity(id: number, data: Record<string, any>) { return this.request(`/admin/charities/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  adminDeleteCharity(id: number) { return this.request(`/admin/charities/${id}`, { method: 'DELETE' }); }

  // Admin: Winners
  adminUpdateWinner(id: number, status: string) { return this.request(`/admin/winners/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); }
}

export const api = new ApiClient();

