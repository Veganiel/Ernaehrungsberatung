(() => {
  const load=src=>new Promise(resolve=>{const existing=[...document.scripts].find(script=>script.src===src);if(existing){if(existing.dataset.loaded==='1'||window.supabase||window.SUPABASE_URL)resolve();else existing.addEventListener('load',resolve,{once:true});return;}const script=document.createElement('script');script.src=src;script.onload=()=>{script.dataset.loaded='1';resolve();};script.onerror=resolve;document.head.append(script);});
  const page=path=>new URL(path,document.currentScript?.src||location.href).href;
  const holder=()=>{let target=document.querySelector('#vn-account-avatar');if(target)return target;const link=document.querySelector('.account-nav');if(!link)return null;target=document.createElement('span');target.id='vn-account-avatar';target.className='vn-account-avatar';target.setAttribute('aria-hidden','true');const text=document.createElement('span');text.textContent=link.textContent.trim();link.replaceChildren(target,text);return target;};
  const render=url=>{const target=holder();if(!target)return;target.replaceChildren();if(url){const image=document.createElement('img');image.src=url;image.alt='';target.append(image);}else target.textContent='●';};
  const cached=()=>{try{return localStorage.getItem('veganiel.profile-avatar.current')||'';}catch{return '';}};
  const remember=url=>{try{localStorage.setItem('veganiel.profile-avatar.current',url);}catch{};render(url);};
  render(cached());
  window.addEventListener('veganiel:avatar-change',()=>render(cached()));
  window.addEventListener('storage',event=>{if(event.key==='veganiel.profile-avatar.current')render(event.newValue||'');});
  (async()=>{if(!window.SUPABASE_URL)await load(page('../community/config.js'));if(!window.supabase)await load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');if(!window.supabase||!window.SUPABASE_URL||!window.SUPABASE_PUBLISHABLE_KEY)return;const client=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);const {data:{user}}=await client.auth.getUser();if(!user)return;const {data}=await client.from('profiles').select('avatar_url').eq('id',user.id).maybeSingle();if(data?.avatar_url)remember(data.avatar_url);})();
})();
