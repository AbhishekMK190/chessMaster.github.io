import React from 'react';
import { ChessPiece as ChessPieceType } from '../types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  size?: number;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟'
};

export const ChessPiece: React.FC<ChessPieceProps> = ({ piece, size = 40 }) => {
  const pieceKey = `${piece.color}-${piece.type}`;
  const symbol = PIECE_SYMBOLS[pieceKey];

  return (
    <div
      className="flex items-center justify-center select-none cursor-pointer transition-transform hover:scale-110"
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {symbol}
    </div>
  );
};