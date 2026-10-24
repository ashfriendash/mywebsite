# The Lost Forest

*A small browser-based fantasy adventure about exploring a mysterious forest, managing your resources, and choosing how your story ends.*

## About the Game

You wake up in a strange forest with two paths ahead. Explore different locations, collect resources, face enemies, and uncover the forest's secrets. Your choices and preparation affect how far you can go.

The Lost Forest is built with **HTML, CSS, and JavaScript**. It runs in a web browser and does not require a backend or a package installation.

## Features

- **Branching exploration:** travel through different forest locations and make choices as you progress.
- **Resource management:** keep track of health, gold, keys, and potions.
- **Combat:** fight enemies including the Forest Wolf, Evil Merchant, and Ancient Dragon.
- **Items and recovery:** find gold, search for keys, buy potions, and use potions to restore health.
- **Unlockable challenge:** collect **15 keys** to unlock the Dragon's Den.
- **Multiple outcomes:** your encounters can lead to different endings, including a peaceful outcome and a treasure ending.
- **Side activities:** follow a firefly, try the five-level memory challenge, and revisit discoveries in the Forest Journal.
- **Atmospheric presentation:** a forest-inspired interface with audio and visual effects.
- **Saved progress:** game state is stored in your browser using `localStorage`.

## How to Play

1. Start from the game's main page and choose a path.
2. Explore each location and read the story before choosing an action.
3. Watch your health and collect gold, keys, and potions as you go.
4. Use potions when you need to recover health, and prepare before challenging stronger enemies.
5. Keep exploring to unlock new areas and discover the available endings.

**Tip:** The Dragon's Den requires 15 keys, so search carefully and manage your resources along the way.

## Run Locally

The game is made from static web files, so there is no build step.

### Option 1: Visual Studio Code

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Run the main game page with an extension such as **Live Server**.
4. Open the local address provided by the extension in your browser.

### Option 2: Open the HTML file

You can open the main HTML page directly in a browser. Using a local server is recommended if you run into issues with browser file restrictions or linked assets.

## Project Files

The project uses separate HTML pages for locations and activities, shared styling, and JavaScript for game logic and audio. Important files include:

- `game.html` — main game screen
- `left.html` and `right.html` — the two initial paths
- `wolf.html`, `dragon.html`, and other location pages — encounters and story progression
- `firefly.html` — firefly side activity
- `memory.html` — memory challenge
- `journal.html` — Forest Journal
- `style.css` — shared visual styling
- `script.js` — health, inventory, combat, progression, and saved game state
- `audio.js` — audio functionality

Keep the HTML, CSS, JavaScript, and any image or audio assets in their expected relative paths so the pages continue to work when hosted.

## Tech Stack

- **HTML5** for the game pages and structure
- **CSS3** for layout, styling, and visual effects
- **Vanilla JavaScript** for game logic and interactions
- **Browser `localStorage`** for saving game state
- **Web Audio API** for generated audio, where supported by the browser

## Saved Progress

The game stores progress in the current browser's local storage. Progress is specific to the browser and site origin, so it generally will not carry over to a different browser or a different deployment URL. Clearing the site's local storage will erase the saved game and may also clear other preferences stored by the game.

## Publishing

The project can be hosted as a static website with a service such as **GitHub Pages**:

1. Push the project files to a public GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose the branch and folder containing the website files, then save.
4. Open the published URL and test the game, navigation, audio, and saved progress.

For the repository root to open the game automatically on GitHub Pages, make sure it contains an `index.html` entry page. If the main page is named `game.html` instead, the published link may need to end in `/game.html` unless `index.html` directs visitors to it.

## Project Status

The Lost Forest is an independent personal project. Features and presentation may change as the game is tested and improved.
