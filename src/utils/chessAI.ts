import { ChessPiece, Position, Move, PieceColor, PieceType } from '../types/chess';
import { getAllValidMoves, getPieceAt, findKing, isInCheck } from './chessLogic';

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000
};

const POSITION_VALUES: Record<PieceType, number[][]> = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

export function getBestMove(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moves: Move[],
  level: number
): Move | null {
  const validMoves = getAllValidMoves(board, color, moves);
  if (validMoves.length === 0) return null;

  switch (level) {
    case 1:
      return getRandomMove(validMoves);
    case 2:
      return getCapturingMove(validMoves) || getRandomMove(validMoves);
    case 3:
      return getBasicEvaluatedMove(board, validMoves, color);
    case 4:
      return getMinimaxMove(board, color, moves, 2);
    case 5:
      return getMinimaxMove(board, color, moves, 3);
    default:
      return getRandomMove(validMoves);
  }
}

function getRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

function getCapturingMove(moves: Move[]): Move | null {
  const capturingMoves = moves.filter(move => move.capturedPiece);
  if (capturingMoves.length === 0) return null;
  
  // Prefer capturing higher value pieces
  capturingMoves.sort((a, b) => {
    const aValue = a.capturedPiece ? PIECE_VALUES[a.capturedPiece.type] : 0;
    const bValue = b.capturedPiece ? PIECE_VALUES[b.capturedPiece.type] : 0;
    return bValue - aValue;
  });
  
  return capturingMoves[0];
}

function getBasicEvaluatedMove(
  board: (ChessPiece | null)[][],
  moves: Move[],
  color: PieceColor
): Move {
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const score = evaluateMove(board, move, color);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function evaluateMove(board: (ChessPiece | null)[][], move: Move, color: PieceColor): number {
  let score = 0;

  // Capture value
  if (move.capturedPiece) {
    score += PIECE_VALUES[move.capturedPiece.type] * 10;
  }

  // Position value
  const positionTable = POSITION_VALUES[move.piece.type];
  const row = color === 'white' ? 7 - move.to.row : move.to.row;
  score += positionTable[row][move.to.col];

  // Center control
  const centerSquares = [
    {row: 3, col: 3}, {row: 3, col: 4},
    {row: 4, col: 3}, {row: 4, col: 4}
  ];
  if (centerSquares.some(square => square.row === move.to.row && square.col === move.to.col)) {
    score += 20;
  }

  return score;
}

function getMinimaxMove(
  board: (ChessPiece | null)[][],
  color: PieceColor,
  moves: Move[],
  depth: number
): Move | null {
  const validMoves = getAllValidMoves(board, color, moves);
  if (validMoves.length === 0) return null;

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const newBoard = simulateMove(board, move);
    const score = minimax(newBoard, depth - 1, false, color, moves, -Infinity, Infinity);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  board: (ChessPiece | null)[][],
  depth: number,
  isMaximizing: boolean,
  aiColor: PieceColor,
  moves: Move[],
  alpha: number,
  beta: number
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }

  const currentColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white');
  const validMoves = getAllValidMoves(board, currentColor, moves);

  if (validMoves.length === 0) {
    if (isInCheck(board, currentColor, moves)) {
      return isMaximizing ? -10000 : 10000; // Checkmate
    }
    return 0; // Stalemate
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of validMoves) {
      const newBoard = simulateMove(board, move);
      const score = minimax(newBoard, depth - 1, false, aiColor, moves, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of validMoves) {
      const newBoard = simulateMove(board, move);
      const score = minimax(newBoard, depth - 1, true, aiColor, moves, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
}

function simulateMove(board: (ChessPiece | null)[][], move: Move): (ChessPiece | null)[][] {
  const newBoard = board.map(row => [...row]);
  
  // Handle en passant
  if (move.isEnPassant) {
    newBoard[move.from.row][move.to.col] = null;
  }
  
  // Handle castling
  if (move.isCastling) {
    const rookFromCol = move.to.col > move.from.col ? 7 : 0;
    const rookToCol = move.to.col > move.from.col ? 5 : 3;
    const rook = newBoard[move.from.row][rookFromCol];
    newBoard[move.from.row][rookToCol] = rook;
    newBoard[move.from.row][rookFromCol] = null;
  }
  
  // Make the move
  newBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
  newBoard[move.from.row][move.from.col] = null;
  
  return newBoard;
}

function evaluateBoard(board: (ChessPiece | null)[][], aiColor: PieceColor): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        let pieceValue = PIECE_VALUES[piece.type];
        
        // Position bonus
        const positionTable = POSITION_VALUES[piece.type];
        const tableRow = piece.color === 'white' ? 7 - row : row;
        pieceValue += positionTable[tableRow][col] / 100;

        if (piece.color === aiColor) {
          score += pieceValue;
        } else {
          score -= pieceValue;
        }
      }
    }
  }

  return score;
}