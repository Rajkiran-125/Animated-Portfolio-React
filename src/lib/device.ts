export type RenderTier = 'none' | 'lite' | 'full';

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Decide how much 3D the device gets. Kept deliberately conservative:
 * phones, low core counts and low memory all fall back to the lite scene.
 */
export function detectRenderTier(): RenderTier {
  if (typeof window === 'undefined' || !hasWebGL()) return 'none';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return 'lite';
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 768;
  if (coarse || small || cores <= 4 || memory <= 4) return 'lite';
  return 'full';
}

export function isTouchDevice(): boolean {
  return window.matchMedia('(hover: none), (pointer: coarse)').matches;
}
