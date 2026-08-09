if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

function start_news() {
    var e = document.getElementById("f5"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    var loaded = false;
    function handle() {
        if (loaded) return;
        if (x.readyState === 4 && (x.status === 200 || x.status === 304 || x.status === 0)) {
            loaded = true;
            e.innerHTML = x.responseText
                .trim()
                .split(/\n+/)
                .slice(-5)
                .reverse()
                .join("<br>");
            e.style.visibility = "visible";
        }
    }
    x.onload = handle;
    x.onreadystatechange = handle;
    x.open("GET", (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + "FEED.txt", true);
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
    var rows = '', i;
    for (i = start; i < start + REL_PER_PAGE; i++) {
        if (i < REL_ITEMS.length) {
            rows += '<tr><td>' + REL_ITEMS[i].n + '</td><td>' + REL_ITEMS[i].s + '</td><td>' + REL_ITEMS[i].l + '</td></tr>';
        } else {
            rows += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
        }
    }
    
    if (p === tot || tot === 0) {
        rows += '<tr><td colspan="3" id="cs">...AND MORE COMING SOON! TO A THEATRE NEAR YOU!!</td></tr>';
    } else {
        rows += '<tr><td colspan="3" style="border: none;">&nbsp;</td></tr>';
    }
    
    tot = Math.max(1, tot);
    var pnav = '';
    if (p > 1) pnav += '<a href="#" onclick="go_page(1); return false;" class="plnk">[First]</a> <a href="#" onclick="go_page('+(p-1)+'); return false;" class="plnk">&lt;</a> ';
    
    for (i = 1; i <= tot; i++) {
        if (i === p) {
            pnav += '[ ' + i + ' ] ';
        } else {
            pnav += '[<a href="#" onclick="go_page(' + i + '); return false;" class="plnk">' + i + '</a>] ';
        }
    }
    
    if (p < tot) pnav += '<a href="#" onclick="go_page('+(p+1)+'); return false;" class="plnk">&gt;</a> <a href="#" onclick="go_page(' + tot + '); return false;" class="plnk">[Last]</a>';
    
    rows += '<tr><td colspan="3" style="text-align:center; padding:6px;">' + pnav + '</td></tr>';
    
    var wrap = document.getElementById("rel-wrap");
    if (wrap) {
        wrap.innerHTML = '<table id="rel"><tr><th>Release</th><th width="100">Status</th><th width="75">Link</th></tr><tbody id="rel-body">' + rows + '</tbody></table>';
    } else {
        var tbody = document.getElementById("rel-body");
        if (tbody) tbody.innerHTML = rows;
    }
}

function start_rel() {
    var wrap = document.getElementById("rel-wrap") || document.getElementById("rel-body"), x;
    if (!wrap) return;
    x = new XMLHttpRequest();
    var loaded = false;
    function handle() {
        if (loaded) return;
        if (x.readyState === 4 && (x.status === 200 || x.status === 304 || x.status === 0)) {
            loaded = true;
            REL_ITEMS = rel_parse(x.responseText);
            go_page(1);
        }
    }
    x.onload = handle;
    x.onreadystatechange = handle;
    x.open("GET", (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + "RELEASE.TXT?t=" + Date.now(), true);
    x.send();
}

document.addEventListener("DOMContentLoaded", function() {
    start_news();
    start_rel();
});
