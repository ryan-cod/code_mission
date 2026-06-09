/**
 * Environment Configuration Loader
 * 
 * This module loads environment variables from .env file or process.env
 * Use this instead of hardcoding secrets in your code
 * 
 * Example Usage:
 * import config from './config/environment.js';
 * emailjs.init(config.emailjs.publicKey);
 */

const getEnvVariable = (key, defaultValue = null) => {
  // Check if running in browser (client-side)
  if (typeof window !== 'undefined') {
    // For browser, use import.meta.env (Vite) or process.env (CRA)
    const value = import.meta?.env?.[key] || process.env?.[key];
    if (!value && !defaultValue) {
      console.warn(`⚠️ Environment variable '${key}' is not set`);
    }
    return value || defaultValue;
  }
  
  // Check if running in Node.js (server-side)
  const value = process.env[key];
  if (!value && !defaultValue) {
    console.warn(`⚠️ Environment variable '${key}' is not set`);
  }
  return value || defaultValue;
};

// Export environment configuration
const config = {
  // EmailJS Configuration
  emailjs: {
    publicKey: getEnvVariable('VITE_EMAILJS_PUBLIC_KEY'),
    serviceId: getEnvVariable('VITE_EMAILJS_SERVICE_ID'),
    templates: {
      verify: getEnvVariable('VITE_EMAILJS_TEMPLATE_VERIFY_ID'),
      reset: getEnvVariable('VITE_EMAILJS_TEMPLATE_RESET_ID'),
    },
  },

  // OpenAI Configuration
  openai: {
    apiKey: getEnvVariable('VITE_OPENAI_API_KEY'),
  },

  // Application Configuration
  app: {
    env: getEnvVariable('VITE_APP_ENV', 'development'),
    url: getEnvVariable('VITE_APP_URL', 'http://localhost:5173'),
    sessionTimeout: parseInt(getEnvVariable('VITE_SESSION_TIMEOUT', '3600000')),
    tokenExpiryMinutes: parseInt(getEnvVariable('VITE_TOKEN_EXPIRY_MINUTES', '30')),
  },

  // Validation
  validateRequired: () => {
    const required = [
      'VITE_EMAILJS_PUBLIC_KEY',
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_VERIFY_ID',
      'VITE_EMAILJS_TEMPLATE_RESET_ID',
    ];

    const missing = required.filter(key => !getEnvVariable(key));
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      console.error('Please create a .env file with the required variables. See .env.example for template.');
      return false;
    }
    
    return true;
  },
};

export default config;
