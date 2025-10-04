window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    const main = document.getElementById('main-content');
    loader.style.display = 'none';
    main.style.opacity = '1';
  }, 1000);
});

function showPopup(message) {
  document.getElementById('popupMessage').innerText = message;
  document.getElementById('messagePopup').classList.remove('hidden');
}

function closePopup() {
  document.getElementById('messagePopup').classList.add('hidden');
}


const BIN_ID = '68344ecd8a456b7966a583dd';
const API_KEY = '$2a$10$zyQpm6tNv6SvPgWM2E1D1eDfvL1zWu8pc2YI1prGoUikZKK4Zwhd.';

// Track login attempts
let loginAttempts = 0;
const maxAttempts = 3;

async function loginUser() {
  const email = document.getElementById('loginEmailId').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showPopup('⚠️ Please enter both Email and Password.');
    return;
  }

  if (loginAttempts >= maxAttempts) {
    showPopup('🚫 You have reached the maximum number of login attempts.');
    return;
  }

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data.');
    }

    const data = await response.json();
    const users = Array.isArray(data.record) ? data.record : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const popup = document.getElementById('popup');
      popup.classList.remove('hidden');

      sessionStorage.setItem('loggedInUser', JSON.stringify(user));

      setTimeout(() => {
        window.location.href = 'healthid.html';
      }, 2000);
    } else {
      loginAttempts++;
      const remainingAttempts = maxAttempts - loginAttempts;

      if (remainingAttempts > 0) {
        showPopup(`❌ Invalid credentials. ${remainingAttempts} attempt(s) left.`);
      } else {
        showPopup('🚫 You have reached the maximum number of login attempts.');
      }
    }
  } catch (error) {
    console.error(error);
    alert('Failed to fetch user data.');
  }
}
