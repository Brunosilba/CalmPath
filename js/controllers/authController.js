const AuthController = (() => {

  function init() {
    if (UserModel.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const panel = params.get('panel') === 'register' ? 'register' : 'login';
    AuthView.showPanel(panel);

    AuthView.bindTabs(handleTabSwitch);
    AuthView.bindLoginForm(handleLogin);
    AuthView.bindRegisterForm(handleRegister);
    AuthView.bindToggleLinks(handleTabSwitch);
  }

  function handleTabSwitch(panel) {
    AuthView.showPanel(panel);
  }

function handleLogin({ email, password }) {
    AuthView.setLoading('btn-login', true);
    setTimeout(() => {
      const result = UserModel.login({ email, password });
      AuthView.setLoading('btn-login', false);
      if (!result.success) {
        AuthView.showError('login-error', result.error);
        return;
      }
      if (result.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 400);
  }

function handleRegister({ name, email, password, confirm }) {
    const emailRegisto = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegisto.test(email)) {
      AuthView.showError('reg-email-error', 'Introduz um email válido.');
      return;
    }

    if (password !== confirm) {
      AuthView.showError('reg-confirm-error', 'As palavras-passe não coincidem.');
      return;
    }
    AuthView.setLoading('btn-register', true);

    setTimeout(() => {
      const result = UserModel.register({ name, email, password });
      AuthView.setLoading('btn-register', false);

      if (!result.success) {
        AuthView.showError('reg-email-error', result.error);
        return;
      }
      window.location.href = 'dashboard.html';
    }, 400);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => AuthController.init());