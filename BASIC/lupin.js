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
    x.open("GET", "FEED.txt", 1);
    x.send();
}

function rel_parse(txt) {
    var out = [], parts = txt.replace(/=begin[\s\S]*?=end/g, '').replace(/^;.*$/gm, '').split('<>'), i, n, s, l;
    for (i = 0; i + 2 < parts.length; i += 3) {
        n = parts[i].trim();
        s = parts[i + 1].trim();
        l = parts[i + 2].trim();
        if (n) out.push({ n: n, s: s, l: l });
    }
    return out;
}

function start_rel() {
    var e = document.getElementById("rel-body"), x;
    if (!e) return;
    x = new XMLHttpRequest();
    x.onload = function () {
        var items = rel_parse(this.responseText), s = '', i;
        for (i = 0; i < items.length; i++) {
            s += '<tr><td>' + items[i].n + '</td><td>' + items[i].s + '</td><td>' + items[i].l + '</td></tr>';
        }
        s += '<tr><td colspan="3" id="cs">...AND MORE COMING SOON! TO A THEATRE NEAR YOU!!</td></tr>';
        e.innerHTML = s;
    };
    x.open("GET", "RELEASE.TXT?t=" + Date.now(), 1);
    x.send();
}

document.addEventListener("DOMContentLoaded", function() {
    start_news();
    start_rel();
});
