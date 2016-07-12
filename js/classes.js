// MAIN

var num_portfolio = 0;

function Portfolio (name="default", profile = new Profile("default"), rateOfReturn=6, fee=0.75, startingvalue=42000, contributions=500, contributionFreqPerYear=12, compoundFreqPerYear=1, feeFreqPerYear=1) {

    num_portfolio += 1;

    this.name = name;
    this.id = num_portfolio;
    this.profile = profile;

    // rates in % (all assumed per year)
    this.rateOfReturn = rateOfReturn;
    this.fee = fee

    this.startingvalue = startingvalue; // starting fund value
    this.contributions = contributions; // contribution value
    this.contributionFreqPerYear = contributionFreqPerYear; // how often money is contributed to account (12: monthly, 1: yearly)
    this.compoundFreqPerYear = compoundFreqPerYear; // how often compounding occurs (12: monthly, 1: yearly)
    this.feeFreqPerYear; // how often fee is charged (12: monthly, 1: yearly)
    this.startYear = new Date().getFullYear();
    this.startMonth = new Date().getMonth();


    // calculate portfolio change over time
    // assumes compounded on current month and then every freq period there after
    var yearSum = this.startYear;
    var capitalSum = this.startingvalue;
    var dat = [];
    for (var i = 0; i < this.profile.monthsToInvest; i ++) {

        dat.push({'month': this.startMonth + i});

        if (i % 12 == 1) { yearSum++; }
        dat[i].year = yearSum;

        // contributions
        if (i % (12 / contributionFreqPerYear) == 0) {
            dat[i].contributions = this.contributions;
        }

        // capital
        if (i % (12 / contributionFreqPerYear) == 0) {
            capitalSum += this.contributions;
        }
        dat[i].capital = capitalSum;


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

        dat[i].total = dat[i].contributions + dat[i].fee + dat[i].interest + dat[i].inflation;
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


function Profile (name, age=32, retirementAge=65, inflation=2) {

    this.name = name;
    this.age = age;
    this.retirementAge = retirementAge;
    this.inflation = inflation;

    this.yearsToInvest = this.retirementAge - this.age;
    this.monthsToInvest = this.yearsToInvest * 12;
}

