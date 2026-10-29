const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('bit_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: (credentials) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }).then(handleResponse),

    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      }).then(handleResponse),

    updateProfile: (profileData) =>
      fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      }).then(handleResponse),
  },

  // Products
  products: {
    getProducts: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      return fetch(`${API_BASE}/products?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getProductById: (id) =>
      fetch(`${API_BASE}/products/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    createProduct: (productData) =>
      fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      }).then(handleResponse),

    updateProduct: (id, productData) =>
      fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      }).then(handleResponse),

    deleteProduct: (id) =>
      fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),

    getCategories: () =>
      fetch(`${API_BASE}/products/meta/categories`).then(handleResponse),
  },

  // Orders
  orders: {
    createOrder: (orderData) =>
      fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      }).then(handleResponse),

    getMyOrders: () =>
      fetch(`${API_BASE}/orders/my-orders`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getAllOrders: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      return fetch(`${API_BASE}/orders?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getOrderById: (id) =>
      fetch(`${API_BASE}/orders/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    updateOrderStatus: (id, updateData) =>
      fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      }).then(handleResponse),

    updatePayment: (id, paymentData) =>
      fetch(`${API_BASE}/orders/${id}/payment`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(paymentData),
      }).then(handleResponse),

    cancelMyOrder: (id) =>
      fetch(`${API_BASE}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Inventory
  inventory: {
    getInventoryOverview: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      return fetch(`${API_BASE}/inventory/overview?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    quickRestock: (restockData) =>
      fetch(`${API_BASE}/inventory/restock`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(restockData),
      }).then(handleResponse),

    updateThreshold: (productId, thresholdData) =>
      fetch(`${API_BASE}/inventory/${productId}/threshold`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(thresholdData),
      }).then(handleResponse),

    getInventoryLogs: (params = {}) => {
      const query = new URLSearchParams(params);
      return fetch(`${API_BASE}/inventory/logs?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },
  },

  // Users (Admin)
  users: {
    getAllUsers: (params = {}) => {
      const query = new URLSearchParams(params);
      return fetch(`${API_BASE}/users?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    createUser: (userData) =>
      fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse),

    updateUser: (id, userData) =>
      fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).then(handleResponse),

    deleteUser: (id) =>
      fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Notifications
  notifications: {
    getMyNotifications: () =>
      fetch(`${API_BASE}/notifications`, {
        headers: getHeaders(),
      }).then(handleResponse),

    markAsRead: (id) =>
      fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    markAllAsRead: () =>
      fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    broadcast: (broadcastData) =>
      fetch(`${API_BASE}/notifications/broadcast`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(broadcastData),
      }).then(handleResponse),
  },

  // Analytics
  analytics: {
    getDashboardStats: () =>
      fetch(`${API_BASE}/analytics/dashboard`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },

  // Xerox & Photocopy Pre-Ordering
  xerox: {
    getSettings: () =>
      fetch(`${API_BASE}/xerox/settings`).then(handleResponse),

    updateSettings: (settingsData) =>
      fetch(`${API_BASE}/xerox/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settingsData),
      }).then(handleResponse),

    previewPdf: (formData) => {
      const token = localStorage.getItem('bit_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(`${API_BASE}/xerox/preview-pdf`, {
        method: 'POST',
        headers,
        body: formData,
      }).then(handleResponse);
    },

    createOrder: (formData) => {
      const token = localStorage.getItem('bit_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(`${API_BASE}/xerox`, {
        method: 'POST',
        headers,
        body: formData,
      }).then(handleResponse);
    },

    getMyOrders: () =>
      fetch(`${API_BASE}/xerox/my-orders`, {
        headers: getHeaders(),
      }).then(handleResponse),

    getAllOrders: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      return fetch(`${API_BASE}/xerox?${query.toString()}`, {
        headers: getHeaders(),
      }).then(handleResponse);
    },

    getOrderById: (id) =>
      fetch(`${API_BASE}/xerox/${id}`, {
        headers: getHeaders(),
      }).then(handleResponse),

    updateStatus: (id, statusData) =>
      fetch(`${API_BASE}/xerox/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(statusData),
      }).then(handleResponse),

    updatePayment: (id, paymentData) =>
      fetch(`${API_BASE}/xerox/${id}/payment`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(paymentData),
      }).then(handleResponse),

    cancelOrder: (id) =>
      fetch(`${API_BASE}/xerox/${id}/cancel`, {
        method: 'PUT',
        headers: getHeaders(),
      }).then(handleResponse),

    downloadDocument: async (id, fileName) => {
      const token = localStorage.getItem('bit_token');
      const res = await fetch(`${API_BASE}/xerox/document/${id}?download=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download document');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },

    viewDocumentBlobUrl: async (id) => {
      const token = localStorage.getItem('bit_token');
      const res = await fetch(`${API_BASE}/xerox/document/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load document');
      const blob = await res.blob();
      return window.URL.createObjectURL(blob);
    },
  },
};
