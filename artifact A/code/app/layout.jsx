import './globals.css';

export const metadata = {
  title: 'Spotify Review Discovery Engine',
  description: 'AI-powered analysis of Spotify user feedback on music discovery.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <span className="brand">🎧 Review Discovery Engine</span>
          <a href="/">Insights</a>
          <a href="/ask">Ask</a>
          <a href="/collect">Collect</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
