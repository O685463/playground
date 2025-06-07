const sketch2 = (p) => {

  let numSegments = 10;
  let angleIncrement;
  let currentHue = 0;

  let particles = [];
  const detailType = 'vines'; // 描画タイプを「植物的な曲線」に切り替え

  const globalLifespanFactor = 3.0;
  const globalThickness = 0.03;

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
    if (mouseMoved) {
      let currentPoint = p.createVector(p.mouseX - p.width / 2, p.mouseY - p.height / 2);
      let previousPoint = p.createVector(p.pmouseX - p.width / 2, p.pmouseY - p.height / 2);
      let speed = p.dist(currentPoint.x, currentPoint.y, previousPoint.x, previousPoint.y);
      
      if (detailType === 'vines') {
        let initialAngle = p.atan2(currentPoint.y - previousPoint.y, currentPoint.x - previousPoint.x);
        if (speed > 0.15) { // ある程度の動きがあった場合のみ生成
          particles.push(new VineParticle(p, currentPoint.x, currentPoint.y, currentHue, initialAngle));
        }
      }
    }

    for (let i = 0; i < numSegments; i++) {
      p.push();
      p.rotate(i * angleIncrement);
      for (let particle of particles) {
        particle.displayMirrored();
      }
      p.pop();
    }
  };

  // DotParticleクラスは使われませんが、エラーが出ないようにインスタンスモードに修正済みです。
  class DotParticle {
    constructor(pInstance, x, y, baseHue) {
      this.p = pInstance;
      this.pos = this.p.createVector(x, y);
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

  class VineParticle {
    constructor(pInstance, x, y, baseHue, initialAngle) {
      this.p = pInstance;
      this.segments = [{ pos: this.p.createVector(x, y), age: 0 }];
      this.maxSegments = 20;
      let baseSegmentLifetime = 80;
      this.segmentLifetime = baseSegmentLifetime * globalLifespanFactor;
      this.growthInterval = 2;
      this.framesSinceGrowth = 0;
      this.lifespan = (this.maxSegments * this.growthInterval) + this.segmentLifetime;
      this.initialLifespan = this.lifespan;
      this.hue = (baseHue + this.p.random(-15, 15) + 360) % 360;
      this.sat = this.p.random(65, 90);
      this.bri = this.p.random(85, 100);
      this.baseStrokeAlpha = 90;
      this.strokeW = globalThickness;
      this.currentAngle = initialAngle + this.p.random(-this.p.PI / 5, this.p.PI / 5);
      this.noiseAngleOffset = this.p.random(1000);
      this.growthLengthBase = this.p.random(2.5,
