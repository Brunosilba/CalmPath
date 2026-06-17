const NotificationController = (() => {
  function init() {
    
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const bellContainer = document.createElement('div');
    navActions.insertBefore(bellContainer, navActions.firstChild);
    NotificationView.renderBell(bellContainer);

    _refresh();
    _bindEvents();
    _checkReminders();
  }

  function _refresh() {
    const notifications = NotificationModel.getAll();
    NotificationView.updateBell(notifications);
  }

  function _bindEvents() {
    document.getElementById('notif-bell-btn')?.addEventListener('click', () => {
      const dropdown = document.getElementById('notif-dropdown');
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      if (!isOpen) {
        NotificationModel.markAllRead();
        _refresh();
      }
    });

    document.getElementById('notif-clear-btn')?.addEventListener('click', () => {
      NotificationModel.clearAll();
      _refresh();
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('notif-bell-wrap');
      if (wrap && !wrap.contains(e.target)) {
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.hidden = true;
      }
    });
  }

  function _checkReminders() {
    const user = UserModel.getCurrentUser();
    if (!user) return;

    // Lembrete: sem registo emocional hoje
    const log = user.emotionalLog || [];
    const today = new Date().toDateString();
    const loggedToday = log.some(e => new Date(e.date).toDateString() === today);
    if (!loggedToday) {
      const alreadyNotified = NotificationModel.getAll().some(
        n => n.type === 'reminder_emotional' &&
             new Date(n.createdAt).toDateString() === today
      );
      if (!alreadyNotified) {
        notify({
          type: 'reminder_emotional',
          message: 'Ainda não fizeste o teu registo emocional hoje.',
          icon: 'ti-mood-smile',
          toast: false,
        });
      }
    }
  }

  
  function notify({ type, message, icon, toast = true }) {
    NotificationModel.add({ type, message, icon });
    _refresh();
    if (toast) NotificationView.showToast(message, icon);
  }

  return { init, notify };
})();