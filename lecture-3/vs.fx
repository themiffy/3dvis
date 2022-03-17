#version 300 es

in vec2 a_position;
uniform mat3 transform;
out vec2 uv;

void main() {
    uv = a_position;
    vec3 pos = transform * vec3(a_position, 1.0);
    gl_Position = vec4(pos, 1.0);
}