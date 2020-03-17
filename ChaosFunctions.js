class aisSys{
    constructor(){
        this.chaosVars = [.95,.7,.6,3.5,.25,.1];
        this.numVars = 6;
        this.currentVars = this.chaosVars;
    }
    alterVars(vars){
        this.currentVars = vars;
    }
    alterVarsByIndex(index,newVar){
        this.currentVars[index] = newVar;
    }
    returnToChaos(){
        this.currentVars = this.chaosVars;
    }
    getNumVars(){
        return this.numVars;
    }
    f(X,vars){
        var dx = (X[2]-vars[1]) * X[0] - vars[3]*X[1];
        var dy = vars[3] * X[0] + (X[2]-vars[1]) * X[1];
        var dz = vars[2] + (vars[0]*X[2]) - (Math.pow(X[2],3)/3) - (Math.pow(X[0],2)+Math.pow(X[1],2))*(1+vars[4]*X[2]) + (vars[5]*X[2]*Math.pow(X[0],3));
        return [dx,dy,dz]
    
    }
    generateOrbit(X0,tfin,dt){
        xVals = [];
        yVals = [];
        zVals = [];
        var dt = .01;
        var t = 0;
        var tfin = 200;
        let X = X0
        while (t<tfin){
            var dX = this.f(X,this.currentVars);
            X = X.map(function (num, idx) {
                return num + dX[idx]*dt;
              });
            t = t + dt;
            xVals.push(X[0]*width);
            yVals.push(X[1]*width);
            zVals.push(X[2]*width);
        }
        return [xVals,yVals,zVals];   
    }
    generateBifurcation (dimInd,dimComInd,varInd,lim,freq){
        this.alterVarsByIndex(varInd,0);
        var X0 = [.1,0,.1]
        var change = lim/freq;
        var bif = [];
        var paramvals = []
        while (this.currentVars[varInd]<lim){
            var indList = [];
            var curOrb = this.generateOrbit(X0);
            var lastElems = curOrb.slice(Math.max(curOrb.length - 750, 0));
            for (var i = 1; i<lastElems.length-1;i++){
                if (lastElems[i][dimInd]>lastElems[i-1][dimInd]&&lastElems[i][dimInd]>lastElems[i+1][dimInd]){
                    indList.push(lastElems[i][dimComInd]);
                }
            }
            bif.push(indList);
            paramvals.push(this.currentVars[varInd])
            this.alterVarsByIndex(varInd,this.currentVars[varInd]+change);
        }
        return bif;
    }
}

class arnSys extends aisSys{
    constructor(){
        super();
        this.chaosVars = [5,3.8];
        this.numVars = 2;
        this.currentVars = this.chaosVars;
    }
    f(X,vars){
        var dx = X[1];
        var dy = X[2];
        var dz = vars[0]*X[0] - vars[1]*X[1] - X[2] - X[0]**3;
        return [dx,dy,dz]
    
    }
}

class lorSys extends aisSys{
    constructor(){
        super();
        this.chaosVars = [28,10,8/3];
        this.numVars = 3
        this.currentVars = this.chaosVars;
    }
    f(X,vars){
        var dx = vars[2]*(X[1]-X[0]);
        var dy = X[0]*(vars[0]-X[2])-X[1];
        var dz = X[0]*X[1]-vars[2]*X[2];
        return [dx,dy,dz]
    
    }
}

class burkeSys extends aisSys{
    constructor(){
        super();
        this.chaosVars = [10,4.272];
        this.numVars = 2;
        this.currentVars = this.chaosVars;
    }
    f(X,vars){
        var dx = -1*vars[0]*(X[0]+X[1]);
        var dy = -1*X[1]-vars[0]*X[0]*X[2];
        var dz = vars[1]+vars[0]*X[0]*X[1];
        return [dx,dy,dz]
    
    }
}

class chenSys extends aisSys{
    constructor(){
        super();
        this.chaosVars = [40,3,28];
        this.numVars = 3;
        this.currentVars = this.chaosVars;
    }
    f(X,vars){
        var dx = vars[0]*(X[1]-X[0]);
        var dy = (vars[2]-vars[0])*X[0]-X[0]*X[2]+vars[2]*X[1];
        var dz = X[0]*X[1]-vars[1]*X[2];
        return [dx,dy,dz]
    
    }
}

class rosslerSys extends aisSys{
    constructor(){
        super();
        this.chaosVars = [.2,.2,5.7];
        this.numVars = 3;
        this.currentVars = this.chaosVars;
    }
    f(X,vars){
        var dx = -1*X[1]-X[2];
        var dy = X[0]+vars[0]*X[1];
        var dz = vars[1]+X[2]*(X[0]-vars[2]);
        return [dx,dy,dz]
    
    }
}



function ReturnLinear() {
    var i;
    var table="<tr><th>x</th><th>y</th><th>z</th></tr>";
    let system = new arnSys();
    var x = system.generateOrbit([0,0.1,0]);
    for (i = 0; i <x.length; i++) { 
      table += "<tr><td>" +
      x[i][0] +
      "</td><td>" +
      x[i][1] +
      "</td><td>" +
      x[i][2]
      "</td></tr>";
    }
    document.getElementById("t").innerHTML = table;
  }


/*$( document ).ready(function() {
    console.log( "ready!" );
    let system = new arnSys();
    var x = system.generateOrbit([0,0.1,0]);
    var svg = d3.select("body")
            .append("svg")
            .attr("width", 500)
            .attr("height", 500);
    var xScale = d3.scaleLinear()
            .domain([-10,10])
            .range([0, 500]);
    var yScale = d3.scaleLinear()
            .domain([-10,10])
            .range([0, 500]);
    var zScale = d3.scaleLinear()
            .domain([-10,10])
            .range([0, 1]);
    var zColor = d3.scaleLinear()
            .domain([-10,10])
            .range([20, 255]);
    var zColor2 = d3.scaleLinear()
            .domain([-10,10])
            .range([100, 255]);
    svg.selectAll("circle")
            .data(x)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[1]);
            })
            .attr("cy", function(d) {
                return yScale(d[2]);
            })
           .attr("r" ,function(d){
               return zScale(d[0]);
           })
           .style("fill", function(d){
               var num = zColor(d[0]);
               var num2 = zColor2(d[0]);
               var str ="rgb("+num.toString()+","+num2.toString()+",200)";
               return str;
           });
    $(".init").on("myCustomEvent",function(event){
            var x0 = $('#X').val();
            var y0 = $('#Y').val();
            var z0 = $('#Z').val();
            console.log(x0+", "+y0+" "+z0)
            x = system.generateOrbit([z0,y0,z0]);
             svg.selectAll("circle")
            .data(x)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[1]);
            })
            .attr("cy", function(d) {
                return yScale(d[2]);
            })
           .attr("r" ,function(d){
               return zScale(d[0]);
           })
           .style("fill", function(d){
               var num = zColor(d[0]);
               var num2 = zColor2(d[0]);
               var str ="rgb("+num.toString()+","+num2.toString()+",200)";
               return str;
           });
    });
});


$( "button" ).click(function () {
    $( "#X" ).trigger( "myCustomEvent");
});*/