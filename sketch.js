function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(255); // 白い背景
  for (var y = 0; y <= 1000; y = y + 500) {
    for (var x = 0; x <= 1000; x = x + 500) {
      noFill(); // 塗りつぶしなし
      stroke(255, 147, 206); // ピンク色の線
      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      box(200, 200, 200);
    }
  }
}
