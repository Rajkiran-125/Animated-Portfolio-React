import { CanvasTexture, SRGBColorSpace } from 'three';

export interface Snippet {
  title: string;
  lines: string[];
}

const KEYWORDS =
  /\b(import|from|export|default|const|let|await|async|return|new|class|SELECT|FROM|JOIN|ON|AS|GROUP|BY|WHERE|COUNT)\b/;
const PALETTE = {
  bg: '#141010',
  bar: '#1f1919',
  text: '#efe7da',
  keyword: '#ff4b53',
  string: '#f2c14e',
  comment: '#7d716a',
  punct: '#b9ada0',
  prompt: '#ff4b53',
  ok: '#9ad18b',
};

type Token = { text: string; color: string };

/** Tiny highlighter — enough to make code read as code at a glance. */
function tokenize(line: string): Token[] {
  if (/^\s*(\/\/|--)/.test(line)) return [{ text: line, color: PALETTE.comment }];
  if (line.startsWith('$')) return [{ text: line, color: PALETTE.prompt }];
  if (line.startsWith('✓')) return [{ text: line, color: PALETTE.ok }];
  const out: Token[] = [];
  const re = /('[^']*'|"[^"]*"|`[^`]*`|\b\w+\b|\s+|[^\w\s])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const t = m[0];
    let color = PALETTE.text;
    if (/^['"`]/.test(t)) color = PALETTE.string;
    else if (KEYWORDS.test(t) && /^\w+$/.test(t)) color = PALETTE.keyword;
    else if (/^[^\w\s]$/.test(t)) color = PALETTE.punct;
    else if (/^@\w*/.test(t)) color = PALETTE.keyword;
    out.push({ text: t, color });
  }
  return out;
}

interface Options {
  width: number;
  height: number;
  fontSize: number;
  chrome?: boolean;
}

/**
 * A canvas-backed texture for code windows. `draw(progress)` reveals the
 * snippet character by character, so the monitor can "type" without React.
 */
export function createCodeTexture(initial: Snippet, { width, height, fontSize, chrome = true }: Options) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  let snippet = initial;
  let total = snippet.lines.reduce((n, l) => n + l.length + 1, 0);
  const lineH = fontSize * 1.55;
  const barH = chrome ? fontSize * 2.4 : 0;
  const pad = fontSize * 1.4;
  const font = `500 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;

  const draw = (progress = 1, caret = true) => {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, width, height);

    if (chrome) {
      ctx.fillStyle = PALETTE.bar;
      ctx.fillRect(0, 0, width, barH);
      ['#e21b23', '#efe7da', '#6b605a'].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(pad + i * fontSize * 1.3, barH / 2, fontSize * 0.36, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = `500 ${fontSize * 0.85}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.fillStyle = PALETTE.punct;
      ctx.textBaseline = 'middle';
      ctx.fillText(snippet.title, pad + fontSize * 4.4, barH / 2);
    }

    ctx.font = font;
    ctx.textBaseline = 'top';
    let budget = Math.floor(total * progress);
    let cursorX = pad;
    let cursorY = barH + pad * 0.8;
    snippet.lines.forEach((line, row) => {
      if (budget <= 0) return;
      const y = barH + pad * 0.8 + row * lineH;
      // gutter line numbers
      ctx.fillStyle = PALETTE.comment;
      ctx.fillText(String(row + 1).padStart(2, ' '), pad * 0.5, y);
      let x = pad * 0.5 + fontSize * 2.2;
      for (const tok of tokenize(line)) {
        if (budget <= 0) break;
        const text = tok.text.slice(0, budget);
        budget -= text.length;
        ctx.fillStyle = tok.color;
        ctx.fillText(text, x, y);
        x += ctx.measureText(text).width;
      }
      budget -= 1;
      cursorX = x;
      cursorY = y;
    });
    // block caret
    if (caret) {
      ctx.fillStyle = PALETTE.keyword;
      ctx.fillRect(cursorX + 2, cursorY, fontSize * 0.55, fontSize * 1.1);
    }
    texture.needsUpdate = true;
  };

  const setSnippet = (next: Snippet) => {
    snippet = next;
    total = snippet.lines.reduce((n, l) => n + l.length + 1, 0);
  };

  draw(0);
  return { texture, draw, setSnippet, dispose: () => texture.dispose() };
}

export const MONITOR_SNIPPET: Snippet = {
  title: 'campaign.routes.ts',
  lines: [
    "import { Router } from 'express';",
    "import { verifyJwt } from './middleware/auth';",
    "import { rateLimit } from './middleware/limit';",
    '',
    'const router = Router();',
    '',
    "router.post('/campaigns', verifyJwt, rateLimit(100),",
    '  async (req, res) => {',
    "    const row = await db.exec('usp_SaveCampaign', req.body);",
    "    await queue.publish('campaign.dispatch', row.id);",
    '    return res.status(201).json({ id: row.id });',
    '  });',
    '',
    'export default router;',
  ],
};

export const TERMINAL_SNIPPET: Snippet = {
  title: 'zsh — server',
  lines: ['$ npm run dev', '> node dist/server.js', '✓ http listening on :3000', '✓ mssql pool connected', '✓ rabbitmq consumer ready', '✓ redis cache warm'],
};

export const WINDOW_SNIPPETS: Snippet[] = [
  {
    title: 'dashboard.component.ts',
    lines: ["@Component({ selector: 'app-dash' })", 'export class DashboardComponent {', '  stats$ = this.api.stats().pipe(', '    shareReplay(1)', '  );', '}'],
  },
  {
    title: 'audience.sql',
    lines: ['SELECT c.Name, COUNT(a.Id) AS Total', 'FROM Campaigns c', 'JOIN Audience a', '  ON a.CampaignId = c.Id', 'GROUP BY c.Name;'],
  },
  {
    title: 'socket.ts',
    lines: ["io.on('connection', (socket) => {", "  socket.on('message', (msg) => {", "    io.to(msg.room)", "      .emit('message', msg);", '  });', '});'],
  },
];
