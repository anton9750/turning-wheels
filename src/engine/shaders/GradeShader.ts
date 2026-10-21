/**
 * Final colour grade: maps luminance onto a black → olive-gold → cream ramp
 * (the duotone look of the reference), then contrast, vignette and grain.
 */
export const GradeShader = {
  name: 'GradeShader',
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uWarmth: { value: 0.9 },
    uContrast: { value: 1.18 },
    uVignette: { value: 0.7 },
    uGrain: { value: 0.035 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uWarmth;
    uniform float uContrast;
    uniform float uVignette;
    uniform float uGrain;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    vec3 goldRamp(float l) {
      vec3 shadow = vec3(0.0);
      vec3 low    = vec3(0.16, 0.11, 0.02);
      vec3 mid    = vec3(0.62, 0.47, 0.13);
      vec3 high   = vec3(1.0, 0.93, 0.70);
      if (l < 0.25) return mix(shadow, low, l / 0.25);
      if (l < 0.6)  return mix(low, mid, (l - 0.25) / 0.35);
      return mix(mid, high, clamp((l - 0.6) / 0.4, 0.0, 1.0));
    }

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(col, goldRamp(l), uWarmth);
      col = max((col - 0.5) * uContrast + 0.5, 0.0);

      vec2 d = (vUv - 0.5) * vec2(1.15, 1.0);
      float v = smoothstep(0.85, 0.25, length(d));
      col *= mix(1.0, v, uVignette);

      col += (hash(vUv * vec2(1931.0, 1087.0) + fract(uTime * 7.13) * 100.0) - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
