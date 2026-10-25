// Authentication with localStorage
function loadUsers() {
    return JSON.parse(localStorage.getItem('twistchess_users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('twistchess_users', JSON.stringify(users));
}

function login(username, password) {
    const users = loadUsers();
    if (users[username] && users[username].password === password) {
        currentUser = { ...users[username], username };
        localStorage.setItem('twistchess_current', username);
        return true;
    }
    return false;
}

function signup(username, email, password) {
    const users = loadUsers();
    if (users[username]) return false;
    users[username] = {
        password,
        email,
        games: 0,
        wins: 0,
        rating: 1200,
        friends: [],
        recentGames: [],
        displayName: username,
        avatar: '👤'
    };
    saveUsers(users);
    return login(username, password);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('twistchess_current');
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('main-app').classList.remove('active');
}

// Event listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    if (login(user, pass)) {
        showMainApp();
    } else {
        document.getElementById('login-error').textContent = 'Invalid credentials';
    }
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const pass = document.getElementById('signup-password').value;
    if (signup(user, email, pass)) {
        showMainApp();
    } else {
        document.getElementById('signup-error').textContent = 'Username taken';
    }
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
    });
});

document.getElementById('logout-btn').addEventListener('click', logout);

function showMainApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('player-name').textContent = currentUser.username;
    loadProfile();
    loadFriends();
    loadGames();
    applySettings();
}

// Auto login if session
const saved = localStorage.getItem('twistchess_current');
if (saved) {
    const users = loadUsers();
    if (users[saved]) {
        currentUser = { ...users[saved], username: saved };
        showMainApp();
    }
}

function removeFriend(name) {
    currentUser.friends = currentUser.friends.filter(f => f !== name);
    saveCurrentUser();
    loadFriends();
}

function saveCurrentUser() {
    const users = loadUsers();
    users[currentUser.username] = { ...currentUser };
    delete users[currentUser.username].username;
    saveUsers(users);
}

document.getElementById('add-friend-btn').addEventListener('click', () => {
    const name = document.getElementById('friend-username').value.trim();
    if (name && !currentUser.friends.includes(name)) {
        currentUser.friends.push(name);
        saveCurrentUser();
        loadFriends();
        document.getElementById('friend-username').value = '';
    }
});

document.getElementById('save-profile').addEventListener('click', () => {
    currentUser.displayName = document.getElementById('display-name').value;
    currentUser.avatar = document.getElementById('avatar-emoji').value || '👤';
    saveCurrentUser();
    loadProfile();
});
