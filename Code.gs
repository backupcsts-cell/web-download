// Google Apps Script collegato al foglio Google. Schede e colonne:
// Utenti: email | ruolo (admin/cliente) | attivo (SI/NO)
// Categorie: nome
// Contenuti: id | data | anno | categoria | tipo | titolo | descrizione | versione | link
var SCHEDE={
  Utenti:['email','ruolo','attivo'],
  Categorie:['nome'],
  Contenuti:['id','data','anno','categoria','tipo','titolo','descrizione','versione','link']
};
// Alla prima esecuzione crea (se serve) il foglio Google con tutte le schede e colonne.
function getSS(){
  var P=PropertiesService.getScriptProperties(),s=SpreadsheetApp.getActive();
  if(!s){var id=P.getProperty('SHEET_ID');
    if(id)s=SpreadsheetApp.openById(id);
    else{s=SpreadsheetApp.create('Portale Aggiornamenti');P.setProperty('SHEET_ID',s.getId())}}
  if(!P.getProperty('INIT')){
    var first=s.getSheets()[0];
    Object.keys(SCHEDE).forEach(function(n){
      var sh=s.getSheetByName(n);
      if(!sh){sh=s.insertSheet(n);
        sh.getRange(1,1,1,SCHEDE[n].length).setValues([SCHEDE[n]]).setFontWeight('bold').setBackground('#e8eefc');
        sh.setFrozenRows(1);
        if(n=='Utenti')sh.appendRow([Session.getEffectiveUser().getEmail(),'admin','SI']);
        if(n=='Categorie')['Paghe','Contabilità','Fiscale'].forEach(function(c){sh.appendRow([c])});
        if(n=='Contenuti')sh.getRange('B:B').setNumberFormat('@');
      }});
    if(first&&!SCHEDE[first.getName()]&&s.getSheets().length>1)s.deleteSheet(first);
    P.setProperty('INIT','1');
  }
  return s;
}
// Esegui UNA volta dall'editor (menu: setup → Esegui) e autorizza. Il log mostra l'URL del foglio.
function setup(){Logger.log(getSS().getUrl())}
var SS=getSS(),C=CacheService.getScriptCache();
function tab(n){var v=SS.getSheetByName(n).getDataRange().getValues(),h=v.shift();
  return v.map(function(r,i){var o={_r:i+2};h.forEach(function(k,j){o[k]=r[j] instanceof Date?Utilities.formatDate(r[j],'Europe/Rome','yyyy-MM-dd'):r[j]});return o})}
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function doPost(e){try{var d=JSON.parse(e.postData.contents);return out(H[d.a](d))}catch(x){return out({err:String(x.message||x)})}}
function utente(e){return tab('Utenti').filter(function(r){return String(r.email).trim().toLowerCase()==e&&String(r.attivo).toUpperCase()=='SI'})[0]}
function sess(d,admin){var s=C.get('t_'+d.t);if(!s)throw new Error('Sessione scaduta');s=JSON.parse(s);if(admin&&s.r!='admin')throw new Error('Non autorizzato');return s}
function riga(id){var x=tab('Contenuti').filter(function(r){return r.id==id})[0];if(!x)throw new Error('Non trovato');return x}
var H={
richiedi:function(d){var e=String(d.email).trim().toLowerCase();
  if(utente(e)){var c=String(Math.floor(100000+Math.random()*900000));C.put('c_'+e,c,600);C.put('n_'+e,'0',600);
    MailApp.sendEmail(e,'Codice di accesso','Il tuo codice: '+c+' (valido 10 minuti)')}
  return{ok:1}},
verifica:function(d){var e=String(d.email).trim().toLowerCase(),c=C.get('c_'+e),n=Number(C.get('n_'+e)||0),u=utente(e);
  if(!c||n>=5||!u)throw new Error('Codice non valido o scaduto');
  if(c!=String(d.code).trim()){C.put('n_'+e,String(n+1),600);throw new Error('Codice errato')}
  C.remove('c_'+e);var r=String(u.ruolo).toLowerCase()=='admin'?'admin':'cliente',t=Utilities.getUuid();
  C.put('t_'+t,JSON.stringify({e:e,r:r}),21600);return{t:t,r:r}},
elenco:function(d){sess(d);return{cat:tab('Categorie').map(function(r){return r.nome}),
  items:tab('Contenuti').map(function(r){return{id:r.id,data:r.data,anno:r.anno,categoria:r.categoria,tipo:r.tipo,titolo:r.titolo,descrizione:r.descrizione,versione:r.versione,ha:!!r.link}})}},
scarica:function(d){sess(d);return{url:riga(d.id).link}},
leggi:function(d){sess(d,1);return{item:riga(d.id)}},
salva:function(d){sess(d,1);if(d.link&&!/^https:\/\//.test(d.link))throw new Error('Link non valido');
  var v=[d.id||Utilities.getUuid(),d.data,Number(String(d.data).slice(0,4)),d.categoria,d.tipo,d.titolo,d.descrizione,d.versione,d.link],sh=SS.getSheetByName('Contenuti');
  if(d.id)sh.getRange(riga(d.id)._r,1,1,9).setValues([v]);else sh.appendRow(v);return{ok:1}},
elimina:function(d){sess(d,1);SS.getSheetByName('Contenuti').deleteRow(riga(d.id)._r);return{ok:1}},
categoria:function(d){sess(d,1);SS.getSheetByName('Categorie').appendRow([String(d.nome).trim()]);return{ok:1}}
};
