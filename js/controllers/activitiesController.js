// activitiesController.js — Controller do catálogo de atividades (MVC)

const ActivitiesController = (() => {

  let _activeCategory = 'Todas';
  let _searchQuery = '';

  async function init() {
    if (!UserModel.isLoggedIn()) {
      window.location.href = 'auth.html';
      return;
    }

    await ActivitiesModel.loadActivities();

    ActivitiesView.renderFilters(ActivitiesModel.getCategories(), _activeCategory);
    _renderGrid();

    ActivitiesView.bindFilters(handleFilter);
    ActivitiesView.bindSearch(handleSearch);
    ActivitiesView.bindFavButtons(handleFav);
    ActivitiesView.bindStartButtons(handleStart);
    ActivitiesView.bindModalClose();
    NotificationController.init();

    document.addEventListener('activityComplete', handleActivityComplete);

    document.getElementById('btn-logout')?.addEventListener('click', () => {
      UserModel.logout();
      window.location.href = '../index.html';
    });

    const user = UserModel.getCurrentUser();
    const navName = document.getElementById('nav-username');
    if (navName) navName.textContent = user?.name?.split(' ')[0] || '';
  }

  function _renderGrid() {
    const activities = _searchQuery
      ? ActivitiesModel.search(_searchQuery)
      : ActivitiesModel.getByCategory(_activeCategory);

    ActivitiesView.renderGrid(activities, ActivitiesModel.getFavoriteIds(), ActivitiesModel.isCompleted);
  }

  function handleFilter(category) {
    _activeCategory = category;
    _searchQuery = '';
    const searchEl = document.getElementById('search-input');
    if (searchEl) searchEl.value = '';
    ActivitiesView.renderFilters(ActivitiesModel.getCategories(), category);
    _renderGrid();
  }

  function handleSearch(query) {
    _searchQuery = query;
    _renderGrid();
  }

  function handleFav(id) {
    const isFav = ActivitiesModel.toggleFavorite(id);
    ActivitiesView.updateFavButton(id, isFav);
    ActivitiesView.showToast(isFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  }

  function handleStart(id) {
    const activity = ActivitiesModel.getById(id);
    if (!activity) return;
    if (activity.type === 'simulation') ActivitiesView.showSimulationModal(activity);
    else if (activity.type === 'breathing') ActivitiesView.showBreathingModal(activity);
    else if (activity.type === 'quiz')      ActivitiesView.showQuizModal(activity);
    else if (activity.type === 'challenge') ActivitiesView.showChallengeModal(activity);
  }

  function handleActivityComplete(e) {
    const activity = e.detail;
    ActivitiesView.hideModal();
    DashboardModel.completeActivity(activity);
    ActivitiesView.showToast(`+${activity.xp} XP ganhos! Continua assim.`);
    _renderGrid();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => ActivitiesController.init());