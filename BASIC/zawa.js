var datl = {};
var res_no = {};
var CGI_PATH = 'https://januaryjan.alwaysdata.net/zawa.php';

var noimg = (typeof ROOT_PATH !== 'undefined' ? ROOT_PATH : '../') + 'cg/default.jpg';

var palette = ['#5b2d8e', '#07cf07', '#cc3388', '#000000', '#888888'];

function kome(postSlug, idx) {
    var acc = document.getElementById('acc-' + postSlug);
    if (!acc) return;

    if (acc.style.display === 'block') {
        acc.style.display = 'none';
        return;
    }

    acc.style.display = 'block';
    readk(postSlug);
}

var komeTimers = {};

function fetchKomeCount(postSlug) {
    var el = document.getElementById('kc-' + postSlug);
    if (!el) return;

    if (komeTimers[postSlug]) {
        clearInterval(komeTimers[postSlug]);
        delete komeTimers[postSlug];
    }

    el.innerHTML = '<span>' +
        '<span>.</span><span style="color:transparent">.</span><span style="color:transparent">.</span>' +
        '</span> comments';

    var dotWrap = el.firstChild;
    var step = 0;
    komeTimers[postSlug] = setInterval(function() {
        if (!document.getElementById('kc-' + postSlug)) {
            clearInterval(komeTimers[postSlug]);
            delete komeTimers[postSlug];
            return;
        }
        step = (step + 1) % 3;
        for (var d = 0; d < 3; d++) {
            dotWrap.children[d].style.color = (d <= step) ? '' : 'transparent';
        }
    }, 350);

    fetch(CGI_PATH + '?act=read&post=' + encodeURIComponent(postSlug))
    .then(function(r) { return r.text(); })
    .then(function(text) {
        if (komeTimers[postSlug]) {
            clearInterval(komeTimers[postSlug]);
            delete komeTimers[postSlug];
        }

        var lines = text.split('\n');
        var comments = [];
        for (var i = 0; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            var cols = lines[i].split('<>');
            if (cols.length >= 8) {
                comments.push({
                    id: cols[0],
                    parentId: cols[1],
                    name: cols[2],
                    color: cols[3],
                    avatar: cols[4],
                    content: cols[5],
                    time: parseInt(cols[6], 10),
                    admin_flag: cols[7]
                });
            }
        }
        datl[postSlug] = comments;

        var kcEl = document.getElementById('kc-' + postSlug);
        if (kcEl) kcEl.innerText = comments.length + ' comments';
    })
    .catch(function(err) {
        if (komeTimers[postSlug]) {
            clearInterval(komeTimers[postSlug]);
            delete komeTimers[postSlug];
        }
        console.error('Count fetch error:', err);
    });
}

function timef(ts) {
    if (!ts) return '';
    var d = new Date(parseInt(ts, 10));
    if (isNaN(d.getTime())) return ts;
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var hours = String(d.getHours()).padStart(2, '0');
    var mins = String(d.getMinutes()).padStart(2, '0');
    return year + '-' + month + '-' + day + ' ' + hours + ':' + mins;
}

function clean(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
}

function bbcode(str) {
    if (!str) return '';
    var s = str;
    s = s.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
    s = s.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
    s = s.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
    s = s.replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');
    s = s.replace(/\[color=([^\]]+)\](.*?)\[\/color\]/gi, function(m, col, txt) {
        var safe = col.replace(/[^#a-fA-F0-9]/g, '');
        return '<span style="color:' + safe + '">' + txt + '</span>';
    });
    s = s.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, '<span class="spoiler" onclick="this.classList.toggle(\'spoileron\')">$1</span>');
    return s;
}

function err_disp(postSlug, msg, color, duration) {
    var statusEl = document.getElementById('smsg-' + postSlug);
    if (statusEl) {
        statusEl.innerText = msg;
        statusEl.style.color = color;
        if (duration) {
            setTimeout(function() {
                if (statusEl.innerText === msg) statusEl.innerText = '';
            }, duration);
        }
    }
}

function set_res(postSlug, authorName, commentId) {
    var textEl = document.getElementById('msg-' + postSlug);
    if (!textEl) return;

    res_no[postSlug] = commentId;
    
    err_disp(postSlug, 'Replying to @' + authorName, '#666666');
    
    var cancelBtn = document.getElementById('yameb-' + postSlug);
    if (cancelBtn) cancelBtn.style.display = 'inline';

    textEl.focus();
    textEl.value = '@' + authorName + ' ' + textEl.value;
    FitText(textEl);
}

function zawaCancelReply(postSlug) {
    res_no[postSlug] = null;
    err_disp(postSlug, '', '#000');
    var cancelBtn = document.getElementById('yameb-' + postSlug);
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function FitText(el) {
    if (!el) return;
    el.style.height = '16px';
    el.style.height = Math.max(16, el.scrollHeight) + 'px';
}

function chg_color(postSlug, color) {
    localStorage.setItem('ck_color', color);
    var container = document.getElementById('thread-' + postSlug);
    var swatches = container ? container.querySelectorAll('.swatch') : [];
    for (var i = 0; i < swatches.length; i++) {
        if (swatches[i].getAttribute('data-color') === color) {
            swatches[i].classList.add('paletteon');
        } else {
            swatches[i].classList.remove('paletteon');
        }
    }
}

function set_cookie(postSlug) {
    var nameEl = document.getElementById('name-' + postSlug);
    var avatarEl = document.getElementById('imgp-' + postSlug);

    if (nameEl) localStorage.setItem('ck_name', nameEl.value);
    if (avatarEl) localStorage.setItem('ck_img', avatarEl.value.trim());
}

function AdminChk(postSlug) {
    set_cookie(postSlug);
    viewk(postSlug, datl[postSlug] || []);
}

function openres(treeId, toggleEl) {
    var tree = document.getElementById(treeId);
    if (!tree) return;

    if (tree.style.display === 'none') {
        tree.style.display = 'block';
        if (toggleEl) toggleEl.innerText = '[-]';
    } else {
        tree.style.display = 'none';
        if (toggleEl) toggleEl.innerText = '[+]';
    }
}

function delres(postSlug, commentId) {
    var savedName = localStorage.getItem('ck_name') || '';
    var tripMatch = savedName.match(/#(.*)$/);
    if (!tripMatch) return;
    var delkey = '#' + tripMatch[1];
    
    if (!confirm("Delete this comment?")) return;
    
    var formData = new URLSearchParams();
    formData.append('post', postSlug);
    formData.append('id', commentId);
    formData.append('delkey', delkey);
    
    fetch(CGI_PATH + '?act=del', {
        method: 'POST',
        body: formData
    })
    .then(r => r.text())
    .then(text => {
        if (text.indexOf('OK<>') === 0) {
            readk(postSlug);
        } else {
            alert('Delete failed: ' + text);
        }
    })
    .catch(err => alert('Error deleting: ' + err));
}

function disp_res(item, postSlug, allComments, isAdminMode) {
    var name = clean(item.name || 'anonymoose');
    var color = item.color || '#5b2d8e';
    var avatar = item.avatar && item.avatar.trim() ? clean(item.avatar) : noimg;
    
    var rawBody = clean(item.content || '');
    var body = bbcode(rawBody);
    
    var timeStr = timef(item.time || Date.now());
    var commentId = item.id;
    var isAdmin = item.admin_flag == 1;

    var children = [];
    if (allComments) {
        for (var i = 0; i < allComments.length; i++) {
            if (allComments[i].parentId === commentId) {
                children.push(allComments[i]);
            }
        }
    }

    var treeToggleHtml = '';
    var childrenHtml = '';

    if (children.length > 0) {
        var treeId = 'tree-' + commentId;
        treeToggleHtml = '<a href="javascript:void(0);" onclick="openres(\'' + treeId + '\', this); return false;" class="openres">[-]</a>';

        var childItemsHtml = '';
        for (var j = 0; j < children.length; j++) {
            childItemsHtml += disp_res(children[j], postSlug, allComments, isAdminMode);
        }
        childrenHtml = '<div id="' + treeId + '" class="tree">' + childItemsHtml + '</div>';
    }

    var displayName = name + (isAdmin ? ' <span style="color:rgb(176, 11, 11);">[ADMIN]</span>' : '');
    var delLink = isAdminMode ? ' <a href="javascript:void(0);" onclick="delres(\''+postSlug+'\', \''+commentId+'\'); return false;" class="admdel" title="Delete comment">[x]</a>' : '';

    return '<div class="res" id="r' + commentId + '">' +
        '<div class="td1">' +
        '<img class="iimg" src="' + avatar + '" alt="" onerror="this.src=\'' + noimg + '\';">' +
        '<div class="resin">' +
        '<div class="header">' +
        '<span class="name" style="color:' + clean(color) + ';">' + displayName + '</span>' +
        '<span class="timef">' + timeStr + ' [<a href="javascript:void(0);" onclick="set_res(\'' + postSlug + '\', \'' + name + '\', \'' + commentId + '\'); return false;" class="resb">reply</a>]' +
        delLink + treeToggleHtml + '</span>' +
        '</div>' +
        '<div class="kombody">' + body + '</div>' +
        '</div>' +
        '</div>' +
        childrenHtml +
        '</div>';
}

function viewk(postSlug, comments) {
    var container = document.getElementById('thread-' + postSlug);
    if (!container) return;

    var savedName = localStorage.getItem('ck_name') || '';
    var savedColor = localStorage.getItem('ck_color') || '#5b2d8e';
    var savedAvatar = localStorage.getItem('ck_img') || '';
    
    var isAdminMode = savedName.indexOf('#nebakko') !== -1;

    var listHtml = '';
    if (comments && comments.length > 0) {
        var rootComments = [];
        for (var i = 0; i < comments.length; i++) {
            if (!comments[i].parentId) {
                rootComments.push(comments[i]);
            }
        }

        if (rootComments.length > 0) {
            for (var k = 0; k < rootComments.length; k++) {
                listHtml += disp_res(rootComments[k], postSlug, comments, isAdminMode);
            }
        } else {
            for (var m = 0; m < comments.length; m++) {
                listHtml += disp_res(comments[m], postSlug, comments, isAdminMode);
            }
        }
    } else {
        listHtml = '<div class="nodata">ざわ… ざわ…</div>';
    }

    var colorSwatchesHtml = '<div class="palette">';
    for(var c=0; c<palette.length; c++) {
        var cHex = palette[c];
        var isSel = (cHex === savedColor) ? ' paletteon' : '';
        colorSwatchesHtml += '<div class="swatch' + isSel + '" data-color="' + cHex + '" style="background:' + cHex + '" onclick="chg_color(\'' + postSlug + '\', \'' + cHex + '\')"></div>';
    }
    colorSwatchesHtml += '</div>';

    var formHtml = '<div class="postform">' +
        '<div style="display:none"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>' +
        '<div class="inrow">' +
        '<input type="text" id="name-' + postSlug + '" placeholder="anonymoose" value="' + clean(savedName) + '" onchange="set_cookie(\'' + postSlug + '\')" onblur="AdminChk(\'' + postSlug + '\')" class="in inname">' +
        colorSwatchesHtml +
        '<input type="url" id="imgp-' + postSlug + '" placeholder="PFP (Optional)" value="' + clean(savedAvatar) + '" onchange="set_cookie(\'' + postSlug + '\')" class="in inimg">' +
        '</div>' +
        '<textarea id="msg-' + postSlug + '" rows="1" placeholder="Write a comment..." class="textarea" oninput="FitText(this)"></textarea>' +
        '<div class="postact">' +
        '<span id="smsg-' + postSlug + '" class="smsg"></span><a href="javascript:void(0);" id="yameb-' + postSlug + '" class="yameb" style="display:none;" onclick="zawaCancelReply(\'' + postSlug + '\'); return false;">[x]</a>' +
        '<button type="button" onclick="writek(\'' + postSlug + '\')" class="submitb">Submit</button>' +
        '</div>' +
        '<div style="clear:both;"></div>' +
        '</div>';

    container.innerHTML = '<div class="thread">' + listHtml + '</div>' + formHtml;
    
    if (res_no[postSlug]) {
        var cancelBtn = document.getElementById('yameb-' + postSlug);
        if (cancelBtn) cancelBtn.style.display = 'inline';
    }
}

function readk(postSlug) {
    if (!datl[postSlug]) datl[postSlug] = [];
    viewk(postSlug, datl[postSlug]);

    fetch(CGI_PATH + '?act=read&post=' + encodeURIComponent(postSlug))
    .then(function(r) { return r.text(); })
    .then(function(text) {
        var lines = text.split('\n');
        var comments = [];
        for (var i = 0; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            var cols = lines[i].split('<>');
            if (cols.length >= 8) {
                comments.push({
                    id: cols[0],
                    parentId: cols[1],
                    name: cols[2],
                    color: cols[3],
                    avatar: cols[4],
                    content: cols[5],
                    time: parseInt(cols[6], 10),
                    admin_flag: cols[7]
                });
            }
        }
        datl[postSlug] = comments;
        var kcEl = document.getElementById('kc-' + postSlug);
        if (kcEl) kcEl.innerText = comments.length + ' comments';
        viewk(postSlug, datl[postSlug]);
    })
    .catch(function(err) {
        console.error('Fetch error:', err);
    });
}

function writek(postSlug) {
    var nameEl = document.getElementById('name-' + postSlug);
    var avatarEl = document.getElementById('imgp-' + postSlug);
    var textEl = document.getElementById('msg-' + postSlug);
    var color = localStorage.getItem('ck_color') || '#5b2d8e';

    if (!textEl || !textEl.value.trim()) {
        err_disp(postSlug, "(can't empty)", '#cc0000', 2500);
        return;
    }

    set_cookie(postSlug);

    var targetId = res_no[postSlug] || '';
    var parentId = targetId;

    if (parentId && datl[postSlug]) {
        var parentObj = null;
        for (var p = 0; p < datl[postSlug].length; p++) {
            if (datl[postSlug][p].id === parentId) {
                parentObj = datl[postSlug][p];
                break;
            }
        }
        if (parentObj && parentObj.parentId) {
            var grandParentObj = null;
            for (var g = 0; g < datl[postSlug].length; g++) {
                if (datl[postSlug][g].id === parentObj.parentId) {
                    grandParentObj = datl[postSlug][g];
                    break;
                }
            }
            if (grandParentObj && grandParentObj.parentId) {
                parentId = grandParentObj.id;
            } else {
                parentId = parentObj.parentId;
            }
        }
    }

    var formData = new URLSearchParams();
    formData.append('post', postSlug);
    formData.append('name', nameEl ? nameEl.value : '');
    formData.append('color', color);
    formData.append('avatar', avatarEl ? avatarEl.value : '');
    formData.append('content', textEl.value);
    formData.append('parentId', parentId);
    formData.append('website', '');

    var nameVal = nameEl ? nameEl.value : '';
    var tripMatch = nameVal.match(/#(.*)$/);
    if (tripMatch) {
        formData.append('key', '#' + tripMatch[1]);
    }

    err_disp(postSlug, '(sending...)', '#555');

    fetch(CGI_PATH + '?act=write', {
        method: 'POST',
        body: formData
    })
    .then(r => r.text())
    .then(text => {
        if (text.indexOf('OK<>') === 0) {
            zawaCancelReply(postSlug);
            if (textEl) textEl.value = '';
            err_disp(postSlug, '(posted)', '#008800', 2000);
            readk(postSlug);
        } else if (text.indexOf('ERR<>') === 0) {
            var msg = text.split('<>')[1];
            err_disp(postSlug, msg, '#cc0000', 4000);
        } else {
            err_disp(postSlug, 'Error posting.', '#cc0000', 3000);
        }
    })
    .catch(err => {
        err_disp(postSlug, 'Network error.', '#cc0000', 3000);
    });
}
