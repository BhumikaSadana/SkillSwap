const me = getUser();
if (me.role !== 'admin') location.href = 'dashboard.html';

// Admin ka alag simple navbar
document.getElementById('navbar').innerHTML = `
  <div class="container nav-wrap d-flex justify-content-between align-items-center">
    <a href="admin.html" class="brand">Skill<span>Swap</span> <small class="pill purple">Admin</small></a>
    <button class="btn-soft" style="padding:7px 18px" onclick="logout()">Log out</button>
  </div>`;

const box = document.getElementById('alertBox');
const showMsg = (msg, type = 'danger') => {
  box.className = `alert alert-${type}`;
  box.textContent = msg;
};

const pillOf = {
  pending: '<span class="pill amber">Pending</span>',
  approved: '<span class="pill green">Verified</span>',
  rejected: '<span class="pill red">Rejected</span>',
};

async function loadStats() {
  const s = await api('/admin/stats');
  document.getElementById('stUsers').textContent = s.totalUsers;
  document.getElementById('stPending').textContent = s.pendingSkills;
  document.getElementById('stApproved').textContent = s.approvedSkills;
  document.getElementById('stSessions').textContent = s.totalSessions;
  document.getElementById('stDone').textContent = s.completedSessions;
}

async function loadSkills() {
  const status = document.querySelector('input[name="flt"]:checked').value;
  const { skills } = await api(`/admin/skills?status=${status}`);

  document.getElementById('skillList').innerHTML = skills.length
    ? skills.map((s) => `
        <div class="row-item">
          <div class="avatar-sm" style="background:#cfeee2">${s.name.slice(0, 2).toUpperCase()}</div>
          <div class="flex-grow-1">
            <b class="text-capitalize">${s.name}</b> <small class="text-muted">by ${s.userName} (${s.userEmail})</small>
            <small class="d-block">
              ${s.proofFile ? `<a class="auth-link" target="_blank" href="http://localhost:5000/uploads/${s.proofFile}">View uploaded proof</a>` : ''}
              ${s.proofLink ? `<a class="auth-link ms-2" target="_blank" href="${s.proofLink}">Open proof link</a>` : ''}
            </small>
          </div>
          ${pillOf[s.status]}
          <div class="d-flex gap-1">
            ${s.status !== 'approved' ? `<button class="btn-main" style="padding:6px 16px;font-size:.85rem" onclick="review('${s.id}','approved')">Approve</button>` : ''}
            ${s.status !== 'rejected' ? `<button class="btn-soft sm" onclick="review('${s.id}','rejected')">Reject</button>` : ''}
          </div>
        </div>`).join('')
    : `<p class="text-muted">No ${status} skills.</p>`;
}

async function loadUsers() {
  const { users } = await api('/admin/users');
  document.getElementById('userList').innerHTML = users.map((u) => `
    <div class="row-item">
      <div class="avatar-sm" style="background:#e6dcfb">${u.name.slice(0, 2).toUpperCase()}</div>
      <div class="flex-grow-1">
        <b>${u.name}</b>
        <small class="d-block text-muted">${u.email}</small>
      </div>
      <span class="pill ${u.role === 'admin' ? 'purple' : 'green'}">${u.role}</span>
      <span class="pill amber">${u.credits} credits</span>
    </div>`).join('');
}

window.review = async (id, status) => {
  try {
    await api(`/admin/skills/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    showMsg(`Skill ${status}.`, 'success');
    loadStats();
    loadSkills();
  } catch (e) { showMsg(e.message); }
};

document.querySelectorAll('input[name="flt"]').forEach((r) => r.addEventListener('change', loadSkills));

Promise.all([loadStats(), loadSkills(), loadUsers()]).catch((err) => {
  if (/token|authorized|denied/i.test(err.message)) logout();
  else showMsg(err.message);
});