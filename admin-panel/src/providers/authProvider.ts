import { AuthProvider } from 'react-admin';

const AUTH_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5159/api/Account';

export const authProvider: AuthProvider = {
    login: ({ username, password }) =>  {
        const request = new Request(`${AUTH_API_URL}/Login`, {
            method: 'POST',
            body: JSON.stringify({ userName: username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(auth => {
                // The OpenAPI spec doesn't define the login response body.
                // We assume it returns an object with an `accessToken`.
                // If your API returns something different (e.g., 'token'), change it here.
                if (!auth.accessToken) {
                    throw new Error('Login failed: token not found in response');
                }
                localStorage.setItem('token', auth.accessToken);
            });
    },
    logout: () => {
        localStorage.removeItem('token');
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            return Promise.reject(); // This will redirect the user to the login page.
        }
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    },
    getPermissions: () => {
        // For role-based access control, you would decode the JWT here to get user roles.
        // const token = localStorage.getItem('token');
        // if (token) {
        //     const decoded = jwt_decode(token);
        //     return Promise.resolve(decoded.roles);
        // }
        return Promise.resolve('guest'); // Default permission
    },
};