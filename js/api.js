// CONFIG: incolla qui l'URL della Web App di Google Apps Script
var CFG={API:'https://script.google.com/macros/s/AKfycbwTHRU45nWpEBdG0zRkSm8KAD2zrTUTZ3PH5ExT2Lb5VnUkXZCDhG_DRbwK3xtTvcqwYA/exec'};
var Api={
  t:sessionStorage.getItem('t'),role:sessionStorage.getItem('r'),
  call:function(a,d){d=d||{};d.a=a;d.t=Api.t;
    return fetch(CFG.API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)})
    .then(function(r){return r.json()}).then(function(j){if(j.err){if(/Sessione/.test(j.err))Api.logout();throw new Error(j.err)}return j})},
  logout:function(){sessionStorage.clear();location.reload()}
};
(function(){
  var $=function(i){return document.getElementById(i)},em='';
  function err(m){$('err').textContent=m||''}
  $('go1').onclick=function(){em=$('em').value.trim();err();
    Api.call('richiedi',{email:em}).then(function(){$('s1').hidden=true;$('s2').hidden=false}).catch(function(e){err(e.message)})};
  $('go2').onclick=function(){err();
    Api.call('verifica',{email:em,code:$('cd').value}).then(function(j){
      Api.t=j.t;Api.role=j.r;sessionStorage.setItem('t',j.t);sessionStorage.setItem('r',j.r);App.start()}).catch(function(e){err(e.message)})};
  $('out').onclick=Api.logout;
})();
