// TwistChess - Professional Client-Side Chess with Twists
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
      highlightMoves: true,
      confirmMoves: false
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('twistchess_settings') || '{}') };
    } catch { return defaults; }
  }

  saveSettings() {
    localStorage.setItem('twistchess_settings', JSON.stringify(this.settings));
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.settings.theme);
    const themeSel = document.getElementById('theme-select');
    if (themeSel) themeSel.value = this.settings.theme;
    const boardSel = document.getElementById('board-theme');
    if (boardSel) boardSel.value = this.settings.boardTheme;
    const pieceSel = document.getElementById('piece-set');
    if (pieceSel) pieceSel.value = this.settings.pieceSet;
    const soundCb = document.getElementById('sound-enabled');
    if (soundCb) soundCb.checked = this.settings.soundEnabled;
    const vol = document.getElementById('volume');
    if (vol) vol.value = this.settings.volume * 100;
  }

  checkAuth() {
    const user = localStorage.getItem('twistchess_user');
    if (user) {
      try { this.currentUser = JSON.parse(user); } catch {}
      this.showMainApp();
    }
  }

  showMainApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    const name = this.currentUser?.username || 'Guest';
    document.getElementById('current-user').textContent = name;
    const profileName = document.getElementById('profile-username');
    if (profileName) profileName.textContent = name;
    const avatar = document.getElementById('profile-avatar');
    if (avatar) avatar.textContent = name.slice(0, 2).toUpperCase();
    this.updateProfile();
  }

  bindAuth() {
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.remove('active');
      document.getElementById('signup-form').classList.add('active');
    });
    document.getElementById('show-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('signup-form').classList.remove('active');
      document.getElementById('login-form').classList.add('active');
    });

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      if (username) {
        this.currentUser = { username, email: '', joined: new Date().toISOString() };
        localStorage.setItem('twistchess_user', JSON.stringify(this.currentUser));
        this.showMainApp();
      }
    });

    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      if (username && email) {
        this.currentUser = { username, email, joined: new Date().toISOString() };
        localStorage.setItem('twistchess_user', JSON.stringify(this.currentUser));
        this.showMainApp();
      }
    });

    document.getElementById('guest-btn')?.addEventListener('click', () => {
      this.currentUser = { username: 'Guest', guest: true };
      this.showMainApp();
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('twistchess_user');
      this.currentUser = null;
      document.getElementById('main-app').classList.remove('active');
      document.getElementById('auth-screen').classList.add('active');
    });
  }

  bindNavigation() {
    document.querySelectorAll('.nav-link, [data-page], .mode-card').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = el.dataset.page;
        const mode = el.dataset.mode;
        if (page) this.navigateTo(page);
        if (mode) {
          this.navigateTo('play');
          setTimeout(() => this.startGame(mode), 80);
        }
      });
    });

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.navigateTo('play');
        setTimeout(() => this.startGame(mode), 80);
      });
    });
  }

  navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const pageEl = document.getElementById(page + '-page');
    if (pageEl) pageEl.classList.add('active');
    const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');
    this.currentPage = page;
    if (page === 'recent') this.renderRecentGames();
    if (page === 'profile') this.updateProfile();
  }

  bindSettings() {
    document.getElementById('theme-select')?.addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
      this.applyTheme();
      this.saveSettings();
    });
    document.getElementById('board-theme')?.addEventListener('change', (e) => {
      this.settings.boardTheme = e.target.value;
      this.saveSettings();
      this.game?.render();
    });
    document.getElementById('piece-set')?.addEventListener('change', (e) => {
      this.settings.pieceSet = e.target.value;
      this.saveSettings();
      this.game?.render();
    });
    document.getElementById('sound-enabled')?.addEventListener('change', (e) => {
      this.settings.soundEnabled = e.target.checked;
      this.saveSettings();
    });
    document.getElementById('volume')?.addEventListener('input', (e) => {
      this.settings.volume = e.target.value / 100;
      this.saveSettings();
    });
  }

  updateProfile() {
    const games = this.recentGames.filter(g => g.user === (this.currentUser?.username || 'Guest'));
    const played = document.getElementById('games-played');
    const wins = document.getElementById('wins');
    if (played) played.textContent = games.length;
    if (wins) wins.textContent = games.filter(g => g.result === 'win').length;
  }

  renderRecentGames() {
    const list = document.getElementById('recent-games-list');
    if (!list) return;
    if (!this.recentGames.length) {
      list.innerHTML = '<p class="empty">No games yet. Start playing!</p>';
      return;
    }
    list.innerHTML = this.recentGames.slice(0, 25).map(g => `
      <div class="game-item">
        <div>
          <strong>${g.mode}</strong> — ${g.result}
          <div style="font-size:0.85rem;color:var(--text-secondary)">${new Date(g.date).toLocaleString()}</div>
        </div>
        <span>${g.moves} moves</span>
      </div>
    `).join('');
  }

  startGame(mode = 'standard') {
    const sel = document.getElementById('mode-select');
    if (sel) sel.value = mode;
    this.game = new ChessGame(mode, this);
    this.game.init();
  }

  playSound(type) {
    if (!this.settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = this.settings.volume * 0.25;

      if (type === 'move') {
        osc.frequency.setValueAtTime(720, ctx.currentTime);
        osc.type = 'sine';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'capture') {
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.type = 'triangle';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start(); osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'check') {
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.type = 'square';
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.start(); osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {}
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
    localStorage.setItem('twistchess_games', JSON.stringify(this.recentGames.slice(0, 60)));
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
      california: 'https://lichess1.org/assets/piece/california/',
      fantasy: 'https://lichess1.org/assets/piece/fantasy/'
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
      big: 'Big Board (10×10)',
      small: 'Small Board (6×6)',
      hidden: 'Hidden Queen',
      atomic: 'Atomic Chess',
      fog: 'Fog of War'
    };
    return names[this.mode] || 'Standard';
  }

  setupBoard() {
    const size = this.boardSize;
    this.board = Array.from({ length: size }, () => Array(size).fill(null));

    if (this.mode === 'small') {
      const back = ['r', 'n', 'q', 'k', 'n', 'r'];
      for (let i = 0; i < 6; i++) {
        this.board[0][i] = 'b' + back[i];
        this.board[1][i] = 'bp';
        this.board[4][i] = 'wp';
        this.board[5][i] = 'w' + back[i];
      }
    } else if (this.mode === 'big') {
      const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', 'n', 'r'];
      for (let i = 0; i < 10; i++) {
        this.board[0][i] = 'b' + (back[i] || 'r');
        this.board[1][i] = 'bp';
        this.board[8][i] = 'wp';
        this.board[9][i] = 'w' + (back[i] || 'r');
      }
    } else {
      const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
      for (let i = 0; i < 8; i++) {
        this.board[0][i] = 'b' + back[i];
        this.board[1][i] = 'bp';
        this.board[6][i] = 'wp';
        this.board[7][i] = 'w' + back[i];
      }
    }

    if (this.mode === 'roook') {
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
    const sizePx = Math.min(640, window.innerWidth * 0.62);
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.width = sizePx + 'px';
    boardEl.style.height = sizePx + 'px';
    boardEl.innerHTML = '';

    const base = this.pieceBase[this.pieceSet] || this.pieceBase.cburnett;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
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
          const code = color + type.toUpperCase();
          pieceEl.style.backgroundImage = `url(${base}${code}.svg)`;
          square.appendChild(pieceEl);
        }

        if (this.selected && this.legalMoves.some(m => m.r === r && m.c === c)) {
          square.classList.add(this.board[r][c] ? 'legal-capture' : 'legal-move');
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
      const r = +square.dataset.r;
      const c = +square.dataset.c;
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
      if (this.mode === 'hidden' && this.moveHistory.length === 0 && piece[1] === 'p' && !this.hiddenQueen[this.turn]) {
        if (confirm('Make this pawn your Secret Queen?\nIt will move like a Queen but look like a pawn to the opponent.')) {
          this.hiddenQueen[this.turn] = { r, c };
        }
      }
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
    let type = piece[1];
    const moves = [];
    const size = this.boardSize;

    const valid = (nr, nc) => nr >= 0 && nr < size && nc >= 0 && nc < size;
    const enemy = (nr, nc) => this.board[nr][nc] && this.board[nr][nc][0] !== color;
    const empty = (nr, nc) => !this.board[nr][nc];

    if (this.mode === 'hidden' && this.hiddenQueen[color] &&
        this.hiddenQueen[color].r === r && this.hiddenQueen[color].c === c && type === 'p') {
      type = 'q';
    }

    if (type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const start = color === 'w' ? size - 2 : 1;
      if (valid(r + dir, c) && empty(r + dir, c)) {
        moves.push({ r: r + dir, c, capture: false });
        if (r === start && empty(r + 2 * dir, c)) moves.push({ r: r + 2 * dir, c, capture: false });
      }
      for (const dc of [-1, 1]) {
        if (valid(r + dir, c + dc) && enemy(r + dir, c + dc)) {
          moves.push({ r: r + dir, c: c + dc, capture: true });
        }
      }
    } else if (type === 'r' || type === 'q') {
      for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let i = 1; i < size; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (!valid(nr, nc)) break;
          if (empty(nr, nc)) moves.push({ r: nr, c: nc, capture: false });
          else if (enemy(nr, nc)) { moves.push({ r: nr, c: nc, capture: true }); break; }
          else break;
        }
      }
    }
    if (type === 'b' || type === 'q') {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let i = 1; i < size; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (!valid(nr, nc)) break;
          if (empty(nr, nc)) moves.push({ r: nr, c: nc, capture: false });
          else if (enemy(nr, nc)) { moves.push({ r: nr, c: nc, capture: true }); break; }
          else break;
        }
      }
    }
    if (type === 'n') {
      for (const [dr, dc] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
        const nr = r + dr, nc = c + dc;
        if (valid(nr, nc) && (empty(nr, nc) || enemy(nr, nc))) {
          moves.push({ r: nr, c: nc, capture: enemy(nr, nc) });
        }
      }
    }
    if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nr = r + dr, nc = c + dc;
          if (valid(nr, nc) && (empty(nr, nc) || enemy(nr, nc))) {
            moves.push({ r: nr, c: nc, capture: enemy(nr, nc) });
          }
        }
      }
    }
    return moves;
  }

  makeMove(fr, fc, tr, tc) {
    const piece = this.board[fr][fc];
    const captured = this.board[tr][tc];
    this.board[tr][tc] = piece;
    this.board[fr][fc] = null;

    this.moveHistory.push({ from: [fr, fc], to: [tr, tc], piece, captured });
    this.turn = this.turn === 'w' ? 'b' : 'w';

    const notation = this.toNotation(fr, fc, tr, tc, captured);
    const li = document.createElement('li');
    li.textContent = notation;
    document.getElementById('move-list').appendChild(li);

    let status = (this.turn === 'w' ? 'White' : 'Black') + ' to move';
    if (this.isInCheck(this.turn)) {
      status += ' — Check!';
      this.app.playSound('check');
    }
    document.getElementById('status').textContent = status;

    if (captured) {
      const capEl = document.getElementById(captured[0] === 'w' ? 'white-captured' : 'black-captured');
      const mini = document.createElement('div');
      mini.className = 'piece';
      mini.style.width = '22px';
      mini.style.height = '22px';
      const base = this.pieceBase[this.pieceSet] || this.pieceBase.cburnett;
      mini.style.backgroundImage = `url(${base}${captured[0]}${captured[1].toUpperCase()}.svg)`;
      capEl.appendChild(mini);
    }
  }

  toNotation(fr, fc, tr, tc, captured) {
    const files = 'abcdefghij';
    const type = this.board[tr][tc][1].toUpperCase();
    const to = files[tc] + (this.boardSize - tr);
    return (type === 'P' ? '' : type) + (captured ? 'x' : '') + to;
  }

  isInCheck(color) {
    let kr = -1, kc = -1;
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c] === color + 'k') { kr = r; kc = c; }
      }
    }
    if (kr < 0) return false;
    const enemy = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < this.boardSize; r++) {
      for (let c = 0; c < this.boardSize; c++) {
        if (this.board[r][c]?.[0] === enemy) {
          if (this.getLegalMoves(r, c).some(m => m.r === kr && m.c === kc)) return true;
        }
      }
    }
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.twistChess = new TwistChess();
});
