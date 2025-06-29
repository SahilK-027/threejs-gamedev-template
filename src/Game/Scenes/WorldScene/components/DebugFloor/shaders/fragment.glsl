#include <common>
#include <fog_pars_fragment>

uniform vec3 uColor; // base floor color
uniform vec3 uLineColor; // grid line color
uniform float uGridFrequency; // how many cells across the plane
uniform float uLineWidth; // half‑width of line, in UV‑cell units
uniform float uInnerPatternCount; // how many little “.”s per big cell side (10)
uniform float uInnerPatternWidth; // half‑width of the little “.” stroke
uniform vec3 uInnerPatternLineColor; // color for "."
uniform vec2 uInnerPatternOffset;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
    vec2 st = vUv * uGridFrequency;

    // ——— “.”s pattern inside each cell ———
    vec2 stOffset = st + uInnerPatternOffset;
    vec2 stInner = stOffset * uInnerPatternCount;
    float dxInner = abs(fract(stInner.x));
    float dyInner = abs(fract(stInner.y));
    float dInner = max(dxInner, dyInner);
    float aaInner = fwidth(stInner.x);
    float maskInner = 1.0 - smoothstep(uInnerPatternWidth - aaInner, uInnerPatternWidth + aaInner, dInner);
    vec3 gridColor = mix(uColor, uInnerPatternLineColor, maskInner);

    // ——— Grid ———
    float dx = abs(fract(st.x) - 0.5);
    float dy = abs(fract(st.y) - 0.5);
    float d = min(dx, dy);
    float aa = fwidth(st.x);
    float mask = 1.0 - smoothstep(uLineWidth - aa, uLineWidth + aa, d);
    gridColor = mix(gridColor, uLineColor, mask);

    // ——— Axis helper ———
    // Red: X axis
    // Blue: Z axis
    float d1 = length(vWorldPosition - vec3(0.0, 0.0, 1.0));
    float d2 = length(vWorldPosition - vec3(1.0, 0.0, 0.0));
    vec3 colour = mix(vec3(0.0, 0.0, 1.0), gridColor, smoothstep(0.0, 0.075, d1));
    colour = mix(vec3(1.0, 0.0, 0.0), colour, smoothstep(0.0, 0.075, d2));

    gl_FragColor = vec4(colour, 1.0);
    #include <fog_fragment>
}
