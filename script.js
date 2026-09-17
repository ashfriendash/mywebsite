// =========================
// PLAYER DATA
// =========================

let health =
    Number(localStorage.getItem("health")) || 100;

let gold =
    Number(localStorage.getItem("gold")) || 0;

let keys =
    Number(localStorage.getItem("keys")) || 0;

let potions =
    Number(localStorage.getItem("potions")) || 0;

let potionsBought =
    Number(localStorage.getItem("potionsBought")) || 0;

let keySearchClicks =
    Number(localStorage.getItem("keySearchClicks")) || 0;

let ChestOpened =
    localStorage.getItem("ChestOpened") === "true";

let merchantDefeated =
    localStorage.getItem("merchantDefeated") === "true";


// =========================
// GAME OVER / REVIVE
// =========================

let gameOver = false;

let reviveClicks = 0;


// =========================
// ENEMY DATA
// =========================

let enemyType =
    document.body.dataset.enemy || "wolf";


function GetEnemyMaxHealth() {

    if (enemyType === "wolf") {
        return 50;
    }

    if (enemyType === "merchant") {
        return 80;
    }

    if (enemyType === "dragon") {
        return 100;
    }

    return 50;
}


let enemyHealth =
    GetEnemyMaxHealth();


// =========================
// COMBAT PAGE CHECK
// =========================

function IsCombatPage() {

    return (
        enemyType === "wolf" ||
        enemyType === "merchant" ||
        enemyType === "dragon"
    );
}


// =========================
// HP BARS
// =========================

function UpdateHealthBars() {

    // PLAYER HP

    let playerBar =
        document.getElementById("player-health-bar");

    let playerText =
        document.getElementById("player-health-text");


    if (playerBar) {

        let playerPercent =
            (health / 100) * 100;

        playerBar.style.width =
            playerPercent + "%";


        if (health <= 25) {

            playerBar.style.background =
                "linear-gradient(90deg, #a51f1f, #ff4f4f)";

        } else if (health <= 50) {

            playerBar.style.background =
                "linear-gradient(90deg, #b97816, #ffc84d)";

        } else {

            playerBar.style.background =
                "linear-gradient(90deg, #3acb65, #8cff9e)";
        }
    }


    if (playerText) {

        playerText.innerHTML =
            health + " / 100";
    }


    // ENEMY HP

    let enemyBar =
        document.getElementById("enemy-health-bar");

    let enemyText =
        document.getElementById("enemy-health-text");


    if (enemyBar) {

        let maxHP =
            GetEnemyMaxHealth();

        let enemyPercent =
            (enemyHealth / maxHP) * 100;

        enemyBar.style.width =
            enemyPercent + "%";
    }


    if (enemyText) {

        enemyText.innerHTML =
            enemyHealth +
            " / " +
            GetEnemyMaxHealth();
    }
}


// =========================
// SAVE GAME
// =========================

function SaveGame() {

    localStorage.setItem(
        "health",
        health
    );

    localStorage.setItem(
        "gold",
        gold
    );

    localStorage.setItem(
        "keys",
        keys
    );

    localStorage.setItem(
        "potions",
        potions
    );

    localStorage.setItem(
        "potionsBought",
        potionsBought
    );

    localStorage.setItem(
        "keySearchClicks",
        keySearchClicks
    );

    localStorage.setItem(
        "ChestOpened",
        ChestOpened
    );

    localStorage.setItem(
        "merchantDefeated",
        merchantDefeated
    );
}


// =========================
// UPDATE PLAYER STATS
// =========================

function UpdateStats() {

    let healthDisplay =
        document.getElementById("health");

    let goldDisplay =
        document.getElementById("gold");

    let keysDisplay =
        document.getElementById("keys");

    let potionDisplay =
        document.getElementById("potion-count");

    let purchaseDisplay =
        document.getElementById("potion-purchases");

    let progress =
        document.getElementById("key-click-progress");

    let darkButton =
        document.getElementById("dark-shop-button");

    let dragonButton =
        document.getElementById("dragon-button");


    // HEALTH

    if (healthDisplay) {

        healthDisplay.innerHTML =
            "❤️ Health: " + health;
    }


    // GOLD

    if (goldDisplay) {

        goldDisplay.innerHTML =
            "💰 Gold: " + gold;
    }


    // KEYS

    if (keysDisplay) {

        keysDisplay.innerHTML =
            "🗝️ Keys: " + keys;
    }


    // POTIONS

    if (potionDisplay) {

        potionDisplay.innerHTML =
            "🧪 Potions: " + potions;
    }


    // MERCHANT PURCHASE PROGRESS

    if (purchaseDisplay) {

        purchaseDisplay.innerHTML =
            "Potions Purchased: " +
            potionsBought +
            " / 3";
    }


    // KEY HUNT PROGRESS

    if (progress) {

        progress.innerHTML =
            "Key Search: " +
            keySearchClicks +
            " / 10";
    }


    // DARK SHOP UNLOCK

    if (darkButton) {

        if (potionsBought >= 3) {

            darkButton.style.display =
                "block";

        } else {

            darkButton.style.display =
                "none";
        }
    }


    // DRAGON DEN

    if (dragonButton) {

        if (keys >= 15) {

            dragonButton.classList.remove(
                "locked"
            );

            dragonButton.classList.add(
                "unlocked"
            );

            dragonButton.innerHTML =
                "🐉 Enter Dragon's Den — UNLOCKED!";

            dragonButton.onclick = null;

        } else {

            dragonButton.classList.remove(
                "unlocked"
            );

            dragonButton.classList.add(
                "locked"
            );

            dragonButton.innerHTML =
                "🔒 Dragon's Den — " +
                keys +
                " / 15 Keys";


            dragonButton.onclick =
                function(event) {

                    event.preventDefault();

                    ShowNotification(
                        "🔒 Gate Locked",
                        "You need 15 keys to enter."
                    );
                };
        }
    }


    UpdateHealthBars();
}


// =========================
// RESET GAME
// =========================

function ResetGame() {

    localStorage.removeItem("health");
    localStorage.removeItem("gold");
    localStorage.removeItem("keys");
    localStorage.removeItem("potions");
    localStorage.removeItem("potionsBought");
    localStorage.removeItem("keySearchClicks");
    localStorage.removeItem("ChestOpened");
    localStorage.removeItem("merchantDefeated");

    location.reload();
}


// =========================
// NOTIFICATIONS
// =========================

function ShowNotification(title, text) {

    let box =
        document.getElementById("notification");

    if (!box) {
        return;
    }


    let titleBox =
        document.getElementById("notifTitle");

    let textBox =
        document.getElementById("notifText");


    if (titleBox) {

        titleBox.innerHTML =
            title;
    }


    if (textBox) {

        textBox.innerHTML =
            text;
    }


    box.style.right =
        "25px";


    setTimeout(function() {

        box.style.right =
            "-380px";

    }, 2000);
}


// =========================
// DAMAGE PLAYER
// =========================

function LooseHealth(amount) {

    if (gameOver) {
        return;
    }


    health -= amount;


    if (health < 0) {
        health = 0;
    }


    UpdateStats();
    SaveGame();


    if (health > 0) {

        ShowNotification(
            "💔 Damage Taken",
            "You lost " +
            amount +
            " health."
        );

    } else {

        if (IsCombatPage()) {

            ShowGameOver();

        } else {

            ShowNotification(
                "💔 No Health",
                "Your health reached zero."
            );
        }
    }
}


// =========================
// SHOW GAME OVER
// =========================

function ShowGameOver() {

    if (!IsCombatPage()) {
        return;
    }


    let screen =
        document.getElementById("game-over");

    if (!screen) {
        return;
    }


    gameOver = true;

    reviveClicks = 0;


    let enemyBox =
        document.getElementById("enemy-box");

    if (enemyBox) {

        enemyBox.style.display =
            "none";
    }


    screen.style.display =
        "flex";


    let counter =
        document.getElementById("revive-count");

    if (counter) {

        counter.innerHTML =
            "Revive Progress: 0 / 10";
    }
}


// =========================
// REVIVE GAME
// =========================

function ReviveGame() {

    if (!gameOver) {
        return;
    }


    reviveClicks++;


    let counter =
        document.getElementById("revive-count");


    if (counter) {

        counter.innerHTML =
            "Revive Progress: " +
            reviveClicks +
            " / 10";
    }


    if (reviveClicks >= 10) {

        health = 100;

        enemyHealth =
            GetEnemyMaxHealth();

        gameOver = false;

        reviveClicks = 0;


        SaveGame();

        UpdateStats();


        let enemyBox =
            document.getElementById("enemy-box");

        if (enemyBox) {

            enemyBox.style.display =
                "block";
        }


        let enemyDisplay =
            document.getElementById("enemy-health");

        if (enemyDisplay) {

            enemyDisplay.innerHTML =
                enemyHealth;
        }


        let screen =
            document.getElementById("game-over");

        if (screen) {

            screen.style.display =
                "none";
        }


        UpdateHealthBars();


        ShowNotification(
            "✨ Revived!",
            "The battle begins again."
        );
    }
}


// =========================
// GOLD
// =========================

function GainGold(amount) {

    gold += amount;


    UpdateStats();
    SaveGame();


    ShowNotification(
        "💰 Gold Collected!",
        "You gained " +
        amount +
        " gold."
    );
}


// =========================
// FIND KEY
// =========================

function FindKey() {

    keys++;


    UpdateStats();
    SaveGame();


    ShowNotification(
        "🗝️ Key Found!",
        "You picked up a rusty key."
    );
}


// =========================
// USE POTION
// =========================

function Heal() {

    if (gameOver) {
        return;
    }


    if (potions > 0) {

        health += 20;


        if (health > 100) {
            health = 100;
        }


        potions--;


        UpdateStats();
        SaveGame();


        ShowNotification(
            "🧪 Potion Used",
            "You restored 20 health."
        );

    } else {

        ShowNotification(
            "🧪 No Potions",
            "You don't have a potion."
        );
    }
}


// =========================
// BUY POTION
// =========================

function BuyPotion() {

    if (gold >= 40) {

        gold -= 40;

        potions++;

        potionsBought++;


        UpdateStats();
        SaveGame();


        if (potionsBought === 1) {

            ShowNotification(
                "🧪 Potion Purchased!",
                "You spent 40 gold. Two more..."
            );

        } else if (potionsBought === 2) {

            ShowNotification(
                "🧪 Potion Purchased!",
                "You spent 40 gold. One more..."
            );

        } else if (potionsBought >= 3) {

            ShowNotification(
                "🌑 Secret Unlocked!",
                "The merchant reveals a hidden door."
            );

        } else {

            ShowNotification(
                "🧪 Potion Purchased!",
                "You spent 40 gold."
            );
        }

    } else {

        ShowNotification(
            "💰 Not Enough Gold",
            "You need 40 gold."
        );
    }
}


// =========================
// TREASURE CHEST
// =========================

function OpenChest() {

    if (ChestOpened === false) {

        gold += 100;

        ChestOpened = true;


        UpdateStats();
        SaveGame();


        ShowNotification(
            "📦 Treasure Opened!",
            "You found 100 gold!"
        );

    } else {

        ShowNotification(
            "📦 Chest",
            "The chest is empty."
        );
    }
}


// =========================
// ENEMY ATTACK
// =========================

function EnemyAttack() {

    if (gameOver) {
        return;
    }


    if (enemyType === "wolf") {

        LooseHealth(10);


        ShowNotification(
            "🐺 Wolf Attack!",
            "The Forest Wolf dealt 10 damage."
        );


    } else if (enemyType === "merchant") {

        LooseHealth(15);


        ShowNotification(
            "👿 Evil Merchant Attack!",
            "The Evil Merchant dealt 15 damage."
        );


    } else if (enemyType === "dragon") {

        LooseHealth(20);


        ShowNotification(
            "🐉 Dragon Attack!",
            "The Ancient Dragon dealt 20 damage."
        );
    }
}


// =========================
// SWORD ATTACK
// =========================

function SwordAttack() {

    if (gameOver) {
        return;
    }


    enemyHealth -= 10;


    if (enemyHealth < 0) {
        enemyHealth = 0;
    }


    let enemyDisplay =
        document.getElementById("enemy-health");

    if (enemyDisplay) {

        enemyDisplay.innerHTML =
            enemyHealth;
    }


    UpdateHealthBars();


    ShowNotification(
        "🗡️ Sword Slash",
        "You dealt 10 damage!"
    );


    if (enemyHealth <= 0) {

        WinBattle();

    } else {

        EnemyAttack();
    }
}


// =========================
// HEAVY ATTACK
// =========================

function HeavyAttack() {

    if (gameOver) {
        return;
    }


    enemyHealth -= 20;


    if (enemyHealth < 0) {
        enemyHealth = 0;
    }


    let enemyDisplay =
        document.getElementById("enemy-health");

    if (enemyDisplay) {

        enemyDisplay.innerHTML =
            enemyHealth;
    }


    UpdateHealthBars();


    ShowNotification(
        "💥 Heavy Attack",
        "You dealt 20 damage!"
    );


    if (enemyHealth <= 0) {

        WinBattle();

    } else {

        EnemyAttack();
    }
}


// =========================
// WIN BATTLE
// =========================

function WinBattle() {

    let enemyBox =
        document.getElementById("enemy-box");


    // =====================
    // WOLF
    // =====================

    if (enemyType === "wolf") {

        gold += 20;


        SaveGame();
        UpdateStats();


        if (enemyBox) {

            enemyBox.innerHTML =

                "<h2>🏆 Wolf Defeated!</h2>" +

                "<p>You found 20 gold.</p>" +

                '<a href="wolf.html" class="fight-again">' +
                "⚔️ Fight Again" +
                "</a>" +

                '<a href="left.html" class="back-link">' +
                "← Back to Deep Forest" +
                "</a>";
        }


        ShowNotification(
            "🐺 Wolf Defeated!",
            "+20 Gold"
        );


        return;
    }


    // =====================
    // EVIL MERCHANT
    // =====================

    if (enemyType === "merchant") {

        merchantDefeated = true;

        SaveGame();


        let intro =
            document.getElementById("merchant-intro");

        let introImage =
            document.getElementById(
                "merchant-intro-image"
            );

        let title =
            document.querySelector(
                ".dark-shop h1"
            );

        let potionButton =
            document.querySelector(
                ".dark-shop .use-potion-button"
            );

        let peaceEnding =
            document.getElementById(
                "peace-ending"
            );

        let storyBox =
            document.querySelector(
                ".story-box"
            );


        // Hide the fight

        if (enemyBox) {

            enemyBox.style.display =
                "none";
        }


        // Hide introduction

        if (intro) {

            intro.style.display =
                "none";
        }


        // Hide merchant image

        if (introImage) {

            introImage.style.display =
                "none";
        }


        // Hide title

        if (title) {

            title.style.display =
                "none";
        }


        // Hide potion button

        if (potionButton) {

            potionButton.style.display =
                "none";
        }


        // Show ending

        if (peaceEnding) {

            peaceEnding.style.display =
                "block";
        }


        // Shrink ending layout

        if (storyBox) {

            storyBox.classList.add(
                "story-ending"
            );
        }


        ShowNotification(
            "✨ Peace Restored!",
            "The curse has been broken."
        );


        return;
    }


    // =====================
    // DRAGON
    // =====================

    if (enemyType === "dragon") {

        if (enemyBox) {

            enemyBox.innerHTML =

                "<h2>🏆 Dragon Defeated!</h2>" +

                "<p>" +
                "The Ancient Dragon falls " +
                "and the path to the treasure " +
                "is revealed." +
                "</p>" +

                '<a href="treasure.html" class="back-link">' +
                "💎 Enter the Treasure Room" +
                "</a>";
        }


        ShowNotification(
            "🐉 Dragon Defeated!",
            "The path to the treasure is open!"
        );
    }
}


// =========================
// RUN AWAY
// =========================

function RunAway() {

    if (gameOver) {
        return;
    }


    let enemyName =
        "Enemy";

    let backPage =
        "index.html";

    let backText =
        "← Back";


    if (enemyType === "wolf") {

        enemyName =
            "Forest Wolf";

        backPage =
            "left.html";

        backText =
            "← Back to Deep Forest";


    } else if (enemyType === "merchant") {

        enemyName =
            "Evil Merchant";

        backPage =
            "merchant.html";

        backText =
            "← Back to Merchant Shop";


    } else if (enemyType === "dragon") {

        enemyName =
            "Ancient Dragon";

        backPage =
            "right.html";

        backText =
            "← Back to Coniferous Path";
    }


    ShowNotification(
        "🏃 Escaped!",
        "You escaped from the " +
        enemyName +
        "."
    );


    let enemyBox =
        document.getElementById(
            "enemy-box"
        );


    if (enemyBox) {

        enemyBox.innerHTML =

            "<h2>🌲 You Escaped</h2>" +

            "<p>You escaped from the " +
            enemyName +
            ".</p>" +

            '<a href="' + backPage +
            '" class="back-link">' +
            backText +
            "</a>";
    }
}


// =========================
// KEY HUNT
// =========================

function SearchForKey() {

    keySearchClicks++;


    if (keySearchClicks >= 10) {

        keySearchClicks = 0;

        keys++;


        ShowNotification(
            "🗝️ Key Found!",
            "You discovered a key!"
        );

    } else {

        ShowNotification(
            "🔍 Searching...",
            "Search progress: " +
            keySearchClicks +
            " / 10"
        );
    }


    SaveGame();
    UpdateStats();
}


// =========================
// DRAGON GATE
// =========================

function UpdateDragonGate() {

    let lock =
        document.getElementById(
            "dragon-lock"
        );

    let fight =
        document.getElementById(
            "dragon-fight"
        );

    let count =
        document.getElementById(
            "dragon-key-count"
        );


    if (!lock || !fight) {
        return;
    }


    if (count) {

        count.innerHTML =
            "Your keys: " +
            keys +
            " / 15";
    }


    if (keys >= 15) {

        lock.style.display =
            "none";

        fight.style.display =
            "block";

    } else {

        lock.style.display =
            "block";

        fight.style.display =
            "none";
    }
}


// =========================
// MERCHANT ENDING STATE
// =========================

function UpdateMerchantEnding() {

    if (enemyType !== "merchant") {
        return;
    }


    let enemyBox =
        document.getElementById("enemy-box");

    let intro =
        document.getElementById("merchant-intro");

    let introImage =
        document.getElementById(
            "merchant-intro-image"
        );

    let title =
        document.querySelector(
            ".dark-shop h1"
        );

    let potionButton =
        document.querySelector(
            ".dark-shop .use-potion-button"
        );

    let peaceEnding =
        document.getElementById(
            "peace-ending"
        );

    let storyBox =
        document.querySelector(
            ".story-box"
        );


    if (merchantDefeated) {

        if (enemyBox) {

            enemyBox.style.display =
                "none";
        }


        if (intro) {

            intro.style.display =
                "none";
        }


        if (introImage) {

            introImage.style.display =
                "none";
        }


        if (title) {

            title.style.display =
                "none";
        }


        if (potionButton) {

            potionButton.style.display =
                "none";
        }


        if (peaceEnding) {

            peaceEnding.style.display =
                "block";
        }


        if (storyBox) {

            storyBox.classList.add(
                "story-ending"
            );
        }

    } else {

        if (enemyBox) {

            enemyBox.style.display =
                "block";
        }


        if (intro) {

            intro.style.display =
                "block";
        }


        if (introImage) {

            introImage.style.display =
                "flex";
        }


        if (title) {

            title.style.display =
                "";
        }


        if (potionButton) {

            potionButton.style.display =
                "";
        }


        if (peaceEnding) {

            peaceEnding.style.display =
                "none";
        }


        if (storyBox) {

            storyBox.classList.remove(
                "story-ending"
            );
        }
    }
}


// =========================
// PAGE START
// =========================

UpdateStats();

UpdateDragonGate();

UpdateMerchantEnding();


// =========================
// GAME OVER INITIALIZATION
// =========================

let gameOverScreen =
    document.getElementById("game-over");


if (gameOverScreen) {

    if (
        health <= 0 &&
        IsCombatPage()
    ) {

        ShowGameOver();

    } else {

        gameOverScreen.style.display =
            "none";

        gameOver = false;
    }
}


// =========================
// FINAL HP BAR UPDATE
// =========================

UpdateHealthBars();