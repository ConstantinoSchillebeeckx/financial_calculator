// MAIN

var color = d3.scale.category10();
var defaultCurrentAge = 25;
var defaultRetirementAge = 65;
var defaultInflation = 2.0; // (%) 
var defaultRateOfReturn = 4.0; // (%)
var defaultFee = 1.2; // (%) 
var defaultStartingValue = 20000; // ($)
var defaultContributions = 500; // frequence set by var contributionFreqPerYear
var defaultContribFreqPerYear = 12; // 12 -> monthly, 1 -> yearly, 3 -> quarterly
var defaultCompoundFreqPerYear = 1; // 12 -> monthly, 1 -> yearly, 3 -> quarterly
var defaultFeeFreqPerYear = 1; // 12 -> monthly, 1 -> yearly, 3 -> quarterly


var portfolios = d3.map(); // {name: Portfolio class}

/* Initialize

Adds a bootstrap container-fluid to
the div selector as well as various
inputs: sliders for current
age and retirement age as well as
a text input for portfolio name

Parameters:
===========
- div : html selector
        selector into which to add
        html
*/

function init(div) {

    var tmp = d3.select('body');

    var form = tmp.append("div")
        .attr("class","container-fluid")
        .attr("id","container")
      .append("div")
        .attr("class","row")
      .append("div")
        .attr("class","col-sm-12")
      .append("form")
        .attr("class","form-inline")
        .attr("onsubmit","return false") // don't submit form

    var col1 = form.append("div")
        .attr("class","col-sm-3")

    var slider1 = col1.append("div")
        .attr("id","currentAge")
    
    slider1.append("label")
        .html("Current age <span class='muted'>[" + defaultCurrentAge + "]</span>")

    slider1.append("div")
        .attr("id","currentAgeSlider")
        .attr("class","slider")

    var slider2 = col1.append("div")
        .attr("id","retirementAge")

    slider2.append("label")
        .html("Retirement age <span class='muted'>[" + defaultRetirementAge + "]</span>")

    slider2.append("div")
        .attr("id","retirementAgeSlider")
        .attr("class","slider")

    sliderCurrentAge = d3.slider().min(0).max(100).step(1).axis(true).value(defaultCurrentAge)
                        .on("slide", function(evt, value) { 
                            d3.select("#currentAge label").html("Current age <span class='muted'>[" + value + "]</span>");
                            updatePlots(); 
                        });
    d3.select('#currentAgeSlider').call(sliderCurrentAge);

    sliderRetirementAge = d3.slider().min(0).max(100).step(1).axis(true).value(defaultRetirementAge)
                        .on("slide", function(evt, value) { 
                            d3.select("#retirementAge label").html("Retirement age <span class='muted'>[" + value + "]</span>");
                            updatePlots(this); 
                        });
    d3.select('#retirementAgeSlider').call(sliderRetirementAge);


    var col2 = form.append("div")
        .attr("class","col-sm-2")

    col2.append("label")
        .text("Portfolio name")
      .append("input")
        .attr("type","text")
        .attr("class","form-control")
        .attr("id","portfolioName")
        .attr("placeholder","401(k)") 
        .attr("value","401(k)")
        .attr("required",'')
        .attr("size",15)

    col2.append("button")
        .attr("onclick","addPortfolio()")
        .attr("class","btn btn-info")
        .text("Add new portfolio")

    addPortfolio();
}


