const GITHUB_URL = 'https://github.com/swapnilraj/nudge';

function BrandMark() {
  return (
    <span className="brandMark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6 15c3-6 8-8 12-9"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M18 6v5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M18 6h-5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="10" cy="16.5" r="1.6" fill="white" />
      </svg>
    </span>
  );
}

export default function HomePage() {
  const playUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

  return (
    <main className="container">
      <div className="nav">
        <div className="brand">
          <BrandMark />
          <span>Gentle Nudge</span>
        </div>
        <div className="pillLinks">
          <a className="pill" href="/privacy">
            Privacy
          </a>
          <a className="pill" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <section className="hero">
        <div className="kicker">Habit change, but gentle</div>
        <h1 className="h1">Replace a habit with a better one.</h1>
        <p className="subhead">
          Gentle Nudge lets you create an app icon you’re already used to tapping—except now,
          tapping it opens the apps you actually want to use. You choose the probabilities, and you
          can increase them over time as the habit shifts.
        </p>

        <div className="ctaRow">
          {playUrl ? (
            <a className="button buttonPrimary" href={playUrl} target="_blank" rel="noreferrer">
              Download on Google Play
            </a>
          ) : (
            <span className="button buttonPrimary buttonDisabled" title="Play link coming soon">
              Download on Google Play (coming soon)
            </span>
          )}
          <a className="button" href={GITHUB_URL} target="_blank" rel="noreferrer">
            View on GitHub
          </a>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Make it familiar</h3>
            <p>Create a launcher shortcut you’ll actually tap—same muscle memory, new outcome.</p>
          </div>
          <div className="card">
            <h3>Control the probabilities</h3>
            <p>Pick the apps you want and tune the weights to shape what you open next.</p>
          </div>
          <div className="card">
            <h3>Increase over time</h3>
            <p>Gradually raise the probability of “good” apps as the habit changes.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Gentle Nudge</span>
        <span>
          <a href="/privacy">Privacy Policy</a>
        </span>
      </footer>
    </main>
  );
}


