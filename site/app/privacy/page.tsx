import fs from 'node:fs';
import path from 'node:path';

function readPrivacyMarkdown(): string {
  // repoRoot/site/app/privacy/page.tsx -> repoRoot
  const repoRoot = path.resolve(process.cwd(), '..');
  const privacyPath = path.join(repoRoot, 'PRIVACY_POLICY.md');
  return fs.readFileSync(privacyPath, 'utf8');
}

function renderMarkdown(md: string) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Array<{ type: 'p' | 'h2' | 'h3' | 'ul'; content: string[] }> = [];

  const flushParagraph = (buf: string[]) => {
    if (buf.length) blocks.push({ type: 'p', content: buf.splice(0) });
  };

  const flushList = (buf: string[]) => {
    if (buf.length) blocks.push({ type: 'ul', content: buf.splice(0) });
  };

  let pBuf: string[] = [];
  let ulBuf: string[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList(ulBuf);
      flushParagraph(pBuf);
      continue;
    }

    if (line.startsWith('## ')) {
      flushList(ulBuf);
      flushParagraph(pBuf);
      blocks.push({ type: 'h2', content: [line.slice(3).trim()] });
      continue;
    }
    if (line.startsWith('### ')) {
      flushList(ulBuf);
      flushParagraph(pBuf);
      blocks.push({ type: 'h3', content: [line.slice(4).trim()] });
      continue;
    }
    if (line.startsWith('- ')) {
      flushParagraph(pBuf);
      ulBuf.push(line.slice(2).trim());
      continue;
    }

    flushList(ulBuf);
    pBuf.push(line.trim());
  }

  flushList(ulBuf);
  flushParagraph(pBuf);

  return blocks.map((b, idx) => {
    if (b.type === 'h2') return <h2 key={idx}>{b.content[0]}</h2>;
    if (b.type === 'h3') return <h3 key={idx}>{b.content[0]}</h3>;
    if (b.type === 'ul')
      return (
        <ul key={idx}>
          {b.content.map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      );
    return <p key={idx}>{b.content.join(' ')}</p>;
  });
}

export default function PrivacyPage() {
  const md = readPrivacyMarkdown();

  return (
    <main className="container">
      <div className="nav">
        <div className="brand">
          <span className="brandMark" aria-hidden="true" />
          <span>Gentle Nudge</span>
        </div>
        <div className="pillLinks">
          <a className="pill" href="/">
            Home
          </a>
        </div>
      </div>

      <section className="md">
        <h1 className="h1" style={{ fontSize: 34, marginTop: 0 }}>
          Privacy Policy
        </h1>
        {renderMarkdown(md)}
      </section>

      <footer className="footer">
        <span>
          <a href="/">← Back to home</a>
        </span>
        <span>Last updated: {new Date().toISOString().slice(0, 10)}</span>
      </footer>
    </main>
  );
}


