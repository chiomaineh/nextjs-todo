import axios from 'axios';

const axiosApiInstance = axios.create({
  baseURL: 'https://dummyjson.com',
//  baseURL:  'http://localhost:3001',
  timeout: 10000,
});

export default axiosApiInstance;