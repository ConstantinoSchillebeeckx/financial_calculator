/* Render a pie plot

TODO

Parameters:
===========
- dat : d3.csv parse style data
         expects this to be an array of obj
         with keys 'val' and 'name'

*/
function plotPie(portfolio, div) {

    var data = portfolio.totals;

    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var width = d3.select(div).node().clientWidth - margin.left - margin.right;
        height = width * 0.8 - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;


    arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelOffset = 60;
    labelArc = d3.svg.arc()
        .outerRadius(radius - labelOffset)
        .innerRadius(radius - labelOffset);

    pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return Math.abs(d.val); });

    var svg = d3.select(div).append("svg")
        .attr("id","pieSVG")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var pieDat = svg.selectAll("path")
        .data(pie(data))
      .enter().append("path")
        .style("fill", function(d) { return color(d.data.name); })
        .attr("d",arc)
        .each(function(d) { this._current = d; }); // store the initial angles

    var pieLabels = svg.selectAll("text")
        .data(pie(data))
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class","arc")
        .html(function(d) { return d.value ? "(" + formatCurrency(d.data.val) + ")" : null; });

    portfolio.pieDat = pieDat;
    portfolio.pieLabels = pieLabels;

    return portfolio;
}




function stackedBar(portfolio, div) {

    var data = portfolio.dat;

    var layers = calcBar(data);

    var margin = {top: 10, right: 0, bottom: 50, left: 90},
        width = d3.select(div).node().clientWidth - margin.left - margin.right,
        height = width * 0.5 - margin.top - margin.bottom

    var svg = d3.select(div)
        .append('svg')
          .attr("id","barSVG")
          .attr("width",width + margin.left + margin.right)
          .attr("height",height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width])

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    x.domain(layers[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) { return formatCurrency(d); });

    var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(layers.columns[i]); })
    .selectAll("rect")
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
      .attr("transform", "translate(0,0)")
      .call(yAxis);

    var legend = svg.selectAll(".legend")
      .data(layers.columns)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(20," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", function(d,i) { return color(layers.columns[i]); });

    legend.append("text")
        .attr("x", 40)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d; });


    portfolio.barDat = layer;
    portfolio.barX = x;
    portfolio.barY = y;

    return portfolio;

}
