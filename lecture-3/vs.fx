#version 300 es

in vec2 a_position;
uniform mat4 transform;
out vec3 uv;

void main() {
    uv = (transform * vec4(a_position, 0.0, 1.0)).xyz;
    //vec3 pos = transform * vec3(a_position, 1.0);
    //vec3 pos = vec3(2.0 * (a_position - 0.5), 1.0);
    vec3 pos = vec3(2.0 * (a_position - 0.5), 1.0);

    gl_Position = vec4(pos, 1.0);
}