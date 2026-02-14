// ===== 建物マスターデータ =====
const buildingMaster = {
  wheatField: {
    name: "小麦畑",
    activationNumbers: [1],
    effect: function(player) {
      player.money += 1;
    }
  },
  bakery: {
    name: "パン屋",
    activationNumbers: [2,3],
    effect: function(player) {
      player.money += 1;
    }
  }
};

// ===== ゲーム状態 =====
const gameState = {
  players: [
    {
      id: 1,
      money: 3,
      buildings: ["wheatField", "bakery"] // ← 文字列キーで管理
    }
  ],
  currentPlayerIndex: 0,
  turn: 1
};

// ===== ダイス =====
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// ===== 建物発動（汎用版） =====
function activateBuildings(dice) {
  const player = gameState.players[gameState.currentPlayerIndex];

  player.buildings.forEach(buildingKey => {
    const building = buildingMaster[buildingKey];

    if (building.activationNumbers.includes(dice)) {
      building.effect(player);
      console.log(building.name + " 発動！");
    }
  });
}

// ===== 1ターン =====
function playTurn() {
  const dice = rollDice();
  activateBuildings(dice);

  return {
    dice: dice,
    money: gameState.players[0].money
  };
}

// ===== ボタンイベント =====
const rollButton = document.getElementById("rollButton");

rollButton.addEventListener("click", function() {
  const result = playTurn();

  document.getElementById("diceResult").textContent = result.dice;
  document.getElementById("moneyResult").textContent = result.money;
});
