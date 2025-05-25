import Head from 'next/head';
import TicTacToe from '../../components/TicTacToe/TicTacToe';

export default function TicTacToePage() {
  return (
    <>
      <Head>
        <title>Tic Tac Toe vs Ollama</title>
        <meta name="description" content="Play Tic Tac Toe against Ollama AI" />
      </Head>
      <TicTacToe />
    </>
  );
} 