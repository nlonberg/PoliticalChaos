
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
  createCanvas(window.innerWidth-10, window.innerHeight-10, WEBGL); //Create 3D canvas
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
  logMap = new aisSys(.08, .13, .001);
 
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