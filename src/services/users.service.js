import { api } from './api';

export const UsersService = {
  list: () => api.get('/users').then(r => r.data),
  create: (payload) => api.post('/auth/register', payload).then(r => r.data)
};
