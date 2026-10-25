// TwistChess - Main Application
class TwistChess {
  constructor() {
    this.currentUser = null;
    this.currentPage = 'home';
    this.game = null;
    this.settings = this.loadSettings();
    this.recentGames = JSON.parse(localStorage.getItem('twistchess_games') || '[]');
    this.init();
  }

  init() {
    this.applyTheme();
    this.bindAuth();
    this.bindNavigation();
    this.bindSettings();
    this.checkAuth();
  }

  loadSettings() {
    const defaults = {
      theme: 'dark',
      boardTheme: 'classic',
      pieceSet: 'cburnett',
      soundEnabled: true,
      volume: 0.7,
      animSpeed: 'normal',
      showCoords: true,
      highlightMoves: true
    };
    return { ...defaults, ...JSON.parse(localStorage.getItem('twistchess_settings') || '{}') };
  }

  saveSettings() {
    localStorage.setItem('twistchess_settings', JSON.stringify(this.settings));
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    document.getElementById('theme-select').value = this.settings.theme;
    document.getElementById('board-theme').value = this.settings.boardTheme;
    document.getElementById('piece-set').value = this.settings.pieceSet;
    document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
    document.getElementById('volume').value = this.settings.volume * 100;
  }

  checkAuth() {
    const user = localStorage.getItem('twistchess_user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.showMainApp();
    }
  }

  showMainApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    document.getElementById('current-user').textContent = this.currentUser?.username || 'Guest';
    document.getElementById('profile-username').textContent = this.currentUser?.username || 'Guest';
    this.updateProfile();
  }

  bindAuth() {
    document.getElementById('show-signup').onclick = (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.remove('active');
      document.getElementById('signup-form').classList.add('active');
    };
    document.getElementById('show-login').onclick = (e) => {
      e.preventDefault();
      document.getElementById('signup-form').classList.remove('active');
      document.getElementById('login-form').classList.add('active');
    };

    document.getElementById('login-btn').onclick = () => {
      const username = document.getElementById('login-username').value.trim();
      if (username) {
        this.currentUser = { username, email: '', joined: new Date().toISOString() };
        localStorage.setItem('twistchess_user', JSON.stringify(this.currentUser));
        this.showMainApp();
      }
    };

    document.getElementById('signup-btn').onclick = () => {
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      if (username && email) {
        this.currentUser = { username, email, joined: new Date().toISOString() };
        localStorage.setItem('twistchess_user', JSON.stringify(this.currentUser));
        this.showMainApp();
      }
    };

    document.getElementById('guest-btn').onclick = () => {
      this.currentUser = { username: 'Guest', guest: true };
      this.showMainApp();
    };

    document.getElementById('logout-btn').onclick = () => {
      localStorage.removeItem('twistchess_user');
      this.currentUser = null;
      document.getElementById('main-app').classList.remove('active');
      document.getElementById('auth-screen').classList.add('active');
    };
  }

  bindNavigation() {
    document.querySelectorAll('.nav-link, [data-page]').forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        const page = el.dataset.page;
        if (page) this.navigateTo(page);
      };
    });

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.mode;
        this.navigateTo('play');
        setTimeout(() => this.startGame(mode), 100);
      };
    });
  }

  navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const pageEl = document.getElementById(page + '-page');
    if (pageEl) pageEl.classList.add('active');
    const navLink = document.querySelector(`[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');
    this.currentPage = page;
    if (page === 'recent') this.renderRecentGames();
    if (page === 'profile') this.updateProfile();
  }

  bindSettings() {
    document.getElementById('theme-select').onchange = (e) => {
      this.settings.theme = e.target.value;
      this.applyTheme();
      this.saveSettings();
    };
    document.getElementById('board-theme').onchange = (e) => {
      this.settings.boardTheme = e.target.value;
      this.saveSettings();
      if (this.game) this.game.render();
    };
    document.getElementById('piece-set').onchange = (e) => {
      this.settings.pieceSet = e.target.value;
      this.saveSettings();
      if (this.game) this.game.render();
    };
    document.getElementById('sound-enabled').onchange = (e) => {
      this.settings.soundEnabled = e.target.checked;
      this.saveSettings();
    };
    document.getElementById('volume').oninput = (e) => {
      this.settings.volume = e.target.value / 100;
      this.saveSettings();
    };
  }

  updateProfile() {
    const games = this.recentGames.filter(g => g.user === this.currentUser?.username);
    document.getElementById('games-played').textContent = games.length;
    document.getElementById('wins').textContent = games.filter(g => g.result === 'win').length;
  }

  renderRecentGames() {
    const list = document.getElementById('recent-games-list');
    if (this.recentGames.length === 0) {
      list.innerHTML = '<p class="empty">No games played yet. Start a game!</p>';
      return;
    }
    list.innerHTML = this.recentGames.slice(0, 20).map(g => `
      <div class="game-item">
        <div>
          <strong>${g.mode}</strong> - ${g.result}
          <div style="font-size:0.85rem;color:var(--text-secondary)">${new Date(g.date).toLocaleString()}</div>
        </div>
        <span>${g.moves} moves</span>
      </div>
    `).join('');
  }

  startGame(mode = 'standard') {
    document.getElementById('mode-select').value = mode;
    this.game = new ChessGame(mode, this);
    this.game.init();
  }

  playSound(type) {
    if (!this.settings.soundEnabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = this.settings.volume * 0.3;

    if (type === 'move') {
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'capture') {
      osc.frequency.value = 400;
      osc.type = 'triangle';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'check') {
      osc.frequency.value = 1200;
      osc.type = 'square';
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  }

  saveGame(result, moves) {
    const game = {
      mode: this.game?.mode || 'standard',
      result,
      moves,
      date: new Date().toISOString(),
      user: this.currentUser?.username || 'Guest'
    };
    this.recentGames.unshift(game);
    localStorage.setItem('twistchess_games', JSON.stringify(this.recentGames.slice(0, 50)));
  }
}

class ChessGame {
  constructor(mode, app) {
    this.mode = mode;
    this.app = app;
    this.boardSize = this.getBoardSize();
    this.board = [];
    this.turn = 'w';
    this.selected = null;
    this.legalMoves = [];
    this.moveHistory = [];
    this.flipped = false;
    this.hiddenQueen = { w: null, b: null };
    this.pieceSet = app.settings.pieceSet;
    this.pieceBase = {
      cburnett: 'https://lichess1.org/assets/piece/cburnett/',
      merida: 'https://lichess1.org/assets/piece/merida/',
      neo: 'https://lichess1.org/assets/piece/neo/',
      alpha: 'https://lichess1.org/assets/piece/alpha/',
      california: 'https://lichess1.org/assets/piece/california/'
    };
  }

  getBoardSize() {
    if (this.mode === 'big') return 10;
    if (this.mode === 'small') return 6;
    return 8;
  }

  init() {
    this.setupBoard();
    this.render();
    this.bindBoard();
    document.getElementById('current-mode').textContent = this.getModeName();
    document.getElementById('status').textContent = 'White to move';
    document.getElementById('move-list').innerHTML = '';
    document.getElementById('white-captured').innerHTML = '';
    document.getElementById('black-captured').innerHTML = '';

    document.getElementById('new-game-btn').onclick = () => this.init();
    document.getElementById('flip-board-btn').onclick = () => {
      this.flipped = !this.flipped;
      this.render();
    };
    document.getElementById('mode-select').onchange = (e) => {
      this.mode = e.target.value;
      this.boardSize = this.getBoardSize();
      this.init();
    };
  }

  getModeName() {
    const names = {
      standard: 'Standard Chess',
      roook: 'ROOOK Mode',
      big: 'Big Board (10x10)',
      small: 'Small Board (6x6)',
      hidden: 'Hidden Queen',
      atomic: 'Atomic Chess',
      fog: 'Fog of War'
    };
    return names[this.mode] || 'Standard';
  }

  setupBoard() {
    const size = this.boardSize;
    this.board = Array(size).fill(null).map(() => Array(size).fill(null));

    if (this.mode === 'small') {
      // 6x6: simplified
      const back = ['r', 'n', 'q', 'k', 'n', 'r'];
      for (let i = 0; i < 6; i++) {
        this.board[0][i] = 'b' + back[i];
        this.board[1][i] = 'bp';
        this.board[4][i] = 'wp';
        this.board[5][i] = 'w' + back[i];
      }
    } else if (this.mode === 'big') {
      // 10x10 with extra pieces
      const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', 'n', 'r'];
      for (let i = 0; i < 10; i++) {
        this.board[0][i] = 'b' + (back[i] || 'r');
        this.board[1][i] = 'bp';
        this.board[8][i] = 'wp';
        this.board[9][i] = 'w' + (back[i] || 'r');
      }
    } else {
      // Standard 8x8
      const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
      for (let i = 0; i < 8; i++) {
        this.board[0][i] = 'b' + back[i];
        this.board[1][i] = 'bp';
        this.board[6][i] = 'wp';
        this.board[7][i] = 'w' + back[i];
      }
    }

    if (this.mode === 'roook') {
      // Replace knights and bishops with rooks
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const p = this.board[r][c];
          if (p && (p[1] === 'n' || p[1] === 'b')) {
            this.board[r][c] = p[0] + 'r';
          }
        }
      }
    }
  }

  render() {
    const boardEl = document.getElementById('chessboard');
    const size = this.boardSize;
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.width = Math.min(600, window.innerWidth * 0.6) + 'px';
    boardEl.style.height = boardEl.style.width;
    boardEl.innerHTML = '';

    const base = this.pieceBase[this.pieceSet] || this.pieceBase.cburnett;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const displayR = this.flipped ? size - 1 - r : r;
        const displayC = this.flipped ? size - 1 - c : c;
        const square = document.createElement('div');
        square.className = 'square ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
        square.dataset.r = r;
        square.dataset.c = c;

        const piece = this.board[r][c];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = 'piece';
          const color = piece[0];
          const type = piece[1];
          const pieceCode = (color === 'w' ? 'w' : 'b') + type.toUpperCase();
          pieceEl.style.backgroundImage = `url(${base}${pieceCode}.svg)`;
          square.appendChild(pieceEl);
        }

        // Legal move highlights
        if (this.selected && this.legalMoves.some(m => m.r === r && m.c === c)) {
          const target = this.board[r][c];
          square.classList.add(target ? 'legal-capture' : 'legal-move');
        }
        if (this.selected && this.selected.r === r && this.selected.c === c) {
          square.classList.add('selected');
        }

        boardEl.appendChild(square);
      }
    }
  }

  bindBoard() {
    const boardEl = document.getElementById('chessboard');
    boardEl.onclick = (e) => {
      const square = e.target.closest('.square');
      if (!square) return;
      const r = parseInt(square.dataset.r);
      const c = parseInt(square.dataset.c);
      this.handleClick(r, c);
    };
  }

  handleClick(r, c) {
    const piece = this.board[r][c];
    const color = piece ? piece[0] : null;

    if (this.selected) {
      const move = this.legalMoves.find(m => m.r === r && m.c === c);
      if (move) {
        this.makeMove(this.selected.r, this.selected.c, r, c);
        this.selected = null;
        this.legalMoves = [];
        this.render();
        this.app.playSound(move.capture ? 'capture' : 'move');
        return;
      }
    }

    if (piece && color === this.turn) {
      this.selected = { r, c };
      this.legalMoves = this.getLegalMoves(r, c);
      this.render();
    } else {
      this.selected = null;
      this.legalMoves = [];
      this.render();
    }
  }

  getLegalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];
    const color = piece[0];
    const type = piece[1];
    const moves = [];
    const size = this.boardSize;

    const isValid = (nr, nc) => nr >= 0 && nr < size && nc >= 0 && nc < size;
    const isEnemy = (nr, nc) => {
      const p = this.board[nr][nc];
      return p && p[0] !== color;
    };
    const isEmpty = (nr, nc) => !this.board[nr][nc];

    // Hidden Queen: if this is the secret pawn, treat as queen
    let effectiveType = type;
    if (this.mode === 'hidden' && this.hiddenQueen[color] && 
        this.hiddenQueen[color].r === r && this.hiddenQueen[color].c === c && type === 'p') {
      effectiveType = 'q';
    }

    if (effectiveType === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? size - 2 : 1;
      // Forward
      if (isValid(r + dir, c) && isEmpty(r + dir, c)) {
        moves.push({ r: r + dir, c, capture: false });
        if (r === startRow && isEmpty(r + 2 * dir, c)) {
          moves.push({ r: r + 2 * dir, c, capture: false });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        if (isValid(r + dir, c + dc) && isEnemy(r + dir, c + dc)) {
          moves.push({ r: r + dir, c: c + dc, capture: true });
        }
      }
    } else if (effectiveType === 'r' || effectiveType === 'q') {
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let i = 1; i < size; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (!isValid(nr, nc)) break;
          if (isEmpty(nr, nc)) moves.push({ r: nr, c: nc, capture: false });
          else if (isEnemy(nr, nc)) { moves.push({ r: nr, c: nc, capture: true }); break; }
          else break;
        }
      }
    }
    if (effectiveType === 'b' || effectiveType === 'q') {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let i = 1; i < size; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (!isValid(nr, nc)) break;
          if (isEmpty(nr, nc)) moves.push({ r: nr, c: nc, capture: false });
          else if (isEnemy(nr, nc)) { moves.push({ r: nr, c: nc, capture: true }); break; }
          else break;
        }
      }
    }
    if (effectiveType === 'n') {
      for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
        const nr = r + dr, nc = c + dc;
        if (isValid(nr, nc) && (isEmpty(nr, nc) || isEnemy(nr, nc))) {
          moves.push({ r: nr, c: nc, capture: isEnemy(nr, nc) });
        }
      }
    }
    if (effectiveType === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (isValid(nr, nc) && (isEmpty(nr, nc) || isEnemy(nr, nc))) {
            moves.push({ r: nr, c: nc, capture: isEnemy(nr, nc) });
          }
        }
      }
    }

    return moves;
  }

  makeMove(fromR, fromC, toR, toC) {
    const piece = this.board[fromR][fromC];
    const captured = this.board[toR][toC];

    // Hidden Queen selection prompt on first click of own pawn at start
    if (this.mode === 'hidden' && this.moveHistory.length === 0 && piece && piece[1] === 'p' && piece[0] === this.turn && !this.hiddenQueen[this.turn]) {
      if (confirm('Make this pawn your Secret Queen? (It will move like a Queen but look like a pawn to the opponent)')) {
        this.hiddenQueen[this.turn] = { r: fromR, c: fromC };
      }
    }

    this.board[toR][toC] = piece;
    this.board[fromR][fromC] = null;

    this.moveHistory.push({ from: [fromR, fromC], to: [toR, toC], piece, captured });
    this.turn = this.turn === 'w' ? 'b' : 'w';

    const notation = this.toNotation(fromR, fromC, toR, toC, captured);
    const li = document.createElement('li');
    li.textContent = notation;
    document.getElementById('move-list').appendChild(li);

    let status = (this.turn === 'w' ? 'White' : 'Black') + ' to move';
    if (this.isInCheck(this.turn)) {
      status += ' - Check!';
      this.app.playSound('check');
    }
    document.getElementById('status').textContent = status;

    // Update captured
    if (captured) {
      const capEl = document.getElementById(captured[0] === 'w' ? 'white-captured' : 'black-captured');
      const img = document.createElement('div');
      img.className = 'piece';
      img.style.width = '24px';
      img.style.height = '24px';
      img.style.backgroundImage = `url(${this.pieceBase[this.pieceSet]}${captured[0]}${captured[1].toUpperCase()}.svg)`;
      capEl.appendChild(img);
    }
  }

  toNotation(fr, fc, tr, tc, captured) {
    const files = 'abcdefghij';
    const piece = this.board[tr][tc][1].toUpperCase();
    const from = files[fc] + (this.boardSize - fr);
    const to = files[tc] + (this.boardSize - tr);
    return (piece === 'P' ? '' : piece) + (captured ? 'x' : '') + to;
  }

  isInCheck(color) {
    // Find king
    let kr, kc;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === color + 'k') { kr = r; kc = c; break; }
      }
    }
    if (kr === undefined) return false;
    // Check if any enemy piece attacks king
    const enemy = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] && this.board[r][c][0] === enemy) {
          const moves = this.getLegalMoves(r, c);
          if (moves.some(m => m.r === kr && m.c === kc)) return true;
        }
      }
    }
    return false;
  }
}

// Hidden Queen special handling
document.addEventListener('DOMContentLoaded', () => {
  const app = new TwistChess();
  window.twistChess = app;

  // Special for hidden queen: allow selecting secret pawn at start
  document.addEventListener('click', (e) => {
    if (app.game && app.game.mode === 'hidden' && app.game.moveHistory.length === 0) {
      const square = e.target.closest('.square');
      if (square) {
        const r = parseInt(square.dataset.r);
        const c = parseInt(square.dataset.c);
        const piece = app.game.board[r][c];
        if (piece && piece[0] === 'w' && piece[1] === 'p') {
          app.game.hiddenQueen.w = { r, c };
          alert('Secret Queen selected! This pawn is now your hidden queen.');
        }
      }
    }
  });
});