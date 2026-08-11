(() => {
  "use strict";

  const TARGET = new Date("2026-08-20T00:00:00+05:30").getTime();
  const STORAGE = "adamyaBirthdayJourney_v1";
  const audio = document.getElementById("birthdayAudio");
  const stage = document.getElementById("stage");
  const prompt = document.getElementById("musicPrompt");
  const musicControl = document.getElementById("musicControl");
  const musicToggle = document.getElementById("musicToggle");
  const musicStatus = document.getElementById("musicStatus");
  const fx = document.getElementById("fxLayer");
  const toast = document.getElementById("toast");
  // Dynamic kiss cursor effect: every time the pointer moves, new kisses
  // spawn around the pointer, scatter outward, drift, rotate, and fade away.
  function initCursorKisses(){
    let layer=document.getElementById("cursorKissLayer");
    if(!layer){
      layer=document.createElement("div");
      layer.id="cursorKissLayer";
      layer.className="cursor-kiss-layer";
      document.body.appendChild(layer);
    }
    if(layer.dataset.ready==="1") return;
    layer.dataset.ready="1";

    let lastX=innerWidth/2, lastY=innerHeight/2;
    let lastSpawn=0;
    let active=0;
    const MAX_ACTIVE=90;

    const spawnKiss=(x,y)=>{
      if(active>=MAX_ACTIVE) return;
      const el=document.createElement("span");
      el.className="cursor-kiss";
      el.textContent="💋";

      // Scatter much farther than the pointer itself.
      const angle=Math.random()*Math.PI*2;
      const distance=28+Math.random()*115;
      const driftX=Math.cos(angle)*distance;
      const driftY=Math.sin(angle)*distance;

      const size=16+Math.random()*18;
      const rotate=-35+Math.random()*70;
      const duration=650+Math.random()*900;
      const startX=x+(Math.random()*18-9);
      const startY=y+(Math.random()*18-9);

      el.style.left="0px";
      el.style.top="0px";
      el.style.fontSize=`${size}px`;
      el.style.opacity="0";
      el.style.transform=`translate3d(${startX}px,${startY}px,0) translate(-50%,-50%) rotate(${rotate}deg) scale(.65)`;
      layer.appendChild(el);
      active++;

      requestAnimationFrame(()=>{
        el.style.transition=`transform ${duration}ms cubic-bezier(.16,.8,.25,1), opacity ${Math.min(260,duration*.25)}ms ease-out`;
        el.style.opacity=(.55+Math.random()*.4).toFixed(2);
        el.style.transform=`translate3d(${startX+driftX}px,${startY+driftY}px,0) translate(-50%,-50%) rotate(${rotate+(-25+Math.random()*50)}deg) scale(${.9+Math.random()*.45})`;
      });

      setTimeout(()=>{
        el.style.transition=`opacity ${Math.min(450,duration*.35)}ms ease`;
        el.style.opacity="0";
        setTimeout(()=>{
          el.remove();
          active--;
        },500);
      },duration);
    };

    const move=e=>{
      const x=e.clientX, y=e.clientY;
      const dx=x-lastX, dy=y-lastY;
      const distance=Math.hypot(dx,dy);
      const now=performance.now();

      // Spawn continuously while moving, with a little burst for faster motion.
      if(distance>2 && now-lastSpawn>28){
        const count=Math.min(4, 1+Math.floor(distance/22));
        for(let i=0;i<count;i++){
          spawnKiss(
            x+(Math.random()*14-7),
            y+(Math.random()*14-7)
          );
        }
        lastSpawn=now;
      }
      lastX=x; lastY=y;
    };

    window.addEventListener("pointermove",move,{passive:true});
    window.addEventListener("pointerdown",e=>{
      // A small burst on click/tap, too.
      for(let i=0;i<7;i++) spawnKiss(e.clientX,e.clientY);
    },{passive:true});
  }

  let countdownTimer = null;
  let state = loadState();
  let currentScreen = state.screen || "countdown";
  let previousScreen = null;
  let countdownWasSkipped = false;

  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if(saved){
        return {
          bouquet: true,
          card: !!saved.card,
          group: !!saved.group,
          letters: !!saved.letters,
          videoQuestion: !!saved.videoQuestion,
          videoUnlocked: !!saved.videoUnlocked,
          riddleUnlocked: !!saved.riddleUnlocked,
          finalComplete: !!saved.finalComplete,
          screen: saved.screen || "countdown"
        };
      }
    }catch(e){}
    return {
      bouquet:true, card:false, group:false, letters:false,
      videoQuestion:false, videoUnlocked:false, riddleUnlocked:false,
      finalComplete:false, screen:"countdown"
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE, JSON.stringify({...state, screen: currentScreen}));
  }

  function unlockedCount() {
    return 1 + ["card","group","letters"].filter(k => state[k]).length;
  }

  function setBodyMode(mode) {
    document.body.className = mode === "night" ? "night" : "";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function render(html, mode="paper") {
    previousScreen = currentScreen;
    stage.innerHTML = html;
    setBodyMode(mode);
    window.scrollTo({top:0, behavior:"instant"});
    saveState();
  }

  function musicStarted() {
    return !audio.paused || audio.currentTime > 0.05;
  }

  async function startMusic() {
    try {
      await audio.play();
      musicControl.classList.remove("hidden");
      musicStatus.textContent = "playing";
      musicToggle.textContent = "🎵 Music";
      prompt.classList.add("hidden");
    } catch {
      showToast("Tap Play again to start the song.");
    }
  }

  document.getElementById("startMusicBtn").addEventListener("click", startMusic);
  document.getElementById("notNowBtn").addEventListener("click", () => {
    prompt.classList.add("hidden");
  });

  musicToggle.addEventListener("click", async () => {
    if (audio.paused) {
      try { await audio.play(); } catch {}
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    musicControl.classList.remove("hidden");
    musicStatus.textContent = "playing";
    musicToggle.textContent = "🎵 Music";
  });
  audio.addEventListener("pause", () => {
    musicStatus.textContent = "paused";
    musicToggle.textContent = "▶ Resume";
  });
  audio.addEventListener("ended", () => {
    musicStatus.textContent = "ended";
    musicToggle.textContent = "▶ Play";
  });

  function burst({confetti=80,balloons=8,kisses=12,sparkles=18,hearts=10}={}) {
    fx.innerHTML = "";
    const frag = document.createDocumentFragment();

    for(let i=0;i<confetti;i++){
      const el = document.createElement("span");
      el.className = "confetti";
      el.style.left = Math.random()*100+"%";
      el.style.top = (-10-Math.random()*20)+"vh";
      el.style.background = ["#6b8fca","#e58db0","#a28ddd","#ffd66e","#6eb7a5","#d65b76"][Math.floor(Math.random()*6)];
      el.style.transform = `rotate(${Math.random()*180}deg)`;
      el.style.animationDelay = (Math.random()*.8)+"s";
      el.style.animationDuration = (1.8+Math.random()*1.8)+"s";
      frag.appendChild(el);
    }
    for(let i=0;i<balloons;i++){
      const el = document.createElement("span");
      el.className = "balloon";
      el.textContent = "";
      el.style.left = Math.random()*100+"%";
      el.style.bottom = "-70px";
      el.style.setProperty("--drift",(Math.random()*180-90)+"px");
      el.style.background = ["linear-gradient(135deg,#b7dcff,#7897d9)","linear-gradient(135deg,#f6c5d9,#d67d9f)","linear-gradient(135deg,#d9ccff,#9d83d4)","linear-gradient(135deg,#ffe8a5,#e5b95b)"][Math.floor(Math.random()*4)];
      el.style.animationDelay = (Math.random()*1.2)+"s";
      frag.appendChild(el);
    }
    for(let i=0;i<kisses;i++){
      const el=document.createElement("span");
      el.className="kiss"; el.textContent="💋";
      el.style.left=Math.random()*100+"%"; el.style.top=(35+Math.random()*55)+"%";
      el.style.animationDelay=(Math.random()*1.1)+"s";
      frag.appendChild(el);
    }
    for(let i=0;i<sparkles;i++){
      const el=document.createElement("span");
      el.className="sparkle"; el.textContent=["✦","✧","⋆","✨"][Math.floor(Math.random()*4)];
      el.style.left=Math.random()*100+"%"; el.style.top=Math.random()*100+"%";
      el.style.animationDelay=(Math.random()*1.2)+"s";
      frag.appendChild(el);
    }
    for(let i=0;i<hearts;i++){
      const el=document.createElement("span");
      el.className="heart"; el.textContent=["♡","♥","💗"][Math.floor(Math.random()*3)];
      el.style.left=Math.random()*100+"%"; el.style.top=(60+Math.random()*30)+"%";
      el.style.animationDelay=(Math.random()*1.2)+"s";
      frag.appendChild(el);
    }
    fx.appendChild(frag);
    setTimeout(() => { fx.innerHTML=""; }, 7000);
  }

  function countdownHTML() {
    return `
      <section class="screen night-screen">
        <div class="glow-orb"></div>
        <div class="hero-wrap">
          <div class="tiny">a secret little birthday journey</div>
          <h1 class="hero-title">Something is<br><em>waiting for you...</em></h1>
          <p class="hero-copy">There is a tiny mystery here. Follow it carefully. It only opens when the moment is right.</p>
          <div class="countdown" aria-label="Countdown to 20 August 2026">
            <div class="time-box"><strong id="days">--</strong><span>Days</span></div>
            <div class="time-box"><strong id="hours">--</strong><span>Hours</span></div>
            <div class="time-box"><strong id="minutes">--</strong><span>Minutes</span></div>
            <div class="time-box"><strong id="seconds">--</strong><span>Seconds</span></div>
          </div>
          <div class="hint">20 August 2026 · the door opens at midnight</div>
        </div>
      </section>`;
  }

  function updateCountdown() {
    const diff = Math.max(0, TARGET - Date.now());
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    ["days","hours","minutes","seconds"].forEach((id,i) => {
      const values=[d,h,m,s];
      const node=document.getElementById(id);
      if(node) node.textContent=String(values[i]).padStart(2,"0");
    });
    if(diff<=0){
      clearInterval(countdownTimer);
      showCandleGame();
    }
  }

  function showCountdown() {
    currentScreen="countdown";
    render(countdownHTML(),"night");
    updateCountdown();
    clearInterval(countdownTimer);
    countdownTimer=setInterval(updateCountdown,1000);
  }

  function showCandleGame() {
    clearInterval(countdownTimer);
    currentScreen="candles";
    render(`
      <section class="screen candle-screen">
        <div class="candle-wrap">
          <div class="eyebrow">the first little test</div>
          <h1>Light the candles.</h1>
          <p>Something is hidden in the dark...<br>Light them all.</p>
          <div class="cake-stage" id="cakeStage">
            <div class="cake-shadow"></div>
            <div class="cake-body"></div>
            <div class="candle-row" id="candleRow"></div>
          </div>
          <div class="candle-progress" id="candleProgress">0 / 9 candles lit</div>
          <div id="candleSuccess"></div>
        </div>
      </section>`,"night");

    const row=document.getElementById("candleRow");
    for(let i=0;i<9;i++){
      const c=document.createElement("button");
      c.className="candle";
      c.type="button";
      c.setAttribute("aria-label",`Light candle ${i+1}`);
      c.dataset.lit="0";
      c.addEventListener("click",()=>{
        if(c.dataset.lit==="1") return;
        c.dataset.lit="1";
        c.classList.add("lit");
        c.innerHTML='<span class="flame"></span>';
        const lit=[...document.querySelectorAll(".candle.lit")].length;
        document.getElementById("candleProgress").textContent=`${lit} / 9 candles lit`;
        if(lit===9) completeCandles();
      });
      row.appendChild(c);
    }
  }

  function completeCandles() {
    document.getElementById("cakeStage").classList.add("lit");
    burst({confetti:130,balloons:12,kisses:20,sparkles:30,hearts:16});
    setTimeout(()=>{
      document.getElementById("candleSuccess").innerHTML=`
        <div class="success-panel">
          <h2>You found the light.</h2>
          <p>Okay. Now the real surprise can begin.</p>
          <button class="btn btn-primary" id="toNewspaper">Continue →</button>
        </div>`;
      document.getElementById("toNewspaper").addEventListener("click",showNewspaper);
    },900);
  }

  function showNewspaper() {
    currentScreen="newspaper";
    render(`
      <section class="screen paper-screen">
        <div class="paper-shell">
          <div class="scrap-top"><span>classified birthday edition</span><span>20 · 08 · 2026</span></div>
          <h1 class="scrap-title">Breaking News.</h1>
          <p class="scrap-sub">One very important local boy has officially reached 19. The newsroom has received reports of excessive nonsense.</p>
          <div class="newspaper-card">
            <img src="assets/newspaper.png" alt="The Adamya Times birthday newspaper">
          </div>
          <p class="newspaper-caption">The evidence is in. And somehow... there's still more.</p>
          <div style="text-align:center">
            <button class="btn btn-dark" id="moreBtn">There's more... →</button>
          </div>
        </div>
      </section>`,"paper");
    burst({confetti:100,balloons:10,kisses:16,sparkles:25,hearts:12});
    document.getElementById("moreBtn").addEventListener("click",showBirthdayReveal);
  }

  function showBirthdayReveal() {
    currentScreen="birthday";
    render(`
      <section class="screen celebrate-screen">
        <div class="celebrate-wrap">
          <div class="doodle d1">✦</div><div class="doodle d2">♡</div><div class="doodle d3">🎈</div><div class="doodle d4">💋</div>
          <div class="kicker">the headline was only the beginning</div>
          <h1 class="big-birthday">HAPPY BIRTHDAY,<span>ADAMYA</span></h1>
          <div class="paper-note">p.s. you're officially 19. behave accordingly.</div>
          <p class="celebrate-copy">Welcome to the warm side of the story. There are four little surprises waiting, but first you have to prove you know your way around a few very specific inside jokes.</p>
          <button class="btn btn-dark" id="enterBtn">Enter →</button>
        </div>
      </section>`,"paper");
    burst({confetti:80,balloons:10,kisses:12,sparkles:22,hearts:18});
    document.getElementById("enterBtn").addEventListener("click",showMenu);
  }

  function menuCard(key,icon,title,desc,color){
    const unlocked = key === "bouquet" ? true : !!state[key];
    return `<button class="menu-card ${color} ${unlocked?"":"locked"}" data-key="${key}" ${unlocked?"":"disabled"}>
      <div class="icon">${icon}</div>
      <h3>${title}</h3>
      <p>${unlocked?desc:"Locked — answer the previous question first."}</p>
      ${unlocked?'':'<span class="lock">🔒</span>'}
    </button>`;
  }

  function showMenu() {
    currentScreen="menu";
    const n=unlockedCount();
    render(`
      <section class="screen menu-screen">
        <div class="menu-wrap">
          <div class="menu-head">
            <div class="kicker">adamya's little scrapbook</div>
            <h1>Choose a surprise.</h1>
            <div class="progress">${n} / 4 unlocked · Bouquet is already open 💐</div>
          </div>
          <div class="menu-grid">
            ${menuCard("bouquet","💐","Bouquet","OPEN — your first surprise is already waiting.","")}
            ${menuCard("card","💌","Card","A tiny door to a very specific birthday message.","pink")}
            ${menuCard("group","🫂","Group Card","Because apparently one card wasn't enough.","lav")}
            ${menuCard("letters","✉️","Letters","Open when... you need a little piece of this day.","yellow")}
          </div>
          ${n===4 ? `
            <div class="menu-finish">
              <div class="kicker">all four are yours</div>
              <h2>You found everything...</h2>
              <p>But there is one last little thing waiting beyond this menu.</p>
              <button class="btn btn-dark" id="videoJourneyBtn">One Last Thing →</button>
            </div>` : `
            <div class="menu-footer">Unlock them in order. Once they're yours, they're yours — come back whenever you want.</div>`}
        </div>
      </section>`,"paper");

    document.querySelectorAll(".menu-card:not(.locked)").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const key=btn.dataset.key;
        if(key==="bouquet") showBouquet();
        if(key==="card") showCard();
        if(key==="group") showGroupCard();
        if(key==="letters") showLetters();
      });
    });
    if(n===4){
      document.getElementById("videoJourneyBtn").addEventListener("click",()=>{
        if(state.videoQuestion || state.videoUnlocked) showVideo();
        else showVideoQuestion();
      });
    }
  }

  function backToMenu(){ showMenu(); }

  function quizPage({key,icon,title,question,options,correct,correctMessage,next}){
    currentScreen="quiz-"+key;
    render(`
      <section class="screen quiz-screen">
        <div class="quiz-wrap">
          <div class="quiz-card">
            <div class="icon">${icon}</div>
            <div class="kicker">unlocking: ${esc(title)}</div>
            <h1>One little question.</h1>
            <div class="question">${esc(question)}</div>
            <div class="options">
              ${options.map((o,i)=>`<button class="option" data-i="${i}" type="button">${esc(o)}</button>`).join("")}
            </div>
            <div class="feedback" id="feedback"></div>
            <div class="back-row">
              <button class="btn btn-light" id="quizBack">← Back to Menu</button>
            </div>
          </div>
        </div>
      </section>`,"paper");

    const feedback=document.getElementById("feedback");
    document.getElementById("quizBack").addEventListener("click",backToMenu);
    document.querySelectorAll(".option").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const choice=options[Number(btn.dataset.i)];
        if(choice===correct){
          btn.classList.add("correct");
          document.querySelectorAll(".option").forEach(x=>x.disabled=true);
          feedback.textContent=correctMessage;
          state[key]=true;
          saveState();
          burst({confetti:35,balloons:3,kisses:4,sparkles:9,hearts:6});
          setTimeout(next,850);
        }else{
          btn.classList.add("wrong");
          feedback.textContent=["Nope 😭 Try again.","That answer is suspicious.","You can do better than that. 😭","Close... but no."][Math.floor(Math.random()*4)];
          setTimeout(()=>btn.classList.remove("wrong"),500);
        }
      });
    });
  }

  function openUnlockedQuiz(key){
    if(key==="bouquet"){
      if(state.bouquet) showBouquet();
      else quizPage({
        key:"bouquet",icon:"💐",title:"Bouquet",
        question:"What is Anannya's favourite colour?",
        options:["Pink","Purple","Blue","Black"],correct:"Blue",
        correctMessage:"Obviously. You knew that one. 💙",
        next:showBouquet
      });
    }
    if(key==="card"){
      if(state.card) showCard();
      else quizPage({
        key:"card",icon:"💌",title:"Card",
        question:"When Anannya needs comfort, what is her first choice?",
        options:["Food","Sleep","Music","Him"],correct:"Him",
        correctMessage:"Yeah... you knew that one. 🫶🏻",
        next:showCard
      });
    }
    if(key==="group"){
      if(state.group) showGroupCard();
      else quizPage({
        key:"group",icon:"🫂",title:"Group Card",
        question:"What does Anannya always say?",
        options:["Baby","Pagal","Lallu","Idiot"],correct:"Lallu",
        correctMessage:"LALLU. Of course. 😭",
        next:showGroupCard
      });
    }
    if(key==="letters"){
      if(state.letters) showLetters();
      else showLettersQuiz();
    }
  }

  function showBouquet(){
    currentScreen="bouquet";
    state.bouquet=true;
    saveState();
    render(`
      <section class="screen content-screen">
        <div class="content-wrap">
          <div class="content-card">
            <div class="external-icon">💐</div>
            <div class="kicker">first surprise · already unlocked</div>
            <h1>A bouquet for you.</h1>
            <p style="color:#6d6877;line-height:1.7;max-width:650px;margin:0 auto 18px">
              The bouquet is <strong>already open</strong>. No quiz stands in front of it — this is where the surprises begin.
            </p>
            <iframe class="bouquet-frame" title="Birthday bouquet" src="https://digibouquet.vercel.app/bouquet/b589b72c-d1d2-40f4-8a6b-de1cdc4efd17"></iframe>
            <div class="bouquet-fallback">If the bouquet doesn't render in your browser, use the button below.</div>
            <div class="back-row">
              <a class="open-link" href="https://digibouquet.vercel.app/bouquet/b589b72c-d1d2-40f4-8a6b-de1cdc4efd17" target="_blank" rel="noopener noreferrer">Open Bouquet ↗</a>
              <button class="btn btn-light" id="backMenu">← Back to Menu</button>
              <button class="btn btn-primary" id="nextCardQuiz">I've seen the bouquet →</button>
            </div>
          </div>
        </div>
      </section>`,"paper");
    document.getElementById("backMenu").addEventListener("click",backToMenu);
    document.getElementById("nextCardQuiz").addEventListener("click",()=>{
      openUnlockedQuiz("card");
    });
  }

  function showCard(){
    currentScreen="card";
    render(`
      <section class="screen content-screen">
        <div class="content-wrap"><div class="content-card">
          <div class="external-icon">💌</div>
          <div class="kicker">second surprise</div>
          <h1>Your Card is ready.</h1>
          <p class="soft-copy">Open it, then come back here — there's another surprise waiting.</p>
          <div class="back-row">
            <a class="open-link" href="https://giftfeels.com/to/adamya" target="_blank" rel="noopener noreferrer">Open Card ↗</a>
            <button class="btn btn-primary" id="anotherCard">Open Another Card →</button>
            <button class="btn btn-light" id="backMenu">← Back to Menu</button>
          </div>
        </div></div>
      </section>`,"paper");
    document.getElementById("backMenu").onclick=backToMenu;
    document.getElementById("anotherCard").onclick=()=>openUnlockedQuiz("group");
  }

  function showGroupCard(){
    currentScreen="group";
    render(`
      <section class="screen content-screen">
        <div class="content-wrap"><div class="content-card">
          <div class="external-icon">🫂</div>
          <div class="kicker">third surprise</div>
          <h1>Your Group Card is ready.</h1>
          <p class="soft-copy">Open the group card, then continue to the final surprise.</p>
          <div class="back-row">
            <a class="open-link" href="https://www.greetingsisland.com/group-card/view/2220kfmaf5" target="_blank" rel="noopener noreferrer">Open Group Card ↗</a>
            <button class="btn btn-primary" id="nextLetters">Open Letters →</button>
            <button class="btn btn-light" id="backMenu">← Back to Menu</button>
          </div>
        </div></div>
      </section>`,"paper");
    document.getElementById("backMenu").onclick=backToMenu;
    document.getElementById("nextLetters").onclick=()=>openUnlockedQuiz("letters");
  }

  function showLettersQuiz(){
    currentScreen="quiz-letters";
    render(`
      <section class="screen quiz-screen">
        <div class="quiz-wrap">
          <div class="quiz-card">
            <div class="icon">✉️</div>
            <div class="kicker">unlocking: letters</div>
            <h1>One last question.</h1>
            <div class="question">Does Anannya wear a bra at home?</div>
            <div class="options">
              <button class="option" data-i="0">Obviously yes</button>
              <button class="option" data-i="1">No 😭</button>
              <button class="option" data-i="2">Depends on the day</button>
              <button class="option" data-i="3">Why is this even a question?</button>
            </div>
            <div class="feedback" id="feedback"></div>
            <div class="back-row"><button class="btn btn-light" id="quizBack">← Back to Menu</button></div>
          </div>
        </div>
      </section>`,"paper");

    document.getElementById("quizBack").addEventListener("click",backToMenu);
    const opts=[...document.querySelectorAll(".option")];
    opts.forEach((btn,i)=>{
      btn.addEventListener("click",()=>{
        if(i===1){
          opts.forEach(x=>x.disabled=true);
          btn.classList.add("correct");
          const feedback=document.getElementById("feedback");
          feedback.textContent="Hmm.";
          setTimeout(()=>{
            feedback.textContent="Easily accessible, right?";
            state.letters=true;
            saveState();
            burst({confetti:45,balloons:4,kisses:8,sparkles:12,hearts:8});
            setTimeout(showLetters,1000);
          },950);
        }else{
          btn.classList.add("wrong");
          document.getElementById("feedback").textContent="That was certainly an answer. 😭";
          setTimeout(()=>btn.classList.remove("wrong"),500);
        }
      });
    });
  }

  function showLetters(){
    currentScreen="letters";
    render(`
      <section class="screen content-screen">
        <div class="content-wrap"><div class="content-card">
          <div class="external-icon">✉️</div>
          <div class="kicker">fourth surprise</div>
          <h1>Your Letters are waiting.</h1>
          <p class="soft-copy">Open your letters, then choose what you want to explore next.</p>
          <div class="back-row">
            <a class="open-link" href="https://openwhenletters.app/c/e65b3a05-572c-4959-a016-e941bc119a88/v/46b3666e1f59e68dfd95d39edcb50249f7299fe98efea9cbcb44da0784f79b5f-" target="_blank" rel="noopener noreferrer">Open Letters ↗</a>
            <button class="btn btn-primary" id="visitAgain">Visit the Surprises Again →</button>
            <button class="btn btn-light" id="backMenu">← Back to Menu</button>
          </div>
        </div></div>
      </section>`,"paper");
    document.getElementById("backMenu").onclick=backToMenu;
    document.getElementById("visitAgain").onclick=backToMenu;
  }

  function showVideoQuestion(){
    currentScreen="video-question";
    render(`
      <section class="screen quiz-screen">
        <div class="quiz-wrap">
          <div class="quiz-card">
            <div class="icon">💬</div>
            <div class="kicker">one little thing you should know</div>
            <h1>Which is Adamya's fav dialogue?</h1>
            <div class="options">
              <button class="option">Arrey yaar</button>
              <button class="option">Hein</button>
              <button class="option">So jaoo</button>
              <button class="option">Motii</button>
            </div>
            <div class="feedback" id="feedback"></div>
            <div class="back-row"><button class="btn btn-light" id="backMenu">← Back to Menu</button></div>
          </div>
        </div>
      </section>`,"paper");
    document.getElementById("backMenu").addEventListener("click",backToMenu);
    const opts=[...document.querySelectorAll(".option")];
    opts.forEach(btn=>{
      btn.addEventListener("click",()=>{
        if(btn.textContent.trim().toLowerCase()==="arrey yaar"){
          btn.classList.add("correct");
          opts.forEach(x=>x.disabled=true);
          document.getElementById("feedback").textContent="Okay... you really should know this one. 😭❤️";
          state.videoQuestion=true;
          state.videoUnlocked=true;
          saveState();
          burst({confetti:45,balloons:4,kisses:7,sparkles:15,hearts:7});
          setTimeout(showVideo,900);
        }else{
          btn.classList.add("wrong");
          document.getElementById("feedback").textContent="Nope 😭 try again... you know this one.";
          setTimeout(()=>btn.classList.remove("wrong"),500);
        }
      });
    });
  }

  function showVideo(){
    currentScreen="video";
    render(`
      <section class="screen video-screen">
        <div class="video-wrap">
          <div class="kicker">a little something you should see</div>
          <h1>One last thing...</h1>
          <div class="video-frame">
            <video id="birthdayVideo" controls playsinline preload="metadata">
              <source src="assets/birthday-video.mp4" type="video/mp4">
              Your browser doesn't support this video.
            </video>
          </div>
          <p class="video-note">No edits. No skipping the feeling. Just press play. When it finishes, there is one final thing.</p>
          <div id="videoNext" class="hidden">
            <button class="btn btn-dark" id="continueRiddle">Okay... one final thing. →</button>
          </div>
          <div class="back-row"><button class="btn btn-light" id="backMenu">← Back</button></div>
        </div>
      </section>`,"paper");

    const v=document.getElementById("birthdayVideo");
    const next=document.getElementById("videoNext");
    v.addEventListener("ended",()=>{
      next.classList.remove("hidden");
      burst({confetti:35,balloons:3,kisses:5,sparkles:10,hearts:7});
    });
    document.getElementById("continueRiddle").addEventListener("click",showCherryReveal);
    document.getElementById("backMenu").addEventListener("click",backToMenu);
  }

  function showCherryReveal(){
    currentScreen="cherry-reveal";
    render(`
      <section class="screen cherry-reveal-screen">
        <div class="cherry-doodles" aria-hidden="true">
          <span class="cherry-doodle cd1">♡</span>
          <span class="cherry-doodle cd2">✦</span>
          <span class="cherry-doodle cd3">〰</span>
          <span class="cherry-doodle cd4">♥</span>
          <span class="cherry-doodle cd5">✧</span>
          <span class="cherry-doodle cd6">♡</span>
          <span class="cherry-doodle cd7">✦</span>
          <span class="cherry-doodle cd8">〰</span>
        </div>
        <div class="cherry-note">
          <div class="cherry-small">hmm.....</div>
          <h1>you know well<br><em>whatever it is.</em></h1>
          <div class="cherry-heart">♥</div>
        </div>
      </section>`,"cherry");

    burst({confetti:35,balloons:0,kisses:12,sparkles:10,hearts:8});
    setTimeout(showBirthdayShaurya,3000);
  }

  function showBirthdayShaurya(){
    currentScreen="birthday-shaurya";
    render(`
      <section class="screen shaurya-screen">
        <div class="shaurya-confetti" aria-hidden="true">
          <span class="sc sc1"></span><span class="sc sc2"></span><span class="sc sc3"></span><span class="sc sc4"></span>
          <span class="sc sc5"></span><span class="sc sc6"></span><span class="sc sc7"></span><span class="sc sc8"></span>
          <span class="star ss1">✦</span><span class="star ss2">✧</span><span class="star ss3">✦</span><span class="star ss4">✧</span>
        </div>
        <div class="sh-balloon shb1"></div><div class="sh-balloon shb2"></div>
        <div class="sh-balloon shb3"></div><div class="sh-balloon shb4"></div>
        <div class="shaurya-wrap">
          <p class="shaurya-kicker">and this was the whole point...</p>
          <h1 class="shaurya-title"><span>Happy</span><span>Birthday</span></h1>
          <div class="shaurya-name">Shaurya</div>
          <p class="shaurya-sub">Made with an unreasonable amount of love by Anannya.</p>
          <button class="btn shaurya-next" id="shauryaNext">one more little thing →</button>
        </div>
      </section>`,"paper");

    burst({confetti:70,balloons:5,kisses:14,sparkles:18,hearts:10});
    document.getElementById("shauryaNext").onclick=showFinalRiddle;
    // Let the page breathe, then continue automatically.
    setTimeout(()=>{
      if(currentScreen==="birthday-shaurya") showFinalRiddle();
    },5200);
  }

  function showFinalRiddle(){
    currentScreen="final-riddle";
    const answerText = `I’m a colour that feels like home,
a song that keeps my heart awake,
a story I’d happily get lost inside,
and a little word I say that makes absolutely no sense.

I fall more often than I’d like,
I find comfort in one person,
and when it comes to food… well, I don’t discriminate.`;

    render(`
      <section class="screen final-riddle-screen">
        <div class="final-riddle-stars"></div>
        <div class="final-riddle-lip lip-a">💋</div>
        <div class="final-riddle-lip lip-b">💋</div>
        <div class="final-riddle-lip lip-c">💋</div>
        <div class="final-riddle-card">
          <button class="back-floating final-riddle-back" id="backFinalRiddle">← Back</button>
          <div class="final-riddle-kicker">okay... one final thing.</div>
          <div class="final-riddle-copy" id="finalRiddleCopy"></div>
          <div class="final-riddle-question">So tell me — who am I?</div>
          <div class="final-answer-row">
            <input id="finalRiddleInput" class="final-riddle-input" autocomplete="off" placeholder="your answer" aria-label="Your answer" />
            <button class="btn final-answer-btn" id="finalRiddleSubmit">Answer →</button>
          </div>
          <div id="finalRiddleHint" class="final-riddle-hint"></div>
        </div>
      </section>`,"dark");

    document.getElementById("backFinalRiddle").onclick=showBirthdayShaurya;
    // Show the whole riddle at once so it behaves like the single-page reference image.
    document.getElementById("finalRiddleCopy").textContent=answerText;
    document.getElementById("finalRiddleInput").focus();

    const submit=()=>{
      const input=document.getElementById("finalRiddleInput");
      const hint=document.getElementById("finalRiddleHint");
      if(input.value.trim().toLowerCase()==="adamya"){
        hint.textContent="That’s it — Adamya. ♥";
        hint.classList.add("success");
        setTimeout(showFinal,850);
      }else{
        hint.textContent="Hmm... think a little closer. 💭";
        input.focus();
      }
    };
    document.getElementById("finalRiddleSubmit").onclick=submit;
    document.getElementById("finalRiddleInput").addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
  }

  function showFinal(){
    currentScreen="final";
    state.finalComplete=true;
    saveState();
    render(`
      <section class="screen final-screen">
        <div class="final-wrap love-final-wrap">
          <div class="love-sparkle">✦ ♡ ✦</div>
          <div class="cake">💋</div>
          <div class="love-kicker">and finally...</div>
          <h1 class="love-final-title">Yessssss...<br><span>I love you the most.</span></h1>
          <p class="love-final-note">♡ no more riddles. just this. ♡</p>
          <div class="love-final-hearts">💗 💋 ✨ 💗</div>
        </div>
      </section>`,"paper");
    burst({confetti:220,balloons:22,kisses:30,sparkles:45,hearts:25});
  }

  // Testing shortcuts:
  // G = bypass countdown, only while countdown is visible.
  // R = reset the whole experience.
  window.addEventListener("keydown", e=>{
    if(e.key.toLowerCase()==="g" && currentScreen==="countdown"){
      countdownWasSkipped=true;
      showCandleGame();
    }
    if(e.key.toLowerCase()==="r"){
      localStorage.removeItem(STORAGE);
      state={screen:"countdown"};
      currentScreen="countdown";
      prompt.classList.remove("hidden");
      showCountdown();
    }
  });

  initCursorKisses();

  // If a prior visit had unlocked everything, preserve the menu/story state.
  // The countdown itself intentionally remains the first screen after a hard refresh,
  // while localStorage keeps all unlocked content available.
  if(state.finalComplete){
    // A finished experience may be refreshed without erasing the achievement.
    showFinal();
  } else {
    showCountdown();
  }
})();
