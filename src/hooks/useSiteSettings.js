import { useState, useEffect } from 'react';
import api from '../api/client';

let cachedSettings = null;

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(cachedSettings || {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    const fetchSettings = async () => {
      try {
        const res = await api.get('/site-settings');
        cachedSettings = res.data.data || {};
        setSettings(cachedSettings);
      } catch {
        setSettings({});
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, loading, refresh: () => { cachedSettings = null; window.location.reload(); } };
};
