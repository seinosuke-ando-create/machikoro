// ===== 建物マスターデータ =====
const buildingMaster = {
  wheatField: {
    name: "小麦畑",
    cost: 1,
    type: "blue",   // ←追加
    activationNumbers: [1],
    effect: function (player) {
      player.money += 1;
    }
  },
  bakery: {
    name: "パン屋",
    cost: 1,
    type: "green",  // ←追加
    activationNumbers: [2, 3],
    effect: function (player) {
      player.money += 1;
    }
  },
  cafe: {
    name: "カフェ",
    cost: 2,
    type: "red",
    activationNumbers: [3],
    effect: function (owner, currentPlayer) {

      const amount = Math.min(1, currentPlayer.money);

      currentPlayer.money -= amount;
      owner.money += amount;
    }
  }
};


// ===== ゲーム状態 =====
const gameState = {
  players: [
    {
      id: 1,
      money: 3,
      buildings: { wheatField: 1, bakery: 0, cafe: 0 },
      landmarks: {
        station: false,
        shoppingMall: false
      }
    },
    {
      id: 2,
      money: 3,
      buildings: { wheatField: 1, bakery: 0, cafe: 0 },
      landmarks: {
        station: false,
        shoppingMall: false
      }
    },
  ],
  currentPlayerIndex: 0,
  turn: 1,
  phase: "roll", // "roll" or "buy"
  hasBought: false
};

const landmarkMaster = {
  station: {
    name: "駅",
    cost: 4
  },
  shoppingMall: {
    name: "ショッピングモール",
    cost: 6
  }
};

// ===== ダイス =====
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// ===== 建物発動（汎用版） =====
function activateAllBuildings(dice) {

  const currentPlayer =
    gameState.players[gameState.currentPlayerIndex];

  // ===== 🔴 赤カード（最初に処理） =====
  gameState.players.forEach(player => {

    if (player === currentPlayer) return;

    Object.keys(player.buildings).forEach(buildingKey => {

      const count = player.buildings[buildingKey];
      const building = buildingMaster[buildingKey];

      if (count <= 0) return;
      if (building.type !== "red") return;
      if (!building.activationNumbers.includes(dice)) return;

      for (let i = 0; i < count; i++) {
        building.effect(player, currentPlayer);
      }
    });
  });

  // ===== 🔵 青 & 🟢 緑 =====
  gameState.players.forEach(player => {

    Object.keys(player.buildings).forEach(buildingKey => {

      const count = player.buildings[buildingKey];
      const building = buildingMaster[buildingKey];

      if (count <= 0) return;
      if (!building.activationNumbers.includes(dice)) return;

      // 🔵 青
      if (building.type === "blue") {
        for (let i = 0; i < count; i++) {
          building.effect(player);
        }
      }

      // 🟢 緑
      if (building.type === "green" && player === currentPlayer) {
        for (let i = 0; i < count; i++) {
          building.effect(player);
        }
      }

    });
  });
}



// ===== 1ターン =====
function playTurn() {

  if (gameState.phase !== "roll") return;

  const dice = rollDice();
  document.getElementById("diceResult").textContent = dice;

  activateAllBuildings(dice);

  gameState.phase = "buy";
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
  document.getElementById("cafeCount").textContent = player.buildings.cafe;
  document.getElementById("currentPlayer").textContent = player.id;
  document.getElementById("stationStatus").textContent =
    player.landmarks.station ? "建設済み" : "未建設";

  document.getElementById("mallStatus").textContent =
    player.landmarks.shoppingMall ? "建設済み" : "未建設";

  const isBuyPhase = gameState.phase === "buy";

  document.getElementById("buyWheat").disabled = !isBuyPhase;
  document.getElementById("buyBakery").disabled = !isBuyPhase;
  document.getElementById("buyCafe").disabled = !isBuyPhase;
  document.getElementById("buyStation").disabled = !isBuyPhase;
  document.getElementById("buyMall").disabled = !isBuyPhase;
  document.getElementById("skipBuy").disabled = !isBuyPhase;

  document.getElementById("rollButton").disabled =
    gameState.phase !== "roll";

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

function buyLandmark(key) {

  if (gameState.phase !== "buy") return;
  if (gameState.hasBought) return;

  const player =
    gameState.players[gameState.currentPlayerIndex];

  const landmark = landmarkMaster[key];

  if (player.money < landmark.cost) {
    alert("お金が足りません");
    return;
  }

  if (player.landmarks[key]) {
    alert("すでに建設済み");
    return;
  }

  player.money -= landmark.cost;
  player.landmarks[key] = true;

  gameState.hasBought = true;

  updateDisplay();
  checkWinCondition(player);
  endTurn();
}

function checkWinCondition(player) {

  const allBuilt =
    Object.values(player.landmarks).every(v => v === true);

  if (allBuilt) {
    alert("プレイヤー" + player.id + " の勝利！");
    location.reload();
  }
}


// ===== ボタンイベント =====
const rollButton = document.getElementById("rollButton");

rollButton.addEventListener("click", function () {
  playTurn();
  document.getElementById("buyWheat").addEventListener("click", function () {
    buyBuilding("wheatField");
  });

  document.getElementById("buyBakery").addEventListener("click", function () {
    buyBuilding("bakery");
  });

  document.getElementById("buyCafe").addEventListener("click", function () {
    buyBuilding("cafe");
  });

  document.getElementById("skipBuy").addEventListener("click", function () {

    if (gameState.phase !== "buy") return;

    endTurn();
  });
  document.getElementById("buyStation")
    .addEventListener("click", () => buyLandmark("station"));

  document.getElementById("buyMall")
    .addEventListener("click", () => buyLandmark("shoppingMall"));

});

