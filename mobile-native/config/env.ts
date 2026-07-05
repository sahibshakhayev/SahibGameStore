import Constants from 'expo-constants';

interface EnvConfig {
  API_BASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  APP_NAME: string;
  APP_SCHEME: string;
}

const getEnvConfig = (): EnvConfig => {
  // Get from Expo Constants (which reads from .env file)
  const config = {
    API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 
                  process.env.EXPO_PUBLIC_API_BASE_URL || 
                  'http://localhost:5159',
    
    GOOGLE_CLIENT_ID: Constants.expoConfig?.extra?.googleClientId || 
                      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
                      '352048252352-gl90lisdndu1h3abad3rcameak58gqt7.apps.googleusercontent.com',
    
    APP_NAME: Constants.expoConfig?.extra?.appName || 
              process.env.EXPO_PUBLIC_APP_NAME || 
              'Sahib Game Store',
    
    APP_SCHEME: Constants.expoConfig?.extra?.appScheme || 
                process.env.EXPO_PUBLIC_APP_SCHEME || 
                'sahib-game-store',
  };

  // Validate required environment variables
  if (!config.API_BASE_URL) {
    throw new Error('API_BASE_URL is required but not defined in environment variables');
  }

  if (!config.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is required but not defined in environment variables');
  }

  return config;
};

export const ENV = getEnvConfig();

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = ENV.API_BASE_URL.endsWith('/') 
    ? ENV.API_BASE_URL.slice(0, -1) 
    : ENV.API_BASE_URL;
  console.log("API URL:", `${ENV.API_BASE_URL}/api/Account/Login`);
    
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return 'https://via.placeholder.com/150';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  const baseUrl = ENV.API_BASE_URL.endsWith('/') 
    ? ENV.API_BASE_URL.slice(0, -1) 
    : ENV.API_BASE_URL;
  
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${cleanPath}`;
};