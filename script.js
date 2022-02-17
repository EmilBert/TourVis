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
  .domain([10, 100, 1000, 1500, 2000, 3000, 4000, 5000, 6000])
  .range(d3.schemeBlues[9]);



// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .defer(d3.csv,  "/DataParse/arrivals.csv", function(d) { data.set(d.Country, d.y2019); })
  .await(ready);


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
        d.total = data.get(d.properties.name.toUpperCase()) || 0;
        return colorScale(d.total);
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
      });
}
