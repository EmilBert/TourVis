// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = width*0.6;



// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([10, 100, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 7000])
  .range(d3.schemeGreens[9]);

  
  
  console.log(d3.schemeBlues[9]);
  console.log(d3.max(data));
  
// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { data.set(d.Country, d.y2019); })
  .await(ready);

var dataTime = d3.range(0, 25).map(function(d) {
    return new Date(1995 + d, 10, 3);
  });

  var sliderTime = 
  d3.sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(width)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(2004, 10, 3))
    .on('onchange', val => {
      d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
    });

  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 900)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

function ready(error, topo) {

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {

        if(data.get(d.properties.name.toUpperCase()) || 0){
          d.total = data.get(d.properties.name.toUpperCase()) || 0;
        }else{
          console.log(d.properties.name.toUpperCase());
          return "white";
        }
        return colorScale(d.total);
      })
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '0.8');
      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
      });
}
