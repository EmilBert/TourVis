// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = width*0.8;

var currYear = 9;
var currnetCountry = 'SWEDEN';

var selectedRegion = "Total";
var selectedCountry = "";
const zoom = d3.zoom();
//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
.scale(70)
.center([0,20])
.translate([width / 2, height / 2]);

// Data
var data = d3.map();
var regionData = d3.map();

function update(){
  if(selectedRegion == "Total"){
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
    .defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { 
      data.set(d.Country, [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]); 
    })
    .await(ready);
  }
  else{
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
    .defer(d3.csv,  "/DataParse/Regions.csv", function(d) {
      if(selectedRegion == d.RegionOfOrigin){
        var years = [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]
        data.set(d.Country, years);
      }})
    .await(ready)
  }
}


var svg = d3.select("#map-container")
 .append("svg")
 .attr('id', 'map')
 .attr("width", "100%")
 .attr("height", "100%")
 .call(d3.zoom().on("zoom", function () {
    svg.attr("transform", d3.event.transform)
 }))
 .append("g")



update();
const buttons = d3.selectAll('input');
buttons.on('change', function(d) {
  selectedRegion = this.value;
  update();
});

/** GRADIENT BUSINESS */
var somData = [0, 211998];
var colours = [	"#bedaf7","#7ab3ef","#368ce7","#1666ba","#0000FF"];
var colourRange = d3.range(0, 1, 1.0 / (colours.length - 1));
colourRange.push(1);
		   
//Create color gradient
var colorScale = d3.scale.linear()
	.domain(colourRange)
	.range(colours)
	.interpolate(d3.interpolateHcl);

//Needed to map the values of the dataset to the color scale
var colorInterpolate = d3.scale.linear()
	.domain(d3.extent(somData))
	.range([0,1]);

//Calculate the gradient	
defs.append("linearGradient")
	.attr("id", "gradient-rainbow-colors")
	.attr("x1", "0%").attr("y1", "0%")
	.attr("x2", "100%").attr("y2", "0%")
	.selectAll("stop") 
	.data(colours)                  
	.enter().append("stop") 
	.attr("offset", function(d,i) { return i/(colours.length-1); })   
	.attr("stop-color", function(d) { return d; });

//Slider
var dataTime = d3.range(0, 25).map(function(d) {
    return new Date(1995 + d, 10, 3);
  });

  var temp = currYear;
  var step = 1000 * 60 * 60 * 24 * 365;
  var sliderTime = 
  d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(step)
    .width(width+200)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(2004, 10, 3))
    .on('onchange', val => {
      currYear=(Math.floor(val/step))-25;
      if(currYear != temp){
        console.log("OnChange kallas")
        d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        update(currYear);
        bar(currentCountry);
        temp = currYear;
      }

      
    });

  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 750)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));


function ready(error, topo) {
  // Draw the map
  svg.selectAll("g").remove();

  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#000")
    .text("a simple tooltip");

  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
    .projection(projection))
    .attr("id", function(d){return d.properties.name.toUpperCase();})
    .attr("value", function(d){return d.properties.name.toUpperCase();})
      // set the color of each country
      .attr("fill", function (d) {
        if(data.get(d.properties.name.toUpperCase())){
          
          d.total = data.get(d.properties.name.toUpperCase())[currYear];
          var color = d.total;
          
          if(color == "" || color =="..") {return "white"};
          //console.log(color)
          return colorScale(colorInterpolate(color)); 
        }else{
          // Country is missing from data
          return "white";
        }
      })
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '0.6');
             tooltip.text(d);
             return tooltip.style("visibility", "visible");
      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
             return tooltip.style("visibility", "hidden");
      }).on('click', selected)
      .on("mousemove", function(){
        return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      });
      
}



function selected() {
  d3.select('.selected').classed('selected', false);
  currentCountry=this.id;
  bar(currentCountry);
  d3.select(this).classed('selected', true);
}

//Barchart
// set the dimensions and margins of the graph
var margin_bar = {top: 30, right: 30, bottom: 70, left: 60},
width_bar = 460 - margin.left - margin.right,
height_bar = 400 - margin.top - margin.bottom;
          

//Draw the bar and parse the data
 function bar(country){

  svgA.selectAll("g").remove();
  svgA.selectAll("rect").remove();
  console.log("Bar saker tas bort")
  // Parse the Data
  d3.csv("/DataParse/Regions.csv", function(d) {
    

    let found = 0;
    for(let i=0; i < 1561 || found < 7;i++){
      if(country == d[i].Country){
        regionData.set(d[i].RegionOfOrigin, [d[i].y1995,d[i].y1996,d[i].y1997,d[i].y1998,d[i].y1999,d[i].y2000,d[i].y2001,d[i].y2002,d[i].y2003,d[i].y2004,d[i].y2005,d[i].y2006,d[i].y2007,d[i].y2008,d[i].y2009,d[i].y2010,d[i].y2011,d[i].y2012,d[i].y2013,d[i].y2014,d[i].y2015,d[i].y2016,d[i].y2017,d[i].y2018,d[i].y2019]);
        found++;
      }
    }

    regionDataCurrent = [ parseFloat(regionData.get("Africa")[currYear]), 
                          parseFloat(regionData.get("Americas")[currYear]),
                          parseFloat(regionData.get("East Asia and the Pacific")[currYear]),
                          parseFloat(regionData.get("Europe")[currYear]),
                          parseFloat(regionData.get("Middle East")[currYear]),
                          parseFloat(regionData.get("South Asia")[currYear]),
                          parseFloat(regionData.get("Other not classified")[currYear])];
//Make all nan=0 for display
for (i=0; i<7; i++){
  if (Number.isNaN(regionDataCurrent[i])){
    regionDataCurrent[i]=0;
  }
}
var max = Math.max(...regionDataCurrent);
console.log(max);
console.log(regionDataCurrent)


const data1 = [
  {region: 'Africa', value: regionDataCurrent[0]},
  {region: 'Americas', value: regionDataCurrent[1]},
  {region: 'East Asia and the Pacific', value: regionDataCurrent[2]},
  {region: 'Europe', value: regionDataCurrent[3]},
  {region: 'Middle East', value: regionDataCurrent[4]}, 
  {region: 'South Asia', value: regionDataCurrent[5]},
  {region: 'Other not classified', value: regionDataCurrent[6]}
];
    // X axis
    var x = d3.scaleBand()
    .range([ 0, width_bar ])
    .domain(data1.map(function(data1){return data1.region}))
    .padding(0.2);
    
    svgA.append("g")
      .attr("transform", "translate(0," + height_bar + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, max])
      .range([ height_bar, 0]);
      svgA.append("g").call(d3.axisLeft(y));

    // Bars
    svgA.selectAll("mybar")
      .data(data1)
      .enter()
      .append("rect")
      .attr("x", function(data1) {return x(data1.region)}) 
      .attr("y", function(data1) {return y(data1.value)})
      .attr("width", x.bandwidth())
      .attr("height", function(data1){return height_bar - y(data1.value);})
      .attr("fill", "#69b3a2")
    })
}

//Legend

var height = 400;
var width = 60;
var padding = 10;
var innerHeight = height - 2*padding;
var barWidth = 8;

var scale = d3.scale.linear()
    .domain(d3.extent(somData))
    .range([0, height]);
var yAxis = d3.axisRight(scale)
    .tickSize(barWidth * 2) 
    .ticks(4)
    .tickFormat(x => 200000-x);

var svgB = d3.select(".interface").append("svg").attr("width", width).attr("height", height);
var g = svgB.append("g").attr("transform", "translate(0," + padding + ")");

var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient").attr("id", "myGradient").attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
    linearGradient.selectAll("stop")
        .data(colours)
      .enter().append("stop")
        .attr("offset", function(d,i) { return i/(colours.length-1); })
        .attr("stop-color", function(d) { return d; });

g.append("rect")
  .attr("height", innerHeight)
  .attr("width", barWidth)
  .style("fill", "url(#myGradient)");

g.append("g")
  .call(yAxis)
  .select(".domain").remove();