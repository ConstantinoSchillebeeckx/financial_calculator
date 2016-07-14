// UTILS

function addPortfolio() {

    var currentAge = sliderCurrentAge.value();
    var retirementAge = sliderRetirementAge.value();
    var name = document.getElementById('portfolioName').value


    if (name && retirementAge && currentAge) {

        var profile = new Profile(name, currentAge, retirementAge, defaultInflation);
        var portfolio = new Portfolio(name, profile, defaultRateOfReturn, defaultFee, defaultStartingValue, defaultContributions, defaultContribFreqPerYear, defaultCompoundFreqPerYear, defaultFeeFreqPerYear);
        portfolios.set(name, portfolio);
        console.log(portfolio);

        var container = d3.select("#container")

        var portfolioRow = container.append("div")
            .attr("class","row")
          .append("div")
            .attr("class","col-sm-12")

        // accordion ----------------------------------
        var collapse = portfolioRow.append('div')
            .attr("class","panel panel-default")
            .attr("id", name)
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
            .attr("class","row")


        var col0 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider0 = col0.append("div")
            .attr("id","startingValue")
        
        slider0.append("label")
            .html("Starting capital <span class='muted'>[" + formatCurrency(defaultStartingValue) + "]</span>")

        slider0.append("div")
            .attr("id","startingValueSlider")
            .attr("class","slider")

        var startingValueSlider = d3.slider().min(0).max(50000).step(1000).axis(true).value(defaultStartingValue)
                            .on("slide", function(evt, value) { 
                                d3.select("#startingValue label").html("Starting capital <span class='muted'>[" + formatCurrency(value) + "]</span>");
                                updatePlots(); 
                            });
        d3.select('#startingValueSlider').call(startingValueSlider);


        var col1 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col1.append("div")
            .attr("id","rateOfReturn")
        
        slider1.append("label")
            .html("Rate of return <span class='muted'>[" + defaultRateOfReturn.toFixed(1) + "%]</span>")

        slider1.append("div")
            .attr("id","rateOfReturnSlider")
            .attr("class","slider")

        var rateOfReturnSlider = d3.slider().min(0).max(15).step(0.1).axis(true).value(defaultRateOfReturn)
                            .on("slide", function(evt, value) { 
                                d3.select("#rateOfReturn label").html("Rate of return <span class='muted'>[" + value.toFixed(1) + "%]</span>");
                                updatePlots(); 
                            });
        d3.select('#rateOfReturnSlider').call(rateOfReturnSlider);

        col1.append("label")
            .text("Compound frequency")

        var select = col1.append("select")
          
        select.append("option")
            .attr("value","1")
            .text("Once a year")

        select.append("option")
            .attr("value","3")
            .text("Quarterly")
        
        select.append("option")
            .attr("value","12")
            .text("Monthly")


        var col2 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col2.append("div")
            .attr("id","fee")
        
        slider1.append("label")
            .html("Fee <span class='muted'>[" + defaultFee.toFixed(1) + "%]</span>")

        slider1.append("div")
            .attr("id","feeSlider")
            .attr("class","slider")

        var feeSlider = d3.slider().min(0).max(15).step(0.1).axis(true).value(defaultFee)
                            .on("slide", function(evt, value) { 
                                d3.select("#fee label").html("Fee <span class='muted'>[" + value.toFixed(1) + "%]</span>");
                                updatePlots(); 
                            });
        d3.select('#feeSlider').call(feeSlider);

        col2.append("label")
            .text("Fee compound frequency")

        var select2 = col2.append("select")
          
        select2.append("option")
            .attr("value","1")
            .text("Once a year")

        select2.append("option")
            .attr("value","3")
            .text("Quarterly")
        
        select2.append("option")
            .attr("value","12")
            .text("Monthly")


        var col2 = guiRow1.append("div")
            .attr("class","col-sm-3")

        var slider1 = col2.append("div")
            .attr("id","contributions")
        
        slider1.append("label")
            .html("Contributions <span class='muted'>[" + formatCurrency(defaultContributions) + "]</span>")

        slider1.append("div")
            .attr("id","contributionSlider")
            .attr("class","slider")

        var contributionSlider = d3.slider().min(0).max(15).step(0.1).axis(true).value(defaultRateOfReturn)
                            .on("slide", function(evt, value) { 
                                d3.select("#contributions label").html("Contributions <span class='muted'>[" + formatCurrency(value) + "%]</span>");
                                updatePlots(); 
                            });
        d3.select('#contributionSlider').call(contributionSlider);

        col2.append("label")
            .text("Contribution frequency")

        var select2 = col2.append("select")
          
        select2.append("option")
            .attr("value","1")
            .text("Once a year")

        select2.append("option")
            .attr("value","3")
            .text("Quarterly")
        
        select2.append("option")
            .attr("value","12")
            .text("Monthly")

/*
- rate of return
- compound freq
- fee
- fee freq
- start value
- contrib
- contrib freq
*/

        // accordion gui ----------------------------------
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


function updatePlots(moo) {

}

// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
