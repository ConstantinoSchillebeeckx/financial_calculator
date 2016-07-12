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

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.pie()
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

    var svg = d3.select(div)
        .append('svg')
          .attr("width",960)
          .attr("height",600);
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal(d3.schemeCategory10);


    var stack = d3.stack();


    x.domain(dat.map(function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
    z.domain(dat.columns.slice(1));

    g.selectAll(".series")
      .data(stack.keys(dat.columns.slice(1))(dat))
      .enter().append("g")
        .attr("class", "series")
        .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.year); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth());

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "s"))
      .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks(10).pop()))
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .attr("fill", "#000")

    var legend = g.selectAll(".legend")
      .data(dat.columns.slice(1).reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(20," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", z);

    legend.append("text")
        .attr("x", 40)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .text(function(d) { return d; });

}
