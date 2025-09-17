document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const form = document.getElementById('booking-form');

    // Create error message elements
    const nameError = document.createElement('p');
    nameError.className = 'text-red-500 text-xs mt-1 hidden';
    nameError.textContent = 'Name can only contain letters and spaces.';
    nameInput.parentNode.appendChild(nameError);

    const phoneError = document.createElement('p');
    phoneError.className = 'text-red-500 text-xs mt-1 hidden';
    phoneError.textContent = 'Phone number can only contain numbers, +, -, and spaces.';
    phoneInput.parentNode.appendChild(phoneError);

    // Validation functions
    function validateName() {
        const pattern = /^[A-Za-z\s]+$/;
        if (!nameInput.value.trim().match(pattern)) {
            nameError.classList.remove('hidden');
            return false;
        } else {
            nameError.classList.add('hidden');
            return true;
        }
    }

    function validatePhone() {
        const pattern = /^[0-9+\-\s]+$/;
        if (!phoneInput.value.trim().match(pattern)) {
            phoneError.classList.remove('hidden');
            return false;
        } else {
            phoneError.classList.add('hidden');
            return true;
        }
    }

    // Real-time validation
    nameInput.addEventListener('input', validateName);
    phoneInput.addEventListener('input', validatePhone);

    // Final check on form submit
    form.addEventListener('submit', (e) => {
        if (!validateName() || !validatePhone()) {
            e.preventDefault(); // Prevent submission
            alert('Please fix the errors before submitting.');
        }
    });
});