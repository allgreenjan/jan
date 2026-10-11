var PPG = 7; // posts per page

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

function get_post_slug(title) {
    if (!title) return '';
    var m = title.match(/^\[([0-9]+(?:\.[0-9]+)?)/);
    return m ? m[1] : '';
}

function blog_post(p, idx) {
    var postSlug = get_post_slug(p.t);
    var postNum = parseFloat(postSlug) || 0;
    var allowComments = (postNum >= 21);

    var expandHtml = '[<a id="pa-' + idx + '" href="javascript:void(0);" onclick="blogToggle(' + idx + '); return false;" style="color:#0000EE;">Expand...</a>]';

    var iconHtml = '';
    if (allowComments) {
        iconHtml = '<a id="za-' + idx + '" href="javascript:void(0);" onclick="kome(\'' + postSlug + '\', ' + idx + '); return false;" title="Toggle Comments" style="text-decoration:none;display:inline-flex;align-items:center;">' +
            '<img src="../cg/balloon-white-left.png" style="width:14px;height:14px;border:none;vertical-align:middle;" alt="Comments">' +
            '<span id="kc-' + postSlug + '" style="font:11px verdana;color:#0000EE;text-decoration:underline;margin-left:3px;"></span></a>';
    }

    var html = '<div style="border:1px solid silver;padding:1px;margin-bottom:16px;">' +
        '<div style="padding:4px;background:#EEEEEE;">' +
        '<span style="font:bold 11px verdana;float:left;display:inline-block;max-width:73%;text-align:justify;">' + p.t + '</span>' +
        '<span style="font:11px verdana;float:right;text-align:right;">' + p.d + ' ' + p.h + '</span>' +
        '<div style="clear:both;"></div></div>' +
        '<div id="pc-' + idx + '" style="padding:4px;background:#F9F9F9;font:11px verdana;text-align:justify;max-height:90px;overflow:hidden;">' + p.c + '</div>' +
        '<div id="pe-' + idx + '" style="padding:1px 4px;background:#F9F9F9;border-top:1px solid #DDD;margin-top:2px;font:11px verdana;display:flex;justify-content:space-between;align-items:center;">' +
        '<span>' + expandHtml + '</span>' +
        '<span>' + iconHtml + '</span>' +
        '</div>';

    if (allowComments) {
        html += '<div id="acc-' + postSlug + '" class="komebox" style="display:none;">' +
            '<div id="thread-' + postSlug + '" class="container"></div>' +
            '</div>';
    }

    html += '</div>';
    return html;
}

function blogToggle(idx) {
    var pc = document.getElementById('pc-' + idx);
    var pa = document.getElementById('pa-' + idx);
    if (pc && pa) {
        if (pc.style.maxHeight === 'none') {
            var pe = document.getElementById('pe-' + idx);
            var topBefore = pe ? pe.getBoundingClientRect().top : 0;
            pc.style.maxHeight = '90px';
            pa.innerHTML = 'Expand...';
            if (pe) {
                var topAfter = pe.getBoundingClientRect().top;
                window.scrollBy(0, topAfter - topBefore);
            }
        } else {
            pc.style.maxHeight = 'none';
            pa.innerHTML = 'Collapse...';
        }
    }
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
        s += blog_post(BLOG_ITEMS[i], i);
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

    var st = start, en = end;
    setTimeout(function() {
        for (var j = st; j < en; j++) {
            var pc = document.getElementById('pc-' + j);
            var pa = document.getElementById('pa-' + j);
            var za = document.getElementById('za-' + j);
            var pe = document.getElementById('pe-' + j);
            if (pc && pc.scrollHeight <= pc.clientHeight + 40) {
                pc.style.maxHeight = 'none';
                if (pa) pa.style.display = 'none';
                if (!za && pe) pe.style.display = 'none';
            }
        }
        var rss = document.getElementById('rss-btn');
        if (rss) rss.style.display = 'block';
    }, 0);

    if (typeof fetchKomeCount === 'function') {
        for (var ci = st; ci < en; ci++) {
            var slug = get_post_slug(BLOG_ITEMS[ci].t);
            if ((parseFloat(slug) || 0) >= 21) fetchKomeCount(slug);
        }
    }
}

var cal_year = 2026;
var cal_month = 10;
var min_cal_year = 2026;
var min_cal_month = 6;
var max_cal_year = 2026;
var max_cal_month = 10;

function change_cal_month(delta) {
    var ny = cal_year;
    var nm = cal_month + delta;
    if (nm < 1) {
        nm = 12;
        ny -= 1;
    } else if (nm > 12) {
        nm = 1;
        ny += 1;
    }
    var val = ny * 12 + nm;
    var min_val = min_cal_year * 12 + min_cal_month;
    var max_val = max_cal_year * 12 + max_cal_month;
    if (val < min_val || val > max_val) {
        return;
    }
    cal_year = ny;
    cal_month = nm;
    render_calendar(cal_year, cal_month);
}

function render_calendar(yr, mo) {
    var el = document.getElementById('cal-box');
    if (!el) return;

    var days_in_mo = new Date(yr, mo, 0).getDate();
    var first_day = new Date(yr, mo - 1, 1).getDay();

    var post_days = {};
    for (var i = 0; i < BLOG_ITEMS.length; i++) {
        var dp = (BLOG_ITEMS[i].d || '').split('-');
        if (dp.length === 3) {
            var py = parseInt(dp[0], 10);
            var pm = parseInt(dp[1], 10);
            var pd = parseInt(dp[2], 10);
            if (py === yr && pm === mo && !isNaN(pd)) {
                post_days[pd] = true;
            }
        }
    }

    var val = yr * 12 + mo;
    var min_val = min_cal_year * 12 + min_cal_month;
    var max_val = max_cal_year * 12 + max_cal_month;
    var prev_btn = val > min_val ? '<a href="javascript:void(0);" onclick="change_cal_month(-1); return false;" class="cal-nav">&laquo;</a>' : '<span class="cal-dim">&laquo;</span>';
    var next_btn = val < max_val ? '<a href="javascript:void(0);" onclick="change_cal_month(1); return false;" class="cal-nav">&raquo;</a>' : '<span class="cal-dim">&raquo;</span>';

    var mo_str = mo < 10 ? '0' + mo : '' + mo;
    var html = '<table class="cal-table">\n';
    html += '<caption>' + prev_btn + ' ' + yr + '/' + mo_str + ' ' + next_btn + '</caption>\n';
    html += '<thead><tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr></thead>\n<tbody><tr>';

    var col = 0;
    for (var b = 0; b < first_day; b++) {
        html += '<td>&nbsp;</td>';
        col++;
    }

    for (var d = 1; d <= days_in_mo; d++) {
        if (col === 7) {
            html += '</tr>\n<tr>';
            col = 0;
        }

        if (post_days[d]) {
            html += '<td><span class="cal-post">' + d + '</span></td>';
        } else {
            html += '<td>' + d + '</td>';
        }
        col++;
    }

    while (col < 7 && col > 0) {
        html += '<td>&nbsp;</td>';
        col++;
    }
    html += '</tr></tbody></table>';

    el.innerHTML = html;
}

function start_blog() {
    var e = document.getElementById("bk"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    x.onload = function () {
        BLOG_ITEMS = blog_parse(this.responseText);
        if (BLOG_ITEMS.length > 0) {
            var min_v = 999999;
            var max_v = 0;
            for (var bi = 0; bi < BLOG_ITEMS.length; bi++) {
                var dp = (BLOG_ITEMS[bi].d || '').split('-');
                if (dp.length >= 2) {
                    var y = parseInt(dp[0], 10);
                    var m = parseInt(dp[1], 10);
                    if (!isNaN(y) && !isNaN(m)) {
                        var v = y * 12 + m;
                        if (v < min_v) {
                            min_v = v;
                            min_cal_year = y;
                            min_cal_month = m;
                        }
                        if (v > max_v) {
                            max_v = v;
                            max_cal_year = y;
                            max_cal_month = m;
                        }
                    }
                }
            }
            cal_year = max_cal_year;
            cal_month = max_cal_month;
        }
        render_blog();
        render_calendar(cal_year, cal_month);
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
