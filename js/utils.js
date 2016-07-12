// UTILS

// Given an integer, will return it
// formatted as USD ($xx,xxx.xx)
function formatCurrency(d) {
    return '$' + Math.abs(d).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
}
