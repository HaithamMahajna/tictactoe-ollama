import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

type Player = 'X' | 'O' | null;

interface GameState {
  board: Player[];
  currentPlayer: Player;
  winner: Player;
  isGameOver: boolean;
  lastMove?: number;
  winningLine?: number[];
}

interface GameMessage {
  type: 'player' | 'ollama' | 'system';
  content: string;
}

const TicTacToe = () => {
  const { t } = useTranslation('common');
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    winningLine: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<GameMessage[]>([]);

  const formatBoard = (board: Player[]): string => {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const row = board.slice(i * 3, (i + 1) * 3)
        .map(cell => cell || ' ')
        .join(' | ');
      rows.push(row);
    }
    return rows.join('\n---------\n');
  };

  const checkWinner = (board: Player[]): { winner: Player; line: number[] } | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    return null;
  };

  const handleCellClick = async (index: number) => {
    if (gameState.board[index] || gameState.isGameOver || isLoading) return;

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;
    
    const nextPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      lastMove: index
    }));

    // Add player's move to messages
    setMessages(prev => [...prev, {
      type: 'player',
      content: `Player X moved to position ${index}`
    }]);

    const winnerResult = checkWinner(newBoard);
    if (winnerResult) {
      setGameState(prev => ({
        ...prev,
        winner: winnerResult.winner,
        isGameOver: true,
        winningLine: winnerResult.line
      }));
      setMessages(prev => [...prev, {
        type: 'system',
        content: `Game Over! ${winnerResult.winner} wins!`
      }]);
      return;
    }

    if (!newBoard.includes(null)) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true
      }));
      setMessages(prev => [...prev, {
        type: 'system',
        content: "Game Over! It's a draw!"
      }]);
      return;
    }

    // If it's Ollama's turn (O)
    if (nextPlayer === 'O') {
      setIsLoading(true);
      try {
        const prompt = `You are playing Tic Tac Toe as player O. The current board state is:

${formatBoard(newBoard)}

The player (X) just moved to position ${index}.
Available positions are: ${newBoard.map((cell, i) => cell === null ? i : null).filter(pos => pos !== null).join(', ')}.

Please analyze the board and make your move. Respond with ONLY a number from the available positions listed above.
Remember:
- 0-2 is the top row
- 3-5 is the middle row
- 6-8 is the bottom row
- Only respond with the number, nothing else`;

        // Add the prompt to messages
        setMessages(prev => [...prev, {
          type: 'system',
          content: 'Waiting for Ollama to make a move...'
        }]);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({

            messages: [
                {
                role: 'user',
                content:prompt,}
            ]
          }),
        });

        const data = await response.json();
        console.log("Ollama response:", data);
        const message = (data?.message ?? '').trim();
        console.log("Ollama message content:", message);
        const ollamaMove = parseInt(message);

        if (isNaN(ollamaMove) || ollamaMove < 0 || ollamaMove > 8) {
            throw new Error(`Invalid move from Ollama: "${message}"`);
          }
          
        if (!isNaN(ollamaMove) && ollamaMove >= 0 && ollamaMove <= 8 && !newBoard[ollamaMove]) {
          const updatedBoard = [...newBoard];
          updatedBoard[ollamaMove] = 'O';
          
          setGameState(prev => ({
            ...prev,
            board: updatedBoard,
            currentPlayer: 'X',
            lastMove: ollamaMove
          }));

          // Add Ollama's move to messages with more detail
          setMessages(prev => [...prev, {
            type: 'ollama',
            content: `Ollama (O) moved to position ${ollamaMove}`
          }]);

          const newWinnerResult = checkWinner(updatedBoard);
          if (newWinnerResult) {
            setGameState(prev => ({
              ...prev,
              winner: newWinnerResult.winner,
              isGameOver: true,
              winningLine: newWinnerResult.line
            }));
            setMessages(prev => [...prev, {
              type: 'system',
              content: `Game Over! ${newWinnerResult.winner} wins!`
            }]);
          } else if (!updatedBoard.includes(null)) {
            setGameState(prev => ({
              ...prev,
              isGameOver: true
            }));
            setMessages(prev => [...prev, {
              type: 'system',
              content: "Game Over! It's a draw!"
            }]);
          }
        } else {
          setMessages(prev => [...prev, {
            type: 'system',
            content: `Ollama made an invalid move (${ollamaMove}). Please try again.`
          }]);
        }

      } catch (error) {
        console.error('Error getting Ollama move:', error);
        setMessages(prev => [...prev, {
          type: 'system',
          content: `Error communicating with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      winningLine: undefined,
    });
    setMessages([]);
  };

  const getWinningLineStyle = (line: number[]) => {
    if (line[0] === 0 && line[1] === 1 && line[2] === 2) return 'top-[16.66%] h-[6px] w-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 3 && line[1] === 4 && line[2] === 5) return 'top-[50%] h-[6px] w-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 6 && line[1] === 7 && line[2] === 8) return 'bottom-[16.66%] h-[6px] w-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 0 && line[1] === 3 && line[2] === 6) return 'left-[16.66%] w-[6px] h-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 1 && line[1] === 4 && line[2] === 7) return 'left-[50%] w-[6px] h-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 2 && line[1] === 5 && line[2] === 8) return 'right-[16.66%] w-[6px] h-full bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 0 && line[1] === 4 && line[2] === 8) return 'w-[141%] h-[6px] top-[50%] left-[-20%] transform rotate-45 bg-red-500 animate-pulse z-10 shadow-lg';
    if (line[0] === 2 && line[1] === 4 && line[2] === 6) return 'w-[141%] h-[6px] top-[50%] left-[-20%] transform -rotate-45 bg-red-500 animate-pulse z-10 shadow-lg';
    return '';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-7xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Tic Tac Toe
          </span>
          <span className="text-white mx-4">vs</span>
          <span className="bg-gradient-to-r from-green-400 to-teal-500 text-transparent bg-clip-text">
            Ollama
          </span>
        </h1>

        <h2 className="text-3xl font-bold mb-8 text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            {gameState.isGameOver
              ? gameState.winner
                ? `🎉 Winner: ${gameState.winner} 🎉`
                : "🤝 It's a draw! 🤝"
              : `Current Player: ${gameState.currentPlayer}`}
          </span>
        </h2>
        
        <div className="flex gap-12 items-start">
          <div className="relative grid grid-cols-3 gap-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700/50">
            {gameState.winningLine && (
              <div className={`absolute ${getWinningLineStyle(gameState.winningLine)}`} style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }} />
            )}
            {gameState.board.map((cell, index) => (
              <button
                key={index}
                className={`w-28 h-28 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl text-6xl font-bold transition-all duration-200
                  ${cell ? 'cursor-not-allowed' : 'hover:from-gray-700/80 hover:to-gray-800/80 hover:scale-105'}
                  ${isLoading ? 'opacity-50' : ''}
                  ${gameState.lastMove === index ? 'ring-4 ring-blue-500' : ''}
                  ${cell === 'X' ? 'text-blue-400' : cell === 'O' ? 'text-red-400' : ''}
                  shadow-lg backdrop-blur-sm border border-gray-700/30 relative z-0`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || gameState.isGameOver || isLoading}
              >
                {cell}
              </button>
            ))}
          </div>

          <div className="w-96 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Game Log:
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg shadow-sm backdrop-blur-sm border border-gray-700/30 ${
                    msg.type === 'player'
                      ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 text-blue-200'
                      : msg.type === 'ollama'
                      ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 text-green-200'
                      : 'bg-gradient-to-r from-gray-800/30 to-gray-900/30 text-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        </div>

        {gameState.isGameOver && (
          <div className="flex justify-center mt-8">
            <button
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl 
                hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200
                shadow-lg font-semibold text-lg"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToe; 
