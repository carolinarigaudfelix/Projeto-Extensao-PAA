import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona a raiz para a tela de login
  redirect('/login');
}
