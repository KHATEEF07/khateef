(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORE = "khateef-data-v1";
  const TODAY = () => new Date().toISOString().slice(0,10);
  const dateLabel = (date=new Date()) => date.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);
  const escapeHtml = (v="") => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const seed = () => ({
    tasks:[
      {id:uid(),title:"Plan the day in 5 minutes",due:TODAY(),priority:"medium",done:false,created:Date.now()},
      {id:uid(),title:"Take a proper break",due:TODAY(),priority:"low",done:false,created:Date.now()},
      {id:uid(),title:"Finish one important thing",due:TODAY(),priority:"high",done:false,created:Date.now()}
    ],
    notes:[{id:uid(),title:"A reminder to myself",body:"Progress doesn't need to be perfect. Just keep showing up.",updated:Date.now()}],
    habits:[
      {id:uid(),name:"Drink enough water",emoji:"💧",days:{}},
      {id:uid(),name:"Read for 10 minutes",emoji:"📚",days:{}},
      {id:uid(),name:"Move your body",emoji:"🌿",days:{}}
    ],
    goals:[{id:uid(),title:"Make time for what matters",description:"Build a routine that supports the life I want.",emoji:"🌱",progress:15,created:Date.now()}],
    theme:"light"
  });
  let data;
  try { data = JSON.parse(localStorage.getItem(STORE)) || seed(); } catch { data = seed(); }
  data.tasks ||= []; data.notes ||= []; data.habits ||= []; data.goals ||= []; data.theme ||= "light";
  let currentView="overview", taskFilter="all", modalType=null, editingId=null, toastTimer;
  const quotes=[
    "You don't have to see the whole staircase. Just take the first step.",
    "Small steps every day add up to big change.",
    "You can do hard things, one moment at a time.",
    "Make progress, not pressure.",
    "A calmer life starts with one clear next step."
  ];
  function save(){localStorage.setItem(STORE,JSON.stringify(data));render();}
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);}
  function applyTheme(){document.body.classList.toggle("dark",data.theme==="dark");$("#themeIcon").textContent=data.theme==="dark"?"☀":"☾";}
  function setView(view){
    currentView=view; $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
    $$(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    const names={overview:"Overview",tasks:"Tasks",notes:"Notes",habits:"Habits",goals:"Goals"};
    $("#crumbTitle").textContent=names[view]; $("#pageTitle").innerHTML=view==="overview"?`<span class="hero-gradient">${greeting()}.</span> <span class="wave">✳</span>`:names[view];
    $("#pageSubtitle").textContent=({overview:"A little progress, every day. Let's make today count.",tasks:"One thing at a time. You've got this.",notes:"A home for your thoughts, ideas, and reminders.",habits:"Consistency is built one check-in at a time.",goals:"Keep moving toward what matters to you."})[view];
    $("#welcomeEyebrow").textContent=view==="overview"?"YOUR PERSONAL SPACE":"YOUR PERSONAL SPACE / "+names[view].toUpperCase();
    $("#sidebar").classList.remove("open"); render();
  }
  function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";}
  function taskMarkup(t){return `<div class="task-row" data-id="${t.id}"><button class="check-btn ${t.done?"checked":""}" data-action="toggle-task" data-id="${t.id}" aria-label="${t.done?"Mark incomplete":"Mark complete"}">${t.done?"✓":""}</button><div class="task-copy"><div class="task-title ${t.done?"done":""}">${escapeHtml(t.title)}</div><div class="task-meta"><span class="priority ${escapeHtml(t.priority||"low")}"></span>${({high:"High priority",medium:"Medium priority",low:"Low priority"})[t.priority]||"Low priority"}${t.due?`<span>·</span><span>${t.due===TODAY()?"Today":escapeHtml(t.due)}</span>`:""}</div></div><div class="task-actions"><button class="mini-action" data-action="edit-task" data-id="${t.id}" aria-label="Edit task">✎</button><button class="mini-action" data-action="delete-task" data-id="${t.id}" aria-label="Delete task">×</button></div></div>`;}
  function habitMarkup(h){const done=!!h.days?.[TODAY()];return `<div class="habit-row"><div class="habit-emoji">${escapeHtml(h.emoji||"✨")}</div><div class="habit-name">${escapeHtml(h.name)}<div class="habit-sub">${done?"Nice work — done for today":"A small promise to yourself"}</div></div><button class="habit-toggle ${done?"done":""}" data-action="toggle-habit" data-id="${h.id}" aria-label="${done?"Uncheck":"Complete"} ${escapeHtml(h.name)}">${done?"✓":"＋"}</button><button class="mini-action" data-action="edit-habit" data-id="${h.id}" aria-label="Edit habit">⋯</button></div>`;}
  function render(){
    applyTheme();
    const all=data.tasks.length, done=data.tasks.filter(t=>t.done).length, habitsDone=data.habits.filter(h=>h.days?.[TODAY()]).length;
    $("#statCompleted").innerHTML=`${done} <small>/ ${all}</small>`; $("#taskProgress").style.width=(all?done/all*100:0)+"%";$("#taskPercent").textContent=(all?Math.round(done/all*100):0)+"%";
    $("#statHabits").innerHTML=`${habitsDone} <small>/ ${data.habits.length}</small>`;$("#habitProgress").style.width=(data.habits.length?habitsDone/data.habits.length*100:0)+"%";$("#habitPercent").textContent=(data.habits.length?Math.round(habitsDone/data.habits.length*100):0)+"%";
    $("#statGoals").textContent=data.goals.length;$("#taskNavCount").textContent=data.tasks.filter(t=>!t.done).length;
    $("#overviewTasks").innerHTML=data.tasks.filter(t=>!t.done).slice(0,4).map(taskMarkup).join("")||`<div class="muted" style="padding:14px 0">All clear. Add something when you're ready.</div>`;
    $("#allTasks").innerHTML=data.tasks.filter(t=>taskFilter==="all"||(taskFilter==="open"&&!t.done)||(taskFilter==="done"&&t.done)).sort((a,b)=>Number(a.done)-Number(b.done)).map(taskMarkup).join("");
    $("#tasksEmpty").classList.toggle("hidden",data.tasks.filter(t=>taskFilter==="all"||(taskFilter==="open"&&!t.done)||(taskFilter==="done"&&t.done)).length>0);
    $("#overviewHabits").innerHTML=data.habits.slice(0,4).map(habitMarkup).join("")||`<div class="muted" style="padding:10px 0">Add a habit to build your rhythm.</div>`;
    $("#allHabits").innerHTML=data.habits.map(habitMarkup).join("");$("#habitsEmpty").classList.toggle("hidden",data.habits.length>0);
    $("#habitDonePill").textContent=`${habitsDone} completed`;$("#habitDateLabel").textContent=dateLabel();
    $("#overviewNotes").innerHTML=data.notes.slice().sort((a,b)=>b.updated-a.updated).slice(0,2).map(n=>`<div class="note-preview"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p></div>`).join("")||`<div class="muted" style="padding:10px 0">Your next idea can start here.</div>`;
    $("#notesGrid").innerHTML=data.notes.slice().sort((a,b)=>b.updated-a.updated).map(n=>`<article class="note-card"><div class="card-foot" style="margin-bottom:13px"><span>${dateLabel(new Date(n.updated))}</span><div class="card-actions"><button class="mini-action" data-action="edit-note" data-id="${n.id}" aria-label="Edit note">✎</button><button class="mini-action" data-action="delete-note" data-id="${n.id}" aria-label="Delete note">×</button></div></div><h3>${escapeHtml(n.title)}</h3><p>${escapeHtml(n.body)}</p></article>`).join("");$("#notesEmpty").classList.toggle("hidden",data.notes.length>0);
    $("#goalsGrid").innerHTML=data.goals.map(g=>`<article class="goal-card"><div class="goal-top"><div class="goal-emoji">${escapeHtml(g.emoji||"🎯")}</div><div class="card-actions"><button class="mini-action" data-action="edit-goal" data-id="${g.id}" aria-label="Edit goal">✎</button><button class="mini-action" data-action="delete-goal" data-id="${g.id}" aria-label="Delete goal">×</button></div></div><h3>${escapeHtml(g.title)}</h3><p>${escapeHtml(g.description||"One step at a time.")}</p><div class="goal-progress-head"><span>Progress</span><strong>${g.progress||0}%</strong></div><div class="goal-progress"><span style="width:${Math.min(100,Math.max(0,Number(g.progress)||0))}%"></span></div><div class="goal-adjust"><button data-action="goal-down" data-id="${g.id}">− 5%</button><span>Keep going</span><button data-action="goal-up" data-id="${g.id}">+ 5%</button></div></article>`).join("");$("#goalsEmpty").classList.toggle("hidden",data.goals.length>0);
    $("#dailyQuote").textContent=quotes[new Date().getDate()%quotes.length];
    // Reveal dashboard cards as they enter view, with graceful fallback for older browsers.
    const revealTargets = $$(".stat-card, .panel, .note-card, .goal-card");
    if ("IntersectionObserver" in window) {
      if (!window.khateefRevealObserver) {
        window.khateefRevealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); window.khateefRevealObserver.unobserve(entry.target); }
        }), {threshold: 0.08});
      }
      revealTargets.forEach(el => { el.classList.add("reveal"); if (!el.classList.contains("is-visible")) window.khateefRevealObserver.observe(el); });
    }
    // Subtle cursor-following light on pointer devices only.
    revealTargets.forEach(el => {
      if (el.dataset.beamReady) return;
      el.dataset.beamReady = "1";
      el.addEventListener("pointermove", ev => {
        if (ev.pointerType === "touch") return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--beam-x", `${ev.clientX - rect.left}px`);
        el.style.setProperty("--beam-y", `${ev.clientY - rect.top}px`);
      }, {passive:true});
    });
  }
  const field=(label,name,type="text",value="",placeholder="",extra="")=>`<div class="field"><label for="f_${name}">${label}</label>${type==="textarea"?`<textarea id="f_${name}" name="${name}" placeholder="${placeholder}" ${extra}>${escapeHtml(value)}</textarea>`:`<input id="f_${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${extra}>`}</div>`;
  function openModal(type,id=null){
    modalType=type;editingId=id;const old=id?data[type==="task"?"tasks":type==="note"?"notes":type==="habit"?"habits":"goals"].find(x=>x.id===id):null;
    const titles={task:old?"Edit task":"Add a task",note:old?"Edit note":"Write a note",habit:old?"Edit habit":"Add a habit",goal:old?"Edit goal":"Create a goal"};
    $("#modalTitle").textContent=titles[type];let html="";
    if(type==="task")html=field("Task name","title","text",old?.title||"","","required maxlength=\"120\"")+`<div class="field"><label for="f_due">Due date</label><input id="f_due" name="due" type="date" value="${escapeHtml(old?.due||TODAY())}"></div><div class="field"><label for="f_priority">Priority</label><select id="f_priority" name="priority"><option value="low" ${old?.priority==="low"?"selected":""}>Low</option><option value="medium" ${!old||old.priority==="medium"?"selected":""}>Medium</option><option value="high" ${old?.priority==="high"?"selected":""}>High</option></select></div>`;
    if(type==="note")html=field("Title","title","text",old?.title||"","","required maxlength=\"100\"")+field("Your note","body","textarea",old?.body||"","Write whatever is on your mind…","rows=\"5\"");
    if(type==="habit")html=field("Habit name","name","text",old?.name||"","","required maxlength=\"80\"")+`<div class="field"><label for="f_emoji">Emoji</label><select id="f_emoji" name="emoji">${["✨","💧","📚","🌿","🏃","🧘","💤","✍️","🎯","🥗","💻"].map(e=>`<option ${old?.emoji===e?"selected":(!old&&e==="✨"?"selected":"")}>${e}</option>`).join("")}</select></div>`;
    if(type==="goal")html=field("Goal title","title","text",old?.title||"","","required maxlength=\"100\"")+field("Why it matters (optional)","description","textarea",old?.description||"","Describe what success looks like…","rows=\"3\"")+`<div class="field"><label for="f_emoji">Emoji</label><select id="f_emoji" name="emoji">${["🎯","🌱","📚","💼","💪","💰","✈️","🎨","🏡"].map(e=>`<option ${old?.emoji===e?"selected":(!old&&e==="🎯"?"selected":"")}>${e}</option>`).join("")}</select></div>`+(old?`<div class="field"><label for="f_progress">Progress (0–100%)</label><input id="f_progress" name="progress" type="number" min="0" max="100" value="${old.progress||0}"></div>`:"");
    $("#formFields").innerHTML=html;$("#modalBackdrop").classList.remove("hidden");setTimeout(()=>$("#formFields input, #formFields textarea")?.focus(),30);
  }
  function closeModal(){$("#modalBackdrop").classList.add("hidden");$("#itemForm").reset();modalType=null;editingId=null;}
  function formSubmit(e){e.preventDefault();if(!modalType)return;const fd=new FormData(e.currentTarget);const v=Object.fromEntries(fd.entries());const type=modalType;const listKey={task:"tasks",note:"notes",habit:"habits",goal:"goals"}[type];let item=editingId?data[listKey].find(x=>x.id===editingId):null;
    if(type==="task"){const title=v.title.trim();if(!title)return;const obj={title,due:v.due||"",priority:v.priority||"medium",done:item?.done||false,created:item?.created||Date.now()};if(item)Object.assign(item,obj);else data.tasks.unshift({id:uid(),...obj});}
    if(type==="note"){const title=v.title.trim();if(!title)return;const obj={title,body:v.body||"",updated:Date.now()};if(item)Object.assign(item,obj);else data.notes.unshift({id:uid(),...obj});}
    if(type==="habit"){const name=v.name.trim();if(!name)return;const obj={name,emoji:v.emoji||"✨",days:item?.days||{}};if(item)Object.assign(item,obj);else data.habits.push({id:uid(),...obj});}
    if(type==="goal"){const title=v.title.trim();if(!title)return;const obj={title,description:v.description||"",emoji:v.emoji||"🎯",progress:Math.max(0,Math.min(100,Number(v.progress)||0)),created:item?.created||Date.now()};if(item)Object.assign(item,obj);else data.goals.push({id:uid(),...obj});}
    closeModal();save();toast(`${type[0].toUpperCase()+type.slice(1)} saved`);
  }
  function removeItem(type,id){const key={task:"tasks",note:"notes",habit:"habits",goal:"goals"}[type];const item=data[key].find(x=>x.id===id);if(!item)return;if(!confirm(`Delete "${item.title||item.name}"? This cannot be undone unless you have a backup.`))return;data[key]=data[key].filter(x=>x.id!==id);save();toast("Deleted");}
  function handleAction(action,id){
    const find=(key)=>data[key].find(x=>x.id===id);
    if(action==="add-task")return openModal("task");if(action==="add-note")return openModal("note");if(action==="add-habit")return openModal("habit");if(action==="add-goal")return openModal("goal");
    if(action==="toggle-task"){const t=find("tasks");if(t){t.done=!t.done;save();if(t.done)toast("Task completed — nice work!")}return;}
    if(action==="edit-task")return openModal("task",id);if(action==="edit-note")return openModal("note",id);if(action==="edit-habit")return openModal("habit",id);if(action==="edit-goal")return openModal("goal",id);
    if(action.startsWith("delete-"))return removeItem(action.slice(7),id);
    if(action==="toggle-habit"){const h=find("habits");if(h){h.days||={};if(h.days[TODAY()])delete h.days[TODAY()];else h.days[TODAY()]=true;save();toast(h.days[TODAY()]?"Habit checked off!":"Habit unchecked")}return;}
    if(action==="goal-up"||action==="goal-down"){const g=find("goals");if(g){g.progress=Math.max(0,Math.min(100,(Number(g.progress)||0)+(action==="goal-up"?5:-5)));save()}return;}
  }
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-view]");if(nav){setView(nav.dataset.view);return;}
    const goto=e.target.closest("[data-goto]");if(goto){setView(goto.dataset.goto);return;}
    const actionEl=e.target.closest("[data-action]");if(actionEl){handleAction(actionEl.dataset.action,actionEl.dataset.id);return;}
    const filter=e.target.closest("[data-filter]");if(filter){taskFilter=filter.dataset.filter;$$(".filter-tab").forEach(b=>b.classList.toggle("active",b===filter));render();return;}
  });
  $("#quickAddBtn").addEventListener("click",()=>openModal(currentView==="tasks"?"task":currentView==="notes"?"note":currentView==="habits"?"habit":currentView==="goals"?"goal":"task"));
  $("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);$("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});$("#itemForm").addEventListener("submit",formSubmit);
  $("#themeBtn").addEventListener("click",()=>{data.theme=data.theme==="dark"?"light":"dark";save();});
  $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`khateef-backup-${TODAY()}.json`;a.click();URL.revokeObjectURL(url);toast("Backup exported");});
  $("#importInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const next=parsed.data||parsed;if(!Array.isArray(next.tasks)||!Array.isArray(next.notes)||!Array.isArray(next.habits)||!Array.isArray(next.goals))throw new Error("Invalid backup");if(!confirm("Import this backup and replace the data currently saved on this device?"))return;data=next;save();toast("Backup imported");}catch{alert("That file doesn't look like a valid Khateef backup.")}finally{e.target.value="";}});
  $("#aboutBtn").addEventListener("click",()=>alert("Khateef is a lightweight personal organizer. Your tasks, notes, habits, goals, and theme are stored in this browser on this device. There is no account or cloud sync in this starter version. Use Export backup to save a copy. Clearing browser data may erase your Khateef data."));
  $("#todayChip").textContent=dateLabel();$("#welcomeEyebrow").textContent="YOUR PERSONAL SPACE";
  if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
  render();
})();