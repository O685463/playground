
let numSegments = 10;
let angleIncrement;
let currentHue = 0;

let particles = [];
let detailType = 'dots';

// --- UI Elements ---
let radioDetailType;
let sliderLifespan;
let labelLifespan;
// sliderThickness and labelThickness are removed

// --- Global Control Variables ---
let globalLifespanFactor = 1.0;
const globalThickness = 0.1; // ★ 線の太さを0.1に固定

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  angleIncrement = TWO_PI / numSegments;
  background(0, 0, 5);

  let uiContainer = createDiv();
  uiContainer.style('position', 'absolute');
  uiContainer.style('left', '10px');
  uiContainer.style('top', '10px');
  uiContainer.style('background-color', 'rgba(50,50,50,0.75)');
  uiContainer.style('padding', '12px');
  uiContainer.style('border-radius', '8px');
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-direction', 'column');
  uiContainer.style('gap', '12px');

  let radioDiv = createDiv('描画タイプ:');
  radioDiv.style('color', 'white'); radioDiv.style('font-size', '14px');
  radioDiv.parent(uiContainer);
  radioDetailType = createRadio();
  radioDetailType.option('dots', '輝く点'); radioDetailType.option('vines', '植物的な曲線');
  radioDetailType.style('color', '#FFF'); radioDetailType.style('font-size', '13px');
  radioDetailType.parent(radioDiv);
  radioDetailType.selected('vines');
  detailType = radioDetailType.value();
  radioDetailType.changed(handleDetailTypeChange);

  let lifespanSliderDiv = createDiv(); lifespanSliderDiv.parent(uiContainer);
  labelLifespan = createSpan('持続時間: ' + globalLifespanFactor.toFixed(1) + 'x');
  labelLifespan.style('color', 'white'); labelLifespan.style('font-size', '14px');
  labelLifespan.parent(lifespanSliderDiv);
  sliderLifespan = createSlider(0.2, 10.0, globalLifespanFactor, 0.1); 
  sliderLifespan.style('width', '130px'); sliderLifespan.parent(lifespanSliderDiv);
  sliderLifespan.input(() => {
    globalLifespanFactor = sliderLifespan.value();
    labelLifespan.html('持続時間: ' + globalLifespanFactor.toFixed(1) + 'x');
  });

  // Thickness slider UI is removed
  // Display fixed thickness (optional)
  let fixedThicknessDisplay = createDiv('線の太さ: ' + globalThickness.toFixed(2));
  fixedThicknessDisplay.style('color', 'white');
  fixedThicknessDisplay.style('font-size', '14px');
  fixedThicknessDisplay.parent(uiContainer);

}

function handleDetailTypeChange() {
  detailType = radioDetailType.value();
  particles = [];
  background(0, 0, 5);
}

function draw() {
  background(0, 0, 5, 3);
  translate(width / 2, height / 2);
  currentHue = (currentHue + 1.2) % 360;

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  let mouseMoved = (mouseX !== pmouseX || mouseY !== pmouseY);
  let currentPoint, previousPoint, speed;

  if (mouseMoved) {
    currentPoint = createVector(mouseX - width / 2, mouseY - height / 2);
    previousPoint = createVector(pmouseX - width / 2, pmouseY - height / 2);
    speed = dist(currentPoint.x, currentPoint.y, previousPoint.x, previousPoint.y);
    
    let particlesToEmit = map(speed, 0, 25, 1, (detailType === 'vines' ? 1 : 2));
    particlesToEmit = constrain(Math.ceil(particlesToEmit), 1, (detailType === 'vines' ? 1 : 2));

    for (let k = 0; k < particlesToEmit; k++) {
      if (detailType === 'dots') {
        particles.push(new DotParticle(currentPoint.x, currentPoint.y, currentHue));
      } else if (detailType === 'vines') {
        let initialAngle = atan2(currentPoint.y - previousPoint.y, currentPoint.x - previousPoint.x);
        if (speed > 0.15) {
            particles.push(new VineParticle(currentPoint.x, currentPoint.y, currentHue, initialAngle));
        }
      }
    }
  }

  for (let i = 0; i < numSegments; i++) {
    push();
    rotate(i * angleIncrement);
    for (let p of particles) {
      p.displayMirrored();
    }
    pop();
  }
}

class DotParticle {
  constructor(x, y, baseHue) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 0.8));
    let baseLifespan = random(30, 60);
    this.lifespan = baseLifespan * globalLifespanFactor;
    this.initialLifespan = this.lifespan;
    this.hue = (baseHue + random(-25, 25) + 360) % 360;
    this.sat = random(70, 100);
    this.bri = random(90, 100);
    this.baseAlpha = random(60, 90);
    
    this.size = globalThickness; // ★ 点のサイズを固定値に
    // this.size = globalThickness * random(0.9, 1.1); // もしわずかなバリエーションが欲しい場合
    // if (this.size < 0.05) this.size = 0.05; // 0.1ならこのチェックは不要

    this.glowSizeMultiplier = 3.5; 
    this.glowAlphaMultiplier = 0.25; 
  }
  update() { this.pos.add(this.vel); this.lifespan -= 1; }
  _actualDisplay() {
    let currentAlpha = map(this.lifespan, 0, this.initialLifespan, 0, this.baseAlpha);
    if (currentAlpha <= 0.01) return; // ほぼ透明なら描画しない
    noStroke(); 

    // グローの半径計算を見直し (this.sizeが非常に小さいため)
    let glowRadius = max(this.size * this.glowSizeMultiplier, this.size + 0.5); // 0.5は最低限のグロー幅
    // let glowRadius = this.size * this.glowSizeMultiplier + 0.5; // よりシンプルな計算も可能
    let glowAlpha = currentAlpha * this.glowAlphaMultiplier;
    fill(this.hue, this.sat * 0.7, min(this.bri * 1.1, 100), glowAlpha); 
    ellipse(this.pos.x, this.pos.y, glowRadius, glowRadius);

    fill(this.hue, this.sat, this.bri, currentAlpha);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
  displayMirrored() { push(); this._actualDisplay(); scale(1, -1); this._actualDisplay(); pop(); }
  isDead() { return this.lifespan <= 0; }
}

class VineParticle {
  constructor(x, y, baseHue, initialAngle) {
    this.segments = [{ pos: createVector(x, y), age: 0 }];
    this.maxSegments = 20; 
    let baseSegmentLifetime = 80;
    this.segmentLifetime = baseSegmentLifetime * globalLifespanFactor;
    this.growthInterval = 2; 
    this.framesSinceGrowth = 0;
    this.lifespan = (this.maxSegments * this.growthInterval) + this.segmentLifetime;
    this.initialLifespan = this.lifespan;
    this.hue = (baseHue + random(-15, 15) + 360) % 360;
    this.sat = random(65, 90);
    this.bri = random(85, 100);
    this.baseStrokeAlpha = 90; 
    
    this.strokeW = globalThickness; // ★ 線の太さを固定値に
    // if (this.strokeW < 0.02) this.strokeW = 0.02; // 0.1ならこのチェックは不要

    this.currentAngle = initialAngle + random(-PI/5, PI/5);
    this.noiseAngleOffset = random(1000);
    this.growthLengthBase = random(2.5, 6.0);
    
    this.glowThicknessMultiplier = 4.0; 
    this.glowAlphaMultiplier = 0.20;  
  }

  update() {
    this.lifespan -= 1; this.framesSinceGrowth++;
    if (this.segments.length < this.maxSegments && this.framesSinceGrowth >= this.growthInterval) {
      let lastSegment = this.segments[this.segments.length - 1];
      let angleChange = map(noise(this.noiseAngleOffset + frameCount * 0.035), 0, 1, -PI/3.5, PI/3.5);
      this.currentAngle += angleChange;
      let growthLength = this.growthLengthBase * (0.8 + noise(this.noiseAngleOffset + frameCount * 0.05 + 100) * 0.4);
      let newPos = p5.Vector.fromAngle(this.currentAngle).mult(growthLength).add(lastSegment.pos);
      this.segments.push({ pos: newPos, age: 0 });
      this.framesSinceGrowth = 0;
    }
    for (let seg of this.segments) { seg.age++; }
  }

  _actualDisplay() {
    if (this.segments.length < 2 && this.lifespan <=0) return;
    noFill();

    // グローの太さ計算を見直し
    let glowSW = max(this.strokeW * this.glowThicknessMultiplier, this.strokeW + 0.3); // 0.3は最低限のグロー幅
    // let glowSW = this.strokeW * this.glowThicknessMultiplier + 0.3; // よりシンプルな計算も可能

    // グローレイヤー
    strokeWeight(glowSW);
    beginShape();
    let anyGlowSegmentVisible = false;
    for (let i = 0; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = map(pow(1.0 - constrain(ageRatio,0,1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true);
        let overallFade = 1.0;
        if (this.lifespan < this.initialLifespan * 0.25) {
            overallFade = map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true);
        }
        let currentSegGlowAlpha = segmentBaseAlpha * overallFade * this.glowAlphaMultiplier;
        if (currentSegGlowAlpha > 0.01) anyGlowSegmentVisible = true;
        stroke(this.hue, this.sat * 0.7, min(this.bri * 1.1, 100), currentSegGlowAlpha);
        if (i === 0) curveVertex(seg.pos.x, seg.pos.y);
        curveVertex(seg.pos.x, seg.pos.y);
        if (i === this.segments.length - 1) curveVertex(seg.pos.x, seg.pos.y);
    }
    if(anyGlowSegmentVisible || (this.segments.length < 2 && this.lifespan > 0)) endShape();


    // メインレイヤー
    strokeWeight(this.strokeW);
    beginShape();
    let anyMainSegmentVisible = false;
    for (let i = 0; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let ageRatio = seg.age / this.segmentLifetime;
        let segmentBaseAlpha = map(pow(1.0 - constrain(ageRatio,0,1), 2.0), 0, 1, 0, this.baseStrokeAlpha, true);
        let overallFade = 1.0;
        if (this.lifespan < this.initialLifespan * 0.25) {
            overallFade = map(this.lifespan, 0, this.initialLifespan * 0.25, 0, 1, true);
        }
        let currentSegMainAlpha = segmentBaseAlpha * overallFade;
        if (currentSegMainAlpha > 0.01) anyMainSegmentVisible = true;
        stroke(this.hue, this.sat, this.bri, currentSegMainAlpha);
        if (i === 0) curveVertex(seg.pos.x, seg.pos.y);
        curveVertex(seg.pos.x, seg.pos.y);
        if (i === this.segments.length - 1) curveVertex(seg.pos.x, seg.pos.y);
    }
    if(anyMainSegmentVisible || (this.segments.length < 2 && this.lifespan > 0)) endShape();
  }
  displayMirrored() { push(); this._actualDisplay(); scale(1, -1); this._actualDisplay(); pop(); }
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0, 0, 5);
  particles = [];
}
