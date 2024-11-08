let density = 0.0002; // Background Line Density
let squareColor, strokeColor, baseColors;
let baseUnits = []; // An array to contain rectangular base
let timeOffset = 0;
let noiseoffset = 0;
let particles = [];
let frameCount = 0;


// BicolorCircle class
class BicolorCircle {
  constructor(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
  }

  display() {
    let noiseFactor = noise(this.x * 0.001, this.y * 0.001, timeOffset);//Use Perlin noise to change the size of the circle
    let animatedDiameter = this.diameter + noiseFactor * 10;
    // Set a uniform stroke
    stroke(strokeColor);
    strokeWeight(3);

    // Draw the upper half red
    fill('#fc4b46');
    arc(this.x, this.y, animatedDiameter, animatedDiameter, PI, 0);

    // Draw the lower half green
    fill('#5ea269');
    arc(this.x, this.y, animatedDiameter, animatedDiameter, 0, PI);

    // Draw the yellow line dividing the middle
    stroke('#e4be6e');
    line(this.x - animatedDiameter / 2 + 3, this.y, this.x + animatedDiameter / 2 - 3, this.y);
  }
}
//Added particle Class to the base code for group work
class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }
  update() {
    // Using noise to control particles movement
    this.x += map(noise(this.noiseOffsetX), 0, 1, -2, 2);
    this.y += map(noise(this.noiseOffsetY), 0, 1, -2, 2);
    this.noiseOffsetX += 0.005;
    this.noiseOffsetY += 0.005;

    // Boundary 
    if (this.x > width) this.x = 0;
    if (this.x < 0) this.x = width;
    if (this.y > height) this.y = 0;
    if (this.y < 0) this.y = height;
  }

  display() {
    fill('#e4be6e');
    ellipse(this.x, this.y, 1, 1);
  }
}



// RectangleUnit Class
class RectangleUnit {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.semicircleDiameter = random(width * 0.5, width * 0.75);
    this.bottomSemicircleColor = random(baseColors);
  }

  display() {
    let noiseFactor = noise(this.x * 0.01, timeOffset) * 5;
    let animatedY = this.y + noiseFactor;//Use perlin noise to change the Y coordinate of the small square
    //rectangular base
    stroke('#e4be6e');
    strokeWeight(3);
    fill(this.color);
    rect(this.x, animatedY, this.width, this.height);

    // Draw semicircle with the bottom edge
    noStroke();
    fill(this.bottomSemicircleColor);
    arc(
      this.x + this.width / 2,
      animatedY + this.height - 1.5,
      this.semicircleDiameter,
      this.semicircleDiameter,
      PI, TWO_PI
    );
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  // Define stroke properties
  strokeWeight(0.5);
  stroke(255, 255, 102, 50);
  noFill();

  // Define colors
  strokeColor = '#3c4449';
  squareColor = color('#69a27d');
  baseColors = ['#e4be6e', '#5ea269', '#fc4b46'];

  // Create particles based on canvas size
  let numBranches = int(windowWidth * windowHeight * density);
  for (let i = 0; i < numBranches; i++) {
    particles.push(new Particle());
  }

  // Create base
  createBase();
}

function draw() {
  // Clear canvas with a transparent background to create a fading effect
  //Create a color object to change the background color as the mouse moves. Both x and y have different effects.
  let bgColor = color(noise(mouseX * 0.001) * 255, noise(mouseY * 0.001) * 255, 200 - (mouseY * 0.1));
  bgColor.setAlpha(20); // Set transparency to 20
  background(bgColor); // Use background color with transparency

  // Draw background elements first (particles)
  for (let particle of particles) {
    particle.update();
    particle.display();
  }

  // Draw green squares
  drawGreenSquares();

  // Draw base elements
  drawBase();

  // Draw connected circles last to ensure they are on top
  frameCount++;
  if (frameCount % 15 === 0) { // update every 10 frame
    drawConnectedCircles();
  }
}
function drawConnectedCircles() {
  let squareSize = height * 0.1;
  let baseWidth = squareSize * 3.5;
  let rectWidth = baseWidth / 6;
  let yPosition = height * 0.7 - (rectWidth * 1.5) / 2;

  // Record the data of the five horizontal circles at the bottom
  let diameters = [];
  let totalWidth = 0;
  for (let i = 0; i < 5; i++) {
    let diameter = random(rectWidth * 0.5, rectWidth);
    diameters.push(diameter);
    totalWidth += diameter;
  }

  let centerX = width / 2;
  let startX = centerX - totalWidth / 2;

  // Draw the five horizontal circles at the bottom
  let currentX = startX;
  for (let i = 0; i < 5; i++) {
    let circleDiameter = diameters[i];
    let bicolorCircle = new BicolorCircle(currentX + circleDiameter / 2, yPosition, circleDiameter);
    bicolorCircle.display();
    currentX += circleDiameter;

    // Draw six vertical circles for the third circle
    if (i === 2) {
      let verticalY = yPosition - circleDiameter / 2;
      // Record data based on the fifth circle
      let fifthVerticalCircleY = null;
      let fifthCircleDiameter = null;

      for (let j = 0; j < 6; j++) {
        let verticalDiameter = random(rectWidth * 0.75, rectWidth * 1.25);

        // Controlling rotation with noise
        noiseoffset += 1;
        let trunkRotate = noise(noiseoffset) * TWO_PI;
        push();
        translate(currentX - circleDiameter / 2, verticalY - verticalDiameter / 2);
        rotate(trunkRotate);
        let verticalCircle = new BicolorCircle(0, 0, verticalDiameter);
        verticalCircle.display();
        pop();

        // Record the center position and diameter at the fifth vertical circle
        if (j === 4) {
          fifthVerticalCircleY = verticalY;
          fifthCircleDiameter = verticalDiameter;
        }
        verticalY -= verticalDiameter;
      }

      // Add horizontal circles to the left and right sides of the fifth vertical circle
      if (fifthVerticalCircleY !== null && fifthCircleDiameter !== null) {
        let adjustedY = fifthVerticalCircleY - fifthCircleDiameter / 2;

        let leftDiameters = [];
        let leftTotalWidth = 0;

        //Record the data of the fifth circle
        for (let k = 0; k < 4; k++) {
          let leftDiameter = random(rectWidth * 0.5, rectWidth);
          leftDiameters.push(leftDiameter);
          leftTotalWidth += leftDiameter;
        }

        let leftStartX = currentX - circleDiameter / 2 - fifthCircleDiameter / 2 - leftTotalWidth;

        // Draw four horizontal circles on the left
        for (let k = 0; k < 4; k++) {
          let leftCircleDiameter = leftDiameters[k];
          let leftCircleX = leftStartX + leftCircleDiameter / 2;
          let leftCircle = new BicolorCircle(leftCircleX, adjustedY, leftCircleDiameter);
          leftCircle.display();
          leftStartX += leftCircleDiameter;

          // Draw four vertical circles on the left
          if (k === 0) {
            let verticalY = adjustedY - leftCircleDiameter / 2;
            for (let j = 0; j < 4; j++) {
              let verticalDiameter = random(rectWidth * 0.75, rectWidth * 1);
              // Rotate 90 degrees
              push();
              translate(leftCircleX, verticalY - verticalDiameter / 2);
              rotate(HALF_PI);
              let verticalCircle = new BicolorCircle(0, 0, verticalDiameter);
              verticalCircle.display();
              pop();
              verticalY -= verticalDiameter;
            }
          }
        }

        // Draw three horizontal circles on the right
        let rightDiameters = [];
        let rightTotalWidth = 0;

        for (let k = 0; k < 3; k++) {
          let rightDiameter = random(rectWidth * 0.5, rectWidth);
          rightDiameters.push(rightDiameter);
          rightTotalWidth += rightDiameter;
        }

        let rightStartX = currentX - circleDiameter / 2 + fifthCircleDiameter / 2;

        for (let k = 0; k < 3; k++) {
          let rightCircleDiameter = rightDiameters[k];
          let rightCircleX = rightStartX + rightCircleDiameter / 2;
          let rightCircle = new BicolorCircle(rightCircleX, adjustedY, rightCircleDiameter);
          rightCircle.display();
          rightStartX += rightCircleDiameter;
          if (k === 2) {
            let verticalY = adjustedY - rightCircleDiameter / 2;
            for (let j = 0; j < 4; j++) {
              let verticalDiameter = random(rectWidth * 0.75, rectWidth * 1);
              // rotate 90
              push();
              translate(rightCircleX, verticalY - verticalDiameter / 2);
              rotate(HALF_PI);
              let verticalCircle = new BicolorCircle(0, 0, verticalDiameter);
              verticalCircle.display();
              pop();
              verticalY -= verticalDiameter;
            }
          }
        }
      }

      // Draw three horizontal circles above the vertical circle
      let topYPosition = verticalY;
      let topDiameters = [];
      let topTotalWidth = 0;

      // Generate the diameters of the top three horizontal circles and calculate the total width
      for (let k = 0; k < 3; k++) {
        let topDiameter = random(rectWidth * 0.5, rectWidth);
        topDiameters.push(topDiameter);
        topTotalWidth += topDiameter;
      }

      // Calculate the starting x position of the top horizontal row so that it is centered
      let topStartX = currentX - circleDiameter / 2 - topTotalWidth / 2;

      // Draw three circles arranged horizontally at the top
      for (let k = 0; k < 3; k++) {
        let topCircleDiameter = topDiameters[k];
        let topCircleX = topStartX + topCircleDiameter / 2;
        let topCircle = new BicolorCircle(topCircleX, topYPosition - topCircleDiameter / 2, topCircleDiameter);
        topCircle.display();
        topStartX += topCircleDiameter;
      }
    }
  }
}





function drawGreenSquares() {
  let squareSize = height * 0.1;
  let numSquares = width / squareSize;
  let yPositionBase = height * 0.7;


  for (let i = 0; i < numSquares; i++) {
    // Use the sin() function to implement wave motion
    let waveSpeed = frameCount * 0.05; // the speed of the waves
    let yOffset = sin(i * 0.5 + waveSpeed) * 10; // the height of the wave
    let noiseColorFactor = noise(i * 0.3, frameCount * 0.03);//use perlin noise to change the color of the squares
    let dynamicColor = lerpColor(color('#69a27d'), color('#fc4b46'), noiseColorFactor);
    let rotation = noise(i * 0.1, frameCount * 0.01) * PI / 8; // Rotation effect
    push();
    translate(i * squareSize + squareSize / 2, yPositionBase + yOffset + squareSize / 2);
    rotate(rotation);
    fill(dynamicColor);
    stroke(strokeColor);
    rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
    pop();
  }
}


// create base
function createBase() {
  // Calculate the size of the rectangles proportionally
  let squareSize = height * 0.1;
  let baseWidth = squareSize * 3.5;
  let rectWidth = baseWidth / 6;
  let rectHeight = rectWidth * 1.5;
  let yPosition = height * 0.7 - rectHeight / 2;

  // Create a small rectangle for the base and store it in an array
  baseUnits = [];
  for (let i = 0; i < 6; i++) {
    let x = (width - baseWidth) / 2 + i * rectWidth;
    let color = random(baseColors);
    let unit = new RectangleUnit(x, yPosition, rectWidth, rectHeight, color);
    baseUnits.push(unit);
  }
}

// draw base
function drawBase() {
  // Draw the outer stroke of the base
  let squareSize = height * 0.1;
  let baseWidth = squareSize * 3.5;
  let rectHeight = (baseWidth / 6) * 1.5;
  let yPosition = height * 0.7 - rectHeight / 2;

  push();
  translate((width - baseWidth) / 2, yPosition);
  stroke(strokeColor);
  strokeWeight(3);
  noFill();
  rect(-3, -3, baseWidth + 6, rectHeight + 6);
  pop();

  // Draw each rectangle
  for (let unit of baseUnits) {
    unit.display();
  }
}

// Adapt to screen size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}