const playerFactory = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const gameBoard = (() => {
  // Initialize empty board, a two-dimensional array
  // '.' = blank cell.
  const gameBoardArray = [];
  for (let i = 0; i < 3; i += 1) {
    gameBoardArray[i] = [];
    for (let j = 0; j < 3; j += 1) {
      gameBoardArray[i].push('.');
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
    if (gameBoardArray[y - 1][x - 1] === '.') {
      gameBoardArray[y - 1][x - 1] = marker;
      // also return checkForWin(marker)
      return true;
    }
    return false;
  }

  // checkForWin(marker)
  // resetBoard()
  // getGameboard
  const getGameBoard = () => gameBoardArray;

  function printGameBoard() {
    console.log(gameBoardArray[0]);
    console.log(gameBoardArray[1]);
    console.log(gameBoardArray[2]);
  }

  return { getGameBoard, makeMove, printGameBoard };
})();

const gameController = (() => {
  // const board = gameBoard.getGameBoard();
  // console.table(board);

  // Ask for player 1 name and marker
  // Ask for player 2 name, assign other marker

  // show the (empty) board
  // randomly assign who goes first
  // ask for move
  // if it was legal, show the board
  // if checkforwin true, show winner, resetboard()
  // switch player

  // function newGame
  // askPlayerInfo
  // playRound
  // switchPlayer
  // getActivePlayer

  // function setPlayers(player1, marker1, player2, marker2) {
  //   // set player properties from DOM
  // }

  function setPlayers() {
    const player1 = playerFactory('Player 1', 'X');
    const player2 = playerFactory('Player 2', 'O');

    return [player1, player2];
  }

  const players = setPlayers();
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  function printNewRound() {
    gameBoard.printGameBoard();
    console.log(`It's ${activePlayer.getName()}'s turn.`);
  }

  function playRound(x, y) {
    // Have user try again if their move was invalid.
    if (gameBoard.makeMove(x, y, activePlayer.getMarker()) === false) {
      console.log("Sorry, that move isn't valid. Please try again.");
      printNewRound();
      return;
    }

    // checkForWin
    console.log(`${activePlayer.getName()} made a move:`);
    switchPlayerTurn();
    printNewRound();
  }

  printNewRound();

  return { playRound, activePlayer };
})();
