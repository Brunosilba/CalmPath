

const AdminController = (() => {

  async function init() {
    
    if (!UserModel.isLoggedIn()) { window.location.href = 'auth.html'; return; }
    if (!AdminModel.isAdmin())   { window.location.href = 'dashboard.html'; return; }

    const current = AdminModel.getCurrentUser();
    const navName = document.getElementById('nav-username');
    if (navName) navName.textContent = current?.name?.split(' ')[0] || 'Admin';

    await AdminModel.loadActivities();

    
    _renderStats();
    _renderUsers();
    _renderActivities();

    // tabs
    AdminView.bindTabs();

    // bindings utilizadores
    AdminView.bindUserSearch(q => AdminView.filterUsersTable(q));
    AdminView.bindUserTableActions(handleEditUser, handleResetPassword, handleDeleteUser);
    AdminView.bindUserModalSave(handleSaveUser);

    // bindings atividades
    AdminView.bindActSearch(q => AdminView.filterActivitiesTable(q));
    AdminView.bindNewActivity(() => AdminView.showActivityModal(null));
    AdminView.bindActTableActions(handleEditActivity, handleDeleteActivity);
    AdminView.bindActModalSave(handleSaveActivity);

    // fechar modais
    AdminView.bindModalCloses();

    // logout
    AdminView.bindLogout(() => { UserModel.logout(); window.location.href = '\landingPage.html'; });
  }

  function _renderStats() {
    AdminView.renderStats(AdminModel.getGlobalStats());
  }

  function _renderUsers() {
    AdminView.renderUsers(AdminModel.getUsers());
  }

  function _renderActivities() {
    AdminView.renderActivities(AdminModel.getActivities());
  }

  // ── Utilizadores 
  function handleEditUser(id) {
    const user = AdminModel.getUserById(id);
    if (user) AdminView.showUserModal(user);
  }

  function handleSaveUser({ id, name, email, role }) {
    if (!name || !email) {
      AdminView.showModalMsg('user-modal-msg', 'Nome e email são obrigatórios.', 'error');
      return;
    }
    const result = AdminModel.updateUser(id, { name, email, role });
    if (!result.success) {
      AdminView.showModalMsg('user-modal-msg', result.error, 'error');
      return;
    }
    AdminView.hideModal('user-modal');
    AdminView.showToast('Utilizador atualizado com sucesso.');
    _renderUsers();
    _renderStats();
  }

  function handleResetPassword(id) {
    AdminView.showConfirmModal(
      'Repor a palavra-passe para "calmpath123"?',
      () => {
        const result = AdminModel.resetUserPassword(id);
        AdminView.showToast(result.success ? 'Palavra-passe reposta para "calmpath123".' : result.error, result.success ? 'success' : 'error');
      }
    );
  }

  function handleDeleteUser(id) {
    AdminView.showConfirmModal(
      'Tens a certeza que queres eliminar este utilizador? Esta ação é irreversível.',
      () => {
        const result = AdminModel.deleteUser(id);
        AdminView.showToast(result.success ? 'Utilizador eliminado.' : result.error, result.success ? 'success' : 'error');
        if (result.success) { _renderUsers(); _renderStats(); }
      }
    );
  }

  // ── Atividades 
  function handleEditActivity(id) {
    const act = AdminModel.getActivityById(id);
    if (act) AdminView.showActivityModal(act);
  }

  function handleSaveActivity(data) {
    if (!data.title || !data.description) {
      AdminView.showModalMsg('act-modal-msg', 'Título e descrição são obrigatórios.', 'error');
      return;
    }
    const result = data.id
      ? AdminModel.updateActivity(data.id, data)
      : AdminModel.addActivity(data);

    if (!result.success) {
      AdminView.showModalMsg('act-modal-msg', result.error, 'error');
      return;
    }
    AdminView.hideModal('act-modal');
    AdminView.showToast(data.id ? 'Atividade atualizada.' : 'Atividade criada.');
    _renderActivities();
    _renderStats();
  }

  function handleDeleteActivity(id) {
    AdminView.showConfirmModal(
      'Tens a certeza que queres eliminar esta atividade?',
      () => {
        AdminModel.deleteActivity(id);
        AdminView.showToast('Atividade eliminada.');
        _renderActivities();
        _renderStats();
      }
    );
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => AdminController.init());