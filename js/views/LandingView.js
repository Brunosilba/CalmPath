

const LandingView = (() => {

  function updateNavForUser(user) {
    const actions = document.getElementById('nav-actions');
    if (!actions) return;
    if (user) {
      actions.innerHTML = `
        <span class="nav-username">Olá, ${user.name.split(' ')[0]}</span>
        <a href="pages/dashboard.html" class="btn btn-primary">Dashboard</a>
        <button class="btn btn-ghost" id="btn-logout">Sair</button>
      `;
    } else {
      actions.innerHTML = `
        <a href="pages/login.html" class="btn btn-ghost">Entrar</a>
        <a href="pages/register.html" class="btn btn-primary">Começar grátis</a>
      `;
    }
  }

  function bindLogout(handler) {
    document.addEventListener('click', e => {
      if (e.target && e.target.id === 'btn-logout') handler();
    });
  }

  function showNotification(message, type = 'info') {
    const existing = document.getElementById('cp-notification');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'cp-notification';
    el.className = `notification notification--${type}`;
    el.textContent = message;
    document.body.prepend(el);
    setTimeout(() => el.remove(), 3500);
  }

  return { updateNavForUser, bindLogout, showNotification };
})();
