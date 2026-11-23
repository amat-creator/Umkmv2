// ===== GSAP: transisi halus tiap kali render() mengganti isi halaman =====
// Dibungkus di luar window.render asli supaya tidak mengubah logic render itu sendiri.
(function () {
    const _renderBeforeFx = window.render;
    window.render = () => {
        const _changed = window._lastView !== state.view;
        _renderBeforeFx();
        if (window.gsap) {
            const app = document.getElementById('app');
            if (app && app.children.length) {
                gsap.fromTo(app.children, { opacity: 0, y: _changed ? 14 : 6 },
                    { opacity: 1, y: 0, duration: _changed ? 0.45 : 0.3, ease: 'power2.out', stagger: 0.02, clearProps: 'opacity,transform', overwrite: true });
            }
        }
    };
})();
