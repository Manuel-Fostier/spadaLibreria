import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ars Dimicatoria - Traités d\'Escrime Bolonaise',
  description: 'Plateforme d\'étude des traités d\'escrime bolonaise avec glossaire interactif',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
