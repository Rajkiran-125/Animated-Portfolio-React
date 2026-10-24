import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Float, Outlines } from '@react-three/drei';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Group,
  Mesh,
  NearestFilter,
  RedFormat,
  Vector3,
  type Points as ThreePoints,
} from 'three';
import type { RenderTier } from '@/lib/device';
import { useTheme } from '@/theme/theme';
import { DEFAULT_THEME, THEMES } from '@/theme/themes';
import { MONITOR_SNIPPET, TERMINAL_SNIPPET, WINDOW_SNIPPETS, createCodeTexture } from './codeTexture';

/* ─── Palette (follows the colour theme) & shared toon ramp ──────────── */
const PaletteCtx = createContext(THEMES[DEFAULT_THEME]);
const useScene = () => useContext(PaletteCtx).scene;
const useCode = () => useContext(PaletteCtx).code;

let ramp: DataTexture | null = null;
function toonRamp() {
  if (!ramp) {
    // 3-step ramp → flat, cel-shaded look matching the illustrated references
    ramp = new DataTexture(new Uint8Array([90, 175, 255]), 3, 1, RedFormat);
    ramp.minFilter = ramp.magFilter = NearestFilter;
    ramp.needsUpdate = true;
  }
  return ramp;
}

const TierCtx = createContext<RenderTier>('full');

function Toon({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={toonRamp()} />;
}

/** Ink outline — the inverted-hull pass is skipped on lite devices. */
function Ink({ thickness = 0.018 }: { thickness?: number }) {
  const tier = useContext(TierCtx);
  const C = useScene();
  if (tier !== 'full') return null;
  return <Outlines thickness={thickness} color={C.outline} />;
}

type V3 = [number, number, number];

function Box({ args, color, position, rotation, outline = true }: { args: V3; color: string; position?: V3; rotation?: V3; outline?: boolean }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <Toon color={color} />
      {outline && <Ink />}
    </mesh>
  );
}

function Cyl({ args, color, position, rotation }: { args: [number, number, number, number?]; color: string; position?: V3; rotation?: V3 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 24]} />
      <Toon color={color} />
      <Ink />
    </mesh>
  );
}

/* ─── Screens ────────────────────────────────────────────────────────── */
/** Repaint a screen in the new colours when the theme changes. */
function useScreenPalette(screen: ReturnType<typeof createCodeTexture>, progress: MutableRefObject<number>) {
  const code = useCode();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    screen.setPalette(code);
    screen.draw(progress.current);
    invalidate();
  }, [screen, code, progress, invalidate]);
}

type ScreenOptions = Omit<Parameters<typeof createCodeTexture>[1], 'palette'>;

function useTypingScreen(snippet: typeof MONITOR_SNIPPET, opts: ScreenOptions, speed: number, reduce: boolean) {
  const code = useCode();
  // Created once per mount; snippet/opts are static for each screen, colours follow via useScreenPalette
  const screen = useMemo(() => createCodeTexture(snippet, { ...opts, palette: code }), []);
  const invalidate = useThree((s) => s.invalidate);
  const progress = useRef(reduce ? 1 : 0);
  // Accumulated deltas, not clock timestamps: R3F resets clock.elapsedTime to 0
  // whenever the frameloop toggles (we pause it while the hero is off screen).
  const sinceDraw = useRef(0);
  const held = useRef(0);
  const blink = useRef(0);
  const caretOn = useRef(true);
  useEffect(() => () => screen.dispose(), [screen]);
  useEffect(() => {
    // Redraw once fonts are ready so the mono face is used
    document.fonts?.ready.then(() => {
      screen.draw(progress.current);
      invalidate();
    });
  }, [screen, invalidate]);
  useScreenPalette(screen, progress);
  useFrame((_, delta) => {
    if (reduce) return;
    sinceDraw.current += delta;
    // Throttle canvas uploads to ~15fps while typing — plenty, and cheap for the GPU
    if (sinceDraw.current < 0.066) return;
    const dt = Math.min(sinceDraw.current, 0.25);
    sinceDraw.current = 0;
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt * speed);
      held.current = 0;
      screen.draw(progress.current, true);
      return;
    }
    held.current += dt;
    if (held.current > 7) {
      progress.current = 0; // hold the finished file, then retype
      return;
    }
    // Idle: re-upload only when the caret blinks (~2×/s)
    blink.current += dt;
    if (blink.current > 0.53) {
      blink.current = 0;
      caretOn.current = !caretOn.current;
      screen.draw(1, caretOn.current);
    }
  });
  return screen;
}

function Monitor({ reduce }: { reduce: boolean }) {
  const C = useScene();
  const screen = useTypingScreen(MONITOR_SNIPPET, { width: 1024, height: 600, fontSize: 26 }, 0.12, reduce);
  return (
    <group position={[-0.15, 0, -0.35]}>
      <Box args={[0.55, 0.04, 0.3]} color={C.ink} position={[0, 0.04, 0]} />
      <Box args={[0.09, 0.55, 0.06]} color={C.ink} position={[0, 0.32, -0.02]} />
      <group position={[0, 0.98, 0.02]} rotation={[-0.05, 0, 0]}>
        <Box args={[1.86, 1.12, 0.07]} color={C.ink} />
        <mesh position={[0, 0, 0.037]}>
          <planeGeometry args={[1.74, 1.02]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Laptop({ reduce }: { reduce: boolean }) {
  const C = useScene();
  const screen = useTypingScreen(TERMINAL_SNIPPET, { width: 640, height: 400, fontSize: 24 }, 0.2, reduce);
  return (
    <group position={[1.25, 0.03, 0.25]} rotation={[0, -0.45, 0]}>
      <Box args={[0.95, 0.04, 0.62]} color={C.bone} position={[0, 0.02, 0]} />
      <Box args={[0.78, 0.005, 0.3]} color={C.inkSoft} position={[0, 0.043, -0.06]} outline={false} />
      <group position={[0, 0.04, -0.31]} rotation={[-0.32, 0, 0]}>
        <Box args={[0.95, 0.6, 0.03]} color={C.bone} position={[0, 0.3, 0]} />
        <mesh position={[0, 0.3, 0.017]}>
          <planeGeometry args={[0.86, 0.52]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Mug() {
  const C = useScene();
  const steam = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!steam.current) return;
    steam.current.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.35 + i * 0.33) % 1;
      c.position.y = 0.32 + t * 0.4;
      c.scale.setScalar(0.6 + t * 0.6);
      ((c as Mesh).material as { opacity: number }).opacity = 0.55 * (1 - t);
    });
  });
  return (
    <group position={[-1.45, 0.03, 0.3]}>
      <Cyl args={[0.13, 0.11, 0.28]} color={C.accent} position={[0, 0.14, 0]} />
      <mesh position={[0.15, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.07, 0.022, 10, 20]} />
        <Toon color={C.accent} />
        <Ink thickness={0.012} />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 0.04, 0.32, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color={C.paper} transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Lamp() {
  const C = useScene();
  return (
    <group position={[-1.5, 0.03, -0.45]}>
      <Cyl args={[0.16, 0.18, 0.05]} color={C.ink} position={[0, 0.025, 0]} />
      <Box args={[0.045, 0.75, 0.045]} color={C.ink} position={[0.08, 0.38, 0]} rotation={[0, 0, -0.22]} />
      <Box args={[0.045, 0.55, 0.045]} color={C.ink} position={[0.36, 0.86, 0]} rotation={[0, 0, 1.0]} />
      <group position={[0.6, 0.86, 0]} rotation={[0, 0, -2.2]}>
        <mesh>
          <coneGeometry args={[0.17, 0.26, 24, 1, true]} />
          <meshToonMaterial color={C.accent} gradientMap={toonRamp()} side={2} />
          <Ink thickness={0.012} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#fff4d6" toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0.62, 0.6, 0.2]} color="#ffd9a8" intensity={2.2} distance={2.6} decay={2} />
    </group>
  );
}

function Books() {
  const C = useScene();
  return (
    <group position={[1.55, 0.03, -0.45]} rotation={[0, 0.25, 0]}>
      <Box args={[0.5, 0.09, 0.36]} color={C.accent} position={[0, 0.045, 0]} />
      <Box args={[0.46, 0.08, 0.34]} color={C.paper} position={[0.02, 0.13, 0]} rotation={[0, -0.12, 0]} />
      <Box args={[0.42, 0.1, 0.32]} color={C.ink} position={[-0.01, 0.22, 0]} rotation={[0, 0.1, 0]} />
    </group>
  );
}

function Desk({ reduce }: { reduce: boolean }) {
  const C = useScene();
  return (
    <group>
      <Box args={[3.9, 0.1, 1.55]} color={C.ink} position={[0, -0.05, 0]} />
      {[
        [-1.8, -0.7],
        [1.8, -0.7],
      ].map(([x, z]) => (
        <group key={x}>
          <Box args={[0.07, 1.25, 0.07]} color={C.ink} position={[x, -0.72, z]} />
          <Box args={[0.07, 1.25, 0.07]} color={C.ink} position={[x, -0.72, -z]} />
        </group>
      ))}
      {/* keyboard + mouse */}
      <Box args={[1.05, 0.035, 0.32]} color={C.paper} position={[-0.15, 0.02, 0.38]} />
      <Box args={[0.9, 0.01, 0.2]} color={C.bone} position={[-0.15, 0.042, 0.38]} outline={false} />
      <mesh position={[0.62, 0.025, 0.42]} scale={[1, 0.5, 1.4]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <Toon color={C.paper} />
        <Ink thickness={0.01} />
      </mesh>
      <Monitor reduce={reduce} />
      <Laptop reduce={reduce} />
      <Mug />
      <Lamp />
      <Books />
    </group>
  );
}

/* ─── Interactive floating pieces ────────────────────────────────────── */
function setCursor(e: ThreeEvent<PointerEvent>, label: string | null) {
  const host = (e.nativeEvent.target as HTMLElement | null)?.closest<HTMLElement>('[data-scene-host]');
  if (!host) return;
  if (label) {
    host.dataset.cursor = 'view';
    host.dataset.cursorLabel = label;
    host.style.cursor = 'pointer';
  } else {
    host.dataset.cursor = 'none';
    host.style.cursor = '';
  }
  host.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
}

/** Code window that swaps snippet on click and pops toward the camera on hover. */
function CodeWindow({ position, rotation, start, reduce, size = 1 }: { position: V3; rotation: V3; start: number; reduce: boolean; size?: number }) {
  const C = useScene();
  const code = useCode();
  const idx = useRef(start);
  // Colours follow the theme via useScreenPalette, so they don't recreate the texture
  const screen = useMemo(() => createCodeTexture(WINDOW_SNIPPETS[start], { width: 560, height: 360, fontSize: 22, palette: code }), [start]);
  const group = useRef<Group>(null);
  const hovered = useRef(false);
  const flip = useRef(0);
  const progress = useRef(reduce ? 1 : 0);
  const sinceDraw = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => () => screen.dispose(), [screen]);
  useEffect(() => {
    document.fonts?.ready.then(() => {
      screen.draw(progress.current);
      invalidate();
    });
  }, [screen, invalidate]);
  useScreenPalette(screen, progress);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const target = (hovered.current ? 1.12 : 1) * size;
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, delta * 8));
    if (flip.current > 0) {
      flip.current = Math.max(0, flip.current - delta * 2.2);
      g.rotation.y = rotation[1] + (1 - flip.current) * Math.PI * 2;
    }
    if (progress.current < 1) {
      sinceDraw.current += delta;
      if (sinceDraw.current > 0.07) {
        sinceDraw.current = 0;
        progress.current = Math.min(1, progress.current + 0.06);
        screen.draw(progress.current);
      }
    }
  });

  return (
    <Float speed={reduce ? 0 : 1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <group
        ref={group}
        position={position}
        rotation={rotation}
        scale={size}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          setCursor(e, 'Next');
        }}
        onPointerOut={(e) => {
          hovered.current = false;
          setCursor(e, null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          idx.current = (idx.current + 1) % WINDOW_SNIPPETS.length;
          screen.setSnippet(WINDOW_SNIPPETS[idx.current]);
          progress.current = reduce ? 1 : 0;
          screen.draw(progress.current);
          if (!reduce) flip.current = 1;
          invalidate();
        }}
      >
        <Box args={[1.22, 0.8, 0.04]} color={C.ink} />
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.16, 0.74]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

/** Clickable objects that do a little hop-and-spin. */
function Toy({ children, position, size, reduce }: { children: ReactNode; position: V3; size: number; reduce: boolean }) {
  const ref = useRef<Group>(null);
  const kick = useRef(0);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    if (!reduce) g.rotation.y += delta * 0.35;
    if (kick.current > 0) {
      kick.current = Math.max(0, kick.current - delta * 1.6);
      const k = kick.current;
      g.position.y = position[1] + Math.sin((1 - k) * Math.PI) * 0.45;
      g.rotation.x = (1 - k) * Math.PI * 2;
    }
  });
  return (
    <Float speed={reduce ? 0 : 1.8} floatIntensity={0.8} rotationIntensity={0.4}>
      <group
        ref={ref}
        position={position}
        scale={size}
        onPointerOver={(e) => {
          e.stopPropagation();
          setCursor(e, 'Poke');
        }}
        onPointerOut={(e) => setCursor(e, null)}
        onClick={(e) => {
          e.stopPropagation();
          if (!reduce && kick.current === 0) kick.current = 1;
        }}
      >
        {children}
      </group>
    </Float>
  );
}

function Database() {
  const C = useScene();
  return (
    <group scale={0.9}>
      {[0, 0.2, 0.4].map((y, i) => (
        <Cyl key={y} args={[0.26, 0.26, 0.16, 28]} color={i === 1 ? C.paper : C.accent} position={[0, y, 0]} />
      ))}
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const C = useScene();
  const ref = useRef<ThreePoints>(null);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 1] = Math.random() * 4.5 - 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    g.setAttribute('position', new BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={C.accent} size={0.035} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={AdditiveBlending} />
    </points>
  );
}

/* ─── Camera rig: pointer parallax read from a ref (no React state) ──── */
type PointerState = { x: number; y: number; active: boolean };

/** Rest pose of the camera — shared by the Canvas, the rig and the layout maths. */
const CAM = { y: 1.75, z: 7.4, fov: 34, lookY: 0.55 };

/** World y where a canvas row (0 = top edge, 1 = bottom edge) meets the z = 0 plane. */
function rowToWorldY(row: number) {
  const pitch = Math.atan((CAM.y - CAM.lookY) / CAM.z);
  const ray = Math.atan((1 - 2 * row) * Math.tan((CAM.fov * Math.PI) / 360)) - pitch;
  return CAM.y + CAM.z * Math.tan(ray);
}

function Rig({ pointer, reduce }: { pointer: MutableRefObject<PointerState>; reduce: boolean }) {
  const look = useMemo(() => new Vector3(0, CAM.lookY, 0), []);
  useFrame(({ camera, clock }, delta) => {
    const k = Math.min(1, delta * 2.5);
    const t = clock.elapsedTime;
    const p = pointer.current;
    const px = reduce ? 0 : p.active ? p.x : Math.sin(t * 0.25) * 0.5;
    const py = reduce ? 0 : p.active ? p.y : Math.cos(t * 0.2) * 0.25;
    camera.position.x += (px * 0.9 - camera.position.x) * k;
    camera.position.y += (CAM.y + py * 0.35 - camera.position.y) * k;
    camera.lookAt(look);
  });
  return null;
}

/** Where the hero copy sits, as fractions of the canvas height (0 = top edge). */
export interface SceneBounds {
  /** bottom of the name */
  name: number;
  /** top of the intro copy (left) */
  intro: number;
  /** top of the location tag (right) — equals `floor` when the tag is hidden */
  tag: number;
  /** top of the band, or the canvas bottom if that comes first */
  floor: number;
}

// Desk extents above / below its top surface, in desk units
const DESK_TOP = 1.54;
const DESK_LEGS = 1.35;

interface Layout {
  desk: { position: V3; scale: number };
  windows: { position: V3; rotation: V3; size: number }[];
  toy: number;
  database: V3 | null;
  ico: V3 | null;
  torus: V3;
}

/**
 * Everything is placed around the hero copy, never over the name: the monitor's
 * top edge sits just under the name, and the desk shrinks rather than run into
 * the location tag or the band. Wide canvases tuck the floating pieces into the
 * gaps beside and above the name; narrow (portrait) canvases let the desk fill
 * the width and flank the monitor with the windows.
 */
function useLayout(tier: RenderTier, bounds: SceneBounds): Layout {
  const viewport = useThree((s) => s.viewport);
  const size = useThree((s) => s.size);
  return useMemo(() => {
    const name = rowToWorldY(bounds.name);
    const ceiling = name - 0.12;
    const fit = Math.min(
      // the feet may dip just behind the band…
      (ceiling - rowToWorldY(bounds.floor)) / (DESK_TOP + 0.9 * DESK_LEGS),
      // …but the desk's front edge stays above the tag (only the legs pass behind it)
      (ceiling - rowToWorldY(bounds.tag)) / (DESK_TOP + 0.35),
    );

    if (size.width / size.height < 1.3) {
      const k = Math.max(0.3, Math.min(1.15, viewport.width / 4.6, fit));
      return {
        desk: { position: [0, ceiling - DESK_TOP * k, 0], scale: k },
        windows: [
          { position: [-1.75 * k, ceiling - 0.35 * k, 0], rotation: [0, 0.3, 0.04], size: 0.55 * k },
          { position: [1.75 * k, ceiling - 0.45 * k, 0], rotation: [0, -0.3, -0.03], size: 0.55 * k },
        ],
        toy: k,
        database: null,
        ico: null,
        torus: [-1.95 * k, ceiling - 1.1 * k, -0.2],
      };
    }
    const s = Math.min(1, viewport.width / 7.4);
    const k = Math.max(0.3, Math.min(0.95 * s, fit));
    // Gap under the first name (its bottom sits ~0.7 above the surname's) and above the intro
    const nook = { top: name + 0.7, bottom: rowToWorldY(bounds.intro) };
    const windows: Layout['windows'] = [
      {
        position: [-2.2 * s, (nook.top + nook.bottom) / 2, 0],
        rotation: [0, 0.35, 0.04],
        size: Math.max(0.4, Math.min(0.85 * s, (nook.top - nook.bottom - 0.15) / 0.8)),
      },
      { position: [1.3 * s, name + 1.45, -0.2], rotation: [0, -0.4, -0.03], size: 0.8 * s },
    ];
    if (tier === 'full') windows.push({ position: [3.25 * s, name + 1.2, -0.4], rotation: [0, -0.5, 0.05], size: 0.75 * s });
    return {
      desk: { position: [-0.15 * s, ceiling - DESK_TOP * k, 0], scale: k },
      windows,
      toy: s,
      database: [2.85 * s, name - 0.6, 0.3],
      ico: [0.45 * s, name + 1.55, -1.0],
      torus: [-0.45 * s, name + 1.4, -0.6],
    };
  }, [viewport.width, size.width, size.height, tier, bounds.name, bounds.intro, bounds.tag, bounds.floor]);
}

function World({
  tier,
  reduce,
  pointer,
  bounds,
}: {
  tier: RenderTier;
  reduce: boolean;
  pointer: MutableRefObject<PointerState>;
  bounds: SceneBounds;
}) {
  const C = useScene();
  const desk = useRef<Group>(null);
  const layout = useLayout(tier, bounds);
  useFrame((_, delta) => {
    if (!desk.current || reduce) return;
    const target = pointer.current.x * 0.18;
    desk.current.rotation.y += (target - desk.current.rotation.y) * Math.min(1, delta * 2);
  });
  return (
    <>
      <Rig pointer={pointer} reduce={reduce} />
      <ambientLight intensity={1.1} />
      {/* props, not args: a theme change then recolours the light instead of rebuilding it */}
      <hemisphereLight color="#fff6ea" groundColor={C.accent} intensity={0.6} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.4} />
      <pointLight position={[-3.5, 1.5, 2]} color={C.accent} intensity={6} distance={8} />
      <group ref={desk} position={layout.desk.position} scale={layout.desk.scale} rotation={[0, -0.12, 0]}>
        <Desk reduce={reduce} />
      </group>
      {layout.windows.map((w, i) => (
        <CodeWindow key={i} position={w.position} rotation={w.rotation} size={w.size} start={i} reduce={reduce} />
      ))}
      {layout.database && (
        <Toy position={layout.database} size={layout.toy} reduce={reduce}>
          <Database />
        </Toy>
      )}
      {layout.ico && (
        <Toy position={layout.ico} size={layout.toy} reduce={reduce}>
          <mesh>
            <icosahedronGeometry args={[0.24, 0]} />
            <Toon color={C.paper} />
            <Ink />
          </mesh>
        </Toy>
      )}
      <Toy position={layout.torus} size={layout.toy} reduce={reduce}>
        <mesh>
          <torusGeometry args={[0.2, 0.075, 14, 32]} />
          <Toon color={C.accent} />
          <Ink />
        </mesh>
      </Toy>
      <Particles count={tier === 'full' ? 140 : 50} />
    </>
  );
}

export interface HeroSceneProps {
  tier: Exclude<RenderTier, 'none'>;
  reduce: boolean;
  bounds: SceneBounds;
}

export default function HeroScene({ tier, reduce, bounds }: HeroSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });
  const [inView, setInView] = useState(true);
  const theme = useTheme();

  // Pointer tracked across the whole window so the parallax works over DOM text too
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current.active = true;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Stop rendering entirely when the hero is off screen
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} data-scene-host className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={tier === 'full' ? [1, 1.5] : [1, 1.4]}
        camera={{ position: [0, CAM.y, CAM.z], fov: CAM.fov, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
        // Measure layout size only, and never on scroll. The hero's GSAP transforms
        // (intro scale, scroll parallax) would otherwise read as resizes and
        // reallocate the drawing buffer + relayout the scene mid-scroll.
        resize={{ scroll: false, offsetSize: true }}
        frameloop={inView ? (reduce ? 'demand' : 'always') : 'never'}
        style={{ touchAction: 'pan-y' }}
      >
        <TierCtx.Provider value={tier}>
          <PaletteCtx.Provider value={THEMES[theme]}>
            <World tier={tier} reduce={reduce} pointer={pointer} bounds={bounds} />
          </PaletteCtx.Provider>
        </TierCtx.Provider>
      </Canvas>
    </div>
  );
}
