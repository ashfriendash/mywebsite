ShowNotification("Welcome to my Adventure Game!","");
let health = 100;
let gold = 0;
let keys = 0;
let ChestOpened = false;
let enemyHealth = 50;
console.log(health);
console.log(gold);
console.log(keys);
UpdateStats()
function LooseHealth(amount) {
    health -= amount;
    if(health>0){
        ShowNotification(
        "Pain! You lost " + amount + " health.", "Ouch!")
    }
    if (health<0){
        health=0;
    }
    UpdateStats();
    if (health==0){
        ShowNotification("Game Over!","");
    }
}
function GainGold(amount) {
    gold += amount;
    UpdateStats();
    ShowNotification(
    "💰 Gold Collected!",
    "You gained " + amount + " gold."
);
}
function FindKey() {
    keys ++;
    UpdateStats();
    ShowNotification(
    "🗝️ Key Found",
    "You picked up a rusty key."
);
}
function UpdateStats() {
    document.getElementById("health").textContent = "❤️ Health: " + health;
    document.getElementById("gold").textContent = "💰 Gold: " + gold;
    document.getElementById("keys").textContent = "🗝️ Keys: " + keys;
}
function Heal() {
    health += 20;
    if (health>100){
        health=100;
    }
    ShowNotification(
    "🧪 Potion",
    "Health restored by 20."
);
    UpdateStats();
}
function OpenChest(){
    if (ChestOpened==false){
        GainGold(100);
        ChestOpened=true;
        ShowNotification(
    "💰 Gold Collected!",
    "Added 100 Gold"
);
    }
    else {
        ShowNotification(
    "📦 Chest",
    "The chest is empty."
);
    }

}
function ShowNotification(title,text){

    let box=document.getElementById("notification");

    document.getElementById("notifTitle").innerHTML=title;

    document.getElementById("notifText").innerHTML=text;

    box.style.right="20px";

    setTimeout(function(){

        box.style.right="-350px";

    },2000);

}

function EnemyAttack() {

    LooseHealth(10);

    ShowNotification(
        "🐺 Wolf Attack!",
        "The wolf dealt 10 damage!"
    );

}
function SwordAttack() {

    enemyHealth -= 10;

    if (enemyHealth < 0) {
        enemyHealth = 0;
    }

    document.getElementById("enemy-health").innerHTML = enemyHealth;

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
function HeavyAttack() {

    enemyHealth -= 20;

    if (enemyHealth < 0) {
        enemyHealth = 0;
    }

    document.getElementById("enemy-health").innerHTML = enemyHealth;

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
function WinBattle() {

    document.getElementById("enemy-box").innerHTML =
        "<h2>🏆 Victory!</h2>" +
        "<p>You defeated the Forest Wolf!</p>";

    ShowNotification(
        "🏆 Victory!",
        "The Forest Wolf has been defeated!"
    );

    GainGold(50);
}
function RunAway() {

    ShowNotification(
        "🏃 Escaped!",
        "You escaped from the Forest Wolf!"
    );

    document.getElementById("enemy-box").innerHTML =
        "<h2>🌲 You Escaped</h2>" +
        "<p>You ran deeper into the forest.</p>";
}