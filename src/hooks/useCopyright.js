import { useState, useEffect } from 'react';
import apiClient from '../api/client';

export const useCopyright = () => {
  const [copyright, setCopyright] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/copyright')
      .then(res => setCopyright(res.data.data))
      .catch(() => setCopyright(null))
      .finally(() => setLoading(false));
  }, []);

  const getYear = () => {
    if (copyright?.year) return copyright.year;
    return new Date().getFullYear();
  };

  const getText = () => {
    if (!copyright) return `All Rights Copyright © ${new Date().getFullYear()} Reserved By Kilkari Care Foundation`;
    const text = copyright.text || '';
    return text.replace('{year}', getYear()).replace('{company}', copyright.companyName || '');
  };

  return { copyright, loading, getText, getYear };
};
