// ================================
// UTILITAIRES GÉNÉRAUX
// ================================

// Récupérer l'utilisateur connecté
function getUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Récupérer le token
function getToken() {
    return localStorage.getItem('token');
}

// Vérifier si connecté
function isLoggedIn() {
    return getToken() !== null;
}

// Déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Formater une date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

// Afficher un message
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (el) {
        el.className = `message ${type}`;
        el.textContent = message;
    }
}

// ================================
// VÉRIFICATION AUTHENTIFICATION
// ================================

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

function checkAdmin() {
    const user = getUser();
    if (!user || user.role !== 'admin') {
        alert('❌ Accès refusé !');
        window.location.href = 'login.html';
    }
}

// ================================
// APPELS API
// ================================

async function apiGet(url) {
    try {
        const response = await fetch(`http://localhost:3000${url}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return await response.json();
    } catch (err) {
        console.error('Erreur API GET :', err);
        return null;
    }
}

async function apiPost(url, body) {
    try {
        const response = await fetch(`http://localhost:3000${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(body)
        });
        return { status: response.status, data: await response.json() };
    } catch (err) {
        console.error('Erreur API POST :', err);
        return null;
    }
}

async function apiDelete(url) {
    try {
        const response = await fetch(`http://localhost:3000${url}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return await response.json();
    } catch (err) {
        console.error('Erreur API DELETE :', err);
        return null;
    }
}

// ================================
// NAVBAR DYNAMIQUE
// ================================

function setupNavbar() {
    const user = getUser();
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        if (userInfo) userInfo.textContent = '👤 ' + user.nom;
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
            logoutBtn.addEventListener('click', logout);
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Initialiser la navbar sur toutes les pages
document.addEventListener('DOMContentLoaded', setupNavbar);