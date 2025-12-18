import { api } from './api';

export const RefundsService = {
  create: (payload) => api.post('/refunds', payload).then(r => r.data)
};
