var TOTAL_ADS = 5;

function start_ads() {
    var l = document.getElementById("ad-left");
    var r = document.getElementById("ad-right");
    if (!l || !r) return;
    
    var a = Math.floor(Math.random() * TOTAL_ADS) + 1;
    var b = TOTAL_ADS > 1 ? Math.floor(Math.random() * TOTAL_ADS) + 1 : a;
    while(TOTAL_ADS > 1 && a === b) {
        b = Math.floor(Math.random() * TOTAL_ADS) + 1;
    }
    
    if (a === 1 || a === 2 || b === 1 || b === 2) {
        a = 2; // 2 on left
        b = 1; // 1 on right
    }
    
    var root = typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '';
    l.innerHTML = '<img src="' + root + 'cg/ad/' + a + '.jpg" width="120" height="600" alt="ad" style="border: 1px dotted #777;">';
    r.innerHTML = '<img src="' + root + 'cg/ad/' + b + '.jpg" width="120" height="600" alt="ad" style="border: 1px dotted #777;">';
}

document.addEventListener("DOMContentLoaded", function() {
    start_ads();
});
