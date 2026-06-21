var PPG = 3; // posts per page

function blog_strip(txt) {
    // cm: ; lines, =begin...=end blocks
    return txt.replace(/=begin[\s\S]*?=end/g, '').replace(/^;.*$/gm, '');
}

function blog_parse(txt) {
    var out = [], parts = blog_strip(txt).split('<>'), i, t, d, h, c;
    for (i = 0; i + 3 < parts.length; i += 4) {
        t = parts[i].trim();
        d = parts[i + 1].trim();
        h = parts[i + 2].trim();
        c = parts[i + 3].trim().replace(/\n/g, '<br>');
        if (t) out.push({ t: t, d: d, h: h, c: c });
    }
    return out.reverse();
}

function blog_post(p) {
    return '<div style="border:1px solid silver;padding:1px;margin-bottom:16px;">' +
        '<div style="padding:4px;background:#EEEEEE;">' +
        '<span style="font:bold 11px verdana;float:left;display:inline-block;max-width:73%;text-align:justify;">' + p.t + '</span>' +
        '<span style="font:11px verdana;float:right;text-align:right;">' + p.d + ' ' + p.h + '</span>' +
        '<div style="clear:both;"></div></div>' +
        '<div style="padding:4px;background:#F9F9F9;font:11px verdana;text-align:justify;">' + p.c + '</div></div>';
}

function blog_hash(k) {
    var m = location.hash.match(new RegExp(k + ';(\\d+)'));
    return m ? parseInt(m[1], 10) : null;
}

var BLOG_ITEMS = [];

function render_blog() {
    var e = document.getElementById('bk');
    if (!e) return;
    
    var pg = blog_hash('page') || 1;
    var tot = Math.ceil(BLOG_ITEMS.length / PPG);
    pg = Math.min(Math.max(1, pg), Math.max(1, tot));
    
    var s = '', i;
    var start = (pg - 1) * PPG;
    var end = Math.min(start + PPG, BLOG_ITEMS.length);
    
    for (i = start; i < end; i++) {
        s += blog_post(BLOG_ITEMS[i]);
    }
    
    tot = Math.max(1, tot);
    var pnav = '';
    
    if (pg > 1) {
        pnav += '<a href="#page;1" class="plnk">[First]</a> <a href="#page;' + (pg-1) + '" class="plnk">&lt;</a> ';
    }
    
    for (i = 1; i <= tot; i++) {
        if (i === pg) {
            pnav += '[ ' + i + ' ] ';
        } else {
            pnav += '[<a href="#page;' + i + '" class="plnk">' + i + '</a>] ';
        }
    }
    
    if (pg < tot) {
        pnav += '<a href="#page;' + (pg+1) + '" class="plnk">&gt;</a> <a href="#page;' + tot + '" class="plnk">[Last]</a>';
    }
    
    var pnav_html = '<div style="text-align:center; padding:0 0 16px 0; font: 700 11px/100% \'Lucida Grande\', \'MS PGothic\', sans-serif;">' + pnav + '</div>';
    
    e.innerHTML = pnav_html + s;
}

function start_blog() {
    var e = document.getElementById("bk"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    x.onload = function () {
        BLOG_ITEMS = blog_parse(this.responseText);
        render_blog();
    };
    x.open('GET', 'POST.TXT?t=' + Date.now(), true);
    x.send();
}

window.addEventListener('hashchange', function () {
    if (BLOG_ITEMS.length > 0) render_blog();
});

document.addEventListener("DOMContentLoaded", function() {
    start_blog();
});
