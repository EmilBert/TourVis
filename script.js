// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = width*0.6;

var currYear = 9;

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

// Load external data and boot
function update(){
d3.queue()

.defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
.defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { data.set(d.Country, [d.y1995,d.y1996,d.y1997,d.y1998,d.y1999,d.y2000,d.y2001,d.y2002,d.y2003,d.y2004,d.y2005,d.y2006,d.y2007,d.y2008,d.y2009,d.y2010,d.y2011,d.y2012,d.y2013,d.y2014,d.y2015,d.y2016,d.y2017,d.y2018,d.y2019]); })
.await(ready);
}
update();

/** GRADIENT BUSINESS */

console.log(countryMax);

var somData = [0,10,100,1000,10000,100000, 2000000]
var colours = ["#2c7bb6", "#00a6ca","#00ccbc"];
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

//Regions
  var sets = [
    {
        name: 'Europe',
        set: d3.set(['BEL', 'CHE', 'DEU', 'AUT', 'ESP', 'FRA', 'ATF', 
        'GBR', 'GGY', 'JEY', 'FLK', 'SGS', 'GRC', 'MLT', 'IRL', 'ITA', 
        'LUX', 'NLD', 'AND', 'POL', 'PRT', 'TUR', 'CYP', 'CYN', 'MON', 
        'ALD', 'IMN', 'LTU', 'LVA', 'EST', 'BLR', 'UKR', 'MDA', 'ROU', 
        'HUN', 'SVK', 'SVN', 'HRV', 'BIH', 'CZE', 'BGR', 'KOS', 'MKD', 
        'ALB', 'MNE', 'SRB', 'DNK', 'FRO', 'FIN', 'GRL', 'ISL', 'NOR', 
        'SWE']),
    },

    {
        name: 'Americas',
        set: d3.set(['CAN', 'MEX', 'USA', 'BLZ', 'CRI', 'CUB', 'GTM', 
        'HND', 'NIC', 'PAN', 'SLV', 'HTI', 'JAM', 'DOM', 'PRI', 'BHS', 
        'TCA', 'ATG', 'DMA', 'BRB', 'GRD', 'ARG', 'BOL', 'BRA', 'CHL', 
        'COL', 'ECU', 'FLK', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN', 
        'TTO'])
    },
    {
        name: 'Africa',
        set: d3.set(['AGO', 'BDI', 'BEN', 'BFA', 'BWA', 'CAF', 'CIV', 
        'CMR', 'COD', 'COD', 'COG', 'COM', 'CPV', 'DJI', 'DZA', 'EGY', 
        'ERI', 'ETH', 'GAB', 'GHA', 'GIN', 'GMB', 'GNB', 'GNQ', 'KEN', 
        'LBR', 'LBY', 'LSO', 'MAR', 'MDG', 'MLI', 'MOZ', 'MRT', 'MUS', 
        'MWI', 'MYT', 'NAM', 'NER', 'NGA', 'REU', 'RWA', 'ESH', 'SDN', 
        'SDS', 'SEN', 'SHN', 'SHN', 'SLE', 'SOM', 'SOL', 'SSD', 'STP', 
        'STP', 'SWZ', 'SYC', 'TCD', 'TGO', 'TUN', 'TZA', 'TZA', 'UGA', 
        'ZAF', 'ZMB', 'ZWE'])
    },
    {
        name: 'Oceania',
        set: d3.set(['AUS', 'NZL'])
    },
    {
        name: 'Asia',
        set: d3.set(['IND', 'BGD', 'LKA', 'AZE', 'ARE', 'QAT', 'IRN', 'AFG', 
        'PAK', 'BHR', 'SAU', 'YEM', 'OMN', 'SYR', 'JOR', 'IRQ', 'KWT', 'ISR', 
        'LBN', 'PSX', 'PSR', 'GEO', 'ARM', 'RUS', 'KAZ', 'UZB', 'TKM', 'KGZ', 
        'TJK', 'BTN', 'CHN', 'JPN', 'IDN', 'MNG', 'NPL', 'MMR', 'THA', 'KHM', 
        'LAO', 'VNM', 'PRK', 'KOR', 'TWN', 'MYS', 'PNG', 'SLB', 'VUT', 'NCL', 
        'BRN', 'PHL', 'TLS', 'HKG', 'FJI', 'GUM', 'PLW', 'FSM', 'MNP', 'KAS'])
    },
];

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
      .attr("id", function(d){
        return d.id;
      })
      // set the color of each country
      .attr("fill", function (d) {
        if(data.get(d.properties.name.toUpperCase()) || 0){
         
          d.total = data.get(d.properties.name.toUpperCase())[24];
          var color = d.total*10;
          return colorScale(colorInterpolate(color)); 

        }else{
          // Country is missing from data
          console.log(d.properties.name.toUpperCase());
          return "white";
        }
        
        
      })
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '0.8');
        //Merge regions
             for (var i = 0; i < sets.length; i++) {
              if (sets[i].set.has(d.id)){
                console.log(sets[i].name)
              }
          }
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

