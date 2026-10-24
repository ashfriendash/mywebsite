/*
 * THE LOST FOREST — shared procedural audio
 * All music and sound effects are synthesized with the Web Audio API.
 * No audio downloads, external audio hosts, or copyrighted sound files are used.
 */
(() => {
    "use strict";

    if (window.ForestAudio) return;

    const SETTINGS_KEY = "lostForestAudioSettings_v1";
    const defaults = { music: true, effects: true, musicVolume: 0.22, effectsVolume: 0.58 };
    let settings = { ...defaults };

    try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
        if (stored && typeof stored === "object") {
            settings = {
                music: typeof stored.music === "boolean" ? stored.music : defaults.music,
                effects: typeof stored.effects === "boolean" ? stored.effects : defaults.effects,
                musicVolume: Number.isFinite(stored.musicVolume) ? Math.max(0, Math.min(1, stored.musicVolume)) : defaults.musicVolume,
                effectsVolume: Number.isFinite(stored.effectsVolume) ? Math.max(0, Math.min(1, stored.effectsVolume)) : defaults.effectsVolume
            };
        }
    } catch (_) { /* Audio still works if storage is unavailable. */ }

    let ctx = null;
    let masterBus = null;
    let musicBus = null;
    let sfxBus = null;
    let droneNodes = [];
    let melodyTimer = null;
    let melodyIndex = 0;
    let activeThemeName = null;
    let dock = null;
    let musicIsRunning = false;

    const themes = {
        forest: {
            root: 98, fifth: 146.83,
            notes: [392, 440, 523.25, 587.33, 523.25, 440, 349.23, 392],
            interval: 1750, wave: "sine"
        },
        dark: {
            root: 73.42, fifth: 110,
            notes: [293.66, 349.23, 392, 349.23, 311.13, 261.63, 349.23, 293.66],
            interval: 2050, wave: "triangle"
        },
        dragon: {
            root: 55, fifth: 82.41,
            notes: [220, 261.63, 293.66, 329.63, 293.66, 261.63, 196, 220],
            interval: 1900, wave: "triangle"
        },
        peace: {
            root: 87.31, fifth: 130.81,
            notes: [349.23, 392, 440, 523.25, 587.33, 523.25, 440, 392],
            interval: 1950, wave: "sine"
        },
        memory: {
            root: 82.41, fifth: 123.47,
            notes: [329.63, 392, 440, 493.88, 587.33, 493.88, 440, 392],
            interval: 1650, wave: "sine"
        }
    };

    function saveSettings() {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
        catch (_) { /* Settings remain usable for this page. */ }
        updateDock();
    }

    function detectTheme() {
        const body = document.body;
        if (!body) return "forest";
        const cls = body.classList;
        const enemy = body.dataset.enemy || "";
        const path = (location.pathname || "").toLowerCase();

        if (cls.contains("guardian-ending-page") || cls.contains("peace-page") || path.includes("peace.html") || path.includes("guardian")) return "peace";
        if (cls.contains("bad-ending-page") || cls.contains("dark-shop-page") || enemy === "merchant" || path.includes("bad-ending") || path.includes("darkshop")) return "dark";
        if (cls.contains("dragon-page") || enemy === "dragon" || path.includes("dragon")) return "dragon";
        if (cls.contains("memory-page") || path.includes("memory.html")) return "memory";
        return "forest";
    }

    function ensureContext() {
        if (ctx) {
            if (ctx.state === "suspended") ctx.resume().catch(() => {});
            return true;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return false;

        try {
            ctx = new AudioContextClass();
            masterBus = ctx.createGain();
            musicBus = ctx.createGain();
            sfxBus = ctx.createGain();

            masterBus.gain.value = 0.85;
            musicBus.gain.value = 0;
            sfxBus.gain.value = 0;

            musicBus.connect(masterBus);
            sfxBus.connect(masterBus);
            masterBus.connect(ctx.destination);

            ctx.resume().catch(() => {});
            updateBusLevels();
            return true;
        } catch (error) {
            console.warn("Forest audio could not be initialized.", error);
            return false;
        }
    }

    function rampGain(param, value, time = 0.12) {
        if (!ctx || !param) return;
        const now = ctx.currentTime;
        param.cancelScheduledValues(now);
        param.setTargetAtTime(Math.max(0.0001, value), now, time);
    }

    function updateBusLevels() {
        if (!ctx) return;
        rampGain(masterBus.gain, 0.85, 0.08);
        rampGain(sfxBus.gain, settings.effects ? settings.effectsVolume : 0, 0.06);
        rampGain(musicBus.gain, settings.music && musicIsRunning ? settings.musicVolume : 0, 0.6);
    }

    function tone(freq, duration, options = {}) {
        if (!ctx || !sfxBus || !settings.effects) return;
        const now = ctx.currentTime + (options.delay || 0);
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        const type = options.wave || "sine";
        const peak = Math.max(0.0002, options.volume ?? 0.18);

        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(1, freq), now);
        if (options.endFreq && options.endFreq > 0) {
            osc.frequency.exponentialRampToValueAtTime(options.endFreq, now + duration);
        }
        if (options.detune) osc.detune.setValueAtTime(options.detune, now);

        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.025, duration * 0.25));
        amp.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.04, duration));

        osc.connect(amp);
        amp.connect(sfxBus);
        osc.start(now);
        osc.stop(now + duration + 0.035);
    }

    function noise(duration, options = {}) {
        if (!ctx || !sfxBus || !settings.effects) return;
        const now = ctx.currentTime + (options.delay || 0);
        const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            // Short, quiet generated noise for rustles, swishes, and impacts.
            data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount * 0.35);
        }

        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const amp = ctx.createGain();
        source.buffer = buffer;
        filter.type = options.filterType || "lowpass";
        filter.frequency.setValueAtTime(options.cutoff || 1100, now);
        if (options.endCutoff) {
            filter.frequency.exponentialRampToValueAtTime(Math.max(80, options.endCutoff), now + duration);
        }
        filter.Q.value = options.q || 0.7;

        const peak = Math.max(0.0002, options.volume ?? 0.12);
        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.012, duration * 0.2));
        amp.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.04, duration));

        source.connect(filter);
        filter.connect(amp);
        amp.connect(sfxBus);
        source.start(now);
        source.stop(now + duration + 0.02);
    }

    function stopMusic(immediate = false) {
        if (melodyTimer !== null) {
            clearTimeout(melodyTimer);
            melodyTimer = null;
        }
        if (ctx && musicBus) {
            rampGain(musicBus.gain, 0, immediate ? 0.03 : 0.35);
        }
        const oldNodes = droneNodes.slice();
        droneNodes = [];
        musicIsRunning = false;
        oldNodes.forEach(node => {
            try {
                if (immediate) node.osc.stop();
                else node.osc.stop(ctx.currentTime + 0.7);
            } catch (_) { /* Already stopped. */ }
        });
    }

    function musicNote(freq, duration, wave = "sine", volume = 0.13) {
        if (!ctx || !musicBus || !settings.music || !musicIsRunning) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1900, now);

        amp.gain.setValueAtTime(0.0001, now);
        amp.gain.linearRampToValueAtTime(volume, now + 0.18);
        amp.gain.setTargetAtTime(0.0001, now + Math.max(0.2, duration * 0.45), Math.max(0.12, duration * 0.2));

        osc.connect(filter);
        filter.connect(amp);
        amp.connect(musicBus);
        osc.start(now);
        osc.stop(now + duration + 0.25);
    }

    function scheduleMelody(themeName) {
        if (!ctx || !settings.music || !musicIsRunning) return;
        const theme = themes[themeName] || themes.forest;
        const sequence = [0, 2, 1, 3, 2, 4, 1, 0, 3, 2, 5, 3, 1, 4, 2, 0];
        const scaleIndex = sequence[melodyIndex % sequence.length];
        const freq = theme.notes[scaleIndex % theme.notes.length];
        musicNote(freq, 1.55, theme.wave, 0.13);

        // Occasionally add a higher, softer note for a slightly richer score.
        if (melodyIndex % 4 === 2) {
            musicNote(freq * 2, 1.05, "sine", 0.035);
        }
        melodyIndex++;
        melodyTimer = setTimeout(() => scheduleMelody(themeName), theme.interval);
    }

    function startMusic() {
        if (!settings.music || !ensureContext()) return;
        const themeName = detectTheme();
        if (musicIsRunning && activeThemeName === themeName) {
            updateBusLevels();
            return;
        }

        stopMusic(true);
        activeThemeName = themeName;
        melodyIndex = 0;
        musicIsRunning = true;

        const theme = themes[themeName] || themes.forest;
        const now = ctx.currentTime;
        rampGain(musicBus.gain, settings.musicVolume, 0.8);

        const droneFilter = ctx.createBiquadFilter();
        droneFilter.type = "lowpass";
        droneFilter.frequency.value = themeName === "dark" || themeName === "dragon" ? 420 : 650;
        droneFilter.connect(musicBus);

        [
            { frequency: theme.root, type: "sine", volume: 0.18, detune: -3 },
            { frequency: theme.fifth, type: "sine", volume: 0.075, detune: 3 }
        ].forEach(part => {
            const osc = ctx.createOscillator();
            const amp = ctx.createGain();
            osc.type = part.type;
            osc.frequency.setValueAtTime(part.frequency, now);
            osc.detune.setValueAtTime(part.detune, now);
            amp.gain.value = part.volume;
            osc.connect(amp);
            amp.connect(droneFilter);
            osc.start(now);
            droneNodes.push({ osc, amp, filter: droneFilter });
        });

        melodyTimer = setTimeout(() => scheduleMelody(themeName), 650);
    }

    function unlockAudio() {
        if (!ensureContext()) return;
        if (settings.music && !musicIsRunning) startMusic();
        updateBusLevels();
    }

    function play(name, detail) {
        if (!settings.effects) return;
        if (!ensureContext()) return;

        const n = String(name || "click");
        switch (n) {
            case "click":
                tone(660, 0.055, { volume: 0.07 });
                break;
            case "navigate":
                tone(540, 0.075, { volume: 0.07 });
                tone(760, 0.10, { volume: 0.055, delay: 0.055 });
                break;
            case "gold":
                tone(880, 0.16, { volume: 0.18 });
                tone(1174.66, 0.22, { volume: 0.13, delay: 0.09 });
                tone(1567.98, 0.28, { volume: 0.09, delay: 0.18 });
                break;
            case "key":
                tone(1046.5, 0.10, { wave: "triangle", volume: 0.15 });
                tone(1396.9, 0.21, { wave: "sine", volume: 0.12, delay: 0.08 });
                tone(1760, 0.16, { volume: 0.07, delay: 0.16 });
                break;
            case "heal":
                tone(392, 0.42, { endFreq: 784, volume: 0.16 });
                tone(587.33, 0.52, { endFreq: 1174.66, volume: 0.09, delay: 0.08 });
                tone(1567.98, 0.35, { volume: 0.055, delay: 0.23 });
                break;
            case "potion":
                tone(330, 0.15, { endFreq: 480, wave: "sine", volume: 0.11 });
                tone(260, 0.17, { endFreq: 390, wave: "triangle", volume: 0.08, delay: 0.12 });
                tone(520, 0.25, { endFreq: 740, volume: 0.08, delay: 0.25 });
                break;
            case "damage":
                noise(0.16, { cutoff: 380, endCutoff: 170, volume: 0.24 });
                tone(115, 0.19, { endFreq: 72, wave: "triangle", volume: 0.18 });
                break;
            case "wolfAttack":
                noise(0.28, { cutoff: 650, endCutoff: 210, volume: 0.22 });
                tone(105, 0.30, { endFreq: 65, wave: "sawtooth", volume: 0.12 });
                break;
            case "merchantAttack":
                tone(145, 0.27, { endFreq: 83, wave: "sawtooth", volume: 0.12 });
                noise(0.18, { cutoff: 520, endCutoff: 230, volume: 0.15, delay: 0.04 });
                break;
            case "dragonAttack":
                noise(0.42, { cutoff: 340, endCutoff: 90, volume: 0.28 });
                tone(73.42, 0.45, { endFreq: 45, wave: "sawtooth", volume: 0.17 });
                tone(110, 0.28, { endFreq: 58, wave: "triangle", volume: 0.09, delay: 0.06 });
                break;
            case "sword":
                noise(0.19, { cutoff: 2100, endCutoff: 560, filterType: "bandpass", q: 0.7, volume: 0.22 });
                tone(740, 0.08, { endFreq: 320, volume: 0.07 });
                break;
            case "heavy":
                noise(0.28, { cutoff: 900, endCutoff: 120, volume: 0.29 });
                tone(145, 0.27, { endFreq: 55, wave: "sawtooth", volume: 0.20 });
                break;
            case "chest":
                noise(0.16, { cutoff: 420, endCutoff: 180, volume: 0.16 });
                tone(330, 0.18, { volume: 0.11, delay: 0.08 });
                tone(660, 0.20, { volume: 0.13, delay: 0.17 });
                tone(990, 0.25, { volume: 0.10, delay: 0.27 });
                tone(1320, 0.32, { volume: 0.07, delay: 0.38 });
                break;
            case "purchase":
                tone(660, 0.12, { volume: 0.13 });
                tone(880, 0.16, { volume: 0.12, delay: 0.08 });
                tone(1174.66, 0.21, { volume: 0.09, delay: 0.16 });
                break;
            case "search":
                noise(0.15, { cutoff: 1000, endCutoff: 450, volume: 0.09 });
                tone(440, 0.07, { volume: 0.045, delay: 0.08 });
                break;
            case "run":
                noise(0.22, { cutoff: 1500, endCutoff: 260, filterType: "bandpass", volume: 0.15 });
                tone(310, 0.18, { endFreq: 190, volume: 0.07, delay: 0.06 });
                break;
            case "revive":
                tone(220, 0.65, { endFreq: 880, volume: 0.15 });
                tone(440, 0.62, { endFreq: 1320, volume: 0.10, delay: 0.06 });
                tone(1760, 0.55, { volume: 0.07, delay: 0.27 });
                break;
            case "victory":
            case "levelComplete":
                tone(523.25, 0.24, { volume: 0.13 });
                tone(659.25, 0.25, { volume: 0.12, delay: 0.12 });
                tone(783.99, 0.30, { volume: 0.12, delay: 0.24 });
                tone(1046.5, 0.48, { volume: 0.10, delay: 0.36 });
                break;
            case "unlock":
                tone(587.33, 0.22, { volume: 0.12 });
                tone(783.99, 0.25, { volume: 0.10, delay: 0.12 });
                tone(1174.66, 0.42, { volume: 0.09, delay: 0.25 });
                break;
            case "error":
            case "memoryWrong":
                tone(230, 0.18, { endFreq: 155, wave: "triangle", volume: 0.13 });
                break;
            case "fireflyCatch":
                tone(1174.66, 0.12, { volume: 0.14 });
                tone(1567.98, 0.22, { volume: 0.12, delay: 0.07 });
                tone(2093, 0.29, { volume: 0.065, delay: 0.14 });
                break;
            case "memoryFlash": {
                const notes = [523.25, 440, 392, 659.25, 493.88, 587.33];
                tone(notes[Number(detail) % notes.length] || 523.25, 0.24, { volume: 0.11 });
                break;
            }
            case "memoryTap": {
                const notes = [587.33, 493.88, 440, 698.46, 554.37, 659.25];
                tone(notes[Number(detail) % notes.length] || 587.33, 0.11, { volume: 0.10 });
                break;
            }
            default:
                tone(660, 0.055, { volume: 0.06 });
        }
    }

    function numberFrom(selector) {
        const el = document.querySelector(selector);
        if (!el) return null;
        const match = (el.textContent || "").match(/-?\d+/);
        return match ? Number(match[0]) : null;
    }

    function isCombatPage() {
        const enemy = document.body?.dataset?.enemy;
        return enemy === "wolf" || enemy === "merchant" || enemy === "dragon";
    }

    function wrapGameFunction(name, handler) {
        const original = window[name];
        if (typeof original !== "function" || original.__forestAudioWrapped) return;

        const wrapped = function (...args) {
            return handler.call(this, original, args);
        };
        wrapped.__forestAudioWrapped = true;
        window[name] = wrapped;
    }

    function installGameSounds() {
        wrapGameFunction("GainGold", (original, args) => {
            const result = original.apply(window, args);
            play("gold");
            return result;
        });

        wrapGameFunction("FindKey", (original, args) => {
            const before = numberFrom("#keys");
            const result = original.apply(window, args);
            play("key");
            if (before !== null && before < 15 && numberFrom("#keys") >= 15) play("unlock");
            return result;
        });

        wrapGameFunction("Heal", (original, args) => {
            const before = numberFrom("#potion-count");
            const result = original.apply(window, args);
            const after = numberFrom("#potion-count");
            if (before !== null && after !== null && after < before) play("heal");
            else play("error");
            return result;
        });

        wrapGameFunction("LooseHealth", (original, args) => {
            const result = original.apply(window, args);
            if (!isCombatPage()) play("damage");
            return result;
        });

        wrapGameFunction("BuyPotion", (original, args) => {
            const goldBefore = numberFrom("#gold");
            const potionsBefore = numberFrom("#potion-count");
            const result = original.apply(window, args);
            const goldAfter = numberFrom("#gold");
            const potionsAfter = numberFrom("#potion-count");
            if (goldBefore !== null && goldAfter !== null && goldAfter < goldBefore && potionsAfter > potionsBefore) play("purchase");
            else play("error");
            return result;
        });

        wrapGameFunction("OpenChest", (original, args) => {
            const before = numberFrom("#gold");
            const result = original.apply(window, args);
            const after = numberFrom("#gold");
            play(before !== null && after !== null && after > before ? "chest" : "click");
            return result;
        });

        wrapGameFunction("SwordAttack", (original, args) => {
            play("sword");
            return original.apply(window, args);
        });

        wrapGameFunction("HeavyAttack", (original, args) => {
            play("heavy");
            return original.apply(window, args);
        });

        wrapGameFunction("EnemyAttack", (original, args) => {
            const enemy = document.body?.dataset?.enemy;
            if (enemy === "wolf") play("wolfAttack");
            else if (enemy === "merchant") play("merchantAttack");
            else if (enemy === "dragon") play("dragonAttack");
            else play("damage");
            return original.apply(window, args);
        });

        wrapGameFunction("WinBattle", (original, args) => {
            const enemy = document.body?.dataset?.enemy;
            play(enemy === "merchant" || enemy === "dragon" ? "levelComplete" : "victory");
            return original.apply(window, args);
        });

        wrapGameFunction("RunAway", (original, args) => {
            play("run");
            return original.apply(window, args);
        });

        wrapGameFunction("SearchForKey", (original, args) => {
            const before = numberFrom("#keys");
            const result = original.apply(window, args);
            const after = numberFrom("#keys");
            if (before !== null && after !== null && after > before) play("key");
            else play("search");
            return result;
        });

        wrapGameFunction("ReviveGame", (original, args) => {
            const screen = document.getElementById("game-over");
            const wasVisible = screen && getComputedStyle(screen).display !== "none";
            const result = original.apply(window, args);
            if (wasVisible && screen && getComputedStyle(screen).display === "none") play("revive");
            else play("click");
            return result;
        });
    }

    function updateDock() {
        if (!dock) return;
        const musicButton = dock.querySelector("[data-audio-action='music']");
        const effectsButton = dock.querySelector("[data-audio-action='effects']");
        const musicRange = dock.querySelector("[data-audio-volume='music']");
        const effectsRange = dock.querySelector("[data-audio-volume='effects']");
        if (musicButton) {
            musicButton.textContent = `Music: ${settings.music ? "On" : "Off"}`;
            musicButton.setAttribute("aria-pressed", String(settings.music));
        }
        if (effectsButton) {
            effectsButton.textContent = `Sound effects: ${settings.effects ? "On" : "Off"}`;
            effectsButton.setAttribute("aria-pressed", String(settings.effects));
        }
        if (musicRange) musicRange.value = String(settings.musicVolume);
        if (effectsRange) effectsRange.value = String(settings.effectsVolume);
        const launcher = dock.querySelector(".forest-audio-launcher");
        if (launcher) launcher.textContent = settings.music || settings.effects ? "♫" : "♪̸";
    }

    function installDock() {
        if (!document.body || dock) return;

        const style = document.createElement("style");
        style.textContent = `
            .forest-audio-dock { position:fixed; left:12px; bottom:12px; z-index:9000; font-family:Lora,serif; }
            .forest-audio-launcher { width:42px; height:42px; border:1px solid rgba(224,211,164,.42); border-radius:50%; background:rgba(9,25,16,.94); color:#f0dfa0; font-size:19px; cursor:pointer; box-shadow:0 4px 17px rgba(0,0,0,.32); backdrop-filter:blur(8px); transition:transform .2s,border-color .2s,background .2s; }
            .forest-audio-launcher:hover { transform:translateY(-2px); border-color:#f0dfa0; background:rgba(37,61,40,.98); }
            .forest-audio-launcher:focus-visible,.forest-audio-control:focus-visible { outline:2px solid #eadba6; outline-offset:3px; }
            .forest-audio-panel { position:absolute; left:0; bottom:51px; width:min(244px,calc(100vw - 24px)); padding:14px; border:1px solid rgba(224,211,164,.33); border-radius:14px; background:rgba(8,22,14,.97); color:#e9e3ce; box-shadow:0 12px 34px rgba(0,0,0,.42); backdrop-filter:blur(12px); }
            .forest-audio-panel[hidden] { display:none !important; }
            .forest-audio-heading { margin:0 0 11px; color:#efdfaa; font:600 11px Cinzel,serif; letter-spacing:.12em; }
            .forest-audio-control { width:100%; padding:8px 9px; border:1px solid rgba(205,203,160,.25); border-radius:8px; background:rgba(255,255,255,.035); color:#e7e2d0; font:11px Lora,serif; text-align:left; cursor:pointer; }
            .forest-audio-control + .forest-audio-control { margin-top:7px; }
            .forest-audio-control[aria-pressed='true'] { border-color:rgba(211,205,139,.48); color:#f3e7bb; background:rgba(175,173,98,.09); }
            .forest-audio-slider-row { display:flex; align-items:center; justify-content:space-between; gap:9px; margin-top:10px; color:#bdcbb5; font-size:10px; }
            .forest-audio-slider-row input { width:105px; accent-color:#d9c783; }
            .forest-audio-hint { margin:10px 0 0; color:#98a991; font-size:9px; line-height:1.45; }
            @media (max-width:480px) { .forest-audio-dock { left:8px; bottom:8px; } .forest-audio-launcher { width:38px; height:38px; } .forest-audio-panel { bottom:46px; } }
            @media (prefers-reduced-motion:reduce) { .forest-audio-launcher { transition:none; } }
        `;
        document.head.appendChild(style);

        dock = document.createElement("div");
        dock.className = "forest-audio-dock";
        dock.innerHTML = `
            <button type="button" class="forest-audio-launcher" aria-label="Open sound settings" aria-expanded="false" title="Sound settings">♫</button>
            <section class="forest-audio-panel" aria-label="Sound settings" hidden>
                <p class="forest-audio-heading">FOREST SOUND</p>
                <button type="button" class="forest-audio-control" data-audio-action="music" aria-pressed="true">Music: On</button>
                <button type="button" class="forest-audio-control" data-audio-action="effects" aria-pressed="true">Sound effects: On</button>
                <label class="forest-audio-slider-row">Music volume <input type="range" min="0" max="0.5" step="0.01" value="0.22" data-audio-volume="music"></label>
                <label class="forest-audio-slider-row">Effects volume <input type="range" min="0" max="1" step="0.01" value="0.58" data-audio-volume="effects"></label>
                <p class="forest-audio-hint">Sound begins after your first click. Your choices are saved on this device.</p>
            </section>
        `;
        document.body.appendChild(dock);

        const launcher = dock.querySelector(".forest-audio-launcher");
        const panel = dock.querySelector(".forest-audio-panel");
        launcher.addEventListener("click", () => {
            const open = panel.hidden;
            panel.hidden = !open;
            launcher.setAttribute("aria-expanded", String(open));
            if (open) play("click");
        });

        dock.querySelector("[data-audio-action='music']").addEventListener("click", () => {
            settings.music = !settings.music;
            if (settings.music) {
                unlockAudio();
                startMusic();
            } else {
                stopMusic();
            }
            saveSettings();
            updateBusLevels();
            if (settings.effects) play("click");
        });

        dock.querySelector("[data-audio-action='effects']").addEventListener("click", () => {
            settings.effects = !settings.effects;
            saveSettings();
            updateBusLevels();
            if (settings.effects) play("click");
        });

        dock.querySelector("[data-audio-volume='music']").addEventListener("input", event => {
            settings.musicVolume = Number(event.target.value);
            saveSettings();
            updateBusLevels();
        });

        dock.querySelector("[data-audio-volume='effects']").addEventListener("input", event => {
            settings.effectsVolume = Number(event.target.value);
            saveSettings();
            updateBusLevels();
        });

        updateDock();
    }

    function playNavigationOnLink(event) {
        const anchor = event.target.closest("a[href]");
        if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
        const href = anchor.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
        try {
            const destination = new URL(href, location.href);
            if (destination.origin === location.origin && settings.effects) play("navigate");
        } catch (_) { /* Ignore malformed links. */ }
    }

    function boot() {
        installDock();
        installGameSounds();

        // Browsers require a real user gesture before sound can begin.
        document.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
        document.addEventListener("keydown", unlockAudio, { capture: true });
        document.addEventListener("click", playNavigationOnLink, true);

        // Restore music automatically when a tab becomes visible again.
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && ctx && settings.music) {
                if (ctx.state === "suspended") ctx.resume().catch(() => {});
                if (!musicIsRunning) startMusic();
            }
        });
    }

    window.ForestAudio = {
        play,
        unlock: unlockAudio,
        setMusic(enabled) {
            settings.music = Boolean(enabled);
            if (settings.music) startMusic(); else stopMusic();
            saveSettings();
            updateBusLevels();
        },
        setEffects(enabled) {
            settings.effects = Boolean(enabled);
            saveSettings();
            updateBusLevels();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
