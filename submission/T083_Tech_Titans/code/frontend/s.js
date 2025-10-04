// Profile Image Upload
const profileImage = document.getElementById("profileImage");
const imageUpload = document.getElementById("imageUpload");

profileImage.addEventListener("click", () => imageUpload.click());

imageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      profileImage.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }
});

// Section Navigation
function showSection(sectionId, el) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.querySelectorAll('.bottom-nav a').forEach(link => link.classList.remove('active'));
  el.classList.add('active');
}

// Editable Info
let originalValues = {};
const editableElements = ['age', 'occupation', 'gender', 'bodyShape', 'skinTone'];

function storeOriginals() {
  originalValues.username = document.getElementById('username').innerText.trim();
  editableElements.forEach(id => {
    const el = document.getElementById(id);
    if(el) originalValues[id] = el.innerText.trim();
  });
}

// Pencil click - enter edit mode
const pencilIcon = document.querySelector('.pencil-icon');
if(pencilIcon){
  pencilIcon.addEventListener('click', function() {
    const profileSection = document.getElementById('profile');
    if(profileSection.classList.contains('edit-mode')) return;
    profileSection.classList.add('edit-mode');

    // Username input
    const usernameH2 = document.getElementById('username');
    if(usernameH2){
      const input = document.createElement('input');
      input.type = 'text';
      input.value = usernameH2.innerText;
      input.classList.add('edit-input');
      input.setAttribute('data-field', 'username');
      input.style.fontSize = '24px';
      input.style.fontWeight = 'bold';
      usernameH2.parentNode.replaceChild(input, usernameH2);
    }

    // Info fields
    editableElements.forEach(id => {
      const span = document.getElementById(id);
      if(span){
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.innerText;
        input.classList.add('edit-input');
        input.setAttribute('data-field', id);
        span.parentNode.replaceChild(input, span);
      }
    });

    // Save/Cancel buttons
    const saveCancelDiv = document.createElement('div');
    saveCancelDiv.classList.add('save-cancel');
    saveCancelDiv.innerHTML = `
      <button class="save-btn" onclick="saveEdits()">Save</button>
      <button class="cancel-btn" onclick="cancelEdits()">Cancel</button>
    `;
    document.querySelector('.info').appendChild(saveCancelDiv);
  });
}

// Save edits
window.saveEdits = function(){
  const profileSection = document.getElementById('profile');
  profileSection.classList.remove('edit-mode');

  const usernameInput = document.querySelector('.edit-input[data-field="username"]');
  if(usernameInput){
    const h2 = document.createElement('h2');
    h2.id = 'username';
    h2.classList.add('editable');
    h2.innerText = usernameInput.value.trim() || originalValues.username;
    usernameInput.parentNode.replaceChild(h2, usernameInput);
  }

  editableElements.forEach(id => {
    const input = document.querySelector(`.edit-input[data-field="${id}"]`);
    if(input){
      const span = document.createElement('span');
      span.id = id;
      span.classList.add('editable');
      span.innerText = input.value.trim() || originalValues[id];
      input.parentNode.replaceChild(span, input);
    }
  });

  const saveCancel = document.querySelector('.save-cancel');
  if(saveCancel) saveCancel.remove();
}

// Cancel edits
window.cancelEdits = function(){
  const profileSection = document.getElementById('profile');
  profileSection.classList.remove('edit-mode');

  const usernameInput = document.querySelector('.edit-input[data-field="username"]');
  if(usernameInput){
    const h2 = document.createElement('h2');
    h2.id = 'username';
    h2.classList.add('editable');
    h2.innerText = originalValues.username;
    usernameInput.parentNode.replaceChild(h2, usernameInput);
  }

  editableElements.forEach(id => {
    const input = document.querySelector(`.edit-input[data-field="${id}"]`);
    if(input){
      const span = document.createElement('span');
      span.id = id;
      span.classList.add('editable');
      span.innerText = originalValues[id];
      input.parentNode.replaceChild(span, input);
    }
  });

  const saveCancel = document.querySelector('.save-cancel');
  if(saveCancel) saveCancel.remove();
}

// Store originals on load
document.addEventListener('DOMContentLoaded', storeOriginals);

// Orders panel toggle
const orderArrow = document.getElementById('orderArrow');
const ordersPanel = document.getElementById('ordersPanel');

ordersPanel.classList.remove('active'); // hidden by default

orderArrow.addEventListener('click', () => {
  ordersPanel.classList.toggle('active');
  orderArrow.classList.toggle('open');
});




