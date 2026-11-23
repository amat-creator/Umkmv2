// ===== Motion: feedback kecil (scale) saat tombol/kartu ditekan, berlaku ke elemen baru juga =====
window.addEventListener('load', () => {
    if (!window.Motion) return;
    const { animate, press } = window.Motion;
    press('button, [onclick], a', (el) => {
        animate(el, { scale: 0.95 }, { duration: 0.12 });
        return () => animate(el, { scale: 1 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
    });
});
