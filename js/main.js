// MAIN

/* Initialize

Adds a bootstrap container-fluid to
the div selector as well as an
in-line form with text input and
button for creating new portfolios.

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

    form.append("div")
        .attr("class","form-group")
      .append("input")
        .attr("type","text")
        .attr("class","form-control")
        .attr("id","currentAge")
        .attr("placeholder","Current age") // TODO should have spacing between button and input
        .attr("required",'')
        .attr("size",13)

    form.append("div")
        .attr("class","form-group")
      .append("input")
        .attr("type","text")
        .attr("class","form-control")
        .attr("id","retirementAge")
        .attr("placeholder","Retirement age") // TODO should have spacing between button and input
        .attr("required",'')
        .attr("size",13)
        

    form.append("div")
        .attr("class","form-group")
      .append("input")
        .attr("type","text")
        .attr("class","form-control")
        .attr("id","portfolioName")
        .attr("placeholder","Portfolio name") // TODO should have spacing between button and input
        .attr("required",'')

    form.append("button")
        //.attr("type","submit")
        .attr("onclick","addPortfolio(document.getElementById('portfolioName').value)")
        .attr("class","btn btn-info")
        .text("Add new")
}


//var test = new Portfolio();




//stackedBar(test.dat, 'body')
//plotPie(test.totals, 'body')

