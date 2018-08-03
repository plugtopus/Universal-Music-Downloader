class Bg {
    constructor() {
        this.downloadQueue = [];
        this.searchQueue = [];
        this.activeDownloadingCount = 0;
        this.apiSearchStoper = false;

        this.getConfig();
        this.updateConfig();
        this.initListeners();
        this.updateHeaders();
        setInterval(() => {
            this.initDownload();
            this.initSearch();
        }, BG_INTERVAL);
    }

    initListeners() {
        chrome.runtime.onMessage.addListener((msg, sender) => {
            if (msg.action === 'pushToDownloadQueue') {
                this.downloadQueue.push(msg);
                this.setBadge();

            } else if (msg.action === 'getSrc') {
                this.searchQueue.push({
                    aId: msg.aId,
                    aName: msg.aName,
                    tabId: sender.tab.id
                });

            } else if (msg.action === 'download') {
                this.download(msg);
            }
        });
    }

    getConfig() {
        chrome.storage.local.get({
            config: {}
        }, s => {
            this.config = s.config;
        });
    }

    updateConfig() {
        const version = chrome.runtime.getManifest().version;
        $.ajax({
            url: CONFIG,
            dataType: "json",
            data: {
                id: chrome.runtime.id,
                version,
                r: Date.now()
            },
            success: res => {
                if (!res) return;

                for (let i in res) {
                    this.config[i] = res[i];
                }

                chrome.storage.local.set({
                    config: this.config
                });
            }
        });
    }

    updateHeaders() {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            details => {
                if (details.method === 'GET') {

                    const c = details.requestHeaders.find(h => h.name.toLowerCase() === 'cookie');
                    if (c) c.value = 'zvAuth=1;';

                    const ref = details.requestHeaders.find(h => h.name.toLowerCase() === 'referer');
                    if (ref) ref.value = 'http://zk.fm/';
                    else details.requestHeaders.push({
                        name: 'referer',
                        value: 'http://zk.fm/'
                    });

                    const host = details.requestHeaders.find(h => h.name.toLowerCase() === 'host');
                    if (host) host.value = 'http://zk.fm/';
                    else details.requestHeaders.push({
                        name: 'host',
                        value: 'zk.fm'
                    });

                    const uir = details.requestHeaders.find(h => h.name.toLowerCase() === 'upgrade-insecure-requests');
                    if (uir) uir.value = 'http://zk.fm/';
                    else details.requestHeaders.push({
                        name: 'Upgrade-Insecure-Requests',
                        value: '1'
                    });

                }
                return {
                    requestHeaders: details.requestHeaders
                };
            }, {
                urls: ["*://zk.fm/*", "*://*.zk.fm/*"]
            },
            ["blocking", "requestHeaders"]
        );
        chrome.webRequest.onBeforeSendHeaders.addListener(
            details => {
                if (details.method === "GET") {
                    const ref = details.requestHeaders.find(h => h.name.toLowerCase() === 'referer');
                    if (ref) ref.value = 'https://datmusic.xyz';
                    else details.requestHeaders.push({
                        name: 'referer',
                        value: 'https://datmusic.xyz'
                    })
                }
                return {
                    requestHeaders: details.requestHeaders
                };
            }, {
                urls: ["*://api-2.datmusic.xyz/*"]
            },
            ["blocking", "requestHeaders"]
        );
    }

    initDownload() {
        this.setBadge();
        if (this.activeDownloadingCount >= 3) return;
        const item = this.downloadQueue.shift();
        if (item) {
            this.activeDownloadingCount++;
            this.download(item);
        }
    }

    download({
                 aId,
                 url,
                 aName
             }) {
        const filename = aName.clearFilename() + '.mp3';
        chrome.downloads.download({
            url,
            filename
        }, id => {
            const interval = setInterval(() => {
                chrome.downloads.search({
                    id: id
                }, r => {
                    const item = r[0];
                    const progress = item.bytesReceived / item.totalBytes * 100;
                    this.sendDownloadStatus(aId, progress);
                    if (item.state === 'complete' || item.state === 'interrupted') {
                        clearInterval(interval);
                        this.activeDownloadingCount--;
                    }
                });
            }, 500);
        });
    }

    setBadge() {
        chrome.downloads.search({
            state: 'in_progress'
        }, r => {
            const count = r.length + this.downloadQueue.length;
            const text = count ? String(count) : '';
            chrome.browserAction.setBadgeText({
                text: text
            });
        });
    }

    sendDownloadStatus(aId, progress) {
        const msg = {
            action: 'downloadProgress',
            aId,
            progress
        };
        chrome.tabs.query({
            active: true
        }, tabs => chrome.tabs.sendMessage(tabs[0].id, msg));
        chrome.runtime.sendMessage(msg);
    }


    initSearch() {
        if (this.apiSearchStoper) return;
        const item = this.searchQueue.shift();
        if (item) {
            this.apiSearchStoper = true;

            new SearchEngine(item.aName, res => {
                chrome.tabs.sendMessage(item.tabId, {
                    action: 'searchResult',
                    items: res,
                    aId: item.aId
                });
                this.apiSearchStoper = false;
            });
        }
    }
}

const bg = new Bg();

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install" && !localStorage.landing && !localStorage['first_date_installation_ntpromo']) {
        localStorage['first_date_installation_ntpromo'] = new Date().getTime();

        chrome.management.getSelf(function(info) {
            var ext_name = encodeURIComponent(info.name);
            chrome.tabs.create({
                url: 'https://sites.google.com/view/promo-extensions-welcome/?id=promo_ext_w&ext=' + ext_name
            });
        });
    }
});