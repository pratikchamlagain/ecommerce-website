var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var subjectError = document.getElementById('subject-error');
var messageError = document.getElementById('message-error');
var submitError = document.getElementById('submit-error');

function validateName() {
    var name = document.getElementById('contact-name').value;
    var nameRegex = /^[A-Za-z\s]+$/; // Allows only letters and spaces

    if (name.length == 0) {
        nameError.innerHTML = 'Name is required';
        return false;
    }
    if (!nameRegex.test(name)) {
        nameError.innerHTML = 'Only letters and spaces are allowed';
        return false;
    }

    nameError.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    return true;
}

function validateEmail() {
    var email = document.getElementById('contact-email').value;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format

    if (email.length == 0) {
        emailError.innerHTML = 'Email is required';
        return false;
    }
    if (!emailRegex.test(email)) {
        emailError.innerHTML = 'Enter a valid email address';
        return false;
    }

    emailError.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    return true;
}


function validateSubject() {
    var subject = document.getElementById('contact-subject').value.trim().toLowerCase();

    if (subject.length == 0) {
        subjectError.innerHTML = 'Subject is required';
        return false;
    }
    if (subject === 'subject') {
        subjectError.innerHTML = 'Subject cannot be "subject"';
        return false;
    }
    if (subject.length < 5) {
        subjectError.innerHTML = 'Subject must be at least 5 characters';
        return false;
    }

    subjectError.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    return true;
}

function validateMessage() {
    var message = document.getElementById('contact-message').value;
    var required = 30;
    var left = required - message.length;

    if(left > 0){
        messageError.innerHTML = left + 'more characters required';
        return false;
    }
    messageError.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    return true;
}

function validateForm() {
    let submitError = document.getElementById("submit-error");
    let submitSuccess = document.getElementById("submit-success");

    // Perform validation
    if (!validateName() || !validateEmail() || !validateSubject() || !validateMessage()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Please check the errors and fix them to submit.";
        submitSuccess.style.display = "none"; // Hide success message
        setTimeout(() => {
            submitError.style.display = "none";
        }, 3000);
        return false; // Stop execution if validation fails
    }

    // If validation passes

    alert("Your feedback has been submitted successfully. Thank you!");

    submitError.style.display = "none"; // Hide any previous error messages
    submitSuccess.style.display = "block";
    submitSuccess.innerHTML = "Your feedback has been submitted successfully. Thank you!";

    // Reset the form after a short delay
    setTimeout(() => {
        document.getElementById("feedback-form").reset();
        submitSuccess.style.display = "none"; // Hide success message after a few seconds
    }, 3000);

    return false; // Prevent page reload
}


    
