function getCookie(name) {
    if (!document) {
        return null;
    }
    var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : null;
}

if (document) {
    var theme = getCookie('theme');
    if (theme) {
        document.body.className = theme + '-theme';
    }
}
