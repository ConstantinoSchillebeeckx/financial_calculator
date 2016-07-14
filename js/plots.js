/* Render a pie plot

TODO

Parameters:
===========
- data : d3.csv parse style data
         expects this to be an array of obj
         with keys 'val' and 'name'

*/
function plotPie(data, div) {

    var width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;

    //var color = d3.scaleOrdinal(d3.schemeCategory10);
    var color = d3.scale.category10();

    //var arc = d3.arc()
    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    //var labelArc = d3.arc()
    var labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    //var pie = d3.pie()
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return Math.abs(d.val); });

    var svg = d3.select(div).append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.name + " (" + formatCurrency(d.data.val) + ")"; });
}




function stackedBar(data, div) {

    // subsample to every year
    var dat = data.filter(function(value, index, Arr) {
        return index % 12 == 0;
    });
    dat['columns'] = data.columns;

    var margin = {top: 30, right: 90, bottom: 50, left: 20},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom

    var svg = d3.select(div)
        .append('svg')
          .attr("width",960)
          .attr("height",600)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //var x = d3.scaleBand()
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width])
        //.padding(0.1)
        //.align(0.1);

    //var y = d3.scaleLinear()
    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    //var z = d3.scaleOrdinal(d3.schemeCategory10);
    var z = d3.scale.category10();

    //var stack = d3.stack();
    var layers = d3.layout.stack()(dat.columns.map(function(c) {
        return dat.map(function(d) {
            return {x: d.year, y: d[c]};
        });
    }))
    console.log(dat)

    x.domain(layers[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .tickFormat(function(d) { return formatCurrency(d); });

    var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return z(i); });

    layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1);

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

    var legend = svg.selectAll(".legend")
      .data(dat.columns.slice(1).reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(20," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", function(d,i) { return z(i); });

    legend.append("text")
        .attr("x", 40)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d; });

}
