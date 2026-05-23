/**
 * OfficeCanvas — pixel-art 2D office rendered on an HTML5 Canvas.
 *
 * No VS Code bindings. Reads everything from props supplied by OfficePage
 * (which reads from SettingsContext). Click a desk to fire onDeskClick(deskId).
 *
 * Visual stack per desk station (back → front):
 *   floor tiles → desk body → monitor → keyboard → character → halo → labels
 */
import { useRef, useEffect, useCallback } from 'react'
import type { AgentConfig, AgentStatus, DeskConfig, OfficeLayout, SpriteType } from '../context/SettingsContext'

// ─── Canvas constants ─────────────────────────────────────────────────────────

const TILE   = 72   // canvas px per grid cell
const PAD    = 48   // canvas outer padding
const SC     = 2    // pixel-art scale factor (1 art-pixel = 2 canvas-px)
const COLS   = 12
const ROWS   = 8
export const CANVAS_W = COLS * TILE + PAD * 2  // 960
export const CANVAS_H = ROWS * TILE + PAD * 2  // 672

// ─── Color palettes ───────────────────────────────────────────────────────────

const FLOOR_A  = '#16162a'
const FLOOR_B  = '#1a1a30'
const FLOOR_G  = '#0e0e1f'   // grid lines

const SPRITE_COLORS: Record<SpriteType, {
  hair: string; skin: string; shirt: string; pants: string
}> = {
  dev:     { hair: '#3b82f6', skin: '#fdbcb4', shirt: '#1e40af', pants: '#1e293b' },
  tester:  { hair: '#8b5cf6', skin: '#fdbcb4', shirt: '#065f46', pants: '#022c22' },
  analyst: { hair: '#f59e0b', skin: '#d4a373', shirt: '#c2410c', pants: '#292524' },
  devops:  { hair: '#374151', skin: '#92663a', shirt: '#111827', pants: '#030712' },
  manager: { hair: '#78350f', skin: '#fdbcb4', shirt: '#475569', pants: '#1e293b' },
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle:    '#10b981',
  working: '#3b82f6',
  waiting: '#f59e0b',
  error:   '#ef4444',
}

// ─── Low-level draw helpers ───────────────────────────────────────────────────

function drawFloor(ctx: CanvasRenderingContext2D) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE + PAD
      const y = row * TILE + PAD
      ctx.fillStyle = (row + col) % 2 === 0 ? FLOOR_A : FLOOR_B
      ctx.fillRect(x, y, TILE, TILE)
      // subtle grid line
      ctx.strokeStyle = FLOOR_G
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1)
    }
  }
}

function drawWallStrip(ctx: CanvasRenderingContext2D) {
  // Top "wall" strip (1 row above PAD) — dark background
  ctx.fillStyle = '#0b0b1a'
  ctx.fillRect(0, 0, CANVAS_W, PAD)
  ctx.fillRect(0, 0, PAD, CANVAS_H)
  ctx.fillRect(CANVAS_W - PAD, 0, PAD, CANVAS_H)
  ctx.fillRect(0, CANVAS_H - PAD, CANVAS_W, PAD)

  // Wall baseboard
  ctx.fillStyle = '#1c1c38'
  ctx.fillRect(0, PAD - 4, CANVAS_W, 4)
  ctx.fillRect(0, CANVAS_H - PAD, CANVAS_W, 4)

  // Corner plants (pixel art)
  drawPlant(ctx, PAD + 6, PAD + 6)
  drawPlant(ctx, CANVAS_W - PAD - 22, PAD + 6)
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // pot
  ctx.fillStyle = '#7c3f28'
  ctx.fillRect(x + 4, y + 12, 14, 10)
  ctx.fillStyle = '#6b3421'
  ctx.fillRect(x + 6, y + 18, 10, 4)
  // stem + leaves
  ctx.fillStyle = '#166534'
  ctx.fillRect(x + 10, y + 4, 2, 10)
  ctx.fillStyle = '#16a34a'
  ctx.fillRect(x + 2, y, 10, 8)
  ctx.fillRect(x + 10, y + 2, 10, 6)
  ctx.fillStyle = '#4ade80'
  ctx.fillRect(x + 4, y + 1, 4, 3)
  ctx.fillRect(x + 12, y + 3, 4, 3)
}

function drawDesk(ctx: CanvasRenderingContext2D, left: number, top: number) {
  const W = 2 * TILE   // 144
  const H = TILE       // 72

  // drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(left + 5, top + 5, W, H)

  // desk body (dark wood)
  ctx.fillStyle = '#3d2b1f'
  ctx.fillRect(left, top, W, H)

  // desk surface (medium wood)
  ctx.fillStyle = '#5c3d2e'
  ctx.fillRect(left + 3, top + 3, W - 6, H - 3)

  // top edge highlight
  ctx.fillStyle = '#8b6347'
  ctx.fillRect(left + 3, top + 3, W - 6, 2)

  // right/left shadow edges
  ctx.fillStyle = '#2e1c10'
  ctx.fillRect(left + W - 3, top + 3, 3, H - 3)
  ctx.fillRect(left + 3, top + 3, 3, H - 3)

  // ── monitor ──────────────────────────────────────────────────────────────
  const mCX  = left + W / 2
  const mW   = 60, mH = 38
  const mT   = top - 44  // monitor screen top (above desk top)

  // stand
  ctx.fillStyle = '#111122'
  ctx.fillRect(mCX - 4, top - 8, 8, 14)
  // base plate
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(mCX - 12, top - 4, 24, 6)

  // bezel
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(mCX - mW / 2 - 3, mT - 3, mW + 6, mH + 6)

  // screen gradient
  const grad = ctx.createLinearGradient(0, mT, 0, mT + mH)
  grad.addColorStop(0, '#00d4ff')
  grad.addColorStop(0.45, '#0ea5e9')
  grad.addColorStop(1, '#0369a1')
  ctx.fillStyle = grad
  ctx.fillRect(mCX - mW / 2, mT, mW, mH)

  // screen glow bloom
  ctx.save()
  ctx.shadowColor   = '#0ea5e9'
  ctx.shadowBlur    = 10
  ctx.globalAlpha   = 0.2
  ctx.fillStyle     = '#0ea5e9'
  ctx.fillRect(mCX - mW / 2 - 3, mT - 3, mW + 6, mH + 6)
  ctx.restore()

  // code lines on screen
  const lines: [number, string][] = [
    [16, 'rgba(255,255,255,0.85)'],
    [26, 'rgba(255,255,255,0.55)'],
    [12, 'rgba(255,255,255,0.75)'],
    [22, 'rgba(255,255,255,0.40)'],
    [18, 'rgba(255,255,255,0.65)'],
  ]
  lines.forEach(([len, color], i) => {
    ctx.fillStyle = color
    ctx.fillRect(mCX - mW / 2 + 5, mT + 5 + i * 6, len, 2)
  })

  // ── keyboard ─────────────────────────────────────────────────────────────
  ctx.fillStyle = '#111827'
  ctx.fillRect(left + W / 2 - 22, top + H / 2 - 6, 44, 14)
  ctx.fillStyle = '#1f2937'
  ctx.fillRect(left + W / 2 - 20, top + H / 2 - 4, 40, 10)
  ctx.fillStyle = '#374151'
  for (let c = 0; c < 9; c++) {
    for (let r = 0; r < 2; r++) {
      ctx.fillRect(left + W / 2 - 18 + c * 4, top + H / 2 - 3 + r * 4, 3, 3)
    }
  }
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,    // waist-center in canvas px
  colors: { hair: string; skin: string; shirt: string; pants: string },
) {
  const s = SC   // pixel-art scale (= 2)

  // shadow ellipse
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 18 * s, 7 * s, 2 * s, 0, 0, Math.PI * 2)
  ctx.fill()

  // ── legs ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = colors.pants
  ctx.fillRect(cx - 4 * s, cy + 8 * s,  4 * s, 8 * s)   // left leg
  ctx.fillRect(cx + 1 * s, cy + 8 * s,  4 * s, 8 * s)   // right leg
  ctx.fillRect(cx - 5 * s, cy + 14 * s, 5 * s, 2 * s)   // left shoe
  ctx.fillRect(cx + 1 * s, cy + 14 * s, 5 * s, 2 * s)   // right shoe

  // belt
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(cx - 5 * s, cy + 6 * s, 10 * s, 2 * s)

  // ── torso ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = colors.shirt
  ctx.fillRect(cx - 5 * s, cy - 5 * s, 10 * s, 13 * s)

  // arms (skin-coloured)
  ctx.fillStyle = colors.skin
  ctx.fillRect(cx - 8 * s, cy - 4 * s,  3 * s, 10 * s)  // left
  ctx.fillRect(cx + 5 * s, cy - 4 * s,  3 * s, 10 * s)  // right

  // neck
  ctx.fillStyle = colors.skin
  ctx.fillRect(cx - 2 * s, cy - 8 * s,  4 * s, 4 * s)

  // ── head ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = colors.skin
  ctx.fillRect(cx - 5 * s, cy - 16 * s, 10 * s, 10 * s)

  // hair
  ctx.fillStyle = colors.hair
  ctx.fillRect(cx - 5 * s, cy - 16 * s, 10 * s, 4 * s)   // crown
  ctx.fillRect(cx - 6 * s, cy - 16 * s,  2 * s, 8 * s)   // left side
  ctx.fillRect(cx + 4 * s, cy - 16 * s,  2 * s, 8 * s)   // right side

  // eyes
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(cx - 3 * s, cy - 11 * s, 2 * s, 2 * s)   // left
  ctx.fillRect(cx + 1 * s, cy - 11 * s, 2 * s, 2 * s)   // right
  // eye shine
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillRect(cx - 2 * s, cy - 11 * s, s,     s)
  ctx.fillRect(cx + 2 * s, cy - 11 * s, s,     s)

  // slight smile
  ctx.fillStyle = '#c87070'
  ctx.fillRect(cx - 2 * s, cy - 7 * s,  4 * s, s)
}

function drawStatusHalo(
  ctx: CanvasRenderingContext2D,
  cx: number, headCY: number,
  status: AgentStatus, t: number,
) {
  const color = STATUS_COLOR[status]
  const pulse = status === 'working'
    ? Math.sin(t * 5) * 3
    : status === 'waiting'
    ? Math.sin(t * 2) * 2
    : status === 'error'
    ? Math.sin(t * 8) * 2
    : 0

  const r     = 18 + pulse
  const alpha = status === 'working'
    ? 0.55 + Math.sin(t * 5) * 0.25
    : 0.75

  ctx.save()
  ctx.strokeStyle   = color
  ctx.lineWidth     = status === 'working' ? 2.5 : 2
  ctx.globalAlpha   = alpha
  ctx.shadowColor   = color
  ctx.shadowBlur    = status === 'working' ? 8 : 4
  ctx.beginPath()
  ctx.arc(cx, headCY, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // solid status dot (top-right of halo)
  ctx.save()
  ctx.fillStyle   = color
  ctx.shadowColor = color
  ctx.shadowBlur  = 6
  ctx.beginPath()
  ctx.arc(cx + r * 0.7, headCY - r * 0.7, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  color = 'rgba(255,255,255,0.75)',
  fontSize = 8,
) {
  ctx.font      = `${fontSize}px "Silkscreen", monospace`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y)
}

function drawDeskStation(
  ctx: CanvasRenderingContext2D,
  desk: DeskConfig,
  agent: AgentConfig | null,
  status: AgentStatus | null,
  t: number,
) {
  const left = desk.x * TILE + PAD
  const top  = desk.y * TILE + PAD
  const W    = 2 * TILE    // 144
  const H    = TILE        // 72
  const mCX  = left + W / 2

  // desk + monitor + keyboard
  drawDesk(ctx, left, top)

  // desk label (bottom of tile, small + muted)
  ctx.font      = '6px "Silkscreen", monospace'
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.textAlign = 'center'
  ctx.fillText(desk.label.toUpperCase(), mCX, top + H - 5)

  if (!agent) {
    // vacant indicator
    ctx.font      = '7px "Silkscreen", monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.textAlign = 'center'
    ctx.fillText('VACANT', mCX, top + H / 2 + 3)
    return
  }

  // ── character, positioned at front/bottom of desk ─────────────────────────
  const charCY = top + H - 4   // waist center
  const headCY = charCY - 12 * SC  // head center (12 art-px above waist)
  const colors = SPRITE_COLORS[agent.characterSprite]
  drawCharacter(ctx, mCX, charCY, colors)

  // ── status halo ───────────────────────────────────────────────────────────
  const resolvedStatus: AgentStatus = status ?? 'idle'
  drawStatusHalo(ctx, mCX, headCY, resolvedStatus, t)

  // ── agent name ────────────────────────────────────────────────────────────
  drawLabel(ctx, agent.name, mCX, charCY + 20 * SC + 14, 'rgba(255,255,255,0.88)', 8)

  // role in status colour
  const roleColor = STATUS_COLOR[resolvedStatus]
  drawLabel(ctx, agent.role.toUpperCase(), mCX, charCY + 20 * SC + 25, roleColor, 6)

  // ── "● WORKING" blinking badge ────────────────────────────────────────────
  if (resolvedStatus === 'working' && Math.floor(t * 2) % 2 === 0) {
    ctx.font      = '7px "Silkscreen", monospace'
    ctx.fillStyle = STATUS_COLOR.working
    ctx.textAlign = 'center'
    ctx.fillText('● WORKING', mCX, top - 50)
  }
}

function drawRoomDivider(ctx: CanvasRenderingContext2D) {
  // horizontal divider between row 3 and row 4 (walkway)
  const y = 3 * TILE + PAD + TILE / 2
  ctx.strokeStyle = '#2a2a44'
  ctx.lineWidth   = 2
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(CANVAS_W - PAD, y)
  ctx.stroke()
  ctx.setLineDash([])

  drawLabel(ctx, 'QA OFFICE — OPEN-QA', CANVAS_W / 2, y - 8, 'rgba(255,255,255,0.18)', 7)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  agents:        AgentConfig[]
  agentStatuses: Record<string, AgentStatus>
  layout:        OfficeLayout
  onDeskClick?:  (deskId: string) => void
}

export default function OfficeCanvas({ agents, agentStatuses, layout, onDeskClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)

  // ── render loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Non-null assertion: ctx is verified above; closure captures it safely.
    const c = ctx as CanvasRenderingContext2D
    const origin = performance.now()

    function draw(now: number) {
      const t = (now - origin) / 1000   // seconds

      c.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // ── layers ─────────────────────────────────────────────────────────
      drawFloor(c)
      drawWallStrip(c)
      drawRoomDivider(c)

      // back-to-front: desks in upper rows, then lower rows
      for (const desk of layout.desks) {
        const agent  = agents.find(a => a.deskId === desk.id) ?? null
        const status = agent ? (agentStatuses[agent.id] ?? 'idle') : null
        drawDeskStation(c, desk, agent, status, t)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [agents, agentStatuses, layout])

  // ── click hit-test ─────────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect  = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top)  * scaleY

    for (const desk of layout.desks) {
      const dl = desk.x * TILE + PAD
      const dt = desk.y * TILE + PAD
      const dw = 2 * TILE
      const dh = TILE + 20 * SC + 30   // extend hit area to include labels below
      if (mx >= dl && mx <= dl + dw && my >= dt && my <= dt + dh) {
        onDeskClick?.(desk.id)
        return
      }
    }
  }, [layout, onDeskClick])

  // ── cursor ─────────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect  = canvasRef.current!.getBoundingClientRect()
    const scaleX = CANVAS_W / rect.width
    const scaleY = CANVAS_H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top)  * scaleY

    const hit = layout.desks.some(d => {
      const dl = d.x * TILE + PAD
      const dt = d.y * TILE + PAD
      return mx >= dl && mx <= dl + 2 * TILE && my >= dt && my <= dt + TILE + 60
    })

    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'default'
    }
  }, [layout])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        display:         'block',
        maxWidth:        '100%',
        height:          'auto',
        imageRendering:  'pixelated',
        borderRadius:    '12px',
        border:          '2px solid #1e1e30',
        boxShadow:       '0 8px 32px rgba(0,0,0,0.6)',
      }}
    />
  )
}
