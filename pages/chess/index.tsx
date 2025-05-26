import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ChessPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Chess vs Ollama - Coming Soon</title>
        <meta name="description" content="Play Chess against Ollama AI - Coming Soon" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Chess vs Ollama
            </span>
          </h1>
          <p className="text-2xl text-gray-400 mb-12">
            This game is coming soon! Stay tuned for updates.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl 
              hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200
              shadow-lg font-semibold text-lg"
          >
            Return to Game Hub
          </button>
        </div>
      </div>
    </>
  );
} 