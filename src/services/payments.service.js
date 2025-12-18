import { api } from './api';

export const PaymentsService = {
  create: (payload) => api.post('/payments', payload).then(r => r.data),
  listByOrder: (orderId) => api.get(`/payments/order/${orderId}`).then(r => r.data)
};
