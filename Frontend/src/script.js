const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
menuToggle.addEventListener('click', () => {
  sideMenu.classList.toggle('open');
});

const toggle = document.getElementById('theme-toggle');
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

/* Login animáció */
const loginBtn = document.getElementById('login-btn');
const mid = document.getElementById('mid');
const loginForm = document.getElementById('login-form');
const form = document.getElementById('loginForm');

loginBtn.addEventListener('click', () => {
  loginBtn.classList.add('slide-out'); // gomb kicsúszik
  mid.classList.add('hide'); // középső tartalom eltűnik
  setTimeout(() => {
    loginForm.classList.add('active'); // login form előjön
  }, 600);
});

form.addEventListener('submit', (e) => {
  e.preventDefault(); // ne frissítsen
  window.location.href = "main.html"; // átirányítás
});