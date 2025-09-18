function el(id) { return document.getElementById(id); }

const menuToggle = el('menu-toggle');
const sideMenu = el('side-menu');
if (menuToggle && sideMenu) {
  menuToggle.addEventListener('click', () => sideMenu.classList.toggle('open'));
}

const toggle = el('theme-toggle');
if (toggle) {
  toggle.addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.style.getPropertyValue('--bg') === '#0b1220';
    if (!isDark) {
      root.style.setProperty('--bg', '#0b1220');
      root.style.setProperty('--text', '#e6eef8');
      root.style.setProperty('--header-bg', '#071026');
      root.style.setProperty('--accent', '#7dd3fc');
    } else {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--text', '#111827');
      root.style.setProperty('--header-bg', '#f8fafc');
      root.style.setProperty('--accent', '#2563eb');
    }
  });
}

/* Login Form */
const loginBtn = el('login-btn');
const mid = el('mid');
const loginFormSection = el('login-form');
const loginForm = el('loginForm');

if (loginBtn && mid && loginFormSection && loginForm) {
  loginBtn.addEventListener('click', () => {
    loginBtn.classList.add('slide-out'); // gomb kicsúszik
    // register gomb jobbra kicsúszik
    if (registerBtn) registerBtn.classList.add('slide-out');
    mid.classList.add('hide'); // középső tartalom eltűnik
    setTimeout(() => loginFormSection.classList.add('active'), 600);
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // ne frissítsen
    window.location.href = 'main.html'; // átirányítás a main-re
  });
}

/* Register Form animáció  */
const registerBtn = el('register-btn');
const registerFormSection = el('register-form');
const registerForm = el('registerForm');
const toLogin = el('to-login');
const toRegister = el('to-register');

if (registerBtn && mid && registerFormSection) {
  registerBtn.addEventListener('click', () => {
    // gomb kicsúszások balra & jobra
    registerBtn.classList.add('slide-out');
    if (loginBtn) loginBtn.classList.add('slide-out');
    mid.classList.add('hide');
    setTimeout(() => registerFormSection.classList.add('active'), 600);
  });
}

if (toLogin && registerFormSection && loginFormSection) {
  toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    // register bezárása, login megnyitása
    registerFormSection.classList.remove('active');
    // gombok visszaállítása
    if (registerBtn) registerBtn.classList.remove('slide-out');
    if (loginBtn) loginBtn.classList.remove('slide-out');
    setTimeout(() => {
      loginFormSection.classList.add('active');
    }, 300);
  });
}

if (toRegister && loginFormSection && registerFormSection) {
  toRegister.addEventListener('click', (e) => {
    e.preventDefault();
    // login bezárása, register megnyitása
    loginFormSection.classList.remove('active');
    // gombok visszaállítása
    if (registerBtn) registerBtn.classList.add('slide-out');
    if (loginBtn) loginBtn.classList.add('slide-out');
    setTimeout(() => {
      registerFormSection.classList.add('active');
    }, 300);
  });
}

/* Register Form */
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = el('fullName').value.trim();
    const username = el('username').value.trim();
    const email = el('email').value.trim();
    const password = el('password').value;
    const confirm = el('confirmPassword').value;
    const role = el('role').value;

    if (!fullName || !username || !email || !password) {
      alert('Kérlek töltsd ki az összes mezőt.');
      return;
    }
    if (password.length < 6) {
      alert('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      return;
    }
    if (password !== confirm) {
      alert('A jelszavak nem egyeznek.');
      return;
    }

    // username check
    const users = JSON.parse(localStorage.getItem('sm_users') || '[]');
    if (users.find(u => u.username === username || u.email === email)) {
      alert('A felhasználónév vagy e-mail már foglalt.');
      return;
    }
  });
}