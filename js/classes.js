// MAIN

var num_slider = 0;

function Slider () {
    
    num_slider += 1;

    this.id = num_slider;

}

/*

- freq : (bool) if true this slider will get a compounding dropdown with 'yearly', 'quarterly' or 'monthly'
- freqID : str - label for frequency dropdown

*/
Slider.prototype.add = function (sel, labelText, symbol, min, max, step, start, freq, freqID) {

    var id = this.id;

    function formatText(val, symbol) {
        if (symbol == '%') {
            return ' [' + val + '%]';
        } else if (symbol == '$') {
            return ' [' + formatCurrency(val) + ']';
        } else {
            if (Array.isArray(val)) {
                return ' [' + val.map(function(d) { return parseInt(d); }) + ']';
            } else {
                return ' [' + val + ']';
            }
        }
    }

    // generate HTML for slider
    var container = sel.append("div")
        .attr("id","slider-" + this.id);


    var label = container.append("label")
        .attr("class","sliderLabel")
        .html(labelText)
      .append('span')
        .attr('class','muted')
        .text(formatText(start, symbol));
        
    if (labelText == 'Inflation') {
        container.append('i')
            .attr('class',"fa fa-info-circle fa-2x pull-right text-primary")
            .attr('data-toggle','popover')
            .attr('title','Inflation')
            .attr('data-content','This value represents the expected inflation rate over the duration of the portfolio.  Naturally this value fluctuates over time, however this calculator assumes a constant rate of inflation.  For reference, the average rate of inflation from 2006 to 2016 was about 1.78%.')
            .attr('data-trigger','hover')
            .attr('id','inflationPopover')

        jQuery('#inflationPopover').popover({container: 'body', placement: "bottom"})
    } else if (labelText == 'Rate of return') {
        container.append('i')
            .attr('class',"fa fa-info-circle fa-2x pull-right text-primary")
            .attr('data-toggle','popover')
            .attr('title','Rate of return')
            .attr('data-content','This value represents the expected rate of return over the duration of the portfolio and is driven by market performance.  Although only a single value is assumed for the duration of the portfolio, it is important to note that the rate of return at any given moment is very volatile.  Investopedia states that the average annual return of the S&P 500 from 1928 to 2014 was about 10%, however many would argue that a long term return of about 7% is more accurate.')
            .attr('data-trigger','hover')
            .attr('id','returnPopover')

        jQuery('#returnPopover').popover({container: 'body', placement: "bottom"})
    } else if (labelText == 'Fees') {
        container.append('i')
            .attr('class',"fa fa-info-circle fa-2x pull-right text-primary")
            .attr('data-toggle','popover')
            .attr('title','Fees')
            .attr('data-content','Any fee associated with the portoflio should be taken into account with this value.  This can include anything like a portfolio management fee, to administration fees, to any other hidden fees.')
            .attr('data-trigger','hover')
            .attr('id','feePopover')

        jQuery('#feePopover').popover({container: 'body', placement: "bottom"})
    }

    container.append('div')
        .attr("id","slide-" + this.id);


    var slider = document.getElementById('slide-' + this.id);
    var connect = Array.isArray(start) ? true : 'lower';
    noUiSlider.create(slider, {
        start: start,
        connect: Array.isArray(start) ? true : [true, false],
        margin: step,
        step: step,
        range: {
            'min': min,
            'max': max,
        }
    });




    // get the portfolio ID associated with sliders
    var tmp = jQuery('#slider-' + this.id).closest('.panel').attr('id');
    if (tmp) {
        this.portfolio = tmp.split('-')[1]; // port ID
    }


    // add any neccessary dropdows
    if (freq) {
        container.append("label")
            .attr('class','bottomLabel')
            .text( function(d) {
                 if (labelText == 'Contributions') {
                    return 'deposit freq.';
                } else {
                    return 'compounded';
                }
            })


        var select = container.append("select")
            .attr("id",freqID)
            .attr('onchange','updatePlots(' + this.portfolio + ')'); 

        select.append("option")
            .attr("value",1)
            .text("yearly")

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
    } else if (labelText == 'Starting capital') {
        container.append('input')
            .attr('type','checkbox')
            .attr('checked',true)
            .attr('data-toggle','toggle')
            .attr('id','toggle-' + this.portfolio)
            .attr('data-on','Gain/loss')
            .attr('data-off','Total value')
            .attr('data-onstyle','info')
            .attr('data-offstyle','default')
            .attr('data-size','small')
            .attr('onchange','updatePlots(' + this.portfolio + ')'); 

        jQuery('#toggle-' + this.portfolio).bootstrapToggle(); // create toggle
    }




    // add event for slider end and slider move
    slider.noUiSlider.on('end', function() {
        updatePlots(this.portfolio);
    })
    slider.noUiSlider.on('slide', function(d) {
        jQuery('#slider-' + id).find('span').text(formatText(d, symbol));
    });


    // update slider obj
    this.name = labelText;
    this.symbol = symbol;
    this.obj = slider.noUiSlider;

};

// get slider value, will return an array of ints if a double handle slider
Slider.prototype.get_val = function() {
    var val = this.obj.get();

    if (Array.isArray(val)) { // if age range
        return val.map(function(d) { return parseFloat(d); });
    } else {
        return parseFloat(val);
    }
}

















var num_portfolio = 0;

function Portfolio (name, profile, rateOfReturn, fee, startingValue, contributions, contributionFreqPerYear, compoundFreqPerYear, feeFreqPerYear) {

    num_portfolio += 1;

    this.name = name;
    this.id = num_portfolio;
    this.profile = profile;
    this.bar = {}; // store bar chart info
    this.bar.axis = {};
    this.pie = {}; // store pie chart info
    this.gui = {}; // will be filled with sliders associated with portfolio

    this.calcVals(rateOfReturn, fee, startingValue, contributions, contributionFreqPerYear, compoundFreqPerYear, feeFreqPerYear);

}

// return net value of portfolio
Portfolio.prototype.netValue = function() {
    return this.dat[this.profile.monthsToInvest].capital;
}


Portfolio.prototype.calcVals = function(rateOfReturn, fee, startingValue, contributions, contributionFreqPerYear, compoundFreqPerYear, feeFreqPerYear) {

    this.feeFreqPerYear = feeFreqPerYear;
    this.startingValue = startingValue; // starting fund value
    this.contributions = contributions; // contribution value
    this.contributionFreqPerYear = contributionFreqPerYear; // how often money is contributed to account (12: monthly, 1: yearly)
    this.compoundFreqPerYear = compoundFreqPerYear; // how often compounding occurs (12: monthly, 1: yearly)
    this.feeFreqPerYear; // how often fee is charged (12: monthly, 1: yearly)
    this.startYear = new Date().getFullYear();
    this.startMonth = new Date().getMonth();

    // rates in % (all assumed per year)
    this.rateOfReturn = rateOfReturn / 100.0;
    this.fee = fee / 100.0

    // calculate portfolio change over time
    // assumes compounded on current month and then every freq period there after
    var yearSum = this.startYear + 1;
    var capitalSum = this.startingValue;
    var dat = [];
    for (var i = 0; i <= this.profile.monthsToInvest; i ++) {

        dat.push({'month': this.startMonth + i});

        if (i % 12 == 1) { yearSum++; }
        dat[i].year = yearSum;

        // contributions
        if (i % (12 / this.contributionFreqPerYear) == 0) {
            dat[i].contributions = this.contributions;
        }

        // fees
        if (i % (12 / this.feeFreqPerYear) == 0) {
            dat[i].fee = -capitalSum * this.fee / this.feeFreqPerYear;
        } else {
            dat[i].fee = 0
        }
            
        // interest
        if (i % (12 / this.compoundFreqPerYear) == 0) {
            dat[i].interest = capitalSum * this.rateOfReturn / this.compoundFreqPerYear;
        } else {
            dat[i].interest = 0;
        }
            
        // inflation
        if (i % 12 == 0) {
            dat[i].inflation = -capitalSum * this.profile.inflation;
        } else {
            dat[i].inflation = 0;
        }

        // capital
        if (i % (12 / this.contributionFreqPerYear) == 0) {
            capitalSum = capitalSum + dat[i].fee + dat[i].interest + dat[i].inflation + dat[i].contributions;
        }
        dat[i].capital = capitalSum;
    }
    dat['columns'] = ['capital','contributions','fee','inflation','interest'];
    this.dat = dat;

    // calculate totals
    var totals = [];
    totals.push({'name': 'fee','val': d3.sum(this.dat, function(d) { return -d.fee; })});
    totals.push({'name':'contributions','val': d3.sum(this.dat, function(d) { return d.contributions; })});
    totals.push({'name':'inflation','val': d3.sum(this.dat, function(d) { return -d.inflation; })});
    totals.push({'name':'interest','val': d3.sum(this.dat, function(d) { return d.interest; })});
    this.totals = totals;
}


/* Function to update profile when global sliders are moved

Once called, will update the portfolio within the porfolios map

*/
Portfolio.prototype.updateProfile = function(age, retirementAge, inflation) {

    var profile = this.profile;
    var id = this.id;

    profile.age = age;
    profile.retirementAge = retirementAge;
    profile.inflation = inflation / 100;

    // re-calculate profile values
    profile.yearsToInvest = retirementAge - age - 1;
    profile.monthsToInvest = profile.yearsToInvest * 12;

    portfolios.set(id, this);

}


function Profile (name, age, retirementAge, inflation) {

    this.name = name;
    this.age = age ; // +1 because we don't compound this year
    this.retirementAge = retirementAge;
    this.inflation = inflation / 100.0;

    this.yearsToInvest = this.retirementAge - this.age - 1;
    this.monthsToInvest = this.yearsToInvest * 12;
}

