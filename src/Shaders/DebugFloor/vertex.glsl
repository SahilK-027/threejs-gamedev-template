#include <common>
#include <fog_pars_vertex>
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
    vec4 localSpacePosition = vec4(position, 1.0);
    vec4 worldPosition = modelMatrix * localSpacePosition;
    vUv = uv;
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
}
