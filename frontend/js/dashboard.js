renderNav('dashboard.html');

const colors = ['#cfeee2', '#ffe7a8', '#e6dcfb', '#ffdad3'];
const initials = (n) => n.slice(0, 2).toUpperCase();

(async () => {
  try {
    const me = (await api('/auth/me')).user;
    if (me.role === 'admin') return (location.href = 'admin.html');

    const [{ profile }, match, sess] = await Promise.all([
      api(`/profile/${me.id}`),
      api('/match'),
      api('/sessions/my'),
    ]);

    document.getElementById('hello').textContent = `Hi ${me.name}, ready to swap?`;
    document.getElementById('credits').textContent = me.credits;
    document.getElementById('sTaught').textContent = profile.sessionsTaught;
    document.getElementById('sLearned').textContent = profile.sessionsLearned;
    document.getElementById('sRating').textContent = profile.averageRating;
    document.getElementById('sVerified').textContent = profile.verifiedSkills.length;

    // Matches
    const mBox = document.getElementById('matches');
    mBox.innerHTML = match.matches.length
      ? match.matches.slice(0, 4).map((m, i) => `
          <div class="row-item">
            <div class="avatar-sm" style="background:${colors[i % 4]}">${initials(m.teacherName)}</div>
            <div class="flex-grow-1">
              <b>${m.teacherName}</b>
              <small class="d-block text-muted">Teaches ${m.skill}</small>
            </div>
            ${m.mutual ? '<span class="pill green">Mutual match</span>' : ''}
            <a class="btn-soft sm" href="sessions.html?skill=${encodeURIComponent(m.skill)}">Book</a>
          </div>`).join('')
      : `<p class="text-muted">No matches yet. Add what you want to learn in <a href="skills.html" class="auth-link">My skills</a>.</p>`;

    // Upcoming
    const upcoming = sess.sessions.filter((s) => s.status === 'booked');
    document.getElementById('upcoming').innerHTML = upcoming.length
      ? upcoming.map((s) => `
          <div class="row-item">
            <div class="avatar-sm" style="background:#e6dcfb">${s.skill.slice(0, 2).toUpperCase()}</div>
            <div class="flex-grow-1">
              <b class="text-capitalize">${s.skill}</b>
              <small class="d-block text-muted">${s.date} at ${s.time}</small>
            </div>
            <span class="pill ${s.teacherId === me.id ? 'purple' : 'green'}">${s.teacherId === me.id ? 'You teach' : 'You learn'}</span>
          </div>`).join('')
      : `<p class="text-muted">No upcoming sessions. Find one in <a href="sessions.html" class="auth-link">Sessions</a>.</p>`;

          // Getting started checklist
    const mine = (await api('/skills/my')).skills;
    const steps = [
      ['Add a skill you can teach', mine.some((s) => s.type === 'teach')],
      ['Get a skill verified by admin', mine.some((s) => s.type === 'teach' && s.status === 'approved')],
      ['Add something you want to learn', mine.some((s) => s.type === 'learn')],
      ['Book or create your first session', sess.sessions.length > 0],
      ['Complete a session', profile.sessionsTaught + profile.sessionsLearned > 0],
    ];
    const done = steps.filter((s) => s[1]).length;
    document.getElementById('progBar').style.width = `${(done / steps.length) * 100}%`;
    document.getElementById('checklist').innerHTML = steps.map(([t, ok]) => `
      <div class="check-row ${ok ? 'done' : ''}">
        <span class="check-dot">${ok ? '✓' : ''}</span>${t}
      </div>`).join('');
  } catch (err) {
    if (/token|authorized/i.test(err.message)) logout();
    else alert(err.message);
  }
})();