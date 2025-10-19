'use client';

import { Header } from './_components/Header';
import { Sidebar } from './_components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}