
const ProfileView = (() => {

  // ── Cabeçalho / avatar 
  function renderHeader(user, stats) {
    const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const joined   = new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

    document.getElementById('profile-initials').textContent = initials;
    document.getElementById('profile-name').textContent     = user.name;
    document.getElementById('profile-email').textContent    = user.email;
    document.getElementById('profile-joined').textContent   = `Membro desde ${joined}`;

    document.getElementById('nav-username').textContent = user.name.split(' ')[0];

    // mini-stats no topo
    document.getElementById('hdr-stat-xp').textContent    = stats.totalXp;
    document.getElementById('hdr-stat-acts').textContent  = stats.totalActivities;
    document.getElementById('hdr-stat-level').textContent = stats.level;
  }

  // ── Formulário de edição 
  function fillEditForm(user) {
    document.getElementById('edit-name').value  = user.name;
    document.getElementById('edit-email').value = user.email;
  }

  function getEditFormData() {
    return {
      name:  document.getElementById('edit-name').value.trim(),
      email: document.getElementById('edit-email').value.trim(),
    };
  }

  function getPasswordFormData() {
    return {
      current: document.getElementById('pwd-current').value,
      next:    document.getElementById('pwd-new').value,
      confirm: document.getElementById('pwd-confirm').value,
    };
  }

  function clearPasswordForm() {
    ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    showFieldMsg('pwd-msg', '', '');
  }

  // ── Favoritos
  function renderFavorites(activities) {
    const el = document.getElementById('favorites-list');
    if (!el) return;

    if (activities.length === 0) {
      el.innerHTML = `<div class="profile-empty"><i class="ti ti-heart-off"></i><p>Ainda não tens favoritos.</p><a href="activities.html" class="link-acts">Explorar atividades</a></div>`;
      return;
    }

    el.innerHTML = activities.map(a => `
      <div class="fav-row" data-id="${a.id}">
        <div class="fav-row-icon fav-icon--${_catSlug(a.category)}">
          <i class="ti ${a.icon}"></i>
        </div>
        <div class="fav-row-info">
          <span class="fav-row-cat">${a.category}</span>
          <span class="fav-row-title">${a.title}</span>
        </div>
        <div class="fav-row-actions">
          <span class="xp-badge-sm">+${a.xp} XP</span>
          <a href="activities.html" class="btn-fav-go" title="Ir para atividades"><i class="ti ti-arrow-right"></i></a>
          <button class="btn-fav-remove" data-id="${a.id}" title="Remover dos favoritos"><i class="ti ti-heart-off"></i></button>
        </div>
      </div>
    `).join('');
  }

  function removeFavRow(id) {
    document.querySelector(`.fav-row[data-id="${id}"]`)?.remove();
    const el = document.getElementById('favorites-list');
    if (el && el.children.length === 0) {
      el.innerHTML = `<div class="profile-empty"><i class="ti ti-heart-off"></i><p>Ainda não tens favoritos.</p><a href="activities.html" class="link-acts">Explorar atividades</a></div>`;
    }
  }

  // ── Histórico emocional
  function renderEmotionalLog(log) {
    const el = document.getElementById('emotional-log-full');
    if (!el) return;

    if (log.length === 0) {
      el.innerHTML = `<div class="profile-empty"><i class="ti ti-mood-empty"></i><p>Ainda não tens registos emocionais.<br>Completa atividades para começar.</p></div>`;
      return;
    }

    el.innerHTML = log.map(entry => {
      const date = new Date(entry.registeredAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="emo-row">
          <span class="emo-emoji">${entry.emoji}</span>
          <div class="emo-info">
            <span class="emo-label">${entry.label}</span>
            ${entry.note ? `<span class="emo-note">${entry.note}</span>` : ''}
          </div>
          <span class="emo-date">${date}</span>
        </div>
      `;
    }).join('');
  }

  // ── Objetivos 
  function renderGoals(goals) {
    const el = document.getElementById('goals-list');
    if (!el) return;

    if (goals.length === 0) {
      el.innerHTML = `<div class="profile-empty"><i class="ti ti-target"></i><p>Define o teu primeiro objetivo.</p></div>`;
      return;
    }

    el.innerHTML = goals.map(g => `
      <div class="goal-row ${g.done ? 'goal-row--done' : ''}" data-id="${g.id}">
        <button class="goal-check" data-id="${g.id}" aria-label="${g.done ? 'Marcar como pendente' : 'Marcar como concluído'}">
          <i class="ti ${g.done ? 'ti-circle-check-filled' : 'ti-circle'}"></i>
        </button>
        <span class="goal-text">${g.text}</span>
        <button class="goal-delete" data-id="${g.id}" aria-label="Eliminar objetivo">
          <i class="ti ti-trash"></i>
        </button>
      </div>
    `).join('');
  }

  function getGoalInput() {
    const el = document.getElementById('goal-input');
    const val = el?.value.trim();
    if (el) el.value = '';
    return val || '';
  }

  // ── Feedback / mensagens 
  function showFieldMsg(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = `field-msg ${type ? 'field-msg--' + type : ''}`;
  }

  function showToast(msg, type = 'success') {
    let t = document.getElementById('profile-toast');
    if (!t) { t = document.createElement('div'); t.id = 'profile-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = `xp-toast xp-toast--visible xp-toast--${type}`;
    setTimeout(() => t.classList.remove('xp-toast--visible'), 2600);
  }

  // ── Tabs 
  function bindTabs() {
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('profile-tab--active'));
        document.querySelectorAll('.profile-panel').forEach(p => p.classList.remove('profile-panel--active'));
        tab.classList.add('profile-tab--active');
        const panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('profile-panel--active');
      });
    });
  }

  // ── Bindings de formulários 
  function bindEditForm(cb) {
    document.getElementById('form-edit')?.addEventListener('submit', e => { e.preventDefault(); cb(getEditFormData()); });
  }

  function bindPasswordForm(cb) {
    document.getElementById('form-password')?.addEventListener('submit', e => { e.preventDefault(); cb(getPasswordFormData()); });
  }

  function bindRemoveFav(cb) {
    document.getElementById('favorites-list')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-fav-remove');
      if (btn) cb(btn.dataset.id);
    });
  }

  function bindGoalAdd(cb) {
    document.getElementById('form-goal')?.addEventListener('submit', e => { e.preventDefault(); cb(getGoalInput()); });
  }

  function bindGoalToggle(cb) {
    document.getElementById('goals-list')?.addEventListener('click', e => {
      const btn = e.target.closest('.goal-check');
      if (btn) cb(btn.dataset.id);
    });
  }

  function bindGoalDelete(cb) {
    document.getElementById('goals-list')?.addEventListener('click', e => {
      const btn = e.target.closest('.goal-delete');
      if (btn) cb(btn.dataset.id);
    });
  }

  function bindLogout(cb) {
    document.getElementById('btn-logout')?.addEventListener('click', cb);
  }

  // ── util 
  function _catSlug(cat) {
    return cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  }

  return {
    renderHeader,
    fillEditForm,
    getEditFormData,
    getPasswordFormData,
    clearPasswordForm,
    renderFavorites,
    removeFavRow,
    renderEmotionalLog,
    renderGoals,
    getGoalInput,
    showFieldMsg,
    showToast,
    bindTabs,
    bindEditForm,
    bindPasswordForm,
    bindRemoveFav,
    bindGoalAdd,
    bindGoalToggle,
    bindGoalDelete,
    bindLogout,
  };
})();