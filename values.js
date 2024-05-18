const isDevelopment = process.env.NODE_ENV === 'development';

const values = {
  serverURL: isDevelopment
    ? 'http://localhost:8081'
    : 'https://your-production-server-url.com/api',
};

export default values;