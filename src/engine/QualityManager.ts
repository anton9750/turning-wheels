/** Measures FPS and steps the pixel ratio down/up to keep things smooth. */
export class QualityManager {
  private acc = 0;
  private frames = 0;
  private ratio: number;

  constructor(
    private readonly maxRatio: number,
    private readonly onRatio: (ratio: number) => void,
    private readonly onFps?: (fps: number) => void,
  ) {
    this.ratio = maxRatio;
  }

  get pixelRatio(): number {
    return this.ratio;
  }

  tick(dt: number): void {
    this.acc += dt;
    this.frames++;
    if (this.acc < 1.5) return;
    const fps = this.frames / this.acc;
    this.acc = 0;
    this.frames = 0;
    this.onFps?.(fps);
    if (fps < 42 && this.ratio > 0.6) {
      this.ratio = Math.max(0.6, this.ratio - 0.25);
      this.onRatio(this.ratio);
    } else if (fps > 58 && this.ratio < this.maxRatio) {
      this.ratio = Math.min(this.maxRatio, this.ratio + 0.25);
      this.onRatio(this.ratio);
    }
  }
}
