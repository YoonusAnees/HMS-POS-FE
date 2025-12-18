import { api } from './api';

export const AuthService = {
  login: (payload) => api.post('/auth/login', payload).then(r => r.data),
  register: (payload) => api.post('/auth/register', payload).then(r => r.data),
  listUsers: () => api.get('/users').then(r => r.data)
};
