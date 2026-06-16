// adminModel.js — Model da área de administração (MVC)

const AdminModel = (() => {

  const KEY_USERS    = 'cp_users';
  const KEY_CURRENT  = 'cp_current_user';
  const KEY_ACTS     = 'cp_admin_activities'; // atividades editadas pelo admin

  // ── Admin guard ────────────────────────────────────────────────────────────
  function isAdmin() {
    const user = JSON.parse(localStorage.getItem(KEY_CURRENT));
    return user?.role === 'admin';
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(KEY_CURRENT)) || null;
  }

  // ── Utilizadores ───────────────────────────────────────────────────────────
  function getUsers() {
    return JSON.parse(localStorage.getItem(KEY_USERS)) || [];
  }

  function getUserById(id) {
    return getUsers().find(u => u.id === id) || null;
  }

  function updateUser(id, { name, email, role }) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'Utilizador não encontrado.' };
    const conflict = users.find(u => u.email === email && u.id !== id);
    if (conflict) return { success: false, error: 'Email já está em uso.' };
    users[idx] = { ...users[idx], name: name.trim(), email: email.trim(), role: role || 'user' };
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    return { success: true, user: users[idx] };
  }

  function deleteUser(id) {
    const current = getCurrentUser();
    if (current?.id === id) return { success: false, error: 'Não podes eliminar a tua própria conta.' };
    const users = getUsers().filter(u => u.id !== id);
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    return { success: true };
  }

  function resetUserPassword(id) {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'Utilizador não encontrado.' };
    users[idx].password = 'calmpath123';
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    return { success: true };
  }

  // ── Atividades (geridas pelo admin, sobrepõem o JSON) ──────────────────────
  let _baseActivities = [];

  async function loadActivities() {
    // carrega o JSON base
    try {
      const res = await fetch('../data/activities.json');
      _baseActivities = await res.json();
    } catch (e) {
      _baseActivities = [];
    }
    // aplica edições guardadas pelo admin
    const saved = JSON.parse(localStorage.getItem(KEY_ACTS));
    if (saved) _baseActivities = saved;
    return _baseActivities;
  }

  function getActivities() { return _baseActivities; }

  function getActivityById(id) { return _baseActivities.find(a => a.id === id) || null; }

  function saveActivities(list) {
    _baseActivities = list;
    localStorage.setItem(KEY_ACTS, JSON.stringify(list));
  }

  function addActivity(data) {
    const list = getActivities();
    const newAct = {
      id:          `act-${Date.now()}`,
      title:       data.title.trim(),
      category:    data.category,
      icon:        data.icon || 'ti-activity',
      duration:    data.duration || '5 min',
      xp:          parseInt(data.xp) || 10,
      difficulty:  parseInt(data.difficulty) || 1,
      description: data.description.trim(),
      type:        data.type || 'challenge',
      instruction: data.instruction?.trim() || '',
      tips:        [],
    };
    list.push(newAct);
    saveActivities(list);
    return { success: true, activity: newAct };
  }

  function updateActivity(id, data) {
    const list = getActivities();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return { success: false, error: 'Atividade não encontrada.' };
    list[idx] = {
      ...list[idx],
      title:       data.title.trim(),
      category:    data.category,
      icon:        data.icon || list[idx].icon,
      duration:    data.duration || list[idx].duration,
      xp:          parseInt(data.xp) || list[idx].xp,
      difficulty:  parseInt(data.difficulty) || list[idx].difficulty,
      description: data.description.trim(),
      type:        data.type || list[idx].type,
      instruction: data.instruction?.trim() || list[idx].instruction || '',
    };
    saveActivities(list);
    return { success: true, activity: list[idx] };
  }

  function deleteActivity(id) {
    const list = getActivities().filter(a => a.id !== id);
    saveActivities(list);
    return { success: true };
  }

  // ── Estatísticas gerais ────────────────────────────────────────────────────
  function getGlobalStats() {
    const users = getUsers().filter(u => u.role !== 'admin');
    const totalActs    = users.reduce((s, u) => s + (u.activityHistory?.length || 0), 0);
    const totalXp      = users.reduce((s, u) => s + (u.xp || 0), 0);
    const totalFavs    = users.reduce((s, u) => s + (u.favorites?.length || 0), 0);
    const avgLevel     = users.length
      ? (users.reduce((s, u) => s + (u.level || 1), 0) / users.length).toFixed(1)
      : '—';

    // atividade por categoria
    const catCount = {};
    users.forEach(u => {
      (u.activityHistory || []).forEach(h => {
        const act = _baseActivities.find(a => a.id === h.id);
        const cat = act?.category || 'Outro';
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
    });

    // utilizadores mais ativos (top 5)
    const topUsers = users
      .map(u => ({ name: u.name, acts: u.activityHistory?.length || 0, xp: u.xp || 0 }))
      .sort((a, b) => b.acts - a.acts)
      .slice(0, 5);

    return {
      totalUsers:    users.length,
      totalActs,
      totalXp,
      totalFavs,
      avgLevel,
      catCount,
      topUsers,
    };
  }

  return {
    isAdmin,
    getCurrentUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetUserPassword,
    loadActivities,
    getActivities,
    getActivityById,
    addActivity,
    updateActivity,
    deleteActivity,
    getGlobalStats,
  };
})();