renderNav('sessions.html');
const me = getUser();
const box = document.getElementById('alertBox');
const showMsg = (msg, type = 'danger') => {
  box.className = `alert alert-${type}`;
  box.textContent = msg;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById('slotDate').min = new Date().toISOString().split('T')[0];

const statusPill = {
  available: '<span class="pill amber">Open slot</span>',
  booked: '<span class="pill purple">Booked</span>',
  completed: '<span class="pill green">Completed</span>',
};

// Meri verified skills dropdown mein
async function loadMySkills() {
  const { skills } = await api('/skills/my');
  const ok = skills.filter((s) => s.type === 'teach' && s.status === 'approved');
  document.getElementById('slotSkill').innerHTML = ok.length
    ? ok.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')
    : '<option value="">No verified skills yet</option>';
}

async function loadAvailable() {
  const skill = document.getElementById('filterSkill').value.trim();
  const { slots } = await api(`/sessions/available${skill ? `?skill=${encodeURIComponent(skill)}` : ''}`);
  document.getElementById('available').innerHTML = slots.length
    ? slots.map((s) => `
        <div class="row-item">
          <div class="avatar-sm" style="background:#ffe7a8">${s.teacherName.slice(0, 2).toUpperCase()}</div>
          <div class="flex-grow-1">
            <b class="text-capitalize">${s.skill}</b> <small class="text-muted">by ${s.teacherName}</small>
            <small class="d-block text-muted">${s.date} at ${s.time}</small>
          </div>
          <button class="btn-main" style="padding:6px 18px;font-size:.85rem" onclick="book('${s.id}')">Book (1 credit)</button>
        </div>`).join('')
    : '<p class="text-muted">No open slots found.</p>';
}

async function loadMine() {
  const { sessions } = await api('/sessions/my');
  document.getElementById('mySessions').innerHTML = sessions.length
    ? sessions.map((s) => {
        const teaching = s.teacherId === me.id;
        const other = teaching ? s.learnerName : s.teacherName;
        let action = '';
        if (s.status === 'booked') {
          action += `<a class="btn-soft sm" target="_blank" href="${s.meetLink}">Join call</a> `;
          if (teaching) action += `<button class="btn-main" style="padding:6px 16px;font-size:.85rem" onclick="complete('${s.id}')">Mark complete</button>`;
        }
        if (s.status === 'completed' && !teaching && !s.hasFeedback) {
          action += `<button class="btn-main" style="padding:6px 16px;font-size:.85rem" onclick="feedback('${s.id}')">Rate</button>`;
        }
        return `
          <div class="row-item">
            <div class="avatar-sm" style="background:${teaching ? '#cfeee2' : '#e6dcfb'}">${s.skill.slice(0, 2).toUpperCase()}</div>
            <div class="flex-grow-1">
              <b class="text-capitalize">${s.skill}</b>
              <small class="d-block text-muted">${teaching ? 'You teach' : 'You learn from'}${other ? ' ' + (teaching ? 'to ' : '') + other : ''} · ${s.date} at ${s.time}</small>
            </div>
            ${statusPill[s.status] || ''}
            <div class="d-flex gap-1">${action}</div>
          </div>`;
      }).join('')
    : '<p class="text-muted">No sessions yet. Create a slot or book one.</p>';
}

async function refreshAll() {
  await Promise.all([loadAvailable(), loadMine()]);
}

window.book = async (id) => {
  try {
    await api(`/sessions/${id}/book`, { method: 'POST' });
    showMsg('Session booked. Join link is in My sessions.', 'success');
    refreshAll();
  } catch (e) { showMsg(e.message); }
};

window.complete = async (id) => {
  if (!confirm('Mark complete? 1 credit moves from learner to you.')) return;
  try {
    await api(`/sessions/${id}/complete`, { method: 'PUT' });
    showMsg('Session completed. You earned 1 credit.', 'success');
    refreshAll();
  } catch (e) { showMsg(e.message); }
};

window.feedback = async (id) => {
  const rating = prompt('Rate this session from 1 to 5');
  if (!rating) return;
  const comment = prompt('Add a short comment (optional)') || '';
  try {
    await api(`/feedback/${id}`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
    showMsg('Thanks for your feedback.', 'success');
    loadMine();
  } catch (e) { showMsg(e.message); }
};

document.getElementById('slotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/sessions/availability', {
      method: 'POST',
      body: JSON.stringify({
        skillId: document.getElementById('slotSkill').value,
        date: document.getElementById('slotDate').value,
        time: document.getElementById('slotTime').value,
        meetLink: document.getElementById('slotLink').value,
      }),
    });
    showMsg('Slot created. Learners can book it now.', 'success');
    e.target.reset();
    loadMine();
  } catch (err) { showMsg(err.message); }
});

document.getElementById('filterBtn').addEventListener('click', loadAvailable);

const qs = new URLSearchParams(location.search).get('skill');
if (qs) document.getElementById('filterSkill').value = qs;

loadMySkills();
refreshAll().catch((err) => /token|authorized/i.test(err.message) && logout());