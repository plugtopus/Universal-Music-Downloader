const Origin = class {
    constructor() {
        this.code = 'sc';
        this.client_id = 'AJ4pxoFBchG36bmDxD5VwWzwlpDDbuYE';

        this.getConfig();
        setInterval(() => this.search(), SEARCH_INTERVAL);
    }

    getConfig() {
        chrome.storage.local.get({
            config: {}
        }, s => {
            this.client_id = s.config.sc_client_id;
        });
    }

    search() {
        $('.chartTracks__item').each((i, el) => {
            const $row = $(el);
            const id = $row.find('.chartTrack__title a').attr('href');

            this.renderBtn($row, id);
        });

        $('.soundList__item').each((i, el) => {
            const $row = $(el);
            const id = $row.find('a.soundTitle__title').attr('href');
            const isList = $row.find('.image__lightOutline').hasClass('m-playlist');

            this.renderBtn($row, id, isList);
        });

        $('.trackList__item').each((i, el) => {
            const $row = $(el);
            const id = $row.find('a.trackItem__trackTitle').attr('href');

            this.renderBtn($row, id);
        });

        const $lea = $('.listenEngagement__actions');
        if ($lea.length) {
            const id = location.pathname;
            const isList = location.pathname.includes('/sets/');
            this.renderBtn($lea, id, isList);
        }
    }

    renderBtn($row, aId, isList = false) {
        if ($row.find('.mtz-btn').length || !aId) return;

        $(`
            <button type="button" class="mtz-btn mtz-sc-btn sc-button sc-button-icon sc-button-responsive" aId="${aId}">
                <span class="mtz-btn-process"></span>
                <span class="mtz-btn-title">${chrome.i18n.getMessage("mtz_btn_title")} ${isList ? 'all' : ''}</span>
            </button>
        `).appendTo($row.find('.soundActions .sc-button-group:eq(0)')).on('click', e => this.btnClick(e));
    }

    btnClick(e) {
        const $btn = $(e.target).closest('.mtz-btn');
        if ($btn.hasClass('mtz-loading')) return;
        const aId = $btn.attr('aId');

        $btn.addClass('mtz-loading');
        this.getAudioUrl(aId, (url, aName) => {
            $btn.removeClass('mtz-loading');
            chrome.runtime.sendMessage({
                action: 'download',
                aId,
                url,
                aName,
                provider: this.code
            });
        });
    }

    getAudioUrl(aId, cb) {
        const track_url = encodeURIComponent('https://soundcloud.com' + aId);

        const api_url = `https://api.soundcloud.com/resolve.json?url=${track_url}&client_id=${this.client_id}`;
        fetch(api_url).then(r => r.json()).then(r => {
            if (r.stream_url) {
                const url = r.stream_url + '?client_id=' + this.client_id;
                const artist = r.user.username;
                const title = r.title;
                const aName = artist + ' - ' + title;

                cb(url, aName);
            } else if (r.tracks.length) {
                r.tracks.forEach(t => {
                    const url = t.stream_url + '?client_id=' + this.client_id;
                    const artist = t.user.username;
                    const title = t.title;
                    const aName = artist + ' - ' + title;

                    cb(url, aName);
                })
            }
        });
    }
};