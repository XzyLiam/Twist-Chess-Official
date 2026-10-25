// UI Management
let currentGame = null;
let currentMode = 'standard';
let currentUser = null;
let flipped = false;

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });
}

function renderBoard() {
    if (!currentGame) return;
    const boardEl = document.getElementById('chessboard');
    boardEl.className = 'chessboard';
    if (currentGame.boardSize === 10) boardEl.classList.add('big');
    if (currentGame.boardSize === 6) boardEl.classList.add('small');
    boardEl.style.gridTemplateColumns = `repeat(${currentGame.boardSize}, 1fr)`;
    boardEl.innerHTML = '';

    const size = currentGame.boardSize;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const displayR = flipped ? size - 1 - r : r;
            const displayC = flipped ? size - 1 - c : c;
            const square = document.createElement('div');
            square.className = `square ${(displayR + displayC) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.r = displayR;
            square.dataset.c = displayC;

            const piece = currentGame.board[displayR][displayC];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'piece';
                const code = currentGame.getPieceCode(piece);
                const svg = getPieceSVG(code, settings.pieceSet || 'classic');
                if (svg) {
                    pieceEl.innerHTML = svg;
                } else {
                    pieceEl.textContent = unicodePieces[code] || '';
                }
                // Fog of war
                if (currentGame.mode === 'fog' && piece.color !== currentGame.turn) {
                    pieceEl.style.opacity = '0.3';
                }
                // Hidden queen indicator for owner only
                if (currentGame.mode === 'hiddenqueen' && currentGame.hiddenQueens[piece.color] === `${displayR},${displayC}` && piece.color === currentUser?.color || true) {
                    if (currentGame.hiddenQueens[piece.color] === `${displayR},${displayC}`) {
                        pieceEl.style.boxShadow = '0 0 10px gold';
                    }
                }
                square.appendChild(pieceEl);
            }

            square.addEventListener('click', () => handleSquareClick(displayR, displayC));
            boardEl.appendChild(square);
        }
    }

    updateStatus();
    updateMoveHistory();
}

function handleSquareClick(r, c) {
    if (!currentGame || currentGame.gameOver) return;
    const piece = currentGame.board[r][c];

    // Hidden queen selection at start
    if (currentGame.mode === 'hiddenqueen' && !currentGame.hiddenQueens[currentGame.turn] && piece && piece.type === 'p' && piece.color === currentGame.turn) {
        currentGame.setHiddenQueen(currentGame.turn, r, c);
        renderBoard();
        return;
    }

    if (currentGame.selected && currentGame.selected[0] === r && currentGame.selected[1] === c) {
        currentGame.selected = null;
        renderBoard();
        return;
    }

    if (piece && piece.color === currentGame.turn) {
        currentGame.selected = [r, c];
        currentGame.possibleMoves = currentGame.getPossibleMoves(r, c);
        renderBoard();
        // Highlight
        document.querySelectorAll('.square').forEach(sq => {
            const sr = parseInt(sq.dataset.r), sc = parseInt(sq.dataset.c);
            if (currentGame.possibleMoves.some(([mr, mc]) => mr === sr && mc === sc)) {
                sq.classList.add('move-option');
            }
            if (sr === r && sc === c) sq.classList.add('highlight');
        });
        return;
    }

    if (currentGame.selected) {
        const [fr, fc] = currentGame.selected;
        if (currentGame.makeMove(fr, fc, r, c)) {
            currentGame.selected = null;
            renderBoard();
            // Promotion check
            const movedPiece = currentGame.board[r][c];
            if (movedPiece && movedPiece.type === 'p' && (r === 0 || r === currentGame.boardSize - 1)) {
                showPromotion(r, c);
            }
        }
    }
}

function showPromotion(r, c) {
    const modal = document.getElementById('promotion-modal');
    modal.classList.add('active');
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
            currentGame.board[r][c].type = btn.dataset.piece;
            modal.classList.remove('active');
            renderBoard();
        };
    });
}

function updateStatus() {
    const status = document.getElementById('game-status');
    if (currentGame.gameOver) {
        status.textContent = `Game Over! ${currentGame.winner === 'w' ? 'White' : 'Black'} wins`;
    } else {
        status.textContent = `${currentGame.turn === 'w' ? 'White' : 'Black'} to move`;
    }
}

function updateMoveHistory() {
    const hist = document.getElementById('move-history');
    hist.innerHTML = currentGame.moveHistory.map((m, i) => `${i+1}. ${m.piece}${String.fromCharCode(97+m.to[1])}${currentGame.boardSize - m.to[0]}`).join('<br>');
}

function loadProfile() {
    if (!currentUser) return;
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-stats').textContent = `Games: ${currentUser.games || 0} | Wins: ${currentUser.wins || 0} | Rating: ${currentUser.rating || 1200}`;
    document.getElementById('display-name').value = currentUser.displayName || currentUser.username;
    document.getElementById('avatar-emoji').value = currentUser.avatar || '👤';
    document.getElementById('profile-avatar').textContent = currentUser.avatar || '👤';
}

function loadFriends() {
    const list = document.getElementById('friends-list');
    list.innerHTML = '';
    (currentUser.friends || []).forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${f}</span> <button onclick="removeFriend('${f}')">Remove</button>`;
        list.appendChild(li);
    });
}

function loadGames() {
    const list = document.getElementById('games-list');
    list.innerHTML = '';
    (currentUser.recentGames || []).forEach(g => {
        const li = document.createElement('li');
        li.textContent = `${g.mode} vs ${g.opponent} - ${g.result}`;
        list.appendChild(li);
    });
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => startGame(card.dataset.mode));
});

document.querySelector('.quick-play').addEventListener('click', () => startGame('standard'));

document.getElementById('flip-board').addEventListener('click', () => {
    flipped = !flipped;
    renderBoard();
});

document.getElementById('resign-btn').addEventListener('click', () => {
    if (confirm('Resign?')) {
        currentGame.gameOver = true;
        currentGame.winner = currentGame.turn === 'w' ? 'b' : 'w';
        updateStatus();
    }
});

document.getElementById('sound-toggle').addEventListener('click', () => {
    sounds.setEnabled(!sounds.enabled);
    document.getElementById('sound-toggle').textContent = sounds.enabled ? '🔊 Sound' : '🔇 Muted';
});
