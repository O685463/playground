const sketch3 = (p) => {

  let targetAngle;
  let currentAngle;
  let baseHueOffset = 0;
  let easing = 0.05;

  let baseInitialBranchLength;
  const thicknessMultiplier = 0.12;
  const maxRecursionLevel = 11;
  const branchLengthReduction = 0.67;
  const minDrawLength = 1.3;
  const minBranchAlphaForMainTree = 50;

  let isGlowPass = false;
  let currentThicknessScale = 1.0;
  let currentAlphaScale = 1.0;
  let currentSaturationScale = 1.0;
  let currentBrightnessScale = 1.0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.angleMode(p.DEGREES);
    currentAngle = 15;
    targetAngle = 15;
    baseInitialBranchLength = p.height * 0.32;
    p.noiseDetail(3, 0.45);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    baseInitialBranchLength = p.height * 0.32;
  };

  p.draw = () => {
    baseHueOffset = (p.frameCount * 0.10) % 360;
    p.background(5, 5, 5, 100);

    targetAngle = p.map(p.mouseX, 0, p.width, 10, 80);
    targetAngle = p.constrain(targetAngle, 10, 80);
    currentAngle = p.lerp(currentAngle, targetAngle, easing);

    p.blendMode(p.ADD);

    // 1. Halo Pass
    isGlowPass = true;
    currentThicknessScale = 4.0;
    currentAlphaScale = 0.05;
    currentSaturationScale = 0.10;
    currentBrightnessScale = 1.0;
    drawTreeCore();

    // 2. Inner Glow Pass
    isGlowPass = true;
    currentThicknessScale = 2.0;
    currentAlphaScale = 0.10;
    currentSaturationScale = 0.35;
    currentBrightnessScale = 1.0;
    drawTreeCore();

    // 3. Main Tree Pass
    isGlowPass = false;
    currentThicknessScale = 1.0;
    currentAlphaScale = 1.0;
    currentSaturationScale = 1.0;
    currentBrightnessScale = 1.0;
    drawTreeCore();

    p.blendMode(p.BLEND);
  };

  function drawTreeCore() {
    p.push();
    p.translate(p.width / 2, p.height);

    let actualTrunkLength = baseInitialBranchLength;
    let trunkSaturation = p.map(currentAngle, 10, 80, 30, 100);
    let trunkBrightness = 100;

    if (isGlowPass) {
      trunkSaturation *= currentSaturationScale;
      trunkBrightness = p.min(100, trunkBrightness * currentBrightnessScale);
    }

    let trunkWeightOriginal = p.max(1.0, baseInitialBranchLength / 20);
    p.strokeWeight(p.max(0.1, trunkWeightOriginal * thicknessMultiplier * currentThicknessScale));

    let trunkAlpha = isGlowPass ? 100 * currentAlphaScale : 100;
    p.stroke((baseHueOffset) % 360, trunkSaturation, trunkBrightness, trunkAlpha);
    p.line(0, 0, 0, -actualTrunkLength);

    p.translate(0, -actualTrunkLength);
    branch(baseInitialBranchLength * branchLengthReduction, 0, 1);
    p.pop();
  }

  function branch(parentBranchBaseLength, level, branchId) {
    let baseAlphaForLevel = p.map(level, 0, maxRecursionLevel, 100, minBranchAlphaForMainTree);
    baseAlphaForLevel = p.max(baseAlphaForLevel, minBranchAlphaForMainTree);
    let finalStrokeAlpha = baseAlphaForLevel * currentAlphaScale;

    let dynamicSaturation = p.map(currentAngle, 10, 80, 50, 100);
    let dynamicBrightness = 100;

    if (isGlowPass) {
      dynamicSaturation *= currentSaturationScale;
      dynamicBrightness = p.min(100, dynamicBrightness * currentBrightnessScale);
    }

    let hueShiftPerLevel = p.map(currentAngle, 10, 80, 10, 32);
    p.stroke(
      ((level * hueShiftPerLevel) + baseHueOffset) % 360,
      dynamicSaturation,
      dynamicBrightness,
      finalStrokeAlpha
    );

    let branchWeightOriginal = p.max(0.3, (baseInitialBranchLength / 25) - level * 0.95);
    let finalBranchWeight = branchWeightOriginal * thicknessMultiplier * currentThicknessScale;
    p.strokeWeight(p.max(0.05, finalBranchWeight));

    let currentLevelBaseLength = parentBranchBaseLength * branchLengthReduction;
    let lengthNoiseFactor = p.map(p.noise(level * 0.22, branchId * 0.12), 0, 1, 0.70, 1.30);
    let actualDrawLength = currentLevelBaseLength * lengthNoiseFactor;

    if (actualDrawLength > minDrawLength && level < maxRecursionLevel) {
      let angleFluctuationMax = p.map(currentAngle, 10, 80, 0.5, 14);

      p.push();
      let angleOffset1 = p.map(p.noise(level * 0.22 + 10, branchId * 0.12 + 10), 0, 1, -angleFluctuationMax, angleFluctuationMax * 0.5);
      p.rotate(currentAngle + angleOffset1);
      p.line(0, 0, 0, -actualDrawLength);
      p.translate(0, -actualDrawLength);
      branch(currentLevelBaseLength, level + 1, branchId * 2);
      p.pop();

      p.push();
      let angleOffset2 = p.map(p.noise(level * 0.22 + 20, branchId * 0.12 + 20), 0, 1, -angleFluctuationMax * 0.5, angleFluctuationMax);
      p.rotate(-currentAngle + angleOffset2);
      p.line(0, 0, 0, -actualDrawLength);
      p.translate(0, -actualDrawLength);
      branch(currentLevelBaseLength, level + 1, branchId * 2 + 1);
      p.pop();

      if (actualDrawLength < baseInitialBranchLength * 0.10 && currentAngle > 45 && level > maxRecursionLevel * 0.40) {
        let flowerHueNoise = p.noise(branchId * 0.6, level * 0.6 + 50);
        let flowerHue = (((level + 4) * hueShiftPerLevel) + baseHueOffset + p.map(flowerHueNoise, 0, 1, -30, 120)) % 360;
        
        let flowerSaturation = p.map(currentAngle, 45, 80, 70, 100);
        let flowerBrightness = 100;

        if (isGlowPass) {
          flowerSaturation *= currentSaturationScale;
          flowerBrightness = p.min(100, flowerBrightness * currentBrightnessScale);
        }
        
        let flowerAlphaCalculated = p.map(actualDrawLength, minDrawLength, baseInitialBranchLength * 0.10, baseAlphaForLevel * 0.6, baseAlphaForLevel * 1.2);
        let finalFlowerAlpha = p.constrain(flowerAlphaCalculated * currentAlphaScale, minBranchAlphaForMainTree * currentAlphaScale * 0.3, 80 * currentAlphaScale);
        finalFlowerAlpha = p.max(5, finalFlowerAlpha);

        let flowerSizeBase = p.max(0.08, finalBranchWeight) * p.map(p.noise(branchId * 0.6 + 100), 0, 1, 1.8, 3.5);
        let flowerSize = p.max(0.1 * currentThicknessScale, flowerSizeBase * 0.7);

        p.fill(flowerHue, flowerSaturation, flowerBrightness, finalFlowerAlpha);
        p.noStroke();
        p.ellipse(0, 0, flowerSize, flowerSize);
      }
    }
  }
};