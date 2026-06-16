function start_news() {
    var e = document.getElementById("f5"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    x.onload = function () {
        e.innerHTML = this.responseText
            .trim()
            .split(/\n+/)
            .slice(-5)
            .reverse()
            .join("<br>");
        e.style.visibility = "visible";
    };
    x.open("GET", (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + "FEED.txt", 1);
    x.send();
}

var REL_ITEMS = [];
var REL_PER_PAGE = 20;

function rel_parse(txt) {
    var out = [], parts = txt.replace(/=begin[\s\S]*?=end/g, '').replace(/^;.*$/gm, '').split('<>'), i, n, s, l;
    for (i = 0; i + 2 < parts.length; i += 3) {
        n = parts[i].trim();
        s = parts[i + 1].trim();
        l = parts[i + 2].trim();
        if (n) out.push({ n: n, s: s, l: l });
    }
    return out.reverse();
}

function go_page(p) {
    var tot = Math.ceil(REL_ITEMS.length / REL_PER_PAGE);
    var start = (p - 1) * REL_PER_PAGE;
    var s = '', i;
    for (i = start; i < start + REL_PER_PAGE; i++) {
        if (i < REL_ITEMS.length) {
            s += '<tr><td>' + REL_ITEMS[i].n + '</td><td>' + REL_ITEMS[i].s + '</td><td>' + REL_ITEMS[i].l + '</td></tr>';
        } else {
            s += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
        }
    }
    
    if (p === tot || tot === 0) {
        s += '<tr><td colspan="3" id="cs">...AND MORE COMING SOON! TO A THEATRE NEAR YOU!!</td></tr>';
    } else {
        s += '<tr><td colspan="3" style="border: none;">&nbsp;</td></tr>';
    }
    
    tot = Math.max(1, tot);
    var pnav = '';
    if (p > 1) pnav += '<a href="javascript:void(0)" onclick="go_page(1)" class="plnk">[First]</a> <a href="javascript:void(0)" onclick="go_page('+(p-1)+')" class="plnk">&lt;</a> ';
    
    for (i = 1; i <= tot; i++) {
        if (i === p) {
            pnav += '[ ' + i + ' ] ';
        } else {
            pnav += '[<a href="javascript:void(0)" onclick="go_page(' + i + ')" class="plnk">' + i + '</a>] ';
        }
    }
    
    if (p < tot) pnav += '<a href="javascript:void(0)" onclick="go_page('+(p+1)+')" class="plnk">&gt;</a> <a href="javascript:void(0)" onclick="go_page(' + tot + ')" class="plnk">[Last]</a>';
    
    s += '<tr><td colspan="3" style="text-align:center; padding:6px;">' + pnav + '</td></tr>';
    
    document.getElementById("rel-body").innerHTML = s;
}

function start_rel() {
    var e = document.getElementById("rel-body"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    x.onload = function () {
        REL_ITEMS = rel_parse(this.responseText);
        go_page(1);
    };
    x.open("GET", (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + "RELEASE.TXT?t=" + Date.now(), 1);
    x.send();
}

document.addEventListener("DOMContentLoaded", function() {
    start_news();
    start_rel();
});
