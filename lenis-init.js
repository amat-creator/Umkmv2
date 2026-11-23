// ===== Lenis: smooth scroll (level window/dokumen, tidak mengubah struktur DOM tiap render) =====
window.addEventListener('load', () => {
    if (!window.Lenis) return;
    window._lenis = new Lenis({ smoothWheel: true, autoRaf: false });
    if (window.gsap) {
        gsap.ticker.add((t) => window._lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        const raf = (t) => { window._lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }
});
