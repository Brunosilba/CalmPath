// LandingController.js — coordena Model e View na landing page

const LandingController = (() => {

  function init() {
    const user = UserModel.getCurrentUser();
    LandingView.updateNavForUser(user);
    LandingView.bindLogout(handleLogout);
    animateProgressBar();
  }

  function handleLogout() {
    UserModel.logout();
    LandingView.updateNavForUser(null);
    LandingView.showNotification('Sessão terminada com sucesso.', 'success');
  }

  function animateProgressBar() {
    const fill = document.getElementById('prog-fill');
    if (!fill) return;
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.transition = 'width 1.2s ease';
      fill.style.width = '42%';
    }, 400);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => LandingController.init());
