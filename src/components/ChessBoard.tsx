import React from 'react';
import { ChessPiece } from './ChessPiece';
import { Position, GameState } from '../types/chess';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  flipped?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  gameState, 
  onSquareClick, 
  flipped = false 
}) => {
  const { board, selectedSquare, validMoves } = gameState;

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isLightSquare = (row: number, col: number) => {
    return (row + col) % 2 === 0;
  };

  const getSquareClasses = (row: number, col: number) => {
    const baseClasses = 'w-full h-full flex items-center justify-center relative cursor-pointer transition-all duration-200';
    const colorClasses = isLightSquare(row, col) 
      ? 'bg-amber-100 hover:bg-amber-200' 
      : 'bg-amber-800 hover:bg-amber-700';
    
    let additionalClasses = '';
    
    if (isSquareSelected(row, col)) {
      additionalClasses += ' ring-4 ring-blue-400 bg-blue-200';
    } else if (isValidMove(row, col)) {
      additionalClasses += ' ring-2 ring-green-400';
    }

    return `${baseClasses} ${colorClasses} ${additionalClasses}`;
  };

  const renderSquare = (row: number, col: number) => {
    const actualRow = flipped ? 7 - row : row;
    const actualCol = flipped ? 7 - col : col;
    const piece = board[actualRow][actualCol];

    return (
      <div
        key={`${row}-${col}`}
        className={getSquareClasses(actualRow, actualCol)}
        onClick={() => onSquareClick({ row: actualRow, col: actualCol })}
      >
        {piece && <ChessPiece piece={piece} size={window.innerWidth < 640 ? 32 : 48} />}
        {isValidMove(actualRow, actualCol) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${piece ? 'ring-2 ring-green-400 bg-transparent' : 'bg-green-400'}`} />
          </div>
        )}
      </div>
    );
  };

  const renderFileLabels = () => {
    const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return (
      <div className="flex">
        <div className="w-6"></div>
        {files.map(file => (
          <div key={file} className="flex-1 text-center text-sm font-medium text-gray-600">
            {file}
          </div>
        ))}
      </div>
    );
  };

  const renderRankLabel = (rank: number) => {
    const displayRank = flipped ? rank + 1 : 8 - rank;
    return (
      <div className="w-6 flex items-center justify-center text-sm font-medium text-gray-600">
        {displayRank}
      </div>
    );
  };

  return (
    <div className="inline-block bg-amber-900 p-4 rounded-lg shadow-2xl">
      {renderFileLabels()}
      <div className="grid grid-cols-9 gap-0">
        {Array.from({ length: 8 }, (_, row) => (
          <React.Fragment key={row}>
            {renderRankLabel(row)}
            {Array.from({ length: 8 }, (_, col) => (
              <div key={`${row}-${col}`} className="aspect-square w-12 sm:w-16 md:w-20">
                {renderSquare(row, col)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      {renderFileLabels()}
    </div>
  );
};