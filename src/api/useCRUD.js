import { useState, useEffect, useCallback } from 'react';
import api from './client';

/**
 * useCRUD - Generic CRUD hook
 *
 * @param {string} endpoint   - API endpoint e.g. 'blogs', 'events'
 * @param {boolean} useSlug   - If true, update/delete use item.slug instead of item._id
 *                              Required for: blogs, events, causes, projects, stories
 */
const useCRUD = (endpoint, useSlug = false) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);

  // ── Fetch with optional pagination + search ──────────────────────────────
  const fetchAll = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (opts.page)     params.set('page',     opts.page);
      if (opts.limit)    params.set('limit',    opts.limit);
      if (opts.search)   params.set('search',   opts.search);
      if (opts.category) params.set('category', opts.category);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res   = await api.get(`/${endpoint}${query}`);

      const rawData = res.data.data;
      setData(Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []));
      setTotal(res.data.total  ?? 0);
      setPage(res.data.page    ?? 1);
      setPages(res.data.pages  ?? 1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // ── Create ────────────────────────────────────────────────────────────────
  const create = async (body) => {
    try {
      const res = await api.post(`/${endpoint}`, body);
      await fetchAll();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Create failed';
      throw new Error(msg);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  // For slug-based routes the identifier is item.slug (passed as `id` arg)
  // For id-based routes the identifier is item._id
  const update = async (id, body) => {
    try {
      const res = await api.put(`/${endpoint}/${id}`, body);
      await fetchAll();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed';
      throw new Error(msg);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const remove = async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      await fetchAll();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Delete failed';
      throw new Error(msg);
    }
  };

  // ── Helper: resolve the correct identifier for a record ──────────────────
  // Pages call: update(getIdentifier(item), body)  /  remove(getIdentifier(item))
  const getIdentifier = (item) => {
    if (useSlug) return item.slug;
    return item._id;
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    data, loading, error, setError,
    total, page, pages,
    fetchAll,
    create, update, remove,
    getIdentifier,
    useSlug,
  };
};

export default useCRUD;
