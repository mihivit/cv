
document.addEventListener('DOMContentLoaded', () => {
    const cursorOutline = document.getElementById('cursor-outline');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // --- CORE CURSOR MOVEMENT ---
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        // Smooth Follow for the outline
        outlineX += (mouseX - outlineX) * 0.2;
        outlineY += (mouseY - outlineY) * 0.2;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;

        requestAnimationFrame(animateCursor);
    };

    // --- MAGNETIC EFFECT LOGIC ---
    const magneticElements = document.querySelectorAll('a, button, .tool-icon, .tab, .control, .panel-header, .layer-item');

    magneticElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            const rect = elem.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            outlineX = centerX;
            outlineY = centerY;
            cursorOutline.classList.add('magnetic-active');
        });

        elem.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('magnetic-active');
        });
    });

    // --- INITIALIZATION ---
    animateCursor();

    // Listen for color updates from script.js
    document.addEventListener('colorUpdated', (e) => {
        const { r, g, b } = e.detail;
        cursorOutline.style.borderColor = `rgb(${r}, ${g}, ${b})`;
    });
});
