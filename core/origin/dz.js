const Origin = class {
    constructor() {
        this.code = 'dz';

        setInterval(() => this.search(), SEARCH_INTERVAL);
    }

    search() {
        const $trackRows = $('.datagrid-row.song').not('.' + INIT_CLASS);
        const pageType = this.getPageType();

        if (pageType === 'playlist' || pageType === 'profile') {
            $trackRows.each((i, el) => {
                const $row = $(el);
                const title = $row.find('.title span').text().xTrim();
                const artist = $row.find('.cell-artist').text().xTrim();
                const id = $row.attr('data-key');
                const name = artist + ' - ' + title;

                this.renderBtn($row, id, name);
            });

        } else if (pageType === 'album') {
            const artist = $('.heading-3').text().xTrim();
            $trackRows.each((i, el) => {
                const $row = $(el);
                const title = $row.find('.title span').text().xTrim();
                const id = $row.attr('data-key');
                const name = artist + ' - ' + title;

                this.renderBtn($row, id, name);
            });

        } else if (pageType === 'artist') {}

        $trackRows.addClass(INIT_CLASS);
        this.renderEmptyRows();
    }

    getPageType() {
        const url = location.href;

        if (url.includes('/playlist/')) return 'playlist';
        else if (url.includes('/profile/')) return 'profile';
        else if (url.includes('/album/')) return 'album';
        else if (url.includes('/artist/')) return 'artist';
        else if (url.includes('/channels/')) return 'channels';
        return null;
    }

    renderEmptyRows() {
        const $headerRow = $('.datagrid-header .datagrid-row');
        if (!$headerRow.find('.mtz-dz-empty-col').length) $headerRow.append('<div class="mtz-dz-empty-col"></div>');
    }

    renderBtn($row, aId, aName) {
        if ($row.find('.mtz-btn').length) return;

        $(`
            <div class="mtz-btn mtz-dz-btn" aId="${aId}" aName="${aName}">
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