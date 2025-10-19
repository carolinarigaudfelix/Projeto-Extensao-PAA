import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona a raiz diretamente para o dashboard do PAA
  redirect('/dashboard');
}
