// Declaration & Initalization
// --------------------------------------------------------------------------

// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = width*0.8;

// Default values
var currYear = 9;
var currentCountry = 'SWEDEN';
var selectedRegion = "Total";
var selectedCountry = "";

// Barchart
// set the dimensions and margins of the graph
var margin_bar = {top: 30, right: 30, bottom: 70, left: 60},
width_bar = 460 - margin.left - margin.right,
height_bar = 400 - margin.top - margin.bottom;


var defs = svg.append("defs");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
.scale(70)
.center([0,20])
.translate([width / 2, height / 2]);

// Data maps
var data        = d3.map();
var regionData  = d3.map();
var colorMap    = d3.map();
var maxMap      = d3.map();

// Gradient Colors
colorsPerRegion= [
  {"region":"Total","colors":[	"#bedaf7","#7ab3ef","#368ce7","#1666ba","#0000FF"]},
  {"region":"Africa","colors":[	"#E1F2A2","#9ee98b","#84BF04","#3B7302","#154001"]},
  {"region":"Americas","colors":[	"#CFEFEB","#8FCDD6","#4F89AD","#284D85","#19276e"]},
  {"region":"East Asia and the Pacific","colors":["#eb9eac","#BC0017","#9B000A","#6B0002","#420303"]},
  {"region":"Europe","colors":[	"#D9C2A7","#DBA775","#A6754B","#733E10","#401E01"]},
  {"region":"Middle East","colors":["#F2C53D","#F28E13","#D96907","#A63F03","#732002"]},
  {"region":"South Asia","colors":[	"#97ED8A","#45BF55","#168039","#044D29","#00261C"]},
  {"region":"Other not classified","colors":[	"#BEBEBE","#8E8D8B","#59595B","#404040","#0B0B0B"]}
]
maxAmountPerRegion= [
  {"region":"Total","max":220000},
  {"region":"Africa","max":8000},
  {"region":"Americas","max":50000},
  {"region":"East Asia and the Pacific","max":150000},
  {"region":"Europe","max":90000},
  {"region":"Middle East","max":12000},
  {"region":"South Asia","max":5000},
  {"region":"Other not classified","max":7100}
]

for(let i = 0; i < colorsPerRegion.length; i++){
  colorMap.set(colorsPerRegion[i].region, colorsPerRegion[i].colors);
}
for(let i = 0; i < maxAmountPerRegion.length; i++){
  maxMap.set(maxAmountPerRegion[i].region, maxAmountPerRegion[i].max);
}
// Zoom & Pan
// --------------------------------------------------------------------------
var svg = d3.select("#map-container")
 .append("svg")
 .attr('id', 'map')
 .attr("width", "100%")
 .attr("height", "100%")
 .call(d3.zoom().on("zoom", function () {
    svg.attr("transform", d3.event.transform)
 }))
.append("g");
 
update();

const buttons = d3.selectAll('input');
buttons.on('change', function(d) {
  selectedRegion = this.value;
  updateGradientLegend(selectedRegion);
  update();
});

// GRADIENT LEGEND SETUP
// --------------------------------------------------------------------------
var maxValue = maxMap.get("Total");
var somData = [0, maxValue];
var colors = colorMap.get("Total")
var colorRange = d3.range(0, 1, 1.0 / (colors.length - 1));
colorRange.push(1);
		   
//Create color gradient
var colorScale = d3.scale.linear()
	.domain(colorRange)
	.range(colors)
	.interpolate(d3.interpolateHcl);

//Needed to map the values of the dataset to the color scale
var colorInterpolate = d3.scale.linear()
	.domain(d3.extent(somData))
	.range([0,1]);

//Calculate the gradient	
defs.append("linearGradient")
	  .attr("id", "gradient-rainbow-colors")
    .attr("x1", "0%").attr("y1", "100%")
	  .attr("x2", "0%").attr("y2", "0%")
	  .selectAll("stop") 
	  .data(colors)                  
	  .enter().append("stop") 
	  .attr("offset", function(d,i) { return i/(colors.length-1); })   
	  .attr("stop-color", function(d) { return d; });

//Slider
// --------------------------------------------------------------------------
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

 
//Legend
// --------------------------------------------------------------------------
drawLegend();

function drawMap(error, topo) {
  // Draw the map
  svg.selectAll("g").remove();
  d3.selectAll(".tooltip").remove();
  
  var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip");

  d3.select(".tooltip").append("h4");
  d3.select(".tooltip").append("p");

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
          return colorScale(colorInterpolate(color)); 
        }else{
          // Country is missing from data
          return "white";
        }
      })
      .on('mouseover', function (d, i) {
        if(data.get(d.properties.name.toUpperCase())){
          var arrivals = data.get(d.properties.name.toUpperCase())[currYear];
          if(arrivals == "" || arrivals =="..") {arrivals =  "Missing data"} 
          else{ arrivals = arrivals + " Arr."};
        }
        d3.select(this).transition()
            .duration('50')
             .attr('opacity', '0.6');
             tooltip.select("h4").text(this.id);
             tooltip.select("p").text(arrivals);
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

// Update the map with correct data
// source for map https://github.com/johan/world.geo.json
function update(){
  if(selectedRegion == "Total"){
      d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
      .defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { 
        data.set(d.Country, [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]); 
      })
      .await(drawMap);
  }
  else{
    d3.queue().defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
      .defer(d3.csv,  "/DataParse/Regions.csv", function(d) {
        if(selectedRegion == d.RegionOfOrigin){
          var years = [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]
          data.set(d.Country, years);
        }})
        .await(drawMap)
  }
}

// Apply changes on selected country
function selected() {
  d3.select('.selected').classed('selected', false);
  currentCountry=this.id;
  bar(currentCountry);
  d3.select(this).classed('selected', true);
}

// Draw the bar and parse the data
function bar(country){2
  // Parse the Data
d3.csv("/DataParse/Regions.csv", function(d) 
{
  let found = 0;
  for(let i=0; i < 1561 || found < 7;i++){
    if(country == d[i].Country){
      regionData.set(d[i].RegionOfOrigin, [d[i].y1995,d[i].y1996,d[i].y1997,d[i].y1998,d[i].y1999,d[i].y2000,d[i].y2001,d[i].y2002,d[i].y2003,d[i].y2004,d[i].y2005,d[i].y2006,d[i].y2007,d[i].y2008,d[i].y2009,d[i].y2010,d[i].y2011,d[i].y2012,d[i].y2013,d[i].y2014,d[i].y2015,d[i].y2016,d[i].y2017,d[i].y2018,d[i].y2019]);
      found++;
    }
  }
  regionDataCurrent = [ 
    parseFloat(regionData.get("Africa")[currYear]), 
    parseFloat(regionData.get("Americas")[currYear]),
    parseFloat(regionData.get("East Asia and the Pacific")[currYear]),
    parseFloat(regionData.get("Europe")[currYear]),
    parseFloat(regionData.get("Middle East")[currYear]),
    parseFloat(regionData.get("South Asia")[currYear]),
    parseFloat(regionData.get("Other not classified")[currYear])
  ];
  //Make all nan=0 for display
  var counter = 0;
  for (i=0; i<7; i++){
    if (Number.isNaN(regionDataCurrent[i])){
      regionDataCurrent[i]=0;
      counter++  
    }
    if (counter == 7){
      var ancm = "missing data";
    } else var ancm = "";

  svgA.selectAll("g").remove();
  svgA.selectAll("text").remove();
  svgA.selectAll("rect").remove();

  }
  var max = Math.max(...regionDataCurrent);
  const data1 = [
    {region: 'Africa', value: regionDataCurrent[0]},
    {region: 'Americas', value: regionDataCurrent[1]},
    {region: 'East Asia and the Pacific', value: regionDataCurrent[2]},
    {region: 'Europe', value: regionDataCurrent[3]},
    {region: 'Middle East', value: regionDataCurrent[4]}, 
    {region: 'South Asia', value: regionDataCurrent[5]},
    {region: 'Other not classified', value: regionDataCurrent[6]}
  ];
  svgA.append("text")
    .attr("text-anchor", "start")
    .attr("x", 0)
    .attr("y", -20)
    .text(country);

  svgA.append("text")
    .attr("text-anchor", "end")
    .attr("x", 200)
    .attr("y", -20)
    .text(ancm);

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
  svgA.selectAll(".bartext")
    .data(data1)
    .enter()
    .append("text")
    .classed('bartext', true)
    .attr("x", function(data1) {return x(data1.region)}) 
    .attr("y", function(data1) {return y(data1.value)})
    .attr("width", x.bandwidth())
    .attr("height", function(data1){return height_bar - y(data1.value);})
    .text(function(data1) {return (data1.value)})
    .style("width", x.bandwidth())
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + x.bandwidth()/2 + ",-5)")
})
} 

// Update Legend
function updateGradientLegend()
{
  defs.select(".linearGradient")
  maxValue = maxMap.get(selectedRegion);
  somData = [0, maxValue];
  colors = colorMap.get(selectedRegion);
  colorRange = d3.range(0, 1, 1.0 / (colors.length - 1));
  colorRange.push(1);
		   
  //Create color gradient
  colorScale = d3.scale.linear()
	  .domain(colorRange)
	  .range(colors)
	  .interpolate(d3.interpolateHcl);

  //Needed to map the values of the dataset to the color scale
  colorInterpolate = d3.scale.linear()
	  .domain(d3.extent(somData))
	  .range([0,1]);

  defs.select("linearGradient").remove();
  //Calculate the gradient	
  defs.append("linearGradient")
	  .attr("id", "gradient-rainbow-colors")
    .attr("x1", "0%").attr("y1", "100%")
	  .attr("x2", "0%").attr("y2", "0%")
	  .selectAll("stop") 
	  .data(colors)                  
	  .enter().append("stop") 
	  .attr("offset", function(d,i) { return i/(colors.length-1); })   
	  .attr("stop-color", function(d) { return d; });

  d3.select('#map-legend').remove();
  drawLegend();
}

// Draw Gradient Legend
function drawLegend()
{
  var height = 400;
  var width = 70;
  var padding = 10;
  var innerHeight = height - 2*padding;
  var barWidth = 8;
  
  var scale = d3.scale.linear()
    .domain(d3.extent(somData))
    .range([height, 0]);
    
  var yAxis = d3.axisRight(scale)
    .tickSize(barWidth * 2) 
    .ticks(4)
    .tickFormat(x => x)
    .tickValues( scale.ticks(5).concat(scale.domain()));
  
  var svgB  = d3.select("#legend-container").append("svg").attr("width", width).attr("height", height).attr('id','map-legend');
  var g     = svgB.append("g").attr("transform", "translate(0," + padding + ")");

  g.append("rect")
    .attr("height", innerHeight)
    .attr("width",  barWidth)
    .style("fill", "url(#gradient-rainbow-colors)");

  g.append("g")
    .call(yAxis)
    .select(".domain").remove()
}