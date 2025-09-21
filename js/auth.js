// Supabase setup
const SUPABASE_URL = 'https://tjbgvmwyllzixyeirwiw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYmd2bXd5bGx6aXh5ZWlyd2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTE1ODAsImV4cCI6MjA3NDAyNzU4MH0.o7kvQW1I0woi1NI3s8VcToEhT7JCSoJEL20UmpZG-rA';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true }
});

// Check if user is logged in
async function checkAuth(redirectIfUnauthenticated = true) {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session and redirect is true, go to login
    if (!session && redirectIfUnauthenticated) {
        window.location.href = 'login.html';
        return null;
    }
    
    return session;
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Logout
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Show message helper
function showMessage(element, message, isError = false) {
    if (!element) return;
    
    element.textContent = message;
    element.classList.remove('hidden');
    if (isError) {
        element.classList.remove('bg-green-500/20', 'text-green-300');
        element.classList.add('bg-red-500/20', 'text-red-300');
    } else {
        element.classList.remove('bg-red-500/20', 'text-red-300');
        element.classList.add('bg-green-500/20', 'text-green-300');
    }
    setTimeout(() => element.classList.add('hidden'), 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions
window.auth = {
    supabase,
    checkAuth,
    getCurrentUser,
    logout,
    showMessage,
    formatCurrency
};
