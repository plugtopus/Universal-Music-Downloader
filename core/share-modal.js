const ShareModal = class {
    constructor(prCode) {
        this.prCode = prCode;
        this.renderShareModal();
        $('.mtz-share-btn').on('click', e => this.share(e));
    }

    renderShareModal() {
        var url = 'https://chrome.google.com/webstore/detail/' + chrome.runtime.id;
        var title = chrome.i18n.getMessage('name');
        var summary = chrome.i18n.getMessage('desc');
        $(`
        <div class="mtz-modal-overlay ${this.prCode}">
            <div class="mtz-modal mtz-share-modal">
                <div class="mtz-modal-close-icon"></div>
                <div class="mtz-modal-body">
                    <div class="mtz-share-modal-title">${title}</div>
                    <div class="mtz-share-modal-text" id="share_modal_text"> ${chrome.i18n.getMessage('share_modal_text')}</div>
                    <div class="mtz-share-btn-box">
                        <button class="mtz-share-btn mtz-share-tw-btn" data-link="http://twitter.com/share?text=${title}&url=${url}"></button>
                        <button class="mtz-share-btn mtz-share-fb-btn" data-link="http://www.facebook.com/sharer.php?s=100&p[url]=${url}&p[title]=${title}&p[summary]=${summary}"></button>
                        <button class="mtz-share-btn mtz-share-vk-btn" data-link="https://vk.com/share.php?s=100&url=${url}&title=${title}&summary=${summary}"></button>
                    </div>
                </div>
            </div>
        </div>`).appendTo(document.body);
    }

    share(e) {
        window.open(e.target.dataset.link, chrome.i18n.getMessage('name'), 'toolbar=0, status=0, width=548, height=325');
    }
};