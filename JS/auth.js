import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    } else if (user && window.location.pathname.includes('signup.html')) {
        window.location.href = 'dashboard.html';
    }
});

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorMessage = document.getElementById('error-message');
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match!';
            errorMessage.style.display = 'block';
            return;
        }
        
        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user);

            window.location.href = 'dashboard.html';
            
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in:', userCredential.user);
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            errorMessage.textContent = 'Invalid email or password';
            errorMessage.style.display = 'block';
        }
    });
}