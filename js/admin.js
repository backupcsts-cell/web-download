(function(){
var $=function(i){return document.getElementById(i)},cur='';
if(Api.role!='admin'&&!Api.t)document.addEventListener('DOMContentLoaded',function(){});
App.extra=function(p){return Api.role=='admin'?'<button data-ed="'+p.id+'">Modifica</button><button class="del" data-rm="'+p.id+'">Elimina</button>':''};
App.onload=function(){if(Api.role!='admin')return;$('adm').hidden=false;
  var v=$('a_c').value;$('a_c').innerHTML=App.cat.map(function(c){return'<option>'+App.esc(c)+'</option>'}).join('');if(v)$('a_c').value=v};
function reset(){cur='';['a_t','a_v','a_l','a_b'].forEach(function(i){$(i).value=''});$('a_d').value=new Date().toISOString().slice(0,10)}
$('a_x').onclick=reset;
$('a_s').onclick=function(){
  if(!$('a_t').value||!$('a_d').value)return alert('Titolo e data obbligatori');
  Api.call('salva',{id:cur,titolo:$('a_t').value,data:$('a_d').value,categoria:$('a_c').value,tipo:$('a_k').value,versione:$('a_v').value,link:$('a_l').value,descrizione:$('a_b').value})
  .then(function(){reset();return App.load()}).catch(function(e){alert(e.message)})};
$('a_nc').onclick=function(){var n=$('a_n').value.trim();if(!n)return;
  Api.call('categoria',{nome:n}).then(function(){$('a_n').value='';return App.load()}).catch(function(e){alert(e.message)})};
$('list').addEventListener('click',function(e){
  var rm=e.target.getAttribute('data-rm'),ed=e.target.getAttribute('data-ed');
  if(rm&&confirm('Eliminare?'))Api.call('elimina',{id:rm}).then(App.load).catch(function(x){alert(x.message)});
  if(ed)Api.call('leggi',{id:ed}).then(function(j){var p=j.item;cur=p.id;$('a_t').value=p.titolo;$('a_d').value=p.data;$('a_c').value=p.categoria;$('a_k').value=p.tipo;$('a_v').value=p.versione;$('a_l').value=p.link;$('a_b').value=p.descrizione;window.scrollTo(0,0)})});
})();
