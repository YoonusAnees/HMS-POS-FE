import { api } from './api';

export const TablesService = {
  list: () => api.get('/tables').then(r => r.data),
  create: (payload) => api.post('/tables', payload).then(r => r.data),
  bulkCreate: (payloadArray) => api.post('/tables/bulk', payloadArray).then(r => r.data),
  update: (id, payload) => api.put(`/tables/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/tables/${id}`).then(r => r.data)
};
