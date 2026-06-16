const DashboardController = (() => {
  let currentActivity = null;

  function init() {
    if (!UserModel.isLoggedIn()) {
      window.location.href = 'auth.html';
      return;
    }
    const user = DashboardModel.getUser();
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
    render();
    DashboardView.bindCompleteButtons(handleComplete);
    DashboardView.bindStartButtons(handleStart);
    document.addEventListener('activityComplete', e => {
      handleComplete(e.detail);
      ActivitiesView.hideModal();
    });
    ActivitiesView.bindModalClose();
    DashboardView.bindLogout(handleLogout);
    DashboardView.bindEmotionButtons();
    DashboardView.bindModalSubmit(handleModalSubmit);
    DashboardView.bindModalSkip(handleModalSkip);
    NotificationController.init();
  }

  async function render() {
    const user = DashboardModel.getUser();
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
    const xpData = DashboardModel.getXpProgress();
    DashboardView.renderHeader(user, xpData);
    DashboardView.renderStats(DashboardModel.getStats());
    DashboardView.renderDailyChallenge(DashboardModel.getDailyChallenge());
    DashboardView.renderRecommended(await DashboardModel.getRecommendedActivities());
    DashboardView.renderRecentActivities(DashboardModel.getRecentActivities());
    DashboardView.renderBadges(DashboardModel.getBadges());
    DashboardView.renderEmotionalLog(DashboardModel.getEmotionalLog());
  }

  function handleComplete(activity) {
    if (!activity || !activity.title) return;
    currentActivity = activity;
    const before = DashboardModel.getUser().badges?.length || 0;
    DashboardModel.completeActivity(activity);
    const after = DashboardModel.getUser().badges?.length || 0;
    NotificationController.notify({
      type: 'xp',
      message: `Ganhaste XP ao completar "${activity.title}"!`,
      icon: 'ti-bolt',
    });
    if (after > before) {
      const newBadge = DashboardModel.getUser().badges[after - 1];
      NotificationController.notify({
        type: 'badge',
        message: `Nova conquista desbloqueada: ${newBadge?.label || 'Badge'}! 🏅`,
        icon: 'ti-medal',
      });
    }
    DashboardView.showCelebrationModal(activity);
  }

  function handleModalSubmit() {
    const emotionData = DashboardView.getModalEmotionData();
    if (emotionData) {
      DashboardModel.saveEmotionalLog(emotionData.emoji, emotionData.label, emotionData.note);
    }
    DashboardView.hideCelebrationModal();
    currentActivity = null;
    render();
  }

  function handleModalSkip() {
    DashboardView.hideCelebrationModal();
    currentActivity = null;
    render();
  }

  function handleLogout() {
    UserModel.logout();
    window.location.href = '../landingPage.html';
  }

  async function handleStart(activityId) {
    const res = await fetch('../data/activities.json');
    const all = await res.json();
    const activity = all.find(a => a.id === activityId);
    if (!activity) return;
    const type = activity.type;
    if (type === 'simulation')     ActivitiesView.showSimulationModal(activity);
    else if (type === 'breathing') ActivitiesView.showBreathingModal(activity);
    else if (type === 'quiz')      ActivitiesView.showQuizModal(activity);
    else                           ActivitiesView.showChallengeModal(activity);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => DashboardController.init());