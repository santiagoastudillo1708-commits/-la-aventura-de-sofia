(() => {
  const KEY = "aventuraSofia.v1";
  const defaultState = {stars:0, flowers:0, butterflies:0, practices:0, logs:[], sound:true, reminder:"90", reminderEnabled:false, lastActivity:null, gardenWaterings:0, outfit:"rosa"};
  let state = loadState();
  let gateNumber = [3,2];
  let audioContext = null;
  let reminderTimer = null;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  function loadState(){
    try { return {...defaultState, ...JSON.parse(localStorage.getItem(KEY) || "{}")}; }
    catch { return {...defaultState}; }
  }
  function saveState(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    updateGarden(); updateAdultStats(); renderLogs();
  }
  function today(){ return new Date().toLocaleDateString("es-MX",{year:"numeric",month:"short",day:"numeric"}); }
  function toast(message){
    const el=$("#toast"); el.textContent=message; el.classList.remove("hidden");
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.add("hidden"),2600);
  }
  function sound(type="tap"){
    if(!state.sound) return;
    try {
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx) return;
      audioContext ||= new Ctx();
      if(audioContext.state==="suspended") audioContext.resume();
      const osc=audioContext.createOscillator(), gain=audioContext.createGain();
      const now=audioContext.currentTime;
      osc.type="sine";
      const freqs=type==="success"?[523,659,784]:type==="gentle"?[392,440]:[440];
      osc.frequency.setValueAtTime(freqs[0],now);
      if(freqs.length>1) osc.frequency.setValueAtTime(freqs[1],now+.12);
      if(freqs.length>2) osc.frequency.setValueAtTime(freqs[2],now+.24);
      gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.07,now+.025); gain.gain.exponentialRampToValueAtTime(.0001,now+.42);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now+.45);
    } catch {}
  }
  const voiceSelect = $("#lunaVoice");
  const VOICE_KEY = "aventuraSofia.lunaVoice";
  let availableSpanishVoices = [];
  function refreshVoiceList(){
    if(!("speechSynthesis" in window) || !voiceSelect) return;
    const all = speechSynthesis.getVoices();
    availableSpanishVoices = all.filter(v => /^es([-_]|$)/i.test(v.lang));
    const preferred = availableSpanishVoices.filter(v => /mex|es-mx/i.test(v.lang));
    const candidates = preferred.length ? preferred : availableSpanishVoices;
    const saved = localStorage.getItem(VOICE_KEY) || "";
    voiceSelect.innerHTML = "";
    if(!candidates.length){
      const opt=document.createElement("option"); opt.value=""; opt.textContent="Voz predeterminada del teléfono"; voiceSelect.appendChild(opt); return;
    }
    candidates.forEach(v=>{
      const opt=document.createElement("option");
      opt.value=v.voiceURI;
      opt.textContent=`${v.name} · ${v.lang}${v.default ? " · predeterminada" : ""}`;
      voiceSelect.appendChild(opt);
    });
    if(candidates.some(v=>v.voiceURI===saved)) voiceSelect.value=saved;
    else {
      const soft = candidates.find(v=>/female|mujer|femen|paulina|monica|sabina|helena|lucia|female/i.test(v.name));
      const mx = candidates.find(v=>/^es-MX/i.test(v.lang));
      voiceSelect.value=(soft||mx||candidates[0]).voiceURI;
    }
  }
  function spanishVoice(){
    if(!("speechSynthesis" in window)) return null;
    const voices=speechSynthesis.getVoices();
    const chosen=voiceSelect?.value;
    return voices.find(v=>v.voiceURI===chosen) || voices.find(v=>/^es-MX/i.test(v.lang)) || voices.find(v=>/^es[-_]/i.test(v.lang)) || null;
  }
  function speak(text, options={}){
    if(!state.sound){toast("Activa el sonido para escuchar a Luna. 🔊");return;}
    if(!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)){toast(text);return;}
    try {
      speechSynthesis.cancel();
      const utterance=new SpeechSynthesisUtterance(text);
      utterance.lang="es-MX";
      utterance.rate=options.rate ?? 0.78;
      utterance.pitch=options.pitch ?? 1.38;
      utterance.volume=0.88;
      const voice=spanishVoice(); if(voice){utterance.voice=voice;utterance.lang=voice.lang||"es-MX";}
      const scene=$(".unicorn-scene"), character=$("#lunaCharacter"), bubble=$("#lunaSpeech");
      if(bubble){bubble.textContent=text; bubble.classList.remove("hidden");}
      if(scene) scene.classList.add("luna-speaking");
      if(character) character.classList.add("luna-speaking");
      const stopAnimation=()=>{if(scene)scene.classList.remove("luna-speaking");if(character)character.classList.remove("luna-speaking");};
      utterance.onend=stopAnimation; utterance.onerror=stopAnimation;
      speechSynthesis.speak(utterance);
    } catch { toast(text); }
  }
  refreshVoiceList();
  if("speechSynthesis" in window) speechSynthesis.onvoiceschanged=refreshVoiceList;
  voiceSelect?.addEventListener("change",()=>{try{localStorage.setItem(VOICE_KEY,voiceSelect.value);}catch{};});
  $("#testLunaVoice")?.addEventListener("click",()=>speak("¡Holaaa, Sofi! Soy Luna, tu unicornio mágico. ¡Me encanta jugar contigo! Vamos a descubrir la magia de nuestro reino, pasito a pasito."));
  $("#lunaTalk").addEventListener("click",()=>speak("¡Holaaa, Sofía! Soy Luna, tu unicornio mágico. Estoy muy feliz de jugar contigo. Recuerda que puedes avisar: quiero ir al baño. Y si necesitas ayuda, puedes pedirla. ¡Cada intento cuenta!"));
  $$ ("[data-luna]").forEach(btn=>btn.addEventListener("click",()=>speak(btn.dataset.luna)));
  function showView(name){
    $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
    $$(".nav-item").forEach(b=>b.classList.toggle("selected",b.dataset.view===name));
    if(name==="garden") updateGarden();
    if(name==="adult"){ $("#adultContent").classList.add("hidden"); $("#adultGate").classList.remove("hidden"); $("#gateAnswer").value=""; gateNumber=[Math.floor(Math.random()*4)+2,Math.floor(Math.random()*4)+1]; $("#gateQuestion").textContent=`¿Cuánto es ${gateNumber[0]} + ${gateNumber[1]}?`; }
    window.scrollTo({top:0,behavior:"smooth"});
    sound("tap");
  }
  $$("[data-view]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
  $("#soundToggle").addEventListener("click",()=>{
    state.sound=!state.sound; $("#soundToggle").innerHTML=state.sound?"🔊 <span>Sonido</span>":"🔇 <span>Silencio</span>"; $("#soundToggle").setAttribute("aria-pressed",String(state.sound)); saveState(); if(state.sound)sound("gentle");
  });
  function reward(kind,message){
    state.stars+=1; state[kind]=(state[kind]||0)+1; state.practices+=1; state.lastActivity=new Date().toISOString(); saveState(); sound("success"); toast(message);
    if(state.sound) speak("¡Muy bien por practicar! Cada intento cuenta.");
  }
  $$("[data-feedback]").forEach(btn=>btn.addEventListener("click",()=>{
    const el=$("#signalFeedback");
    el.textContent=btn.dataset.feedback==="curious"?"Podemos parar un momento y escuchar. Si tienes ganas, puedes avisar a mamá, papá o a quien te cuide. 💗":btn.dataset.feedback==="unsure"?"No pasa nada si no estás segura. Puedes preguntar a una persona grande y descubrirlo juntas. 🌈":"¡Claro! Pedir ayuda es una gran idea. Puedes decir «quiero ir al baño» o usar la señal que practicaste con tu familia. 💜";
    el.classList.remove("hidden"); sound("gentle"); speak(el.textContent);
  }));
  $("#signalComplete").addEventListener("click",()=>{reward("flowers","¡Una flor para tu jardín! 🌷");});
  $$(".phrase-button").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".phrase-button").forEach(b=>b.classList.remove("chosen")); btn.classList.add("chosen");
    const el=$("#practiceFeedback");
    if(btn.dataset.correct==="true"){
      el.textContent="¡Sí! Puedes decir «Quiero ir al baño» o «¿Me ayudas, por favor?». Practicar ya es un gran paso. 🌟";
      sound("success"); speak("Quiero ir al baño. ¿Me ayudas, por favor?");
    }else{
      el.textContent="A veces estamos jugando y cuesta parar. Podemos practicar avisar a un adulto cuando sentimos ganas. ¡Vamos poco a poco! 💛";
      sound("gentle"); speak("Vamos poco a poco. Puedes avisar a un adulto.");
    }
    el.classList.remove("hidden");
  }));
  $("#practiceComplete").addEventListener("click",()=>reward("butterflies","¡Una mariposa llegó al jardín! 🦋"));
  $("#routineComplete").addEventListener("click",()=>{reward("flowers","¡Gracias por practicar la rutina! 🌼");});
  $$("#view-routine input[type=checkbox]").forEach(box=>box.addEventListener("change",()=>{if(box.checked)sound("gentle");}));
  const lyrics="Si mi cuerpo me habla, yo lo voy a escuchar. Le aviso a alguien grande: ¡quiero ir al baño ya!";
  $("#singButton").addEventListener("click",()=>{
    sound("success");
    if("speechSynthesis" in window && state.sound){
      speechSynthesis.cancel();
      const lines=["Si mi cuerpo me habla,","yo lo voy a escuchar.","Le aviso a alguien grande:","¡quiero ir al baño ya!"];
      let i=0;
      const next=()=>{if(i>=lines.length)return;const u=new SpeechSynthesisUtterance(lines[i++]);u.lang="es-MX";u.rate=.76;u.pitch=1.36;const v=spanishVoice();if(v){u.voice=v;u.lang=v.lang||"es-MX";}u.onend=()=>setTimeout(next,250);speechSynthesis.speak(u);};next();
    }else toast(lyrics);
  });
  // Jardín mágico: interacción sencilla, repetible y sin castigos.
  $("#waterGarden")?.addEventListener("click",()=>{
    state.gardenWaterings=(state.gardenWaterings||0)+1;
    state.flowers=(state.flowers||0)+1;
    state.stars=(state.stars||0)+1;
    state.lastActivity=new Date().toISOString();
    const messages=["¡Mira cómo crece! 🌷","¡Una flor feliz gracias a ti! 🌼","¡La magia está en cuidar! 🌸","¡Llegó una mariposa al jardín! 🦋"];
    $("#gardenMessage").textContent=messages[(state.gardenWaterings-1)%messages.length];
    saveState();sound("success");speak("¡Qué bonito! Gracias por cuidar el jardín.");
  });

  // Misión del baño: pasos ilustrados. No requiere resultado fisiológico.
  const bathSteps=[
    {emoji:"💭",title:"1. Escucho mi cuerpo",text:"Si siento ganas, puedo parar y escuchar."},
    {emoji:"🙋‍♀️",title:"2. Puedo avisar",text:"Puedo decir: «Quiero ir al baño»."},
    {emoji:"🤝",title:"3. Pido compañía",text:"Una persona grande puede acompañarme."},
    {emoji:"🚽",title:"4. Lo intento con calma",text:"Puedo sentarme si quiero. No pasa nada si no sale pipí."},
    {emoji:"🧼",title:"5. Me lavo las manos",text:"Con ayuda, uso agua y jabón. ¡Listo!"}
  ];
  let bathIndex=0;
  function renderBath(){
    const step=bathSteps[bathIndex];
    $("#bathEmoji").textContent=step.emoji;$("#bathTitle").textContent=step.title;$("#bathText").textContent=step.text;
    $("#bathProgress").textContent=bathSteps.map((_,i)=>i<bathIndex?"⭐":i===bathIndex?"🌟":"○").join(" ");
    $("#bathProgress").setAttribute("aria-label",`Paso ${bathIndex+1} de ${bathSteps.length}`);
    $("#bathNext").textContent=bathIndex===bathSteps.length-1?"¡Terminar aventura! 🌷":"Siguiente pasito →";
    $("#bathAgain").classList.add("hidden");
  }
  $("#bathNext")?.addEventListener("click",()=>{
    if(bathIndex<bathSteps.length-1){bathIndex++;renderBath();sound("gentle");speak(bathSteps[bathIndex].text);}
    else {reward("flowers","¡Aventura practicada! Una flor para tu jardín. 🌷");$("#bathTitle").textContent="¡Lo hicimos a tu ritmo!";$("#bathEmoji").textContent="🌈💗";$("#bathText").textContent="Puedes volver a practicar cuando quieras. No hace falta hacer pipí para celebrar.";$("#bathProgress").textContent="⭐ ⭐ ⭐ ⭐ ⭐";$("#bathNext").classList.add("hidden");$("#bathAgain").classList.remove("hidden");}
  });
  $("#bathHelp")?.addEventListener("click",()=>speak("¡Claro que sí! Puedes decir: ¿me ayudas, por favor? Una persona grande puede acompañarte."));
  $("#bathAgain")?.addEventListener("click",()=>{bathIndex=0;$("#bathNext").classList.remove("hidden");renderBath();});

  // Juego de parejas de 3 años: solo 3 pares y sin cronómetro.
  const pairFaces=["🦄","🌷","⭐"];
  let pairDeck=[], pairOpen=[], pairMatched=new Set(), pairLock=false;
  function resetPairs(){
    pairDeck=[...pairFaces,...pairFaces].map((face,i)=>({face,id:i})).sort(()=>Math.random()-.5);
    pairOpen=[];pairMatched=new Set();pairLock=false;renderPairs();
    $("#pairsFeedback").classList.add("hidden");
  }
  function renderPairs(){
    $("#pairsBoard").innerHTML=pairDeck.map((card,i)=>{
      const open=pairOpen.includes(i)||pairMatched.has(card.face);
      return `<button class="pair-card ${open?"revealed":""} ${pairMatched.has(card.face)?"matched":""}" data-pair-index="${i}" aria-label="${open?card.face:"Tarjeta tapada"}">${open?card.face:"❔"}</button>`;
    }).join("");
  }
  $("#pairsBoard")?.addEventListener("click",e=>{
    const btn=e.target.closest("[data-pair-index]");if(!btn||pairLock)return;
    const i=Number(btn.dataset.pairIndex),face=pairDeck[i].face;
    if(pairOpen.includes(i)||pairMatched.has(face))return;
    pairOpen.push(i);renderPairs();sound("tap");
    if(pairOpen.length===2){
      const [a,b]=pairOpen;
      if(pairDeck[a].face===pairDeck[b].face){
        pairMatched.add(face);pairOpen=[];renderPairs();sound("success");
        $("#pairsFeedback").textContent="¡Encontraste una pareja! ✨";$("#pairsFeedback").classList.remove("hidden");
        if(pairMatched.size===pairFaces.length){$("#pairsFeedback").textContent="¡Encontraste todas las parejas! ¡Buen trabajo jugando! 🌟";}
      }else{
        pairLock=true;setTimeout(()=>{pairOpen=[];pairLock=false;renderPairs();},850);
      }
    }
  });
  $("#pairsReset")?.addEventListener("click",resetPairs);
  $("#pairsDone")?.addEventListener("click",()=>reward("butterflies","¡Gracias por jugar! Una mariposa para ti. 🦋"));
  resetPairs();

  // Vestidor: cambiar los colores y guardar la elección localmente.
  const outfitNames={rosa:"Princesa rosa",lila:"Hada lila",dorado:"Estrella dorada",arcoiris:"Arcoíris mágico"};
  function setOutfit(name){
    state.outfit=name;$("#outfitLabel").textContent=outfitNames[name]||outfitNames.rosa;
    const doll=$("#avatarDoll");doll.dataset.outfit=name;
    $$(".outfit-choice").forEach(b=>b.classList.toggle("selected",b.dataset.outfit===name));
    $("#outfitFeedback").textContent=`¡${outfitNames[name]}! Puedes cambiar tu conjunto cuando quieras. 💖`;
    try{localStorage.setItem("aventuraSofia.outfit",name);}catch{}
  }
  $$(".outfit-choice").forEach(b=>b.addEventListener("click",()=>{setOutfit(b.dataset.outfit);sound("success");speak(`¡Qué bonito! ${outfitNames[b.dataset.outfit]}.`);}));
  setOutfit(state.outfit||"rosa");

  function updateGarden(){
    $("#starCount").textContent=state.stars; $("#flowerCount").textContent=state.flowers; $("#butterflyCount").textContent=state.butterflies;
    const plot=$("#gardenPlot"); const bits=["🌷","🌼","🌸","🦋","✨","🌈","🐰","⭐","🌺"];
    const count=Math.min(25,Math.max(5,state.stars+5));
    plot.innerHTML=Array.from({length:count},(_,i)=>`<span aria-hidden="true">${i<state.stars?bits[i%bits.length]:"🌱"}</span>`).join("");
  }
  function updateAdultStats(){
    $("#adultStars").textContent=state.stars; $("#practiceCount").textContent=state.practices;
    $("#activeDays").textContent=new Set((state.logs||[]).map(x=>x.day).concat(state.lastActivity?[new Date(state.lastActivity).toLocaleDateString("es-MX")]:[])).size;
  }
  const eventNames={aviso:"Avisó por sí misma",practica:"Practicó cómo avisar",rutina:"Hizo parte de la rutina",ayuda:"Pidió ayuda",accidente:"Hubo un accidente (sin penalización)",observacion:"Otra observación positiva o neutral"};
  function renderLogs(){
    const list=$("#logList"); if(!list)return;
    if(!state.logs?.length){list.innerHTML='<p class="small-muted">Todavía no hay registros.</p>';return;}
    list.innerHTML=state.logs.slice(0,12).map(x=>`<div class="log-entry"><b>${escapeHtml(eventNames[x.event]||x.event)}</b><small>${escapeHtml(x.day)} · ${escapeHtml(x.time)}</small>${x.note?`<p>${escapeHtml(x.note)}</p>`:""}</div>`).join("");
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  $("#unlockAdult").addEventListener("click",()=>{
    if(Number($("#gateAnswer").value)===gateNumber[0]+gateNumber[1]){$("#adultGate").classList.add("hidden");$("#adultContent").classList.remove("hidden");updateAdultStats();renderLogs();sound("gentle");}
    else {toast("Inténtalo otra vez con ayuda de una persona adulta.");$("#gateAnswer").value="";$("#gateAnswer").focus();}
  });
  $("#gateAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")$("#unlockAdult").click();});
  $("#lockAdult").addEventListener("click",()=>{showView("home");});
  $("#saveLog").addEventListener("click",()=>{
    const event=$("#adultEvent").value,note=$("#adultNote").value.trim(),now=new Date();
    state.logs.unshift({event,note,day:now.toLocaleDateString("es-MX"),time:now.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),createdAt:now.toISOString()});
    state.logs=state.logs.slice(0,100); $("#adultNote").value="";saveState();toast("Registro guardado en este dispositivo. 💗");
  });
  $("#reminderInterval").value=state.reminder;
  $("#reminderEnabled").checked=state.reminderEnabled;
  function configureReminder(){
    clearInterval(reminderTimer);state.reminder=$("#reminderInterval").value;state.reminderEnabled=$("#reminderEnabled").checked;saveState();
    if(state.reminderEnabled && state.reminder!=="off"){
      reminderTimer=setInterval(()=>{if(!document.hidden && !$("#view-adult").classList.contains("active"))toast("Pausa amable: si te parece, puedes ofrecerle a Sofía ir al baño. Sin presión. 🌷");},Number(state.reminder)*60*1000);
      toast("Recordatorio suave activado mientras la app esté abierta.");
    }else toast("Recordatorios desactivados.");
  }
  $("#reminderInterval").addEventListener("change",configureReminder);
  $("#reminderEnabled").addEventListener("change",configureReminder);
  $("#exportData").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="aventura-sofia-datos.json";a.click();URL.revokeObjectURL(url);toast("Exportación preparada.");
  });
  $("#clearData").addEventListener("click",()=>{
    if(confirm("¿Seguro que quieres borrar las estrellas, preferencias y registros guardados en este navegador? Esta acción no se puede deshacer.")){
      localStorage.removeItem(KEY);state={...defaultState};$("#reminderEnabled").checked=false;$("#reminderInterval").value="90";configureReminder();saveState();renderLogs();toast("Datos locales borrados.");
    }
  });
  if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
  $("#soundToggle").innerHTML=state.sound?"🔊 <span>Sonido</span>":"🔇 <span>Silencio</span>";$("#soundToggle").setAttribute("aria-pressed",String(state.sound));
  updateGarden();updateAdultStats();renderLogs();
})();