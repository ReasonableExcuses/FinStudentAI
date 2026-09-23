import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finstudent_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if trying to login or seeding demo
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/demo/seed')) {
        localStorage.removeItem('finstudent_token');
        localStorage.removeItem('finstudent_user');
      }
    }
    return Promise.reject(error);
  }
);

// Endpoints
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const transactionsApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getOne: (id: number) => api.get(`/transactions/${id}`),
  create: (data: any) => api.post('/transactions', data),
  update: (id: number, data: any) => api.patch(`/transactions/${id}`, data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
  classify: (data: { description: string; amount?: number }) => api.post('/transactions/classify', data),
};

export const budgetsApi = {
  getAll: (month?: string) => api.get('/budgets', { params: { month } }),
  createOrUpdate: (data: any) => api.post('/budgets', data),
  update: (id: number, data: any) => api.patch(`/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
};

export const analyticsApi = {
  getSummary: (month?: string) => api.get('/analytics/summary', { params: { month } }),
  getMonthComparison: (currentMonth?: string, prevMonth?: string) =>
    api.get('/analytics/month-comparison', { params: { current_month: currentMonth, previous_month: prevMonth } }),
  getWhySpendingMore: (currentMonth?: string, prevMonth?: string) =>
    api.get('/analytics/why-spending-more', { params: { current_month: currentMonth, previous_month: prevMonth } }),
};

export const anomaliesApi = {
  getAll: () => api.get('/anomalies'),
};

export const recurringApi = {
  getAll: () => api.get('/recurring'),
};

export const forecastApi = {
  getForecast: () => api.get('/forecast'),
};

export const insightsApi = {
  getAll: () => api.get('/insights'),
};

export const qaApi = {
  ask: (question: string) => api.post('/qa', { question }),
};

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: any) => api.patch('/profile', data),
};

export const csvApi = {
  preview: (formData: FormData) => api.post('/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  confirm: (transactions: any[]) => api.post('/import/confirm', { transactions }),
};

export const demoApi = {
  seed: () => api.post('/demo/seed'),
};

export const evaluationApi = {
  getMetrics: () => api.get('/evaluation'),
};
