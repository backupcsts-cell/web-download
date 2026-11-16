var App={items:[],cat:[],extra:null};
(function(){
var $=function(i){return document.getElementById(i)};
App.esc=function(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML};
function opts(s,first,v){var cur=s.value;s.innerHTML='<option value="">'+first+'</option>'+v.map(function(x){return'<option>'+App.esc(x)+'</option>'}).join('');s.value=cur}
App.render=function(){
  var ys=[],i;App.items.forEach(function(p){if(ys.indexOf(p.anno)<0)ys.push(p.anno)});ys.sort().reverse();
  opts($('fy'),'Tutti gli anni',ys);opts($('fc'),'Tutte le categorie',App.cat);
  var y=$('fy').value,c=$('fc').value,k=$('fk').value,q=$('q').value.toLowerCase();
  var r=App.items.filter(function(p){return(!y||p.anno==y)&&(!c||p.categoria==c)&&(!k||p.tipo==k)&&(!q||(p.titolo+p.descrizione).toLowerCase().indexOf(q)>-1)});
  r.sort(function(a,b){return a.anno!=b.anno?b.anno-a.anno:a.categoria<b.categoria?-1:a.categoria>b.categoria?1:a.data<b.data?1:-1});
  var h='',cy='',cc='';
  r.forEach(function(p){
    if(p.anno!=cy){cy=p.anno;cc='';h+='<h2 class="y">'+App.esc(cy)+'</h2>'}
    if(p.categoria!=cc){cc=p.categoria;h+='<h3 class="c">'+App.esc(cc)+'</h3>'}
    h+='<div class="it"><span class="tag">'+(p.tipo=='update'?'Update':'Nota')+'</span>'+(p.versione?'<span class="m">v'+App.esc(p.versione)+' · </span>':'')+'<span class="m">'+App.esc(p.data)+'</span><div><b>'+App.esc(p.titolo)+'</b></div>'
    +(p.descrizione?'<div class="b">'+App.esc(p.descrizione)+'</div>':'')
    +'<div class="act">'+(p.ha?'<button class="p" data-dl="'+p.id+'">⬇ Scarica</button>':'')+(App.extra?App.extra(p):'')+'</div></div>'});
  $('list').innerHTML=h||'<p class="m">Nessuna pubblicazione.</p>'};
App.load=function(){return Api.call('elenco').then(function(j){App.items=j.items;App.cat=j.cat;App.render();if(App.onload)App.onload()})};
App.start=function(){$('login').hidden=true;$('app').hidden=false;$('out').hidden=false;$('who').textContent=Api.role=='admin'?'Amministratore':'Cliente';App.load().catch(function(){})};
['q','fy','fc','fk'].forEach(function(i){$(i).oninput=App.render});
$('list').addEventListener('click',function(e){var id=e.target.getAttribute('data-dl');if(!id)return;
  Api.call('scarica',{id:id}).then(function(j){window.open(j.url,'_blank','noopener,noreferrer')}).catch(function(x){alert(x.message)})});
if(Api.t)App.start();
})();
