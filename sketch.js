
//Sliders and corresponding slider variables
let refreshRate;
let refreshRateSlider;
let circleSize;
let circleSizeSlider;
let fadeRate;
let fadeRateSlider;
let graphButton;
let graphButtonVal;
let funcSel;
let funcSelVal;

//Chaos Object Declarations Below
let logMap;

//P5js calls setup() once at start of program
function setup() {
  createCanvas(1420, 800, WEBGL); //Create 3D canvas
  colorMode(HSB, 200); //Visibile spectrum (0=Red, 200=Violet)
  noStroke(); //No outlines on shapes
  
  //Create and Position Sliders and Buttons
  refreshRateSlider = createSlider(0, 100, 10);
  refreshRateSlider.position(20, 20);
  circleSizeSlider = createSlider(0, 100, 2);
  circleSizeSlider.position(20, 50);
  fadeRateSlider = createSlider(0, 100, 1);
  fadeRateSlider.position(20, 80);
  graphButton = createButton('Poincare/Bifurcation');
  graphButton.position(20,110);
  graphButton.mousePressed(changeGraphButton);
  funcSel = createSelect();
  funcSel.option('Logistic Map');
  funcSel.option('Aizawa Attractor');
  funcSel.option('Lorenz System');
  funcSel.option('Burke-Shaw Chaos');
  funcSel.option("Arnold's Cat Map");
  funcSel.option('Rossler Attractor');
  funcSel.option('Chen Attractor');
  funcSel.position(20,140);
  
  //Chaos Object Instantiations Below
  logMap = new LogisticMap(3.45, 4.0, 0.005);
}

//Called every frame
function draw() {

  //Record slider values
  refreshRate = refreshRateSlider.value();
  circleSize = circleSizeSlider.value();
  fadeRate = fadeRateSlider.value();
  
  background(400); //Set white background

  orbitControl(); //Allow user to navigate 3D space

  let modFrameVal = frameCount%refreshRate;
  funcSelVal = funcSel.value();

  //Method draws curves to canvas
  switch (funcSelVal){
    case ('Logistic Map'):
      logMap.displayContents(modFrameVal);
      break;
    case ('Aizawa Attractor'):
      logMap.displayContents(modFrameVal);
      break;
    case ('Lorenz System'):
      logMap.displayContents(modFrameVal);
      break;
    case ('Burke-Shaw Chaos'):
      logMap.displayContents(modFrameVal);
      break;
    case ("Arnold's Cat Map"):
      logMap.displayContents(modFrameVal);
      break;
    case ('Rossler Attractor'):
      logMap.displayContents(modFrameVal);
      break;
    case ('Chen Attractor'):
      logMap.displayContents(modFrameVal);
      break;
  }
}

//Event handler for graph switch
function changeGraphButton() {
  graphButtonVal = !graphButtonVal;
}

/* Base Class for Chaos Functions
 * - Container for Poincare and Bifurcation data structures
 * - Generates graph data upon construction. 
 * - Draws curves to canvas upon method call displayContents.
 * 
 * Fields:   param_0 - first initial condition value to generate curve for
 *           param_n - last initial condition value to generate curve for
 *           step - step size to iterate over initial condition vals
 *           x - current value of x in chaos function (f(x))
 *           curveQueue - contains Curve objects for drawing Poincare plot
 *           bifQueue - contains Curve objects for drawing bifurcation diagram
 *           this.indVar - independent variable (initial parameter) in function
 *           this.yMin - minimum Y value
 *           this.yMax - maximum Y value
 * 
 * Methods:  constructor(startParam,endParam,incVal):
 *              - assign params to fields (param_0, param_n, step)
 *              - instantiate queues and populate them with generateChaos
 *           generateChaos():
 *              - iterate over all initial parameter values
 *              - run function for that value
 *              - generate bifurcation and poincare curves
 *           generatePoincare(range):
 *              - range: y-values for function's final 50 generations
 *              - shift arrays to reflect t, t+1, t+2 sets
 *              - return: struct containing x, y, z sets
 *           generateBifurcation(range, samplingSize):
 *              - range: y-values for function's final 50 generations
 *              - samplingSize: number of extrema to generate coordinates for
 *              - populate bifurcation domain and range (and z set of 0s)
 *              - return: struct containing x, y, z sets
 *           findLocalExtrema(rangeSet, extremaLimit):
 *              - rangeSet: range to scan for extrema
 *              - extremaLimit: maximum amount of extrema to return
 *              - return: array of local extrema
 *           run(runLength):
 *              - runLength: domain to run function over
 *              - return: range generated running function
 *           displayContents(refreshNum):
 *              - refreshNum: frameCount iterated value that refreshes fading curves
 *              - draw contents to canvas
 *           f():
 *              - base function
 *              - child classes must override
 *           setup():
 *              - declare initial paramater values and inital x value
 *              - child classes must override
 */
class ChaosFunction {
  constructor(startParam,endParam,incVal){
    this.setup();
    this.param_0 = startParam;
    this.param_n = endParam;
    this.step = incVal;
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
    //Transform all values with canvas dimensions
    for (let i=0; i<range.length; i++) {
      dimAdjustArr.push((((range[i]-this.yMin)/(this.yMax-this.yMin))*width)-(width/2));
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
      // WEBGL canvas dimension transformations
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
    if (graphButtonVal) {
      this.bifQueue.displayContents(refreshNum);
    } else {
      this.curveQueue.displayContents(refreshNum);
    }
  }

  f(){}

  setup(){
    this.x = 0;
    this.yMin = 0;
    this.yMax = 1;
  }
}

/* Child class for logistic map chaos function
 * f(): logistic population growth function
 * setup(): declare 50% max population and population floor and max as 0 and 1.
 */
class LogisticMap extends ChaosFunction {
  f(){
    this.x = this.indVar * this.x * (1 - this.x);
  }
  setup(){
    this.x = 0.5;
    this.yMin = 0;
    this.yMax = 1;
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