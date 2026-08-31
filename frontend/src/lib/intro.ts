/**
 * Tiny handshake between the preloader and the hero.
 *
 * The hero's entrance timeline must not start while the loading curtain is
 * still covering the screen, but the two components are siblings — so they
 * meet on a promise instead of a shared parent.
 */

let resolveIntro: (() => void) | null = null;

export const introDone: Promise<void> =
  typeof window === "undefined"
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        resolveIntro = resolve;
      });

let settled = false;

export function completeIntro() {
  if (settled) return;
  settled = true;
  resolveIntro?.();
}

export const INTRO_SEEN_KEY = "st_intro_seen";

export function hasSeenIntro() {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* private mode — just show it again */
  }
}
