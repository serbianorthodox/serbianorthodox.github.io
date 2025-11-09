(function () {
  var orig = window.fetch;
  if (!orig) return;
  window.fetch = function (input, init) {
    try {
      var u = (typeof input === 'string') ? input : (input && input.url);
      if (u && u.indexOf('data/news/index.json') !== -1) {
        var sep = u.indexOf('?') === -1 ? '?' : '&';
        var busted = u + sep + 'cb=' + Date.now();
        return orig.call(this, busted, init);
      }
    } catch (e) {}
    return orig.call(this, input, init);
  };
})();
