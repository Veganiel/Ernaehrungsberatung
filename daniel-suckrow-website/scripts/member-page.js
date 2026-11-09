(() => {
 if(!window.VeganielMember?.client)return;
 const sb=window.VeganielMember.client,$=id=>document.getElementById(id);let user=null,recovery=false,renderVersion=0;
 const status=text=>{$('member-status').textContent=text;};
 const registrationError=error=>{
  const code=error?.code||'';
  if(code==='email_address_invalid')return 'Bitte prüfe, ob deine E-Mail-Adresse vollständig und richtig geschrieben ist.';
  if(code==='weak_password')return 'Das Passwort ist noch zu schwach. Verwende mindestens zwölf Zeichen und vermeide leicht erratbare Wörter.';
  if(code==='user_already_exists'||code==='email_exists')return 'Für diese E-Mail-Adresse besteht bereits ein Konto. Nutze die Anmeldung oder „Passwort vergessen“.';
  if(code==='over_email_send_rate_limit')return 'Es wurden gerade zu viele E-Mails angefordert. Bitte warte einige Minuten und versuche es dann erneut.';
  if(code==='unexpected_failure')return 'Die Bestätigungs-E-Mail konnte gerade nicht versendet werden. Bitte versuche es in einigen Minuten erneut.';
  return 'Registrierung gerade nicht möglich. Bitte prüfe deine Angaben oder versuche es später erneut.';
 };
 async function run(button,action){button.disabled=true;try{await action();}catch{status('Das hat gerade nicht funktioniert. Bitte versuche es erneut. Deine Eingaben bleiben erhalten.');}finally{button.disabled=false;}}
 async function render(){
  const version=++renderVersion;const {data,error}=await sb.auth.getUser();if(version!==renderVersion)return;user=data?.user||null;
  $('member-auth').hidden=!!user||recovery;$('member-home').hidden=!user||recovery;$('recovery-panel').hidden=!recovery;
  if(!user||recovery){$('profile-form').reset();$('account-email').textContent='';return;}
  $('account-email').textContent=user.email;
  const [profile,details,quiz]=await Promise.all([sb.from('profiles').select('display_name').eq('id',user.id).maybeSingle(),sb.from('member_details').select('full_name,address_line,postal_code,city,country').eq('user_id',user.id).maybeSingle(),sb.from('quiz_results').select('quiz_key,best').eq('user_id',user.id)]);
  if(version!==renderVersion)return;
  if(profile.error||details.error||quiz.error){status('Deine gespeicherten Angaben konnten noch nicht geladen werden. Bitte lade die Seite erneut.');$('profile-form').querySelector('button').disabled=true;return;}
  $('profile-form').querySelector('button').disabled=false;
  $('profile-display').value=profile.data?.display_name||user.user_metadata?.display_name||'Mitglied';
  for(const [id,key] of Object.entries({'full-name':'full_name',address:'address_line',postal:'postal_code',city:'city',country:'country'}))$(id).value=details.data?.[key]||'';
  $('account-quiz-summary').replaceChildren(document.createTextNode(String(quiz.data?.length||0)+' '));const summary=document.createElement('span');summary.textContent='gespeicherte Quiz-Bestwerte.';$('account-quiz-summary').append(summary);
  updateContact();
 }
 function updateContact(){if(!user)return;const text='Hallo Daniel,\n\nich interessiere mich für eine Ernährungsberatung.\n\nName: '+$('full-name').value+'\nKonto-E-Mail: '+user.email+'\nKontokennung: '+user.id+'\n\nMein Anliegen (ohne medizinische Unterlagen):\n';$('consultation-email').href='mailto:info@veganiel.com?subject='+encodeURIComponent('Beratungsanfrage aus meinem Veganiel-Konto')+'&body='+encodeURIComponent(text);}
 $('login-form').addEventListener('submit',e=>{e.preventDefault();run(e.submitter,async()=>{const {error}=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){status('Anmeldung nicht möglich. Bitte prüfe E-Mail-Adresse und Passwort sowie die E-Mail-Bestätigung.');return;}$('password').value='';status('Du bist angemeldet.');await render();});});
 $('register').addEventListener('click',()=>{$('register-fields').hidden=false;$('password').autocomplete='new-password';$('display-name').focus();});
 $('confirm-register').addEventListener('click',e=>run(e.currentTarget,async()=>{if(!$('login-form').reportValidity())return;if($('password').value.length<12){status('Bitte wähle ein Passwort mit mindestens zwölf Zeichen.');return;}const display=$('display-name').value.trim();if(!display){status('Bitte wähle einen öffentlichen Anzeigenamen.');return;}const {error}=await sb.auth.signUp({email:$('email').value.trim(),password:$('password').value,options:{emailRedirectTo:location.origin+'/konto.html',data:{display_name:display}}});if(error){status(registrationError(error));return;}$('password').value='';status('Bitte prüfe dein E-Mail-Postfach und bestätige deine Adresse. Falls bereits ein Konto besteht, nutze die Anmeldung oder „Passwort vergessen“.');}));
 $('forgot').addEventListener('click',e=>run(e.currentTarget,async()=>{if(!$('email').reportValidity())return;const {error}=await sb.auth.resetPasswordForEmail($('email').value.trim(),{redirectTo:location.origin+'/konto.html?recovery=1'});if(error)throw error;status('Falls ein Konto mit dieser Adresse existiert, erhältst du einen Link zum Zurücksetzen.');}));
 $('recovery-form').addEventListener('submit',e=>{e.preventDefault();run(e.submitter,async()=>{const {error}=await sb.auth.updateUser({password:$('new-password').value});if(error)throw error;$('new-password').value='';recovery=false;history.replaceState(null,'','/konto.html');status('Dein Passwort wurde geändert.');await render();});});
 $('profile-form').addEventListener('submit',e=>{e.preventDefault();run(e.submitter,async()=>{if(!user)throw Error();const id=user.id;const {error}=await sb.from('member_details').upsert({user_id:id,full_name:$('full-name').value.trim(),address_line:$('address').value.trim(),postal_code:$('postal').value.trim(),city:$('city').value.trim(),country:$('country').value.trim(),updated_at:new Date().toISOString()});if(error)throw error;const result=await sb.from('profiles').upsert({id,display_name:$('profile-display').value.trim()||'Mitglied',updated_at:new Date().toISOString()});if(result.error){status('Private Angaben gespeichert. Der Anzeigename konnte gerade nicht aktualisiert werden.');return;}updateContact();status('Dein Profil wurde gespeichert.');});});
 $('logout').addEventListener('click',e=>run(e.currentTarget,async()=>{const {error}=await sb.auth.signOut();if(error)throw error;$('profile-form').reset();status('Du bist abgemeldet.');await render();}));
 if(new URLSearchParams(location.hash.slice(1)).has('error'))status('Der Bestätigungslink ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.');
 sb.auth.onAuthStateChange(event=>{if(event==='TOKEN_REFRESHED')return;if(event==='PASSWORD_RECOVERY')recovery=true;if(event==='SIGNED_OUT')recovery=false;setTimeout(()=>render(),0);});
 render();
})();
