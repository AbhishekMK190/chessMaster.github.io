import React from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { AILevel } from '../types/chess';

interface GameControlsProps {
  aiLevel: number;
  onAiLevelChange: (level: number) => void;
  onReset: () => void;
  moveIndex: number;
  totalMoves: number;
  onNavigate: (index: number) => void;
  isViewingHistory: boolean;
  gameStatus: string;
}

const AI_LEVELS: AILevel[] = [
  { level: 1, name: 'Beginner', description: 'Random moves' },
  { level: 2, name: 'Novice', description: 'Captures pieces' },
  { level: 3, name: 'Intermediate', description: 'Basic strategy' },
  { level: 4, name: 'Advanced', description: 'Deep thinking' },
  { level: 5, name: 'Expert', description: 'Master level' }
];

export const GameControls: React.FC<GameControlsProps> = ({
  aiLevel,
  onAiLevelChange,
  onReset,
  moveIndex,
  totalMoves,
  onNavigate,
  isViewingHistory,
  gameStatus
}) => {
  const getStatusDisplay = () => {
    switch (gameStatus) {
      case 'check':
        return 'Check!';
      case 'checkmate':
        return 'Checkmate!';
      case 'stalemate':
        return 'Stalemate!';
      case 'draw':
        return 'Draw!';
      default:
        return isViewingHistory ? 'Viewing History' : 'Your Turn';
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'check':
        return 'text-yellow-600';
      case 'checkmate':
        return 'text-red-600';
      case 'stalemate':
      case 'draw':
        return 'text-gray-600';
      default:
        return isViewingHistory ? 'text-blue-600' : 'text-green-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Game Status</h2>
        <p className={`text-lg font-semibold ${getStatusColor()}`}>
          {getStatusDisplay()}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">AI Difficulty</h3>
        <div className="grid grid-cols-1 gap-2">
          {AI_LEVELS.map((level) => (
            <button
              key={level.level}
              onClick={() => onAiLevelChange(level.level)}
              className={`p-3 rounded-lg text-left transition-colors ${
                aiLevel === level.level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium">{level.name}</div>
              <div className="text-sm opacity-80">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Move Navigation</h3>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <button
            onClick={() => onNavigate(moveIndex - 1)}
            disabled={moveIndex <= -1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[100px] text-center">
            Move {moveIndex + 1} of {totalMoves}
          </span>
          
          <button
            onClick={() => onNavigate(moveIndex + 1)}
            disabled={moveIndex >= totalMoves - 1}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Use ← → arrow keys to navigate
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors"
      >
        <RotateCcw size={20} />
        <span>New Game</span>
      </button>
    </div>
  );
};