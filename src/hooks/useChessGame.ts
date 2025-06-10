import { useState, useEffect, useCallback } from 'react';
import { GameState, Position, PieceColor, Move } from '../types/chess';
import { 
  initialBoard, 
  isValidMove, 
  makeMove, 
  getPossibleMoves, 
  wouldBeValidAfterMove 
} from '../utils/chessLogic';
import { getBestMove } from '../utils/chessAI';

const initialGameState: GameState = {
  board: initialBoard,
  currentPlayer: 'white',
  moves: [],
  gameStatus: 'playing',
  selectedSquare: null,
  validMoves: [],
  moveIndex: -1
};

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [aiLevel, setAiLevel] = useState(1);
  const [playerColor] = useState<PieceColor>('white');

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    setIsPlayerTurn(true);
  }, []);

  const navigateToMove = useCallback((index: number) => {
    if (index < -1 || index >= gameState.moves.length) return;

    if (index === -1) {
      setGameState(prev => ({
        ...prev,
        board: initialBoard,
        currentPlayer: 'white',
        moveIndex: -1,
        selectedSquare: null,
        validMoves: [],
        gameStatus: 'playing'
      }));
      return;
    }

    // Reconstruct board state up to the given move index
    let currentBoard = initialBoard.map(row => [...row]);
    let currentPlayer: PieceColor = 'white';

    for (let i = 0; i <= index; i++) {
      const move = gameState.moves[i];
      
      // Handle en passant
      if (move.isEnPassant) {
        currentBoard[move.from.row][move.to.col] = null;
      }
      
      // Handle castling
      if (move.isCastling) {
        const rookFromCol = move.to.col > move.from.col ? 7 : 0;
        const rookToCol = move.to.col > move.from.col ? 5 : 3;
        const rook = currentBoard[move.from.row][rookFromCol];
        currentBoard[move.from.row][rookToCol] = rook;
        currentBoard[move.from.row][rookFromCol] = null;
        if (rook) rook.hasMoved = true;
      }
      
      // Make the move
      currentBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
      currentBoard[move.from.row][move.from.col] = null;
      
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    }

    setGameState(prev => ({
      ...prev,
      board: currentBoard,
      currentPlayer,
      moveIndex: index,
      selectedSquare: null,
      validMoves: [],
      gameStatus: index === gameState.moves.length - 1 ? prev.gameStatus : 'playing'
    }));
  }, [gameState.moves]);

  const handleSquareClick = useCallback((position: Position) => {
    if (!isPlayerTurn || gameState.moveIndex !== gameState.moves.length - 1) return;

    const { selectedSquare, board, currentPlayer } = gameState;

    if (!selectedSquare) {
      // Select a piece
      const piece = board[position.row][position.col];
      if (piece && piece.color === currentPlayer && piece.color === playerColor) {
        const possibleMoves = getPossibleMoves(board, position, gameState.moves);
        const validMoves = possibleMoves.filter(move => 
          wouldBeValidAfterMove(board, position, move, currentPlayer, gameState.moves)
        );

        setGameState(prev => ({
          ...prev,
          selectedSquare: position,
          validMoves
        }));
      }
    } else {
      // Try to make a move
      if (isValidMove(board, selectedSquare, position, gameState.moves)) {
        const newGameState = makeMove(gameState, selectedSquare, position);
        setGameState(newGameState);
        setIsPlayerTurn(false);
      } else {
        // Deselect or select a new piece
        const piece = board[position.row][position.col];
        if (piece && piece.color === currentPlayer && piece.color === playerColor) {
          const possibleMoves = getPossibleMoves(board, position, gameState.moves);
          const validMoves = possibleMoves.filter(move => 
            wouldBeValidAfterMove(board, position, move, currentPlayer, gameState.moves)
          );

          setGameState(prev => ({
            ...prev,
            selectedSquare: position,
            validMoves
          }));
        } else {
          setGameState(prev => ({
            ...prev,
            selectedSquare: null,
            validMoves: []
          }));
        }
      }
    }
  }, [gameState, isPlayerTurn, playerColor]);

  // AI move
  useEffect(() => {
    if (!isPlayerTurn && 
        gameState.currentPlayer !== playerColor && 
        (gameState.gameStatus === 'playing' || gameState.gameStatus === 'check') &&
        gameState.moveIndex === gameState.moves.length - 1) {
      
      const timer = setTimeout(() => {
        const aiMove = getBestMove(gameState.board, gameState.currentPlayer, gameState.moves, aiLevel);
        if (aiMove) {
          const newGameState = makeMove(gameState, aiMove.from, aiMove.to);
          setGameState(newGameState);
        }
        setIsPlayerTurn(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, playerColor, aiLevel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateToMove(gameState.moveIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateToMove(gameState.moveIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.moveIndex, navigateToMove]);

  return {
    gameState,
    handleSquareClick,
    resetGame,
    aiLevel,
    setAiLevel,
    isPlayerTurn,
    navigateToMove,
    isViewingHistory: gameState.moveIndex !== gameState.moves.length - 1
  };
}