// activitiesModel.js — Model do catálogo de atividades (MVC)

const ActivitiesModel = (() => {

  let _activities = [];

 async function loadActivities() {
  if (_activities.length > 0) return _activities;

  // 1.º — versão editada pelo admin (localStorage tem prioridade)
  try {
    const stored = localStorage.getItem('cp_admin_activities');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        _activities = parsed;
        return _activities;
      }
    }
  } catch (e) {
    console.warn('cp_admin_activities inválido, a usar JSON base:', e);
  }

  // 2.º — fallback ao ficheiro original
  try {
    const res = await fetch('../data/activities.json');
    _activities = await res.json();
  } catch (e) {
    console.warn('Erro ao carregar activities.json:', e);
    _activities = [];
  }

  return _activities;
}

  function getAll() { return _activities; }

  function getById(id) { return _activities.find(a => a.id === id) || null; }

  function getByCategory(cat) {
    if (!cat || cat === 'Todas') return _activities;
    return _activities.filter(a => a.category === cat);
  }

  function search(query) {
    const q = query.toLowerCase();
    return _activities.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }

  function getCategories() {
    const cats = [...new Set(_activities.map(a => a.category))];
    return ['Todas', ...cats];
  }

  // ── Favoritos ──────────────────────────────────────────────────────────────
  function _getUser() {
    return JSON.parse(localStorage.getItem('cp_current_user'));
  }

  function _saveUser(user) {
    localStorage.setItem('cp_current_user', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('cp_users')) || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx] = user; localStorage.setItem('cp_users', JSON.stringify(users)); }
  }

  function getFavoriteIds() {
    return _getUser()?.favorites || [];
  }

  function isFavorite(id) { return getFavoriteIds().includes(id); }

  function toggleFavorite(id) {
    const user = _getUser();
    if (!user) return false;
    user.favorites = user.favorites || [];
    const idx = user.favorites.indexOf(id);
    if (idx === -1) user.favorites.push(id);
    else user.favorites.splice(idx, 1);
    _saveUser(user);
    return user.favorites.includes(id);
  }

  function getFavorites() {
    const ids = getFavoriteIds();
    return _activities.filter(a => ids.includes(a.id));
  }

  function isCompleted(id) {
    const user = _getUser();
    return (user?.activityHistory || []).some(h => h.id === id);
  }

  return {
    loadActivities,
    getAll,
    getById,
    getByCategory,
    search,
    getCategories,
    isFavorite,
    toggleFavorite,
    getFavorites,
    isCompleted,
    getFavoriteIds,
  };
})();