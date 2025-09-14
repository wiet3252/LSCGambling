let users = JSON.parse(localStorage.getItem('lscCasinoUsers')) || {};
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const gameSelection = document.getElementById('game-selection');
const balanceDisplay = document.getElementById('balance');
const logoutBtn = document.getElementById('logout-btn');

// Show/Hide Forms
document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

// Login
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (users[username] && users[username].password === password) {
            currentUser = { username, balance: users[username].balance };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIAfterLogin();
        } else {
            alert('Invalid username or password');
        }
    });
}

// Signup
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (users[username]) {
            alert('Username already exists');
            return;
        }
        
        // Create new user with 1000 LSC starting balance
        users[username] = {
            password: password,
            balance: 1000
        };
        
        localStorage.setItem('lscCasinoUsers', JSON.stringify(users));
        currentUser = { username, balance: 1000 };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUIAfterLogin();
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        updateUIAfterLogout();
    });
}

// Update UI
function updateUIAfterLogin() {
    if (loginContainer) loginContainer.style.display = 'none';
    if (signupContainer) signupContainer.style.display = 'none';
    if (gameSelection) gameSelection.style.display = 'block';
    if (balanceDisplay) balanceDisplay.textContent = currentUser.balance;
    
    // Update balances in game sections
    updateGameBalances();
}

function updateUIAfterLogout() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (gameSelection) gameSelection.style.display = 'none';
    
    // Hide all game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Reset forms
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
}

// Update user balance
function updateBalance(amount) {
    if (!currentUser) return;
    
    currentUser.balance += amount;
    users[currentUser.username].balance = currentUser.balance;
    
    // Save to storage
    localStorage.setItem('lscCasinoUsers', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateGameBalances();
}

// Update balance displays in all game sections
function updateGameBalances() {
    if (!currentUser) return;
    
    const balanceElements = document.querySelectorAll('.balance span, #blackjack-balance, #dice-balance');
    balanceElements.forEach(el => {
        el.textContent = currentUser.balance;
    });
}

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        // Update user data from storage in case it changed
        if (users[currentUser.username]) {
            currentUser.balance = users[currentUser.username].balance;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        updateUIAfterLogin();
    } else {
        updateUIAfterLogout();
    }
});
