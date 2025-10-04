    function formatHealthId(id) {
      return id.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    }

    function calculateAge(dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }

function loadUserDetails() {
  const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
  const healthIdDisplay = document.getElementById('healthIdDisplay');
  const detailsDiv = document.getElementById('userDetails');

  if (!user) {
    detailsDiv.innerHTML = `<p class="text-red-600 font-semibold">❌ No user data found. Please login first.</p>`;
    healthIdDisplay.textContent = '';
    return;
  }

  healthIdDisplay.textContent = `Health ID: ${formatHealthId(user.healthId)}`;

  detailsDiv.innerHTML = `
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Name:</span>
      <span class="font-mono">${user.fullName}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Email:</span>
      <span class="font-mono">${user.email}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Phone:</span>
      <span class="font-mono">${user.phone}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">DOB:</span>
      <span class="font-mono">${user.dob}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Gender:</span>
      <span class="font-mono">${user.gender}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Blood Group:</span>
      <span class="font-mono">${user.bloodGroup || 'Not Provided'}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Allergies:</span>
      <span class="font-mono">${user.allergies || 'Not Provided'}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Chronic Conditions:</span>
      <span class="font-mono">${user.chronicConditions || 'Not Provided'}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Current Medications:</span>
      <span class="font-mono">${user.currentMedications || 'Not Provided'}</span>
    </div>
    <div class="flex justify-between border-b border-indigo-200 pb-2">
      <span class="font-semibold">Medical History:</span>
      <span class="font-mono">${user.medicalHistory || 'None'}</span>
    </div>
    <div class="flex justify-between pt-2">
      <span class="font-semibold">Registered At:</span>
      <span class="font-mono">${new Date(user.registeredAt).toLocaleString()}</span>
    </div>
  `;

  // Update ID Card Section
  document.getElementById('cardHealthId').textContent = formatHealthId(user.healthId);
  document.getElementById('cardName').textContent = user.fullName;
  document.getElementById('cardAge').textContent = calculateAge(user.dob);
}

    function logout() {
      sessionStorage.removeItem('loggedInUser');
      window.location.href = 'already-user.html';
    }

    window.onload = function() {
    loadUserDetails();

    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!user) return;

    const qrImg = document.getElementById('qrCode');

    const formatDate = (dateStr) => {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    };

    const qrData = 
      `HealthSpot User Details:\n` +
      `Health ID: ${formatHealthId(user.healthId)}\n` +
      `Name: ${user.fullName}\n` +
      `Email: ${user.email}\n` +
      `Emergency Phone: ${user.phone}\n` +
      `DOB: ${formatDate(user.dob)}\n` +
      `Age: ${calculateAge(user.dob)}\n` +
      `Gender: ${user.gender}\n` +
      `Medical History: ${user.medicalHistory || 'None'}\n` +
      `Registered At: ${formatDate(user.registeredAt)}`;


    const encodedData = encodeURIComponent(qrData);

    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
    };

// To print the card
document.getElementById('printCardBtn').onclick = async function() {
  const card = document.querySelector('section.p-6.border-indigo-300');
  const qrImg = card.querySelector('#qrCode');

  function waitForImageLoad(img) {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  }

  if (qrImg) {
    await waitForImageLoad(qrImg);
  }

  await imagesLoaded(card);
  await new Promise(res => setTimeout(res, 300));

  html2canvas(card, { scale: 2, useCORS: true }).then(canvas => {
    const pdfWidth = 600; // fixed width
    const aspectRatio = canvas.height / canvas.width;
    const pdfHeight = pdfWidth * aspectRatio;

    const pdf = new jspdf.jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('HealthSpot_ID_Card.pdf');
  });
};

function imagesLoaded(container) {
  const imgs = container.querySelectorAll('img');
  const promises = [];

  imgs.forEach(img => {
    if (!img.complete) {
      promises.push(new Promise(resolve => {
        img.onload = img.onerror = resolve;
      }));
    }
  });

  return Promise.all(promises);
}
