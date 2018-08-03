class Content {
    constructor() {
        this.origin = new Origin(this);

        this.initHandlers();
    }

    initHandlers() {
        const $b = $(document.body);
        $b.on('click', '.mtz-modal-item', e => this.modalItemClick(e));
        $b.on('click', '.mtz-modal-close-icon', e => this.closeModal(e));
        $b.on('click', '.mtz-modal-overlay', e => this.closeModal(e));

        chrome.runtime.onMessage.addListener(msg => {
            if (msg.action === 'downloadProgress' && msg.progress) {
                const text = msg.progress.toFixed(0) + '%';
                $(`.mtz-btn[aId="${msg.aId}"]`).find('.mtz-btn-process').text(text);
            }

            if (msg.action === 'searchResult') {
                this.searchHandler(msg);
            }
        });
    }

    renderModal(aId, audioItems) {
        const items = audioItems.map(l => `<div class="mtz-modal-item" url="${l.url}">${l.name}</div>`).join('');
        $(`
        <div class="mtz-modal-overlay ${this.origin.code}" aId="${aId}">
            <div class="mtz-modal">
                <div class="mtz-modal-close-icon"></div>
                <div class="mtz-modal-body">${items}</div>
            </div>
        </div>`).appendTo(document.body);
    }

    closeModal(e) {
        $(e.target).closest('.mtz-modal-overlay').remove();
    }

    modalItemClick(e) {
        const aId = $(e.target).closest('[aId]').attr('aId');
        const url = $(e.target).attr('url');
        const aName = $(e.target).text();
        const msg = {
            action: 'pushToDownloadQueue',
            aId,
            url,
            aName
        };
        chrome.runtime.sendMessage(msg);
    }

    searchHandler({
                      aId,
                      items
                  }) {
        const $btn = $(`.mtz-btn[aId="${aId}"]`);

        if (items && items.length === 1) {
            const msg = {
                action: 'pushToDownloadQueue',
                aId,
                url: items[0].url,
                aName: items[0].name
            };
            chrome.runtime.sendMessage(msg);
            this.incrementCounter();

        } else if (items && items.length > 1) {
            this.renderModal(aId, items);

        } else {
            toastr.warning('Audio not found!');
            $btn.find('.mtz-btn-process').text('Error!');
        }

        $btn.removeClass('mtz-loading');
    }

    incrementCounter() {
        const n = 'mtz-download-count';
        var count = +localStorage.getItem(n) || 0;
        count++;
        localStorage.setItem(n, String(count));
        if (count === 3 || count === 30 || count === 70) new ShareModal(this.origin.code);
    }
}

const c = new Content();