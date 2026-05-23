/**
 * OfficeCanvas for open-qa.
 *
 * Stripped version of pixel-agents OfficeCanvas:
 *  - No editor mode (remove / rotate / place furniture)
 *  - Seat re-assignment persisted to localStorage instead of VS Code transport
 *  - Props simplified to { officeState, onAgentClick?, zoom, onZoomChange, panRef }
 *
 * Based on pixel-agents webview-ui/src/office/components/OfficeCanvas.tsx (MIT)
 */
import { useCallback, useEffect, useRef } from 'react'

import {
  CAMERA_FOLLOW_LERP,
  CAMERA_FOLLOW_SNAP_THRESHOLD,
  PAN_MARGIN_FRACTION,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_SCROLL_THRESHOLD,
} from '../../constants.js'
import { startGameLoop } from '../engine/gameLoop.js'
import type { OfficeState } from '../engine/officeState.js'
import { renderFrame } from '../engine/renderer.js'
import { TILE_SIZE } from '../types.js'

interface OfficeCanvasProps {
  officeState: OfficeState
  onAgentClick?: (agentId: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  panRef: React.MutableRefObject<{ x: number; y: number }>
  /** When true, disables pan (middle-mouse drag + scroll) and zoom (Ctrl+wheel).
   *  The map renders at the fixed zoom/pan values passed in props. */
  locked?: boolean
}

export function OfficeCanvas({
  officeState,
  onAgentClick,
  zoom,
  onZoomChange,
  panRef,
  locked = false,
}: OfficeCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const offsetRef    = useRef({ x: 0, y: 0 })
  const isPanningRef   = useRef(false)
  const panStartRef    = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 })
  const zoomAccumRef   = useRef(0)
  /**
   * When locked=true we ignore the `zoom` prop and instead auto-compute a
   * "fit zoom" so the map always fills the container pixel-perfectly,
   * regardless of devicePixelRatio or container size.
   *
   * Formula (device pixels):
   *   fitZoom = min(canvas.width  / (cols * TILE_SIZE),
   *                 canvas.height / (rows * TILE_SIZE))
   *
   * This is recalculated every time resizeCanvas() fires so the map
   * re-centres whenever the container resizes.
   */
  const fitZoomRef = useRef(zoom)

  // ── Effective zoom used by the render loop ────────────────────────────────
  // Interactive mode: use the prop value. Locked mode: use auto-fit value.
  const effectiveZoom = useCallback(
    () => (locked ? fitZoomRef.current : zoom),
    [locked, zoom],
  )

  // ── pan clamping ─────────────────────────────────────────────────────────────

  const clampPan = useCallback(
    (px: number, py: number): { x: number; y: number } => {
      const canvas = canvasRef.current
      if (!canvas) return { x: px, y: py }
      const ez     = effectiveZoom()
      const layout = officeState.getLayout()
      const mapW = layout.cols * TILE_SIZE * ez
      const mapH = layout.rows * TILE_SIZE * ez
      const marginX = canvas.width  * PAN_MARGIN_FRACTION
      const marginY = canvas.height * PAN_MARGIN_FRACTION
      const maxX = mapW / 2 + canvas.width  / 2 - marginX
      const maxY = mapH / 2 + canvas.height / 2 - marginY
      return {
        x: Math.max(-maxX, Math.min(maxX, px)),
        y: Math.max(-maxY, Math.min(maxY, py)),
      }
    },
    [officeState, effectiveZoom],
  )

  // ── canvas resize ─────────────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Use offsetWidth/Height (integer CSS px) as a stable fallback when
    // getBoundingClientRect returns 0 during the first synchronous layout pass.
    const rect = container.getBoundingClientRect()
    const cssW = rect.width  || container.offsetWidth  || 1
    const cssH = rect.height || container.offsetHeight || 1
    const dpr  = window.devicePixelRatio || 1

    canvas.width  = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    // Keep CSS display size = container size (1:1 CSS px mapping)
    canvas.style.width  = `${cssW}px`
    canvas.style.height = `${cssH}px`

    // Recalculate fit-zoom whenever the buffer dimensions change.
    // 0.95 margin keeps a subtle breathing gap so the map never touches the edge.
    if (locked) {
      const layout = officeState.getLayout()
      const cols = layout.cols || 1
      const rows = layout.rows || 1
      const maxScaleX = canvas.width  / (cols * TILE_SIZE)
      const maxScaleY = canvas.height / (rows * TILE_SIZE)
      fitZoomRef.current = Math.min(maxScaleX, maxScaleY) * 0.95
      // Reset pan to zero so the map stays centred after resize
      panRef.current = { x: 0, y: 0 }
    }
  }, [locked, officeState, panRef])

  // ── game loop ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    resizeCanvas()

    const observer = new ResizeObserver(() => resizeCanvas())
    if (containerRef.current) observer.observe(containerRef.current)

    const stop = startGameLoop(canvas, {
      update: (dt) => { officeState.update(dt) },
      render: (ctx) => {
        const w  = canvas.width
        const h  = canvas.height
        const ez = effectiveZoom()

        // ── Pixel sharpness — disable ALL smoothing APIs ───────────────────
        // At high fit-zoom scales the sprites would blur without this.
        ctx.imageSmoothingEnabled = false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctxAny = ctx as any
        ctxAny.mozImageSmoothingEnabled    = false
        ctxAny.webkitImageSmoothingEnabled = false
        ctxAny.msImageSmoothingEnabled     = false

        // ── Background fill ────────────────────────────────────────────────
        ctx.fillStyle = '#13131f'
        ctx.fillRect(0, 0, w, h)

        // Camera follow (interactive mode only — locked maps stay centered)
        if (!locked && officeState.cameraFollowId !== null) {
          const ch = officeState.characters.get(officeState.cameraFollowId)
          if (ch) {
            const layout = officeState.getLayout()
            const mapW = layout.cols * TILE_SIZE * ez
            const mapH = layout.rows * TILE_SIZE * ez
            const targetX = mapW / 2 - ch.x * ez
            const targetY = mapH / 2 - ch.y * ez
            const dx = targetX - panRef.current.x
            const dy = targetY - panRef.current.y
            if (
              Math.abs(dx) < CAMERA_FOLLOW_SNAP_THRESHOLD &&
              Math.abs(dy) < CAMERA_FOLLOW_SNAP_THRESHOLD
            ) {
              panRef.current = { x: targetX, y: targetY }
            } else {
              panRef.current = {
                x: panRef.current.x + dx * CAMERA_FOLLOW_LERP,
                y: panRef.current.y + dy * CAMERA_FOLLOW_LERP,
              }
            }
          }
        }

        const { offsetX, offsetY } = renderFrame(
          ctx,
          w,
          h,
          officeState.tileMap,
          officeState.furniture,
          officeState.getCharacters(),
          ez,                        // ← auto-fit zoom when locked
          locked ? 0 : panRef.current.x,
          locked ? 0 : panRef.current.y,
          {
            selectedAgentId: officeState.selectedAgentId,
            hoveredAgentId:  officeState.hoveredAgentId,
            hoveredTile:     officeState.hoveredTile,
            seats:           officeState.seats,
            characters:      officeState.characters,
          },
          undefined, // no editor render state
          officeState.getLayout().tileColors,
          officeState.getLayout().cols,
          officeState.getLayout().rows,
        )
        offsetRef.current = { x: offsetX, y: offsetY }
      },
    })

    return () => { stop(); observer.disconnect() }
  }, [officeState, resizeCanvas, zoom, panRef, locked, effectiveZoom])

  // ── coordinate utils ──────────────────────────────────────────────────────────

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const dpr  = window.devicePixelRatio || 1
      const cssX = clientX - rect.left
      const cssY = clientY - rect.top
      const devX = cssX * dpr
      const devY = cssY * dpr
      // Use effectiveZoom() so hit-testing is correct in both free and locked modes
      const ez     = effectiveZoom()
      const worldX = (devX - offsetRef.current.x) / ez
      const worldY = (devY - offsetRef.current.y) / ez
      return { worldX, worldY }
    },
    [effectiveZoom],
  )

  const screenToTile = useCallback(
    (clientX: number, clientY: number) => {
      const pos = screenToWorld(clientX, clientY)
      if (!pos) return null
      const col = Math.floor(pos.worldX / TILE_SIZE)
      const row = Math.floor(pos.worldY / TILE_SIZE)
      const layout = officeState.getLayout()
      if (col < 0 || col >= layout.cols || row < 0 || row >= layout.rows) return null
      return { col, row }
    },
    [screenToWorld, officeState],
  )

  // ── mouse handlers ────────────────────────────────────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanningRef.current) {
        const dpr = window.devicePixelRatio || 1
        const dx  = (e.clientX - panStartRef.current.mouseX) * dpr
        const dy  = (e.clientY - panStartRef.current.mouseY) * dpr
        panRef.current = clampPan(
          panStartRef.current.panX + dx,
          panStartRef.current.panY + dy,
        )
        return
      }

      const pos = screenToWorld(e.clientX, e.clientY)
      if (!pos) return
      const hitId = officeState.getCharacterAt(pos.worldX, pos.worldY)
      const tile  = screenToTile(e.clientX, e.clientY)
      officeState.hoveredTile     = tile
      officeState.hoveredAgentId  = hitId

      const canvas = canvasRef.current
      if (canvas) {
        let cursor = 'default'
        if (hitId !== null) {
          cursor = 'pointer'
        } else if (officeState.selectedAgentId !== null && tile) {
          const seatId = officeState.getSeatAtTile(tile.col, tile.row)
          if (seatId) {
            const seat       = officeState.seats.get(seatId)
            const selectedCh = officeState.characters.get(officeState.selectedAgentId)
            if (seat && (!seat.assigned || (selectedCh && selectedCh.seatId === seatId))) {
              cursor = 'pointer'
            }
          }
        }
        canvas.style.cursor = cursor
      }
    },
    [officeState, screenToWorld, screenToTile, panRef, clampPan],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 && !locked) {
        e.preventDefault()
        officeState.cameraFollowId = null
        isPanningRef.current = true
        panStartRef.current  = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          panX:   panRef.current.x,
          panY:   panRef.current.y,
        }
        const canvas = canvasRef.current
        if (canvas) canvas.style.cursor = 'grabbing'
      }
    },
    [officeState, panRef, locked],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1) {
        isPanningRef.current = false
        const canvas = canvasRef.current
        if (canvas) canvas.style.cursor = 'default'
      }
    },
    [],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToWorld(e.clientX, e.clientY)
      if (!pos) return

      const hitId = officeState.getCharacterAt(pos.worldX, pos.worldY)
      if (hitId !== null) {
        officeState.dismissBubble(hitId)
        if (officeState.selectedAgentId === hitId) {
          officeState.selectedAgentId = null
          officeState.cameraFollowId  = null
        } else {
          officeState.selectedAgentId = hitId
          officeState.cameraFollowId  = hitId
        }
        onAgentClick?.(hitId)
        return
      }

      // Seat click while agent selected
      if (officeState.selectedAgentId !== null) {
        const selectedCh = officeState.characters.get(officeState.selectedAgentId)
        if (selectedCh && !selectedCh.isSubagent) {
          const tile = screenToTile(e.clientX, e.clientY)
          if (tile) {
            const seatId = officeState.getSeatAtTile(tile.col, tile.row)
            if (seatId) {
              const seat = officeState.seats.get(seatId)
              if (seat) {
                if (selectedCh.seatId === seatId) {
                  officeState.sendToSeat(officeState.selectedAgentId)
                  officeState.selectedAgentId = null
                  officeState.cameraFollowId  = null
                  return
                } else if (!seat.assigned) {
                  officeState.reassignSeat(officeState.selectedAgentId, seatId)
                  officeState.selectedAgentId = null
                  officeState.cameraFollowId  = null
                  // Persist to localStorage
                  const seats: Record<number, { palette: number; hueShift: number; seatId: string | null }> = {}
                  for (const ch of officeState.characters.values()) {
                    if (ch.isSubagent) continue
                    seats[ch.id] = { palette: ch.palette, hueShift: ch.hueShift, seatId: ch.seatId }
                  }
                  localStorage.setItem('open_qa_agent_seats', JSON.stringify(seats))
                  return
                }
              }
            }
          }
        }
        officeState.selectedAgentId = null
        officeState.cameraFollowId  = null
      }
    },
    [officeState, onAgentClick, screenToWorld, screenToTile],
  )

  const handleMouseLeave = useCallback(() => {
    isPanningRef.current       = false
    officeState.hoveredAgentId = null
    officeState.hoveredTile    = null
  }, [officeState])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (officeState.selectedAgentId !== null) {
        const tile = screenToTile(e.clientX, e.clientY)
        if (tile) officeState.walkToTile(officeState.selectedAgentId, tile.col, tile.row)
      }
    },
    [officeState, screenToTile],
  )

  // Ctrl/Cmd+wheel = zoom, plain wheel = pan
  // When locked=true both interactions are disabled (fixed map mode).
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (locked) return
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        zoomAccumRef.current += e.deltaY
        if (Math.abs(zoomAccumRef.current) >= ZOOM_SCROLL_THRESHOLD) {
          const delta = zoomAccumRef.current < 0 ? 1 : -1
          zoomAccumRef.current = 0
          const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta))
          if (next !== zoom) onZoomChange(next)
        }
      } else {
        const dpr = window.devicePixelRatio || 1
        officeState.cameraFollowId = null
        panRef.current = clampPan(
          panRef.current.x - e.deltaX * dpr,
          panRef.current.y - e.deltaY * dpr,
        )
      }
    },
    [zoom, onZoomChange, officeState, panRef, clampPan, locked],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handleAuxClick = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) e.preventDefault()
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: '#1a1a2e', imageRendering: 'pixelated' }}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onAuxClick={handleAuxClick}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        className="block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
