"use strict";
const wrapper = document.getElementById("tiles");
const timerEl = document.getElementById("#timer");
const remainingMinesEl = document.getElementById("#remaining-mines");
const messageEl = document.querySelector(".stat-footer");
const reloadButton = document.querySelector("#reload-button");
const soundButton = document.getElementById("sound-state");
const statContainer = document.querySelector(".article-stat-section");
const bestTimeEl = [...document.getElementsByClassName("best-time")][0];
const totalWinEl = [...document.getElementsByClassName("win-total")][0];
const totalFailEl = [...document.getElementsByClassName("fail-total")][0];
const tutoButton = document.querySelector("#tutoButton");
const statButton = document.querySelector("#statButton");
let setGridButtons = document.querySelectorAll(".gamemode-option");

const successAudio = new Audio("./assets/success.mp3"),
  tapAudio = new Audio("./assets/tap.wav"),
  blockAudio = new Audio("./assets/block.wav"),
  failAudio = new Audio("./assets/gameOver.mp3");
successAudio.volume = 0.8;
failAudio.volume = 0.8;
tapAudio.volume = 0.8;
blockAudio.volume = 0.8;

let columns = 9,
  rows = 9;

let playground = Array.from(Array(rows * columns));
let mines = 10;
let gameOver = false,
  remainingMines = mines,
  clickCount = 0,
  bestTime,
  totalWin = 0,
  totalFail = 0,
  soundEnabled = true;

const pad = function (value) {
  return String(value).padStart(2, "0");
};

remainingMinesEl.textContent = mines;
timerEl.textContent = "00:00:00";
messageEl.textContent = "";
bestTimeEl.textContent = "__:__:__";
totalWinEl.textContent = pad(totalWin);
totalFailEl.textContent = pad(totalFail);

let statContainerLastContent = statContainer.innerHTML;

let squaresWithMines = [];
let minesCount = 0;

let seconds = 0;
let timerInterval;

let processedTiles = new Set();

const startTimer = function () {
  timerInterval = setInterval(() => {
    seconds++;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    timerEl.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }, 1000);
};

const stopTimer = function () {
  clearInterval(timerInterval);
};

const setPlayground = () => {
  while (minesCount < mines) {
    const random = Math.random() * playground.length;
    console.log(random);
    const index = Math.floor(random);
    if (!squaresWithMines.includes(index)) {
      playground[index] = "M";
      squaresWithMines.push(index);
      minesCount++;
    }
  }
  console.log(squaresWithMines);
  console.log(playground);
  playground = playground.map((value, index) => {
    if (!squaresWithMines.includes(index)) {
      /* const originSurrounding = [index - columns, index + columns];
      if (index % columns !== 0) {
        originSurrounding.push(
          index - 1,
          index + columns - 1,
          index - columns - 1
        );
      }
      if (index % columns !== columns - 1) {
        originSurrounding.push(
          index + 1,
          index + columns + 1,
          index - columns + 1
        );
      }
      const surroundingCurrentThisSafeSquare = originSurrounding.filter(
        (val) => {
          return val >= 0 && val < playground.length;
        }
      );
      const surroundingMineCount = surroundingCurrentThisSafeSquare.reduce(
        (acc, square) => {
          if (playground[square] === "M") return acc + 1;
          else return acc;
        },
        0
      ); */
      let row = Math.floor(index / columns);
      let col = index % columns;
      let surroundingCurrentThisSafeSquare = [];

      // Liste des déplacements possibles (8 directions)
      let directions = [
        [-1, -1], // Haut-gauche
        [-1, 0], // Haut
        [-1, 1], // Haut-droite
        [0, -1], // Gauche
        [0, 1], // Droite
        [1, -1], // Bas-gauche
        [1, 0], // Bas
        [1, 1], // Bas-droite
      ];

      directions.forEach((dir) => {
        let newRow = row + dir[0];
        let newCol = col + dir[1];

        // Vérifier si la nouvelle position est dans les limites de la grille
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
          let newIndex = newRow * columns + newCol;
          surroundingCurrentThisSafeSquare.push(newIndex);
        }
      });
      const surroundingMineCount = surroundingCurrentThisSafeSquare.reduce(
        (acc, square) => {
          if (playground[square] === "M") return acc + 1;
          else return acc;
        },
        0
      );
      return {
        content: surroundingMineCount,
        surrounding: surroundingCurrentThisSafeSquare,
        blocked: false,
      };
    } else {
      return {
        content: value,
        squaresWithMines: squaresWithMines.filter((val) => val !== index),
        blocked: false,
      };
    }
  });
  console.log(playground);
};

setPlayground();

const handleOnClick = (index, { target }) => {
  if (clickCount === 0) {
    clickCount++;
    startTimer();
  }
  if (playground[index].blocked) return;
  if (processedTiles.has(index)) return;

  target.classList.remove("closed");
  target.textContent = playground[index].content;
  processedTiles.add(index);
  if (soundEnabled) tapAudio.play();

  if (playground[index].content === 0) {
    console.log(
      "clicked",
      index,
      "surrounding",
      ...playground[index].surrounding
    );
    console.log(target.textContent, playground[index].content);
    playground[index].surrounding.forEach((element) => {
      const safeEl = document.querySelector(`div[data-position='${element}']`);
      if (safeEl && !processedTiles.has(element)) {
        safeEl.click();
      }
    });
  }
  if (
    processedTiles.size === playground.length - mines &&
    !playground[index].squaresWithMines
  ) {
    stopTimer();
    messageEl.classList.add("win");
    messageEl.textContent = "You win!";
    if (soundEnabled) successAudio.play();
    if (!bestTime || seconds < bestTime) {
      bestTime = seconds;
      bestTimeEl.textContent = timerEl.textContent;
    }
    totalWinEl.textContent = pad(++totalWin);
    [...document.querySelectorAll(".tile")].forEach(
      (el) => (el.onclick = null)
    );
  }
  if (playground[index].content === "M") {
    stopTimer();
    messageEl.classList.add("lose");
    if (soundEnabled) failAudio.play();
    messageEl.textContent = "Game Over!";
    if (!gameOver) {
      gameOver = true;
      totalFailEl.textContent = pad(++totalFail);
    }

    playground[index].squaresWithMines.forEach((element) => {
      if (!processedTiles.has(element)) {
        target.style.backgroundColor = "#fa1515";
        const mine = document.querySelector(`div[data-position='${element}']`);
        if (mine && !processedTiles.has(element)) {
          mine.style.backgroundColor = "#de1515";
          if (playground[element].blocked) {
            playground[element].blocked = false;
          }
          mine.click();
        }
      }
    });
    [...document.querySelectorAll(".tile")].forEach(
      (el) => (el.onclick = null)
    );
  }

  target.oncontextmenu = null;
};

const handleMark = (index, e) => {
  e.preventDefault();
  if (soundEnabled) blockAudio.play();
  if (clickCount === 0) {
    clickCount++;
    startTimer();
  }
  if (playground[index].blocked) {
    remainingMines++;
  } else {
    remainingMines--;
  }
  remainingMinesEl.textContent = remainingMines;
  playground[index].blocked = !playground[index].blocked;
  e.target.dataset.blocked = playground[index].blocked ? "🛑" : "";
};

const createTile = (index) => {
  const tile = document.createElement("div");

  tile.classList.add("tile", "closed");
  tile.dataset.position = index;

  tile.onclick = (e) => handleOnClick(index, e);
  tile.oncontextmenu = (e) => handleMark(index, e);

  return tile;
};

const createTiles = () => {
  playground.map((_, index) => {
    wrapper.appendChild(createTile(index));
  });
};

const createGrid = () => {
  wrapper.innerHTML = "";

  wrapper.style.setProperty("--columns", columns);
  wrapper.style.setProperty("--rows", rows);

  createTiles(columns * rows);
};
createGrid();

const reloadGame = function () {
  playground = Array.from(Array(rows * columns));
  remainingMines = mines;
  squaresWithMines = [];
  clickCount = 0;
  minesCount = 0;
  seconds = 0;
  gameOver = false;
  remainingMinesEl.textContent = mines;
  timerEl.textContent = "00:00:00";
  messageEl.textContent = "";
  messageEl.classList.remove("lose", "win");
  processedTiles = new Set();
  stopTimer();
  setPlayground();
  createGrid();
};
reloadButton.onclick = () => reloadGame();
[...setGridButtons].forEach((setGridButton) => {
  setGridButton.onclick = (e) => {
    console.log("clicked");
    columns = e.target.dataset.columns;
    rows = e.target.dataset.rows;
    mines = e.target.dataset.mines;
    [...setGridButtons].forEach((button) => button.classList.remove("active"));
    e.target.classList.add("active");
    reloadGame();
  };
});
soundButton.onclick = () => {
  soundEnabled = !soundEnabled;
  if (!soundEnabled) {
    soundButton.innerHTML = `Inactif <ion-icon name="volume-mute"></ion-icon>`;
  } else {
    soundButton.innerHTML = `Actif <ion-icon name="volume-high"></ion-icon>`;
  }
};

tutoButton.onclick = () => {
  statContainerLastContent = statContainer.innerHTML;
  statContainer.innerHTML = `<div>
  <div class="stat-header">Tuto</div>
  <p class="tuto">
  Vous devez déminer ce champ de mines. <br/>
  Pour cela, il a été découpé en carrés qui peuvent contenir soit une seule mine (M), soit aucune. <br/>
  Au début, les mines, enterrées, ne sont bien évidement pas visibles.<br/>
Pour gagner au Démineur, il vous faut déterminer l'emplacement de toutes les mines.<br/>
Pour atteindre cet objectif, vous pourrez prendre connaissance du nombre de mines  dans le voisinage immédiat d'une case, en cliquant sur celle-ci et à condition qu'elle soit vide. 
Si jamais vous cliquez sur une case contenant une mine, celle-ci explose et vous perdez.
Il est possible de planter une roche 🛑 pour marquer l'emplacement supposé d'une mine, en faisant un clic droit.<br/>
Si la case cliquée est vide, toutes les cases vides adjacentes s'ouvriront recursivement.
Pour gagner, il ne doit pas y avoir de mines incorrectement marquées avec un drapeau. 
Par contre, il n'est pas nécessaire de marquer toutes les mines pour terminer; vous avez juste besoin de déterminer toutes les cases vides.<br/>
Le compteur gauche indique le nombre de mines restant à marquer.<br/>
Le compteur droit affiche le nombre de secondes écoulées. <br/>
</p>
<div class="stat-footer"></div>
</div>`;
};
statButton.onclick = () => {
  statContainer.innerHTML = statContainerLastContent;
};
// window.onresize = () => createGrid();
