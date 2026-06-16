const UserModel = (() => {
  const KEYS = {
    currentUser: 'cp_current_user',
    users: 'cp_users',
  };

  // Seed do admin na inicialização
  function Admin() {
    const users = getUsers();
    if (!users.find(u => u.email === 'admin@gmail.com')) {
      users.push({
        id: 'admin',
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        xp: 0, level: 1, badges: [], favorites: [],
        activityHistory: [], emotionalLog: [], goals: [],
        notifications: [],
      });
      saveUsers(users);
    }
  }

  function getUsers() {
    return JSON.parse(localStorage.getItem(KEYS.users)) || [];
  }
  function saveUsers(users) {
    localStorage.setItem(KEYS.users, JSON.stringify(users));
  }
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem(KEYS.currentUser)) || null;
  }
  function setCurrentUser(user) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  }
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  function register({ name, email, password }) {
    if (!name || !email || !password) {
      return { success: false, error: 'Preenche todos os campos.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
    }
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Este email já está registado.' };
    }
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      xp: 0, level: 1, badges: [], favorites: [],
      activityHistory: [], emotionalLog: [], goals: [],
      notifications: [],
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  function login({ email, password }) {
    if (!email || !password) {
      return { success: false, error: 'Preenche todos os campos.' };
    }
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: 'Email ou palavra-passe incorretos.' };
    }
    setCurrentUser(user);
    return { success: true, user };
  }

  function logout() {
    localStorage.removeItem(KEYS.currentUser);
  }

  // Executa o seed ao carregar o módulo
  Admin();

  return { getCurrentUser, isLoggedIn, register, login, logout };
})();