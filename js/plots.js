/* Render a pie plot

TODO

Parameters:
===========
- dat : d3.csv parse style data
         expects this to be an array of obj
         with keys 'val' and 'name'

*/
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return Math.abs(d.val); });
function plotPie(portfolio, div) {

    var dat = pie(portfolio.totals);

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

    var svg = d3.select(div).append("svg")
        .attr("id","pieSVG")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    portfolio.pie.svg = svg;

    var pieSlices = svg.selectAll("path")
        .data(dat)
      .enter().append("path")
        .style("fill", function(d) { return color(d.data.name); })
        .attr("d",arc)
        .each(function(d) { this._current = d; }); // store the initial angles

    var pieLabels = svg.selectAll("text")
        .data(dat)
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class","arc")
        .html(function(d) { return d.value ? "(" + formatCurrency(d.data.val) + ")" : null; });

    portfolio.pie.slices = pieSlices;
    portfolio.pie.labels = pieLabels;

    return portfolio;
}

// function handles transitions
function drawPie(portfolio) {

    var dat = pie(portfolio.totals);
    var slices = portfolio.pie.slices;
    var labels = portfolio.pie.labels;

    // transition pie
    slices.data(dat)
        .transition()
        .duration(duration)
        .attrTween("d", arcTween);

    // transition pie labels
    labels.data(dat)
        .transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })

    // can't transition text
    labels.data(dat)
        .html(function(d) { return d.value ? "(" + formatCurrency(d.data.val) + ")" : null; });

}


function stackedBar(portfolio, div) {

    var layers = calcBar(portfolio.dat);

    var margin = {top: 10, right: 0, bottom: 50, left: 90},
        width = d3.select(div).node().clientWidth - margin.left - margin.right,
        height = width * 0.5 - margin.top - margin.bottom

    var svg = d3.select(div)
        .append('svg')
          .attr("id","barSVG")
          .attr("width",width + margin.left + margin.right)
          .attr("height",height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    portfolio.bar.svg = svg;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width])

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    portfolio.bar.x = x;
    portfolio.bar.y = y;

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) { return formatCurrency(d); });

    portfolio.bar.axis.x = xAxis;
    portfolio.bar.axis.y = yAxis;

    svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(layers.columns[i]); })
    .selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append('rect')
      .attr("y", height )
      .attr("height", 0)


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

    x.domain(layers[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .attr("y", -2)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)")

    drawBar(portfolio);

    return portfolio;

}

// transition bar elements
function drawBar(portfolio) {

    var layers = calcBar(portfolio.dat);
    console.log(layers)
    var x = portfolio.bar.x;
    var y = portfolio.bar.y;
    var xAxis = portfolio.bar.axis.x;
    var yAxis = portfolio.bar.axis.y;
    var svg = portfolio.bar.svg;
    var bars = portfolio.bar.bars;


    x.domain(layers[0].map(function(d) { return d.x; }));
    y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

    svg.selectAll(".layer")
        .data(layers)
      .selectAll("rect")
        .data(function(d) { return d; })
        .transition()
        .duration(duration)
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y + d.y0); })
        .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
        .attr("width", x.rangeBand() - 1);


    svg.select('.x.axis')
        .transition()
        .duration(duration)
        .call(xAxis)
      .selectAll("text")
        .attr("y", -2)
        .attr("x", 9)
        .style("text-anchor", "start");

    svg.select('.y.axis').transition().duration(duration).call(yAxis);

}
