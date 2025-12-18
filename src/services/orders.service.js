import { api } from './api';

export const OrdersService = {
  listOpen: () => api.get('/orders/open').then(r => r.data),
  getById: (id) => api.get(`/orders/${id}`).then(r => r.data),
  create: (payload) => api.post('/orders', payload).then(r => r.data),
  addItem: (id, payload) => api.post(`/orders/${id}/items`, payload).then(r => r.data)
};
