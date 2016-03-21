var DateTime = function () {};




DateTime.formatDate = function (d) {

    var year = d.getFullYear();
    var month = d.getUTCMonth()+1;
    var day = d.getUTCDate()
    var hrs = d.getUTCHours();
    var minute = d.getUTCMinutes();

    if( hrs < 10 ) hrs = '0' + hrs;
    if( minute < 10) minute = '0' + minute;

    return day + "/" + month + "/" + year + "  " + hrs + ":" + minute + " UTC";
}

DateTime.formatSummaryDate = function (d) {

    var year = d.getFullYear();
    var month = d.getUTCMonth()+1;
    var day = d.getUTCDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return day + "-" + month + "-" + year;
}

DateTime.formatLinkDate = function (d) {

    var year = d.getFullYear();
    var month = d.getUTCMonth()+1;
    var day = d.getUTCDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return year + "-" + month + "-" + day;
}


module.exports = DateTime;