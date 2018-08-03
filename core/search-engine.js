const SearchEngine = class {
    constructor(query, cb) {
        this.query = query;
        this.q = encodeURIComponent(query);
        this.cb = cb;
        this.items = [];

        this.searchOnDatmusic(() => {
            this.searchOnCoolDj(() => {
                this.searchOnZkFm(() => {
                    this.cb(this.items)
                });
            });
        });
    }

    searchOnDatmusic(next) {
        const url = `https://api-2.datmusic.xyz/search?q=${this.q}`;
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onload = () => {
            try {
                if (x.status !== 200) {
                    next();
                    return;
                }
                const res = JSON.parse(x.responseText);

                if (res.status !== 'ok') {
                    next();
                    return;
                }

                const items = res.data.map(r => ({
                    url: r.download,
                    name: (r.artist + ' - ' + r.title)
                }));
                this.items = this.items.concat(items);


                const target = this.checkResult(items);
                target ? this.cb([target]) : next();
            } catch (e) {
                next();
            }
        };
        x.send();
    }

    searchOnCoolDj(next) {
        const url = `https://cool.dj/search/f/${this.q}/`;
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onload = () => {
            if (x.status !== 200) {
                next();
                return;
            }
            try {
                const ulHtml = x.responseText.match(/<ul class="playlist">([\s\S]+?)<\/ul>/g)[0];
                const aReg = /<a href="([^"]+)" class="playlist-btn-down no-ajaxy" title="[^"]+" target="_blank" download="([^"]+)">/g;
                const items = [];

                let m;
                while ((m = aReg.exec(ulHtml)) != null) {
                    const url = m[1];
                    const name = m[2];
                    items.push({
                        url,
                        name
                    });
                }

                this.items = this.items.concat(items);

                const target = this.checkResult(items);
                target ? this.cb([target]) : next();
            } catch (e) {
                next();
            }
        };
        x.send();
    }

    searchOnZkFm(next) {
        const url = `http://zk.fm/mp3/search?keywords=${this.q}`;
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onload = () => {
            if (x.status !== 200) {
                next();
                return;
            }
            const m = x.responseText.match(/<ul class="song-menu">[\s\S]+?<\/ul>/g);

            if (!m) {
                next();
                return;
            }
            const uls = m.filter(i => {
                return i.includes('btn4')
            });
            const items = [];
            uls.forEach(ul => {
                try {
                    const sid = ul.match(/data-sid="(\d+?)"/)[1];
                    const url = 'http://zk.fm/download/' + sid;
                    const name = ul.match(/data-title="(.+?)"/)[1];
                    items.push({
                        url,
                        name
                    });
                } catch (e) {
                    console.error('failed parse zk.fm res', e);
                }

            });

            const target = this.checkResult(items);
            target ? this.cb([target]) : next();
        };
        x.send();
    }

    searchOnMp3cc(next) {
        const url = `http://mp3cc.com/search/f/${this.q}/`;
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onload = () => {
            if (x.status !== 200) {
                next();
                return;
            }
            const uls = x.responseText.match(/<li class="track"[\s\S]+?<\/li>/g);

            if (!uls) {
                this.cb(null);
                return;
            }
            const items = [];
            uls.forEach(ul => {
                try {
                    const path = ul.match(/data-mp3="(.+?)"/)[1];
                    const url = 'http://mp3cc.com/' + path;
                    const artist = ul.match(/<b><.+?>(.+?)<\/a>/)[1];
                    const title = ul.match(/<em><.+?>(.+?)<\/a>/)[1];
                    const name = artist + ' - ' + title;
                    items.push({
                        url,
                        name
                    });
                } catch (e) {
                    console.error('failed parse mp3cc.com res', e);
                }
            });
            this.items = this.items.concat(items);

            const target = this.checkResult(items);
            target ? this.cb([target]) : next();
        };
        x.send();
    }

    checkResult(items) {
        return items.find(item => this.compareNames(item.name, this.query));
    }

    compareNames(n1, n2) {
        const cl = s => s.toLowerCase().replace(/[^\w]/g, '').replace('feat', '');
        return cl(n1) === cl(n2);
    }
};