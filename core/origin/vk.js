const Origin = class {
    constructor() {
        this.code = 'vk';

        setInterval(() => this.search(), SEARCH_INTERVAL);
    }

    search() {
        $('.audio_row[data-full-id]').not('.' + INIT_CLASS).each((i, el) => {
            const $row = $(el);
            if ($row.hasClass('audio_claimed')) return;
            const id = $row.attr('data-full-id');

            this.renderBtn($row, id);
            $row.addClass(INIT_CLASS);
        });
    }

    renderBtn($row, aId) {
        if ($row.find('.mtz-btn').length) return;

        $(`
            <div class="mtz-btn mtz-vk-btn" aId="${aId}">
                <span class="mtz-btn-process"></span> 
                <span class="mtz-vk-btn-icon"></span>
            </div>
        `).insertAfter($row.find('.audio_row__play_btn')).on('click', e => this.btnClick(e));
    }

    btnClick(e) {
        e.stopPropagation();
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
        $.ajax({
            url: 'https://vk.com/al_audio.php',
            method: 'POST',
            timeout: 60000,
            data: {
                act: 'reload_audio',
                al: 1,
                ids: aId
            },
            success: response => {
                const match = response.match(/<!json>([^<]+)<!>/);
                let result = [];
                try {
                    result = JSON.parse(match[1]);
                } catch (e) {}

                if (result && result[0]) {
                    const fakeUrl = result[0][2];
                    const url = this.getRealAudioUrl(fakeUrl);
                    const title = result[0][3];
                    const artist = result[0][4];
                    const name = artist + ' - ' + title;

                    cb(url, name);
                }
            },
            error: () => {}
        });
    }

    getRealAudioUrl(fakeUrl) {
        const s = document.createElement('script');
        const n = 'vkmusic-player-data';
        s.innerHTML = `
            var player = new AudioPlayerHTML5({onFrequency:function(){}}); 
            player.setUrl('${fakeUrl}'); 
            document.body.setAttribute('${n}', player._currentAudioEl.src);
        `;
        document.body.appendChild(s);
        s.remove();
        return document.body.getAttribute(n);
    }
};