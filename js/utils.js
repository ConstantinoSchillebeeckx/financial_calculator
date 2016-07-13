// UTILS

function addPortfolio(name) {

    if (name) {
        var container = d3.select("#container")

        var port = container.append("div")
            .attr("class","row")
          .append("div")
            .attr("class","col-sm-12")

        var collapse = port.append('div')
            .attr("class","panel panel-default")
            .attr("id", "gui")
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


        var gui = collapse.append("div")
            .attr("id","collapseGUI")
            .attr("class","panel-collapse collapse in")
            .attr("role","tabpanel")
            .attr("aria-labelledby","headingOne")
          .append("div")
            .attr("class","panel-body")

        var guiRow1 = gui.append("div")
            .attr("class","row")

        var col1 = guiRow1.append("div")
            .attr("class","col-sm-2")

        var tmp = col1.append("div")
            .attr("class","btn-toolbar")

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




// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
