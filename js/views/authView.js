const AuthView = (() => {

  const loginPanel    = () => document.getElementById('panel-login');
  const registerPanel = () => document.getElementById('panel-register');
  const tabLogin      = () => document.getElementById('tab-login');
  const tabRegister   = () => document.getElementById('tab-register');

  function showPanel(panel) {
    if (panel === 'login') {
      loginPanel().classList.add('active');
      registerPanel().classList.remove('active');
      tabLogin().classList.add('auth-tab--active');
      tabRegister().classList.remove('auth-tab--active');
    } else {
      registerPanel().classList.add('active');
      loginPanel().classList.remove('active');
      tabRegister().classList.add('auth-tab--active');
      tabLogin().classList.remove('auth-tab--active');
    }
    clearErrors();
  }

  function showError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (el) {
      el.textContent = message;
      el.classList.add('visible');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.original = btn.textContent;
      btn.textContent = 'A processar...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.original || btn.textContent;
    }
  }

  function bindTabs(handler) {
    tabLogin().addEventListener('click', () => handler('login'));
    tabRegister().addEventListener('click', () => handler('register'));
  }

  function bindLoginForm(handler) {
    document.getElementById('form-login').addEventListener('submit', e => {
      e.preventDefault();
      clearErrors();
      handler({
        email:    document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value,
      });
    });
  }

  function bindRegisterForm(handler) {
    document.getElementById('form-register').addEventListener('submit', e => {
      e.preventDefault();
      clearErrors();
      handler({
        name:     document.getElementById('reg-name').value.trim(),
        email:    document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value,
        confirm:  document.getElementById('reg-confirm').value,
      });
    });
  }

  function bindToggleLinks(handler) {
    document.querySelectorAll('[data-toggle]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        handler(link.dataset.toggle);
      });
    });
  }

  return {
    showPanel,
    showError,
    clearErrors,
    setLoading,
    bindTabs,
    bindLoginForm,
    bindRegisterForm,
    bindToggleLinks,
  };
})();