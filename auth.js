// User accounts storage (in a real app, this would be on a server)
let users = {};
let currentUser = null;

// Initialize storage with error handling
function initializeStorage() {
    try {
        users = JSON.parse(localStorage.getItem('lscCasinoUsers')) || {};
        currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;
    } catch (error) {
        console.error('Error initializing storage:', error);
        showError('Failed to load user data. Please refresh the page.');
        // Reset to empty state
        users = {};
        currentUser = null;
    }
}

// Show error modal
function showError(message) {
    const modal = document.getElementById('error-modal');
    const errorMessage = document.getElementById('error-message');
    const closeBtn = document.querySelector('.close-btn');
    
    if (errorMessage) errorMessage.textContent = message;
    if (modal) modal.style.display = 'flex';
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.onclick = function() {
            if (modal) modal.style.display = 'none';
        };
    }
    
    // Close modal when clicking outside the content
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Toggle loading state for buttons
function setLoading(button, isLoading) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Show loading overlay
function setLoadingOverlay(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

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
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('login-btn');
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        setLoading(loginBtn, true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (users[username] && users[username].password === password) {
                currentUser = { 
                    username, 
                    balance: users[username].balance || 1000 
                };
                
                try {
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                    updateUIAfterLogin();
                } catch (error) {
                    console.error('Session storage error:', error);
                    showError('Failed to save session. Please try again.');
                }
            } else {
                showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An error occurred during login. Please try again.');
        } finally {
            setLoading(loginBtn, false);
        }
    });
}

// Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const signupBtn = document.getElementById('signup-btn');
        
        // Validate inputs
        if (!username || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        if (users[username]) {
            showError('Username already exists');
            return;
        }
        
        setLoading(signupBtn, true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Create new user with 1000 LSC starting balance
            users[username] = {
                password: password,
                balance: 1000,
                createdAt: new Date().toISOString()
            };
            
            try {
                localStorage.setItem('lscCasinoUsers', JSON.stringify(users));
                currentUser = { 
                    username, 
                    balance: 1000,
                    isNew: true
                };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                // Show welcome message for new users
                if (currentUser.isNew) {
                    showError(`Welcome to LSC Casino, ${username}! You've received 1000 LSC to start playing.`);
                    delete currentUser.isNew;
                }
                
                updateUIAfterLogin();
            } catch (error) {
                console.error('Storage error:', error);
                showError('Failed to create account. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('An error occurred during signup. Please try again.');
        } finally {
            setLoading(signupBtn, false);
        }
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
    // Show loading overlay while initializing
    setLoadingOverlay(true);
    
    try {
        // Initialize storage
        initializeStorage();
        
        if (currentUser) {
            // Update user data from storage in case it changed
            if (users[currentUser.username]) {
                currentUser.balance = users[currentUser.username].balance;
                try {
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                } catch (error) {
                    console.error('Error updating session:', error);
                    showError('Failed to update session. Please login again.');
                    updateUIAfterLogout();
                    return;
                }
                updateUIAfterLogin();
            } else {
                // User data not found in local storage
                console.warn('User data not found in storage');
                sessionStorage.removeItem('currentUser');
                updateUIAfterLogout();
                showError('Session expired. Please login again.');
            }
        } else {
            updateUIAfterLogout();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application. Please refresh the page.');
    } finally {
        // Hide loading overlay
        setLoadingOverlay(false);
    }
    
    // Initialize close button for error modal
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            const modal = document.getElementById('error-modal');
            if (modal) modal.style.display = 'none';
        };
    }
});
