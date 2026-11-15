
const CHARACTERS=["assets/character-detail-01.jpg", "assets/character-detail-02.jpg", "assets/character-detail-03.jpg", "assets/character-detail-04.jpg", "assets/character-detail-05.jpg", "assets/character-detail-06.jpg", "assets/character-detail-07.jpg", "assets/character-detail-08.jpg", "assets/character-detail-09.jpg", "assets/character-detail-10.jpg", "assets/character-detail-11.jpg", "assets/character-detail-12.jpg", "assets/character-detail-13.jpg", "assets/character-detail-14.jpg", "assets/character-detail-15.jpg", "assets/character-detail-16.jpg", "assets/character-detail-17.jpg", "assets/character-detail-18.jpg", "assets/character-detail-19.jpg", "assets/character-detail-20.jpg", "assets/character-detail-21.jpg", "assets/character-detail-22.jpg", "assets/character-detail-23.jpg", "assets/character-detail-24.jpg"];
const baseRoles=[
{name:'Facilitator',desc:'Guides the discussion and invites everyone to share.',color:'#77915c',char:4},
{name:'Recorder',desc:'Writes down the team’s ideas and decisions.',color:'#9c8ab0',char:10},
{name:'Timekeeper',desc:'Helps the team use its time well.',color:'#d3ad68',char:1},
{name:'Presenter',desc:'Shares the group’s output with the class.',color:'#c98167',char:14},
{name:'Researcher',desc:'Finds information and checks useful sources.',color:'#729c99',char:8},
{name:'Encourager',desc:'Supports teammates and makes room for quieter voices.',color:'#a1a96d',char:17},
{name:'Materials Keeper',desc:'Organizes materials and keeps the group ready.',color:'#b18b68',char:20},
{name:'Checker',desc:'Reviews the work and checks the instructions.',color:'#8c91a9',char:5}
];
let data={members:['Student 1','Student 2','Student 3','Student 4','Student 5'],roles:baseRoles,tasks:[],logs:[],assignments:[],turn:0,xp:0,achievements:[]};
let angle=0,zoomLevel=1,drag=false,lastA=0,vel=0,audio=null,music=false,musicNodes=[],musicGain=null,clicks=true;
let usedRoles=[],usedBugRoles=[],caughtMembers=[],bugAssignments=[],promptIndex=-1;const prompts=['What is one idea your group should remember?','Who helped the team move forward today?','What is one thing you learned from a teammate?','What could your group improve next time?','Which part of the task made you curious?','How can you make space for a quieter voice?','What is one strength your team showed?'];
const $=id=>document.getElementById(id);
function creatureArt(kind){
 const common='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="M16 78Q48 88 80 78" fill="#9ab878"/><ellipse cx="48" cy="57" rx="28" ry="25" fill="BODY"/><circle cx="37" cy="49" r="5" fill="#263d2d"/><circle cx="59" cy="49" r="5" fill="#263d2d"/><path d="M41 63q7 7 14 0" fill="none" stroke="#694d3c" stroke-width="3" stroke-linecap="round"/>DETAIL</svg>';
 const variants={
  'moss-fox':['#d78b55','<path d="M23 34 18 9 40 24 48 20 56 24 78 9 73 39" fill="#d78b55" stroke="#80533a" stroke-width="3"/><path d="M31 31 25 17 40 27M65 31 71 17 56 27" fill="#f5d9a4"/><path d="M42 58q6-8 12 0" fill="#fff0d0"/>'],
  'moon-moth':['#b7a9d8','<path d="M30 44Q2 20 10 8Q34 10 43 39M66 44Q94 20 86 8Q62 10 53 39" fill="#d7c8ef" stroke="#776b9c" stroke-width="3"/><path d="M44 33Q29 12 37 8M52 33Q67 12 59 8" fill="none" stroke="#776b9c" stroke-width="3"/><circle cx="48" cy="18" r="4" fill="#f6e8a8"/>'],
  'fern-sprite':['#83ad70','<path d="M48 38Q15 34 22 9Q43 11 48 34Q53 11 74 9Q81 34 48 38Z" fill="#a7c98a" stroke="#4d784b" stroke-width="3"/><path d="M48 37Q31 23 28 15M48 37Q65 23 68 15" stroke="#4d784b" stroke-width="2" fill="none"/><circle cx="48" cy="18" r="5" fill="#f2dc8e"/>'],
  'acorn-owl':['#b58b5e','<path d="M22 43 24 12 43 29 53 29 72 12 74 43" fill="#b58b5e" stroke="#725237" stroke-width="3"/><path d="M27 39 27 20 40 32M69 39 69 20 56 32" fill="#e8d5ad"/><ellipse cx="48" cy="67" rx="17" ry="12" fill="#e8d5ad"/>']
 };
 const [body,detail]=variants[kind]||variants['fern-sprite'];
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(common.replace('BODY',body).replace('DETAIL',detail));
}
document.querySelectorAll('.pixel-faces img[data-creature]').forEach(img=>{img.src=creatureArt(img.dataset.creature)});
function currentLevel(){return Math.floor((data.xp||0)/100)+1}
function updatePill(){if($('teamPill'))$('teamPill').textContent='🌼 '+data.members.length+' learners';if($('xpPill'))$('xpPill').textContent='⭐ '+(data.xp||0)+' XP · Lv '+currentLevel()}
const rewardDefs=[{id:'seedling',xp:25,name:'Seedling',icon:'🌱',desc:'Earn 25 XP'},{id:'forest-friend',xp:100,name:'Forest Friend',icon:'🦊',desc:'Earn 100 XP'},{id:'grove-guardian',xp:250,name:'Grove Guardian',icon:'🌳',desc:'Earn 250 XP'}];
function addXP(amount,reason){data.xp=(data.xp||0)+amount;let newly=rewardDefs.filter(r=>data.xp>=r.xp&&!(data.achievements||[]).includes(r.id));data.achievements=data.achievements||[];newly.forEach(r=>data.achievements.push(r.id));save();if(newly.length)toast('🏅 Badge unlocked: '+newly.map(r=>r.name).join(', ')+'!');else if(reason)toast('+'+amount+' XP · '+reason)}
function renderRewards(){let el=$('rewardGrid');if(!el)return;el.innerHTML=rewardDefs.map(r=>{let unlocked=(data.achievements||[]).includes(r.id);return `<div class="reward ${unlocked?'':'locked'}"><span class="reward-icon">${unlocked?r.icon:'🔒'}</span><b>${r.name}</b><br><small>${unlocked?'Unlocked!':r.desc}</small></div>`}).join('')+`<div class="reward ${(data.achievements||[]).includes('everyone-spoke')?'':'locked'}"><span class="reward-icon">${(data.achievements||[]).includes('everyone-spoke')?'🗣️':'🔒'}</span><b>Every Voice</b><br><small>${(data.achievements||[]).includes('everyone-spoke')?'Unlocked!':'Let everyone take a turn'}</small></div>`}
const TEAM_TUTORIAL=[{name:'Lysandra',role:'Welcome Guide',gender:'female',text:"Welcome to SocialSync! I'm Lysandra. This forest world helps our team share responsibilities, take turns, and keep track of our activities.",avatar:'assets/team-character-01.png'},{name:'Raina',role:'Garden Guide',gender:'female',text:"Hi! I'm Raina. You can explore the garden for settings, prompts, and voice activities whenever your team needs them.",avatar:'assets/team-character-02.png'},{name:'Khim',role:'Workshop Guide',gender:'male',text:"Hey, I'm Khim. Inside the team house, you'll find tools like the role spinner, frog and bug catcher, field journal, and quest board.",avatar:'assets/team-character-03.png'},{name:'Andrew',role:'Adventure Guide',gender:'male',text:"And I'm Andrew! Follow the tutorial trail to learn how everything works. Let's explore SocialSync together!",avatar:'assets/team-character-04.png'}]; let tutorialIndex=0;
let tutorialStarted=false;
function initTeamPortraits(){
 document.querySelectorAll('.pixel-faces img[data-creature]').forEach((img,i)=>{if(TEAM_TUTORIAL[i])img.src=TEAM_TUTORIAL[i].avatar});
}
function tutorialBlips(text){
 try{
  const ctx=audio=audio||new(window.AudioContext||window.webkitAudioContext)();ctx.resume();
  const count=Math.min(18,Math.max(7,Math.floor(text.length/7)));
  for(let i=0;i<count;i++){
   const t=ctx.currentTime+i*.075,osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.type='square';osc.frequency.setValueAtTime(390+(i%4)*95,t);
   gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.035,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+.045);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.05);
  }
 }catch(e){}
}
function speakTutorial(){
 const member=TEAM_TUTORIAL[tutorialIndex];if(!member)return;
 tutorialBlips(member.text);
 if('speechSynthesis' in window){
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(member.text);const voices=window.speechSynthesis.getVoices();const femaleHints=/female|woman|zira|samantha|victoria|karen|susan|moira|tessa|ava|jenny|aria|sara|hazel|google uk english female/i;const maleHints=/male|man|david|mark|daniel|james|guy|ryan|alex|george|google uk english male/i;const hint=member.gender==='female'?femaleHints:maleHints;const chosen=voices.find(v=>hint.test(v.name+' '+v.voiceURI))||voices.find(v=>/^en/i.test(v.lang));if(chosen)utterance.voice=chosen;utterance.rate=.94;utterance.pitch=member.gender==='female'?1.12:.92;utterance.volume=.86;
  window.speechSynthesis.speak(utterance);
 }
}
function showTutorialSpeaker(){
 const m=TEAM_TUTORIAL[tutorialIndex];if(!m)return;
 const avatar=$('tutorialAvatar'),speaker=$('tutorialSpeaker'),dialogue=$('tutorialDialogue'),progress=$('tutorialProgress'),caption=$('tutorialCaption'),next=$('tutorialNext');
 if(!avatar||!speaker||!dialogue||!progress||!caption||!next)return;
 avatar.src=m.avatar;avatar.classList.remove('pop-in');void avatar.offsetWidth;avatar.classList.add('pop-in');speaker.textContent=m.name.toUpperCase()+' · '+m.role.toUpperCase();dialogue.textContent=m.text;
 progress.style.width=((tutorialIndex+1)/TEAM_TUTORIAL.length*100)+'%';
 caption.textContent='Speaker '+(tutorialIndex+1)+' of '+TEAM_TUTORIAL.length+' · '+(m.gender==='female'?'girl character voice':'boy character voice')+' with subtitles.';
 next.textContent=tutorialIndex===TEAM_TUTORIAL.length-1?'Replay conversation ↻':'Next character →';
}
function nextTutorialSpeaker(){
 if(!tutorialStarted){tutorialStarted=true;showTutorialSpeaker();speakTutorial();return;}
 if(tutorialIndex>=TEAM_TUTORIAL.length-1){tutorialIndex=0;showTutorialSpeaker();speakTutorial();return;}
 tutorialIndex++;showTutorialSpeaker();speakTutorial();
}
function replayTutorialVoice(){tutorialStarted=true;showTutorialSpeaker();speakTutorial();}
function playWhoosh(){try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter(),t=audio.currentTime;o.type='sawtooth';o.frequency.setValueAtTime(430,t);o.frequency.exponentialRampToValueAtTime(110,t+.95);f.type='lowpass';f.frequency.setValueAtTime(1150,t);f.frequency.exponentialRampToValueAtTime(300,t+.95);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.042,t+.16);g.gain.exponentialRampToValueAtTime(.0001,t+1.02);o.connect(f);f.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+1.05)}catch(e){}}

function save(){try{localStorage.setItem('equalFernwood',JSON.stringify(data))}catch(e){};updatePill()}
function load(){try{let d=JSON.parse(localStorage.getItem('equalFernwood'));if(d)data={...data,...d,xp:d.xp||0,achievements:d.achievements||[]}}catch(e){};updatePill()}
function updatePill(){if($('teamPill'))$('teamPill').textContent='🌼 '+data.members.length+' learners';if($('xpPill'))$('xpPill').textContent='⭐ '+(data.xp||0)+' XP · Lv '+(Math.floor((data.xp||0)/100)+1)}
function toast(s){let t=$('toast');t.textContent=s;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2100)}
function beep(f=620,d=.11){if(!clicks)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.12,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
document.addEventListener('click',e=>{if(e.target.closest('button'))beep(560,.07)});
function zoom(v){zoomLevel=Math.max(.75,Math.min(1.35,zoomLevel+v));$('mapview').style.transform='scale('+zoomLevel+')';$('mapview').style.transformOrigin='top center';$('zoomLabel').textContent=Math.round(zoomLevel*100)+'%'}
function openPanel(name){$('modal').classList.add('open');renderPanel(name)}
function travelTo(name){let flash=document.createElement('div');flash.className='cloud-flash';document.body.appendChild(flash);playWhoosh();setTimeout(()=>openPanel(name),620);setTimeout(()=>flash.remove(),2180)}
function closePanel(){$('modal').classList.remove('open')}
function renderPanel(name){let c=$('panelContent');if(name==='wheel')c.innerHTML=wheelHTML();if(name==='bugs')c.innerHTML=bugsHTML();if(name==='pond')c.innerHTML=pondHTML();if(name==='voice')c.innerHTML=voiceHTML();if(name==='quests')c.innerHTML=questHTML();if(name==='records')c.innerHTML=recordsHTML();if(name==='guide')c.innerHTML=guideHTML();if(name==='settings')c.innerHTML=settingsHTML();if(name==='wheel')drawWheel();if(name==='bugs')renderBugs();if(name==='pond')renderPrompt();if(name==='voice')renderVoice();if(name==='quests')renderTasks();if(name==='records')renderRecords()}
function wheelHTML(){return `<h2>🎡 The Role Spinner</h2><p class="sub">Spin, or drag the wheel yourself. A character will celebrate each new role!</p><div class="wheelrow"><div><div class="wheelbox" id="wheelBox"><div class="pointer"></div><canvas id="wheel" width="650" height="650"></canvas><div class="hub">E.Q.</div></div><div class="tabs"><button class="btn" onclick="spin()">✦ Spin</button><button class="btn soft" onclick="assignTeam()">Assign team roles</button><button class="btn soft" onclick="resetWheel()">Reset roles</button></div></div><div><div class="result" id="roleResult">Your role reveal will appear here.</div><div class="rolecards" id="roleCards">${data.assignments.length?data.assignments.map(cardHTML).join(''):'<p class="note">Assign team roles to create role cards for everyone.</p>'}</div></div></div>`}
function drawWheel(){let cv=$('wheel');if(!cv)return;let ctx=cv.getContext('2d'),r=cv.width/2,roles=wheelRoles(),n=roles.length,step=Math.PI*2/Math.max(1,n);ctx.clearRect(0,0,cv.width,cv.height);roles.forEach((role,i)=>{let a=angle*Math.PI/180+i*step-Math.PI/2;ctx.beginPath();ctx.moveTo(r,r);ctx.arc(r,r,r-12,a,a+step);ctx.closePath();ctx.fillStyle=role.color;ctx.fill();ctx.strokeStyle='#55442d';ctx.lineWidth=5;ctx.stroke();ctx.save();ctx.translate(r,r);ctx.rotate(a+step/2);ctx.textAlign='right';ctx.fillStyle='#fff9e8';ctx.font='bold 23px Georgia';ctx.shadowColor='#263d2d';ctx.shadowBlur=3;ctx.fillText(role.name.length>16?role.name.slice(0,15)+'…':role.name,r-45,8);ctx.restore()});ctx.beginPath();ctx.arc(r,r,r-12,0,Math.PI*2);ctx.strokeStyle='#7c6039';ctx.lineWidth=10;ctx.stroke()}
function wheelRoles(){return data.roles.filter(r=>!usedRoles.includes(r.name))}
function selected(){let roles=wheelRoles();if(!roles.length)return null;let step=360/roles.length;return roles[Math.floor((((360-angle%360)%360+step/2)%360)/step)%roles.length]}
function resetWheel(){usedRoles=[];angle=0;drawWheel();let rr=$('roleResult');if(rr)rr.textContent='All roles are back in the wheel!';toast('Role spinner reset.');}
function playVictory(){
 try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();let now=audio.currentTime;
 [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>{let o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(f,now+i*.105);g.gain.setValueAtTime(.0001,now+i*.105);g.gain.exponentialRampToValueAtTime(.24,now+i*.105+.025);g.gain.exponentialRampToValueAtTime(.0001,now+i*.105+.42);o.connect(g);g.connect(audio.destination);o.start(now+i*.105);o.stop(now+i*.105+.44)});
 }catch(e){beep(980,.25);setTimeout(()=>beep(1240,.25),120)}
}
function reveal(role,member='You'){if(!role)return;let result=$('roleResult');if(!result)return;result.innerHTML=`<div class="charpop"><img src="${CHARACTERS[role.char%CHARACTERS.length]}"><div><span class="note">✨ YOUR QUEST ROLE</span><br><strong>You're the ${role.name}!</strong><p class="note">${role.desc}</p><span class="pill">${member}</span></div></div>`;playVictory()}
function spin(){let roles=wheelRoles();if(!roles.length){toast('Every role has been picked! Reset to play again.');return}let start=angle,delta=1800+Math.random()*1800,t=0,lastTick=0;function frame(ts){if(!t)t=ts;let p=Math.min(1,(ts-t)/3300);angle=start+delta*(1-Math.pow(1-p,4));if(ts-lastTick>Math.max(65,230-p*170)){beep(420+Math.random()*500,.045);lastTick=ts}drawWheel();if(p<1)requestAnimationFrame(frame);else{let role=selected();if(role){usedRoles.push(role.name);reveal(role);drawWheel();$('roleResult').innerHTML+='<p class=note>✦ This role is out until you reset the spinner.</p>';playVictory()}}}requestAnimationFrame(frame)}
function resetAngle(){angle=0;drawWheel()}
function assignTeam(){let shuffled=[...wheelRoles()].sort(()=>Math.random()-.5);if(!shuffled.length)return toast('Reset the spinner before assigning roles again.');data.assignments=data.members.slice(0,shuffled.length).map((m,i)=>({member:m,role:shuffled[i]}));usedRoles.push(...shuffled.map(r=>r.name));save();let el=$('roleCards');el.innerHTML=data.assignments.map(cardHTML).join('');let first=data.assignments[0];if(first)reveal(first.role,first.member);addXP(20,'Team roles assigned');toast('Everyone has a role card!')}
function cardHTML(a){return `<div class="rolecard"><img src="${CHARACTERS[a.role.char%CHARACTERS.length]}"><div><b>${a.role.name}</b><br><span class="note">${a.member}</span><br><span class="note">${a.role.desc}</span></div></div>`}
function bugsHTML(){return `<h2>🐸 Frog & Bug Catcher</h2><p class="sub">Every learner is a little bug. Tap the frog to catch one name at a time. Caught names stay out until you reset!</p><div class="box" style="text-align:center"><div id="bugField" class="result"></div><button class="frog-button" onclick="catchBug()" aria-label="Catch a learner">🐸</button><p class="note">Tap the frog to catch a learner and reveal their teamwork role.</p><div id="bugResult" class="pixel-result">The frog is ready!</div><div id="bugTableWrap"></div><button class="btn soft" onclick="resetBugs()">Reset caught bugs & roles</button></div>`}
function renderBugs(){
 let field=$('bugField');if(!field)return;
 field.innerHTML=data.members.map((m,i)=>`<span class="game-bug ${caughtMembers.includes(i)?'caught':''}" title="${m}">${caughtMembers.includes(i)?'✓':'🐞'}</span>`).join('');
 $('bugResult').textContent=caughtMembers.length===data.members.length?'🌟 All learners have been caught! Everyone has a role.':'🐛 '+(data.members.length-caughtMembers.length)+' learners waiting';
 let wrap=$('bugTableWrap');
 if(wrap){wrap.innerHTML=bugAssignments.length?`<table class="catch-table"><thead><tr><th>#</th><th>Learner</th><th>Role received</th></tr></thead><tbody>${bugAssignments.map((a,i)=>`<tr><td>${i+1}</td><td>${escapeHTML(a.member)}</td><td><b>${escapeHTML(a.role.name)}</b><br><small>${escapeHTML(a.role.desc)}</small></td></tr>`).join('')}</tbody></table>`:'<p class="note">Caught learners and their roles will appear in this table.</p>'}
}
function catchBug(){
 let remaining=data.members.map((m,i)=>i).filter(i=>!caughtMembers.includes(i));
 if(!remaining.length){toast('Everyone has been picked! Reset to play again.');return}
 let i=remaining[Math.floor(Math.random()*remaining.length)];
 let available=data.roles.filter(r=>!usedBugRoles.includes(r.name));
 if(!available.length){toast('All roles have been assigned by the frog. Reset the bugs to start again.');return}
 let role=available[Math.floor(Math.random()*available.length)];
 if(!role){toast('Add at least one role in Settings first.');return}
 caughtMembers.push(i);usedBugRoles.push(role.name);
 bugAssignments.push({member:data.members[i],role});
 renderBugs();
 $('bugResult').innerHTML=`🐸 <b>${escapeHTML(data.members[i])}</b> caught!<br><span>Role unlocked: <strong>${escapeHTML(role.name)}</strong></span><br><small>${escapeHTML(role.desc)}</small>`;
 playVictory();addXP(10,'Learner selected');
}
function resetBugs(){caughtMembers=[];bugAssignments=[];usedBugRoles=[];renderBugs();$('bugResult').textContent='All the bugs are back. Let’s play!';}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function pondHTML(){return `<h2>🪷 Lily Pad Prompts</h2><p class="sub">Hop onto a lily pad to get a friendly question that helps everyone join the conversation.</p><div class="box" style="text-align:center"><div style="font-size:56px">🐸 🪷 🐸</div><div id="promptResult" class="pixel-result">Your next team prompt is waiting on a lily pad.</div><button class="btn" onclick="nextPrompt()">Hop to a lily pad ✦</button><p class="note">Prompts cycle without repeating until the set is complete.</p></div>`}
function renderPrompt(){if($('promptResult'))$('promptResult').textContent=promptIndex<0?'Your next team prompt is waiting on a lily pad.':prompts[promptIndex]}
function nextPrompt(){promptIndex=(promptIndex+1)%prompts.length;renderPrompt();beep(700,.12);addXP(5,'New team prompt')}
function voiceHTML(){return `<h2>🪨 Voice Pebbles</h2><p class="sub">Pass the speaking turn so everyone gets a chance to contribute.</p><div class="grid"><div class="box"><h3>Speaking circle</h3><div id="voiceCurrent" class="result">Press “Next voice” to begin.</div><button class="btn" onclick="nextVoice()">Next voice →</button> <button class="btn soft" onclick="resetVoice()">Start over</button><p class="note">Invite each person to speak once before anyone takes a second turn.</p></div><div class="box"><h3>Team members</h3><div id="voiceMembers"></div></div></div>`}
function renderVoice(){$('voiceMembers').innerHTML=data.members.map((m,i)=>`<div class="member">${i+1}. ${m} ${i<data.turn?'<span class="pill">Had a turn ✓</span>':''}</div>`).join('')}
function nextVoice(){if(data.turn>=data.members.length){$('voiceCurrent').innerHTML='🌼 Everyone has had a turn! You can begin a second round.';data.turn=0;data.achievements=data.achievements||[];if(!data.achievements.includes('everyone-spoke')){data.achievements.push('everyone-spoke');toast('🏅 Teamwork achievement: Everyone had a voice!')}save();return}let m=data.members[data.turn++];addXP(5,'Speaking turn shared');$('voiceCurrent').innerHTML=`<div class="charpop"><img src="${CHARACTERS[(data.turn+2)%CHARACTERS.length]}"><div><span class="note">IT'S YOUR TURN</span><br><strong>${m}</strong><p class="note">Share one idea, question, or helpful thought.</p></div></div>`;renderVoice();beep(760,.2)}
function resetVoice(){data.turn=0;renderVoice();$('voiceCurrent').textContent='The speaking circle is ready.'}
function questHTML(){return `<h2>📜 Team Quests</h2><p class="sub">Turn the activity into small, shared tasks.</p><div class="grid"><div class="box"><h3>Add a mini quest</h3><input id="taskText" placeholder="What needs to be done?"><select id="taskWho">${data.members.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}</select><button class="btn" onclick="addTask()">＋ Add quest</button></div><div class="box"><h3>Team progress</h3><div id="taskProgress" class="result">0% complete</div><div class="progress"><i id="taskBar"></i></div><p class="note">Try to share tasks fairly. Avoid giving all important tasks to one person.</p><h3>Forest rewards</h3><div class="reward-grid" id="rewardGrid"></div></div></div><div class="tasklist" id="taskList"></div>`}
function renderTasks(){if(!$('taskList'))return;$('taskList').innerHTML=data.tasks.map((t,i)=>`<div class="taskitem"><input type="checkbox" ${t.done?'checked':''} onchange="completeTask(${i},this.checked)"><span><b>${t.text}</b><br><small class="note">${data.members[t.owner]||'Team task'}</small></span><button class="btn soft" onclick="data.tasks.splice(${i},1);save();renderTasks()">×</button></div>`).join('')||'<p class="note">No quests yet. Add your first mini quest.</p>';let p=data.tasks.length?Math.round(data.tasks.filter(t=>t.done).length/data.tasks.length*100):0;$('taskProgress').textContent=p+'% complete';$('taskBar').style.width=p+'%';renderRewards()}
function addTask(){let t=$('taskText').value.trim();if(!t)return toast('Write a mini quest first.');data.tasks.push({text:t,owner:+$('taskWho').value,done:false});save();renderTasks()}
function completeTask(i,checked){let task=data.tasks[i];if(!task)return;let first=checked&&!task.done;task.done=checked;if(first)addXP(15,'Quest completed');else save();renderTasks()}
function recordsHTML(){return `<h2>📚 Field Journal</h2><p class="sub">Record real examples of participation. Keep notes kind and factual.</p><div class="grid"><div class="box"><h3>New observation</h3><select id="logStudent">${data.members.map((m,i)=>`<option value="${i}">${m}</option>`).join('')}</select><select id="logType"><option>Shared an idea</option><option>Completed a task</option><option>Asked a question</option><option>Listened and built on an idea</option><option>Helped a teammate</option><option>Needs another chance to contribute</option></select><textarea id="logNote" placeholder="Short evidence note..."></textarea><button class="btn" onclick="addLog()">Save note</button></div><div class="box"><h3>Participation records</h3><div id="logList" class="logs"></div><button class="btn soft" onclick="downloadCSV()">Export CSV</button></div></div>`}
function renderRecords(){if(!$('logList'))return;$('logList').innerHTML=data.logs.map(l=>`<div class="logitem"><b>${l.member}</b> · ${l.type}<p class="note">${l.note}</p></div>`).join('')||'<p class="note">Your field journal is empty.</p>'}
function addLog(){let i=+$('logStudent').value;data.logs.unshift({member:data.members[i],type:$('logType').value,note:$('logNote').value.trim(),date:new Date().toLocaleString()});$('logNote').value='';addXP(10,'Field journal entry saved');renderRecords()}
function downloadCSV(){let rows=[['Student','Contribution','Evidence','Date'],...data.logs.map(l=>[l.member,l.type,l.note,l.date])];let csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='equal-field-journal.csv';a.click()}
function guideHTML(){tutorialIndex=0;tutorialStarted=false;return `<h2>🎮 Team Guide</h2><p class="sub">Meet Raina, Lysandra, Andrew, and Khim through a little forest-game conversation.</p>
<div class="tutorial-shell" id="tutorialShell">
 <div class="tutorial-stage"><img class="tutorial-avatar" id="tutorialAvatar" alt="Team member pixel portrait" src="${TEAM_TUTORIAL[0].avatar}">
  <div><p class="tutorial-speaker" id="tutorialSpeaker">TEAM MEMBER 1 · THE GUIDE</p><p class="tutorial-dialogue" id="tutorialDialogue">Welcome to SocialSync! Let's explore how our teamwork world works.</p></div>
 </div>
 <div class="tutorial-progress"><span id="tutorialProgress"></span></div>
 <p class="tutorial-caption" id="tutorialCaption">A four-part guide · subtitles stay visible while the character speaks.</p>
 <div class="tutorial-controls"><button class="btn soft" onclick="replayTutorialVoice()">♫ Replay voice</button><button class="btn" id="tutorialNext" onclick="nextTutorialSpeaker()">Start conversation ✦</button></div>
</div>
<div class="grid" style="margin-top:12px"><div class="box"><h3>🌱 Student guide</h3><p>Listen without interrupting, invite everyone to share, and divide the work fairly.</p></div><div class="box"><h3>🧑‍🏫 Teacher guide</h3><p>Explain roles, set clear goals, support turn-taking, and review participation after activities.</p></div></div>
<p class="note">The website helps organize teamwork and participation notes. Use the activities consistently and review the results with your teacher.</p>`}
function settingsHTML(){return `<h2>🧰 Workshop</h2><p class="sub">Shape Fernwood to fit your class.</p><div class="grid"><div class="box"><h3>Group members</h3><label>Number of learners</label><div class="member-controls"><button class="btn soft" onclick="changeMemberCount(-1)">− Remove one</button><input type="number" id="memberCount" min="1" max="40" value="${data.members.length}" onchange="changeMemberCount(0)"><button class="btn soft" onclick="changeMemberCount(1)">＋ Add one</button></div><div id="memberEdit">${data.members.map((m,i)=>`<label>Member ${i+1}</label><input id="m${i}" value="${m.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`).join('')}</div><button class="btn" onclick="saveMembers()">Save group</button></div><div class="box"><h3>Role cards</h3><div id="roleEdit">${data.roles.map((r,i)=>`<div class="member"><b>${r.name}</b><br><small>${r.desc}</small></div>`).join('')}</div><p class="note">Edit roles by clicking a role below.</p><button class="btn soft" onclick="editRoles()">Edit roles</button><div id="roleForm"></div></div><div class="box"><h3>Sound settings</h3><div class="soundrow"><button class="btn" onclick="toggleMusic()" id="musicBtn2">♫ Music off</button><label>Volume</label><input type="range" min="0" max="100" value="45" id="volume" oninput="setVolume(this.value)"></div><label><input type="checkbox" id="clickToggle" checked style="width:auto" onchange="clicks=this.checked"> Click sounds</label><p class="note">Audio is generated by your browser and only starts after you press the music button.</p></div><div class="box"><h3>Data</h3><p class="note">Your group information stays in this browser on this device.</p><button class="btn soft" onclick="backup()">Download backup</button> <button class="btn soft" onclick="clearAll()">Reset data</button></div></div>`}
function changeMemberCount(delta){let el=$('memberCount');if(!el)return;el.value=Math.max(1,Math.min(40,(+el.value||data.members.length)+delta));let n=+el.value;let prior=Array.from({length:40},(_,i)=>{let x=$('m'+i);return x?x.value:(data.members[i]||'Student '+(i+1))});$('memberEdit').innerHTML=Array.from({length:n},(_,i)=>`<label>Member ${i+1}</label><input id="m${i}" value="${String(prior[i]||'Student '+(i+1)).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`).join('')}
function saveMembers(){let n=Math.max(1,Math.min(40,+$('memberCount').value||data.members.length)),arr=[];for(let i=0;i<n;i++){let el=$('m'+i);arr.push(el?el.value.trim()||'Student '+(i+1):data.members[i]||'Student '+(i+1))}data.members=arr;data.assignments=[];caughtMembers=[];save();renderPanel('settings');toast('Group updated!')}
function editRoles(){let f=$('roleForm');f.innerHTML=data.roles.map((r,i)=>`<div class="member"><label>Role name</label><input id="rn${i}" value="${r.name}"><label>Description</label><textarea id="rd${i}">${r.desc}</textarea></div>`).join('')+'<button class="btn" onclick="saveRoles()">Save roles</button>'}
function saveRoles(){data.roles=data.roles.map((r,i)=>({...r,name:$('rn'+i).value,desc:$('rd'+i).value}));save();renderPanel('settings');toast('Roles saved!')}
let musicTimer=null,musicStep=0,musicVolume=.45;
function playMusicNote(freq,duration=.42,when=0){
 if(!audio||!musicGain)return;
 let o=audio.createOscillator();
 let g=audio.createGain();
 let t=audio.currentTime+when;
 o.type='sine';
 o.frequency.setValueAtTime(freq,t);
 g.gain.setValueAtTime(.0001,t);
 g.gain.exponentialRampToValueAtTime(.03,t+.035);
 g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 o.connect(g);
 g.connect(musicGain);
 o.start(t);
 o.stop(t+duration+.03);
}

function toggleMusic(){
 try{
  audio=audio||new(window.AudioContext||window.webkitAudioContext)();
  audio.resume();

  if(!music){
   music=true;
   musicGain=audio.createGain();
   musicGain.gain.value=.65;
   musicGain.connect(audio.destination);

   const melody=[
    783.99,880,1046.50,1174.66,
    1046.50,880,987.77,1174.66,
    1318.51,1174.66,1046.50,987.77,
    880,987.77,1046.50,1318.51
   ];
   const bass=[261.63,196,220,174.61];

   musicStep=0;
   const tick=()=>{
    let i=musicStep%melody.length;
    playMusicNote(melody[i],.75,0);
    if(musicStep%4===0){
     playMusicNote(bass[(musicStep/4)%bass.length],1.8,0);
    }
    musicStep++;
   };

   tick();
   musicTimer=setInterval(tick,620);
   toast('✨ Enchanted forest music is playing ♫');
  }else{
   music=false;
   if(musicTimer)clearInterval(musicTimer);
   musicTimer=null;
   if(musicGain){musicGain.disconnect();musicGain=null}
   toast('Forest music paused');
  }

  document.querySelectorAll('#musicBtn,#musicBtn2').forEach(b=>{
   if(b)b.textContent=music?'♫ Music on':'♫ Music off';
  });
 }catch(e){
  music=false;
  toast('Tap the music button again to allow browser audio.');
 }
}
function setVolume(v){musicVolume=+v/100;if(musicGain)musicGain.gain.value=1}
function backup(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='equal-fernwood-backup.json';a.click()}
function clearAll(){if(confirm('Reset all group data in this browser?')){localStorage.removeItem('equalFernwood');data={members:['Student 1','Student 2','Student 3','Student 4','Student 5'],roles:baseRoles,tasks:[],logs:[],assignments:[],turn:0,xp:0,achievements:[]};save();renderPanel('settings')}}
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closePanel()});
function wheelPointer(e){let b=$('wheelBox'),r=b.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI}
$('panelContent').addEventListener('pointerdown',e=>{if(e.target.closest('#wheelBox')){drag=true;lastA=wheelPointer(e);e.target.closest('#wheelBox').setPointerCapture(e.pointerId)}});
$('panelContent').addEventListener('pointermove',e=>{if(!drag)return;let a=wheelPointer(e),d=a-lastA;if(d>180)d-=360;if(d< -180)d+=360;angle+=d;vel=d;lastA=a;drawWheel()});
$('panelContent').addEventListener('pointerup',()=>{if(!drag)return;drag=false;let start=angle,delta=vel*7,t=0;function coast(ts){if(!t)t=ts;let p=Math.min(1,(ts-t)/700);angle=start+delta*(1-Math.pow(1-p,3));drawWheel();if(p<1)requestAnimationFrame(coast);else reveal(selected())}requestAnimationFrame(coast)});
load();
initTeamPortraits();
function enterSocialSync() {
  const email = document.getElementById('socialEmail');

  if (!email.value.trim()) {
    alert('Please enter your SocialSync email!');
    email.focus();
    return;
  }

  if (!email.checkValidity()) {
    alert('Please enter a valid email address!');
    email.focus();
    return;
  }

  document.getElementById('welcomeScreen').style.display = 'none';
}