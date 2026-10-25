// Game Modes Configuration
const gameModes = {
    standard: { name: 'Standard Chess', size: 8, description: 'Classic rules' },
    roook: { name: 'ROOOK', size: 8, description: 'Knights and Bishops are Rooks' },
    bigboard: { name: 'Big Board', size: 10, description: '10x10 board' },
    smallboard: { name: 'Small Board', size: 6, description: '6x6 board' },
    hiddenqueen: { name: 'Hidden Queen', size: 8, description: 'Secret queen pawn' },
    fog: { name: 'Fog of War', size: 8, description: 'Limited visibility' },
    atomic: { name: 'Atomic Chess', size: 8, description: 'Exploding captures' },
    crazyhouse: { name: 'Crazyhouse', size: 8, description: 'Drop captured pieces' }
};

function startGame(mode) {
    currentGame = new ChessGame(mode);
    currentMode = mode;
    renderBoard();
    switchView('play');
    if (mode === 'hiddenqueen') {
        alert('Click on one of your pawns to set it as your Hidden Queen!');
    }
}
