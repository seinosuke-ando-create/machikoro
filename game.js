// ===== 建物マスターデータ =====
const buildingMaster = {
  wheatField: {
    name: "小麦畑",
    cost: 1,
    activationNumbers: [1],
    effect: function(player) {
      player.money += 1;
    }
  },
  bakery: {
    name: "パン屋",
    cost: 1,
    activationNumbers: [2, 3],
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
      buildings: {
        wheatField: 1,
        bakery: 0
      }
    },
    {
      id: 2,
      money: 3,
      buildings: {
        wheatField: 1,
        bakery: 0
      }
    }
  ],
  currentPlayerIndex: 0,
  turn: 1,
  phase: "roll", // "roll" or "buy"
  hasBought: false
};

// ===== ダイス =====
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// ===== 建物発動（汎用版） =====
function activateBuildings(dice) {
  const player = gameState.players[gameState.currentPlayerIndex];

  Object.keys(player.buildings).forEach(buildingKey => {
    const count = player.buildings[buildingKey];
    const building = buildingMaster[buildingKey];

    if (count > 0 && building.activationNumbers.includes(dice)) {
      for (let i = 0; i < count; i++) {
        building.effect(player);
      }
      console.log(building.name + " 発動 x" + count);
    }
  });
}

// ===== 1ターン =====
function playTurn() {

  if (gameState.phase !== "roll") return;

  const dice = rollDice();
  document.getElementById("diceResult").textContent = dice;

  gameState.players.forEach(player => {
    Object.keys(player.buildings).forEach(buildingKey => {
      const count = player.buildings[buildingKey];
      const building = buildingMaster[buildingKey];

      if (count > 0 && building.activationNumbers.includes(dice)) {
        for (let i = 0; i < count; i++) {
          building.effect(player);
        }
      }
    });
  });

  gameState.phase = "buy"; // ← 購入フェーズへ
  updateDisplay();
}

function buyBuilding(buildingKey) {

  if (gameState.phase !== "buy") return;
  if (gameState.hasBought) {
    alert("このターンはすでに購入済みです");
    return;
  }

  const player = gameState.players[gameState.currentPlayerIndex];
  const building = buildingMaster[buildingKey];

  if (player.money < building.cost) {
    alert("お金が足りません");
    return;
  }

  // ★安全処理
  player.money -= building.cost;
  player.buildings[buildingKey] =
    (player.buildings[buildingKey] || 0) + 1;

  gameState.hasBought = true;

  updateDisplay();
  endTurn();
}

function updateDisplay() {
  const player = gameState.players[gameState.currentPlayerIndex];

  document.getElementById("moneyResult").textContent = player.money;
  document.getElementById("wheatCount").textContent = player.buildings.wheatField;
  document.getElementById("bakeryCount").textContent = player.buildings.bakery;
  document.getElementById("currentPlayer").textContent = player.id;
}

function nextTurn() {
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.length;

  gameState.turn += 1;

  updateDisplay();
}

function endTurn() {
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.length;

  gameState.turn += 1;
  gameState.phase = "roll";
  gameState.hasBought = false;

  document.getElementById("diceResult").textContent = "-";

  updateDisplay();
}

// ===== ボタンイベント =====
const rollButton = document.getElementById("rollButton");

rollButton.addEventListener("click", function() {
  playTurn();
  document.getElementById("buyWheat").addEventListener("click", function() {
    buyBuilding("wheatField");
  });

  document.getElementById("buyBakery").addEventListener("click", function() {
    buyBuilding("bakery");
  });

  document.getElementById("skipBuy").addEventListener("click", function() {

    if (gameState.phase !== "buy") return;

    endTurn();
  });
});

