class PIDController {
  constructor(kP, kI, kD) {
    this.kP = kP;
    this.kI = kI;
    this.kD = kD;
    this.integratorRange = 300; // In frames (or the # of times you call calculate)
    this.currentSetpoint = 0;
    this.errorArray = [];
    this.previousError;
  }

  calculate(current, target) {
    // Calculate P output.
    let error = target - current;
    let pOutput = kP * error;

    // Add the current error to our array and shift it if it is past our integrator range.
    this.errorArray.push(error);
    if (this.errorArray.length > this.integratorRange) {
      this.errorArray.shift();
    }

    // Add together all the areas to calculate I output.
    let errorArea = this.errorArray.reduce((total, amount) => total + amount);
    let iOutput = kI * errorArea;

    // Calculate slope for the D output.
    let slope;
    if (!this.previousError) { // If this is the first time calculate is being called.
      slope = 0;
    } else {
      slope =  this.previousError - error; // If error is descreasing from positive direction, positive output will be made.
    }
    let dOutput = kD * slope;

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
    this.moment = 5; // Moment of inertia
  }

  update(torque) {
    this.velocity += torque / this.moment;
    this.angle += this.velocity;
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

function preload() {
  font = loadFont('fonts/Playfair.ttf')
}

function setup() {
  createCanvas(800, 600);
  generatePIDSliders();
  pidController = new PIDController(0, 0, 0);
}

function draw() {
  background(50, 50, 50);
  fill(255, 255, 255);
  textSize(20);
  textFont(font);
  text("kP: " + round(pSlider.value(), 2), pSliderX + 3, pSliderY - 10);
  text("kI: " + round(iSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY - 10);
  text("kD: " + round(dSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY * 2 - 10);
  text("Setpoint: " + round(setpointSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY * 3 - 10);

  pidController.updateGains(pSlider.value(), iSlider.value(), dSlider.value());
}

function configureSlider(xpos, ypos, min, max, value) {
  let slider = createSlider(min, max, value, 0);
  slider.position(xpos, ypos);
  slider.size(290);
  return slider;
}

function generatePIDSliders() {
  pSlider = configureSlider(pSliderX, pSliderY, 0, 100, 0);
  iSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY, 0, 100, 0);
  dSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY * 2, 0, 100, 0);
  setpointSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY * 3, -720, 720, 0);
}

function degrees_to_radians(degrees)
{
  // Multiply degrees by pi divided by 180 to convert to radians.
  return degrees * (Math.PI/180);
}
