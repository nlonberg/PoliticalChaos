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
    console.log(dimAdjustArr +" sliced "+ dimAdjustArr.slice(0,-2));
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