

/* -------------------------------------------

                PIE PLOT

----------------------------------------------*/

/*
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

var tipPie = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d + "</span>";
  })

function plotPie(portfolio, div) {

    // set initial data to 0 so that we can transition from zero
    var tmp = [{'name':'fee', 'val':0},
                {'name':'contributions', 'val':0},
                {'name':'inflation', 'val':0},
                {'name':'interest', 'val':0}];
    var dat = pie(tmp);

    var margin = {top: 10, right: 0, bottom: 10, left: 10};
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

    //svg.call(tipPie);

    portfolio.pie.svg = svg;

    var pieSlices = svg.selectAll("path")
        .data(dat)
      .enter().append("path")
        .style("fill", function(d) { return color(d.data.name); })
        .attr("d",arc)
        .each(function(d) { this._current = d; }) // store the initial angles

    var pieLabels = svg.selectAll("text")
        .data(dat)
      .enter().append("text")
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class","arc")
        .html(function(d) { return d.value ? formatCurrency(d.data.val) : null; })

    portfolio.pie.slices = pieSlices;
    portfolio.pie.labels = pieLabels;

    drawPie(portfolio);

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
        .html(function(d) { return d.value ? formatCurrency(d.data.val) : null; });

}








/* -------------------------------------------

            STACKED BAR CHART

----------------------------------------------*/


var tipBar = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    var html = '<span style="color:red">' + d[0].x + '</span><hr>' // year
    d.map(function(e) {
        html += '<p>' + e.name + ': ' + formatCurrency(e.y0 + e.y) + '</p><br>';
    });
    return html;
  })


var margin = {top: 10, right: 0, bottom: 10, left: 70};
function stackedBar(portfolio, div) {

    var layers = calcBar(portfolio.dat);

    width = d3.select(div).node().clientWidth - margin.left - margin.right;
    height = width * 0.5 - margin.top - margin.bottom

    var svg = d3.select(div)
        .append('svg') // viewbox is set after rendering chart
          .attr("id","barSVG")
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //svg.call(tipBar);

    portfolio.bar.svg = svg;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width])

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    // save elements so that we can update them later
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

    y.domain([
        d3.min(layers[layers.length - 1], function(d) { return d.y0; }),
        d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })
    ]).nice();

    svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
    .selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append('rect')
      .style("fill", function(d, i) { return color(layers.columns[i]); })
      .attr("y", y(0) )
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


    svg.append("g")
        .attr("class", "x axis")
        .attr('transform','translate(0,' + y(0) + ')')
        .attr("opacity", 1e-6)
        .call(xAxis)

    svg.append("g")
      .attr("class", "y axis")
      .attr('id','y')
      .attr("transform", "translate(0,0)")


    drawStackedBar(portfolio);

    fitViewBox('#barSVG');

    return portfolio;

}

// transition bar elements
function drawStackedBar(portfolio) {

    var layers = calcBar(portfolio.dat);
    var x = portfolio.bar.x;
    var y = portfolio.bar.y;
    var xAxis = portfolio.bar.axis.x;
    var yAxis = portfolio.bar.axis.y;
    var svg = portfolio.bar.svg;
    var bars = portfolio.bar.bars;


    x.domain(layers.map(function(d) { return d[0].x; }));
    y.domain([
        d3.min(layers[layers.length - 1], function(d) { return d.y0; }),
        d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })
    ]).nice();

    var bars = svg.selectAll(".layer")
        .data(layers)


    // exit bars
    bars.exit()
        .transition()
        .duration(duration)
        .attr("y", height )
        .attr("height", 0)
        .style('fill-opacity', 1e-6)
        .remove()

    // add bars for those entering
    bars.enter()
      .append("g")
      .attr("class", "layer")
    .selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append('rect')
      .style("fill", function(d, i) { return color(layers.columns[i]); })
      .attr("y", height )
      .attr("height", 0)
          

    // transition bars to proper height/pos
    bars.selectAll("rect")
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
        .attr('opacity',1)
        .attr('width',0)
        .attr('transform','translate(0,' + y(0) + ')');

    svg.select('#y').transition().duration(duration).call(yAxis);

}










/* -------------------------------------------

                BAR CHART

----------------------------------------------*/
function barChart(portfolio, div) {

    var margin = {top: 10, right: 0, bottom: 10, left: 80};
    var data = portfolio.totals;

    width = d3.select(div).node().clientWidth - margin.left - margin.right;
    height = d3.select('#barPlot1').node().clientHeight - margin.top - margin.bottom 

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickFormat(function(d) { return formatCurrency(d); });


    var svg = d3.select(div)
        .append("svg") // viewBox set later
        .attr('id','simpleBar')
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    portfolio.simpleBar = {};
    portfolio.simpleBar.svg = svg;
    portfolio.simpleBar.height = height;
    portfolio.simpleBar.axis = {};
    portfolio.simpleBar.y = y
    portfolio.simpleBar.axis.y = yAxis;

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.val; })]);

      svg.append("g")
          .attr("class", "y axis")
          .attr('id','y2')
          .call(yAxis)

      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.name); })
          .attr("width", x.rangeBand())
          .attr("y", height)
          .attr('fill', function(d) { return color(d.name); })  
          .attr('height', 0);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

    updateSimpleBar(portfolio);

    fitViewBox('#simpleBar');
    return portfolio;
}


function updateSimpleBar(portfolio) {

    var data = portfolio.totals;
    var y = portfolio.simpleBar.y;
    var svg = portfolio.simpleBar.svg;
    var yAxis = portfolio.simpleBar.axis.y;

    y.domain([0, d3.max(data, function(d) { return d.val; })]).nice();

    var tmp = data[3].val
    console.log(tmp)
    console.log(y(tmp))
    console.log(portfolio.simpleBar.height - y(tmp))

    // there are no entering or exiting bars
    // only need to adjust height
    svg.selectAll('rect')
        .data(data)
        .transition()
        .duration(duration)
        .attr("y", function(d) { return y(d.val); })
        .attr("height", function(d) { return portfolio.simpleBar.height - y(d.val); })

    svg.select('#y2').transition().duration(duration).call(yAxis);
        

}


