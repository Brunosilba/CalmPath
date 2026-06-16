const DashboardModel = (() => {

  function getUser() {
    const user = JSON.parse(localStorage.getItem('cp_current_user'));
    return user || null;
  }

  function saveUser(user) {
    localStorage.setItem('cp_current_user', JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem('cp_users')) || [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem('cp_users', JSON.stringify(users));
    }
  }

  function getRecentActivities() {
    const user = getUser();
    if (!user) return [];
    return (user.activityHistory || []).slice(-5).reverse();
  }

  function getDailyChallenge() {
    const challenges = [
      { id: 'sim-01', title: 'Inicia uma conversa', desc: 'Fala com alguém que não conheces bem hoje.', xp: 30, icon: 'ti-messages' },
      { id: 'breath-01', title: 'Respiração 4-7-8', desc: 'Faz 3 ciclos da técnica de respiração 4-7-8.', xp: 20, icon: 'ti-lungs' },
      { id: 'sim-02', title: 'Fala em público', desc: 'Partilha uma opinião numa conversa de grupo.', xp: 40, icon: 'ti-speakerphone' },
      { id: 'challenge-01', title: 'Elogia alguém', desc: 'Faz um elogio genuíno a uma pessoa hoje.', xp: 25, icon: 'ti-heart' },
      { id: 'challenge-02', title: 'Sai da zona de conforto', desc: 'Faz algo pequeno que normalmente evitarias.', xp: 35, icon: 'ti-flame' },
      { id: 'quiz-01', title: 'Regista as tuas emoções', desc: 'Escreve como te sentiste hoje e porquê.', xp: 15, icon: 'ti-notebook' },
      { id: 'sim-03', title: 'Simulação social', desc: 'Completa uma simulação de apresentação.', xp: 50, icon: 'ti-users' },
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return challenges[dayOfYear % challenges.length];
  }

  async function getRecommendedActivities() {
    const user = getUser();
    let all = [];
    try {
      const res = await fetch('../data/activities.json');
      all = await res.json();
    } catch (e) {
      console.warn('Erro ao carregar atividades:', e);
      return [];
    }
    const doneIds = (user?.activityHistory || []).slice(-10).map(a => a.id);
    const notDone = all.filter(a => !doneIds.includes(a.id));
    return (notDone.length >= 3 ? notDone : all).slice(0, 3);
  }

  function completeActivity(activity) {
    const user = getUser();
    if (!user) return;
    user.xp = (user.xp || 0) + activity.xp;
    user.level = Math.floor(user.xp / 100) + 1;
    user.activityHistory = user.activityHistory || [];
    user.activityHistory.push({
      id: activity.id,
      title: activity.title,
      xp: activity.xp,
      completedAt: new Date().toISOString(),
    });
    user.badges = user.badges || [];
    if (user.activityHistory.length === 1 && !user.badges.includes('primeiro_passo')) {
      user.badges.push('primeiro_passo');
    }
    if (user.activityHistory.length === 5 && !user.badges.includes('cinco_atividades')) {
      user.badges.push('cinco_atividades');
    }
    saveUser(user);
    return user;
  }

  function getXpProgress() {
    const user = getUser();
    const xp = user?.xp || 0;
    const level = user?.level || 1;
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const progress = Math.round(((xp - xpForCurrentLevel) / 100) * 100);
    return { xp, level, progress, xpForNextLevel };
  }

  const BADGES = {
    primeiro_passo:   { label: 'Primeiro passo', icon: 'ti-shoe' },
    cinco_atividades: { label: '5 atividades',   icon: 'ti-star' },
  };

  function getBadges() {
    const user = getUser();
    return (user?.badges || []).map(id => ({ id, ...BADGES[id] }));
  }

  function getStats() {
    const user = getUser();
    if (!user) return { totalActivities: 0, streak: 0, totalXp: 0, level: 1 };
    const history = user.activityHistory || [];
    let streak = 0;
    if (history.length > 0) {
      const today = new Date().toDateString();
      const dates = history
        .map(a => new Date(a.completedAt).toDateString())
        .filter((d, i, arr) => arr.indexOf(d) === i)
        .reverse();
      if (dates[0] === today || dates[0] === new Date(Date.now() - 86400000).toDateString()) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diff = (prev - curr) / 86400000;
          if (Math.round(diff) === 1) streak++;
          else break;
        }
      }
    }
    return {
      totalActivities: history.length,
      streak,
      totalXp: user.xp || 0,
      level: user.level || 1,
    };
  }

  function saveEmotionalLog(emoji, label, note) {
    const user = getUser();
    if (!user) return;
    user.emotionalLog = user.emotionalLog || [];
    user.emotionalLog.push({
      emoji,
      label,
      note: note || '',
      registeredAt: new Date().toISOString(),
    });
    saveUser(user);
  }

  function getEmotionalLog() {
    const user = getUser();
    if (!user) return [];
    return (user.emotionalLog || []).slice(-5).reverse();
  }

  return {
    getUser,
    getRecentActivities,
    getDailyChallenge,
    getRecommendedActivities,
    completeActivity,
    getXpProgress,
    getBadges,
    getStats,
    saveEmotionalLog,
    getEmotionalLog,
  };
})();