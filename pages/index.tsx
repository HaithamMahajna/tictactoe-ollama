import TicTacToe from '../components/TicTacToe/TicTacToe';

export default function GameHub() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Tic Tac Toe vs Ollama</h1>
      <TicTacToe />
    </main>
  );
}
