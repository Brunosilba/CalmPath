

const ActivitiesView = (() => {

  // ── Catálogo
  function renderFilters(categories, activeCategory) {
    const el = document.getElementById('filter-bar');
    if (!el) return;
    el.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === activeCategory ? 'filter-btn--active' : ''}" data-category="${cat}">
        ${cat}
      </button>
    `).join('');
  }

  function renderGrid(activities, favoriteIds, completedFn) {
    const el = document.getElementById('activities-grid');
    if (!el) return;

    if (activities.length === 0) {
      el.innerHTML = `<div class="acts-empty">
        <i class="ti ti-search-off"></i>
        <p>Nenhuma atividade encontrada.</p>
      </div>`;
      return;
    }

    el.innerHTML = activities.map(a => {
      const fav = favoriteIds.includes(a.id);
      const done = completedFn(a.id);
      const diffLabel = ['', 'Fácil', 'Médio', 'Difícil'][a.difficulty] || '';
      const diffClass = ['', 'diff--easy', 'diff--medium', 'diff--hard'][a.difficulty] || '';
      return `
        <div class="act-full-card ${done ? 'act-full-card--done' : ''}" data-id="${a.id}">
          <div class="act-full-top">
            <div class="act-full-icon act-full-icon--${_catSlug(a.category)}">
              <i class="ti ${a.icon}"></i>
            </div>
            <button class="fav-btn ${fav ? 'fav-btn--active' : ''}" data-id="${a.id}" aria-label="${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
              <i class="ti ${fav ? 'ti-heart-filled' : 'ti-heart'}"></i>
            </button>
          </div>
          <div class="act-full-body">
            <div class="act-full-meta">
              <span class="act-cat-tag">${a.category}</span>
              <span class="diff-tag ${diffClass}">${diffLabel}</span>
              ${done ? '<span class="done-tag"><i class="ti ti-check"></i> Concluída</span>' : ''}
            </div>
            <h3>${a.title}</h3>
            <p>${a.description}</p>
            <div class="act-full-footer">
              <span class="act-meta-item"><i class="ti ti-clock"></i> ${a.duration}</span>
              <span class="xp-badge-sm">+${a.xp} XP</span>
              <button class="btn-start" data-id="${a.id}">
                ${done ? 'Repetir' : 'Iniciar'} <i class="ti ti-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateFavButton(id, isFav) {
    const btn = document.querySelector(`.fav-btn[data-id="${id}"]`);
    if (!btn) return;
    btn.classList.toggle('fav-btn--active', isFav);
    btn.querySelector('i').className = `ti ${isFav ? 'ti-heart-filled' : 'ti-heart'}`;
    btn.setAttribute('aria-label', isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  }

  // ── Modal de Simulação 
  function showSimulationModal(activity) {
    const body = document.getElementById('modal-body');
    _openModal();
    body.innerHTML = `
      <div class="modal-act-header">
        <div class="act-full-icon act-full-icon--simulacao"><i class="ti ${activity.icon}"></i></div>
        <div>
          <span class="act-cat-tag">${activity.category}</span>
          <h2>${activity.title}</h2>
        </div>
      </div>
      <div id="sim-content"></div>
    `;
    _renderSimStep(activity, 0);
  }

  function _renderSimStep(activity, stepIdx) {
    const el = document.getElementById('sim-content');
    const step = activity.steps[stepIdx];
    const total = activity.steps.length;
    el.innerHTML = `
      <div class="sim-progress">
        <span class="sim-step-label">Passo ${stepIdx + 1} de ${total}</span>
        <div class="sim-prog-track"><div class="sim-prog-fill" style="width:${Math.round((stepIdx / total) * 100)}%"></div></div>
      </div>
      <div class="sim-prompt">${step.prompt}</div>
      <div class="sim-options">
        ${step.options.map((opt, i) => `<button class="sim-option" data-idx="${i}">${opt}</button>`).join('')}
      </div>
      <div id="sim-feedback" class="sim-feedback hidden"></div>
      <div id="sim-next" class="sim-next hidden"></div>
    `;

    el.querySelectorAll('.sim-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = parseInt(btn.dataset.idx);
        const isCorrect = chosen === step.correct;
        el.querySelectorAll('.sim-option').forEach((b, i) => {
          b.disabled = true;
          if (i === step.correct) b.classList.add('sim-option--correct');
          else if (i === chosen && !isCorrect) b.classList.add('sim-option--wrong');
        });
        const fb = document.getElementById('sim-feedback');
        fb.textContent = step.feedback;
        fb.className = `sim-feedback ${isCorrect ? 'sim-feedback--ok' : 'sim-feedback--tip'}`;

        const next = document.getElementById('sim-next');
        next.classList.remove('hidden');
        if (stepIdx + 1 < total) {
          next.innerHTML = `<button class="btn-sim-next" id="btn-sim-next">Próximo passo <i class="ti ti-arrow-right"></i></button>`;
          document.getElementById('btn-sim-next').addEventListener('click', () => _renderSimStep(activity, stepIdx + 1));
        } else {
          next.innerHTML = `
            <div class="sim-done"><i class="ti ti-trophy"></i><p>Simulação concluída! +${activity.xp} XP</p></div>
            <button class="btn-sim-complete" id="btn-sim-complete">Guardar e fechar</button>
          `;
          document.getElementById('btn-sim-complete').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('activityComplete', { detail: activity }));
          });
        }
      });
    });
  }

  // ── Modal de Respiração 
  function showBreathingModal(activity) {
    const body = document.getElementById('modal-body');
    _openModal();
    let currentCycle = 0, currentPhase = 0, timer = null, running = false;

    function renderBreath() {
      const phase = activity.phases[currentPhase];
      body.innerHTML = `
        <div class="modal-act-header">
          <div class="act-full-icon act-full-icon--relaxamento"><i class="ti ${activity.icon}"></i></div>
          <div><span class="act-cat-tag">${activity.category}</span><h2>${activity.title}</h2></div>
        </div>
        <div class="breath-wrap">
          <div class="breath-cycle-info">Ciclo ${currentCycle + 1} de ${activity.cycles}</div>
          <div class="breath-circle" id="breath-circle">
            <div class="breath-phase" id="breath-phase">${phase.name}</div>
            <div class="breath-count" id="breath-count">${phase.duration}</div>
          </div>
          <div class="breath-instruction" id="breath-instr">${phase.instruction}</div>
          <button class="btn-breath-start" id="btn-breath">${running ? 'Pausar' : 'Iniciar'}</button>
        </div>
      `;
      document.getElementById('btn-breath').addEventListener('click', toggleBreath);
    }

    function toggleBreath() {
      running = !running;
      const btn = document.getElementById('btn-breath');
      if (btn) btn.textContent = running ? 'Pausar' : 'Continuar';
      if (running) runPhase(); else clearInterval(timer);
    }

    function runPhase() {
      const phase = activity.phases[currentPhase];
      let count = phase.duration;
      const circleEl = document.getElementById('breath-circle');
      const countEl  = document.getElementById('breath-count');
      const instrEl  = document.getElementById('breath-instr');
      const phaseEl  = document.getElementById('breath-phase');
      const phaseClass = currentPhase === 0 ? 'in' : currentPhase === activity.phases.length - 1 ? 'out' : 'hold';
      if (circleEl) circleEl.className = `breath-circle breath-circle--${phaseClass}`;
      if (phaseEl)  phaseEl.textContent  = phase.name;
      if (instrEl)  instrEl.textContent  = phase.instruction;
      if (countEl)  countEl.textContent  = count;
      clearInterval(timer);
      timer = setInterval(() => {
        count--;
        if (countEl) countEl.textContent = count;
        if (count <= 0) {
          clearInterval(timer);
          currentPhase++;
          if (currentPhase >= activity.phases.length) {
            currentPhase = 0;
            currentCycle++;
            if (currentCycle >= activity.cycles) {
              running = false;
              const wrap = body.querySelector('.breath-wrap');
              if (wrap) wrap.innerHTML = `
                <div class="sim-done"><i class="ti ti-lungs"></i><p>Exercício completo! +${activity.xp} XP</p></div>
                <button class="btn-sim-complete" id="btn-breath-complete">Guardar e fechar</button>
              `;
              document.getElementById('btn-breath-complete')?.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('activityComplete', { detail: activity }));
              });
              return;
            }
          }
          renderBreath();
          if (running) runPhase();
        }
      }, 1000);
    }

    renderBreath();
  }

  // ── Modal de Quiz 
  function showQuizModal(activity) {
    const body = document.getElementById('modal-body');
    _openModal();
    body.innerHTML = `
      <div class="modal-act-header">
        <div class="act-full-icon act-full-icon--reflexao"><i class="ti ${activity.icon}"></i></div>
        <div><span class="act-cat-tag">${activity.category}</span><h2>${activity.title}</h2></div>
      </div>
      <div id="quiz-content"></div>
    `;
    _renderQuizStep(activity, 0, []);
  }

  function _renderQuizStep(activity, qIdx, answers) {
    const el = document.getElementById('quiz-content');
    const q = activity.questions[qIdx];
    const total = activity.questions.length;
    el.innerHTML = `
      <div class="sim-progress">
        <span class="sim-step-label">Pergunta ${qIdx + 1} de ${total}</span>
        <div class="sim-prog-track"><div class="sim-prog-fill" style="width:${Math.round((qIdx / total) * 100)}%"></div></div>
      </div>
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <label class="quiz-option">
            <input type="${q.multiple ? 'checkbox' : 'radio'}" name="q${qIdx}" value="${i}" />
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
      <button class="btn-quiz-next" id="btn-quiz-next" disabled>
        ${qIdx + 1 < total ? 'Próxima pergunta' : 'Ver resultado'} <i class="ti ti-arrow-right"></i>
      </button>
      <div id="quiz-feedback" class="sim-feedback hidden"></div>
    `;

    el.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        const checked = el.querySelectorAll('input:checked');
        document.getElementById('btn-quiz-next').disabled = checked.length === 0;
        if (!q.multiple && q.correct !== undefined) {
          const fb = document.getElementById('quiz-feedback');
          const chosen = parseInt(inp.value);
          fb.textContent = chosen === q.correct ? '✓ Correto!' : `Quase! A resposta certa é: "${q.options[q.correct]}"`;
          fb.className = `sim-feedback ${chosen === q.correct ? 'sim-feedback--ok' : 'sim-feedback--tip'}`;
        }
      });
    });

    document.getElementById('btn-quiz-next').addEventListener('click', () => {
      const selected = [...el.querySelectorAll('input:checked')].map(i => parseInt(i.value));
      answers.push({ q: q.question, selected });
      if (qIdx + 1 < total) {
        _renderQuizStep(activity, qIdx + 1, answers);
      } else {
        el.innerHTML = `
          <div class="sim-done"><i class="ti ti-check-circle"></i><p>Quiz completo! +${activity.xp} XP</p></div>
          <button class="btn-sim-complete" id="btn-quiz-complete">Guardar e fechar</button>
        `;
        document.getElementById('btn-quiz-complete').addEventListener('click', () => {
          document.dispatchEvent(new CustomEvent('activityComplete', { detail: activity }));
        });
      }
    });
  }

  // ── Modal de Desafio 
  function showChallengeModal(activity) {
    const body = document.getElementById('modal-body');
    _openModal();
    body.innerHTML = `
      <div class="modal-act-header">
        <div class="act-full-icon act-full-icon--desafio"><i class="ti ${activity.icon}"></i></div>
        <div><span class="act-cat-tag">${activity.category}</span><h2>${activity.title}</h2></div>
      </div>
      <p class="challenge-modal-desc">${activity.description}</p>
      <div class="challenge-instruction">
        <i class="ti ti-info-circle"></i>
        <p>${activity.instruction}</p>
      </div>
      <ul class="challenge-tips">
        ${activity.tips.map(t => `<li><i class="ti ti-check"></i> ${t}</li>`).join('')}
      </ul>
      <div class="challenge-modal-footer">
        <button class="btn-sim-complete" id="btn-challenge-done">
          <i class="ti ti-check"></i> Já fiz! (+${activity.xp} XP)
        </button>
      </div>
    `;
    document.getElementById('btn-challenge-done').addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('activityComplete', { detail: activity }));
    });
  }

  // ── Helpers de modal 
  function _openModal() {
    const m = document.getElementById('activity-modal');
    m.setAttribute('aria-hidden', 'false');
    m.classList.add('modal-overlay--visible');
  }

  function hideModal() {
    const m = document.getElementById('activity-modal');
    m.setAttribute('aria-hidden', 'true');
    m.classList.remove('modal-overlay--visible');
  }

  // ── Toast 
  function showToast(msg) {
    const t = document.getElementById('act-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('xp-toast--visible');
    setTimeout(() => t.classList.remove('xp-toast--visible'), 2500);
  }

  // ── Bindings 
  function bindFilters(cb) {
    document.getElementById('filter-bar')?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (btn) cb(btn.dataset.category);
    });
  }

  function bindSearch(cb) {
    document.getElementById('search-input')?.addEventListener('input', e => cb(e.target.value.trim()));
  }

  function bindFavButtons(cb) {
    document.getElementById('activities-grid')?.addEventListener('click', e => {
      const btn = e.target.closest('.fav-btn');
      if (btn) cb(btn.dataset.id);
    });
  }

  function bindStartButtons(cb) {
    document.getElementById('activities-grid')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-start');
      if (btn) cb(btn.dataset.id);
    });
  }

  function bindModalClose() {
    document.getElementById('modal-close')?.addEventListener('click', hideModal);
    document.getElementById('activity-modal')?.addEventListener('click', e => {
      if (e.target === document.getElementById('activity-modal')) hideModal();
    });
  }

  function _catSlug(cat) {
    return cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  }

  return {
    renderFilters, renderGrid, updateFavButton,
    showSimulationModal, showBreathingModal, showQuizModal, showChallengeModal,
    hideModal, showToast,
    bindFilters, bindSearch, bindFavButtons, bindStartButtons, bindModalClose,
  };
})();