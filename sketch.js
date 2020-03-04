//Arrays that hold point coordinates
let xVals;
let yVals;
let zVals;

let curveQueue; //holds each curve object
let hueVal; //color of each curve

//Sliders and corresponding slider variables
let refreshRate;
let refreshRateSlider;
let circleSize;
let circleSizeSlider;
let fadeRate;
let fadeRateSlider;

function setup() {
  createCanvas(1420, 800, WEBGL); //Create 3D canvas
  colorMode(HSB, 200); //Visibile spectrum (0=Red, 200=Violet)
  noStroke(); //No outlines on shapes
  
  //Create and Position Sliders
  refreshRateSlider = createSlider(0, 100, 10);
  refreshRateSlider.position(20, 20);
  circleSizeSlider = createSlider(0, 100, 2);
  circleSizeSlider.position(20, 50);
  fadeRateSlider = createSlider(0, 100, 1);
  fadeRateSlider.position(20, 80);
  
  //Populate Queue with Chaos Curves
  curveQueue = new SimpleQueue(500);
  
  //INSERT CHAOS FUNCTION CALL BELOW
  logisticMap();
}

//Called every frame
function draw() {

  //Record slider values
  refreshRate = refreshRateSlider.value();
  circleSize = circleSizeSlider.value();
  fadeRate = fadeRateSlider.value();
  
  background(400); //Set white background

  orbitControl(); //Allow user to navigate 3D space

  //Method draws curves to canvas
  curveQueue.displayContents(frameCount%refreshRate);
}

/* Generates logistic map values.
 * Stores coordinates in xVals,yVals,zVals (via helper).
 * Creates curve objects and populates curve array.
 */
function logisticMap(){
  for (let i=3.6; i<4.0; i+=0.005){
    hueVal = ((i-3.6)/0.4)*160;
    logisticMapHelper(i);
    curveQueue.enqueue(new Curve(xVals,yVals,zVals,hueVal));
  }
}

/* Helper function for logistic map.
 * Input: growth rate (r).
 * Stores coordinates in xVals,yVals,zVals.
 */
function logisticMapHelper(rVal){
  let x = 0.5; //initial population
  let r = rVal; //growth rate
  xVals = [];
  yVals = [];
  zVals = [];
  //Run and discard first 100 generations
  for (let i=0; i<100; i++) {
    x = r * x * (1 - x);
  }
  //Record population attractors of final 50 generations
  for (let i=0; i<50; i++) {
    x = r * x * (1 - x);
    xVals.push((x*width)-(width/2)); //Transform values with canvas dimensions
  }
  //Store t, t+1, t+2 attractor values in coordinate arrays
  yVals = xVals.slice(1,-1);
  zVals = xVals.slice(2);
  xVals = xVals.slice(0,-2);
}

/* Curve Object: colored, fading, regenerating spheres
 * Input: xRange,yRange,zRange - plot coordinates
 *        hueNum - HSB color of spheres
 * lifespan: decrements opacity from 200 until refreshed.
 * refresh(): reset lifespan
 * display(): draw spheres to canvas, decrement lifespan.
 */
class Curve {
  
  constructor(xCoords,yCoords,zCoords, hueNum){
    this.xSet = xCoords;
    this.ySet = yCoords;
    this.zSet = zCoords;
    this.hue = hueNum;
    this.lifespan = 200;
  }
  refresh(){
    this.lifespan = 200;
  }
  display(){
    for (let i=0; i<this.xSet.length; i++){
      push();
      fill(this.hue, 200, 200, this.lifespan);
      translate(this.xSet[i], this.ySet[i], this.zSet[i]);
      sphere(circleSize);
      pop();
    }
    this.lifespan-=fadeRate;
  } 
}

/* SimpleQueue: partially implemented queue with fixed size
 * enqueue(): add element and dequeue overflow values FIFO.
 * displayQueue(refreshIndex): Refresh oldest curves, display all curves.
 */
class SimpleQueue {
  constructor(length){
    this.length = length;
    this.contents = [];
  }
  
  enqueue(item){
    this.contents.push(item);
    if (this.contents.length > this.length){
      this.contents.shift();
    }
  }
  
  displayContents(refreshIndex) {
    for (let i=refreshIndex; i<this.contents.length; i+=refreshRate){
      this.contents[i].refresh();
    }
    for (let i=0; i<this.contents.length; i++){
      this.contents[i].display();
    }
  }
}