export function generatePuzzle(clueCount = 38) {
  const board = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill diagonal boxes
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  // Solve the rest to get a complete solution
  solveBoard(board);
  
  const solution = board.map(row => [...row]);
  const puzzle = board.map(row => [...row]);
  
  const cellsToRemove = 81 - Math.max(17, Math.min(clueCount, 80));
  let count = 0;
  
  while (count < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null as any;
      count++;
    }
  }
  
  return { puzzle, solution };
}

function fillBox(board: number[][], rowStart: number, colStart: number) {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, rowStart, colStart, num));
      board[rowStart + i][colStart + j] = num;
    }
  }
}

function isSafeInBox(board: number[][], rowStart: number, colStart: number, num: number) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

export function isValidPlacement(board: (number|null)[][], row: number, col: number, num: number) {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col] === num) return false;
  }
  
  // Check box
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((startRow + i !== row || startCol + j !== col) && 
          board[startRow + i][startCol + j] === num) {
        return false;
      }
    }
  }
  
  return true;
}

function solveBoard(board: number[][]) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isSafe(board: number[][], row: number, col: number, num: number) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}
