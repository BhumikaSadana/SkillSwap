if (!getToken()) location.href = 'login.html';

function renderNav(active) {
  const u = getUser();
  const links = [
    ['dashboard.html', 'Dashboard'],
    ['skills.html', 'My skills'],
    ['sessions.html', 'Sessions'],
  ];
  document.getElementById('navbar').innerHTML = `
    <div class="container nav-wrap d-flex justify-content-between align-items-center">
      <a href="dashboard.html" class="brand">Skill<span>Swap</span></a>
      <div class="d-none d-md-block">
        ${links.map(([h, t]) => `<a href="${h}" class="nav-link-x ${active === h ? 'active' : ''}">${t}</a>`).join('')}
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="avatar-sm">${u.name.slice(0, 2).toUpperCase()}</div>
        <button class="btn-soft" style="padding:7px 18px" onclick="logout()">Log out</button>
      </div>
    </div>`;
}