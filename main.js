// main.js

// ES6モジュールとしてインポートする場合
// import { kaleidoscopeSketch } from './kaleidoscopeSketch.js';
// import { s2 } from './sketch2.js'; // 別のスケッチも同様にインポート

// ES6モジュールを使用しない場合（全てのスケッチ関数を同じファイルに記述するか、HTMLで順番に読み込む場合）
// ここでは、仮に `kaleidoscopeSketch` がグローバルスコープにあると仮定します。
// （例: HTMLで <script src="kaleidoscopeSketch.js"></script> を main.js の前に置く）

let currentP5Instance = null;
const sketchContainer = document.getElementById('p5-canvas-container');

// スケッチのマッピング
const sketches = {
    'kaleidoscope': kaleidoscopeSketch, // `kaleidoscopeSketch.js` からインポートした関数
    // 'anotherSketch': s2 // 他のスケッチがあればここに追加
};

function loadSketch(sketchName) {
    if (currentP5Instance) {
        currentP5Instance.remove();
        currentP5Instance = null;
    }
    sketchContainer.innerHTML = ''; // コンテナをクリア

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

    // 初期ロードするスケッチを設定 (今回は万華鏡)
    loadSketch('kaleidoscope');
});
