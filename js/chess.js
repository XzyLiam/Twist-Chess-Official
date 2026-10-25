// Chess Engine for TwistChess
class ChessGame {
    constructor(mode = 'standard') {
        this.mode = mode;
        this.boardSize = mode === 'bigboard' ? 10 : mode === 'smallboard' ? 6 : 8;
        this.board = [];
        this.turn = 'w';
        this.moveHistory = [];
        this.selected = null;
        this.possibleMoves = [];
        this.hiddenQueens = { w: null, b: null };
        this.gameOver = false;
        this.winner = null;
        this.initBoard();
    }

    initBoard() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        if (this.mode === 'standard' || this.mode === 'hiddenqueen' || this.mode === 'fog' || this.mode === 'atomic' || this.mode === 'crazyhouse') {
            this.setupStandard();
        } else if (this.mode === 'roook') {
            this.setupROOOK();
        } else if (this.mode === 'bigboard') {
            this.setupBig();
        } else if (this.mode === 'smallboard') {
            this.setupSmall();
        }
    }

    setupStandard() {
        const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = { type: back[i], color: 'b', moved: false };
            this.board[1][i] = { type: 'p', color: 'b', moved: false };
            this.board[6][i] = { type: 'p', color: 'w', moved: false };
            this.board[7][i] = { type: back[i], color: 'w', moved: false };
        }
    }

    setupROOOK() {
        const back = ['r', 'r', 'r', 'q', 'k', 'r', 'r', 'r'];
        for (let i = 0; i < 8; i++) {
            this.board[0][i] = { type: back[i], color: 'b', moved: false };
            this.board[1][i] = { type: 'p', color: 'b', moved: false };
            this.board[6][i] = { type: 'p', color: 'w', moved: false };
            this.board[7][i] = { type: back[i], color: 'w', moved: false };
        }
    }

    setupBig() {
        // 10x10 with extra rooks and pawns
        const back = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r', 'r', 'n'];
        for (let i = 0; i < 10; i++) {
            this.board[0][i] = { type: back[i] || 'r', color: 'b', moved: false };
            this.board[1][i] = { type: 'p', color: 'b', moved: false };
            this.board[8][i] = { type: 'p', color: 'w', moved: false };
            this.board[9][i] = { type: back[i] || 'r', color: 'w', moved: false };
        }
    }

    setupSmall() {
        const back = ['r', 'n', 'b', 'q', 'k', 'b'];
        for (let i = 0; i < 6; i++) {
            this.board[0][i] = { type: back[i], color: 'b', moved: false };
            this.board[1][i] = { type: 'p', color: 'b', moved: false };
            this.board[4][i] = { type: 'p', color: 'w', moved: false };
            this.board[5][i] = { type: back[i], color: 'w', moved: false };
        }
    }

    getPieceCode(piece) {
        if (!piece) return '';
        return piece.color + piece.type.toUpperCase();
    }

    isValidPos(r, c) {
        return r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize;
    }

    getPossibleMoves(r, c) {
        const piece = this.board[r][c];
        if (!piece || piece.color !== this.turn) return [];
        const moves = [];
        const type = piece.type;

        const addMove = (nr, nc) => {
            if (this.isValidPos(nr, nc)) {
                const target = this.board[nr][nc];
                if (!target || target.color !== piece.color) {
                    moves.push([nr, nc]);
                }
            }
        };

        if (type === 'p') {
            const dir = piece.color === 'w' ? -1 : 1;
            const startRow = piece.color === 'w' ? this.boardSize - 2 : 1;
            // Forward
            if (this.isValidPos(r + dir, c) && !this.board[r + dir][c]) {
                moves.push([r + dir, c]);
                if (r === startRow && !this.board[r + 2 * dir][c]) {
                    moves.push([r + 2 * dir, c]);
                }
            }
            // Captures
            for (let dc of [-1, 1]) {
                if (this.isValidPos(r + dir, c + dc) && this.board[r + dir][c + dc] && this.board[r + dir][c + dc].color !== piece.color) {
                    moves.push([r + dir, c + dc]);
                }
            }
            // Hidden queen special: if this is hidden queen, can move like queen
            if (this.mode === 'hiddenqueen' && this.hiddenQueens[piece.color] === `${r},${c}`) {
                // Add queen moves
                this.addSlidingMoves(r, c, moves, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
            }
        } else if (type === 'r' || (this.mode === 'roook' && (type === 'n' || type === 'b'))) {
            this.addSlidingMoves(r, c, moves, [[1,0],[-1,0],[0,1],[0,-1]]);
        } else if (type === 'b') {
            this.addSlidingMoves(r, c, moves, [[1,1],[1,-1],[-1,1],[-1,-1]]);
        } else if (type === 'q') {
            this.addSlidingMoves(r, c, moves, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
        } else if (type === 'n') {
            const knightMoves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
            knightMoves.forEach(([dr, dc]) => addMove(r + dr, c + dc));
        } else if (type === 'k') {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr || dc) addMove(r + dr, c + dc);
                }
            }
            // Castling simplified
        }

        // Filter for check etc. (simplified - full check detection is complex)
        return moves;
    }

    addSlidingMoves(r, c, moves, directions) {
        const piece = this.board[r][c];
        directions.forEach(([dr, dc]) => {
            let nr = r + dr, nc = c + dc;
            while (this.isValidPos(nr, nc)) {
                const target = this.board[nr][nc];
                if (!target) {
                    moves.push([nr, nc]);
                } else {
                    if (target.color !== piece.color) moves.push([nr, nc]);
                    break;
                }
                nr += dr;
                nc += dc;
            }
        });
    }

    makeMove(fromR, fromC, toR, toC) {
        const piece = this.board[fromR][fromC];
        if (!piece) return false;
        const moves = this.getPossibleMoves(fromR, fromC);
        const valid = moves.some(([r, c]) => r === toR && c === toC);
        if (!valid) {
            sounds.playIllegal();
            return false;
        }

        const captured = this.board[toR][toC];
        this.board[toR][toC] = piece;
        this.board[fromR][fromC] = null;
        piece.moved = true;

        // Promotion
        if (piece.type === 'p' && (toR === 0 || toR === this.boardSize - 1)) {
            // Handled in UI
        }

        // Hidden queen reveal on capture or something
        if (this.mode === 'hiddenqueen' && this.hiddenQueens[piece.color] === `${fromR},${fromC}`) {
            this.hiddenQueens[piece.color] = `${toR},${toC}`;
        }

        this.moveHistory.push({ from: [fromR, fromC], to: [toR, toC], piece: piece.type, captured: !!captured });
        if (captured) sounds.playCapture(); else sounds.playMove();

        // Atomic mode: explode around capture
        if (this.mode === 'atomic' && captured) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const er = toR + dr, ec = toC + dc;
                    if (this.isValidPos(er, ec) && this.board[er][ec] && this.board[er][ec].type !== 'p') {
                        this.board[er][ec] = null;
                    }
                }
            }
            this.board[toR][toC] = null; // captured piece gone too
        }

        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.checkGameOver();
        return true;
    }

    checkGameOver() {
        // Simplified: check if king exists
        let whiteKing = false, blackKing = false;
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const p = this.board[r][c];
                if (p && p.type === 'k') {
                    if (p.color === 'w') whiteKing = true;
                    else blackKing = true;
                }
            }
        }
        if (!whiteKing) {
            this.gameOver = true;
            this.winner = 'b';
            sounds.playWin();
        } else if (!blackKing) {
            this.gameOver = true;
            this.winner = 'w';
            sounds.playWin();
        }
    }

    setHiddenQueen(color, r, c) {
        if (this.mode === 'hiddenqueen' && this.board[r][c] && this.board[r][c].type === 'p' && this.board[r][c].color === color) {
            this.hiddenQueens[color] = `${r},${c}`;
            return true;
        }
        return false;
    }
}
