// kaleidoscopeSketch.js

// P5.jsインスタンスモードの関数としてスケッチをラップ
const kaleidoscopeSketch = (p) => { // p を引数として受け取る

  let numSegments = 10;
  let angleIncrement;
  let currentHue = 0;

  let particles = [];
  const detailType = 'dots'; // 描画タイプを「輝く点」に固定

  // --- Global Control Variables ---
  const globalLifespanFactor = 3.0; // ★ 持続時間を5.0倍に変更
  const globalThickness = 0.15;     // 点のサイズ基準を0.1に固定

  p.setup = () => { // p.setup に変更
    p.createCanvas(p.windowWidth, p.windowHeight); // p.createCanvas に変更
    p.colorMode(p.HSB, 360, 100, 100, 100); // p.colorMode, p.HSB に変更
    angleIncrement = p.TWO_PI / numSegments; // p.TWO_PI に変更
    p.background(0, 0, 5); // p.background に変更
  };

  p.draw = () => { // p.draw に変更
    p.background(0, 0, 5, 3); // p.background に変更
    p.translate(p.width / 2, p.height / 2); // p.translate, p.width, p.height に変更
    currentHue = (currentHue + 1.2) % 360;

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    let mouseMoved = (p.mouseX !== p.pmouseX || p.mouseY !== p.pmouseY); // p.mouseX, p.pmouseX, p.mouseY, p.pmouseY に変更
    let currentPoint, previousPoint, speed;

    if (mouseMoved) {
      currentPoint = p.createVector(p.mouseX - p.width / 2, p.mouseY - p.height / 2); // p.createVector, p.mouseX, p.width, p.mouseY, p.height に変更
      previousPoint = p.createVector(p.pmouseX - p.width / 2, p.pmouseY - p.height / 2); // p.createVector, p.pmouseX, p.pmouseY に変更
      speed = p.dist(currentPoint.x, currentPoint.y, previousPoint.x, previousPoint.y); // p.dist に変更
      
      let particlesToEmit = p.map(speed, 0, 25, 1, 2); // p.map に変更
      particlesToEmit = p.constrain(Math.ceil(particlesToEmit), 1, 2); // p.constrain に変更

      for (let k = 0; k < particlesToEmit; k++) {
        if (detailType === 'dots') {
          particles.push(new DotParticle(p, currentPoint.x, currentPoint.y, currentHue)); // DotParticleのコンストラクタにpを渡す
        }
      }
    }

    for (let i = 0; i < numSegments; i++) {
      p.push(); // p.push に変更
      p.rotate(i * angleIncrement); // p.rotate に変更
      for (let particle of particles) { // for (let p of particles) は p5オブジェクトと紛らわしいので particle に変更
        particle.displayMirrored();
      }
      p.pop(); // p.pop に変更
    }
  };

  // DotParticle クラス
  class DotParticle {
    // コンストラクタでp5オブジェクトpを受け取るようにする
    constructor(pInstance, x, y, baseHue) {
      this.p = pInstance; // p5オブジェクトをインスタンス変数として保存
      this.pos = pInstance.createVector(x, y); // p.createVector に変更
      this.vel = pInstance.random2D().mult(pInstance.random(0.2, 0.8)); // p.random2D, p.random に変更
      let baseLifespan = pInstance.random(30, 60); // p.random に変更
      this.lifespan = baseLifespan * globalLifespanFactor;
      this.initialLifespan = this.lifespan;
      this.hue = (baseHue + pInstance.random(-25, 25) + 360) % 360; // p.random に変更
      this.sat = pInstance.random(70, 100); // p.random に変更
      this.bri = pInstance.random(90, 100); // p.random に変更
      this.baseAlpha = pInstance.random(60, 90); // p.random に変更
      
      this.size = globalThickness;
      this.glowSizeMultiplier = 4.0;
      this.glowAlphaMultiplier = 0.30;
    }
    update() { this.pos.add(this.vel); this.lifespan -= 1; }
    _actualDisplay() {
      let currentAlpha = this.p.map(this.lifespan, 0, this.initialLifespan, 0, this.baseAlpha); // p.map に変更
      if (currentAlpha <= 0.01) return;
      this.p.noStroke(); // p.noStroke に変更

      let glowRadius = p.max(this.size * this.glowSizeMultiplier, this.size + 0.8); // p.max に変更
      let glowAlpha = currentAlpha * this.glowAlphaMultiplier;
      this.p.fill(this.hue, this.sat * 0.7, p.min(this.bri * 1.1, 100), glowAlpha); // p.fill, p.min に変更
      this.p.ellipse(this.pos.x, this.pos.y, glowRadius, glowRadius); // p.ellipse に変更

      this.p.fill(this.hue, this.sat, this.bri, currentAlpha); // p.fill に変更
      this.p.ellipse(this.pos.x, this.pos.y, this.size, this.size); // p.ellipse に変更
    }
    displayMirrored() { this.p.push(); this._actualDisplay(); this.p.scale(1, -1); this._actualDisplay(); this.p.pop(); } // p.push, p.scale, p.pop に変更
    isDead() { return this.lifespan <= 0; }
  }

  // VineParticleクラスも同様にP5.js関数をp.経由で呼び出すように修正 (使われていないようですが一応)
  class VineParticle {
    constructor(pInstance, x, y, baseHue, initialAngle) { // pInstance を受け取る
      this.p = pInstance; // p5オブジェクトをインスタンス変数として保存
      this.segments = [{ pos: pInstance.createVector(x, y), age: 0 }]; // p.createVector に変更
      this.maxSegments = 20;
      let baseSegmentLifetime = 80;
      this.segmentLifetime = baseSegmentLifetime * globalLifespanFactor;
      this.growthInterval = 2;
      this.framesSinceGrowth = 0;
      this.lifespan = (this.maxSegments * this.growthInterval) + this.segmentLifetime;
      this.initialLifespan = this.lifespan;
      this.hue = (baseHue + pInstance.random(-15, 15) + 360) % 360; // p.random に変更
      this.sat = pInstance.random(65, 90); // p.random に変更
      this.bri = pInstance.random(85, 100); // p.random に変更
      this.baseStrokeAlpha = 90;
      this.strokeW = globalThickness;
      this.currentAngle = initialAngle + pInstance.random(-pInstance.PI/5, pInstance.PI/5); // p.PI に変更
      this.noiseAngleOffset = pInstance.random(1000); // p.random に変更
      this.growthLengthBase = pInstance.random(2.5, 6.0); // p.random に変更
      this.glowThicknessMultiplier = 4.0;
      this.glowAlphaMultiplier = 0.20;
    }
    update() {
      this.lifespan -= 1; this.framesSinceGrowth++;
      if (this.segments.length < this.maxSegments && this.framesSinceGrowth >= this.growthInterval) {
        let lastSegment = this.segments[this.segments.length - 1];
        let angleChange = this.p.map(this.p.noise(this.noiseAngleOffset + this.p.frameCount * 0.035), 0, 1, -this.p.PI/3.5, this.p.PI/3.5); // p.map, p.noise, p.frameCount, p.PI に変更
        this.currentAngle += angleChange;
        let growthLength = this.growthLengthBase * (0.8 + this.p.noise(this.noiseAngleOffset + this.p.frameCount * 0.05 + 100) * 0.4); // p.noise, p.frameCount に変更
        let newPos = this.p.P5.Vector.fromAngle(this.currentAngle).mult(growthLength).add(lastSegment.pos); // p.P5.Vector に変更
        this.segments.push({ pos: newPos, age: 0 });
        this.framesSinceGrowth = 0;
      }
      for (let seg of this.segments) { seg.age++; }
    }
    _actualDisplay() {
      if (this.segments.length < 2 && this.lifespan <=0) return;
      this.p.noFill(); // p.noFill に変更
      let glowSW = this.p.max(this.strokeW * this.glowThicknessMultiplier, this.strokeW + 0.3); // p.max に変更

      this.p.strokeWeight(glowSW); // p.strokeWeight に変更
      this.p.beginShape(); // p.beginShape に変更
      let anyGlowSegmentVisible = false;
      for (let i = 0; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = this.p.map(this.p.pow(1.0 - this.p.constrain(ageRatio,0,1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true); // p.map, p.pow, p.constrain に変更
        let overallFade = 1.0;
        if (this.lifespan < this.initialLifespan * 0.25) {
          overallFade = this.p.map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true); // p.map に変更
        }
        let currentSegGlowAlpha = segmentBaseAlpha * overallFade * this.glowAlphaMultiplier;
        if (currentSegGlowAlpha > 0.01) anyGlowSegmentVisible = true;
        this.p.stroke(this.hue, this.sat * 0.7, this.p.min(this.bri * 1.1, 100), currentSegGlowAlpha); // p.stroke, p.min に変更
        if (i === 0) this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
        this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
        if (i === this.segments.length - 1) this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
      }
      if(anyGlowSegmentVisible || (this.segments.length < 2 && this.lifespan > 0)) this.p.endShape(); // p.endShape に変更

      this.p.strokeWeight(this.strokeW); // p.strokeWeight に変更
      this.p.beginShape(); // p.beginShape に変更
      let anyMainSegmentVisible = false;
      for (let i = 0; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = this.p.map(this.p.pow(1.0 - this.p.constrain(ageRatio,0,1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true); // p.map, p.pow, p.constrain に変更
        let overallFade = 1.0;
        if (this.lifespan < this.initialLifespan * 0.25) {
          overallFade = this.p.map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true); // p.map に変更
        }
        let currentSegMainAlpha = segmentBaseAlpha * overallFade;
        if (currentSegMainAlpha > 0.01) anyMainSegmentVisible = true;
        this.p.stroke(this.hue, this.sat, this.bri, currentSegMainAlpha); // p.stroke に変更
        if (i === 0) this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
        this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
        if (i === this.segments.length - 1) this.p.curveVertex(seg.pos.x, seg.pos.y); // p.curveVertex に変更
      }
      if(anyMainSegmentVisible || (this.segments.length < 2 && this.lifespan > 0)) this.p.endShape(); // p.endShape に変更
    }
    isDead() {
      let allSegmentsPastLifetime = true;
      if (this.segments.length > 0 && this.segments.length >= this.maxSegments) {
          allSegmentsPastLifetime = this.segments.every(seg => seg.age > this.segmentLifetime);
      } else if (this.segments.length < this.maxSegments) {
          allSegmentsPastLifetime = false;
      }
      return this.lifespan <= 0 || allSegmentsPastLifetime;
    }
  }

  p.windowResized = () => { // p.windowResized に変更
    p.resizeCanvas(p.windowWidth, p.windowHeight); // p.resizeCanvas, p.windowWidth, p.windowHeight に変更
    p.background(0, 0, 5); // p.background に変更
    particles = [];
  };
}; // スケッチ関数はここまで

// このスケッチ関数を `main.js` からインポートできるようにエクスポート
// ES6モジュールとして使用しない場合は、この行は不要
// export { kaleidoscopeSketch };
