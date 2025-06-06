// main.js

let currentP5Instance = null;
const sketchContainer = document.getElementById('p5-canvas-container');

// ▼▼▼▼▼ 修正点：スケッチの対応表にsketch2とsketch3を追加 ▼▼▼▼▼
const sketches = {
    'kaleidoscope': kaleidoscopeSketch,
    'sketch2': sketch2,
    'sketch3': sketch3
};
// ▲▲▲▲▲ 修正点ここまで ▲▲▲▲▲

function loadSketch(sketchName) {
    if (currentP5Instance) {
        currentP5Instance.remove();
        currentP5Instance = null;
    }
    sketchContainer.innerHTML = '';

    const sketchFunction = sketches[sketchName];
    if (sketchFunction) {
        currentP5Instance = new p5(sketchFunction, sketchContainer);
        console.log(`Loaded sketch: ${sketchName}`);
    } else {
        console.error(`Sketch not found: ${sketchName}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.getElementById('nav-links');
    navLinks.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            const sketchToLoad = event.target.dataset.sketch;
            if (sketchToLoad) {
                loadSketch(sketchToLoad);
            }
        }
    });

    // 初期ロードするスケッチを設定
    loadSketch('kaleidoscope');
});
