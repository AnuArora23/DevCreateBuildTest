document.addEventListener('DOMContentLoaded', function() {
    const healthIdInput = document.getElementById('health-id');

    // Call the function to generate a random ID when the page loads
    generateRandomId();

    function generateRandomId() {
        const min = 100000000; // 9 digits starting from 100,000,000
        const max = 999999999; // 9 digits ending at 999,999,999
        const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
        healthIdInput.value = randomId;
    }
});

function openNewPageWithDelay() {
    var newPageUrl = "/public/hid.html";
    setTimeout(function() {
        window.open(newPageUrl, "_blank");
    }, 1000); 
}
