document.addEventListener('DOMContentLoaded', function() {
    const healthIdInput = document.getElementById('health-id');
    const qrImage = document.getElementById('qr-code');
  
    generateRandomId();
  
    function generateRandomId() {
      const min = 100000000;
      const max = 999999999;
      const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
      healthIdInput.value = randomId;
  
      // Save to localStorage
      localStorage.setItem('healthId', randomId);
  
      const medicalRecord = `
  Health ID: ${randomId}
  Name: Nil
  Age: Nil
  Gender: Nil
  Blood Group: Nil
  Allergies: Nil
  Medical History: Nil
  Emergency Contact: Nil
      `;
  
      const qrData = encodeURIComponent(medicalRecord);
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=150x150`;
    }
  });
  


  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('medical-form');
    const recordCard = document.getElementById('record-card');
    const qrImage = document.getElementById('qr-code');
  
    // Retrieve Health ID from localStorage
    const storedHealthId = localStorage.getItem('healthId');
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
  
      const medicalRecord = {
        healthId: storedHealthId ? storedHealthId : Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000,
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        allergies: document.getElementById('allergies').value,
        medicalHistory: document.getElementById('medicalHistory').value,
        emergencyContact: document.getElementById('emergencyContact').value
      };
  
      // Display the record card
      recordCard.classList.remove('hidden');
      recordCard.innerHTML = `
        <h2 class="text-xl font-bold text-blue-700 mb-2">Medical Record</h2>
        <p><strong>Health ID:</strong> ${medicalRecord.healthId}</p>
        <p><strong>Name:</strong> ${medicalRecord.name}</p>
        <p><strong>Age:</strong> ${medicalRecord.age}</p>
        <p><strong>Gender:</strong> ${medicalRecord.gender}</p>
        <p><strong>Blood Group:</strong> ${medicalRecord.bloodGroup}</p>
        <p><strong>Allergies:</strong> ${medicalRecord.allergies}</p>
        <p><strong>Medical History:</strong> ${medicalRecord.medicalHistory}</p>
        <p><strong>Emergency Contact:</strong> ${medicalRecord.emergencyContact}</p>
      `;
  
      // Generate QR Code with the record
      const qrData = encodeURIComponent(`
  Health ID: ${medicalRecord.healthId}
  Name: ${medicalRecord.name}
  Age: ${medicalRecord.age}
  Gender: ${medicalRecord.gender}
  Blood Group: ${medicalRecord.bloodGroup}
  Allergies: ${medicalRecord.allergies}
  Medical History: ${medicalRecord.medicalHistory}
  Emergency Contact: ${medicalRecord.emergencyContact}
      `);
  
      qrImage.classList.remove('hidden');
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=200x200`;
    });
  });
  