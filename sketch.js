
//Sliders and corresponding slider variables
let refreshRate;
let refreshRateSlider;
let circleSize;
let circleSizeSlider;
let fadeRate;
let fadeRateSlider;
let graphButton;
let graphSwitch;

let logMap;

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
  graphButton = createButton('Poincare/Bifurcation');
  graphButton.position(20,110);
  graphButton.mousePressed(changeGraphSwitch)

  
  //Populate Queue with Chaos Curves
  //curveQueue = new SimpleQueue(500);
  
  //INSERT CHAOS FUNCTION CALL BELOW
  logMap = new LogisticMap(3.45, 4.0, 0.005); //3.6,4.0,0.005
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
  logMap.displayContents(frameCount%refreshRate);
}

function changeGraphSwitch() {
  graphSwitch = !graphSwitch;
}

class ChaosFunction {
  constructor(startParam,endParam,incVal){
    this.setup();
    this.param_0 = startParam;
    this.param_n = endParam;
    this.step = incVal;
    this.bifurcationSets = [];
    this.x = 0;
    this.curveQueue = new SimpleQueue(500);
    this.bifQueue = new SimpleQueue(500);
    this.generateChaos();
  }
  generateChaos(){
    let hueVal;
    for (let i=this.param_0; i<this.param_n; i+=this.step){
      hueVal = ((i-this.param_0)/(this.param_n-this.param_0))*160;
      this.indVar = i;
      this.setup();
      this.run(100);
      let range = this.run(50);
      let poincareStruct = this.generatePoincare(range);
      let bifStruct = this.generateBifurcation(range,500);
      this.curveQueue.enqueue(new Curve(poincareStruct,hueVal));
      this.bifQueue.enqueue(new Curve(bifStruct, hueVal));
    }
  }

  generatePoincare(range){
    let dimAdjustArr = [];
    for (let i=0; i<range.length; i++) {
      dimAdjustArr.push((range[i]*width)-(width/2));
    }
    return {xVals: dimAdjustArr.slice(0,-2),
            yVals: dimAdjustArr.slice(1,-1),
            zVals: dimAdjustArr.slice(2)};
  }

  generateBifurcation(range,samplingSize){
    let xValues = [];
    let yValues = [];
    let zValues = [];
    let extremaVals = this.findLocalExtrema(range, samplingSize);
    for (let i=0; i<extremaVals.length; i++){
      let dimX = (((this.indVar-this.param_0)/(this.param_n-this.param_0))*width)-(width/2);
      let dimY = (height/2) - (extremaVals[i]*height);
      xValues.push(dimX);
      yValues.push(dimY);
      zValues.push(0);
    }
    return {xVals: xValues, yVals: yValues, zVals: zValues};
  }

  findLocalExtrema(rangeSet, extremaLimit){
    let j = 1;
    let extremaSet = [];
    while (extremaLimit && (j<(rangeSet.length-1))) {
      if ((rangeSet[j-1]<rangeSet[j] && rangeSet[j+1]<rangeSet[j]) ||
          (rangeSet[j-1]>rangeSet[j] && rangeSet[j+1]>rangeSet[j])) {
        extremaSet.push(rangeSet[j]);
        extremaLimit--;
      }
      j++;
    }
    if (extremaSet.length == 0){
      extremaSet = [rangeSet[-1]];
    }
    return extremaSet;
  }

  run(runLength){
    var valSet = [];
    for (let i=0; i<runLength; i++){
      this.f();
      valSet.push(this.x);
    }
    return valSet;
  }

  displayContents(refreshNum){
    if (graphSwitch) {
      this.bifQueue.displayContents(refreshNum);
    } else {
      this.curveQueue.displayContents(refreshNum);
    }
  }

  f(){}

  setup(){}
}

class LogisticMap extends ChaosFunction {
  f(){
    this.x = this.indVar * this.x * (1 - this.x);
  }
  setup(){
    this.x = 0.5;
  }
}

/* Curve Object: colored, fading, regenerating spheres
 * Input: xRange,yRange,zRange - plot coordinates
 *        hueNum - HSB color of spheres
 * lifespan: decrements opacity from 200 until refreshed.
 * refresh(): reset lifespan
 * display(): draw spheres to canvas, decrement lifespan.
 */
class Curve {
  
  constructor(coordStruct, hueNum){
    this.xSet = coordStruct.xVals;
    this.ySet = coordStruct.yVals;
    this.zSet = coordStruct.zVals;
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