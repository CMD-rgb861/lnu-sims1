import axios from 'axios';
import { toast } from 'react-toastify';

const axiosClient = axios.create({
  baseURL: "http://lnu-sims.test",
  withCredentials: true,
  withXSRFToken: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        'X-Requested-With': 'XMLHttpRequest',
    },
});

axiosClient.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && data.type) {
      if (data.type === 'success' && data.message) {
        toast.success(data.message);
      } 
      // This handles your "200 OK" errors (e.g., login failure)
      else if (data.type === 'error' && data.message) {
        toast.error(data.message);
        
        // CRITICAL: We must reject the promise so that the
        // .catch() block or Redux thunk's 'rejected' case runs.
        return Promise.reject(new Error(data.message));
      }
    }
    
    // It then returns the full response so your .then() or thunks
    // (like loginUser.fulfilled) can get the response.data.user
    return response;
  },
  
  // This part handles your ERROR responses
  (error) => {
    if (!error.response) {
        toast.error('Network Error: Cannot reach the server.');
        return Promise.reject(error);
    }

    if (
      error.response.status === 401 &&
      error.config.url.includes('/api/user')
    ) {
      return Promise.reject(error);
    }

    // --- 2. THE FIX: SESSION EXPIRED (419) OR UNAUTHENTICATED (401) ---
    if (error.response.status === 419 || error.response.status === 401) {
        
        // Inform the user
        toast.error("Your session has expired. Please log in again.");

        // Clear the Redux state immediately
        store.dispatch(forceLogout());

        // Redirect back to login page
        window.location.href = '/login'; 
        
        return Promise.reject(error);
    }

    // --- 3. ALL OTHER ERRORS (Validation, Server Errors, etc.) ---
    let errorMessage = 'An unexpected error occurred.';

    if (error.response.status === 422) {
      const errors = error.response.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      errorMessage = errors[firstErrorKey][0];
    } else if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default axiosClient;