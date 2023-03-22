const gameBoard = (() => {
  // Initialize empty board, a two-dimensional array
  // 0 = blank cell.
  const gameBoardArray = [];
  for (let i = 0; i < 3; i += 1) {
    gameBoardArray[i] = [];
    for (let j = 0; j < 3; j += 1) {
      gameBoardArray[i].push(0);
    }
  }

  function makeMove(x, y, marker) {
    if (gameBoardArray[y - 1][x - 1] === 0) {
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

  return { getGameBoard, makeMove };
})();

const gameController = (() => {
  const board = gameBoard.getGameBoard();
  console.table(board);

  // Ask for player 1 name and marker
  // Ask for player 2 name, assign other marker

  // show the (empty) board
  // randomly assign who goes first
  // ask for move
  // if it was legal, show the board
  // if checkforwin true, show winner, resetboard()

  return {};
})();

const playerFactory = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const playerOne = playerFactory('beautiful name', 'X');
const playerTwo = playerFactory('great name', 'O');
