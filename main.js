let currentSketchInstance = null;
const sketchContainer = document.getElementById('sketch-container');

const sketches = {
    'kaleidoscope': { type: 'p5', sketch: kaleidoscopeSketch },
    'sketch2': { type: 'p5', sketch: sketch2 },
    'sketch3': { type: 'p5', sketch: sketch3 },
    'cube': { type: 'three', sketch: threeCube }
};

function loadSketch(sketchName) {
    // Cleanup previous sketch
    if (currentSketchInstance) {
        if (currentSketchInstance.destroy) {
            // For three.js or custom objects with a destroy method
            currentSketchInstance.destroy();
        } else if (currentSketchInstance.remove) {
            // For p5.js instances
            currentSketchInstance.remove();
        }
        currentSketchInstance = null;
    }
    sketchContainer.innerHTML = '';

    const sketchInfo = sketches[sketchName];
    if (sketchInfo) {
        if (sketchInfo.type === 'p5') {
            currentSketchInstance = new p5(sketchInfo.sketch, sketchContainer);
        } else if (sketchInfo.type === 'three') {
            currentSketchInstance = sketchInfo.sketch(sketchContainer);
        }
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

    // Load the default sketch
    loadSketch('kaleidoscope');
});