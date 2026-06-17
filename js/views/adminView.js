

const AdminView = (() => {

  // ── Tabs 
  function bindTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('admin-tab--active'));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('admin-panel--active'));
        tab.classList.add('admin-tab--active');
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('admin-panel--active');
      });
    });
  }

  // ── Estatísticas 
  function renderStats(stats) {
    document.getElementById('stat-users').textContent  = stats.totalUsers;
    document.getElementById('stat-acts').textContent   = stats.totalActs;
    document.getElementById('stat-xp').textContent     = stats.totalXp;
    document.getElementById('stat-favs').textContent   = stats.totalFavs;
    document.getElementById('stat-level').textContent  = stats.avgLevel;

    // categorias
    const catEl = document.getElementById('stats-categories');
    if (catEl) {
      const entries = Object.entries(stats.catCount).sort((a, b) => b[1] - a[1]);
      const max = entries[0]?.[1] || 1;
      catEl.innerHTML = entries.length
        ? entries.map(([cat, count]) => `
            <div class="cat-bar-row">
              <span class="cat-bar-label">${cat}</span>
              <div class="cat-bar-track">
                <div class="cat-bar-fill" style="width:${Math.round((count / max) * 100)}%"></div>
              </div>
              <span class="cat-bar-count">${count}</span>
            </div>
          `).join('')
        : '<p class="admin-empty-note">Ainda não há atividades concluídas.</p>';
    }

    // top utilizadores
    const topEl = document.getElementById('stats-top-users');
    if (topEl) {
      topEl.innerHTML = stats.topUsers.length
        ? stats.topUsers.map((u, i) => `
            <div class="top-user-row">
              <span class="top-rank">#${i + 1}</span>
              <span class="top-name">${u.name}</span>
              <span class="top-acts">${u.acts} ativ.</span>
              <span class="xp-badge-sm">${u.xp} XP</span>
            </div>
          `).join('')
        : '<p class="admin-empty-note">Nenhum utilizador registado ainda.</p>';
    }
  }

  // ── Utilizadores 
  function renderUsers(users) {
    const el = document.getElementById('users-table-body');
    if (!el) return;

    if (users.length === 0) {
      el.innerHTML = `<tr><td colspan="6" class="table-empty">Nenhum utilizador encontrado.</td></tr>`;
      return;
    }

    el.innerHTML = users.map(u => {
      const joined = new Date(u.createdAt).toLocaleDateString('pt-PT');
      const acts   = u.activityHistory?.length || 0;
      const roleLabel = u.role === 'admin' ? '<span class="role-tag role-tag--admin">Admin</span>' : '<span class="role-tag role-tag--user">Utilizador</span>';
      return `
        <tr data-id="${u.id}">
          <td>
            <div class="user-cell">
              <div class="user-avatar-sm">${u.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()}</div>
              <div>
                <span class="user-cell-name">${u.name}</span>
                <span class="user-cell-email">${u.email}</span>
              </div>
            </div>
          </td>
          <td>${roleLabel}</td>
          <td>${acts}</td>
          <td>${u.xp || 0} XP</td>
          <td>${joined}</td>
          <td>
            <div class="table-actions">
              <button class="btn-tbl btn-tbl--edit" data-id="${u.id}" title="Editar"><i class="ti ti-pencil"></i></button>
              <button class="btn-tbl btn-tbl--reset" data-id="${u.id}" title="Repor password"><i class="ti ti-key"></i></button>
              <button class="btn-tbl btn-tbl--delete" data-id="${u.id}" title="Eliminar"><i class="ti ti-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterUsersTable(query) {
    const rows = document.querySelectorAll('#users-table-body tr[data-id]');
    const q = query.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  }

  // ── Modal utilizador 
  function showUserModal(user) {
    document.getElementById('modal-user-id').value    = user.id;
    document.getElementById('modal-user-name').value  = user.name;
    document.getElementById('modal-user-email').value = user.email;
    document.getElementById('modal-user-role').value  = user.role || 'user';
    document.getElementById('user-modal-msg').textContent = '';
    _openModal('user-modal');
  }

  function getUserModalData() {
    return {
      id:    document.getElementById('modal-user-id').value,
      name:  document.getElementById('modal-user-name').value.trim(),
      email: document.getElementById('modal-user-email').value.trim(),
      role:  document.getElementById('modal-user-role').value,
    };
  }

  // ── Atividades 
  function renderActivities(activities) {
    const el = document.getElementById('acts-table-body');
    if (!el) return;

    if (activities.length === 0) {
      el.innerHTML = `<tr><td colspan="6" class="table-empty">Nenhuma atividade encontrada.</td></tr>`;
      return;
    }

    const diffLabel = ['', 'Fácil', 'Médio', 'Difícil'];
    el.innerHTML = activities.map(a => `
      <tr data-id="${a.id}">
        <td>
          <div class="act-cell">
            <div class="act-icon-sm act-icon--${_catSlug(a.category)}"><i class="ti ${a.icon}"></i></div>
            <span>${a.title}</span>
          </div>
        </td>
        <td><span class="act-cat-tag">${a.category}</span></td>
        <td>${diffLabel[a.difficulty] || '—'}</td>
        <td>${a.xp} XP</td>
        <td>${a.duration}</td>
        <td>
          <div class="table-actions">
            <button class="btn-tbl btn-tbl--edit" data-id="${a.id}" title="Editar"><i class="ti ti-pencil"></i></button>
            <button class="btn-tbl btn-tbl--delete" data-id="${a.id}" title="Eliminar"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function filterActivitiesTable(query) {
    const rows = document.querySelectorAll('#acts-table-body tr[data-id]');
    const q = query.toLowerCase();
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  }

  // ── Modal atividade 
  function showActivityModal(activity) {
    const isNew = !activity;
    document.getElementById('act-modal-title').textContent = isNew ? 'Nova atividade' : 'Editar atividade';
    document.getElementById('modal-act-id').value          = activity?.id || '';
    document.getElementById('modal-act-title').value       = activity?.title || '';
    document.getElementById('modal-act-category').value    = activity?.category || 'Desafio';
    document.getElementById('modal-act-type').value        = activity?.type || 'challenge';
    document.getElementById('modal-act-difficulty').value  = activity?.difficulty || 1;
    document.getElementById('modal-act-xp').value          = activity?.xp || 20;
    document.getElementById('modal-act-duration').value    = activity?.duration || '5 min';
    document.getElementById('modal-act-icon').value        = activity?.icon || 'ti-activity';
    document.getElementById('modal-act-desc').value        = activity?.description || '';
    document.getElementById('modal-act-instruction').value = activity?.instruction || '';
    document.getElementById('act-modal-msg').textContent   = '';
    _openModal('act-modal');
  }

  function getActivityModalData() {
    return {
      id:          document.getElementById('modal-act-id').value,
      title:       document.getElementById('modal-act-title').value,
      category:    document.getElementById('modal-act-category').value,
      type:        document.getElementById('modal-act-type').value,
      difficulty:  document.getElementById('modal-act-difficulty').value,
      xp:          document.getElementById('modal-act-xp').value,
      duration:    document.getElementById('modal-act-duration').value,
      icon:        document.getElementById('modal-act-icon').value,
      description: document.getElementById('modal-act-desc').value,
      instruction: document.getElementById('modal-act-instruction').value,
    };
  }

  // ── Modal confirmação 
  function showConfirmModal(msg, onConfirm) {
    document.getElementById('confirm-msg').textContent = msg;
    _openModal('confirm-modal');
    const btn = document.getElementById('btn-confirm-yes');
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', () => { hideModal('confirm-modal'); onConfirm(); });
  }

  // ── Modais helpers 
  function _openModal(id) {
    const m = document.getElementById(id);
    m?.classList.add('modal-overlay--visible');
    m?.setAttribute('aria-hidden', 'false');
  }

  function hideModal(id) {
    const m = document.getElementById(id);
    m?.classList.remove('modal-overlay--visible');
    m?.setAttribute('aria-hidden', 'true');
  }

  function showModalMsg(id, msg, type) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.className = `field-msg field-msg--${type}`; }
  }

  // ── Toast 
  function showToast(msg, type = 'success') {
    const t = document.getElementById('admin-toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `xp-toast xp-toast--visible xp-toast--${type}`;
    setTimeout(() => t.classList.remove('xp-toast--visible'), 2600);
  }

  // ── Bindings 
  function bindUserSearch(cb) {
    document.getElementById('user-search')?.addEventListener('input', e => cb(e.target.value.trim()));
  }

  function bindUserTableActions(onEdit, onReset, onDelete) {
    document.getElementById('users-table-body')?.addEventListener('click', e => {
      const id = e.target.closest('[data-id]')?.dataset.id;
      if (!id) return;
      if (e.target.closest('.btn-tbl--edit'))   onEdit(id);
      if (e.target.closest('.btn-tbl--reset'))  onReset(id);
      if (e.target.closest('.btn-tbl--delete')) onDelete(id);
    });
  }

  function bindUserModalSave(cb) {
    document.getElementById('form-user-modal')?.addEventListener('submit', e => { e.preventDefault(); cb(getUserModalData()); });
  }

  function bindActSearch(cb) {
    document.getElementById('act-search')?.addEventListener('input', e => cb(e.target.value.trim()));
  }

  function bindActTableActions(onEdit, onDelete) {
    document.getElementById('acts-table-body')?.addEventListener('click', e => {
      const id = e.target.closest('[data-id]')?.dataset.id;
      if (!id) return;
      if (e.target.closest('.btn-tbl--edit'))   onEdit(id);
      if (e.target.closest('.btn-tbl--delete')) onDelete(id);
    });
  }

  function bindNewActivity(cb) {
    document.getElementById('btn-new-activity')?.addEventListener('click', cb);
  }

  function bindActModalSave(cb) {
    document.getElementById('form-act-modal')?.addEventListener('submit', e => { e.preventDefault(); cb(getActivityModalData()); });
  }

  function bindModalCloses() {
    document.querySelectorAll('.modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => {
          m.classList.remove('modal-overlay--visible');
          m.setAttribute('aria-hidden', 'true');
        });
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', e => {
        if (e.target === m) { m.classList.remove('modal-overlay--visible'); m.setAttribute('aria-hidden', 'true'); }
      });
    });
  }

  function bindLogout(cb) {
    document.getElementById('btn-logout')?.addEventListener('click', cb);
  }

  function _catSlug(cat) {
    return cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  }

  return {
    bindTabs,
    renderStats,
    renderUsers,
    filterUsersTable,
    showUserModal,
    getUserModalData,
    renderActivities,
    filterActivitiesTable,
    showActivityModal,
    getActivityModalData,
    showConfirmModal,
    hideModal,
    showModalMsg,
    showToast,
    bindUserSearch,
    bindUserTableActions,
    bindUserModalSave,
    bindActSearch,
    bindActTableActions,
    bindNewActivity,
    bindActModalSave,
    bindModalCloses,
    bindLogout,
  };
})();