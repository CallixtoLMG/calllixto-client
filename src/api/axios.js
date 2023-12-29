import axios from 'axios';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  timeout: 6000,
  headers: {
    authorization: `Bearer ${getToken()}`
  },
});

export default instance;