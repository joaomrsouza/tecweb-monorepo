// !Cada segundo fora pista reduz em 15% a velocidade do carro.
// TODO: Adicionar as decorações

const DEBUG = false;
const FPS = 120;
const TICK_RATE = 60;
const CAR_DIMENSIONS = {
  width: 56,
  height: 100,
};
const TERRAIN_COLORS = {
  grass: "#053c03",
  snow: "#f5f5f5",
  desert: "#c29519",
};
const TERRAINS = Object.keys(TERRAIN_COLORS);
const SCENARIOS = ["day", "night", "fog"];
const TRACKS = {
  types: ["up", "right", "left"],
  changeRate: 0.5,
};

const OBSTACLES = {
  maxQtd: 15, // 15
  spawnRate: 0.015, // 0.015
  types: [
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "car",
    "fuel",
    "rock",
    "rock",
    "rock",
    "rock",
    "rock",
    "rock",
    "rock",
    "turbo",
    "turbo",
    "turbo",
  ],
  props: {
    car: {
      width: CAR_DIMENSIONS.width,
      height: CAR_DIMENSIONS.height,
      color: "red",
    },
    fuel: {
      width: CAR_DIMENSIONS.width,
      height: CAR_DIMENSIONS.height,
      color: "yellow",
    },
    rock: {
      width: 50,
      height: 50,
      color: "gray",
    },
    turbo: {
      width: 50,
      height: 50,
      color: "orange",
    },
  },
};

let calculateInterval;
let renderInterval;
let fuelLostInterval;
let trackInterval;

const globals = {
  player: {
    x: window.innerWidth / 2,
    speed: -100,
    fuel: 100,
    score: 0,
    y: window.innerHeight * 0.6,
    width: CAR_DIMENSIONS.width,
    height: CAR_DIMENSIONS.height,
    timesRefueled: 0,
    speedDelta: 20,
    sprite: Math.floor(Math.random() * 10),
  },
  track: "up",
  limits: {
    up: [0.15, 0.85], // [0.15, 0.85],
    right: [0.25, 0.95], // [0.25, 0.95],
    left: [0.5, 0.75], // [0.5, 0.75],
  },
  pressedKeys: new Set(),
  obstacles: [],
  currentScenario: {
    terrain: "grass",
    scenario: "day",
  },
  screen: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
};

// ====================
// DOM Helpers
// ====================

function $(id) {
  return document.getElementById(id);
}

// ====================
// Main
// ====================

function game() {
  resetGame();
  setListeners();
  update();
}

function resetGame() {
  globals.player = {
    x: window.innerWidth / 2,
    speed: -100,
    fuel: 100,
    score: 0,
    y: window.innerHeight * 0.6,
    width: CAR_DIMENSIONS.width,
    height: CAR_DIMENSIONS.height,
    timesRefueled: 0,
    speedDelta: 20,
    sprite: Math.floor(Math.random() * 10),
  };
  globals.track = "right";
  globals.pressedKeys = new Set();
  globals.obstacles = [];
}

function setListeners() {
  window.addEventListener("keydown", (e) => {
    globals.pressedKeys.add(e.key);
  });

  window.addEventListener("keyup", (e) => {
    globals.pressedKeys.delete(e.key);
  });
}

function update() {
  renderInterval = setInterval(render, 1000 / FPS);
  calculateInterval = setInterval(calculate, 1000 / TICK_RATE);
  fuelLostInterval = setInterval(
    () => globals.player.fuel > 0 && globals.player.fuel--,
    1000
  );
  trackInterval = setInterval(() => {
    if (Math.random() < TRACKS.changeRate) {
      globals.track =
        TRACKS.types[Math.floor(Math.random() * TRACKS.types.length)];
    }
  }, 5000);
}

function render() {
  resetDOM();
  renderFrames();
  renderObstacles();
  renderPlayer();
}

function calculate() {
  if (globals.player.fuel === 0) {
    freezeFrame();
    renderScore();
    return;
  }
  calculateInput();
  calculateCollisions();
  calculateMovement();
  calculateObstacles();
}

function calculateInput() {
  // Keys
  const actions = {
    ArrowLeft() {
      if (globals.player.x - globals.player.width / 2 > 0) {
        globals.player.x -=
          (115 + globals.player.speed) / globals.player.speedDelta;
      }
    },
    ArrowRight() {
      if (globals.player.x + globals.player.width / 2 < globals.screen.width) {
        globals.player.x +=
          (115 + globals.player.speed) / globals.player.speedDelta;
      }
    },
  };

  globals.pressedKeys.forEach((key) => {
    actions[key]?.();
  });
}

function calculateCollisions() {
  const { speed, x } = globals.player;

  // Fora da pista
  if (x < globals.screen.width * 0.15 || x > globals.screen.width * 0.85) {
    speed > -100 && globals.player.speed--;
  } else {
    speed < 100 && globals.player.speed++;
  }

  // Colisão com obstáculos
  globals.obstacles = globals.obstacles.filter((obstacle) => {
    const actions = {
      car() {
        globals.player.speed = -100;
        debounce(() => {
          globals.player.score -= 2;
        }, 50)();
        return true;
      },
      fuel() {
        globals.player.fuel = 100;
        globals.player.timesRefueled++;
        return false;
      },
      rock() {
        globals.player.speed = -50;
        globals.player.score--;
        return false;
      },
      turbo() {
        globals.player.speed = 200;
        globals.player.score += 5;
        debounce(() => {
          const lowerSpeed = () => {
            setTimeout(() => {
              globals.player.speed--;
              if (globals.player.speed > 100) {
                lowerSpeed();
              }
            }, 1000 / TICK_RATE);
          };
          lowerSpeed();
        }, 5000)();
        return false;
      },
    };

    const playerRect = $`player`.getBoundingClientRect();
    const obstacleRect = $(obstacle.id).getBoundingClientRect();

    if (
      obstacleRect.bottom > playerRect.top &&
      obstacleRect.right > playerRect.left &&
      obstacleRect.top < playerRect.bottom &&
      obstacleRect.left < playerRect.right
    ) {
      return actions[obstacle.type]?.() ?? true;
    }
    return true;
  });
}

function calculateMovement() {
  // Update player
  if (
    globals.player.x - globals.player.width / 2 > 0 &&
    globals.player.x + globals.player.width / 2 < globals.screen.width
  ) {
    if (globals.track === "right") {
      globals.player.x -= (100 + globals.player.speed) / 45;
    } else if (globals.track === "left") {
      globals.player.x += (100 + globals.player.speed) / 45;
    }
  }

  // Update obstacles
  globals.obstacles = globals.obstacles.map((obstacle) => {
    const yDelta = 15;
    const xDelta = 60;
    const expressions = {
      car: {
        y: globals.player.speed / yDelta,
        x: globals.player.speed / xDelta,
      },
      fuel: {
        y: globals.player.speed / yDelta,
        x: globals.player.speed / xDelta,
      },
      rock: {
        y: (100 + globals.player.speed) / yDelta,
        x: (100 + globals.player.speed) / xDelta,
      },
      turbo: {
        y: (100 + globals.player.speed) / yDelta,
        x: (100 + globals.player.speed) / xDelta,
      },
    };

    const obstacleExpressions = expressions[obstacle.type];
    const obstacleProps = OBSTACLES.props[obstacle.type];

    obstacle.y += obstacleExpressions.y;

    const currentLimit =
      obstacle.y < globals.screen.height / 2 - 30
        ? globals.limits[globals.track]
        : [0.15, 0.85];

    if (
      obstacle.x - obstacleProps.width / 2 >
        globals.screen.width * currentLimit[0] &&
      obstacle.x + obstacleProps.width / 2 <
        globals.screen.width * currentLimit[1]
    ) {
      if (globals.track === "right") {
        obstacle.x -= obstacleExpressions.x;
      } else if (globals.track === "left") {
        obstacle.x += obstacleExpressions.x;
      }
    }
    return obstacle;
  });
}

function calculateObstacles() {
  // Update score
  globals.obstacles = globals.obstacles.map((obstacle) => {
    if (obstacle.y > globals.player.y && !obstacle.alreadyPassed) {
      obstacle.type === "car" && globals.player.score++;
      obstacle.alreadyPassed = true;
    }
    return obstacle;
  });

  // Remove distant obstacles
  globals.obstacles = globals.obstacles.filter((obstacle) => {
    return obstacle.y < globals.screen.height + 1000;
  });

  // Randomly add obstacles
  if (
    globals.obstacles.length < OBSTACLES.maxQtd &&
    Math.random() > 1 - OBSTACLES.spawnRate
  ) {
    const type =
      OBSTACLES.types[Math.floor(Math.random() * OBSTACLES.types.length)];

    const id = `${type}-${globals.obstacles.length}`;

    const currentLimit = globals.limits[globals.track];

    const leftLimit =
      globals.screen.width * currentLimit[0] + OBSTACLES.props[type].width / 2;
    const rightLimit =
      globals.screen.width * currentLimit[1] - OBSTACLES.props[type].width / 2;

    let x = 0;
    let y = 0;
    const TRY_LIMIT = 50;
    let tries = 0;

    do {
      x = Math.random() * (rightLimit - leftLimit) + leftLimit;
      y = -100 - Math.random() * 200;
      tries++;
    } while (
      tries < TRY_LIMIT &&
      globals.obstacles.some(
        (obstacle) =>
          Math.abs(x - obstacle.x) <
            OBSTACLES.props[obstacle.type].width +
              OBSTACLES.props[type].width &&
          Math.abs(y - obstacle.y) <
            OBSTACLES.props[obstacle.type].height + OBSTACLES.props[type].height
      )
    );

    const sprite = Math.floor(Math.random() * 10);

    tries < TRY_LIMIT &&
      globals.obstacles.push({ id, x, y, type, sprite, alreadyPassed: false });
  }
}

function resetDOM() {
  $`root`.innerHTML = "";
}

function renderFrames() {
  const $filters = document.createElement("div");
  $filters.id = "filters";
  $filters.style.width = `${globals.screen.width}px`;
  $filters.style.height = `${globals.screen.height}px`;
  $filters.style.position = "absolute";
  if (["night", "fog"].includes(globals.currentScenario.scenario)) {
    $filters.style.backgroundColor = "#00000090";
  }
  if (globals.currentScenario.scenario === "fog") {
    $filters.style.filter = "contrast(0.1)";
  }
  $filters.style.zIndex = 10;
  $`root`.appendChild($filters);

  const $main = document.createElement("div");
  $main.id = "main";
  $main.style.width = `${globals.screen.width}px`;
  $main.style.height = `${globals.screen.height}px`;
  $main.style.display = "flex";
  $main.style.flexDirection = "column";
  $main.style.alignItems = "center";
  $main.style.justifyContent = "center";
  $main.style.backgroundColor = TERRAIN_COLORS[globals.currentScenario.terrain];
  // $main.style.border = DEBUG ? "5px solid black" : "";
  $`root`.appendChild($main);

  const $dynamic = document.createElement("div");
  $dynamic.id = "dynamic";
  $dynamic.style.width = "100%";
  $dynamic.style.height = "40%";
  $dynamic.style.border = DEBUG ? "5px solid red" : "";
  $main.appendChild($dynamic);

  const $dynamicImage = document.createElement("img");
  $dynamicImage.id = "dynamicImage";
  $dynamicImage.style.width = `${globals.screen.width}px`;
  $dynamicImage.style.height = `${globals.screen.height * 0.4}px`;
  $dynamicImage.style.position = "absolute";
  $dynamicImage.src = `./assets/track-${globals.track}.png`;
  $dynamic.appendChild($dynamicImage);

  const $static = document.createElement("div");
  $static.id = "static";
  $static.style.width = "100%";
  $static.style.height = "40%";
  $static.style.display = "flex";
  $static.style.flexDirection = "row";
  $static.style.alignItems = "center";
  $static.style.justifyContent = "space-between";
  $static.style.border = DEBUG ? "5px solid blue" : "";
  $main.appendChild($static);

  const $staticImage = document.createElement("img");
  $staticImage.id = "staticImage";
  $staticImage.style.width = `${globals.screen.width}px`;
  $staticImage.style.height = `${globals.screen.height * 0.4}px`;
  $staticImage.style.top = `${globals.screen.height * 0.4}px`;
  $staticImage.style.position = "absolute";
  $staticImage.src = "./assets/track-up.png";
  $static.appendChild($staticImage);

  const $margemEsquerda = document.createElement("div");
  $margemEsquerda.id = "margemEsquerda";
  $margemEsquerda.style.width = "15%";
  $margemEsquerda.style.height = "100%";
  $margemEsquerda.style.border = DEBUG ? "5px solid orange" : "";
  $static.appendChild($margemEsquerda);

  const $margemDireita = document.createElement("div");
  $margemDireita.id = "margemDireita";
  $margemDireita.style.width = "15%";
  $margemDireita.style.height = "100%";
  $margemDireita.style.border = DEBUG ? "5px solid orange" : "";
  $margemDireita.style.order = 3;
  $static.appendChild($margemDireita);

  const $ui = document.createElement("div");
  $ui.id = "ui";
  $ui.style.width = "100%";
  $ui.style.height = "20%";
  $ui.style.display = "flex";
  $ui.style.gap = "5px";
  $ui.style.flexDirection = "column";
  $ui.style.alignItems = "center";
  $ui.style.justifyContent = "center";
  $ui.style.border = DEBUG ? "5px solid black" : "";
  $ui.style.backgroundColor = "black";
  $ui.style.zIndex = 50;
  $ui.textContent = DEBUG
    ? `speed: ${globals.player.speed} | fuel: ${globals.player.fuel} | score: ${
        globals.player.score
      } | timesRefueled: ${globals.player.timesRefueled} | velocidadeReal: ${
        globals.player.speed + 100
      } | x: ${globals.player.x} | y: ${globals.player.y} | obstacles: ${
        globals.obstacles.length
      }`
    : "";
  $ui.style.color = "white";
  $ui.innerHTML = `<div class="ui container"><h3>Score: ${String(
    globals.player.score
  ).padStart(5, "0")}</h3><h3>Speed: ${String(
    globals.player.speed + 100
  ).padStart(3, "0")}Km/h</h3><h3>Fuel: ${globals.player.fuel}%</h3></div>`;
  $main.appendChild($ui);
}

function renderObstacles() {
  globals.obstacles.forEach((obstacle) => {
    const obstacleProps = OBSTACLES.props[obstacle.type];

    const $obstacle = document.createElement("div");
    $obstacle.id = obstacle.id;
    $obstacle.style.width = `${obstacleProps.width}px`;
    $obstacle.style.height = `${obstacleProps.height}px`;
    $obstacle.style.backgroundColor = DEBUG ? obstacleProps.color : "unset";
    $obstacle.style.border = DEBUG ? "5px solid red" : "";
    $obstacle.style.position = "absolute";
    $obstacle.style.filter = "contrast(-0.9)";
    $obstacle.style.transition = "transform 0.2s ease-in-out";
    $obstacle.style.zIndex = ["car", "fuel"].includes(obstacle.type) ? 5 : 1;
    $obstacle.style.transform = `translate(${
      obstacle.x - obstacleProps.width / 2
    }px, ${obstacle.y - obstacleProps.height}px)`;

    const sprites = {
      car: `url("./assets/car-${obstacle.sprite}.png")`,
      rock: "url('./assets/rock.png')",
      fuel: "url('./assets/fuel.png')",
      turbo: "url('./assets/turbo.png')",
    };

    $obstacle.style.backgroundImage = sprites[obstacle.type];

    $`dynamic`.appendChild($obstacle);
  });
}

function renderPlayer() {
  const $player = document.createElement("div");
  $player.id = "player";
  $player.style.width = `${globals.player.width}px`;
  $player.style.height = `${globals.player.height}px`;
  $player.style.backgroundColor = DEBUG ? "green" : "unset";
  $player.style.border = DEBUG ? "5px solid lime" : "";
  $player.style.transition = "transform 0.2s ease-in-out";
  $player.style.transform = `translateX(${
    globals.player.x - globals.screen.width / 2
  }px)`;
  $player.style.backgroundImage = `url("./assets/car-${globals.player.sprite}.png")`;
  $`static`.appendChild($player);
}

// ====================
// Menus
// ====================

function renderMenu() {
  const $menu = document.createElement("div");
  $menu.id = "menu";
  $menu.style.width = `${globals.screen.width}px`;
  $menu.style.height = `${globals.screen.height}px`;
  $menu.style.display = "flex";
  $menu.style.gap = "5px";
  $menu.style.flexDirection = "column";
  $menu.style.alignItems = "center";
  $menu.style.justifyContent = "center";
  $menu.style.backgroundColor = "black";
  $menu.style.color = "white";
  $menu.innerHTML = `<h1>Enduro WEB</h1><br/><h2>Menu</h2><br/><button id="start">Start</button><br/>`;
  $`root`.appendChild($menu);
  setMenuListeners();
}

function setMenuListeners() {
  $`start`.addEventListener("click", () => {
    resetDOM();
    renderScenarios();
  });
}

function renderScenarios() {
  const $scenarios = document.createElement("div");
  $scenarios.id = "scenarios";
  $scenarios.style.width = `${globals.screen.width}px`;
  $scenarios.style.height = `${globals.screen.height}px`;
  $scenarios.style.display = "flex";
  $scenarios.style.gap = "10px";
  $scenarios.style.flexDirection = "column";
  $scenarios.style.alignItems = "center";
  $scenarios.style.justifyContent = "center";
  $scenarios.style.backgroundColor = "black";
  $scenarios.style.color = "white";
  $scenarios.innerHTML = `<h1>Enduro WEB</h1><br/><h2>Scenarios</h2><br/><button id="day" class="on">Day</button><button id="night" class="off">Night</button><button id="fog" class="off">Fog</button><h2>Terrain</h2><button id="grass" class="on">Grass</button><button id="snow" class="off">Snow</button><button id="desert" class="off">Desert</button><button id="start">Start</button><br/>`;
  $`root`.appendChild($scenarios);
  setScenariosListeners();
}

function setScenariosListeners() {
  function selectScenario(button) {
    globals.currentScenario.scenario = button.id;
    SCENARIOS.forEach((scenario) => {
      if (scenario === button.id) {
        $(scenario).classList.remove("off");
        $(scenario).classList.add("on");
      } else {
        $(scenario).classList.remove("on");
        $(scenario).classList.add("off");
      }
    });
  }

  function selectTerrain(button) {
    globals.currentScenario.terrain = button.id;
    TERRAINS.forEach((terrain) => {
      if (terrain === button.id) {
        $(terrain).classList.remove("off");
        $(terrain).classList.add("on");
      } else {
        $(terrain).classList.remove("on");
        $(terrain).classList.add("off");
      }
    });
  }

  $`start`.addEventListener("click", () => {
    resetDOM();
    game();
  });

  SCENARIOS.forEach((scenario) => {
    $(scenario).addEventListener("click", function () {
      selectScenario(this);
    });
  });
  TERRAINS.forEach((terrain) => {
    $(terrain).addEventListener("click", function () {
      selectTerrain(this);
    });
  });
}

function renderScore() {
  const $score = document.createElement("div");
  $score.id = "score";
  $score.style.width = "35%";
  $score.style.height = "35%";
  $score.style.position = "absolute";
  $score.style.top = "50%";
  $score.style.left = "50%";
  $score.style.transform = "translate(-50%, -50%)";
  $score.style.color = "white";
  $score.style.backgroundColor = "black";
  $score.style.display = "flex";
  $score.style.flexDirection = "column";
  $score.style.alignItems = "center";
  $score.style.justifyContent = "center";
  $score.style.zIndex = 15;
  $score.innerHTML = `<h2
  >Score: ${globals.player.score}</h2></br><h2>Times Refueled: ${globals.player.timesRefueled}</h2></br><button id="menu"><h3>Menu</h3></button>`;
  $`root`.appendChild($score);
  setScoreListeners();
}

function setScoreListeners() {
  $`menu`.addEventListener("click", () => {
    resetDOM();
    renderMenu();
  });
}

renderMenu();

// ====================
// Helpers
// ====================

let debounceTimeout;
function debounce(func, wait) {
  return () => {
    debounceTimeout && clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(func, wait);
  };
}

function freezeFrame() {
  calculateInterval && clearInterval(calculateInterval);
  renderInterval && clearInterval(renderInterval);
  fuelLostInterval && clearInterval(fuelLostInterval);
  trackInterval && clearInterval(trackInterval);
}
