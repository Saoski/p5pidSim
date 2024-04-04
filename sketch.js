var pSliderX = 500;
var pSliderY = 50;
var sliderDeltaY = 75;
var pSlider;
var iSlider;
var dSlider;
var font;

function preload() {
  font = loadFont('fonts/Playfair.ttf')
}

function setup() {
  createCanvas(800, 600);
  generatePIDSliders();
}

function draw() {
  background(50, 50, 50);
  fill(255, 255, 255);
  textSize(20);
  textFont(font)
  text("kP: " + round(pSlider.value(), 2), pSliderX + 3, pSliderY - 10);
  text("kI: " + round(iSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY - 10);
  text("kD: " + round(dSlider.value(), 2), pSliderX + 3, pSliderY + sliderDeltaY * 2 - 10);
}

function configureSlider(xpos, ypos) {
  let slider = createSlider(0, 100, 0, 0);
  slider.position(xpos, ypos);
  slider.size(290);
  return slider;
}

function generatePIDSliders() {
  pSlider = configureSlider(pSliderX, pSliderY);
  iSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY);
  dSlider = configureSlider(pSliderX, pSliderY + sliderDeltaY * 2);

}
