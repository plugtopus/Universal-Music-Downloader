const Origin = class {
    constructor() {
        this.code = 'sf';

        setInterval(() => this.search(), SEARCH_INTERVAL);
    }

    search() {
        const $trackRows = $('.tracklist-row').not('.' + INIT_CLASS);
        const pageType = this.getPageType();

        if (pageType === 'playlist' || pageType === 'collection') {
            $trackRows.each((i, el) => {
                const $row = $(el);
                const title = $row.find('.track-name').text() || $row.find('.tracklist-name').text();
                const artist = $row.find('a[href*="artist/"]').first().text();
                const name = artist + ' - ' + title;

                this.renderBtn($row, name, name);
            });

        } else if (pageType === 'album') {
            const artist = $('.entity-info').find('a[href*="artist/"]').first().text();
            $trackRows.each((i, el) => {
                const $row = $(el);
                const title = $row.find('.track-name').text() || $row.find('.tracklist-name').text();
                const name = artist + ' - ' + title;

                this.renderBtn($row, name, name);
            });

        } else if (pageType === 'artist') {
            const artist = $('h1.large').text();
            $trackRows.each((i, el) => {
                const $row = $(el);
                const title = $row.find('.track-name').text() || $row.find('.tracklist-name').text();
                const name = artist + ' - ' + title;

                this.renderBtn($row, name, name);
            });
        }

        $trackRows.addClass(INIT_CLASS);
    }

    getPageType() {
        const url = location.href;

        if (url.includes('/playlist/')) return 'playlist';
        else if (url.includes('/artist/')) return 'artist';
        else if (url.includes('/album/')) return 'album';
        else if (url.includes('/collection/')) return 'collection';
        else return null;
    }

    renderBtn($row, aId, aName) {
        if ($row.find('.mtz-btn').length) return;

        $(`
            <div class="mtz-btn mtz-sf-btn" aId="${aId}" aName="${aName}">
                <span class="mtz-btn-process"></span> 
                <span class="mtz-btn-title">${chrome.i18n.getMessage("mtz_btn_title")}</span>
            </div>
        `).appendTo($row).on('click', e => this.btnClick(e));
    }

    btnClick(e) {
        const $btn = $(e.target).closest('.mtz-btn');

        if ($btn.hasClass('mtz-loading')) return;

        const aId = $btn.attr('aId');
        const aName = $btn.attr('aName');

        chrome.runtime.sendMessage({
            action: 'getSrc',
            aId,
            aName,
            provider: this.code
        });
        $btn.addClass('mtz-loading');
    }
};