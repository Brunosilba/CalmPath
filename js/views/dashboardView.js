const DashboardView = (() => {

  function renderHeader(user, xpData) {
    const firstName = user.name.split(' ')[0];

    const navName = document.getElementById('nav-username');
    if (navName) navName.textContent = firstName;

    document.getElementById('dash-username').textContent = firstName;
    document.getElementById('dash-level').textContent = `Nível ${xpData.level}`;
    document.getElementById('dash-xp').textContent = `${xpData.xp} XP`;

    const bar = document.getElementById('xp-bar-fill');
    if (bar) setTimeout(() => { bar.style.width = `${xpData.progress}%`; }, 100);

    document.getElementById('xp-next').textContent = `${xpData.xpForNextLevel} XP para o próximo nível`;
  }

  function renderStats(stats) {
    const el = document.getElementById('stats-grid');
    if (!el) return;
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-card-icon"><i class="ti ti-check"></i></div>
        <div class="stat-card-value">${stats.totalActivities}</div>
        <div class="stat-card-label">Atividades completas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon"><i class="ti ti-flame"></i></div>
        <div class="stat-card-value">${stats.streak}</div>
        <div class="stat-card-label">Dias consecutivos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon"><i class="ti ti-star"></i></div>
        <div class="stat-card-value">${stats.totalXp}</div>
        <div class="stat-card-label">XP total</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon"><i class="ti ti-trophy"></i></div>
        <div class="stat-card-value">${stats.level}</div>
        <div class="stat-card-label">Nível atual</div>
      </div>
    `;
  }

  function renderDailyChallenge(challenge) {
    const el = document.getElementById('daily-challenge');
    if (!el) return;
    el.innerHTML = `
      <div class="challenge-icon"><i class="ti ${challenge.icon}"></i></div>
      <div class="challenge-info">
        <h3>${challenge.title}</h3>
        <p>${challenge.desc}</p>
        <span class="xp-badge">+${challenge.xp} XP</span>
      </div>
      <button class="btn-complete" data-id="${challenge.id}" data-title="${challenge.title}" data-xp="${challenge.xp}">
        Completar
      </button>
    `;
  }

function renderRecommended(activities) {
  const grid = document.getElementById('recommended-grid');
  if (!grid) return;
  grid.innerHTML = activities.map(a => `
    <div class="act-card">
      <div class="act-icon"><i class="ti ${a.icon}"></i></div>
      <div class="act-info">
        <span class="act-category">${a.category}</span>
        <h4>${a.title}</h4>
        <div class="act-meta">
          <span><i class="ti ti-clock"></i> ${a.duration}</span>
          <span class="xp-badge">+${a.xp} XP</span>
        </div>
      </div>
      <button class="btn-start" data-id="${a.id}">
        Iniciar <i class="ti ti-arrow-right"></i>
      </button>
    </div>
  `).join('');
}

  function renderRecentActivities(activities) {
    const list = document.getElementById('recent-list');
    if (!list) return;
    if (activities.length === 0) {
      list.innerHTML = `<p class="empty-state">Ainda não fizeste nenhuma atividade. Começa hoje!</p>`;
      return;
    }
    list.innerHTML = activities.map(a => `
      <div class="recent-item">
        <div class="recent-check"><i class="ti ti-check"></i></div>
        <div class="recent-info">
          <span class="recent-title">${a.title}</span>
          <span class="recent-date">${formatDate(a.completedAt)}</span>
        </div>
        <span class="xp-badge">+${a.xp} XP</span>
      </div>
    `).join('');
  }

  function renderBadges(badges) {
    const el = document.getElementById('badges-list');
    if (!el) return;
    if (badges.length === 0) {
      el.innerHTML = `<p class="empty-state">Completa atividades para ganhares badges!</p>`;
      return;
    }
    el.innerHTML = badges.map(b => `
      <div class="badge-item">
        <div class="badge-icon"><i class="ti ${b.icon}"></i></div>
        <span class="badge-label">${b.label}</span>
      </div>
    `).join('');
  }

  function renderEmotionalLog(logs) {
    const list = document.getElementById('emotional-log-list');
    if (!list) return;
    if (logs.length === 0) {
      list.innerHTML = `<p class="empty-state">Ainda não fizeste nenhum registo emocional.</p>`;
      return;
    }
    list.innerHTML = logs.map(l => `
      <div class="emotion-log-item">
        <span class="emotion-log-emoji">${l.emoji}</span>
        <div class="emotion-log-info">
          <span class="emotion-log-label">${l.label}</span>
          ${l.note ? `<span class="emotion-log-note">${l.note}</span>` : ''}
          <span class="emotion-log-date">${formatDate(l.registeredAt)}</span>
        </div>
      </div>
    `).join('');
  }

  function showCelebrationModal(activity) {
    document.getElementById('modal-activity-title').textContent = `"${activity.title}" concluída!`;
    document.getElementById('modal-xp-badge').textContent = `+${activity.xp} XP`;
    document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('modal-emotion-note').value = '';
    const modal = document.getElementById('celebration-modal');
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
  }

  function hideCelebrationModal() {
    const modal = document.getElementById('celebration-modal');
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
  }

  function getModalEmotionData() {
    const selected = document.querySelector('.emotion-btn.selected');
    if (!selected) return null;
    return {
      emoji: selected.dataset.emoji,
      label: selected.dataset.label,
      note:  document.getElementById('modal-emotion-note').value.trim(),
    };
  }

  function bindEmotionButtons() {
    document.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.emotion-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  }
  function bindStartButtons(cb) {
  document.getElementById('recommended-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('.btn-start');
    if (btn) cb(btn.dataset.id);
  });
}

  function bindCompleteButtons(handler) {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-complete');
      if (!btn) return;
      if (btn.id === 'modal-submit') return;
      const id    = btn.dataset.id;
      const title = btn.dataset.title;
      const xp    = btn.dataset.xp;
      if (!id || !title || !xp) return;
      handler({
        id:    parseInt(id),
        title: title,
        xp:    parseInt(xp),
      });
    });
  }



  function bindModalSubmit(handler) {
    document.getElementById('modal-submit').addEventListener('click', handler);
  }

  function bindModalSkip(handler) {
    document.getElementById('modal-skip').addEventListener('click', handler);
  }

  function bindLogout(handler) {
    document.getElementById('btn-logout').addEventListener('click', handler);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return {
    renderHeader,
    renderStats,
    renderDailyChallenge,
    renderRecommended,
    renderRecentActivities,
    renderBadges,
    renderEmotionalLog,
    showCelebrationModal,
    hideCelebrationModal,
    getModalEmotionData,
    bindEmotionButtons,
    bindCompleteButtons,
    bindModalSubmit,
    bindModalSkip,
    bindLogout,
    bindStartButtons, 
    bindStartButtons
  };
})();