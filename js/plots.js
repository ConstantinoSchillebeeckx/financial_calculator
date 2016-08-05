

/* -------------------------------------------

            STACKED BAR CHART

----------------------------------------------*/


var tipBar = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    var sum = 0, toggle = true;

    var startAge = ageSlider.get_val()[0];
    var currentYear = new Date().getFullYear();
    var age = d[0].x - currentYear + startAge

    var html = '<span>Year - ' + d[0].x + ' (age: ' + age + ')</span><hr>' // year
    d.map(function(e) {
        if (e.name == 'capital') { // if total value
            html += '<p><span style="color:' + color('contributions') + '">' + e.name + ':</span> ' + formatCurrency(e.y) + '</p><br>';
            toggle = false;
        } else {
            if (e.y0 < 0) {
                var val = e.y0;
            } else {
                var val = e.y0 + e.y;
            }
            sum += val;
            html += '<p><span style="color:' + color(e.name) + '">' + e.name + ':</span> ' + formatCurrency(val) + '</p><br>';
        }
    });
    if (toggle) {
        html += '<p>Year earnings: ' + formatCurrency(sum) + '</p>';
    }
    return html;
  })


var marginStacked = {top: 25, right: 5, bottom: 10, left: 80};
function stackedBar(portfolio, div) {

    var layers = calcBar(portfolio);

    width = d3.select(div).node().clientWidth - marginStacked.left - marginStacked.right;
    height = width * 0.5 - marginStacked.top - marginStacked.bottom

    var svg = d3.select(div)
        .append('svg') // viewbox is set after rendering chart
          .attr("id","barSVG")
        .append("g").attr("transform", "translate(" + marginStacked.left + "," + marginStacked.top + ")");

    // plot title
    svg.append('text')
        .text('Yearly category earnings/losses')
        .attr('class',"plotTitle")
        .attr('text-anchor','middle')
        .attr('transform','translate(' + (width / 2) + ',0)')
        .attr('dy','-10')

    svg.call(tipBar);

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
        .tickFormat(function(d) { return formatCurrency(d); })
        .ticks(4)

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


    if (window.innerWidth > 500) {
        var legend = svg.selectAll(".legend")
          .data(layers.columns)
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(20,20)"; })
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
            .attr('opacity',1e-6)
            .text(function(d) { return d; });
    }


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

    fitViewBox('#barPlot' + portfolio.id, marginStacked);

    return portfolio;

}

// transition bar elements
function drawStackedBar(portfolio) {

    var layers = calcBar(portfolio);
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

    svg.selectAll('.layer rect')
        .transition()
        .duration(duration)
        .attr('height','0')
        .attr('y', height)

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

          
    svg.selectAll('.layer')
        .on('mouseover', function(d, idx) {

            d3.select(this).classed('hover', true); // add class

            // get toggle state; true = gain/loss || false = total value
            var toggle = jQuery('#toggle-' + portfolio.id).prop('checked');

            var bar = this.getBoundingClientRect();
            var bodyBox = d3.select('body').node().getBoundingClientRect();
            var tipBox = d3.select('.d3-tip').node().getBoundingClientRect();
            // 179 is tooltip once it has been filled in with text
            // for now I'm manually specifying height because the 
            // tooltip doesn't fill until the first mouseover
            // need to fill manually first to get dynamic height
            var offset = 0
            toggle ? offset = 190 : offset = 104;
            var absPos = [(bar.top - offset - bodyBox.top), bar.left];
            return tipBar.show(d, idx, absPos); 
        })
        .on('mouseout', function(d, idx) {
            tipBar.hide(d, idx);
            d3.select(this).classed('hover', false); // remove class
        })

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


    // update legend
    if (window.innerWidth > 500) {
        var legend = svg.selectAll(".legend")
          .data(layers.columns)

        legend.transition()
            .duration(duration)
            .attr("transform", function(d, i) { return "translate(20," + (i * 20) + ")"; })
            .attr('opacity',1)
          
        legend.select('text')
            .transition()
            .duration(duration)
            .attr('opacity',1)
            .text(function(d) { return d; })

        legend.exit()
            .transition()
            .duration(duration)
            .attr('opacity',1e-6)
    }

}










/* -------------------------------------------

                BAR CHART

----------------------------------------------*/
function barChart(portfolio, div) {

    var marginSimple = {top: 25, right: 5, bottom: 10, left: 80};
    var data = portfolio.totals;

    width = d3.select(div).node().clientWidth - marginSimple.left - marginSimple.right;
    height = d3.select('#barPlot' + portfolio.id).node().clientHeight - marginStacked.top - marginStacked.bottom;

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
        .attr("transform", "translate(" + marginSimple.left + "," + marginSimple.top + ")");

    portfolio.simpleBar = {};
    portfolio.simpleBar.svg = svg;
    portfolio.simpleBar.height = height;
    portfolio.simpleBar.axis = {};
    portfolio.simpleBar.y = y
    portfolio.simpleBar.axis.y = yAxis;

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.val; })]);

    // plot title
    svg.append('text')
        .text('Category totals')
        .attr('class',"plotTitle")
        .attr('text-anchor','middle')
        .attr('transform','translate(' + (width / 2) + ',0)')
        .attr('dy','-10')

    svg.append("g")
        .attr("class", "y axis")
        .attr('id','y2')
        .call(yAxis)

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        
    bars.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.rangeBand())
        .attr("y", height)
        .attr('fill', function(d) { return color(d.name); })  
        .attr('height', 0)
      
    bars.append('text')
        .attr('text-anchor','middle')
        .attr('class','barText')
        .attr('x', function(d) { return x(d.name); })
        .attr('y', height)
        .attr('dx', x.rangeBand()/2)
        .attr('opacity',1e-6)
        .text(function(d) { return formatCurrency(d.val, false); })

    


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    updateSimpleBar(portfolio);

    fitViewBox('#simpleBarPlot' + portfolio.id, marginSimple);
    return portfolio;
}


function updateSimpleBar(portfolio) {

    var data = portfolio.totals;
    var y = portfolio.simpleBar.y;
    var svg = portfolio.simpleBar.svg;
    var yAxis = portfolio.simpleBar.axis.y;

    y.domain([0, d3.max(data, function(d) { return d.val; })]).nice();

    var tmp = data[3].val

    // there are no entering or exiting bars
    // only need to adjust height
    svg.selectAll('rect')
        .data(data)
        .transition()
        .duration(duration)
        .attr("y", function(d) { return y(d.val); })
        .attr("height", function(d) { return portfolio.simpleBar.height - y(d.val); })

    svg.selectAll('.barText')
        .data(data)
        .transition()
        .duration(duration)
        .attr('opacity',1)
        .attr('dy', function(d) { 
            if (portfolio.simpleBar.height - y(d.val) < 40) { 
                return -10;
            } else { 
                return 25; 
            }
        })
        .attr('style', function(d) {
            if (portfolio.simpleBar.height - y(d.val) < 40) { 
                return 'fill:black;';
            }
        })
        .attr('y', function(d) { return y(d.val); })
        .text(function(d) { return formatCurrency(d.val, false); })

    svg.select('#y2').transition().duration(duration).call(yAxis);
        

}


