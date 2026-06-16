// profileController.js — Controller da página de perfil (MVC)

const ProfileController = (() => {

  async function init() {
    if (!UserModel.isLoggedIn()) {
      window.location.href = 'auth.html';
      return;
    }

    const user  = ProfileModel.getUser();
    const stats = ProfileModel.getStats();

    ProfileView.renderHeader(user, stats);
    ProfileView.fillEditForm(user);
    ProfileView.bindTabs();

    // carregar favoritos (precisa do JSON de atividades)
    await _loadAndRenderFavorites();

    ProfileView.renderEmotionalLog(ProfileModel.getFullEmotionalLog());
    ProfileView.renderGoals(ProfileModel.getGoals());

    // bindings
    ProfileView.bindEditForm(handleEditProfile);
    ProfileView.bindPasswordForm(handleChangePassword);
    ProfileView.bindRemoveFav(handleRemoveFav);
    ProfileView.bindGoalAdd(handleAddGoal);
    ProfileView.bindGoalToggle(handleToggleGoal);
    ProfileView.bindGoalDelete(handleDeleteGoal);
    ProfileView.bindLogout(handleLogout);
    NotificationController.init();
  }

  async function _loadAndRenderFavorites() {
    const ids = ProfileModel.getFavoriteIds();
    let activities = [];
    try {
      const res = await fetch('../data/activities.json');
      const all = await res.json();
      activities = all.filter(a => ids.includes(a.id));
    } catch (e) {
      activities = [];
    }
    ProfileView.renderFavorites(activities);
  }

  function handleEditProfile({ name, email }) {
    const result = ProfileModel.updateProfile({ name, email });
    if (!result.success) {
      ProfileView.showFieldMsg('edit-msg', result.error, 'error');
      return;
    }
    ProfileView.showFieldMsg('edit-msg', 'Perfil atualizado com sucesso!', 'success');
    ProfileView.renderHeader(result.user, ProfileModel.getStats());
    ProfileView.fillEditForm(result.user);
  }

  function handleChangePassword(data) {
    const result = ProfileModel.changePassword(data);
    if (!result.success) {
      ProfileView.showFieldMsg('pwd-msg', result.error, 'error');
      return;
    }
    ProfileView.showFieldMsg('pwd-msg', 'Palavra-passe alterada com sucesso!', 'success');
    ProfileView.clearPasswordForm();
  }

  function handleRemoveFav(id) {
    ProfileModel.removeFavorite(id);
    ProfileView.removeFavRow(id);
    ProfileView.showToast('Removido dos favoritos');
  }

  function handleAddGoal(text) {
    if (!text) return;
    const result = ProfileModel.addGoal(text);
    if (result.success) ProfileView.renderGoals(ProfileModel.getGoals());
  }

  function handleToggleGoal(id) {
    ProfileModel.toggleGoal(id);
    ProfileView.renderGoals(ProfileModel.getGoals());
  }

  function handleDeleteGoal(id) {
    ProfileModel.deleteGoal(id);
    ProfileView.renderGoals(ProfileModel.getGoals());
  }

  function handleLogout() {
    UserModel.logout();
    window.location.href = '\landingPage.html';
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ProfileController.init());