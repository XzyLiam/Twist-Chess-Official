// Sound Effects using Web Audio API - no external files needed
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
        this.init();
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio not supported');
        }
    }

    playTone(freq, duration = 0.1, type = 'sine', vol = this.volume) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol * 0.3, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.05);
    }

    playMove() {
        this.playTone(800, 0.08, 'triangle', 0.4);
    }

    playCapture() {
        this.playTone(400, 0.15, 'sawtooth', 0.6);
        setTimeout(() => this.playTone(200, 0.1, 'square', 0.3), 50);
    }

    playCheck() {
        this.playTone(600, 0.2, 'square', 0.5);
        setTimeout(() => this.playTone(800, 0.15, 'square', 0.4), 100);
    }

    playWin() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.3, 'sine', 0.5), i * 150);
        });
    }

    playIllegal() {
        this.playTone(150, 0.3, 'sawtooth', 0.4);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(vol) {
        this.volume = vol;
    }
}

const sounds = new SoundManager();
