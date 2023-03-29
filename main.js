/* eslint-disable no-console */

// This program takes heavy inspiration from
// https://www.ayweb.dev/blog/building-a-house-from-the-inside-out

// TODO: Add underscore to private variables
// TODO: Make player 1 always go first (even after the new game button is used)

const playerFactory = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const gameBoard = (() => {
  const gameBoardArray = [];

  function resetBoard() {
    // Initialize empty board, a two-dimensional array
    // null = blank cell.
    for (let i = 0; i < 3; i += 1) {
      gameBoardArray[i] = [];
      for (let j = 0; j < 3; j += 1) {
        gameBoardArray[i].push(null);
      }
    }
  }

  function makeMove(x, y, marker) {
    // Discard move if coordinate is outside board
    if (
      gameBoardArray[y - 1] === undefined ||
      gameBoardArray[x - 1] === undefined
    )
      return false;

    // Place marker if cell is blank
    if (gameBoardArray[y - 1][x - 1] === null) {
      gameBoardArray[y - 1][x - 1] = marker;
      // also return checkForWin(marker)
      return true;
    }
    return false;
  }

  function checkForWin(marker) {
    // Check for a win first. If there's none, check for a draw.
    // NOTE: I realize it's faster to check against a list of all win
    // conditions, since that's a fairly short one, but to practice, I wanted to
    // write down more of the actual logic of the game.

    const result = { gameFinished: false, isResultDraw: false };

    // Check for horizontal wins
    for (let i = 0; i < 3; i += 1) {
      const row = gameBoardArray[i];
      if (row.every((cell) => cell === marker)) {
        result.gameFinished = true;
        result.isResultDraw = false;
        return result;
      }
    }

    // Check for vertical wins
    // TODO: find wins like horizontal using every()
    for (let i = 0; i < 3; i += 1) {
      if (
        gameBoardArray[0][i] === marker &&
        gameBoardArray[1][i] === marker &&
        gameBoardArray[2][i] === marker
      ) {
        result.gameFinished = true;
        result.isResultDraw = false;
        return result;
      }
    }

    // Check for diagonal wins
    if (
      (gameBoardArray[0][0] === marker &&
        gameBoardArray[1][1] === marker &&
        gameBoardArray[2][2] === marker) ||
      (gameBoardArray[0][2] === marker &&
        gameBoardArray[1][1] === marker &&
        gameBoardArray[2][0] === marker)
    ) {
      result.gameFinished = true;
      result.isResultDraw = false;
      return result;
    }

    // If there's no winner but the board is full, it's a draw.
    // Check whether every cell isn't still null.
    if (gameBoardArray.every((row) => row.every((cell) => cell !== null))) {
      result.gameFinished = true;
      result.isResultDraw = true;
      return result;
    }

    // No game ending state found
    return result;
  }

  const getGameBoard = () => gameBoardArray;

  function printGameBoard() {
    console.log(gameBoardArray[0]);
    console.log(gameBoardArray[1]);
    console.log(gameBoardArray[2]);
  }

  resetBoard();

  return { getGameBoard, makeMove, printGameBoard, checkForWin, resetBoard };
})();

const gameController = (() => {
  function setPlayers() {
    const player1 = playerFactory('Player 1', 'cross');
    const player2 = playerFactory('Player 2', 'circle');

    return [player1, player2];
  }

  const players = setPlayers();
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  function printNewRound() {
    gameBoard.printGameBoard();
    // console.log(`It's ${activePlayer.getName()}'s turn.`);
  }

  function playRound(x, y) {
    let roundResult = { validMove: null };

    // If the move is invalid, pass that on
    if (gameBoard.makeMove(x, y, activePlayer.getMarker()) === false) {
      roundResult.validMove = false;
      console.log(roundResult);
      return roundResult;
    }

    // If the move is valid, check for a win
    roundResult.validMove = true;

    roundResult = gameBoard.checkForWin(activePlayer.getMarker());
    if (roundResult.gameFinished === true) {
      // End the game
      console.log(activePlayer.getName());
      console.log(roundResult);
      roundResult.winner = activePlayer.getName();
      switchPlayerTurn();
      return roundResult;
    }

    // If the move was valid, but there's no win or draw, continue.
    switchPlayerTurn();
    console.log(roundResult);
    return roundResult;
  }

  function getActivePlayer() {
    return activePlayer;
  }

  printNewRound();

  return { playRound, getActivePlayer };
})();

const screenController = (() => {
  const board = document.querySelector('.gameboard');

  // Render the board
  function initialBoardRender() {
    // Create the cells with coordinate attributes so that they can be passed on
    // to gameRound(x, y)
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const cell = document.createElement('button');
        cell.setAttribute('xPosition', j + 1);
        cell.setAttribute('yPosition', i + 1);
        cell.classList.add('cell');
        board.appendChild(cell);
      }
    }
  }

  const allCells = board.childNodes;

  function showInputOnHover(e) {
    // Show a ghost image of the current input when user hovers over a cell

    const button = e.target;
    const marker = gameController.getActivePlayer().getMarker();

    // Show the ghost when cursor enters
    if (e.type === 'mouseover') {
      if (marker === 'cross') {
        button.classList.add('cross-transparent');
      } else {
        button.classList.add('circle-transparent');
      }
    } else {
      // Remove the ghost when the cursor leaves
      button.classList.remove('cross-transparent', 'circle-transparent');
    }
  }

  function deactivateInteractiveBoard() {
    // Disable all cells completely

    allCells.forEach((cell) => {
      const tempCell = cell;

      // Visually make the cell inactive
      tempCell.classList.add('closed');

      if (tempCell.disabled === true) return;

      // Disable the cell semantically
      tempCell.disabled = true;

      // Remove all listeners. Clicked cells are already disabled.
      tempCell.removeEventListener('mouseover', showInputOnHover);
      tempCell.removeEventListener('mouseout', showInputOnHover);
    });
  }

  function endGame(roundResult) {
    // Deactivate the board and show win message
    deactivateInteractiveBoard();

    const { isResultDraw } = roundResult;
    const { winner } = roundResult;

    // Show win message
    const winMessage = document.createElement('div');
    if (isResultDraw === false) {
      winMessage.textContent = `${winner} wins this round!`;
    } else {
      winMessage.textContent = "Tic-tac-TIE!! I'll see myself out...";
    }

    const winMessageDiv = document.querySelector('.win-message');
    winMessageDiv.appendChild(winMessage);
  }

  function showMove(button) {
    const btn = button;
    const xPosition = button.getAttribute('xPosition');
    const yPosition = button.getAttribute('yPosition');
    const roundResult = gameController.playRound(xPosition, yPosition);

    // If the move was invalid, ignore it
    if (roundResult.validMove === false) return;

    // Remove the hover-on-input displays for this cell
    btn.classList.remove('circle-transparent', 'cross-transparent');

    // Mark the button as disabled. This remove the pointer on hover and
    // indirectly deactivates click event listener.
    btn.disabled = true;

    // Show the move on the board
    // TODO: remove need for the active player's marker swap (allow direct
    // passing of the marker)
    if (gameController.getActivePlayer().getMarker() === 'cross') {
      btn.classList.add('circle');
    } else {
      btn.classList.add('cross');
    }

    if (roundResult.gameFinished === true) endGame(roundResult);
  }

  function activateInteractiveBoard() {
    allCells.forEach((cell) => {
      const tempCell = cell;

      // Remove properties of potentially disabled cells
      tempCell.disabled = false;
      tempCell.classList.remove('closed');

      // Handle click and remove listeners that show input on hover
      tempCell.addEventListener('click', (e) => {
        tempCell.removeEventListener('mouseover', showInputOnHover);
        tempCell.removeEventListener('mouseout', showInputOnHover);
        showMove(e.target);
      });

      // Add listeners for showing input on hover
      tempCell.addEventListener('mouseover', showInputOnHover);
      tempCell.addEventListener('mouseout', showInputOnHover);
    });
  }

  function newGame() {
    gameBoard.resetBoard();
    activateInteractiveBoard();

    // Empty all the cells on screen
    allCells.forEach((cell) => {
      const tempCell = cell;
      tempCell.classList.remove('circle', 'cross');
    });
  }

  function handleControls() {
    const newGameBtn = document.querySelector('.new-game');
    newGameBtn.addEventListener('click', newGame);
  }

  initialBoardRender();
  handleControls();
  activateInteractiveBoard();
})();
