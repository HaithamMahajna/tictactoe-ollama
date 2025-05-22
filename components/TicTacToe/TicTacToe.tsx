import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

type Player = 'X' | 'O' | null;

interface GameState {
  board: Player[];
  currentPlayer: Player;
  winner: Player;
  isGameOver: boolean;
  lastMove?: number;
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

  const checkWinner = (board: Player[]): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
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

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameState(prev => ({
        ...prev,
        winner,
        isGameOver: true
      }));
      setMessages(prev => [...prev, {
        type: 'system',
        content: `Game Over! ${winner} wins!`
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
Please analyze the board and make your move. Respond with ONLY a number from 0-8 representing your move.
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

          const newWinner = checkWinner(updatedBoard);
          if (newWinner) {
            setGameState(prev => ({
              ...prev,
              winner: newWinner,
              isGameOver: true
            }));
            setMessages(prev => [...prev, {
              type: 'system',
              content: `Game Over! ${newWinner} wins!`
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
    });
    setMessages([]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">
        {gameState.isGameOver
          ? gameState.winner
            ? `Winner: ${gameState.winner}`
            : "It's a draw!"
          : `Current Player: ${gameState.currentPlayer}`}
      </h2>
      
      <div className="grid grid-cols-3 gap-2 bg-gray-200 p-2 rounded-lg mb-4">
        {gameState.board.map((cell, index) => (
          <button
            key={index}
            className={`w-20 h-20 bg-white rounded-lg text-4xl font-bold 
              ${cell ? 'cursor-not-allowed' : 'hover:bg-gray-100'}
              ${isLoading ? 'opacity-50' : ''}
              ${gameState.lastMove === index ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || gameState.isGameOver || isLoading}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md bg-gray-100 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Game Log:</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded ${
                msg.type === 'player'
                  ? 'bg-blue-100'
                  : msg.type === 'ollama'
                  ? 'bg-green-100'
                  : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>

      {gameState.isGameOver && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={resetGame}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToe; 