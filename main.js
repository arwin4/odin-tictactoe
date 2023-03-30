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

    const result = { gameFinished: false, isResultDraw: false };

    function checkStraightWins(board) {
      for (let i = 0; i < 3; i += 1) {
        const row = board[i];
        if (row.every((cell) => cell === marker)) {
          result.gameFinished = true;
          result.isResultDraw = false;
          return result;
        }
      }
      return result;
    }

    // Check for horizontal wins
    checkStraightWins(gameBoardArray);

    // Swap the axes to check for vertical wins
    // Transpose function source: https://stackoverflow.com/a/46805290
    function transpose(board) {
      return board[0].map((col, i) => board.map((row) => row[i]));
    }

    const swappedBoard = transpose(gameBoardArray);

    checkStraightWins(swappedBoard);

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

    // No game ending state found. Result unchanged from initialization.
    return result;
  }

  return { makeMove, checkForWin, resetBoard };
})();

const gameController = (() => {
  function setPlayers(player1name = 'Player one', player2name = 'Player two') {
    const player1 = playerFactory(player1name, 'cross');
    const player2 = playerFactory(player2name, 'circle');

    return [player1, player2];
  }

  // Create two default players. Allow Player one to make the first move.
  let players = setPlayers();
  const setActivePlayer = () => players[0];
  let activePlayer = setActivePlayer();

  // Allow the user to set their own player names
  function setNewPlayers(player1name, player2name) {
    players = setPlayers(player1name, player2name);
    activePlayer = setActivePlayer();
  }

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  function playRound(x, y) {
    let roundResult = { validMove: null };

    // If the move is invalid, pass that on
    if (gameBoard.makeMove(x, y, activePlayer.getMarker()) === false) {
      roundResult.validMove = false;
      return roundResult;
    }

    // If the move is valid, check for a win
    roundResult.validMove = true;

    roundResult = gameBoard.checkForWin(activePlayer.getMarker());
    if (roundResult.gameFinished === true) {
      // End the game
      roundResult.winner = activePlayer.getName();
      switchPlayerTurn();
      return roundResult;
    }

    // If the move was valid, but there's no win or draw, continue.
    switchPlayerTurn();
    return roundResult;
  }

  const getActivePlayer = () => activePlayer;

  gameBoard.resetBoard();

  return { playRound, getActivePlayer, setNewPlayers };
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

  function handleNewNames() {
    const form = document.getElementById('custom-names');
    const player1name = document.getElementById('player1');
    const player2name = document.getElementById('player2');
    form.addEventListener('submit', (e) => {
      // Prevent page change
      e.preventDefault();

      gameController.setNewPlayers(player1name.value, player2name.value);

      newGame();

      // Empty the input fields
      player1name.value = '';
      player2name.value = '';
    });
  }

  initialBoardRender();
  handleControls();
  handleNewNames();
  activateInteractiveBoard();
})();
