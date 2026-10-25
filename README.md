# TwistChess

Professional chess website with unique game modes and twists.

## Features
- Multiple game modes: Standard, ROOOK (knights/bishops as rooks), Big Board (10x10), Small Board (6x6), Hidden Queen, Fog of War, Atomic, Crazyhouse
- Login/Signup with localStorage
- Profile, Friends, Recent Games
- Highly customizable settings: Themes, Board colors, Piece sets, Sounds, Board scale
- Smooth modern UI inspired by Chess.com
- Sound effects via Web Audio API
- SVG piece icons (classic set fully implemented)
- Responsive design

## How to run
1. Open `index.html` in a browser (or serve with any static server)
2. Sign up / Login (data stored in browser localStorage)
3. Select game modes and play
4. Customize in Settings

## File Structure
- `index.html` - Main HTML
- `css/style.css` - Styles
- `js/auth.js` - Authentication
- `js/chess.js` - Chess engine & logic
- `js/modes.js` - Game modes
- `js/pieces.js` - Piece SVG sets
- `js/ui.js` - UI rendering & interactions
- `js/sounds.js` - Sound effects
- `js/settings.js` - Settings management
- `js/main.js` - Entry

## Notes
- Full chess rules (castling, en passant, full check detection) are simplified for this demo; expand as needed
- Piece sets: Classic has full SVGs; others are placeholders - add more SVG sets
- For production: add backend, multiplayer (WebSockets), better AI, more modes
- Icons and themes are customizable

Copy these files to your GitHub repo and host on GitHub Pages or similar.

Enjoy TwistChess!
