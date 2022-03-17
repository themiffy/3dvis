#version 300 es
precision highp float;

in vec2 uv;
uniform sampler2D u_texture;
uniform sampler2D u_lut;
uniform vec2 bw;
out vec4 color;

void main() {
    vec2 uv2 = step(0.0, uv) - (1.0 - step(uv, vec2(1.0)));
    float cropValue = min(uv2.x, uv2.y); // 1.0 inside texture; 0.0 - outside
    float val = cropValue * texture(u_texture, uv).r;
    val = (val - bw.x) / (bw.y - bw.x);
    //color = vec4(val, val, val, 1.0);
    color = texture(u_lut, vec2(val, 0.5));
}