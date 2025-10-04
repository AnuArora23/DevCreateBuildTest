const BIN_ID = '68344ecd8a456b7966a583dd';
const API_KEY = '$2a$10$zyQpm6tNv6SvPgWM2E1D1eDfvL1zWu8pc2YI1prGoUikZKK4Zwhd.';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  // Add loader CSS globally once
  const style = document.createElement('style');
  style.innerHTML = `
    .loader {
      border: 8px solid #e5e7eb;
      border-top: 8px solid #3490dc;
      border-radius: 9999px;
      width: 6rem;
      height: 6rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
});

async function handleLogin(event) {
  event.preventDefault();
  const loginId = event.target.loginId.value.trim();
  const password = event.target.password.value;

  if (loginId === 'admin' && password === 'singh@armaan') {
    const main = document.getElementById('mainContent');
    main.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="loader"></div>
        <p class="text-white text-xl">Loading user data...</p>
      </div>
    `;

    await loadAllUsers();
  } else {
    alert('Invalid login ID or password');
  }
}

async function loadAllUsers() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-4">
      <div class="loader"></div>
      <p class="text-blue-900 text-xl">Loading all users...</p>
    </div>
  `;

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });

    if (!response.ok) throw new Error('Failed to fetch user data');

    const data = await response.json();
    const users = data.record || [];


    showAllUsers(users);
  } catch (error) {
    main.innerHTML = `<p class="text-red-500 text-center">Error loading user data: ${error.message}</p>`;
  }
}




    function renderSearchBar() {
      const main = document.getElementById('mainContent');

      // Remove existing search container if any
      const existingSearch = document.getElementById('searchContainer');
      if (existingSearch) existingSearch.remove();

      const searchContainer = document.createElement('div');
      searchContainer.id = 'searchContainer';
      searchContainer.className = 'max-w-3xl mx-auto mb-6 flex items-center gap-2';

      searchContainer.innerHTML = `
        <button 
          onclick="resetSearch()" 
          class="p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          title="Back"
        >
          ← Back
        </button>
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Search by name or Health ID..." 
          class="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onclick="searchUsers()" 
          class="p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition"
          title="Search"
        >
          🔍
        </button>
      `;

      main.appendChild(searchContainer);

      document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchUsers();
      });
    }

    function resetSearch() {
      const searchInput = document.getElementById('searchInput');
      if (!searchInput) return;

      searchInput.value = '';
      // Reload all users
      loadAllUsers(); // assuming you have a function to load and show all users
    }

function showAllUsers(users) {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';
  main.className = 'p-6 mt-20 min-h-screen';

  // Add Search Bar at the top
  renderSearchBar();

  const deleteAllBtn = document.getElementById('deleteAllBtn');

        if (users.length > 0) {
      deleteAllBtn.style.display = 'inline-block';

      users.sort((a, b) => {
        // Check if a or b is the default user (no fullName or 'User')
        const aIsDefault = !a.fullName || a.fullName === 'Default User';
        const bIsDefault = !b.fullName || b.fullName === 'Default User';

        if (aIsDefault && !bIsDefault) return 1;   // a should come after b
        if (!aIsDefault && bIsDefault) return -1;  // a should come before b

        // If both are default or both not default, sort by date desc
        return new Date(b.registeredAt) - new Date(a.registeredAt);
      });
    } else {
      deleteAllBtn.style.display = 'none';
      renderSearchBar();
      main.innerHTML += `<p class="text-center text-gray-700 text-xl mt-12">No users found matching your search.</p>`;
      return;
    }

  users.forEach(user => {
    const container = document.createElement('div');
    container.className = 'bg-white p-6 rounded-xl shadow-md mb-6 max-w-3xl mx-auto w-full text-blue-900';

    const date = new Date(user.registeredAt);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    container.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">${user.fullName || 'User'}</h3>
        <div class="flex gap-3">
          <button onclick="editUser('${user.healthId}')" title="Edit User">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 hover:text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v16h16V13m-5-9l5 5m-5-5v5h5" />
            </svg>
          </button>
          <button onclick="deleteUser('${user.healthId}')" title="Delete User">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600 hover:text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7L5 7M10 11V17M14 11V17M4 7H20M9 7V4H15V7" />
            </svg>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2">
        <div><strong>Health ID:</strong> ${user.healthId || 'N/A'}</div>
        <div><strong>Email:</strong> ${user.email || 'N/A'}</div>
        <div><strong>Phone:</strong> ${user.phone || 'N/A'}</div>
        <div><strong>DOB:</strong> ${user.dob || 'N/A'}</div>
        <div><strong>Gender:</strong> ${user.gender || 'N/A'}</div>
        <div><strong>Blood Group:</strong> ${user.bloodGroup || 'Not Provided'}</div>
        <div><strong>Allergies:</strong> ${user.allergies || 'Not Provided'}</div>
        <div><strong>Chronic Conditions:</strong> ${user.chronicConditions || 'Not Provided'}</div>
        <div><strong>Current Medications:</strong> ${user.currentMedications || 'Not Provided'}</div>
        <div><strong>Medical History:</strong> ${user.medicalHistory || 'None'}</div>
        <div><strong>Registered At:</strong> ${user.registeredAt ? formattedDate : 'N/A'}</div>
      </div>
    `;

    main.appendChild(container);
  });
}

async function searchUsers() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) {
    console.error("Search input not found!");
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  const main = document.getElementById('mainContent');

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    if (!response.ok) throw new Error('Failed to fetch user data');
    const data = await response.json();
    const users = data.record || [];

    if (!query) {
      showAllUsers(users);
      return;
    }

    const filteredUsers = users.filter(user => {
      const fullName = (user.fullName || '').toLowerCase();
      const healthId = (user.healthId || '').toLowerCase();
      return fullName.includes(query) || healthId.includes(query);
    });

    if (filteredUsers.length === 0) {
      main.innerHTML = '';
      main.className = 'p-6 mt-20 min-h-screen';
      renderSearchBar();
      main.innerHTML += `<p class="text-center text-gray-700 text-xl mt-12">No users found matching "${query}".</p>`;
      return;
    }

    showAllUsers(filteredUsers);

  } catch (error) {
    main.innerHTML = `<p class="text-red-500 text-center">Error loading user data: ${error.message}</p>`;
  }
}



async function deleteAllUsers() {
  if (!confirm("Are you sure you want to delete ALL users? This action cannot be undone.")) return;

  // Default user to prevent blank bin error
  const defaultUser = {
    id: "default",
    fullName: "Default User",
    registeredAt: new Date().toISOString()
  };

  try {
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify([defaultUser])
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Delete all users error:', errorData);
      throw new Error(errorData.message || 'Failed to delete all users');
    }

    alert('All users deleted successfully');
    await loadAllUsers();

  } catch (error) {
    alert(`Error deleting all users: ${error.message}`);
  }
}



async function deleteUser(healthId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    // Fetch latest data
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    let users = data.record || [];

    // Remove the selected user by healthId
    users = users.filter(user => user.healthId !== healthId);

    // PUT the updated data back (with versioning disabled)
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify(users)
    });

    if (!updateResponse.ok) throw new Error('Failed to delete user');

    alert('User deleted successfully');
    await loadAllUsers();

  } catch (error) {
    alert(`Error deleting user: ${error.message}`);
  }
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
}

async function editUser(healthId) {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    const users = data.record || [];
    const user = users.find(u => u.healthId === healthId);

    if (!user) {
      alert('User not found!');
      return;
    }

    // Fill form fields
    const form = document.getElementById('editForm');
    form.healthId.value = user.healthId;
    form.fullName.value = user.fullName || '';
    form.email.value = user.email || '';
    form.phone.value = user.phone || '';
    form.bloodGroup.value = user.bloodGroup || '';
    form.allergies.value = user.allergies || '';
    form.conditions.value = user.chronicConditions || '';
    form.medications.value = user.currentMedications || '';
    form.medicalHistory.value = user.medicalHistory || '';

    // Show modal
    document.getElementById('editModal').classList.remove('hidden');

  } catch (error) {
    alert(`Error fetching user: ${error.message}`);
  }
}

document.getElementById('editForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;

  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    let users = data.record || [];

    const index = users.findIndex(u => u.healthId === form.healthId.value);
    if (index === -1) {
      alert('User not found');
      return;
    }

    // Update user object
    users[index] = {
      ...users[index],
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      bloodGroup: form.bloodGroup.value,
      allergies: form.allergies.value,
      chronicConditions: form.conditions.value,
      currentMedications: form.medications.value,
      medicalHistory: form.medicalHistory.value
    };

    // PUT updated data back
    const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
        'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify(users)
    });

    if (!updateResponse.ok) throw new Error('Failed to update user');

    alert('User updated successfully');
    closeEditModal();
    await loadAllUsers();

  } catch (error) {
    alert(`Error updating user: ${error.message}`);
  }
});

