import { api } from './api';

export const ItemsService = {
  list: () => api.get('/items').then(r => r.data),
  create: (payload) => api.post('/items', payload).then(r => r.data),
  bulkCreate: (payloadArray) => api.post('/items/bulk', payloadArray).then(r => r.data),
  update: (id, payload) => api.put(`/items/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/items/${id}`).then(r => r.data)
};
