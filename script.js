// =========================
// PLAYER DATA
// =========================
let potionsBought =
    Number(localStorage.getItem("potionsBought")) || 0;

let health = Number(localStorage.getItem("health")) || 100;
let gold = Number(localStorage.getItem("gold")) || 0;
let keys = Number(localStorage.getItem("keys")) || 0;
let potions = Number(localStorage.getItem("potions")) || 0;


let ChestOpened =
    localStorage.getItem("ChestOpened") === "true";


// =========================
// ENEMY DATA
// =========================

let enemyType =
    document.body.dataset.enemy || "wolf";

let enemyHealth;

if (enemyType === "wolf") {

    enemyHealth = 50;

} else if (enemyType === "merchant") {

    enemyHealth = 80;

}


// =========================
// SAVE GAME
// =========================

function SaveGame() {

    localStorage.setItem("health", health);
    localStorage.setItem("gold", gold);
    localStorage.setItem("keys", keys);
    localStorage.setItem("potions", potions);
    localStorage.setItem("ChestOpened", ChestOpened);
    localStorage.setItem("potionsBought", potionsBought);
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

    let darkButton =
        document.getElementById("dark-shop-button");


    if (healthDisplay) {

        healthDisplay.innerHTML =
            "❤️ Health: " + health;
    }


    if (goldDisplay) {

        goldDisplay.innerHTML =
            "💰 Gold: " + gold;
    }


    if (keysDisplay) {

        keysDisplay.innerHTML =
            "🗝️ Keys: " + keys;
    }


    if (potionDisplay) {

        potionDisplay.innerHTML =
            "🧪 Potions: " + potions;
    }


    // Merchant purchase progress

    if (purchaseDisplay) {

        purchaseDisplay.innerHTML =
            "Potions Purchased: " +
            potionsBought +
            " / 3";
    }


    // Unlock Dark Shop

    if (darkButton) {

        if (potionsBought >= 3) {

            darkButton.style.display = "block";

        } else {

            darkButton.style.display = "none";
        }
    }
}
function ResetGame() {

    localStorage.removeItem("health");
    localStorage.removeItem("gold");
    localStorage.removeItem("keys");
    localStorage.removeItem("potions");
    localStorage.removeItem("potionsBought");
    localStorage.removeItem("ChestOpened");
    localStorage.removeItem("merchantDefeated");

    location.reload();
}

// =========================
// NOTIFICATIONS
// =========================

function ShowNotification(title, text) {

    let box = document.getElementById("notification");

    if (!box) {
        return;
    }

    let titleBox =
        document.getElementById("notifTitle");

    let textBox =
        document.getElementById("notifText");

    if (titleBox) {
        titleBox.innerHTML = title;
    }

    if (textBox) {
        textBox.innerHTML = text;
    }

    box.style.right = "25px";

    setTimeout(function () {

        box.style.right = "-380px";

    }, 2000);
}


// =========================
// HEALTH
// =========================

function LooseHealth(amount) {

    health -= amount;

    if (health < 0) {
        health = 0;
    }

    UpdateStats();
    SaveGame();

    if (health > 0) {

        ShowNotification(
            "💔 Damage Taken",
            "You lost " + amount + " health."
        );

    } else {

        ShowNotification(
            "💀 Game Over!",
            "Your health reached zero."
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
        "You gained " + amount + " gold."
    );
}


// =========================
// KEY
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
// HEAL / POTION
// =========================

function Heal() {

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

        ShowNotification(
            "🧪 Potion Purchased!",
            "You spent 40 gold."
        );

        let purchaseDisplay =
            document.getElementById("potion-purchases");

        if (purchaseDisplay) {

            purchaseDisplay.innerHTML =
                "Potions Purchased: " +
                potionsBought +
                " / 3";
        }

        if (potionsBought === 1) {

            ShowNotification(
                "🧙 Merchant",
                "Two more potions..."
            );

        }

        if (potionsBought === 2) {

            ShowNotification(
                "🧙 Merchant",
                "One more..."
            );

        }

        if (potionsBought >= 3) {

            ShowNotification(
                "🌑 Secret Unlocked!",
                "The merchant reveals a hidden door."
            );

            let darkButton =
                document.getElementById(
                    "dark-shop-button"
                );

            if (darkButton) {

                darkButton.style.display = "block";
            }
        }

    }

    else {

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

        GainGold(100);

        ChestOpened = true;

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
// WOLF ATTACKS PLAYER
// =========================

function EnemyAttack() {

    if (enemyType === "wolf") {

        LooseHealth(10);

        ShowNotification(
            "🐺 Wolf Attack!",
            "The wolf dealt 10 damage."
        );

    }

    else if (enemyType === "merchant") {

        LooseHealth(15);

        ShowNotification(
            "👿 Merchant Attack!",
            "The Evil Merchant dealt 15 damage."
        );

    }
}


// =========================
// SWORD ATTACK
// =========================

function SwordAttack() {

    enemyHealth -= 10;

    if (enemyHealth < 0) {
        enemyHealth = 0;
    }

    let enemyDisplay =
        document.getElementById("enemy-health");

    if (enemyDisplay) {
        enemyDisplay.innerHTML = enemyHealth;
    }

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

    enemyHealth -= 20;

    if (enemyHealth < 0) {
        enemyHealth = 0;
    }

    let enemyDisplay =
        document.getElementById("enemy-health");

    if (enemyDisplay) {
        enemyDisplay.innerHTML = enemyHealth;
    }

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

    if (enemyType === "wolf") {

        gold += 20;

        UpdateStats();
        SaveGame();

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

    }

    else if (enemyType === "merchant") {

        localStorage.setItem(
            "merchantDefeated",
            "true"
        );

        if (enemyBox) {

            enemyBox.innerHTML =
                "<h2>🏆 Evil Merchant Defeated!</h2>" +
                "<p>The darkness surrounding the shop fades.</p>" +
                '<a href="left.html" class="back-link">' +
                "← Return to Deep Forest" +
                "</a>";
        }

        ShowNotification(
            "👿 Merchant Defeated!",
            "You have broken the curse."
        );
    }
}

// =========================
// RUN AWAY
// =========================

function RunAway() {

    ShowNotification(
        "🏃 Escaped!",
        "You escaped from the Forest Wolf."
    );

    let enemyBox =
        document.getElementById("enemy-box");

    if (enemyBox) {

        enemyBox.innerHTML =
            "<h2>🌲 You Escaped</h2>" +
            "<p>You ran deeper into the forest.</p>";
    }
}


// =========================
// PAGE START
// =========================

UpdateStats();