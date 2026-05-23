/**
 * OfficeCanvas — pixel-art 2D office rendered on an HTML5 Canvas.
 *
 * Rendering model:
 *  • The canvas buffer is sized to fill its parent container (ResizeObserver).
 *  • The 960×672 "artboard" (12 col × 8 row office map) is always centered
 *    inside that buffer via ctx.translate(offsetX, offsetY).
 *  • All draw helpers work in artboard-local coordinates; the translate handles
 *    placement automatically — no per-function offset threading needed.
 *  • Background outside the artboard is filled with the app dark theme color.
 *  • Click / mousemove handlers subtract the live offset (stored in a ref) so
 *    hit-testing still works in artboard coordinates.
 */
import { useRef, useEffect, useCallback } from 'react';
import type {
  AgentConfig,
  AgentStatus,
  DeskConfig,
  OfficeLayout,
  SpriteType,
} from '../context/SettingsContext';

// ─── Artboard constants ───────────────────────────────────────────────────────

const TILE = 72; // canvas px per grid cell
const PAD = 48; // outer padding inside the artboard
const SC = 2; // pixel-art scale (1 art-pixel = 2 canvas-px)
const COLS = 12;
const ROWS = 8;

/** Fixed artboard dimensions — the "natural" size of the office map */
const MAP_W = COLS * TILE + PAD * 2; // 960
const MAP_H = ROWS * TILE + PAD * 2; // 672

/** Exported for any external layout calculations */
export const CANVAS_W = MAP_W;
export const CANVAS_H = MAP_H;

/** Background color used outside the artboard */
const BG_COLOR = '#13131f';

// ─── Color palettes ───────────────────────────────────────────────────────────

const FLOOR_A = '#16162a';
const FLOOR_B = '#1a1a30';
const FLOOR_G = '#0e0e1f'; // grid lines

const SPRITE_COLORS: Record<
  SpriteType,
  {
    hair: string;
    skin: string;
    shirt: string;
    pants: string;
  }
> = {
  dev: { hair: '#3b82f6', skin: '#fdbcb4', shirt: '#1e40af', pants: '#1e293b' },
  tester: { hair: '#8b5cf6', skin: '#fdbcb4', shirt: '#065f46', pants: '#022c22' },
  analyst: { hair: '#f59e0b', skin: '#d4a373', shirt: '#c2410c', pants: '#292524' },
  devops: { hair: '#374151', skin: '#92663a', shirt: '#111827', pants: '#030712' },
  manager: { hair: '#78350f', skin: '#fdbcb4', shirt: '#475569', pants: '#1e293b' },
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: '#10b981',
  working: '#3b82f6',
  waiting: '#f59e0b',
  error: '#ef4444',
};

// ─── Low-level draw helpers (all coords in artboard space) ───────────────────

function drawFloor(ctx: CanvasRenderingContext2D) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE + PAD;
      const y = row * TILE + PAD;
      ctx.fillStyle = (row + col) % 2 === 0 ? FLOOR_A : FLOOR_B;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = FLOOR_G;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    }
  }
}

function drawWallStrip(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(0, 0, MAP_W, PAD);
  ctx.fillRect(0, 0, PAD, MAP_H);
  ctx.fillRect(MAP_W - PAD, 0, PAD, MAP_H);
  ctx.fillRect(0, MAP_H - PAD, MAP_W, PAD);

  // baseboard
  ctx.fillStyle = '#1c1c38';
  ctx.fillRect(0, PAD - 4, MAP_W, 4);
  ctx.fillRect(0, MAP_H - PAD, MAP_W, 4);

  // corner plants
  drawPlant(ctx, PAD + 6, PAD + 6);
  drawPlant(ctx, MAP_W - PAD - 22, PAD + 6);
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#7c3f28';
  ctx.fillRect(x + 4, y + 12, 14, 10);
  ctx.fillStyle = '#6b3421';
  ctx.fillRect(x + 6, y + 18, 10, 4);
  ctx.fillStyle = '#166534';
  ctx.fillRect(x + 10, y + 4, 2, 10);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(x + 2, y, 10, 8);
  ctx.fillRect(x + 10, y + 2, 10, 6);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(x + 4, y + 1, 4, 3);
  ctx.fillRect(x + 12, y + 3, 4, 3);
}

function drawDesk(ctx: CanvasRenderingContext2D, left: number, top: number) {
  const W = 2 * TILE;
  const H = TILE;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(left + 5, top + 5, W, H);

  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(left, top, W, H);
  ctx.fillStyle = '#5c3d2e';
  ctx.fillRect(left + 3, top + 3, W - 6, H - 3);
  ctx.fillStyle = '#8b6347';
  ctx.fillRect(left + 3, top + 3, W - 6, 2);
  ctx.fillStyle = '#2e1c10';
  ctx.fillRect(left + W - 3, top + 3, 3, H - 3);
  ctx.fillRect(left + 3, top + 3, 3, H - 3);

  // ── monitor ──────────────────────────────────────────────────────────────
  const mCX = left + W / 2;
  const mW = 60,
    mH = 38;
  const mT = top - 44;

  ctx.fillStyle = '#111122';
  ctx.fillRect(mCX - 4, top - 8, 8, 14);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(mCX - 12, top - 4, 24, 6);

  ctx.fillStyle = '#1e1e2e';
  ctx.fillRect(mCX - mW / 2 - 3, mT - 3, mW + 6, mH + 6);

  const grad = ctx.createLinearGradient(0, mT, 0, mT + mH);
  grad.addColorStop(0, '#00d4ff');
  grad.addColorStop(0.45, '#0ea5e9');
  grad.addColorStop(1, '#0369a1');
  ctx.fillStyle = grad;
  ctx.fillRect(mCX - mW / 2, mT, mW, mH);

  ctx.save();
  ctx.shadowColor = '#0ea5e9';
  ctx.shadowBlur = 10;
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(mCX - mW / 2 - 3, mT - 3, mW + 6, mH + 6);
  ctx.restore();

  const lines: [number, string][] = [
    [16, 'rgba(255,255,255,0.85)'],
    [26, 'rgba(255,255,255,0.55)'],
    [12, 'rgba(255,255,255,0.75)'],
    [22, 'rgba(255,255,255,0.40)'],
    [18, 'rgba(255,255,255,0.65)'],
  ];
  lines.forEach(([len, color], i) => {
    ctx.fillStyle = color;
    ctx.fillRect(mCX - mW / 2 + 5, mT + 5 + i * 6, len, 2);
  });

  // ── keyboard ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#111827';
  ctx.fillRect(left + W / 2 - 22, top + H / 2 - 6, 44, 14);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(left + W / 2 - 20, top + H / 2 - 4, 40, 10);
  ctx.fillStyle = '#374151';
  for (let c = 0; c < 9; c++) {
    for (let r = 0; r < 2; r++) {
      ctx.fillRect(left + W / 2 - 18 + c * 4, top + H / 2 - 3 + r * 4, 3, 3);
    }
  }
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  colors: { hair: string; skin: string; shirt: string; pants: string },
) {
  const s = SC;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18 * s, 7 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.pants;
  ctx.fillRect(cx - 4 * s, cy + 8 * s, 4 * s, 8 * s);
  ctx.fillRect(cx + 1 * s, cy + 8 * s, 4 * s, 8 * s);
  ctx.fillRect(cx - 5 * s, cy + 14 * s, 5 * s, 2 * s);
  ctx.fillRect(cx + 1 * s, cy + 14 * s, 5 * s, 2 * s);

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(cx - 5 * s, cy + 6 * s, 10 * s, 2 * s);

  ctx.fillStyle = colors.shirt;
  ctx.fillRect(cx - 5 * s, cy - 5 * s, 10 * s, 13 * s);

  ctx.fillStyle = colors.skin;
  ctx.fillRect(cx - 8 * s, cy - 4 * s, 3 * s, 10 * s);
  ctx.fillRect(cx + 5 * s, cy - 4 * s, 3 * s, 10 * s);
  ctx.fillRect(cx - 2 * s, cy - 8 * s, 4 * s, 4 * s);
  ctx.fillRect(cx - 5 * s, cy - 16 * s, 10 * s, 10 * s);

  ctx.fillStyle = colors.hair;
  ctx.fillRect(cx - 5 * s, cy - 16 * s, 10 * s, 4 * s);
  ctx.fillRect(cx - 6 * s, cy - 16 * s, 2 * s, 8 * s);
  ctx.fillRect(cx + 4 * s, cy - 16 * s, 2 * s, 8 * s);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(cx - 3 * s, cy - 11 * s, 2 * s, 2 * s);
  ctx.fillRect(cx + 1 * s, cy - 11 * s, 2 * s, 2 * s);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(cx - 2 * s, cy - 11 * s, s, s);
  ctx.fillRect(cx + 2 * s, cy - 11 * s, s, s);

  ctx.fillStyle = '#c87070';
  ctx.fillRect(cx - 2 * s, cy - 7 * s, 4 * s, s);
}

function drawStatusHalo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headCY: number,
  status: AgentStatus,
  t: number,
) {
  const color = STATUS_COLOR[status];
  const pulse =
    status === 'working'
      ? Math.sin(t * 5) * 3
      : status === 'waiting'
        ? Math.sin(t * 2) * 2
        : status === 'error'
          ? Math.sin(t * 8) * 2
          : 0;
  const r = 18 + pulse;
  const alpha = status === 'working' ? 0.55 + Math.sin(t * 5) * 0.25 : 0.75;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = status === 'working' ? 2.5 : 2;
  ctx.globalAlpha = alpha;
  ctx.shadowColor = color;
  ctx.shadowBlur = status === 'working' ? 8 : 4;
  ctx.beginPath();
  ctx.arc(cx, headCY, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(cx + r * 0.7, headCY - r * 0.7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = 'rgba(255,255,255,0.75)',
  fontSize = 8,
) {
  ctx.font = `${fontSize}px "Silkscreen", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function drawDeskStation(
  ctx: CanvasRenderingContext2D,
  desk: DeskConfig,
  agent: AgentConfig | null,
  status: AgentStatus | null,
  t: number,
) {
  const left = desk.x * TILE + PAD;
  const top = desk.y * TILE + PAD;
  const W = 2 * TILE;
  const H = TILE;
  const mCX = left + W / 2;

  drawDesk(ctx, left, top);

  ctx.font = '6px "Silkscreen", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.fillText(desk.label.toUpperCase(), mCX, top + H - 5);

  if (!agent) {
    ctx.font = '7px "Silkscreen", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('VACANT', mCX, top + H / 2 + 3);
    return;
  }

  const charCY = top + H - 4;
  const headCY = charCY - 12 * SC;
  drawCharacter(ctx, mCX, charCY, SPRITE_COLORS[agent.characterSprite]);

  const resolvedStatus: AgentStatus = status ?? 'idle';
  drawStatusHalo(ctx, mCX, headCY, resolvedStatus, t);

  drawLabel(ctx, agent.name, mCX, charCY + 20 * SC + 14, 'rgba(255,255,255,0.88)', 8);
  drawLabel(
    ctx,
    agent.role.toUpperCase(),
    mCX,
    charCY + 20 * SC + 25,
    STATUS_COLOR[resolvedStatus],
    6,
  );

  if (resolvedStatus === 'working' && Math.floor(t * 2) % 2 === 0) {
    ctx.font = '7px "Silkscreen", monospace';
    ctx.fillStyle = STATUS_COLOR.working;
    ctx.textAlign = 'center';
    ctx.fillText('● WORKING', mCX, top - 50);
  }
}

function drawRoomDivider(ctx: CanvasRenderingContext2D) {
  const y = 3 * TILE + PAD + TILE / 2;
  ctx.strokeStyle = '#2a2a44';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(MAP_W - PAD, y);
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, 'QA OFFICE — OPEN-QA', MAP_W / 2, y - 8, 'rgba(255,255,255,0.18)', 7);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  agents: AgentConfig[];
  agentStatuses: Record<string, AgentStatus>;
  layout: OfficeLayout;
  onDeskClick?: (deskId: string) => void;
}

export default function OfficeCanvas({ agents, agentStatuses, layout, onDeskClick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  /** Live artboard-to-canvas offset — read by event handlers without stale closure */
  const offsetRef = useRef({ x: 0, y: 0 });

  // ── ResizeObserver: keep canvas buffer = container dimensions ──────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const applySize = (w: number, h: number) => {
      canvas.width = Math.max(1, Math.floor(w));
      canvas.height = Math.max(1, Math.floor(h));
    };

    // Set initial size immediately so the first frame renders correctly
    applySize(wrap.clientWidth || MAP_W, wrap.clientHeight || MAP_H);

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      applySize(width, height);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // ── Render loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const origin = performance.now();

    function draw(now: number) {
      const t = (now - origin) / 1000;
      const cw = canvas!.width;
      const ch = canvas!.height;

      // ── 1. Crisp pixel art — disable smoothing every frame ───────────────
      ctx!.imageSmoothingEnabled = false;

      // ── 2. Clear and fill background outside the artboard ────────────────
      ctx!.clearRect(0, 0, cw, ch);
      ctx!.fillStyle = BG_COLOR;
      ctx!.fillRect(0, 0, cw, ch);

      // ── 3. Center artboard in container ──────────────────────────────────
      const ox = Math.round((cw - MAP_W) / 2);
      const oy = Math.round((ch - MAP_H) / 2);
      offsetRef.current = { x: ox, y: oy };

      ctx!.save();
      ctx!.translate(ox, oy);

      // ── 4. Draw all office layers in artboard space ───────────────────────
      drawFloor(ctx!);
      drawWallStrip(ctx!);
      drawRoomDivider(ctx!);
      for (const desk of layout.desks) {
        const agent = agents.find((a) => a.deskId === desk.id) ?? null;
        const status = agent ? (agentStatuses[agent.id] ?? 'idle') : null;
        drawDeskStation(ctx!, desk, agent, status, t);
      }

      ctx!.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [agents, agentStatuses, layout]);

  // ── Click hit-test ─────────────────────────────────────────────────────────
  // Since canvas buffer == container size at all times (ResizeObserver),
  // devicePixel ratio is handled by CSS and the canvas is 1:1 with its DOM rect.
  // We only need to subtract the artboard offset to work in artboard coordinates.
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      // Map from CSS pixels → canvas buffer pixels (handles devicePixelRatio if any)
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX - offsetRef.current.x;
      const my = (e.clientY - rect.top) * scaleY - offsetRef.current.y;

      for (const desk of layout.desks) {
        const dl = desk.x * TILE + PAD;
        const dt = desk.y * TILE + PAD;
        const dw = 2 * TILE;
        const dh = TILE + 20 * SC + 30; // extends below desk to cover labels
        if (mx >= dl && mx <= dl + dw && my >= dt && my <= dt + dh) {
          onDeskClick?.(desk.id);
          return;
        }
      }
    },
    [layout, onDeskClick],
  );

  // ── Cursor ─────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX - offsetRef.current.x;
      const my = (e.clientY - rect.top) * scaleY - offsetRef.current.y;

      const hit = layout.desks.some((d) => {
        const dl = d.x * TILE + PAD;
        const dt = d.y * TILE + PAD;
        return mx >= dl && mx <= dl + 2 * TILE && my >= dt && my <= dt + TILE + 60;
      });

      if (canvasRef.current) {
        canvasRef.current.style.cursor = hit ? 'pointer' : 'default';
      }
    },
    [layout],
  );

  // ── DOM ────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'block' }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
