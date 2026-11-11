(() => {
  const avatarStyle = document.createElement("link");
  avatarStyle.rel = "stylesheet";
  avatarStyle.href = "styles/member-avatar.css";
  document.head.append(avatarStyle);
  if (!window.VeganielMember?.client) {
    document.body.classList.remove("member-pending");
    return;
  }
  const sb = window.VeganielMember.client,
    $ = (id) => document.getElementById(id);
  let user = null,
    recovery = false,
    renderVersion = 0;
  const status = (text) => {
    $("member-status").textContent = text;
  };
  const registrationError = (error) => {
    const code = error?.code || "";
    if (code === "email_address_invalid")
      return "Bitte prüfe, ob deine E-Mail-Adresse vollständig und richtig geschrieben ist.";
    if (code === "weak_password")
      return "Das Passwort ist noch zu schwach. Verwende mindestens zwölf Zeichen und vermeide leicht erratbare Wörter.";
    if (code === "user_already_exists" || code === "email_exists")
      return "Für diese E-Mail-Adresse besteht bereits ein Konto. Nutze die Anmeldung oder „Passwort vergessen“.";
    if (code === "over_email_send_rate_limit")
      return "Es wurden gerade zu viele E-Mails angefordert. Bitte warte einige Minuten und versuche es dann erneut.";
    if (code === "unexpected_failure")
      return "Die Bestätigungs-E-Mail konnte gerade nicht versendet werden. Bitte versuche es in einigen Minuten erneut.";
    return "Registrierung gerade nicht möglich. Bitte prüfe deine Angaben oder versuche es später erneut.";
  };
  async function run(button, action) {
    button.disabled = true;
    try {
      await action();
    } catch {
      status(
        "Das hat gerade nicht funktioniert. Bitte versuche es erneut. Deine Eingaben bleiben erhalten.",
      );
    } finally {
      button.disabled = false;
    }
  }
  function registrationChoices() {
    if ($("league-consent")) return;
    const box = $("register-fields"),
      choices = document.createElement("div");
    choices.className = "private-note";
    choices.innerHTML =
      '<label><input id="terms-consent" type="checkbox" required> Ich akzeptiere die <a href="agb.html" target="_blank" rel="noopener">AGB</a>.</label><label><input id="league-consent" type="checkbox"> Mein öffentlicher Anzeigename darf in der wöchentlichen Quiz-Liga erscheinen. Diese freiwillige Einstellung kann ich jederzeit in meinem Konto ändern.</label>';
    box.insertBefore(choices, $("confirm-register"));
  }
  function leagueProfileChoice(value) {
    let input = $("profile-league");
    if (!input) {
      const choice = document.createElement("label");
      choice.className = "private-note";
      choice.innerHTML =
        '<input id="profile-league" type="checkbox"> Mit meinem öffentlichen Anzeigenamen an der wöchentlichen Quiz-Liga teilnehmen. Diese Einstellung ist freiwillig und jederzeit änderbar.';
      ($("league-choice") || $("profile-form")).append(choice);
      input = $("profile-league");
    }
    input.checked = !!value;
  }
  function setupProfileLayout() {
    const form = $("profile-form");
    if (!$("profile-data-disclosure")) {
      const details = document.createElement("details"),
        summary = document.createElement("summary"),
        league = document.createElement("div");
      details.id = "profile-data-disclosure";
      summary.textContent = "Accountdaten aktualisieren";
      details.append(summary);
      form.before(details);
      details.append(form);
      league.id = "league-choice";
      league.className = "league-choice";
      details.after(league);
    }
    const choice = $("profile-league")?.closest("label");
    if (choice) $("league-choice").append(choice);
  }
  function history() {
    try {
      const legacy =
          window.VeganielWellbeingHistory?.read?.() ??
          JSON.parse(
            localStorage.getItem("veganiel.wellbeing-history.v1") || "[]",
          ),
        profile = JSON.parse(
          localStorage.getItem("veganiel.health-profile.v1") || "null",
        ),
        profileRows = Array.isArray(profile?.checks)
          ? profile.checks.flatMap((check) => {
              const at = String(check.date || "").match(/^\d{4}-\d{2}-\d{2}$/)
                ? check.date + "T12:00:00.000Z"
                : null;
              if (!at) return [];
              const rows = [];
              if (Number.isFinite(Number(check.score)))
                rows.push({
                  kind: "health",
                  at,
                  score: Number(check.score),
                  total: Number.isFinite(Number(check.totalPoints))
                    ? Number(check.totalPoints)
                    : null,
                });
              if (Number.isFinite(Number(check.vo2)))
                rows.push({
                  kind: "vo2",
                  at,
                  value: Number(check.vo2),
                  method: "Gesundheits-Check",
                });
              if (
                Number.isFinite(Number(check.waistRatio)) &&
                Number.isFinite(Number(check.bmi))
              )
                rows.push({
                  kind: "waist",
                  at,
                  ratio: Number(check.waistRatio),
                  bmi: Number(check.bmi),
                  category: "Aus Gesundheits-Check",
                });
              return rows;
            })
          : [],
        direct = JSON.parse(
          localStorage.getItem("veganiel.supplement-calculator.v1") || "null",
        ),
        directRows =
          direct?.touched && Array.isArray(direct.products) && direct.products.length
            ? [
                {
                  kind: "supplements",
                  at: direct.at || new Date().toISOString(),
                  total: Number(direct.total),
                  products: direct.products,
                },
              ]
            : [],
        merged = [
          ...(Array.isArray(legacy) ? legacy : []),
          ...profileRows,
          ...directRows,
        ].filter((row) => row && typeof row.kind === "string" && row.at),
        seen = new Set();
      return merged
        .filter((row) => {
          const id = row.kind + "|" + row.at;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .sort((a, b) => String(a.at).localeCompare(String(b.at)));
    } catch {
      return [];
    }
  }
  function latest(rows, kind) {
    return rows.filter((row) => row.kind === kind).at(-1);
  }
 const SVGNS='http://www.w3.org/2000/svg';let chartSeq=0;
 const svgEl=(tag,attrs={})=>{const node=document.createElementNS(SVGNS,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));return node;};
 const htmlEl=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!=null)node.textContent=text;return node;};
 const deNumber=(value,digits=0)=>Number(value).toLocaleString('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits});
 const longDate=row=>new Date(row.at).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'});
 const shortDate=row=>new Date(row.at).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'});
 const ICONS={quiz:'M4 5h12M4 10h12M4 15h7',health:'M10 16.5s-6-3.6-6-8A3.4 3.4 0 0 1 10 6.3a3.4 3.4 0 0 1 6 2.2c0 4.4-6 8-6 8z',vo2:'M3 13l4-4 3 3 7-7M12 5h5v5',heart:'M2.5 10h3.5l2-4.5 4 9 2-4.5h3.5',waist:'M4 4v12M16 4v12M4 10h12M7 8l-3 2 3 2M13 8l3 2-3 2',supplements:'M7.5 3.5l9 9a3.2 3.2 0 0 1-4.5 4.5l-9-9a3.2 3.2 0 0 1 4.5-4.5zM6 10l4-4'};
 function icon(kind){const box=htmlEl('span','oc-icon'),svg=svgEl('svg',{viewBox:'0 0 20 20','aria-hidden':'true'});svg.append(svgEl('path',{d:ICONS[kind]||ICONS.quiz,fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round'}));box.append(svg);return box;}
 function niceScale(values,fixedMax){let lo,hi;if(fixedMax){lo=0;hi=Math.max(fixedMax,...values);}else{const min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.35,Math.abs(max)*.03,.5);lo=min-pad;hi=max+pad;if(min>=0&&lo<0)lo=0;}const raw=(hi-lo)/3,mag=10**Math.floor(Math.log10(raw||1)),step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw)||mag*10;lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;if(hi===lo)hi=lo+step;const ticks=[];for(let t=lo;t<=hi+step/2;t+=step)ticks.push(Number(t.toFixed(6)));return {lo,hi,ticks,step};}
 function smoothPath(points){if(points.length<3)return 'M'+points.map(p=>p.join(',')).join('L');const n=points.length,dx=[],slope=[],tangent=[];for(let i=0;i<n-1;i++){dx[i]=points[i+1][0]-points[i][0];slope[i]=(points[i+1][1]-points[i][1])/dx[i];}tangent[0]=slope[0];tangent[n-1]=slope[n-2];for(let i=1;i<n-1;i++)tangent[i]=slope[i-1]*slope[i]<=0?0:(slope[i-1]+slope[i])/2;for(let i=0;i<n-1;i++){if(slope[i]===0){tangent[i]=tangent[i+1]=0;continue;}const a=tangent[i]/slope[i],b=tangent[i+1]/slope[i],s=a*a+b*b;if(s>9){const tau=3/Math.sqrt(s);tangent[i]=tau*a*slope[i];tangent[i+1]=tau*b*slope[i];}}let d='M'+points[0].join(',');for(let i=0;i<n-1;i++){const [x0,y0]=points[i],[x1,y1]=points[i+1],h=dx[i]/3;d+='C'+(x0+h)+','+(y0+tangent[i]*h)+' '+(x1-h)+','+(y1-tangent[i+1]*h)+' '+x1+','+y1;}return d;}
 function chart(entries,max=100,label='Verlauf',valueFor=row=>row.value,format=value=>String(value),options={}){
  const rows=(entries||[]).filter(row=>Number.isFinite(Number(valueFor(row)))).slice(-8),series=rows.map(row=>Number(valueFor(row)));
  if(series.length<2){const empty=htmlEl('div','chart-empty');empty.setAttribute('role','img');empty.setAttribute('aria-label',label);if(series.length){empty.append(htmlEl('strong',null,'Erster Wert: '+format(series[0])),htmlEl('span',null,'Gemessen am '+longDate(rows[0])+'. Ab dem zweiten Wert siehst du hier deinen Verlauf.'));}else empty.append(htmlEl('strong',null,'Noch kein Verlauf'),htmlEl('span',null,'Speichere zwei Ergebnisse, um deine Entwicklung zu sehen.'));return empty;}
  const id='mchart'+(++chartSeq),W=320,H=156,pad={l:34,r:16,t:22,b:26},iw=W-pad.l-pad.r,ih=H-pad.t-pad.b,scale=niceScale(series,options.fixedScale?max:0),tickFormat=options.tickFormat||(value=>deNumber(value,Number.isInteger(value)?0:1));
  const xFor=i=>pad.l+(series.length===1?iw/2:i*iw/(series.length-1)),yFor=v=>pad.t+ih-(v-scale.lo)/(scale.hi-scale.lo)*ih,points=series.map((v,i)=>[Number(xFor(i).toFixed(2)),Number(yFor(v).toFixed(2))]);
  const wrap=htmlEl('div','health-chart'),svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H,role:'img',tabindex:'0','aria-label':label+': '+rows.map((row,i)=>shortDate(row)+' '+format(series[i])).join(', ')});
  const defs=svgEl('defs'),grad=svgEl('linearGradient',{id:id+'g',x1:0,y1:0,x2:0,y2:1});grad.append(svgEl('stop',{offset:'0%','stop-color':'currentColor','stop-opacity':'.26'}),svgEl('stop',{offset:'100%','stop-color':'currentColor','stop-opacity':'0'}));defs.append(grad);svg.append(defs);
  scale.ticks.forEach((tick,i)=>{const y=yFor(tick);svg.append(svgEl('line',{class:'grid-line'+(i===0?' base':''),x1:pad.l,x2:W-pad.r,y1:y,y2:y}));const t=svgEl('text',{class:'axis-label',x:pad.l-8,y:y+3.5,'text-anchor':'end'});t.textContent=tickFormat(tick);svg.append(t);});
  const lastIndex=series.length-1,labelled=series.length<=5?null:new Set([0,Math.round(lastIndex/2),lastIndex]);rows.forEach((row,i)=>{if(labelled&&!labelled.has(i))return;const t=svgEl('text',{class:'axis-label',x:xFor(i),y:H-6,'text-anchor':i===0?'start':i===series.length-1?'end':'middle'});t.textContent=shortDate(row);svg.append(t);});
  const line=smoothPath(points),bottom=pad.t+ih;svg.append(svgEl('path',{class:'area',d:line+'L'+points.at(-1)[0]+','+bottom+'L'+points[0][0]+','+bottom+'Z',fill:'url(#'+id+'g)'}));const path=svgEl('path',{class:'series-line',d:line});svg.append(path);
  const cross=svgEl('line',{class:'crosshair',x1:0,x2:0,y1:pad.t-6,y2:bottom});svg.append(cross);
  points.forEach(([x,y],i)=>{const last=i===points.length-1;if(last)svg.append(svgEl('circle',{class:'halo',cx:x,cy:y,r:9}));const dot=svgEl('circle',{class:'series-dot'+(last?' last':''),cx:x,cy:y,r:last?4.5:3});const title=svgEl('title');title.textContent=longDate(rows[i])+': '+format(series[i]);dot.append(title);svg.append(dot);});
  const [lx,ly]=points.at(-1),valueLabel=svgEl('text',{class:'value-label',x:lx-10,y:Math.max(12,ly-10),'text-anchor':'end'});valueLabel.textContent=format(series.at(-1));svg.append(valueLabel);
  const active=svgEl('circle',{class:'active-dot',r:5,cx:0,cy:0});svg.append(active);
  const tip=htmlEl('div','chart-tip');tip.setAttribute('aria-hidden','true');wrap.append(svg,tip);
  let current=-1;const show=i=>{current=Math.max(0,Math.min(points.length-1,i));const [x,y]=points[current];cross.setAttribute('x1',x);cross.setAttribute('x2',x);active.setAttribute('cx',x);active.setAttribute('cy',y);tip.replaceChildren(htmlEl('strong',null,format(series[current])));const prev=series[current-1];const sub=htmlEl('span',null,longDate(rows[current])+(prev!=null?' · '+(series[current]-prev>=0?'+':'−')+deNumber(Math.abs(series[current]-prev),Number.isInteger(series[current]-prev)?0:1):''));tip.append(sub);tip.style.left=(x/W*100)+'%';tip.style.top=(y/H*100)+'%';wrap.classList.add('is-active');};
  const hide=()=>{current=-1;wrap.classList.remove('is-active');};
  svg.addEventListener('pointermove',event=>{const box=svg.getBoundingClientRect(),x=(event.clientX-box.left)/box.width*W;let best=0;points.forEach((p,i)=>{if(Math.abs(p[0]-x)<Math.abs(points[best][0]-x))best=i;});show(best);});
  svg.addEventListener('pointerleave',hide);svg.addEventListener('blur',hide);svg.addEventListener('focus',()=>show(points.length-1));
  svg.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show((current<0?points.length-1:current)+(event.key==='ArrowLeft'?-1:1));}if(event.key==='Escape')hide();});
  requestAnimationFrame(()=>{try{const len=Math.ceil(path.getTotalLength());path.style.strokeDasharray=String(len);path.style.setProperty('--len',String(len));wrap.classList.add('is-drawn');path.addEventListener('animationend',()=>{path.style.strokeDasharray='';},{once:true});}catch{}});
  return wrap;}
 function gauge(value,max){const box=htmlEl('div','oc-gauge'),r=24,c=2*Math.PI*r,svg=svgEl('svg',{viewBox:'0 0 58 58','aria-hidden':'true'}),fill=svgEl('circle',{class:'fill',cx:29,cy:29,r,fill:'none','stroke-width':6,'stroke-linecap':'round','stroke-dasharray':c,'stroke-dashoffset':c});svg.append(svgEl('circle',{class:'track',cx:29,cy:29,r,fill:'none','stroke-width':6}),fill);box.append(svg,htmlEl('span',null,Math.round(Math.max(0,Math.min(1,value/max))*100)+' %'));requestAnimationFrame(()=>requestAnimationFrame(()=>fill.setAttribute('stroke-dashoffset',String(c*(1-Math.max(0,Math.min(1,value/max)))))));return box;}
 function delta(values,goodWhen,digits=0,unit=''){if(values.length<2)return null;const diff=values.at(-1)-values.at(-2),pill=htmlEl('span','oc-delta');if(Math.abs(diff)<(digits?.05:.5)){pill.textContent='± 0'+unit;pill.title='Unverändert zum vorherigen Wert';return pill;}if(goodWhen)pill.classList.add((diff>0)===(goodWhen==='up')?'good':'bad');pill.textContent=(diff>0?'▲ +':'▼ −')+deNumber(Math.abs(diff),digits)+unit;pill.title='Veränderung zum vorherigen Wert';return pill;}
 function card(kind,title,metric,detail,href,extras={}){const node=htmlEl('article','overview-card');node.dataset.kind=kind;if(!metric.value)node.classList.add('is-empty');const head=htmlEl('div','oc-head');head.append(icon(kind),htmlEl('p','overview-label',title));if(extras.delta)head.append(extras.delta);node.append(head);const row=htmlEl('div','oc-metric-row'),m=htmlEl('div','oc-metric'),strong=htmlEl('strong','oc-value',metric.value||metric.empty);m.append(strong);if(metric.value&&metric.unit)m.append(htmlEl('span','oc-unit',metric.unit));row.append(m);if(extras.gauge)row.append(extras.gauge);node.append(row);if(detail)node.append(htmlEl('p','oc-detail',detail));(extras.body||[]).forEach(part=>part&&node.append(part));if(extras.chart)node.append(extras.chart);if(href){const foot=htmlEl('div','oc-foot'),link=htmlEl('a','oc-link');link.href=href;link.append(document.createTextNode(metric.value?'Öffnen':'Jetzt starten'),htmlEl('span',null,'→'));link.lastChild.setAttribute('aria-hidden','true');foot.append(link);node.append(foot);}return node;}
 function chips(items){const list=(items||[]).filter(Boolean);if(!list.length)return null;const box=htmlEl('div','oc-chips');list.forEach(item=>box.append(htmlEl('span','oc-chip',item)));return box;}
 function progress(value,max,left,right){const box=htmlEl('div','oc-progress'),track=htmlEl('div','oc-progress-track'),fill=htmlEl('div','oc-progress-fill');fill.style.width=Math.round(Math.max(0,Math.min(1,value/max))*100)+'%';track.append(fill);track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(max));track.setAttribute('aria-valuenow',String(value));const label=htmlEl('div','oc-progress-label');label.append(htmlEl('span',null,left),htmlEl('span',null,right));box.append(track,label);return box;}
  function avatarKey() {
    return "veganiel.profile-avatar.v1." + (user?.id || "guest");
  }
  const isFactKey = (key) => String(key || "").startsWith("Fakt oder Fake · ");
  function quizBadges(allRows) {
    const factRows = (allRows || []).filter((row) => isFactKey(row.quiz_key)),
      rows = (allRows || []).filter((row) => !isFactKey(row.quiz_key));
    let profile = {
      daily: [],
      sprint: { plays: 0, best: 0 },
      duels: 0,
      factcheck: { plays: 0, best: 0, combo: 0 },
    };
    try {
      const stored = JSON.parse(
        localStorage.getItem("veganiel.quiz-world-profile.v1") || "{}",
      );
      profile = {
        daily: Array.isArray(stored.daily) ? stored.daily : [],
        sprint: stored.sprint || profile.sprint,
        duels: Number(stored.duels) || 0,
        factcheck: stored.factcheck || profile.factcheck,
      };
    } catch {}
    const factPlays = Math.max(
        Number(profile.factcheck.plays) || 0,
        factRows.reduce((sum, row) => sum + (Number(row.attempts) || 0), 0),
      ),
      factBest = Math.max(
        Number(profile.factcheck.best) || 0,
        ...factRows.map((row) => Number(row.best) || 0),
      ),
      factCombo = Math.min(10, Number(profile.factcheck.combo) || 0);
    const today = Math.floor(Date.now() / 86400000),
      days = new Set(profile.daily),
      streak = (() => {
        let n = 0;
        for (let day = today; days.has(day); day--) n++;
        return n;
      })();
    const totalQuizzes = 21,
      attempts = (rows || []).reduce(
        (sum, row) => sum + (Number(row.attempts) || 0),
        0,
      ),
      mastered = (rows || []).filter((row) => row.best >= 8).length,
      perfect = (rows || []).filter((row) => row.best === 10).length,
      hardPerfect = (rows || []).filter(
        (row) => row.quiz_key?.endsWith(" · Schwer") && row.best === 10,
      ).length,
      xp =
        attempts * 20 +
        mastered * 30 +
        perfect * 40 +
        profile.daily.length * 15 +
        (Number(profile.sprint.plays) || 0) * 10 +
        profile.duels * 10 +
        factPlays * 12 +
        (factBest === 10 ? 40 : 0) +
        factCombo * 3;
    return [
      {
        icon: "☀",
        name: "Erster Impuls",
        detail: "Tagesfrage beantwortet",
        earned: profile.daily.length >= 1,
      },
      {
        icon: "⚡",
        name: "Blitzstart",
        detail: "Eine Blitzrunde gespielt",
        earned: (Number(profile.sprint.plays) || 0) >= 1,
      },
      {
        icon: "⏱",
        name: "Schnelldenker:in",
        detail: "8 von 10 in der Blitzrunde",
        earned: (Number(profile.sprint.best) || 0) >= 8,
      },
      {
        icon: "↗",
        name: "Duell eröffnet",
        detail: "Eine Herausforderung geteilt",
        earned: profile.duels >= 1,
      },
      {
        icon: "☘",
        name: "Drei-Tage-Flow",
        detail: "3 Tage in Folge aktiv",
        earned: streak >= 3,
      },
      {
        icon: "✦",
        name: "Wissensfunke",
        detail: "Level Entdecker:in erreicht",
        earned: xp >= 160,
      },
      {
        icon: "◆",
        name: "Quiz-Komplettist:in",
        detail: "Alle " + totalQuizzes + " Quizze abgeschlossen",
        earned: (rows || []).length >= totalQuizzes,
      },
      {
        icon: "♛",
        name: "Wissensmeister:in",
        detail: "Alle " + totalQuizzes + " Quizze mit 10 von 10 gemeistert",
        earned: (rows || []).length >= totalQuizzes && perfect >= totalQuizzes,
      },
      {
        icon: "⚑",
        name: "Unbeirrbar",
        detail: "Alle 7 schweren Quizze mit 10 von 10 gemeistert",
        earned: hardPerfect >= 7,
      },
      {
        icon: "⇄",
        name: "Faktenblick",
        detail: "Eine Runde Fakt oder Fake gespielt",
        earned: factPlays >= 1,
      },
      {
        icon: "◎",
        name: "Combo-Kette",
        detail: "5 Treffer in Folge bei Fakt oder Fake",
        earned: factCombo >= 5,
      },
      {
        icon: "✓",
        name: "Fake-Detektor:in",
        detail: "10 von 10 bei Fakt oder Fake",
        earned: factBest === 10,
      },
    ];
  }
  function setupAvatar(host, profileUrl = "") {
    const avatar = document.createElement("label"),
      input = document.createElement("input"),
      image = document.createElement("img"),
      plus = document.createElement("span");
    avatar.className = "profile-avatar";
    avatar.title = "Profilbild hinzufügen oder ändern";
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.hidden = true;
    plus.className = "profile-avatar-plus";
    plus.textContent = "+";
    plus.setAttribute("aria-hidden", "true");
    let saved = profileUrl;
    try {
      saved =
        saved ||
        localStorage.getItem(avatarKey()) ||
        localStorage.getItem("veganiel.profile-avatar.current") ||
        "";
    } catch {}
    const draw = (url) => {
      avatar.replaceChildren();
      if (url) {
        image.src = url;
        image.alt = "Dein Profilbild";
        avatar.append(image);
      } else
        avatar.append(
          document.createTextNode(
            (user?.user_metadata?.display_name || user?.email || "?")
              .trim()
              .charAt(0)
              .toUpperCase(),
          ),
        );
      avatar.append(plus, input);
    };
    draw(saved);
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file || file.size > 1200000) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          localStorage.setItem(avatarKey(), String(reader.result));
          localStorage.setItem(
            "veganiel.profile-avatar.current",
            String(reader.result),
          );
        } catch {}
        draw(String(reader.result));
        window.dispatchEvent(new Event("veganiel:avatar-change"));
      };
      reader.readAsDataURL(file);
      const ext = (file.name.split(".").pop() || "jpg").replace(
        /[^a-z0-9]/gi,
        "",
      );
      const path = user.id + "/profile." + ext;
      const upload = await sb.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!upload.error) {
        const { data } = sb.storage.from("avatars").getPublicUrl(path);
        const url = data.publicUrl + "?v=" + Date.now();
        await sb
          .from("profiles")
          .upsert({
            id: user.id,
            display_name: $("profile-display").value.trim() || "Mitglied",
            avatar_url: url,
            updated_at: new Date().toISOString(),
          });
        try {
          localStorage.setItem("veganiel.profile-avatar.current", url);
        } catch {}
        draw(url);
        window.dispatchEvent(new Event("veganiel:avatar-change"));
      }
    });
    host.append(avatar);
  }
 function renderOverview(quizRows,awards,profileUrl){
  const home=$('member-home');let panel=$('member-overview');if(!panel){panel=document.createElement('section');panel.id='member-overview';panel.className='member-panel member-overview';home.prepend(panel);}panel.replaceChildren();
  const rows=history(),quizMain=(quizRows||[]).filter(row=>!isFactKey(row.quiz_key)),badges=quizBadges(quizRows),earned=badges.filter(badge=>badge.earned).length,name=($('profile-display')?.value||user?.user_metadata?.display_name||'').trim();
  const top=htmlEl('div','overview-top');setupAvatar(top,profileUrl);const copy=htmlEl('div');copy.append(htmlEl('span','eyebrow','Dein Überblick'),htmlEl('h2',null,name&&name!=='Mitglied'?'Hallo, '+name+'.':'Willkommen zurück.'),htmlEl('p',null,'Quizfortschritt und Rechner-Ergebnisse auf einen Blick.'));const meta=htmlEl('div','overview-meta');if(user?.created_at)meta.append(htmlEl('span','overview-chip','Mitglied seit '+new Date(user.created_at).toLocaleDateString('de-DE',{month:'long',year:'numeric'})));meta.append(htmlEl('span','overview-chip',earned+' von '+badges.length+' Abzeichen'),htmlEl('span','overview-chip',String(quizMain.length)+' Quiz-Bestwerte'));copy.append(meta);top.append(copy);panel.append(top);
  const body=htmlEl('div','overview-body');panel.append(body);
  const section=(title,note)=>{const wrap=htmlEl('div','overview-section'),head=htmlEl('div','section-head');head.append(htmlEl('h3',null,title));if(note)head.append(note instanceof Node?note:htmlEl('p',null,note));wrap.append(head);body.append(wrap);return wrap;};
  const trends=section('Deine Verläufe','Fahre über ein Diagramm für Details zu jedem Messpunkt.'),trendGrid=htmlEl('div','overview-grid');trends.append(trendGrid);
  const health=rows.filter(row=>row.kind==='health'),healthValue=row=>row.total??row.score,lastHealth=health.at(-1),healthMax=health.some(row=>row.total!=null)?130:100,healthSeries=health.map(healthValue).map(Number).filter(Number.isFinite);
  trendGrid.append(card('health','Gesundheits-Check',{value:lastHealth?String(healthValue(lastHealth)):'',unit:'Punkte',empty:'Noch kein gespeicherter Check'},lastHealth?'Letzter Check: '+longDate(lastHealth)+(lastHealth.total!=null?' · Gewohnheiten '+lastHealth.score+' / 100':''):'Führe deinen ersten Check durch.','gesundheits-check.html',{gauge:lastHealth?gauge(Number(healthValue(lastHealth)),lastHealth.total!=null?130:100):null,delta:delta(healthSeries,'up',0,' P.'),chart:chart(health,healthMax,'Verlauf des Gesundheits-Checks',healthValue,value=>value+' P.')}));
  const vo2Rows=rows.filter(row=>row.kind==='vo2'),vo2=vo2Rows.at(-1);
  trendGrid.append(card('vo2','VO₂max',{value:vo2?deNumber(vo2.value,1):'',unit:'ml/kg/min',empty:'Noch kein Wert'},vo2?(vo2.ranking||vo2.method||'Letzte Feldtest-Schätzung'):'Mit Cooper- oder Rockport-Test schätzen.','vo2max-rechner.html',{delta:delta(vo2Rows.map(row=>Number(row.value)),'up',1),chart:chart(vo2Rows,90,'Verlauf des VO₂max-Werts',row=>row.value,value=>deNumber(value,1)+' ml')}));
  const waistRows=rows.filter(row=>row.kind==='waist'&&Number.isFinite(Number(row.bmi))),waist=waistRows.at(-1);
  trendGrid.append(card('waist','Taille & BMI',{value:waist?deNumber(waist.bmi,1):'',unit:'BMI',empty:'Noch keine Maße'},waist?('Taille/Größe: '+deNumber(waist.ratio,2)+(waist.category?' · '+waist.category:'')):'Deine grobe Orientierung.','taille-rechner.html',{delta:delta(waistRows.map(row=>Number(row.bmi)),null,1),chart:chart(waistRows,45,'Verlauf des BMI',row=>row.bmi,value=>'BMI '+deNumber(value,1),{tickFormat:value=>deNumber(value,Number.isInteger(value)?0:1)})}));
  const more=section('Weitere Ergebnisse'),moreGrid=htmlEl('div','overview-grid');more.append(moreGrid);
  const medals={gold:'🥇 Gold',silver:'🥈 Silber',bronze:'🥉 Bronze'},awardText=Object.entries(awards||{}).filter(([,count])=>count).map(([medal,count])=>(medals[medal]||medal)+' × '+count).join(' · ')||'Noch keine Liga-Auszeichnung',quizCount=quizMain.length;
  moreGrid.append(card('quiz','Quizwelt',{value:quizCount?String(quizCount):'',unit:'Quiz-Bestwerte',empty:'Noch keine Bestwerte'},awardText,'quiz.html',{body:[progress(Math.min(quizCount,21),21,'Quizze abgeschlossen',Math.min(quizCount,21)+' / 21')]}));
  const heart=latest(rows,'heart');
  moreGrid.append(card('heart','Herzfrequenzzonen',{value:heart?String(heart.maximum):'',unit:'Schläge/min max.',empty:'Noch keine Zonen'},heart?(heart.method||'Letztes Ergebnis'):'Berechne deine vier Trainingsbereiche.','herzfrequenz-rechner.html#heart-results',{body:[heart?chips((heart.zones||[]).map((zone,i)=>zone?'Z'+(i+1)+' · '+zone:'')):null]}));
  const supplements=latest(rows,'supplements');
  moreGrid.append(card('supplements','Supplement-Auswahl',{value:supplements?deNumber(supplements.total,2):'',unit:'€ / Monat',empty:'Noch keine Auswahl'},supplements?'Letzte Beispielauswahl':'Plane eine Beispielauswahl nach Budget.','supplement-rechner.html',{body:[supplements?chips(supplements.products||[]):null]}));
  const badgeProgress=htmlEl('div','badge-progress'),track=htmlEl('div','oc-progress-track'),fill=htmlEl('div','oc-progress-fill');fill.style.width=Math.round(earned/badges.length*100)+'%';track.append(fill);badgeProgress.append(track,htmlEl('span',null,earned+' / '+badges.length+' freigeschaltet'));
  const badgeSection=section('Deine Quizwelt-Auszeichnungen',badgeProgress),badgeList=htmlEl('div','profile-badges');
  badges.forEach(badge=>{const item=htmlEl('article','profile-badge'+(badge.earned?' earned':''));const text=htmlEl('div');text.append(htmlEl('strong',null,badge.name),htmlEl('small',null,badge.earned?'Freigeschaltet · '+badge.detail:badge.detail));item.append(htmlEl('span',null,badge.icon),text);badgeList.append(item);});badgeSection.append(badgeList);
  body.append(htmlEl('p','small overview-note','Rechner-Ergebnisse, Profilbild und einige Quiz-Abzeichen bleiben nur auf diesem Gerät gespeichert und werden nicht an Veganiel übertragen.'));}
  async function render() {
    const version = ++renderVersion;
    const { data, error } = await sb.auth.getUser();
    if (version !== renderVersion) return;
    user = data?.user || null;
    $("member-auth").hidden = !!user || recovery;
    $("member-home").hidden = !user || recovery;
    $("recovery-panel").hidden = !recovery;
    document.body.classList.remove("member-pending");
    if (!user || recovery) {
      $("profile-form").reset();
      $("account-email").textContent = "";
      return;
    }
    $("account-email").textContent = user.email;
    const [profile, details, quiz, league, awards] = await Promise.all([
      sb
        .from("profiles")
        .select("display_name,avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      sb
        .from("member_details")
        .select("full_name,address_line,postal_code,city,country")
        .eq("user_id", user.id)
        .maybeSingle(),
      sb
        .from("quiz_results")
        .select("quiz_key,best,attempts")
        .eq("user_id", user.id),
      sb
        .from("quiz_leaderboard_preferences")
        .select("participates")
        .eq("user_id", user.id)
        .maybeSingle(),
      sb.rpc("get_quiz_leaderboard", { history_weeks: 1 }),
    ]);
    if (version !== renderVersion) return;
    const remoteProblem = [profile, details, quiz, league, awards].some(
      (result) => result.error,
    );
    $("profile-form").querySelector("button").disabled = !!(
      profile.error ||
      details.error ||
      league.error
    );
    $("profile-display").value =
      profile.data?.display_name ||
      user.user_metadata?.display_name ||
      "Mitglied";
    for (const [id, key] of Object.entries({
      "full-name": "full_name",
      address: "address_line",
      postal: "postal_code",
      city: "city",
      country: "country",
    }))
      $(id).value = details.data?.[key] || "";
    setupProfileLayout();
    leagueProfileChoice(
      league.data?.participates || user.user_metadata?.leaderboard_opt_in,
    );
    $("account-quiz-summary").replaceChildren(
      document.createTextNode(
        String(
          (quiz.data || []).filter((row) => !isFactKey(row.quiz_key)).length,
        ) + " ",
      ),
    );
    const summary = document.createElement("span");
    summary.textContent = "gespeicherte Quiz-Bestwerte.";
    $("account-quiz-summary").append(summary);
    renderOverview(
      quiz.data || [],
      awards.data?.viewer_medals || {},
      profile.data?.avatar_url,
    );
    updateContact();
    if (remoteProblem)
      status(
        "Einige Kontodaten sind gerade nicht erreichbar. Deine auf diesem Gerät gespeicherten Rechner-Ergebnisse werden weiterhin angezeigt.",
      );
  }
  function updateContact() {
    if (!user) return;
    const text =
      "Hallo Daniel,\n\nich interessiere mich für eine Ernährungsberatung.\n\nName: " +
      $("full-name").value +
      "\nKonto-E-Mail: " +
      user.email +
      "\nKontokennung: " +
      user.id +
      "\n\nMein Anliegen (ohne medizinische Unterlagen):\n";
    $("consultation-email").href =
      "mailto:info@veganiel.com?subject=" +
      encodeURIComponent("Beratungsanfrage aus meinem Veganiel-Konto") +
      "&body=" +
      encodeURIComponent(text);
  }
  $("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const { error } = await sb.auth.signInWithPassword({
        email: $("email").value.trim(),
        password: $("password").value,
      });
      if (error) {
        status(
          "Anmeldung nicht möglich. Bitte prüfe E-Mail-Adresse und Passwort sowie die E-Mail-Bestätigung.",
        );
        return;
      }
      $("password").value = "";
      location.assign("index.html");
    });
  });
  $("register").addEventListener("click", () => {
    $("register-name-field").hidden = false;
    $("register-fields").hidden = false;
    registrationChoices();
    $("password").autocomplete = "new-password";
    $("display-name").focus();
  });
  $("confirm-register").addEventListener("click", (e) =>
    run(e.currentTarget, async () => {
      if (!$("login-form").reportValidity()) return;
      if (!$("terms-consent").checked) {
        status("Bitte akzeptiere die AGB, um ein Konto zu erstellen.");
        return;
      }
      if ($("password").value.length < 12) {
        status("Bitte wähle ein Passwort mit mindestens zwölf Zeichen.");
        return;
      }
      const display = $("display-name").value.trim();
      if (!display) {
        status("Bitte wähle einen öffentlichen Anzeigenamen.");
        return;
      }
      const { error } = await sb.auth.signUp({
        email: $("email").value.trim(),
        password: $("password").value,
        options: {
          emailRedirectTo: location.origin + "/konto.html",
          data: {
            display_name: display,
            leaderboard_opt_in: $("league-consent").checked,
            terms_accepted_at: new Date().toISOString(),
            terms_version: "2026-11-09",
          },
        },
      });
      if (error) {
        status(registrationError(error));
        return;
      }
      $("password").value = "";
      status(
        "Bitte prüfe dein E-Mail-Postfach und bestätige deine Adresse. Falls bereits ein Konto besteht, nutze die Anmeldung oder „Passwort vergessen“.",
      );
    }),
  );
  $("forgot").addEventListener("click", (e) =>
    run(e.currentTarget, async () => {
      if (!$("email").reportValidity()) return;
      const { error } = await sb.auth.resetPasswordForEmail(
        $("email").value.trim(),
        { redirectTo: location.origin + "/konto.html?recovery=1" },
      );
      if (error) throw error;
      status(
        "Falls ein Konto mit dieser Adresse existiert, erhältst du einen Link zum Zurücksetzen.",
      );
    }),
  );
  $("recovery-form").addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      const { error } = await sb.auth.updateUser({
        password: $("new-password").value,
      });
      if (error) throw error;
      $("new-password").value = "";
      recovery = false;
      history.replaceState(null, "", "/konto.html");
      status("Dein Passwort wurde geändert.");
      await render();
    });
  });
  $("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    run(e.submitter, async () => {
      if (!user) throw Error();
      const id = user.id;
      const { error } = await sb
        .from("member_details")
        .upsert({
          user_id: id,
          full_name: $("full-name").value.trim(),
          address_line: $("address").value.trim(),
          postal_code: $("postal").value.trim(),
          city: $("city").value.trim(),
          country: $("country").value.trim(),
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      const result = await sb
        .from("profiles")
        .upsert({
          id,
          display_name: $("profile-display").value.trim() || "Mitglied",
          updated_at: new Date().toISOString(),
        });
      if (result.error) {
        status(
          "Private Angaben gespeichert. Der Anzeigename konnte gerade nicht aktualisiert werden.",
        );
        return;
      }
      const league = await sb.rpc("set_quiz_leaderboard_participation", {
        enabled: $("profile-league").checked,
      });
      if (league.error) {
        status(
          "Dein Profil wurde gespeichert. Die Liga-Einstellung konnte gerade nicht aktualisiert werden.",
        );
        return;
      }
      await sb.auth.updateUser({
        data: { leaderboard_opt_in: $("profile-league").checked },
      });
      updateContact();
      status("Dein Profil wurde gespeichert.");
    });
  });
  $("logout").addEventListener("click", (e) =>
    run(e.currentTarget, async () => {
      const { error } = await sb.auth.signOut();
      if (error) throw error;
      $("profile-form").reset();
      status("Du bist abgemeldet.");
      await render();
    }),
  );
  if (new URLSearchParams(location.hash.slice(1)).has("error"))
    status(
      "Der Bestätigungslink ist abgelaufen oder ungültig. Bitte fordere einen neuen Link an.",
    );
  window.addEventListener("veganiel:wellbeing-history", () => {
    if (user && !$("member-home").hidden) render();
  });
  window.addEventListener("storage", (event) => {
    if (
      event.key === "veganiel.wellbeing-history.v1" &&
      user &&
      !$("member-home").hidden
    )
      render();
  });
  sb.auth.onAuthStateChange((event) => {
    if (event === "TOKEN_REFRESHED") return;
    if (event === "PASSWORD_RECOVERY") recovery = true;
    if (event === "SIGNED_OUT") recovery = false;
    setTimeout(() => render(), 0);
  });
  render();
})();
(() => {
  const core = () =>
    window.VeganielCalculators?.supplements
      ? Promise.resolve(window.VeganielCalculators.supplements)
      : new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "scripts/supplement-core.js";
          script.onload = () =>
            resolve(window.VeganielCalculators?.supplements);
          script.onerror = () => resolve(null);
          document.head.append(script);
        });
  const completeSelection = async (entry) => {
    if (!Number.isFinite(Number(entry?.total))) return entry?.products || [];
    const select = await core();
    if (!select) return entry.products || [];
    const total = Math.round(Number(entry.total) * 100);
    for (const winter of [true, false])
      for (const eggs of [false, true])
        for (let budget = 5; budget <= 300; budget++) {
          const chosen = select(budget, { winter, eggs }).chosen;
          if (
            Math.round(
              chosen.reduce((sum, item) => sum + item.monthly, 0) * 100,
            ) === total
          )
            return chosen.map((item) => item.name);
        }
    return entry.products || [];
  };
  const updateSupplementDetail = async () => {
    let rows = [],
      direct = null;
    try {
      rows = JSON.parse(
        localStorage.getItem("veganiel.wellbeing-history.v1") || "[]",
      );
      direct = JSON.parse(
        localStorage.getItem("veganiel.supplement-calculator.v1") || "null",
      );
    } catch {}
    const latest =
      direct?.touched && direct.products?.length
        ? direct
        : [...(Array.isArray(rows) ? rows : [])]
            .reverse()
            .find((row) => row?.kind === "supplements");
    const card = document.querySelector('.overview-card[data-kind="supplements"]');
    const products = await completeSelection(latest),
      detail = products.join(" · ");
    if (!card || !detail || card.dataset.supplementDetail === detail) return;
    card.dataset.supplementDetail = detail;
    let list = card.querySelector(".oc-chips");
    if (!list) {
      list = document.createElement("div");
      list.className = "oc-chips";
      const foot = card.querySelector(".oc-foot");
      if (foot) foot.before(list);
      else card.append(list);
    }
    list.replaceChildren(
      ...products.map((name) => {
        const chip = document.createElement("span");
        chip.className = "oc-chip";
        chip.textContent = name;
        return chip;
      }),
    );
  };
  new MutationObserver(updateSupplementDetail).observe(document.body, {
    childList: true,
    subtree: true,
  });
  updateSupplementDetail();
})();
