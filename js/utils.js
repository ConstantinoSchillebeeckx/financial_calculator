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


       collapse.append("div")
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

        tmp.append("button")
            .attr("class","btn btn-info")
            .attr("id","rectangular")
            .attr("title","Generate a rectangular layout")
            .attr("onclick","updateTree({'treeType':this.id})")
            .html('<i class="fa fa-square-o fa-lg" aria-hidden="true"></i>')
    }

}


// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
