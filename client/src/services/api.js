const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

// Product APIs
export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProductById = (id) => request(`/products/${id}`);

export const createProduct = (data) =>
  request('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProduct = (id, data) =>
  request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  request(`/products/${id}`, {
    method: 'DELETE',
  });

export const getDashboardStats = () => request('/products/dashboard-stats');

// Stock Movement APIs
export const recordStockMovement = (data) =>
  request('/stock/movements', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getStockTransactions = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/stock/transactions${query ? `?${query}` : ''}`);
};

// Supplier APIs
export const getSuppliers = () => request('/suppliers');
export const createSupplier = (data) =>
  request('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateSupplier = (id, data) =>
  request(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
export const deleteSupplier = (id) =>
  request(`/suppliers/${id}`, {
    method: 'DELETE',
  });

// Category APIs
export const getCategories = () => request('/categories');
export const createCategory = (data) =>
  request('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Purchase Order APIs
export const getPurchaseOrders = () => request('/orders');
export const createPurchaseOrder = (data) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
export const deletePurchaseOrder = (id) =>
  request(`/orders/${id}`, {
    method: 'DELETE',
  });

// Reseed Demo Data API
export const reseedDemoData = () =>
  request('/seed', {
    method: 'POST',
  });
