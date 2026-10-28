const alertBox = document.getElementById('alertBox');
const showMsg = (msg, type = 'danger') => {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = msg;
};

const loginForm = document.getElementById('loginForm');
if (new URLSearchParams(location.search).get('registered') && alertBox) {
  showMsg('Account created. Log in to continue.', 'success');
}
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    } catch (err) {
      showMsg(err.message);
    }
  });
}
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        }),
      });
      location.href = 'login.html?registered=1';
    } catch (err) {
      showMsg(err.message);
    }
  });
}