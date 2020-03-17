/* Base Class for Chaos Functions
 * - Container for Poincare and Bifurcation data structures
 * - Generates graph data upon construction. 
 * - Draws curves to canvas upon method call displayContents.
 * 
 * Fields:   x0 - initial condition for system
 *           param_0 - first chaotic parameter value to generate curve for
 *           param_n - last chaotic parameter value to generate curve for
 *           step - step size to iterate over chaotic parameter vals
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
 *           generateOrbit(range):
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
      let maxOrbitStructs = 15;
      let allowOrbitCount = (this.param_n-this.param_0)/(maxOrbitStructs);
      for (let i=this.param_0; i<this.param_n; i+=this.step){
        hueVal = ((i-this.param_0)/(this.param_n-this.param_0))*160;
        this.indVar = i;
        this.setup();
        this.run(100);
        let range = this.run(3000);
        if (i%allowOrbitCount<this.step){
            let orbitStruct = this.generateVisualOrbit(range);
            this.curveQueue.enqueue(new Curve(orbitStruct,hueVal));
        }
        let bifStruct = this.generateBifurcation(range,700,this.minDim,this.maxDim);
        this.bifQueue.enqueue(new Curve(bifStruct, hueVal));
      }
    }
  
    generateVisualOrbit(range){
      let dimAdjustArr = [];
      for(let i=0;i<range[0].length;i++){
        dimAdjustArr.push([]);
      }

      let allowedDisplayPoints = 500;
      let allowPointMod = range.length/allowedDisplayPoints;
      //Transform all values with canvas dimensions
      for (let i=0; i<range.length; i++) {
        if (i%allowPointMod<1){
            for(let j=0; j<range[0].length;j++){
                dimAdjustArr[j].push((((range[i][j]-this.yMin)/(this.yMax-this.yMin))*width)-(width/2));
            }
        }
      }
      let dimensionalStruct = this.getVisualDimensions(dimAdjustArr);
      return {xVals: dimensionalStruct[0],
              yVals: dimensionalStruct[1],
              zVals: dimensionalStruct[2]};
    }
  
    generateBifurcation(range,samplingSize,feedDim,responseDim){
      let xValues = [];
      let yValues = [];
      let zValues = [];
      let extremaVals = this.findLocalExtrema(range, samplingSize,feedDim,responseDim);
      for (let i=0; i<extremaVals.length; i++){
        // WEBGL canvas dimension transformations
        let dimX = (((this.indVar-this.param_0)/(this.param_n-this.param_0))*width)-(width/2);
        let dimY = height*(extremaVals[i])*((this.yMax-this.yMin))/2;
        xValues.push(dimX);
        yValues.push(dimY);
        zValues.push(0);
      }
      return {xVals: xValues, yVals: yValues, zVals: zValues};
    }
  
    findLocalExtrema(rangeSet, extremaLimit, feedDim, responseDim){
      let j = 1;
      let extremaSet = [];
      while (extremaLimit && (j<(rangeSet.length-1))) {
        if ((rangeSet[j-1][feedDim]<rangeSet[j][feedDim] && rangeSet[j+1][feedDim]<rangeSet[j][feedDim])/* ||
            (rangeSet[j-1][feedDim]>rangeSet[j][feedDim] && rangeSet[j+1][0]>rangeSet[j][feedDim])*/) {
          extremaSet.push(rangeSet[j][responseDim]);
          extremaLimit--;
        }
        j++;
      }
      if (extremaSet.length == 0){
          console.log("No extreme");
        extremaSet = [rangeSet[0][responseDim]];
      }
      return extremaSet;
    }
  
    run(runLength){
      var valSet = [];
      for (let i=0; i<runLength; i++){
        this.f();
        valSet.push(this.X);
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

    getVisualDimensions(dimAdjustArr){
        return dimAdjustArr;
    }
  
    setup(){
      let X0 = [0];
      this.X = X0;
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
      this.X = [this.indVar * this.X[0] * (1 - this.X[0])];
    }
    setup(){
      let X0 = [.5];
      this.X = X0;
      this.yMin = 0;
      this.yMax = 1;
      this.minDim = 0;
      this.maxDim = 0;
    }
    getVisualDimensions(dimAdjustArr){
        return [dimAdjustArr[0].slice(0,-2),
        dimAdjustArr[0].slice(1,-1),
        dimAdjustArr[0].slice(2)];
    }
  }
  
  class continuousSystem extends ChaosFunction{
    setup(){
      let X0 = [.1,.1,.05];
      this.X = X0;
      this.minDim = 1;
      this.maxDim = 0;
      this.dt = .01;
      this.setLimits();
    }
    next(dx,dy,dz){
      let x = this.X[0]+dx*this.dt;
      let y = this.X[1]+dy*this.dt;
      let z = this.X[2]+dz*this.dt;
      this.X = [x,y,z]; 
    }
  }

  class aisSys extends continuousSystem{
    setLimits(){
      this.yMin = -5;
      this.yMax = 5;
      this.vars = [.95,.7,.6,3.5,.25,.1];
    }
    f(){
        var dx = (this.X[2]-this.vars[1]) * this.X[0] - this.vars[3]*this.X[1];
        var dy = this.vars[3] * this.X[0] + (this.X[2]-this.vars[1]) * this.X[1];
        var dz = this.vars[2] + (this.vars[0]*this.X[2]) - (Math.pow(this.X[2],3)/3) - (Math.pow(this.X[0],2)+Math.pow(this.X[1],2))*(1+this.vars[4]*this.X[2]) + (this.indVar*this.X[2]*Math.pow(this.X[0],3));
        this.next(dx,dy,dz);
      }
}

class arnSys extends continuousSystem{
    setLimits(){
      this.yMin = -50;
      this.yMax = 50;
      this.vars = [5,3.8];
    }
    f(){
        var dx = this.X[1];
        var dy = this.X[2];
        var dz = this.vars[0]*this.X[0] - this.indVar*this.X[1] - this.X[2] - this.X[0]**3;
        this.next(dx,dy,dz);
    }
}

class burkeSys extends continuousSystem{
  setLimits(){
    this.yMin = -5;
    this.yMax = 5;
    this.vars = [10,4.272];
  }
  f(){
      var dx = -1*this.vars[0]*(this.X[0]+this.X[1]);
      var dy = -1*this.X[1]-this.vars[0]*this.X[0]*this.X[2];
      var dz = this.indVar+this.vars[0]*this.X[0]*this.X[1];
      this.next(dx,dy,dz);
  }
}

class chenSys extends continuousSystem{
  setLimits(){
    this.yMin = -100;
    this.yMax = 100;
    this.vars = [40,3,28];
  }
  f(){
      var dx = this.vars[0]*(this.X[1]-this.X[0]);
      var dy = (this.indVar-this.vars[0])*this.X[0]-this.X[0]*this.X[2]+this.indVar*this.X[1];
      var dz = this.X[0]*this.X[1]-this.vars[1]*this.X[2];
      this.next(dx,dy,dz);
  }
}

class rosslerSys extends continuousSystem{
  setLimits(){
    this.yMin = -10;
    this.yMax = 10;
    this.vars = [.2,.2,5.7];
  }
  f(){
    var dx = -1*this.X[1]-this.X[2];
    var dy = this.X[0]+this.vars[0]*this.X[1];
    var dz = this.vars[1]+this.X[2]*(this.X[0]-this.indVar);
    this.next(dx,dy,dz);
  }
}


class lorenzSys extends continuousSystem{
  setLimits(){
    this.yMin = -50;
    this.yMax = 50;
    this.vars = [28,10,8/3];
  }
  f(){
    var dx = this.indVar*(this.X[1]-this.X[0]);
    var dy = this.X[0]*(this.vars[0]-this.X[2])-this.X[1];
    var dz = this.X[0]*this.X[1]-this.indVar*this.X[2];
    this.next(dx,dy,dz);
  }
}
