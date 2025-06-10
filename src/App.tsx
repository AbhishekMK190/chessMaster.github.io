import React from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { useChessGame } from './hooks/useChessGame';

function App() {
  const {
    gameState,
    handleSquareClick,
    resetGame,
    aiLevel,
    setAiLevel,
    navigateToMove,
    isViewingHistory
  } = useChessGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
            Chess Master
          </h1>
          <p className="text-xl text-gray-600">
            Challenge the AI and master your skills
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="flex-shrink-0">
            <ChessBoard
              gameState={gameState}
              onSquareClick={handleSquareClick}
              flipped={false}
            />
          </div>

          <div className="w-full lg:w-auto">
            <GameControls
              aiLevel={aiLevel}
              onAiLevelChange={setAiLevel}
              onReset={resetGame}
              moveIndex={gameState.moveIndex}
              totalMoves={gameState.moves.length}
              onNavigate={navigateToMove}
              isViewingHistory={isViewingHistory}
              gameStatus={gameState.gameStatus}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Click on a piece to select it, then click on a highlighted square to move.
          </p>
          <p className="text-sm mt-1">
            Use the arrow keys ← → to navigate through move history.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;