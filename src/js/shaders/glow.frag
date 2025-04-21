uniform vec3 glowColor;
uniform float c;
uniform float p;
uniform float uTime;
uniform float uTransitionProgress;

varying vec3 vColor;
varying float vAlpha;
varying vec4 vBubbles;
varying vec4 vMemory;

void main() {
    float r = 0.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);

    if (r > 1.0) {
        discard;
    }

    // Efecto de transición
    vec3 finalColor = glowColor;
    float finalAlpha = vAlpha;

    if (uTransitionProgress > 0.0) {
        // Efecto de color durante la transición
        finalColor = mix(glowColor, vec3(1.0), uTransitionProgress);
        
        // Efecto de brillo durante la transición
        float glow = (1.0 - r) * (1.0 + uTransitionProgress);
        finalAlpha = mix(vAlpha, glow, uTransitionProgress);
    }

    // Aplicar efectos de partículas
    float intensity = pow((1.0 - r), c) * p;
    
    gl_FragColor = vec4(finalColor * intensity, finalAlpha);
}