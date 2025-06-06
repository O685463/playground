const sketch3 = (p) => {

  let numSegments = 10;
  let angleIncrement;
  let currentHue = 0;

  let particles = [];
  const detailType = 'dots';

  const globalLifespanFactor = 3.0;
  const globalThickness = 0.15;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    angleIncrement = p.TWO_PI / numSegments;
    p.background(0, 0, 5);
  };

  p.draw = () => {
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
          // ▼▼▼ 修正点：クラスにp5インスタンス(p)を渡す ▼▼▼
          particles.push(new DotParticle(p, currentPoint.x, currentPoint.y, currentHue));
        }
      }
    }

    for (let i = 0; i < numSegments; i++) {
      p.push();
      p.rotate(i * angleIncrement);
      for (let pt of particles) {
        pt.displayMirrored();
      }
      p.pop();
    }
  };

  class DotParticle {
    // ▼▼▼ 修正点：コンストラクタでp5インスタンス(pInstance)を受け取る ▼▼▼
    constructor(pInstance, x, y, baseHue) {
      this.p = pInstance; // pをクラス内で使えるように保持
      this.pos = this.p.createVector(x, y); // p.ではなくthis.p.を使う
      this.vel = this.p.constructor.Vector.random2D().mult(this.p.random(0.2, 0.8));
      let baseLifespan = this.p.random(30, 60);
      this.lifespan = baseLifespan * globalLifespanFactor;
      this.initialLifespan = this.lifespan;
      this.hue = (baseHue + this.p.random(-25, 25) + 360) % 360;
      this.sat = this.p.random(70, 100);
      this.bri = this.p.random(90, 100);
      this.baseAlpha = this.p.random(60, 90);
      
      this.size = globalThickness; 
      this.glowSizeMultiplier = 4.0; 
      this.glowAlphaMultiplier = 0.30; 
    }
    update() { this.pos.add(this.vel); this.lifespan -= 1; }
    _actualDisplay() {
      // ▼▼▼ 修正点：クラス内のp5関数はすべて this.p 経由で呼び出す ▼▼▼
      let currentAlpha = this.p.map(this.lifespan, 0, this.initialLifespan, 0, this.baseAlpha);
      if (currentAlpha <= 0.01) return;
      this.p.noStroke(); 

      let glowRadius = this.p.max(this.size * this.glowSizeMultiplier, this.size + 0.8); 
      let glowAlpha = currentAlpha * this.glowAlphaMultiplier;
      this.p.fill(this.hue, this.sat * 0.7, this.p.min(this.bri * 1.1, 100), glowAlpha); 
      this.p.ellipse(this.pos.x, this.pos.y, glowRadius, glowRadius);

      this.p.fill(this.hue, this.sat, this.bri, currentAlpha);
      this.p.ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }
    displayMirrored() { this.p.push(); this._actualDisplay(); this.p.scale(1, -1); this._actualDisplay(); this.p.pop(); }
    isDead() { return this.lifespan <= 0; }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 5);
    particles = [];
  };

}; // スケッチ関数の終わり
// ▼▼▼ 修正点：ファイル末尾の不要な括弧を削除 ▼▼▼
