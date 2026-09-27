var vol_dict = {};
var rel_items = [];
var filtered_items = [];
var cur_page = 1;
var vols_per_page = 5;
var author_name = '1 (one) guy';

function strip_comments(src_str) {
    return src_str.replace(/=begin[\s\S]*?=end/g, '').replace(/^;.*$/gm, '');
}

function parse_volumes(raw_txt) {
    var clean_txt = strip_comments(raw_txt);
    var lines = clean_txt.replace(/\r/g, '').split('\n');
    var map = {};
    for (var i = 0; i < lines.length; i++) {
        var line_str = lines[i].trim();
        if (line_str.length === 0) {
            continue;
        }
        var parts = line_str.split('<>');
        if (parts.length >= 2) {
            var code_key = parts[0].trim();
            var title_val = parts[1].trim();
            var cover_val = parts.length > 2 ? parts[2].trim() : 'cg/default.jpg';
            var note_val = parts.length > 3 ? parts[3].trim() : '';
            map[code_key] = {
                code: code_key,
                title: title_val,
                cover: cover_val,
                note: note_val
            };
        }
    }
    return map;
}

function parse_releases(raw_txt) {
    var clean_txt = strip_comments(raw_txt);
    var lines = clean_txt.replace(/\r/g, '').split('\n');
    var list = [];
    for (var i = 0; i < lines.length; i++) {
        var line_str = lines[i].trim();
        if (line_str.length === 0) {
            continue;
        }
        var parts = line_str.split('<>');
        if (parts.length >= 4) {
            var code_val = parts[0].trim();
            var name_val = parts[1].trim();
            var status_val = parts[2].trim();
            var link_val = parts[3].trim();
            if (name_val.length === 0) {
                continue;
            }
            list.push({
                code: code_val,
                name: name_val,
                status: status_val,
                link: link_val
            });
        }
    }
    return list;
}

function group_by_volume(items_list, vol_map) {
    var rev_items = items_list.slice().reverse();
    var vol_order = [];
    var vol_buckets = {};
    for (var i = 0; i < rev_items.length; i++) {
        var itm = rev_items[i];
        var code_key = itm.code;
        if (!vol_buckets[code_key]) {
            var def_obj = (vol_map && vol_map[code_key]) ? vol_map[code_key] : {
                code: code_key,
                title: code_key,
                cover: 'cg/default.jpg',
                note: ''
            };
            vol_buckets[code_key] = {
                code: code_key,
                title: def_obj.title,
                cover: def_obj.cover,
                note: def_obj.note,
                status: itm.status,
                items: []
            };
            vol_order.push(code_key);
        }
        vol_buckets[code_key].items.push(itm);
    }
    var res_arr = [];
    for (var j = 0; j < vol_order.length; j++) {
        res_arr.push(vol_buckets[vol_order[j]]);
    }
    return res_arr;
}

function render_table() {
    var wrap = document.getElementById('rel-wrap');
    if (!wrap) {
        return;
    }
    var total_entries = filtered_items.length;
    var count_el = document.getElementById('rel-count');
    if (count_el) {
        count_el.innerText = total_entries.toString();
    }
    if (total_entries === 0) {
        wrap.innerHTML = '<div style="padding: 10px; color: #999; text-align: center;">No matching releases found.</div>';
        return;
    }
    var vol_groups = group_by_volume(filtered_items, vol_dict);
    var total_vols = vol_groups.length;
    var total_pages = Math.ceil(total_vols / vols_per_page);
    total_pages = Math.max(1, total_pages);
    if (cur_page > total_pages) {
        cur_page = total_pages;
    }
    var start_idx = (cur_page - 1) * vols_per_page;
    var page_vols = vol_groups.slice(start_idx, start_idx + vols_per_page);
    var html_buf = '';
    for (var i = 0; i < page_vols.length; i++) {
        var vol_obj = page_vols[i];
        var ch_items = vol_obj.items;
        var table_rows = '';
        for (var k = 0; k < ch_items.length; k++) {
            var itm = ch_items[k];
            table_rows += '<tr>';
            table_rows += '<td>' + itm.name + '</td>';
            table_rows += '<td width="130">' + itm.status + '</td>';
            table_rows += '<td width="75">' + itm.link + '</td>';
            table_rows += '</tr>';
        }
        var note_html = '';
        if (vol_obj.note && vol_obj.note.length > 0) {
            note_html = '<div class="vol-note">' + vol_obj.note + '</div>';
        }
        html_buf += '<div class="vol-panel">';
        html_buf += '  <div class="vol-head">';
        html_buf += '    <span class="vol-name">' + vol_obj.title + '</span>';
        html_buf += '    <span class="vol-tag"><b>' + vol_obj.status + '</b> &middot; ' + ch_items.length + ' chapter' + (ch_items.length === 1 ? '' : 's') + '</span>';
        html_buf += '  </div>';
        html_buf += '  <div class="vol-body">';
        html_buf += '    <div class="vol-aside">';
        html_buf += '      <img src="' + vol_obj.cover + '" class="vol-img" alt="' + vol_obj.title + '">';
        html_buf += '    </div>';
        html_buf += '    <div class="vol-main">';
        html_buf += '      <table class="vol-table">';
        html_buf += '        <thead><tr><th>Release</th><th width="130">Status</th><th width="75">Link</th></tr></thead>';
        html_buf += '        <tbody>' + table_rows + '</tbody>';
        html_buf += '      </table>';
        html_buf += note_html;
        html_buf += '    </div>';
        html_buf += '  </div>';
        html_buf += '</div>';
    }
    var pnav = '';
    if (cur_page > 1) {
        pnav += '<a href="#" onclick="switch_page(1); return false;" class="plnk">[First]</a> ';
        pnav += '<a href="#" onclick="switch_page(' + (cur_page - 1) + '); return false;" class="plnk">&lt;</a> ';
    }
    for (var p = 1; p <= total_pages; p++) {
        if (p === cur_page) {
            pnav += '[ ' + p + ' ] ';
        } else {
            pnav += '[<a href="#" onclick="switch_page(' + p + '); return false;" class="plnk">' + p + '</a>] ';
        }
    }
    if (cur_page < total_pages) {
        pnav += '<a href="#" onclick="switch_page(' + (cur_page + 1) + '); return false;" class="plnk">&gt;</a> ';
        pnav += '<a href="#" onclick="switch_page(' + total_pages + '); return false;" class="plnk">[Last]</a>';
    }
    html_buf += '<div class="vol-pagination">' + pnav.trim() + '</div>';
    wrap.innerHTML = html_buf;
}

function switch_page(dst_page) {
    cur_page = dst_page;
    render_table();
}

function apply_search() {
    var search_el = document.getElementById('search-term');
    if (!search_el) {
        return;
    }
    var query_str = search_el.value.toLowerCase().trim();
    if (query_str.length === 0) {
        filtered_items = rel_items.slice();
        cur_page = 1;
        render_table();
        return;
    }
    var match_list = [];
    for (var i = 0; i < rel_items.length; i++) {
        var itm = rel_items[i];
        if (itm.name.toLowerCase().indexOf(query_str) !== -1 ||
            itm.status.toLowerCase().indexOf(query_str) !== -1 ||
            itm.code.toLowerCase().indexOf(query_str) !== -1) {
            match_list.push(itm);
        }
    }
    filtered_items = match_list;
    cur_page = 1;
    render_table();
}

function fetch_releases() {
    var vol_xhr = new XMLHttpRequest();
    var is_vol_done = false;
    vol_xhr.onreadystatechange = function () {
        if (is_vol_done) {
            return;
        }
        if (vol_xhr.readyState === 4 && (vol_xhr.status === 200 || vol_xhr.status === 304 || vol_xhr.status === 0)) {
            is_vol_done = true;
            vol_dict = parse_volumes(vol_xhr.responseText);
            var rel_xhr = new XMLHttpRequest();
            var is_rel_done = false;
            rel_xhr.onreadystatechange = function () {
                if (is_rel_done) {
                    return;
                }
                if (rel_xhr.readyState === 4 && (rel_xhr.status === 200 || rel_xhr.status === 304 || rel_xhr.status === 0)) {
                    is_rel_done = true;
                    rel_items = parse_releases(rel_xhr.responseText);
                    filtered_items = rel_items.slice();
                    render_table();
                }
            };
            rel_xhr.open('GET', (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + 'RELEASE.TXT?t=' + Date.now(), true);
            rel_xhr.send();
        }
    };
    vol_xhr.open('GET', (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + 'VOLUME.TXT?t=' + Date.now(), true);
    vol_xhr.send();
}

function format_doki_date(date_str, time_str) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    var date_parts = date_str.split('-');
    if (date_parts.length < 3 || date_parts[1] === 'xx' || date_parts[2] === 'xx') {
        return date_str + ' | ' + time_str + ' BRT';
    }
    var yr = parseInt(date_parts[0], 10);
    var mo_idx = parseInt(date_parts[1], 10) - 1;
    var dy = parseInt(date_parts[2], 10);
    if (isNaN(yr) || isNaN(mo_idx) || isNaN(dy)) {
        return date_str + ' | ' + time_str + ' BRT';
    }
    var date_obj = new Date(Date.UTC(yr, mo_idx, dy));
    var day_name = days[date_obj.getUTCDay()];
    var mo_name = months[mo_idx];
    var suffix = 'th';
    if (dy === 1 || dy === 21 || dy === 31) {
        suffix = 'st';
    } else if (dy === 2 || dy === 22) {
        suffix = 'nd';
    } else if (dy === 3 || dy === 23) {
        suffix = 'rd';
    }
    var formatted_time = time_str;
    var time_parts = time_str.split(':');
    if (time_parts.length === 2 && time_parts[0] !== 'xx' && time_parts[1] !== 'xx') {
        var hr = parseInt(time_parts[0], 10);
        var mn = time_parts[1].padStart(2, '0');
        var ampm = hr >= 12 ? 'PM' : 'AM';
        var hr12 = hr % 12;
        if (hr12 === 0) {
            hr12 = 12;
        }
        var hr_pad = String(hr12).padStart(2, '0');
        formatted_time = hr_pad + ':' + mn + ' ' + ampm;
    }
    return day_name + ' ' + dy + suffix + ' ' + mo_name + ' ' + yr + ' | ' + formatted_time + ' BRT';
}

function fetch_pinned_post() {
    var pin_container = document.getElementById('pinned-post');
    if (!pin_container) {
        return;
    }
    var xhr = new XMLHttpRequest();
    var is_done = false;
    function on_ready() {
        if (is_done) {
            return;
        }
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 304 || xhr.status === 0)) {
            is_done = true;
            var raw_txt = xhr.responseText.trim();
            if (raw_txt.length === 0) {
                return;
            }
            var parts = strip_comments(raw_txt).split('<>');
            if (parts.length < 4) {
                return;
            }
            var post_title = parts[0].trim();
            var post_date = parts[1].trim();
            var post_time = parts[2].trim();
            var post_body = parts[3].trim();
            var formatted_dt = format_doki_date(post_date, post_time);
            var post_html = '<div class="post-pinned post sticky hentry">\n';
            post_html += '<div class="post-headline">\n';
            post_html += '<h2><a href="javascript:void(0)" rel="bookmark" title="' + post_title + '">' + post_title + '</a></h2>\n';
            post_html += '</div>\n';
            post_html += '<div class="post-bodycopy">\n';
            post_html += post_body + '\n';
            post_html += '</div>\n';
            post_html += '<div class="post-footer">' + formatted_dt + ' | Posted by ' + author_name + '</div>\n';
            post_html += '</div>\n';
            pin_container.innerHTML = post_html;
            pin_container.style.display = 'block';
        }
    }
    xhr.onload = on_ready;
    xhr.onreadystatechange = on_ready;
    xhr.open('GET', (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + 'PIN.TXT?t=' + Date.now(), true);
    xhr.send();
}

function start_news() {
    var e = document.getElementById('f5');
    if (!e) {
        return;
    }
    var x = new XMLHttpRequest();
    var loaded = false;
    function handle() {
        if (loaded) {
            return;
        }
        if (x.readyState === 4 && (x.status === 200 || x.status === 304 || x.status === 0)) {
            loaded = true;
            e.innerHTML = x.responseText
                .trim()
                .split(/\n+/)
                .slice(-5)
                .reverse()
                .join('<br>');
            e.style.visibility = 'visible';
        }
    }
    x.onload = handle;
    x.onreadystatechange = handle;
    x.open('GET', (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '') + 'FEED.txt', true);
    x.send();
}

document.addEventListener('DOMContentLoaded', function () {
    start_news();
    fetch_pinned_post();
    fetch_releases();
});

document.addEventListener('mouseover', function () {
    if (window._FC2COUNTER41049146_1 && !_FC2COUNTER41049146_1._fixed) {
        _FC2COUNTER41049146_1._fixed = true;
        var orig_show = _FC2COUNTER41049146_1.show_graph;
        _FC2COUNTER41049146_1.show_graph = function (ev) {
            orig_show.call(this, ev);
            if (this.graph_img) {
                var top_val = ev.pageY - this.graph_img.height - 12;
                if (top_val < 0) {
                    top_val = 0;
                }
                this.graph_img.style.top = top_val + 'px';
            }
        };
    }
}, true);
