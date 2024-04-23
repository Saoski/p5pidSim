class PIDController {
  constructor(kP, kI, kD) {
    this.kP = kP;
    this.kI = kI;
    this.kD = kD;
    this.integratorRange = 100000; // In frames (or the # of times you call calculate)
    this.currentSetpoint = 0;
    this.errorArray = [];
    this.previousError;
    this.systemNoise = true;
    this.isIntegratorResetting = false;
  }

  calculate(current, target) {
    // Calculate P outpuT
    let error = target - current;
    if (this.systemNoise) {
      error += randomGaussian() / 5;
    }
    let pOutput = this.kP * error;

    // Add the current error to our array and shift it if it is past our integrator range
    this.errorArray.push(error);
    if (this.errorArray.length > this.integratorRange) {
      this.errorArray.shift();
    }
    text(this.errorArray.length, 100, 100);

    // Add together all the areas to calculate I output.
    let errorArea = this.errorArray.reduce((total, amount) => total + amount);
    let iOutput = this.kI * errorArea;

    // Calculate slope for the D output.
    let slope;
    if (!this.previousError) { // If this is the first time calculate is being called
      slope = 0;
    } else {
      slope =  error - this.previousError; // If error is descreasing from positive direction, positive output will be made.
    }
    let dOutput = this.kD * slope;
    this.previousError = error;

    return pOutput + iOutput + dOutput;
  }

  updateGains(kP, kI, kD) {
    if (this.kP != kP || this.kI != kI || this.kD != kD) {
      this.kP = kP;
      this.kI = kI;
      this.kD = kD;
    }
    // text(kP + " " + kI + " " + kD, 100, 100);
  }
}

class Arm {
  constructor() {
    this.angle = 90;
    this.velocity = 0;
    this.moment = 50; // Moment of inertia
    this.xPos = 250;
    this.yPos = 200;
    this.width = 150;
    this.height = 20;
    this.kKinetic = 10;
    this.kViscous = 3;
    this.kGravity = 0.5;
  }

  update(torque) {
    // Add gravity force
    torque -= this.kGravity * Math.cos(degreesToRadians(this.angle));

    // Calculate friction

    let friction = this.kKinetic * Math.sign(this.velocity) + this.kViscous * this.velocity;
    this.velocity += torque - friction / this.moment;
    this.angle += this.velocity;
  }

  draw(target) {
    let pivot_x = -this.width / 2; let pivot_y = 0; // Coordinates relative to center of rectangle

    // Draw simulated arm
    push();
    translate(this.xPos, this.yPos);
    rotate(-this.angle + 180);
    translate(pivot_x, pivot_y);
    stroke(255, 255, 255);
    fill(255, 255, 255);
    rectMode(CENTER);
    rect(0, 0, this.width, this.height);
    pop();

    // Draw target ghost arm
    push();
    translate(this.xPos, this.yPos);
    rotate(-target + 180);
    translate(pivot_x, 0);
    stroke(255, 255, 255);
    fill(255, 255, 255, 50);
    rectMode(CENTER);
    rect(0, 0, this.width, this.height);
    pop();

    // Draw pivot point
    push();
    fill(255, 0, 0);
    ellipse(this.xPos, this.yPos, this.height);
    pop();
  }

  getCurrentAngle() {
    return this.angle;
  }
}

let pSliderX = 500;
let pSliderY = 50;
let sliderDeltaY = 75;
let pSlider;
let iSlider;
let dSlider;
let font;
let setpointSlider;
let pidController;
let arm;
let integratorButton;

function preload() {
  font = loadFont('fonts/Playfair.ttf')
}

function setup() {
  createCanvas(800, 600);
  generatePIDSliders();
  angleMode(DEGREES);
  pidController = new PIDController(0, 0, 0);
  arm = new Arm();
  integratorButton = createButton("Reset Integrator");
  integratorButton.mouseClicked(() => {pidController.errorArray = []});
}

function draw() {
  background(50, 50, 50);
  fill(255, 255, 255);
  textSize(20);
  textFont(font);
  text("kP: " + round(pSlider.value(), 4), pSliderX + 3, pSliderY - 10);
  text("kI: " + round(iSlider.value(), 4), pSliderX + 3, pSliderY + sliderDeltaY - 10);
  text("kD: " + round(dSlider.value(), 4), pSliderX + 3, pSliderY + sliderDeltaY * 2 - 10);
  text("Setpoint: " + round(setpointSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY * 3 - 10);

  pidController.updateGains(pSlider.value(), iSlider.value(), dSlider.value());
  let target = setpointSlider.value();
  let controller_output = pidController.calculate(arm.getCurrentAngle(), target);
  arm.update(controller_output);
  arm.draw(target);
}

function configureSlider(xpos, ypos, min, max, value) {
  let slider = createSlider(min, max, value, 0);
  slider.position(xpos, ypos);
  slider.size(290);
  return slider;
}

function generatePIDSliders() {
  pSlider = configureSlider(pSliderX, pSliderY, 0, 1, 0);
  iSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY, 0, .0015, 0);
  dSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY * 2, 0, 1, 0);
  setpointSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY * 3, -360, 360, 0);
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
 }

