// MAIN

var num_slider = 0;

function Slider () {
    
    num_slider += 1;

    this.id = num_slider;

}


Slider.prototype.add = function (sel, labelText, symbol, min=10, max=100, step=1, start=25, freq=false, freqID='') {


    function formatText(val, symbol) {
        if (symbol == '%') {
            return ' [' + val + '%]';
        } else if (symbol == '$') {
            return ' [' + formatCurrency(val) + ']';
        } else {
            return ' [' + val + ']';
        }
    }

    var container = sel.append("div")
        .attr("id","slider-" + this.id);

    var label = container.append("label")
        .attr("class","sliderLabel")
        .html(labelText);
        

    var slide = container.append("input")
        .attr("type","range")
        .attr("min",min)
        .attr("max",max)
        .attr("step",step)
        .attr("value",start)
        .attr("data-orientation","horizontal")

    var tmp = jQuery('#slider-' + this.id).closest('.panel').attr('id');
    if (tmp) {
        var portID = tmp.split('-')[1];
    }

    if (freq) {
        container.append("label")
            .attr('class','bottomLabel')
            .text("compounded")


        var select = container.append("select")
            .attr("id",freqID)
            .attr('onchange','updatePlots(' + portID + ')'); 

        select.append("option")
            .attr("value",1)
            .text("once a year")

        select.append("option")
            .attr("value",3)
            .text("quarterly")

        if (freqID == 'contribFreq') {
            select.append("option")
                .attr("value",12)
                .attr("selected",'')
                .text("monthly")
        } else {
            select.append("option")
                .attr("value",12)
                .text("monthly")
        }
    }


    var obj = jQuery('#slider-' + this.id).find('input[type="range"]').rangeslider({
        polyfill : false,
        onInit : function() {
            this.portfolio = portID;
            this.output = label.append('span')
                .attr("class","muted")
                .text(formatText(this.$element.val(), symbol));

        },
        onSlide : function( position, value ) {
            this.output.text(formatText(value, symbol));
        },
        onSlideEnd: function(position, value) {
            updatePlots(this.portfolio); 
        }
    });

    this.name = labelText;
    this.symbol = symbol;
    this.obj = obj;

};

Slider.prototype.get_val = function() {
    return parseFloat(this.obj.val());
}

















var num_portfolio = 0;

function Portfolio (name="default", profile = new Profile("default"), rateOfReturn=defaultRateOfReturn, fee=defaultFee, startingValue=defaultStartingValue, contributions=defaultContributions, contributionFreqPerYear=defaultContribFreqPerYear, compoundFreqPerYear=defaultCompoundFreqPerYear, feeFreqPerYear=defaultFeeFreqPerYear) {

    num_portfolio += 1;

    this.name = name;
    this.id = num_portfolio;
    this.profile = profile;
    this.bar = {}; // store bar chart info
    this.bar.axis = {};
    this.pie = {}; // store pie chart info

    // rates in % (all assumed per year)
    this.rateOfReturn = rateOfReturn;
    this.fee = fee

    this.startingValue = startingValue; // starting fund value
    this.contributions = contributions; // contribution value
    this.contributionFreqPerYear = contributionFreqPerYear; // how often money is contributed to account (12: monthly, 1: yearly)
    this.compoundFreqPerYear = compoundFreqPerYear; // how often compounding occurs (12: monthly, 1: yearly)
    this.feeFreqPerYear; // how often fee is charged (12: monthly, 1: yearly)
    this.startYear = new Date().getFullYear();
    this.startMonth = new Date().getMonth();
    this.gui = {}; // will be filled with sliders associated with portfolio


    // calculate portfolio change over time
    // assumes compounded on current month and then every freq period there after
    var yearSum = this.startYear;
    var capitalSum = this.startingValue;
    var dat = [];
    for (var i = 0; i < this.profile.monthsToInvest; i ++) {

        dat.push({'month': this.startMonth + i});

        if (i % 12 == 1) { yearSum++; }
        dat[i].year = yearSum;

        // contributions
        if (i % (12 / contributionFreqPerYear) == 0) {
            dat[i].contributions = this.contributions;
        }

        // fees
        if (i % (12 / feeFreqPerYear) == 0) {
            dat[i].fee = capitalSum * this.fee / (feeFreqPerYear * 100.0);
        } else {
            dat[i].fee = 0
        }
            
        // interest
        if (i % (12 / compoundFreqPerYear) == 0) {
            dat[i].interest = capitalSum * this.rateOfReturn / (compoundFreqPerYear * 100.0);
        } else {
            dat[i].interest = 0;
        }
            
        // inflation
        if (i % 12 == 0) {
            dat[i].inflation = capitalSum * this.profile.inflation / 100.0;
        } else {
            dat[i].inflation = 0;
        }

        // capital
        if (i % (12 / contributionFreqPerYear) == 0) {
            capitalSum = capitalSum - dat[i].fee + dat[i].interest - dat[i].inflation + dat[i].contributions;
        }
        dat[i].capital = capitalSum;
    }
    dat['columns'] = ['capital','contributions','fee','inflation','interest'];
    this.dat = dat;

    // calculate totals
    var totals = [];
    totals.push({'name': 'fee','val': d3.sum(dat, function(d) { return d.fee; })});
    totals.push({'name':'contributions','val': d3.sum(dat, function(d) { return d.contributions; })});
    totals.push({'name':'inflation','val': d3.sum(dat, function(d) { return d.inflation; })});
    totals.push({'name':'interest','val': d3.sum(dat, function(d) { return d.interest; })});
    this.totals = totals;
}

// return net value of portfolio
Portfolio.prototype.netValue = function() {

    return this.dat[this.profile.monthsToInvest - 1].capital;
}


function Profile (name, age=32, retirementAge=65, inflation=2) {

    this.name = name;
    this.age = age;
    this.retirementAge = retirementAge;
    this.inflation = inflation;

    this.yearsToInvest = this.retirementAge - this.age;
    this.monthsToInvest = this.yearsToInvest * 12;
}

