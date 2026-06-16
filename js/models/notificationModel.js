const NotificationModel = (() => {
  function _saveUser(user) {
    const users = JSON.parse(localStorage.getItem('cp_users')) || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem('cp_users', JSON.stringify(users));
    }
    localStorage.setItem('cp_current_user', JSON.stringify(user));
  }

  function getAll() {
    const user = JSON.parse(localStorage.getItem('cp_current_user'));
    if (!user) return [];
    return user.notifications || [];
  }

  function add({ type, message, icon }) {
    const user = JSON.parse(localStorage.getItem('cp_current_user'));
    if (!user) return;
    if (!user.notifications) user.notifications = [];
    user.notifications.unshift({
      id: Date.now().toString(),
      type,
      message,
      icon: icon || 'ti-bell',
      read: false,
      createdAt: new Date().toISOString(),
    });
    // Máximo 30 notificações
    user.notifications = user.notifications.slice(0, 30);
    _saveUser(user);
  }

  function markAllRead() {
    const user = JSON.parse(localStorage.getItem('cp_current_user'));
    if (!user || !user.notifications) return;
    user.notifications = user.notifications.map(n => ({ ...n, read: true }));
    _saveUser(user);
  }

  function clearAll() {
    const user = JSON.parse(localStorage.getItem('cp_current_user'));
    if (!user) return;
    user.notifications = [];
    _saveUser(user);
  }

  function getUnreadCount() {
    return getAll().filter(n => !n.read).length;
  }

  return { getAll, add, markAllRead, clearAll, getUnreadCount };
})();