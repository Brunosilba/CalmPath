const NotificationView = (() => {
  function renderBell(container) {
    container.innerHTML = `
      <div class="notif-bell-wrap" id="notif-bell-wrap">
        <button class="notif-bell-btn" id="notif-bell-btn" aria-label="Notificações">
          <i class="ti ti-bell"></i>
          <span class="notif-badge" id="notif-badge" hidden>0</span>
        </button>
        <div class="notif-dropdown" id="notif-dropdown" hidden>
          <div class="notif-dropdown-header">
            <span>Notificações</span>
            <button class="notif-clear-btn" id="notif-clear-btn">Limpar</button>
          </div>
          <div class="notif-list" id="notif-list"></div>
        </div>
      </div>
    `;
  }

  function updateBell(notifications) {
    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-list');
    if (!badge || !list) return;

    const unread = notifications.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.hidden = unread === 0;

    if (notifications.length === 0) {
      list.innerHTML = `<p class="notif-empty">Sem notificações.</p>`;
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'notif-item--unread'}">
        <i class="ti ${n.icon} notif-item-icon"></i>
        <div class="notif-item-body">
          <p class="notif-item-msg">${n.message}</p>
          <span class="notif-item-time">${_timeAgo(n.createdAt)}</span>
        </div>
      </div>
    `).join('');
  }

  function showToast(message, icon = 'ti-bell') {
    let toast = document.getElementById('notif-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'notif-toast';
      toast.className = 'notif-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="ti ${icon}"></i> ${message}`;
    toast.classList.add('notif-toast--show');
    setTimeout(() => toast.classList.remove('notif-toast--show'), 3500);
  }

  function _timeAgo(isoString) {
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  }

  return { renderBell, updateBell, showToast };
})();