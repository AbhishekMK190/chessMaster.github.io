import { ChessPiece, Position, Move, GameState, PieceColor, PieceType } from '../types/chess';

export const initialBoard: (ChessPiece | null)[][] = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' }
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' } as ChessPiece)),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' } as ChessPiece)),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' }
  ]
];

export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function getPieceAt(board: (ChessPiece | null)[][], pos: Position): ChessPiece | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

export function isOpposite(color1: PieceColor, color2: PieceColor): boolean {
  return color1 !== color2;
}

export function getPossibleMoves(
  board: (ChessPiece | null)[][],
  pos: Position,
  moves: Move[] = []
): Position[] {
  const piece = getPieceAt(board, pos);
  if (!piece) return [];

  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, pos, piece.color, moves);
    case 'rook':
      return getRookMoves(board, pos, piece.color);
    case 'knight':
      return getKnightMoves(board, pos, piece.color);
    case 'bishop':
      return getBishopMoves(board, pos, piece.color);
    case 'queen':
      return getQueenMoves(board, pos, piece.color);
    case 'king':
      return getKingMoves(board, pos, piece.color, moves);
    default:
      return [];
  }
}

function getPawnMoves(
  board: (ChessPiece | null)[][],
  pos: Position,
  color: PieceColor,
  moves: Move[]
): Position[] {
  const validMoves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Forward move
  const oneStep = { row: pos.row + direction, col: pos.col };
  if (isValidPosition(oneStep) && !getPieceAt(board, oneStep)) {
    validMoves.push(oneStep);

    // Two squares forward from starting position
    if (pos.row === startRow) {
      const twoStep = { row: pos.row + 2 * direction, col: pos.col };
      if (isValidPosition(twoStep) && !getPieceAt(board, twoStep)) {
        validMoves.push(twoStep);
      }
    }
  }

  // Diagonal captures
  const captureLeft = { row: pos.row + direction, col: pos.col - 1 };
  const captureRight = { row: pos.row + direction, col: pos.col + 1 };

  [captureLeft, captureRight].forEach(capturePos => {
    if (isValidPosition(capturePos)) {
      const targetPiece = getPieceAt(board, capturePos);
      if (targetPiece && isOpposite(color, targetPiece.color)) {
        validMoves.push(capturePos);
      }
    }
  });

  // En passant
  if (moves.length > 0) {
    const lastMove = moves[moves.length - 1];
    if (
      lastMove.piece.type === 'pawn' &&
      Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
      lastMove.to.row === pos.row &&
      Math.abs(lastMove.to.col - pos.col) === 1
    ) {
      const enPassantPos = { row: pos.row + direction, col: lastMove.to.col };
      if (isValidPosition(enPassantPos)) {
        validMoves.push(enPassantPos);
      }
    }
  }

  return validMoves;
}

function getRookMoves(board: (ChessPiece | null)[][], pos: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, pos, color, [
    { row: 0, col: 1 }, { row: 0, col: -1 },
    { row: 1, col: 0 }, { row: -1, col: 0 }
  ]);
}

function getBishopMoves(board: (ChessPiece | null)[][], pos: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, pos, color, [
    { row: 1, col: 1 }, { row: 1, col: -1 },
    { row: -1, col: 1 }, { row: -1, col: -1 }
  ]);
}

function getQueenMoves(board: (ChessPiece | null)[][], pos: Position, color: PieceColor): Position[] {
  return getSlidingMoves(board, pos, color, [
    { row: 0, col: 1 }, { row: 0, col: -1 },
    { row: 1, col: 0 }, { row: -1, col: 0 },
    { row: 1, col: 1 }, { row: 1, col: -1 },
    { row: -1, col: 1 }, { row: -1, col: -1 }
  ]);
}

function getSlidingMoves(
  board: (ChessPiece | null)[][],
  pos: Position,
  color: PieceColor,
  directions: Position[]
): Position[] {
  const validMoves: Position[] = [];

  directions.forEach(direction => {
    for (let i = 1; i < 8; i++) {
      const newPos = {
        row: pos.row + direction.row * i,
        col: pos.col + direction.col * i
      };

      if (!isValidPosition(newPos)) break;

      const targetPiece = getPieceAt(board, newPos);
      if (!targetPiece) {
        validMoves.push(newPos);
      } else {
        if (isOpposite(color, targetPiece.color)) {
          validMoves.push(newPos);
        }
        break;
      }
    }
  });

  return validMoves;
}

function getKnightMoves(board: (ChessPiece | null)[][], pos: Position, color: PieceColor): Position[] {
  const moves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];

  return moves
    .map(move => ({ row: pos.row + move.row, col: pos.col + move.col }))
    .filter(newPos => {
      if (!isValidPosition(newPos)) return false;
      const targetPiece = getPieceAt(board, newPos);
      return !targetPiece || isOpposite(color, targetPiece.color);
    });
}

function getKingMoves(
  board: (ChessPiece | null)[][],
  pos: Position,
  color: PieceColor,
  moves: Move[]
): Position[] {
  const validMoves: Position[] = [];
  
  // Regular king moves
  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      if (rowOffset === 0 && colOffset === 0) continue;
      
      const newPos = { row: pos.row + rowOffset, col: pos.col + colOffset };
      if (isValidPosition(newPos)) {
        const targetPiece = getPieceAt(board, newPos);
        if (!targetPiece || isOpposite(color, targetPiece.color)) {
          validMoves.push(newPos);
        }
      }
    }
  }

  // Castling
  const king = getPieceAt(board, pos);
  if (king && !king.hasMoved && !isInCheck(board, color)) {
    // Kingside castling
    const kingsideRookPos = { row: pos.row, col: 7 };
    const kingsideRook = getPieceAt(board, kingsideRookPos);
    if (
      kingsideRook &&
      kingsideRook.type === 'rook' &&
      kingsideRook.color === color &&
      !kingsideRook.hasMoved &&
      !getPieceAt(board, { row: pos.row, col: 5 }) &&
      !getPieceAt(board, { row: pos.row, col: 6 })
    ) {
      validMoves.push({ row: pos.row, col: 6 });
    }

    // Queenside castling
    const queensideRookPos = { row: pos.row, col: 0 };
    const queensideRook = getPieceAt(board, queensideRookPos);
    if (
      queensideRook &&
      queensideRook.type === 'rook' &&
      queensideRook.color === color &&
      !queensideRook.hasMoved &&
      !getPieceAt(board, { row: pos.row, col: 1 }) &&
      !getPieceAt(board, { row: pos.row, col: 2 }) &&
      !getPieceAt(board, { row: pos.row, col: 3 })
    ) {
      validMoves.push({ row: pos.row, col: 2 });
    }
  }

  return validMoves;
}

export function findKing(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

// New helper function to check if a square is attacked without causing recursion
export function isSquareAttacked(board: (ChessPiece | null)[][], targetPos: Position, byColor: PieceColor): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === byColor) {
        const piecePos = { row, col };
        
        // For each piece type, check if it can attack the target position
        switch (piece.type) {
          case 'pawn':
            if (canPawnAttack(piecePos, targetPos, byColor)) return true;
            break;
          case 'rook':
            if (canRookAttack(board, piecePos, targetPos)) return true;
            break;
          case 'knight':
            if (canKnightAttack(piecePos, targetPos)) return true;
            break;
          case 'bishop':
            if (canBishopAttack(board, piecePos, targetPos)) return true;
            break;
          case 'queen':
            if (canQueenAttack(board, piecePos, targetPos)) return true;
            break;
          case 'king':
            if (canKingAttack(piecePos, targetPos)) return true;
            break;
        }
      }
    }
  }
  return false;
}

function canPawnAttack(pawnPos: Position, targetPos: Position, pawnColor: PieceColor): boolean {
  const direction = pawnColor === 'white' ? -1 : 1;
  const attackRow = pawnPos.row + direction;
  
  return attackRow === targetPos.row && 
         Math.abs(pawnPos.col - targetPos.col) === 1;
}

function canRookAttack(board: (ChessPiece | null)[][], rookPos: Position, targetPos: Position): boolean {
  // Same row or column
  if (rookPos.row !== targetPos.row && rookPos.col !== targetPos.col) return false;
  
  return hasClearPath(board, rookPos, targetPos);
}

function canBishopAttack(board: (ChessPiece | null)[][], bishopPos: Position, targetPos: Position): boolean {
  // Same diagonal
  if (Math.abs(bishopPos.row - targetPos.row) !== Math.abs(bishopPos.col - targetPos.col)) return false;
  
  return hasClearPath(board, bishopPos, targetPos);
}

function canQueenAttack(board: (ChessPiece | null)[][], queenPos: Position, targetPos: Position): boolean {
  return canRookAttack(board, queenPos, targetPos) || canBishopAttack(board, queenPos, targetPos);
}

function canKnightAttack(knightPos: Position, targetPos: Position): boolean {
  const rowDiff = Math.abs(knightPos.row - targetPos.row);
  const colDiff = Math.abs(knightPos.col - targetPos.col);
  
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function canKingAttack(kingPos: Position, targetPos: Position): boolean {
  const rowDiff = Math.abs(kingPos.row - targetPos.row);
  const colDiff = Math.abs(kingPos.col - targetPos.col);
  
  return rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0);
}

function hasClearPath(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  const rowDir = to.row > from.row ? 1 : to.row < from.row ? -1 : 0;
  const colDir = to.col > from.col ? 1 : to.col < from.col ? -1 : 0;
  
  let currentRow = from.row + rowDir;
  let currentCol = from.col + colDir;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowDir;
    currentCol += colDir;
  }
  
  return true;
}

export function isInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  return isSquareAttacked(board, kingPos, color === 'white' ? 'black' : 'white');
}

export function isValidMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  moves: Move[]
): boolean {
  const possibleMoves = getPossibleMoves(board, from, moves);
  return possibleMoves.some(move => move.row === to.row && move.col === to.col);
}

export function makeMove(gameState: GameState, from: Position, to: Position): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = getPieceAt(newBoard, from);
  
  if (!piece) return gameState;

  const capturedPiece = getPieceAt(newBoard, to);
  let isEnPassant = false;
  let isCastling = false;

  // Handle en passant
  if (piece.type === 'pawn' && !capturedPiece && from.col !== to.col) {
    isEnPassant = true;
    newBoard[from.row][to.col] = null; // Remove captured pawn
  }

  // Handle castling
  if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
    isCastling = true;
    const rookFromCol = to.col > from.col ? 7 : 0;
    const rookToCol = to.col > from.col ? 5 : 3;
    const rook = newBoard[from.row][rookFromCol];
    newBoard[from.row][rookToCol] = rook;
    newBoard[from.row][rookFromCol] = null;
    if (rook) rook.hasMoved = true;
  }

  // Make the move
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  newBoard[from.row][from.col] = null;

  const move: Move = {
    from,
    to,
    piece: { ...piece },
    capturedPiece,
    isEnPassant,
    isCastling
  };

  const newMoves = [...gameState.moves.slice(0, gameState.moveIndex + 1), move];
  const nextPlayer: PieceColor = gameState.currentPlayer === 'white' ? 'black' : 'white';
  
  // Check game status
  let gameStatus: GameState['gameStatus'] = 'playing';
  if (isInCheck(newBoard, nextPlayer)) {
    gameStatus = hasValidMoves(newBoard, nextPlayer, newMoves) ? 'check' : 'checkmate';
  } else if (!hasValidMoves(newBoard, nextPlayer, newMoves)) {
    gameStatus = 'stalemate';
  }

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    moves: newMoves,
    moveIndex: newMoves.length - 1,
    gameStatus,
    selectedSquare: null,
    validMoves: []
  };
}

function hasValidMoves(board: (ChessPiece | null)[][], color: PieceColor, moves: Move[]): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const possibleMoves = getPossibleMoves(board, { row, col }, moves);
        for (const move of possibleMoves) {
          if (wouldBeValidAfterMove(board, { row, col }, move, color, moves)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function wouldBeValidAfterMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor,
  moves: Move[]
): boolean {
  // Simulate the move
  const testBoard = board.map(row => [...row]);
  const piece = testBoard[from.row][from.col];
  testBoard[to.row][to.col] = piece;
  testBoard[from.row][from.col] = null;
  
  return !isInCheck(testBoard, color);
}

export function getAllValidMoves(board: (ChessPiece | null)[][], color: PieceColor, moves: Move[]): Move[] {
  const validMoves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const fromPos = { row, col };
        const possibleMoves = getPossibleMoves(board, fromPos, moves);
        
        for (const toPos of possibleMoves) {
          if (wouldBeValidAfterMove(board, fromPos, toPos, color, moves)) {
            validMoves.push({
              from: fromPos,
              to: toPos,
              piece: { ...piece },
              capturedPiece: getPieceAt(board, toPos) || undefined
            });
          }
        }
      }
    }
  }
  
  return validMoves;
}