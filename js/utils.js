// UTILS

function addPortfolio() {

    var currentAge = sliderCurrentAge.value();
    var retirementAge = sliderRetirementAge.value();
    var name = document.getElementById('portfolioName').value


    if (name && retirementAge && currentAge) {

        var profile = new Profile(name, currentAge, retirementAge, defaultInflation);
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

        var slider0 = col0.append("div")
            .attr("id","startingValue")
        
        slider0.append("label")
            .html("Starting capital <span class='muted'>[" + formatCurrency(defaultStartingValue) + "]</span>")

        slider0.append("div")
            .attr("id","startingValueSlider-" + id)
            .attr("class","slider")

        var startingValueSlider = d3.slider().min(0).max(50000).step(1000).axis(true).value(defaultStartingValue)
                            .on("slide", function(evt, value) { 
                                $("#startingValueSlider-" + id).parent().find("label").html("Starting capital <span class='muted'>[" + formatCurrency(value) + "]</span>");
                                updatePlots(id); 
                            });
        portfolio.gui.startingValueSlider = startingValueSlider;
        d3.select('#startingValueSlider-' + id).call(startingValueSlider);


        var col1 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col1.append("div")
            .attr("id","rateOfReturn")
        
        slider1.append("label")
            .html("Rate of return <span class='muted'>[" + defaultRateOfReturn.toFixed(1) + "%]</span>")

        slider1.append("div")
            .attr("id","rateOfReturnSlider-" + id)
            .attr("class","slider")

        var rateOfReturnSlider = d3.slider().min(0).max(15).step(0.1).axis(true).value(defaultRateOfReturn)
                            .on("slide", function(evt, value) { 
                                $("#rateOfReturnSlider-" + id).parent().find("label").html("Rate of return <span class='muted'>[" + value.toFixed(1) + "%]</span>");
                                updatePlots(id); 
                            });
        portfolio.gui.rateOfReturnSlider = rateOfReturnSlider;
        d3.select('#rateOfReturnSlider-' + id).call(rateOfReturnSlider);

        col1.append("label")
            .text("Compound frequency")

        var select = col1.append("select")
                            .attr("id","compoundFreq")
          
        select.append("option")
            .attr("value",1)
            .text("Once a year")

        select.append("option")
            .attr("value",3)
            .text("Quarterly")
        
        select.append("option")
            .attr("value",12)
            .text("Monthly")


        var col2 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col2.append("div")
            .attr("id","fee")
        
        slider1.append("label")
            .html("Total fee <span class='muted'>[" + defaultFee.toFixed(1) + "%]</span>")

        slider1.append("div")
            .attr("id","feeSlider-" + id)
            .attr("class","slider")

        var feeSlider = d3.slider().min(0).max(15).step(0.1).axis(true).value(defaultFee)
                            .on("slide", function(evt, value) { 
                                $("#feeSlider-" + id).parent().find("label").html("Total fee <span class='muted'>[" + value.toFixed(1) + "%]</span>");
                                updatePlots(id); 
                            });
        portfolio.gui.feeSlider = feeSlider
        d3.select('#feeSlider-' + id).call(feeSlider);

        col2.append("label")
            .text("Fee compound frequency")

        var select2 = col2.append("select")
                            .attr("id","feeFreq")
          
        select2.append("option")
            .attr("value",1)
            .text("Once a year")

        select2.append("option")
            .attr("value",3)
            .text("Quarterly")
        
        select2.append("option")
            .attr("value",12)
            .text("Monthly")


        var col2 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col2.append("div")
            .attr("id","contributions")
        
        slider1.append("label")
            .html("Contributions <span class='muted'>[" + formatCurrency(defaultContributions) + "]</span>")

        slider1.append("div")
            .attr("id","contributionSlider-" + id)
            .attr("class","slider")

        var contributionSlider = d3.slider().min(0).max(5000).step(100).axis(true).value(defaultContributions)
                            .on("slide", function(evt, value) { 
                                $("#contributionSlider-" + id).parent().find("label").html("Contributions <span class='muted'>[" + formatCurrency(value) + "]</span>");
                                updatePlots(id); 
                            });
        portfolio.gui.contributionSlider = contributionSlider;
        d3.select('#contributionSlider-' + id).call(contributionSlider);

        col2.append("label")
            .text("Contribution frequency")

        var select2 = col2.append("select")
                            .attr("id","contribFreq")
          
        select2.append("option")
            .attr("value",1)
            .text("Once a year")

        select2.append("option")
            .attr("value",3)
            .text("Quarterly")
        
        select2.append("option")
            .attr("value",12)
            .text("Monthly")


        // accordion gui ----------------------------------


        var guiRow2 = gui.append("div")
            .attr("class","row portfolioPlots")

        var col1 = guiRow2.append("div")
            .attr("class","col-sm-7")
            .attr("id","barPlot" + portfolio.id)

        var col2 = guiRow2.append("div")
            .attr("class","col-sm-4")
            .attr("id","piePlot" + portfolio.id)

        portfolio = stackedBar(portfolio, '#barPlot' + portfolio.id)
        portfolio = plotPie(portfolio, '#piePlot' + portfolio.id)

        portfolios.set(id, portfolio);
    }

}


/* Remove portfolio collape div

Parameters:
===========
- a : this of the a href that was clicked

*/
function removePortfolio(a) {
    $(a).parentsUntil('.col-sm-12').remove();
}


// called everytime the GUI changes
function updatePlots(id) {
    updatePortfolio(id);
}

// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}


function updatePortfolio(id) {

    var port = portfolios.get(id);
    var portDom = jQuery("#portfolio-"+id);
    var contribFreq = parseInt(portDom.find("#contribFreq").val());
    var feeFreq = parseInt(portDom.find("#feeFreq").val());
    var compoundFreq = parseInt(portDom.find("#compoundFreq").val());

    // calculate new portofolio totals
    var portUpdate = new Portfolio(port.name, 
                                   port.profile, 
                                   port.gui.rateOfReturnSlider.value(),
                                   port.gui.feeSlider.value(),
                                   port.gui.startingValueSlider.value(),
                                   port.gui.contributionSlider.value(),
                                   contribFreq, compoundFreq, feeFreq
                                  )

    // carry-over old portfolio attributes
    portUpdate.id = port.id;
    portUpdate.gui = port.gui;
    portUpdate.pieDat = port.pieDat;
    portUpdate.pieLabels = port.pieLabels;

    portfolios.set(id, portUpdate);

    // transition pie
    port.pieDat.data(pie(portUpdate.totals))
        .transition()
        .duration(200).attrTween("d", arcTween);

    // transition labels
    port.pieLabels.data(pie(portUpdate.totals))
        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .attr("class","arc")
        .text(function(d) { return d.data.name + " (" + formatCurrency(d.data.val) + ")"; });

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
