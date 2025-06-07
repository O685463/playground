const sketch2 = (p) => {

  let numSegments = 10;
  let angleIncrement;
  let currentHue = 0;

  let particles = [];
  const detailType = 'vines';

  const globalLifespanFactor = 5.0; 
  const globalThickness = 0.1;

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
        if (speed > 0.15) {
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
      this.growthLengthBase = this.p.random(2.5, 6.0);
      this.glowThicknessMultiplier = 4.0;
      this.glowAlphaMultiplier = 0.20;
    }

    update() {
      this.lifespan -= 1;
      this.framesSinceGrowth++;
      if (this.segments.length < this.maxSegments && this.framesSinceGrowth >= this.growthInterval) {
        let lastSegment = this.segments[this.segments.length - 1];
        let angleChange = this.p.map(this.p.noise(this.noiseAngleOffset + this.p.frameCount * 0.035), 0, 1, -this.p.PI / 3.5, this.p.PI / 3.5);
        this.currentAngle += angleChange;
        let growthLength = this.growthLengthBase * (0.8 + this.p.noise(this.noiseAngleOffset + this.p.frameCount * 0.05 + 100) * 0.4);
        let newPos = this.p.constructor.Vector.fromAngle(this.currentAngle).mult(growthLength).add(lastSegment.pos);
        this.segments.push({ pos: newPos, age: 0 });
        this.framesSinceGrowth = 0;
      }
      for (let seg of this.segments) { seg.age++; }
    }
    
    _actualDisplay() {
      if (this.segments.length < 2) return;
      this.p.noFill();
      
      this.p.beginShape();
      for (let i = 0; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = this.p.map(this.p.pow(1.0 - this.p.constrain(ageRatio, 0, 1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true);
        let overallFade = (this.lifespan < this.initialLifespan * 0.25) ? this.p.map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true) : 1.0;
        
        // Glow
        let currentSegGlowAlpha = segmentBaseAlpha * overallFade * this.glowAlphaMultiplier;
        this.p.strokeWeight(this.p.max(this.strokeW * this.glowThicknessMultiplier, this.strokeW + 0.3));
        this.p.stroke(this.hue, this.sat * 0.7, this.p.min(this.bri * 1.1, 100), currentSegGlowAlpha);
        this.p.curveVertex(seg.pos.x, seg.pos.y);
      }
      this.p.endShape();

      this.p.beginShape();
      for (let i = 0; i < this.segments.length; i++) {
         let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = this.p.map(this.p.pow(1.0 - this.p.constrain(ageRatio, 0, 1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true);
        let overallFade = (this.lifespan < this.initialLifespan * 0.25) ? this.p.map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true) : 1.0;
        
        // Main line
        let currentSegMainAlpha = segmentBaseAlpha * overallFade;
        this.p.strokeWeight(this.strokeW);
        this.p.stroke(this.hue, this.sat, this.bri, currentSegMainAlpha);
        this.p.curveVertex(seg.pos.x, seg.pos.y);
      }
      this.p.endShape();
    }
    
    displayMirrored() {
      this.p.push();
      this._actualDisplay();
      this.p.scale(1, -1);
      this._actualDisplay();
      this.p.pop();
    }
    
    isDead() {
      let allSegmentsPastLifetime = (this.segments.length >= this.maxSegments) && this.segments.every(seg => seg.age > this.segmentLifetime);
      return this.lifespan <= 0 || allSegmentsPastLifetime;
    }
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0, 0, 5);
    particles = [];
  };
};
