// Settings Management
let settings = {
    theme: 'default',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    pieceSet: 'classic',
    soundEnabled: true,
    volume: 0.5,
    boardScale: 1
};

function loadSettings() {
    const saved = localStorage.getItem('twistchess_settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    applySettings();
}

function saveSettings() {
    localStorage.setItem('twistchess_settings', JSON.stringify(settings));
}

function applySettings() {
    document.body.className = settings.theme !== 'default' ? `theme-${settings.theme}` : '';
    document.documentElement.style.setProperty('--board-light', settings.lightSquare);
    document.documentElement.style.setProperty('--board-dark', settings.darkSquare);
    sounds.setEnabled(settings.soundEnabled);
    sounds.setVolume(settings.volume);
    const board = document.getElementById('chessboard');
    if (board) board.style.transform = `scale(${settings.boardScale})`;
    // Update form
    document.getElementById('theme-select').value = settings.theme;
    document.getElementById('light-square').value = settings.lightSquare;
    document.getElementById('dark-square').value = settings.darkSquare;
    document.getElementById('piece-set').value = settings.pieceSet;
    document.getElementById('sound-enabled').checked = settings.soundEnabled;
    document.getElementById('volume').value = settings.volume;
    document.getElementById('board-scale').value = settings.boardScale;
    if (currentGame) renderBoard();
}

document.getElementById('save-settings').addEventListener('click', () => {
    settings.theme = document.getElementById('theme-select').value;
    settings.lightSquare = document.getElementById('light-square').value;
    settings.darkSquare = document.getElementById('dark-square').value;
    settings.pieceSet = document.getElementById('piece-set').value;
    settings.soundEnabled = document.getElementById('sound-enabled').checked;
    settings.volume = parseFloat(document.getElementById('volume').value);
    settings.boardScale = parseFloat(document.getElementById('board-scale').value);
    saveSettings();
    applySettings();
    alert('Settings saved!');
});

document.getElementById('reset-settings').addEventListener('click', () => {
    settings = {
        theme: 'default',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        pieceSet: 'classic',
        soundEnabled: true,
        volume: 0.5,
        boardScale: 1
    };
    saveSettings();
    applySettings();
});

// Load on start
loadSettings();
