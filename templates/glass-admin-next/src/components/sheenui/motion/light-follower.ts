export function createLightFollower(apply: (x: number, y: number) => void) {
  const TAU = 70;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;
  let primed = false;
  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    const k = 1 - Math.exp(-Math.min(64, now - last) / TAU);
    last = now;
    cx += (tx - cx) * k;
    cy += (ty - cy) * k;
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.25) {
      apply(cx, cy);
      raf = requestAnimationFrame(tick);
    } else {
      cx = tx;
      cy = ty;
      raf = 0;
      apply(cx, cy);
    }
  };
  return {
    /** Moves the target; the first call after `reset()` jumps straight there. */
    to(x: number, y: number) {
      tx = x;
      ty = y;
      if (!primed) {
        primed = true;
        cx = x;
        cy = y;
        apply(x, y);
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
    /** Forgets the position (the pointer left): the next `to` jumps instead of gliding in from far away. */
    reset() {
      primed = false;
    },
    /** Cancels the pending frame. */
    stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
