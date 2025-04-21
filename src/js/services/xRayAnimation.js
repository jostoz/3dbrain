isActive(status) {
    if (status) {
        const progress = { p: 0.0 };
        gsap.fromTo(progress, {
            p: 0.0,
            duration: 2.5,
            ease: Power2.easeInOut,
            onUpdate: () => {
                this.xRayMaterial.uniforms.uAlpha.value = progress.p;
            },
 