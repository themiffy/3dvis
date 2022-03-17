#version 300 es

in vec2 a_position;
uniform mat4 transform;
uniform mat4 worldViewProjection;
out vec3 uv;

void main() {
    uv = (transform * vec4(a_position, 0.0, 1.0)).xyz;
    gl_Position = worldViewProjection * vec4(a_position, 0.0, 1.0);
}