String.prototype.htmlSymDecode = function(){
    const el = document.createElement("div");
    el.innerHTML = this;
    return el.innerText;
};

String.prototype.clearFilename = function(){
    const unsafeChars = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    return this
    .htmlSymDecode()
    .replace(/^\./, '_')
    .replace(unsafeChars, '')
    .replace(/[\\/:*?<>|~"↵\t]/g, '_')
    .slice(0, 100);
};

String.prototype.xTrim = function(){
    return this.replace(/(\r\n|\n|\r|↵)/gm, " ").replace(/ +/g, ' ').trim();
};
