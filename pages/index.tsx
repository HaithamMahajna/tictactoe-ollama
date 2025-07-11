import { useRouter } from 'next/router';
import Head from 'next/head';

const games = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    description: 'Play against Ollama AI in a classic game of Tic Tac Toe',
    icon: '❌AND⭕',
    status: 'Available',
    path: '/tictactoe'
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'Challenge Ollama in a game of strategic chess',
    icon: '♟️',
    status: 'Coming Soon',
    path: '/chess'
  },
  {
    id: 'future',
    name: 'More Games',
    description: 'Stay tuned for more exciting games coming soon!',
    icon: '🎲',
    status: 'Coming Soon',
    path: '/coming-soon'
  }
];

export default function GameHub() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Game Hub - Play with Ollama</title>
        <meta name="description" content="Play various games against Ollama AI" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              GameHub
            </span>
          </h1>
          <p className="text-xl text-gray-400 text-center mb-12">
            Choose a game to play against Ollama AI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => router.push(game.path)}
                className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 
                  backdrop-blur-sm border border-gray-700/50 cursor-pointer
                  transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                  ${game.status === 'Coming Soon' ? 'opacity-75' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{game.icon}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${game.status === 'Available' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {game.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  {game.name}
                </h2>
                <p className="text-gray-400">
                  {game.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
