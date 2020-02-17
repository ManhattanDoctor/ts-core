(function() {
    var config = window.viConfig;
    if (!config) {
        config = window.viConfig = {};
    }

    config.language = 'ru';
    config.languages = 'en|English;ru|Русский';
    config.assetsUrl = 'assets/';

    config.apiUrl = '/api';
    config.apiUrl = 'http://localhost:3000/api';

    config.theme = 'dark';
    config.themes = [
        {
            name: 'light',
            isDark: false,
            styles: {}
        },
        {
            name: 'dark',
            isDark: true,
            styles: {}
        }
    ];
})();
