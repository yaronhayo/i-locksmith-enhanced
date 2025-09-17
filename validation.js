
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('booking-form');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    // Function to show error
    function showError(input, message) {
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains('error-msg')) {
            error = document.createElement('p');
            error.classList.add('text-red-500', 'text-xs', 'mt-1', 'error-msg');
            input.after(error);
        }
        error.textContent = message;
    }

    // Function to clear error
    function clearError(input) {
        const error = input.nextElementSibling;
        if (error && error.classList.contains('error-msg')) {
            error.textContent = '';
        }
    }

    // Real-time validation for Name (letters and spaces only)
    nameInput.addEventListener('input', () => {
        const namePattern = /^[A-Za-z\s]*$/;
        if (!namePattern.test(nameInput.value)) {
            showError(nameInput, 'Name cannot contain numbers or special characters.');
        } else {
            clearError(nameInput);
        }
    });

    // Real-time validation for Phone (numbers only)
    phoneInput.addEventListener('input', () => {
        const phonePattern = /^[0-9\-]*$/; // allow numbers and hyphen
        if (!phonePattern.test(phoneInput.value)) {
            showError(phoneInput, 'Phone number cannot contain letters.');
        } else {
            clearError(phoneInput);
        }
    });

    // Final validation on submit
    form.addEventListener('submit', (e) => {
        let valid = true;

        // Name validation
        if (!/^[A-Za-z\s]+$/.test(nameInput.value)) {
            showError(nameInput, 'Name cannot contain numbers or special characters.');
            valid = false;
        }

        // Phone validation
        if (!/^[0-9\-]+$/.test(phoneInput.value)) {
            showError(phoneInput, 'Phone number cannot contain letters.');
            valid = false;
        }

        if (!valid) e.preventDefault();
    });
});