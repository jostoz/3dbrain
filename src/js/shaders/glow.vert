uniform vec3 viewVector;
uniform float c;
uniform float p;
uniform float uTime;
uniform float uSlowTime;
uniform float uBubblesUp;
uniform bool uIsFlashing;
uniform vec2 uMouse;
uniform bool isWinnerActive;
uniform float uWinnerSelected;
uniform float uWinnerAlpha;
uniform float uFlashingAlpha;
uniform float uTransitionProgress;
varying float intensity;
varying vec4 vMemory;
attribute vec3 position;
attribute vec3 color;
attribute float size;
attribute vec4 bubbles;
attribute vec4 aMemory;
attribute vec2 aDelayDuration;
varying vec3 vColor;
varying float vAlpha;
varying vec4 vBubbles;

float easeExpoInOut(float p) {
    return ((p *= 2.0) < 1.0) ? 0.5 * pow(2.0, 10.0 * (p - 1.0)) : 0.5 * (2.0 - pow(2.0, -10.0 * (p - 1.0)));
}

void main()
{
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;

	float intensity = 0.0;
	float alpha = 0.0;
	vColor = color;
	vBubbles = bubbles;
	vMemory = aMemory;

	// Transición general
	if (uTransitionProgress > 0.0) {
		// Efecto de zoom
		float scale = 1.0 + (uTransitionProgress * 0.5);
		gl_PointSize = size * scale;
		
		// Efecto de movimiento durante la transición
		vec3 transitionOffset = normalize(position) * uTransitionProgress * 10.0;
		gl_Position.xyz += transitionOffset;
		
		// Ajustar alpha para fade
		alpha = mix(alpha, 1.0, uTransitionProgress);
	}

	// Manejo de burbujas normales
	if(bubbles.w == 0.0) {
		alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 0.6);
		gl_PointSize = size;
	}

	// Manejo de burbujas flotantes
	if(bubbles.w == 1.0) {
		alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 0.6);
		gl_PointSize = size + 30.0;

        gl_PointSize = uBubblesUp * gl_PointSize;
		float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
		vec3 tranlated = mix(position, bubbles.xyz, normalized);
		vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
        gl_Position +=  projectionMatrix * bPosition ;
    }

	// Manejo de memorias
    if(bubbles.w == 2.0) {
           alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 0.6);
           gl_PointSize = size + 60.0;

           gl_PointSize = uBubblesUp * gl_PointSize;
           float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
           vec3 tranlated = mix(position, bubbles.xyz, normalized);
           vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
           gl_Position +=  projectionMatrix * bPosition ;
    }

	// Manejo del ganador
      if(bubbles.w == 3.0) {
               alpha = clamp(abs(sin(uTime - bubbles.y)), 0.3, 1.0);
               gl_PointSize = size + 90.0;

               gl_PointSize = uBubblesUp * gl_PointSize;
               float normalized = clamp(uBubblesUp, 0.0, 2.0)* 2.0;
               vec3 tranlated = mix(position, bubbles.xyz, normalized);
               vec4 bPosition = modelViewMatrix * vec4( tranlated, 1.0 );
               gl_Position +=  projectionMatrix * bPosition ;
        }

	// Mostrar solo la sección activa del cerebro
    if(aMemory.w == uWinnerSelected && isWinnerActive){
        vMemory = aMemory;
        intensity = 0.9;
	} else if(bubbles.w != 2.0 && bubbles.w != 3.0 && isWinnerActive) {
        alpha = mix(1.0, 0.0, uWinnerAlpha);
    }

	// Efecto de flash
	if(uIsFlashing) {
		alpha = mix(alpha, 1.0, uFlashingAlpha);
	}

	vAlpha = alpha;
}