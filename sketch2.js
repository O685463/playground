const sketch2 = (p) => { // スケッチ全体を関数で囲み、引数 p を受け取る

  let numSegments = 10;
  let angleIncrement;
  let currentHue = 0;

  let particles = [];
  const detailType = 'dots';

  const globalLifespanFactor = 3.0;
  const globalThickness = 0.15;

  p.setup = () => { // setup の前に p. を付ける
    p.createCanvas(p.windowWidth, p.windowHeight); // p5.jsの関数は p. を付ける
    p.colorMode(p.HSB, 360, 100, 100, 100);
    angleIncrement = p.TWO_PI / numSegments;
    p.background(0, 0, 5);
  };

  p.draw = () => { // draw の前に p. を付ける
    p.background(0, 0, 5, 3);
    p.translate(p.width / 2, p.height / 2);
    currentHue = (currentHue + 1.2) % 360;

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    let mouseMoved = (p.mouseX !== p.pmouseX || p.mouseY !== p.pmouseY);
    let currentPoint, previousPoint, speed;

    if (mouseMoved) {
      currentPoint = p.createVector(p.mouseX - p.width / 2, p.mouseY - p.height / 2);
      previousPoint = p.createVector(p.pmouseX - p.width / 2, p.pmouseY - p.height / 2);
      speed = p.dist(currentPoint.x, currentPoint.y, previousPoint.x, previousPoint.y);
      
      let particlesToEmit = p.map(speed, 0, 25, 1, 2); 
      particlesToEmit = p.constrain(Math.ceil(particlesToEmit), 1, 2);

      for (let k = 0; k < particlesToEmit; k++) {
        if (detailType === 'dots') { 
          particles.push(new DotParticle(currentPoint.x, currentPoint.y, currentHue));
        }
      }
    }

    for (let i = 0; i < numSegments; i++) {
      p.push();
      p.rotate(i * angleIncrement);
      for (let pt of particles) { // 変数名を p から pt に変更
        pt.displayMirrored();
      }
      p.pop();
    }
  };

  class DotParticle {
    constructor(x, y, baseHue) {
      this.pos = p.createVector(x, y); // p. を付ける
      this.vel = p5.Vector.random2D().mult(p.random(0.2, 0.8)); // p. を付ける
      let baseLifespan = p.random(30, 60);
      this.lifespan = baseLifespan * globalLifespanFactor;
      this.initialLifespan = this.lifespan;
      this.hue = (baseHue + p.random(-25, 25) + 360) % 360;
      this.sat = p.random(70, 100);
      this.bri = p.random(90, 100);
      this.baseAlpha = p.random(60, 90);
      
      this.size = globalThickness; 
      this.glowSizeMultiplier = 4.0; 
      this.glowAlphaMultiplier = 0.30; 
    }
    update() { this.pos.add(this.vel); this.lifespan -= 1; }
    _actualDisplay() {
      let currentAlpha = p.map(this.lifespan, 0, this.initialLifespan, 0, this.baseAlpha);
      if (currentAlpha <= 0.01) return;
      p.noStroke(); 

      let glowRadius = p.max(this.size * this.glowSizeMultiplier, this.size + 0.8); 
      let glowAlpha = currentAlpha * this.glowAlphaMultiplier;
      p.fill(this.hue, this.sat * 0.7, p.min(this.bri * 1.1, 100), glowAlpha); 
      p.ellipse(this.pos.x, this.pos.y, glowRadius, glowRadius);

      p.fill(this.hue, this.sat, this.bri, currentAlpha);
      p.ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }
    displayMirrored() { p.push(); this._actualDisplay(); p.scale(1, -1); this._actualDisplay(); p.pop(); }
    isDead() { return this.lifespan <= 0; }
  }

  // VineParticleクラスも同様に p. を付ける必要がありますが、このスケッチでは
  // 'dots' 固定で使われていないため、今回は修正を省略します。
  // もしVineParticleを使う場合は、kaleidoscopeSketch.jsのように修正が必要です。

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 5);
    particles = [];
  };

}; // 最後にスケッチ関数を閉じる
// 不要な括弧は削除
