document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const loginContainer = document.querySelector('.login-form');
    const signupContainer = document.querySelector('.signup-form');
    
    // Switch to Signup Form
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.classList.remove('active');
        setTimeout(() => {
            signupContainer.classList.add('active');
        }, 300);
    });
    
    // Switch to Login Form
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupContainer.classList.remove('active');
        setTimeout(() => {
            loginContainer.classList.add('active');
        }, 300);
    });
    
    // Login Form Submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Simple validation - in a real app, you'd authenticate with a server
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (username && password) {
            // Redirect to home page after successful login
            window.location.href = 'home.html';
        }
    });
    
    // Signup Form Submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!username || !email || !password || !confirmPassword) {
            return;
        }
        
        if (password !== confirmPassword) {
            return;
        }
        
        // In a real app, you would send this data to a server
        // For this demo, we'll just redirect to home page
        window.location.href = 'home.html';
    });
});