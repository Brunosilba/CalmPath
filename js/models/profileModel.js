

const ProfileModel = (() => {

  const KEY_USER  = 'cp_current_user';
  const KEY_USERS = 'cp_users';

  function _getUser() {
    return JSON.parse(localStorage.getItem(KEY_USER)) || null;
  }

  function _saveUser(user) {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem(KEY_USERS)) || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) { users[idx] = user; localStorage.setItem(KEY_USERS, JSON.stringify(users)); }
  }

  // ── Dados do utilizador 
  function getUser() { return _getUser(); }

  function updateProfile({ name, email }) {
    const user = _getUser();
    if (!user) return { success: false, error: 'Sessão inválida.' };
    if (!name || !email) return { success: false, error: 'Nome e email são obrigatórios.' };

    const users = JSON.parse(localStorage.getItem(KEY_USERS)) || [];
    const conflict = users.find(u => u.email === email && u.id !== user.id);
    if (conflict) return { success: false, error: 'Este email já está a ser usado.' };

    user.name  = name.trim();
    user.email = email.trim();
    _saveUser(user);
    return { success: true, user };
  }

  function changePassword({ current, next, confirm }) {
    const user = _getUser();
    if (!user) return { success: false, error: 'Sessão inválida.' };
    if (user.password !== current) return { success: false, error: 'Palavra-passe atual incorreta.' };
    if (next.length < 6) return { success: false, error: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' };
    if (next !== confirm) return { success: false, error: 'As palavras-passe não coincidem.' };
    user.password = next;
    _saveUser(user);
    return { success: true };
  }

  // ── Favoritos 
  function getFavoriteIds() { return _getUser()?.favorites || []; }

  function removeFavorite(id) {
    const user = _getUser();
    if (!user) return;
    user.favorites = (user.favorites || []).filter(f => f !== id);
    _saveUser(user);
  }

  // ── Histórico emocional completo 
  function getFullEmotionalLog() {
    const user = _getUser();
    return (user?.emotionalLog || []).slice().reverse();
  }

  // ── Objetivos pessoais 
  function getGoals() { return _getUser()?.goals || []; }

  function addGoal(text) {
    const user = _getUser();
    if (!user || !text.trim()) return { success: false };
    user.goals = user.goals || [];
    user.goals.push({ id: Date.now().toString(), text: text.trim(), done: false, createdAt: new Date().toISOString() });
    _saveUser(user);
    return { success: true };
  }

  function toggleGoal(id) {
    const user = _getUser();
    if (!user) return;
    const goal = (user.goals || []).find(g => g.id === id);
    if (goal) goal.done = !goal.done;
    _saveUser(user);
  }

  function deleteGoal(id) {
    const user = _getUser();
    if (!user) return;
    user.goals = (user.goals || []).filter(g => g.id !== id);
    _saveUser(user);
  }

  // ── Estatísticas resumo 
  function getStats() {
    const user = _getUser();
    if (!user) return { totalActivities: 0, totalXp: 0, level: 1, badges: 0, favorites: 0 };
    return {
      totalActivities: (user.activityHistory || []).length,
      totalXp:         user.xp   || 0,
      level:           user.level || 1,
      badges:          (user.badges || []).length,
      favorites:       (user.favorites || []).length,
    };
  }

  return {
    getUser,
    updateProfile,
    changePassword,
    getFavoriteIds,
    removeFavorite,
    getFullEmotionalLog,
    getGoals,
    addGoal,
    toggleGoal,
    deleteGoal,
    getStats,
  };
})();