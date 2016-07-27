// UTILS

function addPortfolio() {


    var name = document.getElementById('portfolioName').value

    if (name) {

        var profile = new Profile(name, defaultCurrentAge, defaultRetirementAge, defaultInflation);
        var portfolio = new Portfolio(name, profile, defaultRateOfReturn, defaultFee, defaultStartingValue, defaultContributions, defaultContribFreqPerYear, defaultCompoundFreqPerYear, defaultFeeFreqPerYear);
        var id = portfolio.id;


        var container = d3.select("#container")

        var portfolioRow = container.append("div")
            .attr("class","row")
          .append("div")
            .attr("class","col-sm-12")

        // accordion ----------------------------------
        var collapse = portfolioRow.append('div')
            .attr("class","panel panel-default")
            .attr("id", "portfolio-" + id)
            .style("margin-top","20px");

       var bar = collapse.append("div")
            .attr("class","panel-heading")
            .style("overflow","auto")
            .attr("role","tab")
          .append("h4")
            .attr("class","panel-title")
          .append("a")
            .attr("role","button")
            .attr("data-toggle","collapse")
            .attr("data-parent","#accordion")
            .attr("href","#collapseGUI")
            .attr("aria-expanded","true")
            .attr("aria-controls","collapseGUI")
            .html("<i class='fa fa-chevron-down'></i> " + name)
         .append("a")
            .attr("href","#")
            .attr("onclick","removePortfolio(this); return false; ")
            .attr('class', 'pull-right muted')
            .style('padding','1px 7px')
            .append('i')
            .attr('class','fa fa-close')
            .attr('title','Save image')
        // accordion ----------------------------------

        // accordion gui ----------------------------------
        var gui = collapse.append("div")
            .attr("id","collapseGUI")
            .attr("class","panel-collapse collapse in")
            .attr("role","tabpanel")
            .attr("aria-labelledby","headingOne")
          .append("div")
            .attr("class","panel-body")

        var guiRow1 = gui.append("div")
            .attr("class","row portfolioGUI")


        var col0 = guiRow1.append("div")
            .attr("class","col-sm-3")
            .attr("id","startingValue")

        startingValueSlider = new Slider(); 
        startingValueSlider.add(col0, 'Starting capital', '$', 0, 100000, 1000, defaultStartingValue);
        portfolio.gui.startingValueSlider = startingValueSlider;

        var col1 = guiRow1.append("div")
            .attr("class","col-sm-3")
            .attr("id","startingValue")


        rateOfReturnSlider = new Slider(); 
        rateOfReturnSlider.add(col1, 'Rate of return', '%', 0, 15, 0.1, defaultRateOfReturn, true, 'compoundFreq');
        portfolio.gui.rateOfReturnSlider = rateOfReturnSlider;

        var col2 = guiRow1.append("div")
            .attr("class","col-sm-3")
            .attr("id","startingValue")

        feeSlider = new Slider(); 
        feeSlider.add(col2, 'Overall fee', '%', 0, 15, 0.1, defaultFee, true, 'feeFreq');
        portfolio.gui.feeSlider = feeSlider

        var col3 = guiRow1.append("div")
            .attr("class","col-sm-3")
            .attr("id","startingValue")

        contributionSlider = new Slider(); 
        contributionSlider.add(col3, 'Contributions', '$', 0, 24000, 100, defaultContributions, true, 'contribFreq');
        portfolio.gui.contributionSlider = contributionSlider



        // accordion gui ----------------------------------


        var guiRow2 = gui.append("div")
            .attr("class","row portfolioPlots")

        var col1 = guiRow2.append("div")
            .attr("class","col-sm-7")
            .attr("id","barPlot" + portfolio.id)

        var col2 = guiRow2.append("div")
            .attr("class","col-sm-4")
            .attr("id","piePlot" + portfolio.id)

        // receive updated portfolio info for use in updating plots
        portfolio = stackedBar(portfolio, '#barPlot' + portfolio.id)
        portfolio = plotPie(portfolio, '#piePlot' + portfolio.id)


        var net = formatCurrency(portfolio.netValue());
        gui.append("p")
            .attr("class","lead")
            .html("Total portfolio value after <span id='duration'>" + portfolio.profile.yearsToInvest + "</span> years is <span id='netVal' class='label label-success'>" + net + "</span>");
        portfolios.set(id, portfolio);
    }

}


/* Remove portfolio collape div

Parameters:
===========
- a : this of the a href that was clicked

*/
function removePortfolio(a) {
    jQuery(a).parentsUntil('.col-sm-12').remove();
}


// called everytime the GUI changes
function updatePlots(id) {

    var toUpdate = [];
    if (id) { // if updating a single portfolio
        toUpdate = [id];

    } else { // if updating all portfolios (e.g. age sliders)
        portfolios.forEach(function(id, port) {
            toUpdate.push(id);
            port.updateProfile(currentAgeSlider.get_val(), retirementAgeSlider.get_val(), inflationSlider.get_val())
        })
    }

    for (var i = 0; i < toUpdate.length; i++) {
        id = toUpdate[i];

        var port = portfolios.get(id);
        var portDom = jQuery("#portfolio-"+id);
        var contribFreq = parseInt(portDom.find("#contribFreq").val());
        var feeFreq = parseInt(portDom.find("#feeFreq").val());
        var compoundFreq = parseInt(portDom.find("#compoundFreq").val());

        // calculate new portofolio totals (specifically .data & .totals)
        port.calcVals(port.gui.rateOfReturnSlider.get_val(),
                      port.gui.feeSlider.get_val(),
                      port.gui.startingValueSlider.get_val(),
                      port.gui.contributionSlider.get_val(),
                      contribFreq, compoundFreq, feeFreq
                      )

        jQuery("#netVal").html(formatCurrency(port.netValue()));
        jQuery("#duration").html(port.profile.yearsToInvest);

        // transition bar chart
        drawBar(port);

        // transition pie
        drawPie(port);

        // update portfolio with new numbers
        portfolios.set(id, port);
    } 


}




// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}


// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}


function calcBar(data) {


    // subsample to every year
    var dat = data.filter(function(value, index, Arr) {
        return index % 12 == 0;
    });


    dat['columns'] = data.columns;

    var layers = d3.layout.stack()(dat.columns.filter(function(l) {
            if (plotCols.indexOf(l) > -1) {
                return true;
            }
            return false;
        }).map(function(c) {
            return dat.map(function(d) {
                return {x: d.year, y: d[c]};
            });
        })
    )


    // reformat data so that instead of a group for each plotCol
    // we have a group for each year, this makes tooltip and
    // entering/exiting data do-able
    var convert = [];
    layers.map(function(col, i) {
        col.map(function(year, j) {
            if (!i) {
                convert.push([]);
            }
            year.name = plotCols[i];
            convert[j].push(year);
        })
    })

    layers.columns = plotCols;
    convert.columns = plotCols;
    return convert;

}


