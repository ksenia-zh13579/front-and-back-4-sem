import axios from "axios";

// создание API-клиента
const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

// создание константы api для доступа к маршрутам бэкенда
export const api = {
    createProduct: async (product) => {
        let response = await apiClient.post("/products", product);
        return response.data;
    },

    getProducts: async () => {
        let response = await apiClient.get("/products");
        return response.data;
    },

    getProductById: async (id) => {
        let response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    updateProduct: async (id, product) => {
        let response = await apiClient.patch(`/products/${id}`, product);
        return response.data;
    },

    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },

    getCurrentUser: async () => {
        let response = await apiClient.get("/auth/me");
        return response.data;
    },

    login: async (userData) => {
        let response = await apiClient.post("/auth/login", userData);
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        return response.data;
    },

    register: async (user) => {
        let response = await apiClient.post("/auth/register", user);
        return response.data;
    },

    refresh: async (refreshToken) => {
        let response = await apiClient.post("/auth/refresh", refreshToken);
        return response.data;
    },

    getUsers : async () => {
        let response = await apiClient.get("/users");
        return response.data;
    },

    getUserById: async (id) => {
        let response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id, user) => {
        let response = await apiClient.patch(`/users/${id}`, user);
        return response.data;
    },

    deleteUser: async (id) => {
        let response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },
}

apiClient.interceptors.request.use(
    (config) => {
        let accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');
        let originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            if (!accessToken || !refreshToken) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                return Promise.reject(error);
            }

            try {
                let response = await api.refresh(refreshToken);
                let isRefreshExpired = response.data.refresh_expired;

                if (isRefreshExpired) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    return Promise.reject(error);
                }

                let newAccessToken = response.data.accessToken;
                let newRefreshToken = response.data.refreshToken;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                return apiClient(originalRequest);
            }
            catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error)
    }
);