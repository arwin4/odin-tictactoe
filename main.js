const gameBoard = (() => {
  const rows = 3;
  const columns = 3;
  const board = [];

  // Initialize empty board, a two-dimensional array
  for (let i = 0; i < rows; i += 1) {
    board[i] = [];
    for (let j = 0; j < columns; j += 1) {
      board[i].push(0);
    }
  }

  function play() {
    gameBoard.board[0][0] = 1;
  }

  return { board, play };
})();

const displayController = (() => {
  // connect to the dom
})();
