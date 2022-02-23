// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = width*0.6;

var currYear = 9;

var selectedRegion = "Total";

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
var countryMax = 0;

function update(){
  if(selectedRegion == "Total"){
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
    .defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { 
      data.set(d.Country, [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]); })
    .await(ready);
  }
  else{
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
    .defer(d3.csv,  "/DataParse/Regions.csv", function(d) {
      if(selectedRegion == d.RegionOfOrigin){
      var years = [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]
      data.set(d.Country, years);
    }
    
  })
  .await(ready);
}
}

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

  var step = 1000 * 60 * 60 * 24 * 365;
  var sliderTime = 
  d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(step)
    .width(width)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(2004, 10, 3))
    .on('onchange', val => {
      d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
      currYear=(Math.floor(val/step))-25;
      update(currYear);
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

  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .attr("id", function(d){
        return d.name;
      })
      // set the color of each country
      .attr("fill", function (d) {
        if(data.get(d.properties.name.toUpperCase())){
          
          d.total = data.get(d.properties.name.toUpperCase())[currYear];
          var color = d.total;
          
          if(color == "" || color =="..") {return "white"};
          console.log(color)
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
        //Merge regions
              // for (var i = 0; i < sets.length; i++) {
              //   if (sets[i].set.has(d.id)){
              //     console.log(sets[i].name);
              //   }
              // }
      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
      }).on('click', selected);
}

function selected() {
  d3.select('.selected').classed('selected', false);
  d3.select(this).classed('selected', true);
}

//Barchart
// set the dimensions and margins of the graph
var margin_bar = {top: 30, right: 30, bottom: 70, left: 60},
width_bar = 460 - margin.left - margin.right,
height_bar = 400 - margin.top - margin.bottom;
          
// append the svg object to the body of the page
var svgA = d3.select("#d3-container")
  .append("svg")
  .attr("width", width_bar + margin_bar.left + margin_bar.right)
  .attr("height", height_bar + margin_bar.top + margin_bar.bottom)
  .append("g")
  .attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");

function bar(){
  // Parse the Data
  d3.csv("/DataParse/Regions.csv", function(data1) {

    // X axis
    var x = d3.scaleBand()
      .range([ 0, width_bar ])
      .domain(data1.map(function(d) { return d.RegionOfOrigin; }))
      .padding(0.2);
    svgA.append("g")
      .attr("transform", "translate(0," + height_bar + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 13000])
      .range([ height_bar, 0]);
    svgA.append("g")
      .call(d3.axisLeft(y));
    
    // Bars
    svgA.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.RegionOfOrigin); }) 
        .attr("y", function(d) { return y(); })         //Värdet på y-axeln
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height_bar - y(d.Value); })
        .attr("fill", "#69b3a2")
    
    })
}
