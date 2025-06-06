// main.js

// スケッチの定義をここにインポートするか、グローバルスコープで利用可能にする
// 例:
// import { s1 } from './sketch1.js'; // ES6モジュールの場合
// import { s2 } from './sketch2.js';
// import { s3 } from './sketch3.js'; // 必要に応じて

// P5.jsインスタンスを保持する変数
let currentP5Instance = null;
const sketchContainer = document.getElementById('p5-canvas-container');

// スケッチのマッピング (ファイル名とP5.jsの関数)
// 実際のプロジェクトでは、これらのスケッチ関数を別々のファイルからインポートします
const sketches = {
    // 例: sketch1.jsから s1 をインポートした場合
    'sketch1': s1,
    'sketch2': s2,
    'sketch3': s3 // 必要に応じて
};

// スケッチをロードする関数
function loadSketch(sketchName) {
    // 既存のP5.jsインスタンスがあれば停止して削除
    if (currentP5Instance) {
        currentP5Instance.remove(); // キャンバスとイベントリスナーをクリーンアップ
        currentP5Instance = null;
    }

    // コンテナ内の以前のキャンバスを完全にクリア
    sketchContainer.innerHTML = '';

    // 新しいスケッチのP5.jsインスタンスを生成
    const sketchFunction = sketches[sketchName];
    if (sketchFunction) {
        // 新しいP5.jsインスタンスを作成し、指定されたコンテナに紐付ける
        currentP5Instance = new p5(sketchFunction, sketchContainer);
        console.log(`Loaded sketch: ${sketchName}`);
    } else {
        console.error(`Sketch not found: ${sketchName}`);
    }
}

// ページロード時に最初のスケッチをロード
document.addEventListener('DOMContentLoaded', () => {
    // ナビゲーションリンクがクリックされたときの処理を設定
    const navLinks = document.getElementById('nav-links');
    navLinks.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') { // クリックされたのがaタグなら
            event.preventDefault(); // リンクのデフォルト動作（ページ遷移）をキャンセル
            const sketchToLoad = event.target.dataset.sketch; // data-sketch属性からスケッチ名を取得
            if (sketchToLoad) {
                loadSketch(sketchToLoad);
            }
        }
    });

    // 初期ロードするスケッチを設定 (例: 'sketch1')
    loadSketch('sketch1');
});

// P5.jsのスケッチ関数がこのファイルから参照できるように、グローバルスコープに定義するか、
// このファイル自体にインポート/ペーストしてください。
// 例:
// const s1 = (p) => { ... };
// const s2 = (p) => { ... };
// const s3 = (p) => { ... };
// または、<script type="module" src="main.js"></script> でインポートする方法:
// main.js の冒頭に import { s1 } from './sketch1.js'; などを追加し、
// HTMLの script タグに type="module" を追加する必要があります。
