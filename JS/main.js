const buttonContainers = document.querySelectorAll("[data-btn-container]");
const mobileMenuCard = document.querySelector("[data-mobile-menu]");
const mobileMenuBtn = document.querySelector("[data-menu-btn]");
const innerMobileMenuCard = document.querySelector("[data-inner-mobile-menu]");
const resumeBtn = document.querySelector("[data-resume-btn]");
const gameGrid = document.querySelector("[data-game-grid]");
const gameFooter = document.querySelector("[data-game-footer]");
const gameoverModal = document.querySelector("[data-gameover-modal]");
const gameoverModalCard = document.querySelector("[data-gameover-inner-card]");
const gameoverPlayersList = document.querySelector("[data-game-score]");
const gameoverModalTitle = document.querySelector(
  "[data-gameover-modal-title]"
);

// Setting User Config To Defaults
const userConfig = {
  theme: "numbers",
  players: "1",
  gridSize: "4x4",
};

// User Config Setting (From The Landing Page)
const userPreConfig = getItemFromSessionStorage("userConfig");
if(!userPreConfig) {
  setItemInSessionStorage("userConfig", userConfig)
}

buttonContainers.forEach((container) => {
  const buttons = [...container.children];

  buttons.forEach((btn) => {
    if (userPreConfig) {
      btn.classList.remove("active");
      btn.value === userPreConfig[container.dataset["btnContainer"]] &&
        btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      userConfig[container.dataset["btnContainer"]] = btn.value;
      setItemInSessionStorage("userConfig", userConfig);
    });
  });
});

// Session Storage Utility Classes
function setItemInSessionStorage(key, item) {
  sessionStorage.setItem(key, JSON.stringify(item));
}
function getItemFromSessionStorage(key) {
  return JSON.parse(sessionStorage.getItem(key));
}

// Time
let seconds = 0;
let minutes = 0;
let stopTimeCode;
function setTime(pause) {
  const timeSpan = document.querySelector("[data-time]");
  if (!pause) {
    stopTimeCode = setInterval(() => {
      seconds++;
      if (seconds === 60) {
        minutes++;
        seconds = 0;
      }
      timeSpan.textContent = `${minutes}:${seconds < 10 ? 0 : ""}${
        seconds === 60 ? 0 : seconds
      }`;
    }, 1000);
  } else {
    clearInterval(stopTimeCode);
  }
}

// Initalizing the function once user is on game path
window.addEventListener("DOMContentLoaded", function () {
  const { theme, players, gridSize } = getItemFromSessionStorage("userConfig");
  if (this.location.pathname === "/in-game.html") {
    createGameGrid(eval(gridSize.replace("x", "*")), theme, players);
    setPlayersElements();
    // highlighting first player to indicate its turn once buttons are created
    this.setTimeout(() => highlightPlayerCurrPlayer(1), 100);
  }
});

// Opening Up Mobile Menu Card When Menu Btn Is Clicked!

let modalOpeningSetTimeFunc;
let modalClosingSetTimeFunc;
const setModalOpen = (backdrop, modal, open) => {
  clearTimeout(modalOpeningSetTimeFunc);
  clearTimeout(modalClosingSetTimeFunc);
  if (open) {
    backdrop.classList.add("open");
    modalOpeningSetTimeFunc = setTimeout(() => {
      modal.classList.add("open");
    }, 5);
  } else {
    modal.classList.remove("open");
    modalClosingSetTimeFunc = setTimeout(() => {
      backdrop.classList.remove("open");
    }, 360);
  }
};

mobileMenuBtn &&
  mobileMenuBtn.addEventListener("click", () => {
    setModalOpen(mobileMenuCard, innerMobileMenuCard, true);
    setTime(true);
  });
mobileMenuBtn &&
  resumeBtn.addEventListener("click", () => {
    setModalOpen(mobileMenuCard, innerMobileMenuCard, false);
    setTime(false);
  });

// Creating Shuffle Array Prototype
Array.prototype.shuffle = function () {
  const getRandNum = (max) => Math.floor(Math.random() * (max + 1));
  for (let i = this.length - 1; i > 0; i--) {
    const swap = getRandNum(i);
    const curr = this[i];

    this[i] = this[swap];
    this[swap] = curr;
  }
  return this;
};

// Creating Child Elements For Game Grid Container

function createGameGrid(gridSize, theme, players) {
  gameGrid.classList.add(gridSize === 16 ? "grid-4x4" : "grid-6x6");

  if (theme === "numbers") {
    const numbersArray = getNumbersArray(gridSize);
    numbersArray.shuffle();
    createGameButtons("numbers", numbersArray, players);
  } else if (theme === "icons") {
    const icons = getIconsArray(gridSize).map((imgSrc) => {
      const img = document.createElement("img");
      img.classList.add("grid-icon");
      // getting icon name & giving it to data attribute as a value --Little hard-coded approach ;) --
      const iconName = imgSrc.split("/")[2].split(".")[0];
      img.dataset.icon = iconName;

      img.src = imgSrc;
      return img;
    });
    createGameButtons("icons", icons, players);
  } else {
    return null;
  }
}

// for icons
function getIconsArray(gridSize) {
  const fourXfourGridIcons = [
    "assests/icons/bomb.svg",
    "assests/icons/bug.svg",
    "assests/icons/brain.svg",
    "assests/icons/atom.svg",
    "assests/icons/bahai.svg",
    "assests/icons/bell.svg",
    "assests/icons/coffee.svg",
    "assests/icons/bookmark.svg",
  ];
  const sixXsixGridIcons = fourXfourGridIcons.concat([
    "assests/icons/sun.svg",
    "assests/icons/car.svg",
    "assests/icons/dice.svg",
    "assests/icons/fire.svg",
    "assests/icons/lemon.svg",
    "assests/icons/dragon.svg",
    "assests/icons/cloud.svg",
    "assests/icons/meteor.svg",
    "assests/icons/code-branch.svg",
    "assests/icons/hamburger.svg",
  ]);

  if (gridSize === 16) {
    const doubledIcons = fourXfourGridIcons.concat(fourXfourGridIcons);
    return doubledIcons.shuffle();
  } else if (gridSize === 36) {
    const doubledIcons = sixXsixGridIcons.concat(sixXsixGridIcons);
    return doubledIcons.shuffle();
  }
}

// for numbers
function getNumbersArray(gridSize) {
  function findMaxNumbAndRepitation() {
    let i = 7;
    while (gridSize % i !== 0) {
      i++;
    }
    const repitation = gridSize / i;
    return [i, repitation];
  }

  let [maxNumb, maxNumberOfRepetition] = findMaxNumbAndRepitation();

  const gridNumbersArray = [];
  while (maxNumberOfRepetition !== 0) {
    for (let i = 0; i < maxNumb; i++) {
      gridNumbersArray.push(i + 1);
    }
    maxNumberOfRepetition--;
  }
  return gridNumbersArray;
}

const playersScore = [];

function createGameButtons(type, arr, players) {
  gameGrid.innerHTML = "";

  let currTurnInIndex = 0;
  let selectedItems = [];
  for (let i = 0; i < players; i++) {
    playersScore.push({
      name: `Player ${i + 1}`,
      moves: 0,
      score: 0,
    });
  }

  arr.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("game-item");
    button.value = type === "icons" ? item.dataset.icon : item;
    button.append(item);

    button.addEventListener("click", function () {
      // Gameplay win & lose verification based on click of every button

      const check = function (className, add = true) {
        const x = document.querySelectorAll(".open");
        setTimeout(function () {
          x.forEach((el) => {
            add ? el.classList.add(className) : el.classList.remove(className);
            // updating next player's bg
            highlightPlayerCurrPlayer(currTurnInIndex + 1);
          });
        }, 1000);
      };

      if (
        !this.classList.contains("open") &&
        !this.classList.contains("matched")
      ) {
        this.classList.add("open");
        selectedItems.push(this.value);
      }
      if (selectedItems.length > 1) {
        playersScore[currTurnInIndex].incrementMoves();
        if (selectedItems[0] === selectedItems[1]) {
          check("matched");
          selectedItems = [];
          playersScore[currTurnInIndex].score++;
          // opening gameover modal if player(s) has/have completed the game!
          const totalScore = playersScore.reduce(
            (pre, curr) => pre + curr.score,
            0
          );
          totalScore === (arr.length / 2) && openGameOverModal();
        } else {
          // changing player turn
          currTurnInIndex >= playersScore.length - 1
            ? (currTurnInIndex = 0)
            : currTurnInIndex++;
          check("open", false);
          selectedItems = [];
        }
      }
    });

    gameGrid.append(button);
  });
}

function setPlayersElements() {
  gameFooter.innerHTML = "";

  if (playersScore.length > 1) {
    playersScore.forEach((player, i) => {
      const { name, moves } = player;
      const changeMovesHandler = createInfoBox(name, moves, gameFooter, i + 1);
      changeMovesHandler(moves);
      player.incrementMoves = function () {
        this.moves++;
        changeMovesHandler(this.moves);
      };
    });
  } else if (playersScore.length === 1) {
    createInfoBox("Time", "0:00", gameFooter, null, true);
    setTime(false);
    const { name, moves } = playersScore[0];
    const changeMovesHandler = createInfoBox(
      "Moves",
      moves,
      gameFooter,
      null,
      true
    );
    playersScore[0].incrementMoves = function () {
      this.moves++;
      changeMovesHandler(this.moves);
    };
  } else {
    return null;
  }
}

function createInfoBox(
  name,
  value,
  appendEl,
  boxNumber = null,
  enableTime = false,
  modifyBox = null
) {
  const box = document.createElement("div");
  box.classList.add("ingame-btnContainer__box");
  modifyBox && modifyBox(box);
  box.dataset.playerInfoBox = boxNumber || "";
  const title = document.createElement("h6");
  const keyValue = document.createElement("span");
  title.textContent = name;
  keyValue.textContent = value;
  enableTime ? (keyValue.dataset.time = "") : "";
  box.append(title, keyValue);

  appendEl.append(box);

  function changeKeyValueTextContentHandler(value) {
    keyValue.textContent = value;
  }
  return changeKeyValueTextContentHandler;
}

function highlightPlayerCurrPlayer(currPlayer) {
  if (!(playersScore.length > 1)) return;
  document
    .querySelectorAll("[data-player-info-box]")
    .forEach((box) => box.classList.remove("playing"));

  document
    .querySelector(`[data-player-info-box="${currPlayer}"]`)
    .classList.add("playing");
}

function openGameOverModal() {
  gameoverPlayersList.innerHTML = "";
  setModalOpen(gameoverModal, gameoverModalCard, true);

  if (playersScore.length > 1) {
    const playersScoreList = playersScore.sort((a, b) => b.score - a.score);
    gameoverModalTitle.textContent = `${playersScoreList[0].name} Wins!`;
    playersScoreList.forEach((player, i) => {
      createInfoBox(
        `${player.name} ${i === 0 ? "(Winner)" : ""} `,
        `${player.score} Pair${player.score > 1 ? "s" : ""}`,
        gameoverPlayersList,
        null,
        false,
        (box) =>
          box.classList.add(
            "ingame-btnContainer__box--full",
            i === 0 ? "winner" : "average",
          )
      );
    });
  } else if (playersScore.length === 1) {
    gameoverModalTitle.textContent = "You did it!";
    setTime(true);
    const { name, score, moves } = playersScore[0];
    const timeTaken = document.querySelector("[data-time]").textContent;

    // time box
    createInfoBox(
      "Time Elapsed",
      timeTaken,
      gameoverPlayersList,
      false,
      false,
      (box) => box.classList.add("ingame-btnContainer__box--full")
    );

    // moves box
    createInfoBox(
      "Moves Taken",
      moves,
      gameoverPlayersList,
      null,
      false,
      (box) => box.classList.add("ingame-btnContainer__box--full")
    );
  } else {
    return null;
  }
}
