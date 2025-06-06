function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}
function draw() {
  background(255);
  for (var y = 0; y <= 1000; y = y + 500) {
    for (var x = 0; x <= 1000; x = x + 500) {
      noFill();
      stroke(255, 147, 206);
      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      box(200, 200, 200);
    }
  }
}
