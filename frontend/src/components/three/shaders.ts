/**
 * GLSL for the hero object.
 *
 * The form is a sphere pushed around by 3D simplex noise. Normals are
 * recomputed from the displaced surface (two tangent samples + a cross
 * product) so the lighting actually follows the deformation — without that
 * it reads as a flat sticker, which is the usual tell of a quick WebGL demo.
 */

/* Ashima Arts simplex noise (MIT) — the standard implementation. */
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const blobVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uPointer;
uniform vec2  uMouse;

varying vec3  vNormal;
varying vec3  vView;
varying float vDisp;

${SIMPLEX}

float fbm(vec3 p) {
  return (snoise(p) + 0.5 * snoise(p * 2.07)) / 1.5;
}

float displace(vec3 p) {
  vec3 q = p * uFreq + vec3(0.0, uTime * 0.14, uTime * 0.08);
  float d = fbm(q);

  // The pointer pulls a soft bulge toward whichever side the cursor is on.
  vec3 dir = normalize(vec3(uMouse * 1.35, 1.0));
  float bulge = pow(max(dot(normalize(p), dir), 0.0), 3.0);

  return d + bulge * uPointer * 0.5;
}

void main() {
  float d = displace(position);
  vDisp = d;

  vec3 dispPos = position + normal * d * uAmp;

  // Rebuild the normal from the deformed surface.
  vec3 helper = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(normal, helper));
  vec3 t2 = normalize(cross(normal, t1));

  float e = 0.045;
  vec3 pA = normalize(position + t1 * e);
  vec3 pB = normalize(position + t2 * e);
  vec3 dispA = pA + pA * displace(pA) * uAmp;
  vec3 dispB = pB + pB * displace(pB) * uAmp;

  vec3 n = normalize(cross(dispA - dispPos, dispB - dispPos));
  if (dot(n, normal) < 0.0) n = -n;

  vNormal = normalize(normalMatrix * n);

  vec4 world = modelMatrix * vec4(dispPos, 1.0);
  vView = normalize(cameraPosition - world.xyz);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const blobFragment = /* glsl */ `
uniform vec3  uAcid;
uniform vec3  uBone;
uniform float uFade;

varying vec3  vNormal;
varying vec3  vView;
varying float vDisp;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);

  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.1);

  // A single key light — enough to read the volume, not enough to look plastic.
  vec3  L = normalize(vec3(-0.45, 0.75, 0.55));
  float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);

  vec3 base = mix(vec3(0.030, 0.031, 0.035), vec3(0.105, 0.110, 0.105), diff);
  base += uBone * pow(diff, 7.0) * 0.12;

  vec3 col = base + uAcid * fres * 0.85;
  col += uAcid * smoothstep(0.40, 1.0, vDisp) * 0.09;

  gl_FragColor = vec4(col * uFade, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uFade;
attribute float aScale;
attribute float aSeed;
varying float vAlpha;

void main() {
  vec3 p = position;

  // Slow orbital drift so the field never looks frozen or uniformly rotating.
  float t = uTime * 0.08 + aSeed * 6.2831;
  p.x += sin(t) * 0.08;
  p.y += cos(t * 0.9) * 0.08;
  p.z += sin(t * 1.3) * 0.06;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (1.0 / -mv.z);

  vAlpha = (0.25 + 0.75 * abs(sin(t * 1.7))) * uFade;
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(uColor, a);
}
`;
