(function(){
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded",fn); }
  ready(function(){
    var targets = document.querySelectorAll(".hero-img, .gallery-img, .card-img-top, picture img");
    if(!("IntersectionObserver" in window)){ targets.forEach(function(img){ img.classList.add("is-visible"); }); return; }
    targets.forEach(function(img){ img.classList.add("fade-img"); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target;
        function show(){ el.classList.add("is-visible"); io.unobserve(el); }
        if (el.complete) { show(); }
        else {
          el.addEventListener("load", show, { once:true });
          el.addEventListener("error", show, { once:true });
        }
      });
    }, { root:null, rootMargin:"100px", threshold:0.01 });
    targets.forEach(function(img){ io.observe(img); });
  });
})();
