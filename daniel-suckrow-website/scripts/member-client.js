(() => {
 'use strict';
 const client=window.supabase?.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY)||null;
 window.VeganielMember={client};
 if(!client){const status=document.getElementById('member-status')||document.getElementById('quiz-account-status');if(status)status.textContent='Die Kontoverbindung konnte nicht geladen werden. Bitte lade die Seite erneut. Quizze bleiben ohne Konto verfügbar.';document.querySelectorAll('#member-auth button').forEach(b=>b.disabled=true);}
})();
