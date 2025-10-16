(function(){
  var grid=document.getElementById("gallery-grid");
  if(!grid) return;
  var cards=grid.querySelectorAll("picture");
  var sizes="(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw";
  cards.forEach(function(pic){
    var webp=pic.querySelector('source[type="image/webp"]');
    var img=pic.querySelector("img");
    if(!img) return;
    function build(base,ext){
      return base+"-600."+ext+" 600w, "+base+"-1200."+ext+" 1200w";
    }
    function parseBase(url){
      var u=url.split("?")[0];
      var m=u.match(/^(.*)-\d+\.(webp|jpe?g)$/i);
      if(!m) return null;
      return {base:m[1], ext:m[2].toLowerCase()};
    }
    if(webp && webp.getAttribute("srcset")){
      var w=webp.getAttribute("srcset").split("?")[0];
      var p=parseBase(w.trim().split(/\s+/)[0]);
      if(p) webp.setAttribute("srcset", build(p.base,"webp"));
      webp.setAttribute("sizes", sizes);
    } else if(webp && webp.getAttribute("src")){
      var p2=parseBase(webp.getAttribute("src"));
      if(p2) webp.setAttribute("srcset", build(p2.base,"webp"));
      webp.setAttribute("sizes", sizes);
    }
    var src=img.getAttribute("src");
    var pj=parseBase(src||"");
    if(pj){
      var ext=pj.ext==="jpeg"?"jpg":pj.ext;
      img.setAttribute("srcset", build(pj.base,ext));
      img.setAttribute("sizes", sizes);
      if(!img.getAttribute("loading")) img.setAttribute("loading","lazy");
      if(!img.getAttribute("decoding")) img.setAttribute("decoding","async");
    }
  });
})();
