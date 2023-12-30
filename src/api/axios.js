import axios from 'axios';
import { useEffect, useState } from 'react';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL,
  timeout: 6000,
  headers: {
    authorization: `Bearer ${getToken()}`
  },
});

export const useAxios = ({ url, method, body = null }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      instance[method](url, body)
        .then((res) => {
          setResponse(res.data);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchData();
  }, [method, url, body]);

  return { response, error, isLoading };
};

export const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
}
