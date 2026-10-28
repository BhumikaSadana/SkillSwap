renderNav('skills.html');

const box = document.getElementById('alertBox');
const showMsg = (msg, type = 'danger') => {
  box.className = `alert alert-${type}`;
  box.textContent = msg;
};

// Learn select karne par proof fields chhupa do
document.querySelectorAll('input[name="type"]').forEach((r) =>
  r.addEventListener('change', () => {
    document.getElementById('proofBox').style.display = r.value === 'teach' ? 'block' : 'none';
  })
);

const statusPill = {
  pending: '<span class="pill amber">Pending review</span>',
  approved: '<span class="pill green">Verified</span>',
  rejected: '<span class="pill red">Rejected</span>',
};

async function loadSkills() {
  const { skills } = await api('/skills/my');
  const teach = skills.filter((s) => s.type === 'teach');
  const learn = skills.filter((s) => s.type === 'learn');

  document.getElementById('teachList').innerHTML = teach.length
    ? teach.map((s) => `
        <div class="row-item">
          <div class="avatar-sm" style="background:#cfeee2">${s.name.slice(0, 2).toUpperCase()}</div>
          <div class="flex-grow-1">
            <b class="text-capitalize">${s.name}</b>
            <small class="d-block text-muted">
              ${s.proofFile ? `<a class="auth-link" target="_blank" href="http://localhost:5000/uploads/${s.proofFile}">View file</a>` : ''}
              ${s.proofLink ? `<a class="auth-link" target="_blank" href="${s.proofLink}">View link</a>` : ''}
            </small>
          </div>
          ${statusPill[s.status]}
        </div>`).join('')
    : '<p class="text-muted">No teaching skills yet. Add one on the left.</p>';

  document.getElementById('learnList').innerHTML = learn.length
    ? `<div class="d-flex flex-wrap gap-2 pt-1">${learn.map((s) => `<span class="pill purple text-capitalize" style="font-size:.9rem;padding:8px 16px">${s.name}</span>`).join('')}</div>`
    : '<p class="text-muted">Nothing here yet. Add what you want to learn.</p>';
}

document.getElementById('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = document.querySelector('input[name="type"]:checked').value;

  const fd = new FormData();
  fd.append('name', document.getElementById('skillName').value);
  fd.append('type', type);
  if (type === 'teach') {
    fd.append('proofLink', document.getElementById('proofLink').value);
    const file = document.getElementById('proofFile').files[0];
    if (file) fd.append('proof', file);
  }

  try {
    const data = await api('/skills', { method: 'POST', body: fd });
    showMsg(
      type === 'teach' ? 'Skill sent for admin review.' : data.message,
      'success'
    );
    e.target.reset();
    document.getElementById('proofBox').style.display = 'block';
    loadSkills();
  } catch (err) {
    showMsg(err.message);
  }
});

loadSkills().catch((err) => /token|authorized/i.test(err.message) && logout());