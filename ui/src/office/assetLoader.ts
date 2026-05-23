/**
 * Browser-side asset loader for open-qa.
 *
 * Fetches asset-index.json + furniture-catalog.json, decodes all PNGs
 * via Canvas API, then calls the sprite setters the engine needs.
 *
 * Based on pixel-agents browserMock.ts (MIT licence).
 */

import { buildDynamicCatalog } from './layout/furnitureCatalog.js';
import { setFloorSprites } from './floorTiles.js';
import { setWallSprites } from './wallTiles.js';
import { setCharacterTemplates } from './sprites/spriteData.js';

// ── constants (mirrors core/src/assets/constants.ts) ─────────────────────────

const CHAR_FRAME_W = 16;
const CHAR_FRAME_H = 32;
const CHAR_FRAMES_PER_ROW = 7;
const CHARACTER_DIRECTIONS = ['down', 'up', 'right'] as const;
const FLOOR_TILE_SIZE = 16;
const WALL_PIECE_WIDTH = 16;
const WALL_PIECE_HEIGHT = 32;
const WALL_GRID_COLS = 4;
const WALL_BITMASK_COUNT = 16;
const PNG_ALPHA_THRESHOLD = 2;

// ── pixel helpers ─────────────────────────────────────────────────────────────

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  if (a < PNG_ALPHA_THRESHOLD) return '';
  if (a < 255) {
    const alpha = Math.round((a / 255) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alpha.toString(16).padStart(2, '0')}`;
  }
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface DecodedPng {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

async function decodePng(url: string): Promise<DecodedPng> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url} (${res.status})`);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = bitmap.width;
  c.height = bitmap.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const id = ctx.getImageData(0, 0, c.width, c.height);
  return { width: c.width, height: c.height, data: id.data };
}

function readSprite(png: DecodedPng, w: number, h: number, ox = 0, oy = 0): string[][] {
  const sprite: string[][] = [];
  for (let y = 0; y < h; y++) {
    const row: string[] = [];
    for (let x = 0; x < w; x++) {
      const i = ((oy + y) * png.width + (ox + x)) * 4;
      row.push(rgbaToHex(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]));
    }
    sprite.push(row);
  }
  return sprite;
}

// ── loaders ───────────────────────────────────────────────────────────────────

async function loadCharacters(base: string, files: string[]) {
  const result: { down: string[][][]; up: string[][][]; right: string[][][] }[] = [];
  for (const file of files) {
    const png = await decodePng(`${base}assets/characters/${file}`);
    const byDir: { down: string[][][]; up: string[][][]; right: string[][][] } = {
      down: [],
      up: [],
      right: [],
    };
    for (let di = 0; di < CHARACTER_DIRECTIONS.length; di++) {
      const dir = CHARACTER_DIRECTIONS[di];
      const frames: string[][][] = [];
      for (let frame = 0; frame < CHAR_FRAMES_PER_ROW; frame++) {
        frames.push(
          readSprite(png, CHAR_FRAME_W, CHAR_FRAME_H, frame * CHAR_FRAME_W, di * CHAR_FRAME_H),
        );
      }
      byDir[dir] = frames;
    }
    result.push(byDir);
  }
  return result;
}

async function loadFloors(base: string, files: string[]) {
  const result: string[][][] = [];
  for (const file of files) {
    const png = await decodePng(`${base}assets/floors/${file}`);
    result.push(readSprite(png, FLOOR_TILE_SIZE, FLOOR_TILE_SIZE));
  }
  return result;
}

async function loadWalls(base: string, files: string[]) {
  const result: string[][][][] = [];
  for (const file of files) {
    const png = await decodePng(`${base}assets/walls/${file}`);
    const set: string[][][] = [];
    for (let mask = 0; mask < WALL_BITMASK_COUNT; mask++) {
      const ox = (mask % WALL_GRID_COLS) * WALL_PIECE_WIDTH;
      const oy = Math.floor(mask / WALL_GRID_COLS) * WALL_PIECE_HEIGHT;
      set.push(readSprite(png, WALL_PIECE_WIDTH, WALL_PIECE_HEIGHT, ox, oy));
    }
    result.push(set);
  }
  return result;
}

async function loadFurniture(
  base: string,
  catalog: { id: string; furniturePath: string; width: number; height: number }[],
) {
  const sprites: Record<string, string[][]> = {};
  for (const entry of catalog) {
    try {
      const png = await decodePng(`${base}assets/${entry.furniturePath}`);
      sprites[entry.id] = readSprite(png, entry.width, entry.height);
    } catch (e) {
      console.warn(`[AssetLoader] Skipping ${entry.id}:`, e);
    }
  }
  return sprites;
}

// ── public API ────────────────────────────────────────────────────────────────

let _loaded = false;

export async function loadOfficeAssets(): Promise<void> {
  if (_loaded) return;
  _loaded = true;

  const base = import.meta.env.BASE_URL ?? '/';
  const safeBase = base.endsWith('/') ? base : `${base}/`;

  console.log('[AssetLoader] Loading assets...');

  // Load index + catalog in parallel
  const [assetIndex, catalog] = await Promise.all([
    fetch(`${safeBase}assets/asset-index.json`).then((r) => r.json()) as Promise<{
      characters: string[];
      floors: string[];
      walls: string[];
      defaultLayout: string | null;
    }>,
    fetch(`${safeBase}assets/furniture-catalog.json`).then((r) => r.json()) as Promise<
      {
        id: string;
        furniturePath: string;
        width: number;
        height: number;
        label: string;
        category: string;
        footprintW: number;
        footprintH: number;
        isDesk: boolean;
        canPlaceOnWalls: boolean;
        groupId?: string;
        orientation?: string;
        state?: string;
        canPlaceOnSurfaces?: boolean;
        backgroundTiles?: number;
        mirrorSide?: boolean;
        rotationScheme?: string;
        animationGroup?: string;
        frame?: number;
      }[]
    >,
  ]);

  // Decode all assets in parallel (batched per type for readability)
  const [characters, floors, walls, furnitureSprites] = await Promise.all([
    loadCharacters(safeBase, assetIndex.characters),
    loadFloors(safeBase, assetIndex.floors),
    loadWalls(safeBase, assetIndex.walls),
    loadFurniture(safeBase, catalog),
  ]);

  // Inject into engine
  setCharacterTemplates(characters as Parameters<typeof setCharacterTemplates>[0]);
  setFloorSprites(floors);
  setWallSprites(walls);
  buildDynamicCatalog({ catalog, sprites: furnitureSprites });

  console.log(
    `[AssetLoader] Done — ${characters.length} chars, ${floors.length} floors, ${walls.length} walls, ${catalog.length} furniture`,
  );
}

/** Load default office layout from assets */
export async function loadDefaultLayout(): Promise<unknown | null> {
  const base = import.meta.env.BASE_URL ?? '/';
  const safeBase = base.endsWith('/') ? base : `${base}/`;
  try {
    const index = (await fetch(`${safeBase}assets/asset-index.json`).then((r) => r.json())) as {
      defaultLayout: string | null;
    };
    if (!index.defaultLayout) return null;
    return fetch(`${safeBase}assets/${index.defaultLayout}`).then((r) => r.json());
  } catch {
    return null;
  }
}
