(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new URL(`splash-DqB0o1qD.jpg`,import.meta.url).href,t={Jump:1,AirJump:2,Dash:3,Land:4,Hit:5,Kill:6,Gem:7,LevelUp:8,PlayerHit:9,Lightning:10,Sweep:11,Explosion:12,Shoot:13,Coin:14,Heal:15,ChestOpen:16,Shrine:17,BossSpawn:18,Teleport:19,Death:20,Win:21,Evolve:22,EnemyShoot:23,Hazard:24,Revive:25,BossPhase:26,ChargeWarn:27,Magnet:28,Quake:29,Fuse:30,Zone:31,Pickup:32,Discover:33,Bonus:34,Dodge:35,ShieldHit:36,Beam:37,Secret:38,Haste:39},n=class{items=[];count=0;constructor(e=512){for(let t=0;t<e;t++)this.items.push({type:0,x:0,y:0,z:0,a:0,b:0,c:0,d:0})}emit(e,t,n,r,i=0,a=0,o=0,s=0){if(this.count>=this.items.length)return;let c=this.items[this.count++];c.type=e,c.x=t,c.y=n,c.z=r,c.a=i,c.b=a,c.c=o,c.d=s}clear(){this.count=0}},r=[0,2,3,5,7,9,10],i=146.83;function a(e,t=0){let n=r.length,a=Math.floor(e/n);return i*2**((r[(e%n+n)%n]+12*(a+t))/12)}var o=[[0,2,4],[6,8,10],[3,5,7],[0,2,4],[0,2,4],[4,6,8],[3,5,7],[6,8,10]],s=[[[0,7,3],[3,8,1],[4,9,2],[6,7,2]],[[0,11,2],[2,9,2],[4,8,4]],[[0,7,2],[2,9,1],[3,10,1],[4,11,4]],[[1,8,1],[2,7,2],[4,4,4]],[[0,4,2],[2,7,2],[4,9,2],[6,8,2]],[[0,11,3],[3,12,1],[4,14,4]],[],[[0,9,6]]],c=class{ctx=null;master=null;sfx=null;music=null;delay=null;noise=null;vol={master:.8,music:.6,sfx:.8};last={};gemCombo=0;gemLast=0;musicOn=!1;timer=null;nextTime=0;step=0;bar=0;phrase=[];droneGain=null;droneFilter=null;seed=7;intensity=.15;unlock(){if(this.ctx){this.ctx.state===`suspended`&&this.ctx.resume();return}let e=window.AudioContext??window.webkitAudioContext;if(e)try{let t=new e;this.ctx=t;let n=t.createDynamicsCompressor();n.threshold.value=-16,n.ratio.value=5,n.connect(t.destination),this.master=t.createGain(),this.master.connect(n),this.sfx=t.createGain(),this.sfx.connect(this.master),this.music=t.createGain(),this.music.connect(this.master);let r=t.createDelay(1);r.delayTime.value=.34;let i=t.createGain();i.gain.value=.36;let a=t.createBiquadFilter();a.type=`lowpass`,a.frequency.value=1800,this.delay=t.createGain(),this.delay.gain.value=.5,this.delay.connect(r),r.connect(a),a.connect(i),i.connect(r),a.connect(this.music);let o=t.createBuffer(1,t.sampleRate,t.sampleRate),s=o.getChannelData(0);for(let e=0;e<s.length;e++)s[e]=Math.random()*2-1;this.noise=o,this.applyVolumes(),this.startMusic()}catch{this.ctx=null}}setVolumes(e,t,n){this.vol={master:e,music:t,sfx:n},this.applyVolumes()}applyVolumes(){if(!this.ctx||!this.master||!this.music||!this.sfx)return;let e=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.vol.master,e,.05),this.music.gain.setTargetAtTime(this.vol.music*.55,e,.05),this.sfx.gain.setTargetAtTime(this.vol.sfx*.7,e,.05)}ok(e,t){let n=this.ctx?this.ctx.currentTime:0;return n-(this.last[e]??-10)<t?!1:(this.last[e]=n,!0)}tone(e,t,n,r,i,a=0,o,s=.004){let c=this.ctx,l=o??this.sfx;if(!c||!l)return;let u=c.currentTime+a,d=c.createOscillator(),f=c.createGain();d.type=e,d.frequency.setValueAtTime(Math.max(20,t),u),n!==t&&d.frequency.exponentialRampToValueAtTime(Math.max(20,n),u+r),f.gain.setValueAtTime(1e-4,u),f.gain.exponentialRampToValueAtTime(Math.max(2e-4,i),u+s),f.gain.exponentialRampToValueAtTime(1e-4,u+r),d.connect(f),f.connect(l),d.start(u),d.stop(u+r+.02)}hiss(e,t,n,r,i,a=0,o=1){let s=this.ctx;if(!s||!this.sfx||!this.noise)return;let c=s.currentTime+a,l=s.createBufferSource();l.buffer=this.noise,l.loop=!0,l.loopStart=Math.random()*.5;let u=s.createBiquadFilter();u.type=e,u.Q.value=o,u.frequency.setValueAtTime(Math.max(30,t),c),n!==t&&u.frequency.exponentialRampToValueAtTime(Math.max(30,n),c+r);let d=s.createGain();d.gain.setValueAtTime(1e-4,c),d.gain.exponentialRampToValueAtTime(Math.max(2e-4,i),c+.006),d.gain.exponentialRampToValueAtTime(1e-4,c+r),l.connect(u),u.connect(d),d.connect(this.sfx),l.start(c,Math.random()*.5),l.stop(c+r+.02)}handleEvents(e){if(!this.ctx)return;let t=e.events;for(let e=0;e<t.count;e++)this.onEvent(t.items[e])}onEvent(e){switch(e.type){case t.Hit:if(e.b===2)break;e.b===1?this.ok(`crit`,.06)&&(this.hiss(`bandpass`,3200,1600,.08,.28,0,2),this.tone(`square`,880,440,.07,.07)):this.ok(`hit`,.045)&&this.hiss(`bandpass`,2e3+Math.random()*600,900,.05,.2,0,1.5);break;case t.Kill:e.c>2?(this.tone(`sawtooth`,110,30,1.6,.5),this.hiss(`lowpass`,2400,80,1.8,.6)):e.b>0||e.c>1?this.ok(`bigkill`,.1)&&(this.tone(`sine`,200,50,.3,.4),this.hiss(`lowpass`,1800,200,.3,.35)):this.ok(`kill`,.055)&&(this.tone(`sine`,170+Math.random()*50,60,.11,.26),this.hiss(`highpass`,1500,3e3,.06,.08));break;case t.Gem:{if(!this.ok(`gem`,.03))break;let e=this.ctx?this.ctx.currentTime:0;this.gemCombo=e-this.gemLast<.5?Math.min(this.gemCombo+1,21):0,this.gemLast=e;let t=a(this.gemCombo,2);this.tone(`triangle`,t,t*1.01,.12,.13),this.tone(`sine`,t*2,t*2,.07,.05);break}case t.Coin:this.ok(`coin`,.05)&&(this.tone(`square`,1320,1320,.05,.07),this.tone(`square`,1760,1760,.14,.07,.05));break;case t.LevelUp:[0,2,4,7,9].forEach((e,t)=>this.tone(`triangle`,a(e,1),a(e,1),.34,.2,t*.07)),this.tone(`sine`,a(7,2),a(7,2),.7,.1,.35);break;case t.Dodge:this.ok(`dodge`,.1)&&this.hiss(`highpass`,3e3,1200,.12,.18);break;case t.ShieldHit:this.ok(`shield`,.1)&&this.tone(`triangle`,660,440,.15,.2);break;case t.PlayerHit:this.ok(`hurt`,.1)&&(this.tone(`sawtooth`,320,90,.2,.3),this.hiss(`lowpass`,1200,300,.16,.3));break;case t.Lightning:this.ok(`bolt`,.07)&&(this.hiss(`highpass`,6e3,400,.16,.38),this.hiss(`lowpass`,900,60,.55,.42,.03),this.tone(`sine`,90,35,.4,.4,.02));break;case t.Sweep:this.ok(`sweep`,.08)&&this.hiss(`bandpass`,500,2600,.16,.26,0,.8);break;case t.Shoot:if(!this.ok(`shoot${e.a}`,.09))break;e.a===1?this.hiss(`bandpass`,400,1800,.14,.16,0,1.2):e.a===2?this.tone(`triangle`,700,380,.07,.12):e.a===3?this.hiss(`highpass`,5e3,2500,.5,.14):e.a===4?this.tone(`sine`,300,520,.16,.12):this.hiss(`bandpass`,900,2400,.22,.12,0,2);break;case t.Explosion:case t.Hazard:if(this.ok(`boom`,.07)){let t=e.a>5?1.6:1;this.hiss(`lowpass`,1600,90,.36*t,.42),this.tone(`sine`,130,38,.3*t,.42)}break;case t.Jump:this.tone(`sine`,300,540,.11,.1);break;case t.AirJump:this.tone(`sine`,480,900,.13,.12),this.hiss(`highpass`,3e3,6e3,.12,.07);break;case t.Dash:this.hiss(`bandpass`,300,2400,.2,.25,0,.7);break;case t.Land:e.b>0?this.hiss(`bandpass`,1400,500,.22,.22,0,.6):this.tone(`sine`,120,55,.09,.14+e.a*.2);break;case t.Heal:case t.Pickup:this.ok(`heal`,.15)&&(this.tone(`sine`,a(4,1),a(4,1),.3,.14),this.tone(`sine`,a(7,1),a(7,1),.4,.14,.1));break;case t.ChestOpen:[0,4,7,9,11,14].forEach((e,t)=>this.tone(`triangle`,a(e,1),a(e,1),.3,.16,t*.05)),this.hiss(`highpass`,4e3,8e3,.5,.08);break;case t.Shrine:[1,2,3.01,4.2].forEach((e,t)=>this.tone(`sine`,a(0,1)*e,a(0,1)*e,1.8-t*.3,.2/(t+1)));break;case t.Evolve:[0,2,4,7,9,11,14,16].forEach((e,t)=>this.tone(`sawtooth`,a(e,0),a(e,0),.5,.1,t*.06)),this.tone(`sine`,a(14,1),a(14,1),1.2,.16,.5);break;case t.BossSpawn:this.tone(`sawtooth`,55,52,2.2,.4,0,void 0,.5),this.tone(`sawtooth`,82.5,80,2.2,.26,.1,void 0,.5),this.hiss(`lowpass`,200,900,2,.3);break;case t.BossPhase:this.tone(`sawtooth`,70,40,1.4,.5),this.hiss(`bandpass`,300,1200,1.2,.45,0,.5);break;case t.Quake:this.tone(`sine`,70,28,.6,.55),this.hiss(`lowpass`,500,60,.6,.45);break;case t.Teleport:this.tone(`sine`,1200,200,.22,.1);break;case t.EnemyShoot:this.ok(`eshoot`,.1)&&this.tone(`square`,240,520,.14,.08);break;case t.ChargeWarn:this.ok(`warn`,.2)&&this.tone(`sawtooth`,180,260,.3,.12);break;case t.Fuse:this.ok(`fuse`,.1)&&this.tone(`square`,900,1500,.4,.05);break;case t.Death:[9,7,4,2,0].forEach((e,t)=>this.tone(`sawtooth`,a(e,0),a(e,-1),.6,.2,t*.18)),this.hiss(`lowpass`,800,60,1.6,.4);break;case t.Win:[0,4,7,9,11,14,11,14,16,18].forEach((e,t)=>this.tone(`triangle`,a(e,1),a(e,1),.5,.2,t*.11));break;case t.Revive:[0,4,7,11,14].forEach((e,t)=>this.tone(`sine`,a(e,1),a(e,2),.8,.18,t*.08));break;case t.Magnet:this.tone(`sine`,200,1600,.7,.14),this.tone(`triangle`,100,800,.7,.1,.05);break;case t.Haste:[0,4,7,11,14,18].forEach((e,t)=>this.tone(`square`,a(e,1),a(e+2,1),.16,.07,t*.045)),this.hiss(`highpass`,3e3,9e3,.35,.07);break;case t.Bonus:[e.a?7:4,e.a?11:9,14].forEach((e,t)=>this.tone(`sine`,a(e,1),a(e,1),.7,.13,t*.12));break;case t.Zone:e.b===0&&this.ok(`zone`,.1)?this.hiss(`lowpass`,2400,300,.4,.25):e.b===3&&this.ok(`vortex`,.2)&&this.tone(`sine`,180,70,.5,.2);break;case t.Beam:this.ok(`beam`,.25)&&this.tone(`triangle`,880,990,.12,.05);break;case t.Secret:[7,9,11,14].forEach((e,t)=>this.tone(`sine`,a(e,1),a(e,1),.6,.14,t*.1))}}stepDist=0;heartT=0;update(e,t){if(!this.ctx)return;let n=e.player,r=Math.hypot(n.vx,n.vz);n.onGround&&r>1.5&&n.dashT<=0&&(this.stepDist+=r*t,this.stepDist>2.4&&(this.stepDist=0,n.inPuddle?this.hiss(`bandpass`,1500,600,.12,.1,0,.7):this.hiss(`lowpass`,500+Math.random()*200,200,.05,.11))),n.hp>0&&n.hp<e.stats.maxHp*.3?(this.heartT-=t,this.heartT<=0&&(this.heartT=.85,this.tone(`sine`,70,45,.14,.4),this.tone(`sine`,62,40,.16,.3,.17))):this.heartT=0}ui(e){this.ctx&&(e===`hover`?this.ok(`hover`,.04)&&this.tone(`sine`,660,700,.04,.04):e===`click`?this.tone(`triangle`,520,780,.08,.12):e===`buy`?(this.tone(`square`,990,990,.06,.08),this.tone(`square`,1480,1480,.16,.08,.06),this.tone(`triangle`,a(7,1),a(7,1),.3,.12,.1)):e===`deny`?this.tone(`sawtooth`,160,110,.18,.12):(this.tone(`triangle`,a(4,1),a(7,1),.16,.14),this.hiss(`highpass`,3e3,7e3,.12,.06)))}rand(){return this.seed=this.seed*1664525+1013904223>>>0,this.seed/4294967296}startMusic(){let e=this.ctx;if(!e||!this.music||this.musicOn)return;this.musicOn=!0;let t=e.createBiquadFilter();t.type=`lowpass`,t.frequency.value=320,t.Q.value=2;let n=e.createGain();n.gain.value=1e-4,n.gain.exponentialRampToValueAtTime(.16,e.currentTime+4);for(let[n,r]of[[i/2,-6],[i/2,7],[i/2*1.5,3],[i/4,0]]){let i=e.createOscillator();i.type=`sawtooth`,i.frequency.value=n,i.detune.value=r,i.connect(t),i.start()}let r=e.createOscillator();r.frequency.value=.07;let a=e.createGain();a.gain.value=140,r.connect(a),a.connect(t.frequency),r.start(),t.connect(n),n.connect(this.music),this.droneGain=n,this.droneFilter=t,this.nextTime=e.currentTime+.2,this.timer=setInterval(()=>this.schedule(),90)}pluck(e,t,n){let r=this.ctx;if(!r||!this.music||!this.delay)return;let i=r.createOscillator(),a=r.createOscillator(),o=r.createGain();i.type=`triangle`,a.type=`sine`,i.frequency.value=e,a.frequency.value=e*2.003,o.gain.setValueAtTime(1e-4,t),o.gain.exponentialRampToValueAtTime(n,t+.008),o.gain.exponentialRampToValueAtTime(1e-4,t+.9),i.connect(o),a.connect(o),o.connect(this.music),o.connect(this.delay),i.start(t),a.start(t),i.stop(t+1),a.stop(t+1)}flute(e,t,n,r){let i=this.ctx;if(!i||!this.music||!this.delay)return;let a=i.createOscillator(),o=i.createGain(),s=i.createOscillator(),c=i.createGain();a.type=`triangle`,a.frequency.value=e,s.frequency.value=5.2,c.gain.value=e*.008,s.connect(c),c.connect(a.frequency),o.gain.setValueAtTime(1e-4,t),o.gain.exponentialRampToValueAtTime(r,t+.09),o.gain.setValueAtTime(r,t+Math.max(.1,n-.12)),o.gain.exponentialRampToValueAtTime(1e-4,t+n+.25),a.connect(o),o.connect(this.music),o.connect(this.delay),a.start(t),s.start(t),a.stop(t+n+.3),s.stop(t+n+.3)}drum(e,t,n){let r=this.ctx;if(!r||!this.music)return;let i=r.createOscillator(),a=r.createGain();i.type=`sine`,i.frequency.setValueAtTime(n,e),i.frequency.exponentialRampToValueAtTime(n*.45,e+.18),a.gain.setValueAtTime(1e-4,e),a.gain.exponentialRampToValueAtTime(t,e+.005),a.gain.exponentialRampToValueAtTime(1e-4,e+.3),i.connect(a),a.connect(this.music),i.start(e),i.stop(e+.32)}schedule(){let e=this.ctx;if(!e)return;if(e.state!==`running`){this.nextTime=e.currentTime+.1;return}let t=this.intensity,n=60/(66+t*38)/2;for(this.nextTime<e.currentTime&&(this.nextTime=e.currentTime+.05);this.nextTime<e.currentTime+.3;){let e=this.nextTime,r=this.step;r===0&&(this.phrase=this.rand()<.2+(1-t)*.25?[]:s[Math.floor(this.rand()*s.length)]);let i=o[this.bar%o.length],c=[0,1,2,1,0,2,1,2];if(t>.55||r%2==0){let t=i[c[r]];this.pluck(a(t,r===0?-1:0),e,r===0?.16:.09)}for(let i of this.phrase)i[0]===r&&this.flute(a(i[1],0),e,i[2]*n,.075+t*.03);t>.3&&(r===0&&this.drum(e,.3+t*.2,82),r===4&&this.drum(e,.18+t*.2,110),t>.7&&(r===3||r===6)&&this.drum(e,.16,140),t>.85&&r%2==1&&this.drum(e,.08,220)),this.step=(r+1)%8,this.step===0&&this.bar++,this.nextTime+=n}this.droneFilter&&this.droneGain&&(this.droneFilter.frequency.setTargetAtTime(260+t*520,e.currentTime,1.5),this.droneGain.gain.setTargetAtTime(.13+t*.07,e.currentTime,1.5))}dispose(){this.timer&&clearInterval(this.timer),this.timer=null}},l=new Set([`Space`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`Tab`]),u=class{canvas;held=new Set;pressed=new Set;mouseDX=0;mouseDY=0;locked=!1;onKey=null;constructor(e){this.canvas=e,window.addEventListener(`keydown`,e=>{l.has(e.code)&&e.preventDefault(),e.repeat||(this.held.add(e.code),this.pressed.add(e.code),this.onKey?.(e.code))}),window.addEventListener(`keyup`,e=>{this.held.delete(e.code)}),window.addEventListener(`blur`,()=>this.held.clear()),document.addEventListener(`pointerlockchange`,()=>{this.locked=document.pointerLockElement===this.canvas}),document.addEventListener(`mousemove`,e=>{this.locked&&(this.mouseDX+=e.movementX,this.mouseDY+=e.movementY)})}down(e){return this.held.has(e)}consume(e){return this.pressed.delete(e)}clearPressed(){this.pressed.clear()}requestLock(){if(!this.locked)try{let e=this.canvas.requestPointerLock();e&&typeof e.catch==`function`&&e.catch(()=>void 0)}catch{}}exitLock(){document.pointerLockElement&&document.exitPointerLock()}},d=1/60,f=5,p=class{handlers;acc=0;last=0;raf=0;running=!1;timeScale=1;constructor(e){this.handlers=e}start(){if(this.running)return;this.running=!0,this.last=performance.now();let e=t=>{this.running&&(this.raf=requestAnimationFrame(e),this.tick(t))};this.raf=requestAnimationFrame(e)}stop(){this.running=!1,cancelAnimationFrame(this.raf)}tick(e){let t=(e-this.last)/1e3;this.last=e,t>.25&&(t=.25),this.acc+=t*this.timeScale;let n=0,r=Math.max(f,Math.ceil(f*this.timeScale));for(;this.acc>=.016666666666666666&&n<r;)this.handlers.step(d),this.acc-=d,n++;this.acc>=.016666666666666666&&(this.acc=0),this.handlers.render(this.acc/d,t)}advance(e){let t=Math.round(e/d);for(let e=0;e<t;e++)this.handlers.step(d);this.handlers.render(0,d)}},m=[{id:`wojmir`,name:`Wojmir`,title:`Młody woj`,desc:`Zbalansowany wojownik w burzowej tunice ze znakiem Peruna.`,bonus:`+10% obrażeń, +5% szybkości ruchu`,startWeapon:`sierpy`,mods:[{stat:`damage`,add:.1},{stat:`moveSpeed`,add:.05}],passive:{name:`Hart woja`,desc:`+0,6% obrażeń z każdym poziomem.`,perLevel:[{stat:`damage`,add:.006}]},look:{shirt:2766688,trim:11891790,pants:4074018,hair:4536886,skin:14723461,build:1,style:`wojmir`,outfit:`perun`}},{id:`dobroslawa`,name:`Dobrosława`,title:`Zielarka`,desc:`Zna każde ziele w borze. Jej wianek odstrasza złe moce.`,bonus:`+1 zdrowia / s, -10 zdrowia`,startWeapon:`wianek`,mods:[{stat:`regen`,add:1},{stat:`maxHp`,add:-10}],passive:{name:`Zielna mądrość`,desc:`+0,03 zdrowia / s i +1% zasięgu zbierania z każdym poziomem.`,perLevel:[{stat:`regen`,add:.03},{stat:`pickup`,add:.01}]},unlock:`survive5`,look:{shirt:15854296,trim:11740702,pants:4155962,hair:10115626,skin:15119508,build:.95,style:`dobroslawa`}},{id:`bogumil`,name:`Bogumił`,title:`Kowal`,desc:`Twardy jak kowadło, powolny jak miech. Ciupagę wykuł sam.`,bonus:`+30 zdrowia, +1 pancerza, -8% szybkości ruchu, +8% czasu odnowienia`,startWeapon:`ciupaga`,mods:[{stat:`maxHp`,add:30},{stat:`armor`,add:1},{stat:`moveSpeed`,add:-.08},{stat:`cooldown`,add:.08}],passive:{name:`Kowalska skóra`,desc:`+1 maks. zdrowia i +0,01 pancerza z każdym poziomem.`,perLevel:[{stat:`maxHp`,add:1},{stat:`armor`,add:.01}]},unlock:`kills1000`,look:{shirt:13616296,trim:6965802,pants:3813936,hair:4861984,skin:13671032,build:1.14,style:`bogumil`}},{id:`jagna`,name:`Jagna`,title:`Uczennica wiedźmy`,desc:`Uciekła z chatki na kurzej stopce. Kruki słuchają jej szeptu.`,bonus:`+20% szczęścia, +12% szansy na krytyk, -6% czasu odnowienia, -20 zdrowia`,startWeapon:`kruki`,mods:[{stat:`luck`,add:.2},{stat:`critChance`,add:.12},{stat:`cooldown`,add:-.06},{stat:`maxHp`,add:-20}],passive:{name:`Wiedźmie oko`,desc:`+0,3% szansy na krytyk z każdym poziomem.`,perLevel:[{stat:`critChance`,add:.003}]},unlock:`jaga`,look:{shirt:15393485,trim:11740702,pants:4155962,hair:2892852,skin:14858400,build:.95,style:`jagna`}},{id:`radogost`,name:`Radogost`,title:`Wędrowny kupiec`,desc:`Liczy każdy grosz. Im cięższa sakwa, tym mocniej rzuca krzemieniami.`,bonus:`+15% złota, -45 zdrowia`,startWeapon:`proca`,mods:[{stat:`goldGain`,add:.15},{stat:`maxHp`,add:-45}],passive:{name:`Pełna sakwa`,desc:`+1% obrażeń za każde 10 złota w sakiewce (do +30%); +1% złota z każdym poziomem.`,perLevel:[{stat:`goldGain`,add:.01}],power:`goldPower`},unlock:`heroRadogost`,look:{shirt:8018474,trim:14725184,pants:4864554,hair:6965808,skin:14196864,build:1.06,style:`bogumil`}},{id:`strzezymir`,name:`Strzeżymir`,title:`Goniec`,desc:`Najszybsze nogi w grodzie. Pęd zamienia w siłę ciosu.`,bonus:`+12% szybkości ruchu, -10 zdrowia`,startWeapon:`wlocznia`,mods:[{stat:`moveSpeed`,add:.12},{stat:`maxHp`,add:-10}],passive:{name:`Pęd`,desc:`Każdy 1% szybkości ruchu ponad bazę to +0,5% obrażeń; +0,2% obrażeń z każdym poziomem.`,perLevel:[{stat:`damage`,add:.002}],power:`speedPower`},unlock:`heroStrzezymir`,look:{shirt:14213320,trim:2779824,pants:3820122,hair:2760728,skin:14723461,build:.97,style:`wojmir`}},{id:`mszczuj`,name:`Mszczuj`,title:`Upiorny rycerz`,desc:`Wrócił z kurhanu i pragnie krwi. Każdy cios go leczy.`,bonus:`+3% kradzieży życia, -30 zdrowia`,startWeapon:`marzanna`,mods:[{stat:`lifesteal`,add:.03},{stat:`maxHp`,add:-30}],passive:{name:`Krew za krew`,desc:`+0,25% kradzieży życia z każdym poziomem.`,perLevel:[{stat:`lifesteal`,add:.0025}]},unlock:`heroMszczuj`,look:{shirt:2763316,trim:9050666,pants:1710626,hair:14211296,skin:13156544,build:1.02,style:`wojmir`}}],h=Object.fromEntries(m.map(e=>[e.id,e])),g=[{from:0,alive:[8,18],rate:1.4,mix:{chochlik:1}},{from:36,alive:[18,30],rate:2,mix:{chochlik:3,utopiec:1}},{from:72,alive:[30,45],rate:2.8,mix:{chochlik:3,utopiec:2,kruk:1.5}},{from:120,alive:[45,60],rate:3.2,mix:{chochlik:3,utopiec:2,kruk:2,ognik:1}},{from:170,alive:[60,75],rate:3.8,mix:{chochlik:2.5,utopiec:3,kruk:2,ognik:1.3,strzyga:1.5}},{from:215,alive:[75,90],rate:4.4,mix:{chochlik:2.5,utopiec:3,kruk:2,ognik:1.3,strzyga:2,wilkolak:1}},{from:265,alive:[90,105],rate:5,mix:{chochlik:3,utopiec:3,kruk:2,ognik:1.5,strzyga:2,wilkolak:1.5,bies:1}},{from:310,alive:[105,120],rate:6,mix:{chochlik:3,utopiec:3,kruk:2,ognik:1.5,strzyga:2,wilkolak:1.5,bies:1.2,licho:1}},{from:360,alive:[120,135],rate:7,mix:{chochlik:3,utopiec:3,kruk:2.5,ognik:2,strzyga:2.5,wilkolak:2,bies:1.5,licho:1.3}},{from:420,alive:[135,150],rate:8,mix:{chochlik:3,utopiec:3.5,kruk:2.5,ognik:2,strzyga:3,wilkolak:2.5,bies:1.8,licho:1.6}},{from:480,alive:[110,130],rate:5,mix:{chochlik:3,utopiec:2,kruk:2,strzyga:2,wilkolak:1.5,ognik:1}}],_=1.6;function v(e){return e<150||e>=480?0:e%150<30?Math.floor(e/150):0}function y(e){return v(e)>0?30-e%150:0}var b={from:480,alive:[200,250],rate:11,mix:{chochlik:3,utopiec:3.5,kruk:2.5,ognik:2,strzyga:3,wilkolak:2.5,bies:2,licho:2}},x=[{at:50,kind:`swarm`,enemy:`chochlik`,count:16,text:`Chochliki wyłażą z kniei!`},{at:100,kind:`mini`,enemy:`jaga`,text:`Baba Jaga nadlatuje w moździerzu!`},{at:200,kind:`swarm`,enemy:`kruk`,count:20,text:`Stado kruków zasłania niebo!`},{at:240,kind:`mini`,enemy:`poludnica`,text:`Południca wychodzi z mgły!`},{at:270,kind:`swarm`,enemy:`ognik`,count:18,text:`Błędne ogniki tańczą nad bagnem!`},{at:380,kind:`mini`,enemy:`jaga`,text:`Baba Jaga wraca po zemstę!`},{at:420,kind:`swarm`,enemy:`wilkolak`,count:10,text:`Wataha wilkołaków wyje do księżyca!`},{at:480,kind:`portal`,enemy:`leszy`,text:`Otworzył się portal Leszego! Znajdź go i wezwij strażnika boru [E].`}],S={from:480,alive:[150,280],rate:9,mix:{chochlik:3,utopiec:3.5,kruk:2.5,ognik:2,strzyga:3,wilkolak:2.5,bies:1.8,licho:1.6}},C=1.25;function w(e){return e<480?1:C**+(1+Math.floor((e-480)/20))}function T(e){return 1+(e/60)**1.55*.52}function E(e){return 1+e/600*1.3}function D(e){let t=0;for(let n=0;n<g.length;n++)e>=g[n].from&&(t=n);let n=g[t],r=g[t+1],i=r?r.from:n.from+120;return{phase:n,progress:Math.min(1,(e-n.from)/(i-n.from))}}function O(e){return Math.floor(4+e*5+e*e*.9)}var k=e=>`+${Math.round(e*100)}%`,A={damage:{value:.085,fmt:e=>`${k(e)} obrażeń`},attackSpeed:{value:.055,fmt:e=>`${k(e)} szybkości ataku`},area:{value:.07,fmt:e=>`${k(e)} obszaru`},duration:{value:.085,fmt:e=>`${k(e)} czasu działania`},speed:{value:.085,fmt:e=>`${k(e)} prędkości`},knockback:{value:.18,fmt:e=>`${k(e)} odrzutu`},pierce:{value:1,integer:!0,fmt:()=>`+1 przebicie`},bounces:{value:1,integer:!0,fmt:()=>`+1 odbicie`},chain:{value:1,integer:!0,fmt:()=>`+1 przeskok pioruna`}},j={orbit:[`damage`,`area`,`speed`,`duration`,`attackSpeed`,`knockback`],bolt:[`damage`,`attackSpeed`,`area`,`speed`,`duration`,`pierce`,`knockback`],lightning:[`damage`,`attackSpeed`,`area`,`chain`],sweep:[`damage`,`attackSpeed`,`area`,`knockback`],aura:[`damage`,`attackSpeed`,`area`],bounce:[`damage`,`attackSpeed`,`speed`,`bounces`,`duration`],summon:[`damage`,`attackSpeed`,`speed`],cone:[`damage`,`attackSpeed`,`area`,`duration`],lob:[`damage`,`attackSpeed`,`area`,`duration`],homing:[`damage`,`attackSpeed`,`speed`,`duration`,`pierce`],trap:[`damage`,`attackSpeed`,`area`,`duration`],trail:[`damage`,`area`,`duration`],boomerang:[`damage`,`attackSpeed`,`area`,`speed`,`knockback`],wander:[`damage`,`attackSpeed`,`area`,`duration`,`knockback`],vortex:[`damage`,`attackSpeed`,`area`,`duration`],guard:[`damage`,`attackSpeed`,`area`,`knockback`],tether:[`damage`,`attackSpeed`,`area`]},ee={common:1,rare:2,epic:3,legendary:3},M={common:1,rare:1,epic:1.1,legendary:1.3};function te(e,t){return j[e].filter(e=>!((e===`attackSpeed`||e===`duration`)&&t.cooldown<=0))}function ne(e,t){let n=A[e];return n.integer?n.value:n.value*M[t]}function re(e){return e.map(e=>A[e.stat].fmt(e.value)).join(`, `)}function ie(e,t){let n={...e},r=t.attackSpeed??0;return r>0&&n.cooldown>0&&(n.cooldown/=1+r),n.area*=1+(t.area??0),n.duration*=1+(t.duration??0),n.speed*=1+(t.speed??0),n.knockback*=1+(t.knockback??0),n.pierce+=t.pierce??0,n.bounces+=t.bounces??0,n.chain+=t.chain??0,n}var ae={damage:0,cooldown:1,count:1,area:1,speed:0,duration:0,pierce:0,knockback:0,range:18,arc:0,bounces:0,explode:0,burn:0,slow:0,chain:0},oe=.04,se=.0025,ce=.25,le=.4,ue=3.5,de=1.35,fe=[{id:`sierpy`,name:`Złote sierpy`,desc:`Sierpy krążą wokół bohatera i tną wszystko na swojej drodze.`,kind:`orbit`,color:16762432,icon:`sickle`,base:{damage:10,cooldown:2.4,count:2,area:2.7,speed:3.6,duration:3.6,knockback:3},levels:[{count:3,note:`+1 sierp`},{damage:14,area:3.1,note:`Większe obrażenia i promień`},{count:4,duration:4.6,note:`+1 sierp, dłuższy taniec`},{damage:20,speed:4.4,cooldown:1.5,note:`Szybsze i ostrzejsze sierpy`}],evolution:{passive:`pas`,into:`zniwa`}},{id:`zniwa`,name:`Żniwa Mokoszy`,desc:`Sześć sierpów bogini wiruje bez przerwy.`,kind:`orbit`,color:16769658,icon:`sickle`,base:{damage:30,cooldown:0,count:6,area:3.7,speed:5,duration:9999,knockback:4},levels:[],evolved:!0},{id:`ogien`,name:`Ogień Swarożyca`,desc:`Kule ognia lecą do najbliższego wroga.`,kind:`bolt`,color:16742954,icon:`flame`,base:{damage:15,cooldown:1.25,count:1,area:.55,speed:18,duration:1.8,range:22,knockback:2},levels:[{damage:20,note:`Większe obrażenia`},{count:2,note:`+1 kula ognia`},{explode:2.3,note:`Kule wybuchają przy trafieniu`},{damage:26,cooldown:1,burn:6,note:`Podpala wrogów, szybszy ostrzał`}],evolution:{passive:`krzesiwo`,into:`slonce`}},{id:`slonce`,name:`Krąg Swaroga`,desc:`Słoneczne kule przebijają wrogów i wybuchają żarem.`,kind:`bolt`,color:16765498,icon:`flame`,base:{damage:38,cooldown:.9,count:3,area:.8,speed:20,duration:2,range:24,knockback:3,pierce:1,explode:3.2,burn:12},levels:[],evolved:!0},{id:`grom`,name:`Grom Peruna`,desc:`Piorun uderza w losowych wrogów w zasięgu.`,kind:`lightning`,color:10473727,icon:`bolt`,base:{damage:28,cooldown:2.5,count:1,area:2.1,range:15,knockback:1},levels:[{count:2,note:`+1 piorun`},{damage:38,area:2.5,note:`Silniejszy grom, większy wybuch`},{count:3,note:`+1 piorun`},{damage:50,cooldown:2,note:`Gromy biją częściej i mocniej`}],evolution:{passive:`amulet`,into:`gniew`}},{id:`gniew`,name:`Gniew Gromowładcy`,desc:`Pioruny przeskakują między wrogami.`,kind:`lightning`,color:14085375,icon:`bolt`,base:{damage:62,cooldown:1.8,count:3,area:2.8,range:18,knockback:2,chain:2},levels:[],evolved:!0},{id:`ciupaga`,name:`Ciupaga`,desc:`Szeroki zamach przed bohaterem odrzuca wrogów.`,kind:`sweep`,color:15262416,icon:`axe`,base:{damage:22,cooldown:1.45,count:1,area:3.7,arc:2.2,knockback:8},levels:[{damage:30,note:`Większe obrażenia`},{area:4.3,arc:2.6,note:`Dłuższy i szerszy zamach`},{count:2,note:`Drugi zamach za plecy`},{damage:42,cooldown:1.15,note:`Szybsze, miażdżące ciosy`}],evolution:{passive:`tarcza`,into:`topor`}},{id:`topor`,name:`Topór Peruna`,desc:`Wirujący topór kosi wszystko dookoła.`,kind:`sweep`,color:12574975,icon:`axe`,base:{damage:68,cooldown:1,count:1,area:5.4,arc:6.2832,knockback:11},levels:[],evolved:!0},{id:`wianek`,name:`Wianek z ziół`,desc:`Zielna aura rani i spowalnia wrogów w pobliżu.`,kind:`aura`,color:8377946,icon:`wreath`,base:{damage:4,cooldown:.5,area:3.3,slow:.15},levels:[{area:3.8,note:`Większy zasięg aury`},{damage:6,note:`Większe obrażenia`},{area:4.4,slow:.25,note:`Jeszcze szersza, mocniej spowalnia`},{damage:9,cooldown:.4,note:`Aura rani częściej i mocniej`}],evolution:{passive:`miod`,into:`kwiat`}},{id:`kwiat`,name:`Kwiat Paproci`,desc:`Legendarny kwiat rozświetla polanę. Wrogowie więdną w jego blasku.`,kind:`aura`,color:16739029,icon:`wreath`,base:{damage:17,cooldown:.35,area:5.6,slow:.35},levels:[],evolved:!0},{id:`proca`,name:`Proca z krzemieniami`,desc:`Krzemienie odbijają się od wroga do wroga.`,kind:`bounce`,color:13222580,icon:`stone`,base:{damage:13,cooldown:.95,count:1,area:.4,speed:23,bounces:2,duration:2.5,range:20,knockback:2},levels:[{bounces:3,note:`+1 odbicie`},{damage:16,count:2,note:`+1 krzemień, większe obrażenia`},{bounces:5,note:`+2 odbicia`},{damage:22,cooldown:.8,note:`Szybszy, mocniejszy ostrzał`}],evolution:{passive:`sakwa`,into:`grad`}},{id:`grad`,name:`Gwiezdny Grad`,desc:`Deszcz iskrzących krzemieni rykoszetuje bez końca.`,kind:`bounce`,color:11071743,icon:`stone`,base:{damage:27,cooldown:.8,count:3,area:.5,speed:26,bounces:5,duration:3,range:22,knockback:2},levels:[],evolved:!0},{id:`kruki`,name:`Kruki Welesa`,desc:`Przyzwane kruki pikują na wrogów.`,kind:`summon`,color:9071871,icon:`raven`,base:{damage:15,cooldown:.75,count:2,speed:21,range:14,knockback:2},levels:[{count:3,note:`+1 kruk`},{damage:21,note:`Ostrzejsze dzioby`},{count:4,cooldown:.6,note:`+1 kruk, częstsze ataki`},{damage:30,speed:25,note:`Szybsze i groźniejsze kruki`}],evolution:{passive:`podkowa`,into:`stado`},unlock:`jaga`},{id:`stado`,name:`Stado Welesa`,desc:`Chmara kruków zaćmiewa niebo.`,kind:`summon`,color:12166911,icon:`raven`,base:{damage:44,cooldown:.4,count:7,speed:28,range:17,knockback:3},levels:[],evolved:!0},{id:`marzanna`,name:`Lodowy oddech Marzanny`,desc:`Stożek mrozu spowalnia i rani wrogów.`,kind:`cone`,color:10479871,icon:`frost`,base:{damage:6,cooldown:3.1,duration:1.6,area:7.5,arc:.95,slow:.4},levels:[{damage:8,note:`Większe obrażenia`},{arc:1.2,area:8.5,note:`Szerszy i dłuższy stożek`},{duration:2.2,slow:.55,note:`Dłuższy oddech, mocniejszy mróz`},{damage:11,cooldown:2.5,note:`Częstszy i ostrzejszy mróz`}],evolution:{passive:`onuce`,into:`zamiec`},unlock:`survive3`},{id:`zamiec`,name:`Zamieć Marzanny`,desc:`Śnieżna zawierucha mrozi wszystko wokół bohatera.`,kind:`cone`,color:15137535,icon:`frost`,base:{damage:15,cooldown:2.4,duration:2.6,area:8,arc:6.2832,slow:.7},levels:[],evolved:!0},{id:`wlocznia`,name:`Włócznia Świętowita`,desc:`Rzucona włócznia przebija cały szereg wrogów.`,kind:`bolt`,color:15918784,icon:`spear`,base:{damage:22,cooldown:1.5,count:1,area:.7,speed:27,duration:.9,pierce:99,range:24,knockback:4,arc:.3},levels:[{damage:29,note:`Większe obrażenia`},{count:2,note:`+1 włócznia`},{damage:38,cooldown:1.25,note:`Mocniejsze, częstsze rzuty`},{count:3,note:`+1 włócznia`}],evolution:{passive:`serce`,into:`oblicza`},unlock:`level15`},{id:`oblicza`,name:`Cztery Oblicza`,desc:`Włócznie Świętowita lecą na wszystkie strony świata.`,kind:`bolt`,color:16773552,icon:`spear`,base:{damage:46,cooldown:1.2,count:8,area:.75,speed:28,duration:1,pierce:99,range:26,knockback:5,arc:6.2832},levels:[],evolved:!0},{id:`luk`,name:`Łuk Dziewanny`,desc:`Daleka strzała w najsilniejszego wroga w zasięgu; przebija i mocniej rani bossy.`,kind:`bolt`,color:10216314,icon:`bow`,aim:`strongest`,rankBonus:.5,base:{damage:40,cooldown:1.6,count:1,area:.6,speed:40,duration:.9,pierce:8,range:30,knockback:2,arc:.12},levels:[{damage:52,note:`Większe obrażenia`},{count:2,note:`+1 strzała`},{damage:66,cooldown:1.35,note:`Mocniejsze, częstsze strzały`},{count:3,pierce:12,note:`+1 strzała, głębsze przebicie`}],evolution:{passive:`kiel`,into:`lowy`},unlock:`luk`},{id:`lowy`,name:`Łowy Dziewanny`,desc:`Salwa strzał łowczyni przeszywa cały bór; bossy krwawią podwójnie.`,kind:`bolt`,color:13170074,icon:`bow`,aim:`strongest`,rankBonus:1,base:{damage:96,cooldown:1.1,count:4,area:.7,speed:42,duration:1,pierce:20,range:34,knockback:3,arc:.2},levels:[],evolved:!0},{id:`dziegiec`,name:`Garniec dziegciu`,desc:`Rzucony garniec zostawia płonącą kałużę smoły.`,kind:`lob`,color:16751162,icon:`pot`,base:{damage:10,cooldown:2.8,count:1,area:3.1,duration:4,range:12},levels:[{area:3.6,note:`Większa kałuża`},{count:2,note:`+1 garniec`},{damage:14,duration:5,note:`Smoła pali mocniej i dłużej`},{count:3,note:`+1 garniec`}],evolution:{passive:`magnes`,into:`smola`},unlock:`kills3000`},{id:`smola`,name:`Smocza Smoła`,desc:`Kałuże smoczego ognia pokrywają polanę.`,kind:`lob`,color:16734762,icon:`pot`,base:{damage:24,cooldown:2.4,count:4,area:4.2,duration:6,range:14,slow:.3},levels:[],evolved:!0},{id:`roj`,name:`Rój pszczół`,desc:`Pszczoły same odnajdują wrogów i żądlą.`,kind:`homing`,color:16765498,icon:`bee`,base:{damage:11,cooldown:1.2,count:2,area:.45,speed:13,duration:2.6,range:13,knockback:1},levels:[{count:3,note:`+1 pszczoła`},{damage:15,note:`Ostrzejsze żądła`},{count:4,cooldown:1,note:`+1 pszczoła, częstsze wyloty`},{damage:20,pierce:1,note:`Żądła przebijają jednego wroga`}],evolution:{passive:`zielnik`,into:`barc`},unlock:`roj`},{id:`barc`,name:`Gniew Barci`,desc:`Cała barć rusza na wroga: chmara pszczół, które żądlą po kilka razy.`,kind:`homing`,color:16771466,icon:`bee`,base:{damage:30,cooldown:.75,count:7,area:.5,speed:16,duration:3.2,range:16,knockback:1,pierce:2},levels:[],evolved:!0},{id:`wnyki`,name:`Wnyki`,desc:`Żelazne wnyki leżą na ziemi i zatrzaskują się na pierwszym wrogu, raniąc i spowalniając wszystko obok.`,kind:`trap`,color:12107976,icon:`trap`,base:{damage:34,cooldown:2.4,count:1,area:2.4,duration:9,range:5,slow:.5},levels:[{damage:44,note:`Większe obrażenia`},{count:2,note:`+1 pułapka`},{area:2.9,slow:.65,note:`Szersze szczęki, mocniej spowalniają`},{damage:60,cooldown:1.9,note:`Częściej i boleśniej`}],evolution:{passive:`glog`,into:`doly`},unlock:`wnyki`},{id:`doly`,name:`Wilcze Doły`,desc:`Doły najeżone cierniami: wielkie, palące i niemal zatrzymują wrogów.`,kind:`trap`,color:10145898,icon:`trap`,base:{damage:110,cooldown:1.5,count:3,area:3.6,duration:12,range:6.5,slow:.8,burn:8},levels:[],evolved:!0},{id:`miotla`,name:`Miotła Jagi`,desc:`Za bohaterem zostaje ognisty ślad, który pali wszystko, co po nim przejdzie.`,kind:`trail`,color:16738858,icon:`broom`,base:{damage:7,cooldown:.4,area:1.7,duration:2.6},levels:[{damage:9,note:`Większe obrażenia`},{area:2.1,note:`Szerszy ślad`},{duration:3.6,note:`Ogień pali się dłużej`},{damage:13,burn:5,note:`Ślad podpala wrogów`}],evolution:{passive:`mgla`,into:`lot`},unlock:`miotla`},{id:`lot`,name:`Wiedźmi Lot`,desc:`Szeroka wstęga wiedźmiego ognia pali, podpala i spowalnia.`,kind:`trail`,color:12151551,icon:`broom`,base:{damage:26,cooldown:.3,area:3,duration:5,burn:10,slow:.25},levels:[],evolved:!0},{id:`krzywula`,name:`Krzywula`,desc:`Krzywy kij leci łukiem przez wrogów i wraca do ręki, raniąc w obie strony.`,kind:`boomerang`,color:13212250,icon:`boomerang`,base:{damage:18,cooldown:1.7,count:1,area:.9,speed:17,range:10,knockback:3},levels:[{damage:24,note:`Większe obrażenia`},{count:2,note:`+1 kij`},{damage:31,range:12,note:`Dalszy, mocniejszy rzut`},{count:3,cooldown:1.45,note:`+1 kij, częstsze rzuty`}],evolution:{passive:`strzybog`,into:`wicher`},unlock:`krzywula`,silver:25},{id:`wicher`,name:`Wicher Strzyboga`,desc:`Cztery kije niesione wiatrem tną szeroko i daleko.`,kind:`boomerang`,color:10148072,icon:`boomerang`,base:{damage:46,cooldown:1.1,count:4,area:1.2,speed:22,range:14,knockback:5},levels:[],evolved:!0},{id:`wir`,name:`Wir Pochwista`,desc:`Trąby powietrzne wędrują po polanie i rozrzucają wrogów.`,kind:`wander`,color:12577008,icon:`whirl`,base:{damage:9,cooldown:3.4,count:1,area:1.5,speed:5,duration:3.5,range:14,knockback:9},levels:[{damage:12,note:`Większe obrażenia`},{count:2,note:`+1 wir`},{area:1.9,duration:4.5,note:`Większe, trwalsze wiry`},{damage:17,cooldown:2.8,note:`Częstsze i groźniejsze wiry`}],evolution:{passive:`dzik`,into:`traba`},unlock:`wir`},{id:`traba`,name:`Trąba Pochwista`,desc:`Trzy potężne trąby powietrzne szaleją bez ustanku.`,kind:`wander`,color:15268863,icon:`whirl`,base:{damage:30,cooldown:2.4,count:3,area:2.6,speed:6,duration:6,range:16,knockback:14},levels:[],evolved:!0},{id:`studnia`,name:`Studnia Nawii`,desc:`Wir z zaświatów wciąga wrogów do środka i rani ich.`,kind:`vortex`,color:9067775,icon:`spiral`,base:{damage:7,cooldown:4.2,count:1,area:3,duration:3.5,range:12},levels:[{damage:9,note:`Większe obrażenia`},{area:3.5,note:`Szerszy wir`},{count:2,duration:4.5,note:`+1 studnia, wiry trwają dłużej`},{damage:13,cooldown:3.5,note:`Częstsze, groźniejsze wiry`}],evolution:{passive:`czarnobog`,into:`otchlan`},unlock:`studnia`},{id:`otchlan`,name:`Otchłań Nawii`,desc:`Trzy otchłanie ściągają całą hordę i mrożą ją w miejscu.`,kind:`vortex`,color:13149951,icon:`spiral`,base:{damage:26,cooldown:3,count:3,area:4.6,duration:6,range:14,slow:.3},levels:[],evolved:!0},{id:`szabla`,name:`Szabla`,desc:`Błyskawiczne cięcia dosięgają najbliższego wroga nawet z kilku kroków.`,kind:`sweep`,rule:`lunge`,color:14673646,icon:`sabre`,base:{damage:13,cooldown:.5,count:1,area:2.3,arc:1.5,range:6.5,knockback:2},levels:[{damage:17,note:`Większe obrażenia`},{count:2,note:`Podwójne cięcie`},{area:2.7,range:8,note:`Dłuższy doskok, szersze cięcie`},{damage:23,cooldown:.42,note:`Szybsze i ostrzejsze cięcia`}],evolution:{passive:`pioro`,into:`zarszabla`},unlock:`szabla`},{id:`zarszabla`,name:`Pióro Żar-ptaka`,desc:`Płonąca szabla tnie trzy razy i podpala wrogów.`,kind:`sweep`,rule:`lunge`,color:16751162,icon:`sabre`,base:{damage:38,cooldown:.36,count:3,area:3.2,arc:2,range:9.5,knockback:3,burn:9},levels:[],evolved:!0},{id:`puklerz`,name:`Puklerz`,desc:`Gdy jest gotowy, blokuje cały cios i oddaje falą uderzeniową.`,kind:`guard`,color:13148256,icon:`buckler`,base:{damage:45,cooldown:4,area:5.5,knockback:13},levels:[{damage:60,note:`Mocniejsza fala`},{cooldown:3.4,note:`Szybciej wraca do gotowości`},{area:6.5,knockback:16,note:`Szersza fala, mocniejszy odrzut`},{damage:85,cooldown:2.8,note:`Częstszy blok, miażdżąca fala`}],evolution:{passive:`grod`,into:`mur`},unlock:`puklerz`},{id:`mur`,name:`Mur Grodu`,desc:`Tarcza grodu blokuje cios za ciosem; fala powala i spowalnia całą hordę.`,kind:`guard`,color:15255696,icon:`buckler`,base:{damage:150,cooldown:1.8,area:8,knockback:20,slow:.5},levels:[],evolved:!0},{id:`wrzeciono`,name:`Wrzeciono Mokoszy`,desc:`Nić łączy bohatera z wrogiem i rani wszystko, co stoi na jej drodze.`,kind:`tether`,color:15784104,icon:`spindle`,base:{damage:6,cooldown:.3,count:1,area:.7,range:11},levels:[{damage:8,note:`Większe obrażenia`},{count:2,note:`+1 nić`},{area:.9,range:13,note:`Dłuższa, grubsza nić`},{damage:11,cooldown:.25,note:`Nić tnie częściej i mocniej`}],evolution:{passive:`mokosz`,into:`przedza`},unlock:`winDobroslawa`},{id:`przedza`,name:`Przędza Losu`,desc:`Cztery nici losu oplatają i spowalniają wrogów.`,kind:`tether`,color:16773320,icon:`spindle`,base:{damage:20,cooldown:.22,count:4,area:1.2,range:16,slow:.3},levels:[],evolved:!0},{id:`wapierz`,name:`Kieł wąpierza`,desc:`Krwawe kły lecą do wroga. Zabójstwo ma ${Math.round(oe*100)}% szans podnieść maksymalne zdrowie o 1 do końca runu (najwyżej +40).`,kind:`bolt`,rule:`fang`,color:13646410,icon:`tooth`,base:{damage:12,cooldown:.8,count:1,area:.45,speed:22,duration:1.2,range:18,knockback:1},levels:[{damage:16,note:`Większe obrażenia`},{count:2,note:`+1 kieł`},{damage:21,pierce:1,note:`Kły przebijają jednego wroga`},{damage:26,cooldown:.62,note:`Szybszy, groźniejszy ostrzał`}],evolution:{passive:`strzyga`,into:`glod`},unlock:`wapierz`},{id:`glod`,name:`Głód Strzygi`,desc:`Trzy kły strzygi przebijają wrogów; zabójstwa podnoszą zdrowie nawet o +80.`,kind:`bolt`,rule:`fang`,color:16734826,icon:`tooth`,base:{damage:40,cooldown:.5,count:3,area:.5,speed:24,duration:1.3,range:20,knockback:2,pierce:2},levels:[],evolved:!0},{id:`kostki`,name:`Kostki Welesa`,desc:`Rzucona kostka rykoszetuje; liczba oczek od 1 do 6 decyduje o obrażeniach, a szóstka dodaje trafienia krytyczne do końca runu (najwyżej +${Math.round(ce*100)}%).`,kind:`bounce`,rule:`dice`,color:15919832,icon:`dice`,base:{damage:15,cooldown:1,count:1,area:.4,speed:22,bounces:2,duration:2.5,range:19,knockback:2},levels:[{bounces:3,note:`+1 odbicie`},{count:2,note:`+1 kostka`},{damage:19,note:`Większe obrażenia`},{damage:24,cooldown:.82,note:`Szybsze, mocniejsze rzuty`}],evolution:{passive:`sokol`,into:`wyrok`},unlock:`kostki`},{id:`wyrok`,name:`Wyrok Losu`,desc:`Trzy kostki, każda rzucana dwa razy: liczy się lepszy wynik. Szóstki dają nawet +${Math.round(le*100)}% trafień krytycznych.`,kind:`bounce`,rule:`dice`,color:16769658,icon:`dice`,base:{damage:34,cooldown:.75,count:3,area:.5,speed:25,bounces:5,duration:3,range:22,knockback:2},levels:[],evolved:!0},{id:`miecz`,name:`Miecz Nawii`,desc:`Im mniej zdrowia ma bohater, tym mocniej bije: nawet +100% obrażeń tuż przed śmiercią.`,kind:`sweep`,rule:`lowHp`,color:10124543,icon:`sword`,base:{damage:20,cooldown:1.3,count:1,area:3.6,arc:2.4,knockback:6},levels:[{damage:27,note:`Większe obrażenia`},{area:4.2,note:`Dłuższe ostrze`},{count:2,note:`Drugi zamach za plecy`},{damage:36,cooldown:1.1,note:`Szybsze, cięższe ciosy`}],evolution:{passive:`serce`,into:`ostrze`},unlock:`miecz`},{id:`ostrze`,name:`Ostrze Zaświatów`,desc:`Szerokie ostrze z Nawii; rany bohatera podwajają jego gniew (do +200% obrażeń).`,kind:`sweep`,rule:`lowHp`,color:13154047,icon:`sword`,base:{damage:60,cooldown:.95,count:2,area:5,arc:3.2,knockback:8},levels:[],evolved:!0},{id:`kosisko`,name:`Kosa Południcy`,desc:`Zamach dookoła bohatera. Co 20 zabójstw kosą i po każdej pokonanej elicie następny zamach jest potrójny i szerszy.`,kind:`sweep`,rule:`reap`,color:14725184,icon:`scythe`,base:{damage:16,cooldown:1.9,count:1,area:3.9,arc:6.2832,knockback:5},levels:[{damage:21,note:`Większe obrażenia`},{area:4.5,note:`Dłuższe ostrze`},{cooldown:1.6,note:`Częstsze zamachy`},{damage:30,area:5,note:`Ostrzejsza i jeszcze dłuższa`}],evolution:{passive:`pas`,into:`zniwo`},unlock:`kosisko`},{id:`zniwo`,name:`Żniwo Południa`,desc:`Kosa w samo południe: ogromny zamach, a naładowany cios bije 4 razy mocniej.`,kind:`sweep`,rule:`reap`,color:15779936,icon:`scythe`,base:{damage:54,cooldown:1.2,count:1,area:6,arc:6.2832,knockback:7},levels:[],evolved:!0}],pe=Object.fromEntries(fe.map(e=>[e.id,e]));function me(e){return 15}function he(e){return e.levels.length+1}function ge(e,t){let n={...ae,...e.base},r=Math.min(t,he(e));for(let t=2;t<=r;t++){let r=e.levels[t-2];if(!r)break;let{note:i,...a}=r;Object.assign(n,a)}return n}var _e=Object.fromEntries(fe.filter(e=>e.evolution).map(e=>[e.evolution?.into,e.id]));function ve(e){return _e[e]??e}var ye=e=>`${Math.round(e*100)}%`,be=e=>`${+(e*100).toFixed(1)}%`,xe=e=>e.toFixed(e%1?1:0),N=20,Se=[{id:`pas`,name:`Księga Siłacza`,desc:`Zwiększa obrażenia wszystkich broni.`,icon:`belt`,color:13652026,maxLevel:N,stat:`damage`,perLevel:.1,fmt:e=>`+${ye(e)} obrażeń`},{id:`krzesiwo`,name:`Księga Krzesiwa`,desc:`Bronie atakują szybciej.`,icon:`flint`,color:16752704,maxLevel:N,stat:`attackSpeed`,perLevel:.12,fmt:e=>`+${ye(e)} szybkości ataku`},{id:`amulet`,name:`Księga Dębu`,desc:`Powiększa obszar działania broni.`,icon:`amulet`,color:10123850,maxLevel:N,stat:`area`,perLevel:.1,fmt:e=>`+${ye(e)} obszaru`},{id:`onuce`,name:`Księga Wędrowca`,desc:`Bohater biega szybciej.`,icon:`boot`,color:15130572,maxLevel:N,stat:`moveSpeed`,perLevel:.07,fmt:e=>`+${ye(e)} szybkości ruchu`},{id:`serce`,name:`Księga Tura`,desc:`Zwiększa maksymalne zdrowie.`,icon:`heart`,color:14699082,maxLevel:N,stat:`maxHp`,perLevel:20,fmt:e=>`+${Math.round(e)} maks. zdrowia`},{id:`miod`,name:`Księga Pszczół`,desc:`Powoli leczy rany.`,icon:`honey`,color:15773744,maxLevel:N,stat:`regen`,perLevel:.5,fmt:e=>`+${e.toFixed(2).replace(/0$/,``)} zdrowia / s`},{id:`magnes`,name:`Księga Bursztynu`,desc:`Przyciąga bursztyny z większej odległości.`,icon:`magnet`,color:16751146,maxLevel:N,stat:`pickup`,perLevel:.3,fmt:e=>`+${ye(e)} zasięgu zbierania`},{id:`podkowa`,name:`Księga Welesa`,desc:`Szczęście: lepsze karty i częstsze łupy.`,icon:`horseshoe`,color:12109008,maxLevel:N,stat:`luck`,perLevel:.12,fmt:e=>`+${ye(e)} szczęścia`},{id:`tarcza`,name:`Księga Lipowej Tarczy`,desc:`Pancerz zmniejsza każdy otrzymany cios.`,icon:`shield`,color:9083498,maxLevel:N,stat:`armor`,perLevel:1,fmt:e=>`+${xe(e)} pancerza`},{id:`sakwa`,name:`Księga Krzemieni`,desc:`Dodatkowy pocisk, sierp lub kruk dla każdej broni.`,icon:`pouch`,color:10516042,maxLevel:2,stat:`projectiles`,perLevel:1,fmt:()=>`+1 pocisk`,fixedRarity:`epic`},{id:`pioro`,name:`Księga Żar-ptaka`,desc:`Pozwala odbić się w powietrzu (podwójny skok).`,icon:`feather`,color:16738874,maxLevel:2,stat:`extraJumps`,perLevel:1,fmt:()=>`+1 skok w powietrzu`,fixedRarity:`rare`,unlock:`shrines3`},{id:`zielnik`,name:`Księga Zielarki`,desc:`Bursztyny dają więcej doświadczenia.`,icon:`book`,color:6991994,maxLevel:N,stat:`xpGain`,perLevel:.08,fmt:e=>`+${ye(e)} doświadczenia`},{id:`sokol`,name:`Księga Sokoła`,desc:`Sokole oko: częstsze trafienia krytyczne.`,icon:`eye`,color:15913066,maxLevel:N,stat:`critChance`,perLevel:.04,fmt:e=>`+${be(e)} szansy na krytyk`},{id:`kiel`,name:`Księga Wilczego Kła`,desc:`Trafienia krytyczne bolą bardziej.`,icon:`fang`,color:15261904,maxLevel:N,stat:`critDamage`,perLevel:.15,fmt:e=>`+${ye(e)} obrażeń krytycznych`,unlock:`bookKiel`},{id:`czarnobog`,name:`Księga Czarnoboga`,desc:`Klątwa: więcej, silniejszych i szybszych wrogów, ale też więcej doświadczenia i złota.`,icon:`skull`,color:9067216,maxLevel:N,stat:`curse`,perLevel:.08,fmt:e=>`+${ye(e)} klątwy`,unlock:`leszy`},{id:`strzyga`,name:`Księga Strzygi`,desc:`Trafienia bronią mogą leczyć (1 zdrowia; ponad 100% leczy zawsze).`,icon:`water`,color:12593210,maxLevel:N,stat:`lifesteal`,perLevel:.05,fmt:e=>`+${ye(e)} kradzieży życia`,unlock:`bookStrzyga`},{id:`glog`,name:`Księga Głogu`,desc:`Ciernie: wróg, który uderzy wręcz, sam obrywa.`,icon:`thorn`,color:6986314,maxLevel:N,stat:`thorns`,perLevel:8,fmt:e=>`+${Math.round(e)} cierni`,unlock:`bookGlog`},{id:`mgla`,name:`Księga Mgły`,desc:`Unik: szansa, że cios w ogóle nie trafi (maleje przy dużych wartościach).`,icon:`cloud`,color:11584728,maxLevel:N,stat:`evasion`,perLevel:.1,fmt:e=>`+${ye(e)} uniku`,unlock:`bookMgla`},{id:`grod`,name:`Księga Grodu`,desc:`Tarcza przyjmuje ciosy przed zdrowiem i odnawia się po chwili spokoju.`,icon:`palisade`,color:8308991,maxLevel:N,stat:`shield`,perLevel:15,fmt:e=>`+${Math.round(e)} tarczy`,unlock:`bookGrod`},{id:`mokosz`,name:`Księga Mokoszy`,desc:`Nić Mokoszy: sierpy, ogień i pociski działają dłużej.`,icon:`hourglass`,color:14191288,maxLevel:N,stat:`duration`,perLevel:.1,fmt:e=>`+${ye(e)} czasu działania`,unlock:`bookMokosz`},{id:`strzybog`,name:`Księga Strzyboga`,desc:`Wiatr niesie pociski szybciej i dalej.`,icon:`wind`,color:10148072,maxLevel:N,stat:`projectileSpeed`,perLevel:.15,fmt:e=>`+${ye(e)} szybkości pocisków`,unlock:`bookStrzybog`},{id:`dzik`,name:`Księga Dzika`,desc:`Ciosy mocniej odrzucają wrogów.`,icon:`tusk`,color:9071178,maxLevel:N,stat:`knockback`,perLevel:.25,fmt:e=>`+${ye(e)} odrzutu`,unlock:`bookDzik`}],Ce=Object.fromEntries(Se.map(e=>[e.id,e])),we=[`common`,`rare`,`epic`,`legendary`],P={common:{id:`common`,name:`Zwykła`,color:`#b9b2a3`,weight:60,luckScale:0,power:1},rare:{id:`rare`,name:`Rzadka`,color:`#4f9dff`,weight:27,luckScale:1,power:1.3},epic:{id:`epic`,name:`Epicka`,color:`#b45cff`,weight:10,luckScale:2,power:1.7},legendary:{id:`legendary`,name:`Legendarna`,color:`#ffb338`,weight:3,luckScale:3,power:2.3}};function Te(e){let t=Math.max(0,e);return we.map(e=>P[e].weight*(1+P[e].luckScale*t))}function Ee(e,t){let n=e.weighted(Te(t));return we[Math.max(0,n)]}var De=[{id:`rog`,name:`Róg tura`,desc:`+8% obrażeń.`,icon:`horn`,color:14205066,rarity:`common`,mods:[{stat:`damage`,add:.08}]},{id:`kolpak`,name:`Żelazny kołpak`,desc:`+1 pancerza.`,icon:`helmet`,color:10134700,rarity:`common`,mods:[{stat:`armor`,add:1}]},{id:`plaster`,name:`Plaster miodu`,desc:`+0,4 zdrowia / s.`,icon:`honeycomb`,color:15773744,rarity:`common`,mods:[{stat:`regen`,add:.4}]},{id:`rozaniec`,name:`Bursztynowy sznur`,desc:`+10% doświadczenia.`,icon:`beads`,color:16751146,rarity:`common`,mods:[{stat:`xpGain`,add:.1}]},{id:`pazur`,name:`Pazur rysia`,desc:`+5% szansy na krytyk, +15% obrażeń krytycznych.`,icon:`claw`,color:15259824,rarity:`rare`,mods:[{stat:`critChance`,add:.05},{stat:`critDamage`,add:.15}]},{id:`skora`,name:`Wilcza skóra`,desc:`+10% uniku, +4% szybkości ruchu.`,icon:`pelt`,color:9075306,rarity:`rare`,mods:[{stat:`evasion`,add:.1},{stat:`moveSpeed`,add:.04}]},{id:`czara`,name:`Czara Mokoszy`,desc:`+40 maks. zdrowia, +8% kradzieży życia.`,icon:`cup`,color:12593210,rarity:`epic`,mods:[{stat:`maxHp`,add:40},{stat:`lifesteal`,add:.08}]},{id:`krzemien`,name:`Krzemień iskrzący`,desc:`Trafienie bronią ma 6% szansy na wybuch (50% obrażeń ciosu wokół celu).`,icon:`flint`,color:16752704,rarity:`common`,effect:`sparkFlint`},{id:`sakiewka`,name:`Sakiewka wędrowca`,desc:`+1 złota za każde 30 m marszu.`,icon:`pouch`,color:13148240,rarity:`common`,effect:`travelPurse`},{id:`kamien`,name:`Kamień Peruna`,desc:`Trafienie bronią ma 8% szansy na piorun (80% obrażeń ciosu w małym kręgu).`,icon:`bolt`,color:10473727,rarity:`rare`,effect:`perunStone`},{id:`mech`,name:`Mech pustelnika`,desc:`Stojąc w miejscu, w ciągu sekundy zyskujesz do +30% obrażeń.`,icon:`moss`,color:6986314,rarity:`rare`,effect:`hermitMoss`},{id:`lapcie`,name:`Skrzydlate łapcie`,desc:`Szybkość ruchu ponad bazę dodaje się w 60% do szybkości ataku.`,icon:`boot`,color:15130572,rarity:`rare`,effect:`wingedShoes`,unlock:`itemLapcie`,silver:20},{id:`lustro`,name:`Lustro wiedźmy`,desc:`Po otrzymaniu ciosu jesteś nietykalny o 0,25 s dłużej.`,icon:`mirror`,color:11584728,rarity:`rare`,effect:`witchMirror`,unlock:`itemLustro`,silver:15},{id:`czaszka`,name:`Czaszka upiora`,desc:`Każde zabójstwo: +0,05% obrażeń na stałe, do +40%.`,icon:`skull`,color:13687008,rarity:`epic`,effect:`wraithSkull`},{id:`dzban`,name:`Dzban kowala`,desc:`Podnosi najwyższy poziom broni: pierwszy o 5, kolejne o 2.`,icon:`pot`,color:10516042,rarity:`epic`,effect:`smithJug`,unlock:`itemDzban`,silver:30},{id:`kowadlo`,name:`Kowadło Swaroga`,desc:`Każda karta broni losuje o jedną linię statów więcej.`,icon:`anvil`,color:16747066,rarity:`legendary`,effect:`swarogAnvil`,unlock:`itemKowadlo`,silver:40},{id:`kosa`,name:`Kosa Marzanny`,desc:`Trafienie bronią ma 0,5% szansy, by od razu zabić zwykłego wroga.`,icon:`sickle`,color:12116223,rarity:`legendary`,effect:`marzannaScythe`,unlock:`itemKosa`,silver:40}],F=Object.fromEntries(De.map(e=>[e.id,e])),Oe=.5,I=2.5,L=.8,ke=5e-4,Ae=.4,je=.3,Me=.6,Ne=.25;function Pe(e){return e<=0?0:5+2*(e-1)}var R=Math.PI*2;function Fe(e,t,n){return e<t?t:e>n?n:e}function Ie(e,t,n){return e+(t-e)*n}function Le(e,t,n){let r=Fe((n-e)/(t-e),0,1);return r*r*(3-2*r)}function Re(e,t,n,r){return Ie(e,t,1-Math.exp(-n*r))}function ze(e){return e=(e+Math.PI)%R,e<0&&(e+=R),e-Math.PI}function Be(e,t,n){return e+ze(t-e)*n}function Ve(e,t){let n=(e|0)*374761393+(t|0)*668265263;return n=(n^n>>>13)*1274126177,n^=n>>>16,(n>>>0)/4294967296}function He(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=i*i*(3-2*i),s=a*a*(3-2*a),c=Ve(n,r),l=Ve(n+1,r),u=Ve(n,r+1),d=Ve(n+1,r+1);return Ie(Ie(c,l,o),Ie(u,d,o),s)}function Ue(e,t,n=3){let r=.5,i=0,a=0;for(let o=0;o<n;o++)i+=He(e,t)*r,a+=r,e=e*2.03+17.1,t=t*2.03+9.7,r*=.5;return i/a}var We={maxHp:100,regen:.25,armor:0,moveSpeed:1,damage:1,cooldown:1,attackSpeed:1,area:1,pickup:1,xpGain:1,goldGain:1,projectiles:0,luck:0,critChance:.05,critDamage:2,duration:1,projectileSpeed:1,knockback:1,lifesteal:0,thorns:0,evasion:0,shield:0,curse:0,silverGain:1,extraJumps:0,revives:0,rerolls:0,burn:0},Ge=e=>`${Math.round(e*100)}%`,Ke=[{id:`sila`,name:`Kuźnia`,desc:`Obrażenia wszystkich broni.`,icon:`belt`,stat:`damage`,perLevel:.06,maxLevel:5,baseCost:40,costMul:1.6,fmt:e=>`+${Ge(e)} obrażeń`},{id:`zdrowie`,name:`Spiżarnia`,desc:`Maksymalne zdrowie.`,icon:`heart`,stat:`maxHp`,perLevel:12,maxLevel:5,baseCost:30,costMul:1.55,fmt:e=>`+${Math.round(e)} zdrowia`},{id:`szybkosc`,name:`Wydeptana ścieżka`,desc:`Szybkość ruchu.`,icon:`boot`,stat:`moveSpeed`,perLevel:.03,maxLevel:5,baseCost:40,costMul:1.55,fmt:e=>`+${Ge(e)} szybkości`},{id:`pancerz`,name:`Kożuch`,desc:`Pancerz zmniejsza każde otrzymane obrażenia.`,icon:`shield`,stat:`armor`,perLevel:1,maxLevel:3,baseCost:110,costMul:2,fmt:e=>`+${Math.round(e)} pancerza`},{id:`regeneracja`,name:`Piec chlebowy`,desc:`Regeneracja zdrowia.`,icon:`honey`,stat:`regen`,perLevel:.2,maxLevel:5,baseCost:50,costMul:1.6,fmt:e=>`+${e.toFixed(1)} zdrowia / s`},{id:`magnes`,name:`Bursztynowa skrzynia`,desc:`Zasięg zbierania.`,icon:`magnet`,stat:`pickup`,perLevel:.12,maxLevel:5,baseCost:30,costMul:1.5,fmt:e=>`+${Ge(e)} zasięgu`},{id:`szczescie`,name:`Ołtarzyk Welesa`,desc:`Szczęście: lepsze karty i łupy.`,icon:`horseshoe`,stat:`luck`,perLevel:.06,maxLevel:5,baseCost:60,costMul:1.6,fmt:e=>`+${Ge(e)} szczęścia`},{id:`chciwosc`,name:`Garniec na monety`,desc:`Więcej złota z każdego runu.`,icon:`coin`,stat:`goldGain`,perLevel:.12,maxLevel:5,baseCost:50,costMul:1.6,fmt:e=>`+${Ge(e)} złota`},{id:`madrosc`,name:`Opowieści dziada`,desc:`Więcej doświadczenia z bursztynów.`,icon:`book`,stat:`xpGain`,perLevel:.05,maxLevel:5,baseCost:60,costMul:1.6,fmt:e=>`+${Ge(e)} doświadczenia`},{id:`tempo`,name:`Osełka`,desc:`Krótszy czas odnowienia broni.`,icon:`flint`,stat:`cooldown`,perLevel:-.03,maxLevel:5,baseCost:80,costMul:1.65,fmt:e=>`-${Ge(-e)} odnowienia`},{id:`obszar`,name:`Święty dąb`,desc:`Większy obszar działania broni.`,icon:`amulet`,stat:`area`,perLevel:.04,maxLevel:5,baseCost:60,costMul:1.6,fmt:e=>`+${Ge(e)} obszaru`},{id:`przelosowanie`,name:`Kości wróżebne`,desc:`Przelosowania kart przy awansie.`,icon:`dice`,stat:`rerolls`,perLevel:1,maxLevel:3,baseCost:90,costMul:1.8,fmt:e=>`+${Math.round(e)} przelosowanie`},{id:`srebrnik`,name:`Srebrna skrzynka`,desc:`Więcej srebra z każdego runu.`,icon:`coin`,stat:`silverGain`,perLevel:.15,maxLevel:5,baseCost:70,costMul:1.6,fmt:e=>`+${Ge(e)} srebra`},{id:`odrodzenie`,name:`Żywa woda`,desc:`Raz na run wskrzesza bohatera z połową zdrowia.`,icon:`water`,stat:`revives`,perLevel:1,maxLevel:1,baseCost:450,costMul:1,fmt:()=>`+1 wskrzeszenie`}],qe=Object.fromEntries(Ke.map(e=>[e.id,e]));function Je(e,t){return Math.round(e.baseCost*e.costMul**+t)}var Ye=.5,Xe={moveSpeed:2.2,attackSpeed:5};function Ze(e,t){let n=Xe[t];return n!==void 0&&e[t]>=n-1e-9}function Qe(e,t,n,r,i=[],a=1){let o={...We};if(e){for(let t of e.mods)o[t.stat]+=t.add;let t=Math.max(0,a-1);for(let n of e.passive.perLevel)o[n.stat]+=n.add*t}for(let e of Ke){let n=t[e.id]??0;n>0&&(o[e.stat]+=e.perLevel*Math.min(n,e.maxLevel))}for(let e of n)if(o[e.def.stat]+=e.def.perLevel*e.power,e.def.also)for(let t of e.def.also)o[t.stat]+=t.add*e.power;for(let e of r)for(let t of e.mods)o[t.stat]+=t.add;let s=0;for(let e of i){if(e.def.mods)for(let t of e.def.mods)o[t.stat]+=t.add*e.count;e.def.effect===`wingedShoes`&&(s+=e.count)}return o.cooldown=Fe(o.cooldown,.35,2),o.moveSpeed=Fe(o.moveSpeed,.5,Xe.moveSpeed),e?.passive.power===`speedPower`&&(o.damage+=Ye*Math.max(0,o.moveSpeed-1)),s>0&&(o.attackSpeed+=Me*s*Math.max(0,o.moveSpeed-1)),o.attackSpeed=Fe(o.attackSpeed,.25,Xe.attackSpeed),o.maxHp=Math.max(20,Math.round(o.maxHp)),o.area=Math.max(.5,o.area),o.damage=Math.max(.1,o.damage),o.critChance=Math.max(0,o.critChance),o.critDamage=Math.max(1,o.critDamage),o.duration=Math.max(.3,o.duration),o.projectileSpeed=Math.max(.3,o.projectileSpeed),o.knockback=Math.max(0,o.knockback),o.lifesteal=Math.max(0,o.lifesteal),o.thorns=Math.max(0,o.thorns),o.evasion=Math.max(0,o.evasion),o.shield=Math.max(0,o.shield),o.curse=Math.max(0,o.curse),o.silverGain=Math.max(0,o.silverGain),o}function $e(e){return e.cooldown/e.attackSpeed}function et(e,t){let n=Math.floor(e);return n+ +(t<e-n)}function tt(e,t){return 1+(t-1)*e}function nt(e,t){return Math.max(1,e-t)}function rt(e){return e>0?e/(1+e):0}function it(e,t){return et(e,t)}var at=.5;function ot(e,t){let n=Math.min(e,t);return{shield:e-n,through:t-n}}function st(e){let t=Math.max(0,e);return{enemyHp:1+t,enemyDamage:1+t*.5,enemySpeed:1+t*.25,enemyCount:1+t,reward:1+t}}var ct=[{id:`chochlik`,name:`Chochlik`,ai:`chase`,hp:9,speed:4.5,damage:5,radius:.42,height:1.1,xp:1,weight:0,scale:1},{id:`utopiec`,name:`Utopiec`,ai:`chase`,hp:34,speed:2.4,damage:10,radius:.66,height:1.9,xp:3,weight:.5,scale:1},{id:`kruk`,name:`Kruk`,ai:`fly`,hp:12,speed:5.6,damage:7,radius:.45,height:1,xp:2,weight:0,flying:!0,scale:1},{id:`ognik`,name:`Błędny ognik`,ai:`kamikaze`,hp:8,speed:6.4,damage:18,radius:.4,height:1,xp:2,weight:0,flying:!0,scale:1},{id:`strzyga`,name:`Strzyga`,ai:`leaper`,hp:42,speed:3.6,damage:14,radius:.5,height:1.7,xp:4,weight:.2,scale:1},{id:`wilkolak`,name:`Wilkołak`,ai:`charger`,hp:72,speed:3.4,damage:18,radius:.72,height:1.5,xp:6,weight:.6,scale:1},{id:`bies`,name:`Bies`,ai:`ranged`,hp:56,speed:2.9,damage:13,radius:.6,height:2,xp:6,weight:.4,scale:1},{id:`licho`,name:`Licho`,ai:`teleporter`,hp:60,speed:3,damage:16,radius:.5,height:2.1,xp:7,weight:.3,scale:1},{id:`jaga`,name:`Baba Jaga`,ai:`jaga`,hp:850,speed:5,damage:11,radius:1.2,height:2.6,xp:60,weight:.95,flying:!0,rank:`mini`,scale:1},{id:`poludnica`,name:`Południca`,ai:`poludnica`,hp:1300,speed:4.1,damage:12,radius:.9,height:2.7,xp:100,weight:.95,rank:`mini`,scale:1},{id:`leszy`,name:`Leszy`,ai:`leszy`,hp:15e3,speed:2.7,damage:22,radius:2.6,height:9,xp:0,weight:1,rank:`boss`,scale:1}],lt=Object.fromEntries(ct.map((e,t)=>[e.id,t])),ut=class{capacity;stack;top=0;hi=0;count=0;constructor(e){this.capacity=e,this.stack=new Int32Array(e)}alloc(){return this.top>0?(this.count++,this.stack[--this.top]):this.hi>=this.capacity?-1:(this.count++,this.hi++)}free(e){this.stack[this.top++]=e,this.count--}reset(){this.top=0,this.hi=0,this.count=0}},dt=class{list=new ut(800);alive=new Uint8Array(800);type=new Uint8Array(800);elite=new Uint8Array(800);state=new Uint8Array(800);phase=new Uint8Array(800);x=new Float32Array(800);y=new Float32Array(800);z=new Float32Array(800);px=new Float32Array(800);py=new Float32Array(800);pz=new Float32Array(800);vx=new Float32Array(800);vz=new Float32Array(800);yaw=new Float32Array(800);hp=new Float32Array(800);maxHp=new Float32Array(800);speed=new Float32Array(800);dmg=new Float32Array(800);radius=new Float32Array(800);flash=new Float32Array(800);slowT=new Float32Array(800);slowK=new Float32Array(800);burnT=new Float32Array(800);burnDps=new Float32Array(800);burnAcc=new Float32Array(800);killSrc=new Int8Array(800);burnSrc=new Int8Array(800);atk=new Float32Array(800);spawnT=new Float32Array(800);t1=new Float32Array(800);t2=new Float32Array(800);t3=new Float32Array(800);ax=new Float32Array(800);az=new Float32Array(800);oy=new Float32Array(800);hitT=new Float32Array(6400);get n(){return this.list.hi}get count(){return this.list.count}alloc(){let e=this.list.alloc();return e<0?-1:(this.alive[e]=1,this.elite[e]=0,this.state[e]=0,this.phase[e]=1,this.vx[e]=0,this.vz[e]=0,this.yaw[e]=0,this.flash[e]=0,this.slowT[e]=0,this.slowK[e]=0,this.burnT[e]=0,this.burnDps[e]=0,this.burnAcc[e]=0,this.killSrc[e]=-1,this.burnSrc[e]=-1,this.atk[e]=0,this.spawnT[e]=.5,this.t1[e]=0,this.t2[e]=0,this.t3[e]=0,this.ax[e]=0,this.az[e]=0,this.oy[e]=0,this.hitT.fill(-10,e*8,(e+1)*8),e)}free(e){this.alive[e]&&(this.alive[e]=0,this.list.free(e))}},ft=1400,pt=class{list=new ut(ft);alive=new Uint8Array(ft);mag=new Uint8Array(ft);x=new Float32Array(ft);y=new Float32Array(ft);z=new Float32Array(ft);val=new Float32Array(ft);age=new Float32Array(ft);cursor=0;get n(){return this.list.hi}spawn(e,t,n,r){let i=this.list.alloc();if(i<0){for(let e=0;e<ft;e++)if(this.cursor=(this.cursor+1)%ft,this.alive[this.cursor]&&!this.mag[this.cursor]){this.val[this.cursor]=this.val[this.cursor]+r;return}}else this.alive[i]=1,this.mag[i]=0,this.x[i]=e,this.y[i]=t,this.z[i]=n,this.val[i]=r,this.age[i]=0}free(e){this.alive[e]=0,this.list.free(e)}},z={Coin:0,Bread:1,Honey:2,Magnet:3,Haste:4},mt=class{list=new ut(256);alive=new Uint8Array(256);kind=new Uint8Array(256);mag=new Uint8Array(256);x=new Float32Array(256);y=new Float32Array(256);z=new Float32Array(256);val=new Float32Array(256);age=new Float32Array(256);get n(){return this.list.hi}spawn(e,t,n,r,i){let a=this.list.alloc();return a<0?-1:(this.alive[a]=1,this.kind[a]=e,this.mag[a]=0,this.x[a]=t,this.y[a]=n,this.z[a]=r,this.val[a]=i,this.age[a]=0,a)}free(e){this.alive[e]=0,this.list.free(e)}},ht={Bolt:0,Bounce:1,Lob:2,Homing:3,Boomerang:4,Twister:5},gt=class{list=new ut(256);alive=new Uint8Array(256);kind=new Uint8Array(256);slot=new Uint8Array(256);x=new Float32Array(256);y=new Float32Array(256);z=new Float32Array(256);px=new Float32Array(256);py=new Float32Array(256);pz=new Float32Array(256);vx=new Float32Array(256);vz=new Float32Array(256);life=new Float32Array(256);span=new Float32Array(256);sx=new Float32Array(256);sy=new Float32Array(256);sz=new Float32Array(256);dmg=new Float32Array(256);radius=new Float32Array(256);left=new Int16Array(256);last=new Int16Array(256);get n(){return this.list.hi}alloc(){let e=this.list.alloc();return e>=0&&(this.alive[e]=1,this.last[e]=-1),e}free(e){this.alive[e]=0,this.list.free(e)}},_t={Tar:0,Fire:1,Trap:2,Vortex:3},vt=class{list=new ut(96);alive=new Uint8Array(96);slot=new Uint8Array(96);kind=new Uint8Array(96);x=new Float32Array(96);y=new Float32Array(96);z=new Float32Array(96);r=new Float32Array(96);life=new Float32Array(96);span=new Float32Array(96);tick=new Float32Array(96);dmg=new Float32Array(96);get n(){return this.list.hi}free(e){this.alive[e]=0,this.list.free(e)}},yt=class{list=new ut(96);alive=new Uint8Array(96);air=new Uint8Array(96);x=new Float32Array(96);y=new Float32Array(96);z=new Float32Array(96);r=new Float32Array(96);t=new Float32Array(96);delay=new Float32Array(96);dmg=new Float32Array(96);get n(){return this.list.hi}free(e){this.alive[e]=0,this.list.free(e)}},bt=class{list=new ut(96);alive=new Uint8Array(96);x=new Float32Array(96);y=new Float32Array(96);z=new Float32Array(96);px=new Float32Array(96);py=new Float32Array(96);pz=new Float32Array(96);vx=new Float32Array(96);vz=new Float32Array(96);life=new Float32Array(96);dmg=new Float32Array(96);get n(){return this.list.hi}free(e){this.alive[e]=0,this.list.free(e)}},xt=new Int32Array(32);function St(e){return e===`summon`?.15:e===`guard`?.5:.12}var Ct=6,wt=6,Tt=7,Et=12,Dt=.4,Ot=.5,kt=4,At=.5,jt=.45,Mt=1.6,Nt=30,Pt=.6,Ft=.95;function It(e,t,n,r,i,a,o,s,c){let l=e.projectiles,u=l.alloc();if(u<0)return-1;let d=e.player;return l.kind[u]=t,l.slot[u]=n.slot,l.x[u]=d.x+Math.sin(r)*.6,l.z[u]=d.z+Math.cos(r)*.6,l.y[u]=d.y+1.1,l.px[u]=l.x[u],l.py[u]=l.y[u],l.pz[u]=l.z[u],l.vx[u]=Math.sin(r)*a,l.vz[u]=Math.cos(r)*a,l.life[u]=o,l.dmg[u]=i,l.radius[u]=s,l.left[u]=c,u}function Lt(e,n,r,i,a,o=e.player.x,s=e.player.z){let c=e.player,l=e.enemies,u=n.stats,d=u.arc/2,f=e.collect(o,s,a);for(let t=0;t<f;t++){let a=e.bufA[t],c=l.x[a]-o,f=l.z[a]-s,p=Math.hypot(c,f);if(p>1.3&&d<3.1&&Math.abs(ze(Math.atan2(c,f)-r))>d)continue;let m=p>.001?1/p:0;e.damageEnemy(a,i,n.slot,c*m,f*m,u.knockback,u)}e.events.emit(t.Sweep,o,(o===c.x&&s===c.z?c.y:e.map.heightAt(o,s))+.9,s,r,u.arc,a,n.def.color)}function Rt(e,t,n,r,i,a,o,s){let c=e.enemies,l=i-n,u=a-r,d=l*l+u*u||1,f=e.collect((n+i)/2,(r+a)/2,Math.sqrt(d)/2+o);for(let i=0;i<f;i++){let a=e.bufA[i],f=c.x[a]-n,p=c.z[a]-r,m=Math.min(1,Math.max(0,(f*l+p*u)/d)),h=f-l*m,g=p-u*m,_=o+c.radius[a];h*h+g*g<=_*_&&e.damageEnemy(a,s,t.slot,0,0,0,t.stats)}}function zt(e,t,n){let r=e.zones,i=0;for(let e=0;e<r.n;e++)r.alive[e]&&r.slot[e]===t&&r.kind[e]===n&&i++;return i}function Bt(e,t,n,r,i){let a=e.player,o=e.enemies,s=t.stats,c=t.ravens;for(;c.length<n;)c.push({x:a.x,y:a.y+2.5,z:a.z,px:a.x,py:a.y+2.5,pz:a.z,yaw:0,state:0,target:-1,cd:.3+c.length*.2,phase:c.length*2.1});c.length>n&&(c.length=n);let l=Math.max(St(`summon`),s.cooldown*$e(e.stats));for(let n=0;n<c.length;n++){let u=c[n];u.px=u.x,u.py=u.y,u.pz=u.z;let d=e.time*1.7+u.phase,f=a.x+Math.cos(d)*2.1,p=a.y+2.7+Math.sin(d*1.3)*.3,m=a.z+Math.sin(d)*2.1,h=f,g=p,_=m,v=s.speed;if(u.state===0){if(u.cd-=i,u.cd<=0){let t=e.randomInRange(a.x,a.z,s.range);t>=0?(u.target=t,u.state=1):u.cd=.25}v=12}else if(u.state===1){let n=u.target;if(n<0||!o.alive[n])u.state=0,u.cd=.15;else if(h=o.x[n],g=o.y[n]+o.oy[n]+.8,_=o.z[n],Math.hypot(h-u.x,g-u.y,_-u.z)<.9+o.radius[n]){let i=h-a.x,o=_-a.z,c=Math.hypot(i,o)||1;e.damageEnemy(n,r,t.slot,i/c,o/c,s.knockback,s),u.state=2}}else Math.hypot(f-u.x,p-u.y,m-u.z)<1.6&&(u.state=0,u.cd=l);let y=h-u.x,b=g-u.y,x=_-u.z,S=Math.hypot(y,b,x),C=v*i;S<=C||S<.001?(u.x=h,u.y=g,u.z=_):(u.x+=y/S*C,u.y+=b/S*C,u.z+=x/S*C,u.yaw=Math.atan2(y,x))}}function Vt(e,n){let r=e.player,i=e.enemies,a=e.stats,o=Math.floor(a.projectiles+1e-6);for(let s=0;s<e.weapons.length;s++){let c=e.weapons[s],l=c.stats,u=l.damage*(1+c.bonus)*a.damage,d=Math.max(St(c.def.kind),l.cooldown*$e(a)),f=l.area*a.area,p=l.duration*a.duration,m=l.speed*a.projectileSpeed,h=c.slot;switch(c.def.kind){case`orbit`:{let a=l.count+o;if(c.fxCount=a,c.fxArea=f,l.cooldown<=0?c.active=1:c.active>0?(c.active-=n,c.active<=0&&(c.timer=d)):(c.timer-=n,c.timer<=0&&(c.active=p,c.span=p,e.events.emit(t.Shoot,r.x,r.y,r.z,0))),c.active>0){c.angle+=l.speed*n;let t=e.collect(r.x,r.z,f+Ft);for(let n=0;n<t;n++){let t=e.bufA[n],o=t*8+h;if(e.time-i.hitT[o]<.45)continue;let s=i.x[t]-r.x,d=i.z[t]-r.z,p=Ft+i.radius[t],m=!1;for(let e=0;e<a&&!m;e++){let t=c.angle+e*R/a,n=Math.sin(t),r=Math.cos(t),i=Math.min(f,Math.max(0,s*n+d*r)),o=s-n*i,l=d-r*i;m=o*o+l*l<=p*p}if(!m)continue;i.hitT[o]=e.time;let g=Math.hypot(s,d)||1;e.damageEnemy(t,u,h,s/g,d/g,l.knockback,l)}}break}case`bolt`:if(c.timer-=n,c.timer<=0){let n=c.def.aim===`strongest`?e.strongest(r.x,r.z,l.range):e.nearest(r.x,r.z,l.range);if(n<0){c.timer=.15;break}c.timer=d;let s=l.count+o,f=Math.atan2(i.x[n]-r.x,i.z[n]-r.z),h=l.arc>6,g=h?R/s:s>1?(l.arc>0?l.arc:.32)/(s-1):0;for(let t=0;t<s;t++){let n=h?f+t*g:f+(t-(s-1)/2)*g;It(e,ht.Bolt,c,n,u,m,p,l.area*Math.sqrt(a.area),l.pierce)}e.events.emit(t.Shoot,r.x,r.y,r.z,1)}break;case`lightning`:if(c.timer-=n,c.timer<=0){let n=e.collect(r.x,r.z,l.range*Math.sqrt(a.area));if(n===0){c.timer=.2;break}c.timer=d;let s=Math.min(xt.length,l.count+o);for(let t=0;t<s;t++)xt[t]=e.bufA[e.rng.int(n)];for(let n=0;n<s;n++){let r=xt[n];if(!i.alive[r])continue;let a=i.x[r],o=i.z[r],s=i.y[r];e.events.emit(t.Lightning,a,s,o,a+1.5,s+22,o-1,c.def.color),e.damageCircle(a,o,f,u,h,l.knockback,l);for(let n=0;n<l.chain;n++){let n=e.nearest(a,o,9,r);if(n<0)break;let d=i.x[n],p=i.z[n],m=i.y[n];e.events.emit(t.Lightning,d,m,p,a,s+1,o,c.def.color),e.damageCircle(d,p,f*.6,u*.6,h,0,l),r=n,a=d,o=p,s=m}}}break;case`sweep`:{let t=c.def.rule,o=t===`lunge`,s=t===`lowHp`?u*(1+(c.def.evolved?2:1)*(1-Math.min(1,Math.max(0,r.hp/a.maxHp)))):u;if(c.fxArea=f,c.timer-=n,c.timer<=0){let n=e.nearest(r.x,r.z,o?l.range:f*1.25);if(o&&n<0){c.timer=.15;break}c.timer=d;let a=n>=0?Math.atan2(i.x[n]-r.x,i.z[n]-r.z):r.yaw;if(c.lx=r.x,c.lz=r.z,o&&n>=0){let e=Math.max(0,Math.hypot(i.x[n]-r.x,i.z[n]-r.z)-f*.6);c.lx+=Math.sin(a)*e,c.lz+=Math.cos(a)*e}t===`reap`&&c.charge>=1?(c.charge--,Lt(e,c,a,s*(c.def.evolved?4:3),f*de)):Lt(e,c,a,s,f,c.lx,c.lz),c.queue=l.count-1,c.qT=Math.min(.2,d/Math.max(1,l.count)),c.angle=o?a:a+Math.PI}c.queue>0&&(c.qT-=n,c.qT<=0&&(o?Lt(e,c,c.angle,s,f,c.lx,c.lz):(Lt(e,c,c.angle,s,f),c.angle+=Math.PI/2),c.queue--,c.qT=Math.min(.2,d/Math.max(1,l.count))));break}case`aura`:if(c.fxArea=f,c.timer-=n,c.timer<=0){c.timer=d;let t=e.collect(r.x,r.z,f);for(let n=0;n<t;n++)e.damageEnemy(e.bufA[n],u,h,0,0,0,l)}break;case`bounce`:if(c.timer-=n,c.timer<=0){let n=e.nearest(r.x,r.z,l.range);if(n<0){c.timer=.15;break}c.timer=d;let a=l.count+o,s=Math.atan2(i.x[n]-r.x,i.z[n]-r.z);for(let t=0;t<a;t++){let n=s+(t-(a-1)/2)*.22,r=u;if(c.def.rule===`dice`){let t=1+e.rng.int(6);c.def.evolved&&(t=Math.max(t,1+e.rng.int(6))),r=u*t/ue,t===6&&e.diceSix(c)}It(e,ht.Bounce,c,n,r,m,p,l.area,l.bounces)}e.events.emit(t.Shoot,r.x,r.y,r.z,2)}break;case`summon`:Bt(e,c,l.count+o,u,n);break;case`cone`:if(c.fxArea=f,c.active>0){c.active-=n;let t=e.nearest(r.x,r.z,f*1.1);if(t>=0&&l.arc<6){let e=Math.atan2(i.x[t]-r.x,i.z[t]-r.z);c.angle=Be(c.angle,e,Math.min(1,n*5))}if(c.qT-=n,c.qT<=0){c.qT=.2;let t=l.arc/2,n=e.collect(r.x,r.z,f);for(let a=0;a<n;a++){let n=e.bufA[a],o=i.x[n]-r.x,s=i.z[n]-r.z;t<3.1&&Math.hypot(o,s)>1.2&&Math.abs(ze(Math.atan2(o,s)-c.angle))>t||e.damageEnemy(n,u,h,0,0,0,l)}}c.active<=0&&(c.timer=d)}else if(c.timer-=n,c.timer<=0){let n=e.nearest(r.x,r.z,f*1.2);if(n<0){c.timer=.2;break}c.angle=Math.atan2(i.x[n]-r.x,i.z[n]-r.z),c.active=p,c.span=p,c.qT=0,e.events.emit(t.Shoot,r.x,r.y,r.z,3)}break;case`lob`:if(c.timer-=n,c.timer<=0){let n=e.collect(r.x,r.z,l.range);if(n===0){c.timer=.2;break}c.timer=d;let a=Math.min(xt.length,l.count+o);for(let t=0;t<a;t++)xt[t]=e.bufA[e.rng.int(n)];let s=e.projectiles;for(let t=0;t<a;t++){let n=xt[t],a=s.alloc();if(a<0)break;s.kind[a]=ht.Lob,s.slot[a]=h,s.sx[a]=r.x,s.sy[a]=r.y+1.5,s.sz[a]=r.z,s.vx[a]=i.x[n]+e.rng.range(-.8,.8)*t,s.vz[a]=i.z[n]+e.rng.range(-.8,.8)*t,s.x[a]=r.x,s.y[a]=r.y+1.5,s.z[a]=r.z,s.px[a]=r.x,s.py[a]=r.y+1.5,s.pz[a]=r.z,s.span[a]=.6,s.life[a]=.6,s.dmg[a]=u,s.radius[a]=f,s.left[a]=0}e.events.emit(t.Shoot,r.x,r.y,r.z,4)}break;case`homing`:if(c.timer-=n,c.timer<=0){if(e.nearest(r.x,r.z,l.range)<0){c.timer=.2;break}c.timer=d;let n=l.count+o,i=e.rng.range(0,R);for(let t=0;t<n;t++)It(e,ht.Homing,c,i+t*R/n,u,m,p,l.area,l.pierce);e.events.emit(t.Shoot,r.x,r.y,r.z,5)}break;case`trap`:if(c.timer-=n,c.timer<=0){c.timer=d;let n=24-zt(e,h,_t.Trap),i=Math.min(n,l.count+o);for(let t=0;t<i;t++){let t=e.rng.range(0,R),n=e.rng.range(1.5,Math.max(2,l.range));e.addZone(r.x+Math.sin(t)*n,r.z+Math.cos(t)*n,f,p,u,h,_t.Trap)}i>0&&e.events.emit(t.Shoot,r.x,r.y,r.z,6)}break;case`trail`:c.timer-=n,c.timer<=0&&(Math.hypot(r.x-c.lx,r.z-c.lz)>f*.7||e.time-c.lastT>=p)&&(c.timer=d,c.lx=r.x,c.lz=r.z,c.lastT=e.time,e.addZone(r.x,r.z,f,p,u,h,_t.Fire));break;case`boomerang`:if(c.timer-=n,c.timer<=0){let n=e.nearest(r.x,r.z,l.range);if(n<0){c.timer=.15;break}c.timer=d;let s=l.count+o,f=Math.atan2(i.x[n]-r.x,i.z[n]-r.z),p=2*l.range/Math.max(1,m),h=e.projectiles;for(let t=0;t<s;t++){let n=f+(t-(s-1)/2)*.5,r=It(e,ht.Boomerang,c,n,u,m,p+kt,l.area*Math.sqrt(a.area),0);if(r<0)break;h.span[r]=p,h.sx[r]=h.vx[r],h.sz[r]=h.vz[r],h.sy[r]=p+kt}e.events.emit(t.Shoot,r.x,r.y,r.z,2)}break;case`wander`:if(c.timer-=n,c.timer<=0){if(e.nearest(r.x,r.z,l.range)<0){c.timer=.2;break}c.timer=d;let n=l.count+o,i=e.rng.range(0,R);for(let t=0;t<n;t++)It(e,ht.Twister,c,i+t*R/n,u,m,p,f,0);e.events.emit(t.Shoot,r.x,r.y,r.z,3)}break;case`vortex`:if(c.timer-=n,c.timer<=0){let n=e.collect(r.x,r.z,l.range);if(n===0){c.timer=.2;break}c.timer=d;let a=Math.min(Ct,l.count+o);for(let t=0;t<a;t++)xt[t]=e.bufA[e.rng.int(n)];for(let t=0;t<a;t++){let n=xt[t];e.addZone(i.x[n]+e.rng.range(-1.5,1.5)*t,i.z[n]+e.rng.range(-1.5,1.5)*t,f,p,u,h,_t.Vortex)}e.events.emit(t.Shoot,r.x,r.y,r.z,4)}break;case`guard`:c.fxArea=f,c.timer>0&&(c.timer-=n);break;case`tether`:if(c.timer-=n,c.timer<=0){c.timer=d;let n=Math.min(wt,l.count+o),s=c.targets;s.length=n;let f=l.range+2,p=!1;for(let o=0;o<n;o++){let n=s[o]??-1;n>=0&&(!i.alive[n]||Math.hypot(i.x[n]-r.x,i.z[n]-r.z)>f)&&(n=-1);for(let t=0;n<0&&t<3;t++){let t=e.randomInRange(r.x,r.z,l.range);if(t<0)break;s.includes(t)||(n=t)}if(s[o]=n,n<0)continue;p=!0;let d=i.x[n],m=i.z[n],h=i.y[n]+i.oy[n]+.9;Rt(e,c,r.x,r.z,d,m,l.area*Math.sqrt(a.area),u),e.events.emit(t.Beam,d,h,m,r.x,r.y+1.1,r.z,c.def.color)}p||(c.timer=.2)}}}}function Ht(e,n){let r=e.projectiles,i=e.enemies,a=e.map;for(let o=0;o<r.n;o++){if(!r.alive[o])continue;let s=r.slot[o],c=e.weapons[s];if(!c){r.free(o);continue}let l=c.stats;r.px[o]=r.x[o],r.py[o]=r.y[o],r.pz[o]=r.z[o],r.life[o]=r.life[o]-n;let u=r.kind[o];if(u===ht.Lob){let t=1-Math.max(0,r.life[o])/r.span[o],n=r.vx[o],i=r.vz[o];r.x[o]=r.sx[o]+(n-r.sx[o])*t,r.z[o]=r.sz[o]+(i-r.sz[o])*t;let c=a.heightAt(n,i);r.y[o]=r.sy[o]+(c-r.sy[o])*t+Math.sin(Math.PI*t)*3.2,r.life[o]<=0&&(e.addZone(n,i,r.radius[o],l.duration*e.stats.duration,r.dmg[o],s),e.damageCircle(n,i,r.radius[o],r.dmg[o],s,2,l),r.free(o));continue}if(r.life[o]<=0){r.free(o);continue}if(u===ht.Homing){let t=e.nearest(r.x[o],r.z[o],Et,r.last[o]);if(t>=0){let e=Math.atan2(r.vx[o],r.vz[o]),a=Math.atan2(i.x[t]-r.x[o],i.z[t]-r.z[o]),s=Tt*n,c=e+Math.min(s,Math.max(-s,ze(a-e))),l=Math.hypot(r.vx[o],r.vz[o]);r.vx[o]=Math.sin(c)*l,r.vz[o]=Math.cos(c)*l}}else if(u===ht.Boomerang){let t=r.sy[o]-r.life[o],n=r.span[o];if(t<n){let e=1-t/n;r.vx[o]=r.sx[o]*e,r.vz[o]=r.sz[o]*e}else{let i=e.player,a=i.x-r.x[o],s=i.z-r.z[o],c=Math.hypot(a,s);if(c<1.2){r.free(o);continue}let l=Math.hypot(r.sx[o],r.sz[o])*Math.min(1.5,.2+(t-n)/n*2);r.vx[o]=a/c*l,r.vz[o]=s/c*l}}else if(u===ht.Twister){let t=Math.hypot(r.vx[o],r.vz[o]),a=Math.atan2(r.vx[o],r.vz[o])+e.rng.range(-1,1)*4*n,s=e.nearest(r.x[o],r.z[o],9);s>=0&&(a+=Math.min(1.5*n,Math.max(-1.5*n,ze(Math.atan2(i.x[s]-r.x[o],i.z[s]-r.z[o])-a)))),r.vx[o]=Math.sin(a)*t,r.vz[o]=Math.cos(a)*t}let d=u===ht.Boomerang||u===ht.Twister,f=Math.max(1,Math.ceil(Math.hypot(r.vx[o],r.vz[o])*n/Pt)),p=n/f,m=!0;for(let n=0;n<f&&m;n++){let n=r.x[o]+r.vx[o]*p,f=r.z[o]+r.vz[o]*p;r.x[o]=n,r.z[o]=f,r.y[o]=a.heightAt(n,f)+1.1;let h=e.collect(n,f,r.radius[o]),g=Math.hypot(r.vx[o],r.vz[o])||1,_=r.vx[o]/g,v=r.vz[o]/g;for(let a=0;a<h;a++){let p=e.bufA[a];if(p===r.last[o]||!i.alive[p])continue;if(d||(u===ht.Bolt||u===ht.Homing)&&l.pierce>0){let t=p*8+s;if(e.time-i.hitT[t]<(u===ht.Twister?Ot:u===ht.Boomerang?Dt:.3))continue;i.hitT[t]=e.time}let h=i.x[p],y=i.z[p],b=c.def.rankBonus&&ct[i.type[p]].rank?1+c.def.rankBonus:1;if(u===ht.Twister){let t=h-n,i=y-f,a=Math.hypot(t,i)||1;e.damageEnemy(p,r.dmg[o],s,t/a,i/a,l.knockback,l)}else e.damageEnemy(p,r.dmg[o]*b,s,_,v,l.knockback,l);if(!d){if(r.last[o]=p,l.explode>0){let i=l.explode*e.stats.area;e.damageCircle(n,f,i,r.dmg[o]*.6,s,3,l),e.events.emit(t.Explosion,n,r.y[o],f,i,c.def.color)}if(u===ht.Bounce){r.left[o]=r.left[o]-1;let t=r.left[o]>=0?e.nearest(h,y,11,p):-1;if(t<0)r.free(o);else{let a=i.x[t]-n,s=i.z[t]-f,c=Math.hypot(a,s)||1;r.vx[o]=a/c*g,r.vz[o]=s/c*g,r.life[o]=l.duration*e.stats.duration}m=!1;break}if(r.left[o]=r.left[o]-1,r.left[o]<0){r.free(o),m=!1;break}}}}}}function Ut(e,n){let r=e.zones;for(let i=0;i<r.n;i++){if(!r.alive[i])continue;if(r.life[i]=r.life[i]-n,r.life[i]<=0){r.free(i);continue}let a=e.weapons[r.slot[i]],o=r.kind[i],s=r.x[i],c=r.z[i],l=r.r[i];if(o===_t.Trap)r.span[i]-r.life[i]>=At&&e.collect(s,c,l*jt)>0&&(e.damageCircle(s,c,l,r.dmg[i],r.slot[i],2,a?a.stats:null),e.events.emit(t.Explosion,s,r.y[i]+.6,c,l,a?a.def.color:12107976),r.free(i));else{if(o===_t.Vortex){let t=e.enemies,r=e.collect(s,c,l*Mt);for(let i=0;i<r;i++){let r=e.bufA[i],a=s-t.x[r],o=c-t.z[r],l=Math.hypot(a,o);if(l<.3)continue;let u=Nt*(1-ct[t.type[r]].weight)*n;t.vx[r]=t.vx[r]+a/l*u,t.vz[r]=t.vz[r]+o/l*u}}r.tick[i]=r.tick[i]-n,r.tick[i]<=0&&(r.tick[i]=.4,e.damageCircle(s,c,l,r.dmg[i],r.slot[i],0,a?a.stats:null))}}}var Wt=class{s;constructor(e=1){this.s=e>>>0||1}next(){let e=this.s+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,t){return e+(t-e)*this.next()}int(e){return Math.floor(this.next()*e)}chance(e){return this.next()<e}pick(e){return e[this.int(e.length)]}weighted(e){let t=0;for(let n of e)t+=n;if(t<=0)return-1;let n=this.next()*t;for(let t=0;t<e.length;t++)if(n-=e[t],n<0)return t;return e.length-1}},Gt=class{cell;half;dim;cellStart;cellFill;items;constructor(e,t,n){this.half=e,this.cell=t,this.dim=Math.ceil(e*2/t),this.cellStart=new Int32Array(this.dim*this.dim+1),this.cellFill=new Int32Array(this.dim*this.dim),this.items=new Int32Array(n)}coord(e){let t=Math.floor((e+this.half)/this.cell);return t<0?0:t>=this.dim?this.dim-1:t}build(e,t,n,r){let i=this.cellStart,a=this.dim;i.fill(0);for(let o=0;o<e;o++){if(!t[o])continue;let e=this.coord(r[o])*a+this.coord(n[o]);i[e+1]=i[e+1]+1}for(let e=0;e<a*a;e++)i[e+1]=i[e+1]+i[e];this.cellFill.fill(0);for(let o=0;o<e;o++){if(!t[o])continue;let e=this.coord(r[o])*a+this.coord(n[o]),s=i[e]+this.cellFill[e];this.items[s]=o,this.cellFill[e]=this.cellFill[e]+1}}query(e,t,n,r){let i=this.coord(e-n),a=this.coord(e+n),o=this.coord(t-n),s=this.coord(t+n),c=0,l=r.length;for(let e=o;e<=s;e++){let t=e*this.dim,n=this.cellStart[t+i],o=this.cellStart[t+a+1];for(let e=n;e<o&&c<l;e++)r[c++]=this.items[e]}return c}},Kt=[{id:`perun`,god:`Perun`,name:`Gniew Peruna`,desc:`+15% obrażeń wszystkich broni.`,icon:`bolt`,color:10473727,mods:[{stat:`damage`,add:.15}]},{id:`swarog`,name:`Żar Swaroga`,god:`Swaróg`,desc:`Każde trafienie podpala wroga. -6% czasu odnowienia.`,icon:`flame`,color:16747066,mods:[{stat:`burn`,add:.35},{stat:`cooldown`,add:-.06}]},{id:`weles`,name:`Łaska Welesa`,god:`Weles`,desc:`+25% szczęścia, +2,5% szansy na krytyk, +40% złota i 25 monet od razu.`,icon:`coin`,color:12166911,mods:[{stat:`luck`,add:.25},{stat:`critChance`,add:.025},{stat:`goldGain`,add:.4}],instant:`gold`},{id:`mokosz`,name:`Opieka Mokoszy`,god:`Mokosz`,desc:`Leczy do pełna. +25 maks. zdrowia i +0,8 zdrowia / s.`,icon:`heart`,color:8377946,mods:[{stat:`maxHp`,add:25},{stat:`regen`,add:.8}],instant:`heal`}],qt=[{id:`krag-sila`,god:`Święty krąg`,name:`Moc kręgu`,desc:`+10% obrażeń.`,icon:`belt`,color:8308991,mods:[{stat:`damage`,add:.1}]},{id:`krag-tempo`,god:`Święty krąg`,name:`Rytm kręgu`,desc:`+8% szybkości ataku.`,icon:`flint`,color:8308991,mods:[{stat:`attackSpeed`,add:.08}]},{id:`krag-zdrowie`,god:`Święty krąg`,name:`Krew kręgu`,desc:`+25 maks. zdrowia i leczenie do pełna.`,icon:`heart`,color:8308991,mods:[{stat:`maxHp`,add:25}],instant:`heal`},{id:`krag-obszar`,god:`Święty krąg`,name:`Szerokość kręgu`,desc:`+10% obszaru.`,icon:`amulet`,color:8308991,mods:[{stat:`area`,add:.1}]},{id:`krag-oko`,god:`Święty krąg`,name:`Oko kręgu`,desc:`+5% szansy na krytyk.`,icon:`eye`,color:8308991,mods:[{stat:`critChance`,add:.05}]},{id:`krag-wal`,god:`Święty krąg`,name:`Wał kręgu`,desc:`+20 tarczy.`,icon:`palisade`,color:8308991,mods:[{stat:`shield`,add:20}]},{id:`krag-wiatr`,god:`Święty krąg`,name:`Wiatr kręgu`,desc:`+10% szybkości ruchu.`,icon:`wind`,color:8308991,mods:[{stat:`moveSpeed`,add:.1}]},{id:`krag-miod`,god:`Święty krąg`,name:`Rosa kręgu`,desc:`+0,6 zdrowia / s.`,icon:`honey`,color:8308991,mods:[{stat:`regen`,add:.6}]}],Jt={id:`chciwosc`,god:`Ołtarz chciwości`,name:`Klątwa chciwości`,desc:`+15% klątwy do końca runu.`,icon:`skull`,color:12599551,mods:[{stat:`curse`,add:.15}]},Yt=[`god`,`circle`,`god`,`amber`,`god`,`circle`,`greed`,`god`],Xt=[[`idol`,`Posąg Świętowita`,60,100,6],[`lake`,`Topielcowe Jezioro`,75,120,15],[`circle`,`Kamienny Krąg`,80,125,11],[`oak`,`Święty Dąb`,95,140,8],[`barrow`,`Kurhan`,110,150,12],[`hut`,`Chata na Kurzej Stopce`,120,158,8]],Zt=.6,Qt=12.5,$t=3.4,en=20261117,tn=8,nn=Math.ceil(440/tn);function rn(e,t){let n=Array.from({length:t},(e,t)=>t);for(let r=t-1;r>0;r--){let t=e.int(r+1);[n[r],n[t]]=[n[t],n[r]]}return n}var an=class{seed;heights=new Float32Array(48841);path=new Float32Array(48841);obstacles=[];puddles=[];bonfires=[];shrines=[];chestSpots=[];landmarks=[];trails=[];flats=[];obGrid=[];nx;nz;outX=0;outZ=0;constructor(e=en){this.seed=e;let t=new Wt(e);this.nx=t.range(0,400),this.nz=t.range(0,400),this.placeLandmarkSites(t),this.buildTrails(t),this.placePuddles(t);for(let e of this.landmarks)e.kind!==`lake`&&e.kind!==`barrow`&&this.flats.push({x:e.x,z:e.z,r:e.r,h:this.noiseHeight(e.x,e.z)});for(let e of this.puddles)this.flats.push({x:e.x,z:e.z,r:e.r*1.25,h:this.noiseHeight(e.x,e.z)});this.buildHeights();for(let e of this.puddles)e.y=this.heightAt(e.x,e.z)+(e.r>8?.42:.22);this.placeFeatures(t),this.buildObstacleGrid()}placeLandmarkSites(e){let t=Xt.length,n=rn(e,t),r=e.range(0,R);Xt.forEach(([i,a,o,s,c],l)=>{let u=r+(n[l]+.5+(e.next()-.5)*Zt)/t*R,d=e.range(o,s);this.landmarks.push({kind:i,name:a,x:Math.cos(u)*d,z:Math.sin(u)*d,r:c})})}stamp(e,t){let n=3.2,r=Math.max(0,Math.floor((e-n+220)/2)),i=Math.min(220,Math.ceil((e+n+220)/2)),a=Math.max(0,Math.floor((t-n+220)/2)),o=Math.min(220,Math.ceil((t+n+220)/2));for(let s=a;s<=o;s++)for(let a=r;a<=i;a++){let r=1-Le(1,n,Math.hypot(-220+a*2-e,-220+s*2-t)),i=s*221+a;r>this.path[i]&&(this.path[i]=r)}}trace(e,t,n,r,i){let a=Math.hypot(n-e,r-t),o=Math.max(2,Math.ceil(a/1.5)),s=-(r-t)/a,c=(n-e)/a,l=Math.min(13,a*.13),u=[];for(let d=0;d<=o;d++){let f=d/o,p=(Ue(f*a/34+i*7.13+this.nx,i*3.7+.5+this.nz,2)-.5)*2*l*Math.sin(Math.PI*f),m=e+(n-e)*f+s*p,h=t+(r-t)*f+c*p;u.push([m,h]),this.stamp(m,h)}return u}buildTrails(e){this.landmarks.forEach((e,t)=>{let n=Math.hypot(e.x,e.z),r=e.x/n,i=e.z/n,a=n-(e.kind===`lake`?13.5:e.kind===`circle`?4:3);this.trails.push(this.trace(r*9,i*9,r*a,i*a,t+1))});let t=this.landmarks.slice().sort((e,t)=>Math.atan2(e.z,e.x)-Math.atan2(t.z,t.x)),n=e=>e.kind===`lake`?13.5:e.r-2,r=e.int(2);for(let e=r;e<t.length+r;e+=2){let r=t[e%t.length],i=t[(e+1)%t.length],a=Math.hypot(i.x-r.x,i.z-r.z),o=(i.x-r.x)/a,s=(i.z-r.z)/a;this.trace(r.x+o*n(r),r.z+s*n(r),i.x-o*n(i),i.z-s*n(i),11+e)}}pathAt(e,t){let n=(e+220)/2,r=(t+220)/2;n<0?n=0:n>219.999&&(n=219.999),r<0?r=0:r>219.999&&(r=219.999);let i=Math.floor(n),a=Math.floor(r),o=n-i,s=r-a,c=this.path,l=a*221+i,u=c[l]+(c[l+1]-c[l])*o;return u+(c[l+221]+(c[l+221+1]-c[l+221])*o-u)*s}placePuddles(e){let t=this.landmarks.find(e=>e.kind===`lake`);this.puddles.push({x:t.x,z:t.z,r:Qt,y:0});let n=0;for(;this.puddles.length<26&&n++<3e3;){let t=e.range(0,R),n=20+Math.sqrt(e.next())*148,r=e.range(3.5,6.5),i=Math.cos(t)*n,a=Math.sin(t)*n,o=this.pathAt(i,a)<.01&&this.pathAt(i+r,a)<.01&&this.pathAt(i-r,a)<.01&&this.pathAt(i,a+r)<.01&&this.pathAt(i,a-r)<.01;for(let e of this.puddles)Math.hypot(e.x-i,e.z-a)<e.r+r+10&&(o=!1);for(let e of this.landmarks)Math.hypot(e.x-i,e.z-a)<e.r+r+4&&(o=!1);o&&this.puddles.push({x:i,z:a,r,y:0})}}noiseHeight(e,t){let n=Math.hypot(e,t),r=this.nx,i=this.nz,a=(Ue(e/42+3.1+r,t/42+7.7+i,3)-.5)*9;return a+=(Ue(e/13+11.3+r,t/13+2.9+i,2)-.5)*1.6,a+=(Ue(e/110+40.2+r,t/110+18.4+i,2)-.5)*7*Le(60,130,n),a*=Le(5,30,n),a+=Le(172,206,n)*9,a}rawHeight(e,t){let n=this.noiseHeight(e,t);for(let r of this.flats){let i=Math.hypot(r.x-e,r.z-t);i<r.r*1.7&&(n+=(r.h-n)*(1-Le(r.r*.75,r.r*1.7,i)))}for(let r of this.puddles){let i=Math.hypot(r.x-e,r.z-t);i<r.r*1.6&&(n-=(1-Le(r.r*.4,r.r*1.6,i))*(r.r>8?1.5:.7))}for(let r of this.landmarks){if(r.kind!==`barrow`)continue;let i=Math.hypot(r.x-e,r.z-t);i<13&&(n+=(1-Le(2.5,12,i))*$t)}return n}buildHeights(){for(let e=0;e<221;e++)for(let t=0;t<221;t++){let n=-220+t*2,r=-220+e*2;this.heights[e*221+t]=this.rawHeight(n,r)}}heightAt(e,t){let n=(e+220)/2,r=(t+220)/2;n<0?n=0:n>219.999&&(n=219.999),r<0?r=0:r>219.999&&(r=219.999);let i=Math.floor(n),a=Math.floor(r),o=n-i,s=r-a,c=this.heights,l=a*221+i,u=c[l],d=c[l+1],f=c[l+221],p=c[l+221+1];return o+s<=1?u+(d-u)*o+(f-u)*s:p+(f-p)*(1-o)+(d-p)*(1-s)}free(e,t,n,r){for(let i of this.obstacles)if(Math.hypot(i.x-e,i.z-t)<i.r+n+r)return!1;for(let r of this.puddles)if(Math.hypot(r.x-e,r.z-t)<r.r+n+1)return!1;for(let r of this.chestSpots)if(Math.hypot(r.x-e,r.z-t)<n+2.5)return!1;return!0}inClearing(e,t){for(let n of this.landmarks)if(Math.hypot(n.x-e,n.z-t)<n.r)return!0;return!1}placeLandmarks(){for(let e of this.landmarks){let t=Math.atan2(-e.z,-e.x),n=Math.atan2(-e.x,-e.z),r=(t,n)=>[e.x+Math.cos(t)*n,e.z+Math.sin(t)*n];switch(e.kind){case`circle`:for(let e=1;e<10;e++){let n=t+e/10*R,[i,a]=r(n,7);this.obstacles.push({x:i,z:a,r:.85,kind:`menhir`,scale:.85+Ve(e*7,3)*.5,rot:-n-Math.PI/2+(Ve(e,9)-.5)*.5})}this.chestSpots.push({x:e.x,z:e.z,rot:n,rich:!0});break;case`oak`:{this.obstacles.push({x:e.x,z:e.z,r:2.3,kind:`ancientOak`,scale:1,rot:.7});let[i,a]=r(t+.7,5.2);this.chestSpots.push({x:i,z:a,rot:n,rich:!0});break}case`hut`:{this.obstacles.push({x:e.x,z:e.z,r:2.4,kind:`hut`,scale:1,rot:n});let[i,a]=r(t-.8,5.4);this.chestSpots.push({x:i,z:a,rot:n,rich:!0});break}case`idol`:{this.obstacles.push({x:e.x,z:e.z,r:1,kind:`idol`,scale:1,rot:n});let[i,a]=r(t+Math.PI,3.6);this.chestSpots.push({x:i,z:a,rot:n,rich:!0});break}case`barrow`:{this.obstacles.push({x:e.x,z:e.z,r:.95,kind:`menhir`,scale:1.5,rot:.4});let[i,a]=r(t+.5,2.8);this.chestSpots.push({x:i,z:a,rot:n,rich:!0});for(let e=0;e<5;e++){let t=.6+e/5*R,[n,i]=r(t,9.5+Ve(e,5)*1.5);this.obstacles.push({x:n,z:i,r:.7,kind:`menhir`,scale:.55+Ve(e,2)*.25,rot:t})}break}}}}placeFeatures(e){this.placeLandmarks();let t=rn(e,Yt.length).map(e=>Yt[e]),n=(t,n)=>!this.free(t,n,1.2,2)||this.pathAt(t,n)>.2?!1:(this.bonfires.push({x:t,z:n,rot:e.range(0,R)}),this.obstacles.push({x:t,z:n,r:1.1,kind:`bonfire`,scale:1,rot:0}),!0),r=(e,n,r,i)=>{if(!this.free(e,n,1.2,3)||this.pathAt(e,n)>.2)return!1;let a=Math.atan2(r-e,i-n);return this.shrines.push({x:e,z:n,rot:a,kind:t[this.shrines.length]??`god`}),this.obstacles.push({x:e,z:n,r:.9,kind:`shrine`,scale:1,rot:a}),!0},i=(e,t,n)=>{let r=this.trails[e],i=Math.min(r.length-2,Math.max(0,Math.floor(t*(r.length-1)))),[a,o]=r[i],[s,c]=r[i+1],l=Math.hypot(s-a,c-o)||1;return[a-(c-o)/l*n,o+(s-a)/l*n,a,o]},a=e.range(0,R);for(let e=0;e<16;e++){let t=a+e*.4;if(n(Math.cos(t)*9.5,Math.sin(t)*9.5))break}for(let e=0;e<this.trails.length;e++)for(let t of[-5.5,5.5,-7,7]){let[r,a]=i(e,.72,t);if(n(r,a))break}let o=0;for(;this.bonfires.length<16&&o++<400;){let t=e.range(0,R),r=e.range(30,166),i=Math.cos(t)*r,a=Math.sin(t)*r,o=!this.inClearing(i,a);for(let e of this.bonfires)Math.hypot(e.x-i,e.z-a)<42&&(o=!1);o&&n(i,a)}for(let e=0;e<this.trails.length;e++){let t=e%2==0?.42:.3;for(let n of[4.6,-4.6,6,-6]){let[a,o,s,c]=i(e,t,n);if(r(a,o,s,c))break}}for(o=0;this.shrines.length<8&&o++<400;){let t=e.range(0,R),n=e.range(70,164),i=Math.cos(t)*n,a=Math.sin(t)*n,o=!this.inClearing(i,a);for(let e of this.shrines)Math.hypot(e.x-i,e.z-a)<48&&(o=!1);o&&r(i,a,0,0)}for(o=0;this.chestSpots.length<24&&o++<2e3;){let t=e.range(0,R),n=30+Math.sqrt(e.next())*140,r=Math.cos(t)*n,i=Math.sin(t)*n;if(this.inClearing(r,i)||!this.free(r,i,1,3))continue;let a=!0;for(let e of this.chestSpots)Math.hypot(e.x-r,e.z-i)<27&&(a=!1);a&&this.chestSpots.push({x:r,z:i,rot:e.range(0,R),rich:!1})}o=0;let s=0;for(;s<170&&o++<8e3;){let t=e.range(0,R),n=12+Math.sqrt(e.next())*172,r=e.range(.8,2.4),i=Math.cos(t)*n,a=Math.sin(t)*n;this.inClearing(i,a)||this.pathAt(i,a)>.05||this.free(i,a,r*.85,1.5)&&(this.obstacles.push({x:i,z:a,r:r*.85,kind:`rock`,scale:r,rot:e.range(0,R)}),s++)}o=0;let c=0;for(;c<780&&o++<6e4;){let t=e.range(0,R),n=12+Math.sqrt(e.next())*172,r=Math.cos(t)*n,i=Math.sin(t)*n,a=Le(.34,.62,Ue(r/46+9.3+this.nx,i/46+4.1+this.nz,2)),o=(.22+.78*Le(30,90,n))*(.3+.9*a)+(Ue(r/20+this.nx,i/20+this.nz,2)-.5)*.6;if(e.next()>o||this.inClearing(r,i)||this.pathAt(r,i)>.12)continue;let s=Ue(r/64+31.7+this.nx,i/64+77.2+this.nz,2)>.56,l=e.next(),u=s?l<.78?`birch`:`pine`:l<.22?`oak`:`pine`,d=u===`oak`?e.range(1.1,1.7):u===`birch`?e.range(.95,1.5):e.range(.9,1.6),f=(u===`oak`?.75:u===`birch`?.36:.5)*d;this.free(r,i,f,2.2)&&(this.obstacles.push({x:r,z:i,r:f,kind:u,scale:d,rot:e.range(0,R)}),c++)}this.placeNearChests(e)}placeNearChests(e){for(let t=0;t<3;t++)for(let n=0;n<200;n++){let n=(t+e.range(.15,.85))/3*R,r=e.range(18,25),i=Math.cos(n)*r,a=Math.sin(n)*r;if(!(this.inClearing(i,a)||this.pathAt(i,a)>.3||!this.free(i,a,1,1.2))){this.chestSpots.push({x:i,z:a,rot:Math.atan2(-i,-a),rich:!1});break}}}buildObstacleGrid(){for(let e=0;e<3025;e++)this.obGrid.push([]);this.obstacles.forEach((e,t)=>{let n=this.obCoord(e.x-e.r),r=this.obCoord(e.x+e.r),i=this.obCoord(e.z-e.r),a=this.obCoord(e.z+e.r);for(let e=i;e<=a;e++)for(let i=n;i<=r;i++)this.obGrid[e*nn+i].push(t)})}obCoord(e){let t=Math.floor((e+220)/tn);return t<0?0:t>=nn?54:t}resolveCircle(e,t,n){let r=!1,i=this.obCoord(e-n),a=this.obCoord(e+n),o=this.obCoord(t-n),s=this.obCoord(t+n);for(let c=o;c<=s;c++)for(let o=i;o<=a;o++){let i=this.obGrid[c*nn+o];for(let a=0;a<i.length;a++){let o=this.obstacles[i[a]],s=e-o.x,c=t-o.z,l=o.r+n,u=s*s+c*c;if(u<l*l){let n=Math.sqrt(u);n>1e-4?(e=o.x+s/n*l,t=o.z+c/n*l):e=o.x+l,r=!0}}}let c=Math.hypot(e,t);return c>180&&(e*=180/c,t*=180/c,r=!0),this.outX=e,this.outZ=t,r}isFree(e,t,n){let r=this.obCoord(e),i=this.obCoord(t),a=this.obGrid[i*nn+r];for(let r=0;r<a.length;r++){let i=this.obstacles[a[r]];if(Math.hypot(i.x-e,i.z-t)<i.r+n)return!1}return Math.hypot(e,t)<180}inPuddle(e,t){for(let n=0;n<this.puddles.length;n++){let r=this.puddles[n],i=r.x-e,a=r.z-t,o=r.r*.92;if(i*i+a*a<o*o)return!0}return!1}},on={chase:0,fly:1,kamikaze:2,leaper:3,charger:4,ranged:5,teleporter:6,jaga:7,poludnica:8,leszy:9,topielec:0},sn=ct.map(e=>on[e.ai]),cn=new Int32Array(64),ln=lt.chochlik,un=lt.wilkolak,dn=lt.strzyga,fn=lt.kruk,pn=62;function mn(e,t,n,r,i,a){for(let o=0;o<i;o++){let s=o/i*R+e.rng.next(),c=n+Math.cos(s)*a,l=r+Math.sin(s)*a,u=Math.hypot(c,l);u>179&&(c*=179/u,l*=179/u),e.spawnEnemy(t,c,l)}}function hn(e,n){let r=e.enemies,i=e.player,a=e.map,o=e.rng,s=Math.exp(-7*n),c=e.time,l=a.heightAt(i.x,i.z);for(let u=0;u<r.n;u++){if(!r.alive[u])continue;let d=r.type[u],f=ct[d],p=sn[d],m=r.x[u],h=r.z[u];if(r.px[u]=m,r.py[u]=r.y[u]+r.oy[u],r.pz[u]=h,r.flash[u]>0&&(r.flash[u]=r.flash[u]-n),r.atk[u]>0&&(r.atk[u]=r.atk[u]-n),r.spawnT[u]>0&&(r.spawnT[u]=r.spawnT[u]-n),r.burnT[u]>0){if(r.burnT[u]=r.burnT[u]-n,r.burnAcc[u]=r.burnAcc[u]+n,r.burnAcc[u]>=.5&&(r.burnAcc[u]=r.burnAcc[u]-.5,e.damageEnemy(u,r.burnDps[u]*.5,-1,0,0,0,null,r.burnSrc[u]),!r.alive[u]))continue;r.burnT[u]<=0&&(r.burnDps[u]=0,r.burnSrc[u]=-1)}let g=r.speed[u];r.slowT[u]>0&&(r.slowT[u]=r.slowT[u]-n,g*=1-r.slowK[u],r.slowT[u]<=0&&(r.slowK[u]=0));let _=i.x-m,v=i.z-h,y=Math.hypot(_,v);if(y>pn&&!f.rank){let e=o.next()*R,t=i.x+Math.cos(e)*30,n=i.z+Math.sin(e)*30,a=Math.hypot(t,n);a>179&&(t*=179/a,n*=179/a),m=t,h=n,r.px[u]=m,r.pz[u]=h,r.state[u]=0,_=i.x-m,v=i.z-h,y=Math.hypot(_,v)}let b=y>.001?1/y:0,x=_*b,S=v*b,C=0,w=0,T=f.flying?1.3:0,E=!0,D=1,O=x,k=S,A=r.radius[u]+i.radius*.5;switch(p){case 0:y>A&&(C=x*g,w=S*g);break;case 1:{let e=Math.sin(c*2.4+u*1.7)*.5;y>A&&(C=(x-S*e)*g,w=(S+x*e)*g),T=1.15+Math.sin(c*5+u)*.25;break}case 2:if(E=!1,T=.9+Math.sin(c*6+u)*.2,r.state[u]===0){let n=Math.sin(c*4+u*2.1)*.7;C=(x-S*n)*g,w=(S+x*n)*g,y<2.3&&r.spawnT[u]<=0&&(r.state[u]=1,r.t2[u]=.6,e.events.emit(t.Fuse,m,r.y[u],h))}else if(r.t2[u]=r.t2[u]-n,C=x*g*.25,w=S*g*.25,r.flash[u]=.06+r.t2[u]*8%.1,r.t2[u]<=0){e.events.emit(t.Explosion,m,r.y[u]+.8,h,2.9,7008511),y<2.9+i.radius&&e.hurtPlayer(r.dmg[u]),e.despawn(u);continue}break;case 3:{r.t1[u]=r.t1[u]-n;let e=r.state[u];e===0?(y>A&&(C=x*g,w=S*g),y<10&&y>3.5&&r.t1[u]<=0&&(r.state[u]=1,r.t2[u]=.45)):e===1?(r.t2[u]=r.t2[u]-n,r.t2[u]<=0&&(r.state[u]=2,r.t2[u]=.62,r.ax[u]=_/.62*.95,r.az[u]=v/.62*.95)):(r.t2[u]=r.t2[u]-n,C=r.ax[u],w=r.az[u],O=C,k=w,T=Math.sin(Math.PI*(1-Math.max(0,r.t2[u])/.62))*2.6,D=1.3,r.t2[u]<=0&&(r.state[u]=0,r.t1[u]=3.2+o.next()*1.5));break}case 4:{r.t1[u]=r.t1[u]-n;let i=r.state[u];i===0?(y>A&&(C=x*g,w=S*g),y<13&&y>4&&r.t1[u]<=0&&(r.state[u]=1,r.t2[u]=.7,r.ax[u]=x,r.az[u]=S,e.events.emit(t.ChargeWarn,m,r.y[u],h,x,S,12))):i===1?(r.t2[u]=r.t2[u]-n,r.t2[u]>.3&&(r.ax[u]=x,r.az[u]=S),O=r.ax[u],k=r.az[u],r.t2[u]<=0&&(r.state[u]=2,r.t2[u]=.95)):i===2?(r.t2[u]=r.t2[u]-n,C=r.ax[u]*r.speed[u]*3.6,w=r.az[u]*r.speed[u]*3.6,O=C,k=w,D=1.4,r.t2[u]<=0&&(r.state[u]=3,r.t2[u]=.7)):(r.t2[u]=r.t2[u]-n,r.t2[u]<=0&&(r.state[u]=0,r.t1[u]=3.5+o.next()*2));break}case 5:if(r.t1[u]=r.t1[u]-n,y>13)C=x*g,w=S*g;else if(y<8)C=-x*g*.7,w=-S*g*.7;else{let e=r.ax[u];C=-S*e*g*.55,w=x*e*g*.55}r.t1[u]<=0&&y<19&&r.spawnT[u]<=0&&(r.t1[u]=2.6+o.next()*1.2,r.flash[u]=.1,e.addShot(m,r.y[u]+1.5,h,x*11.5,S*11.5,r.dmg[u]));break;case 6:if(r.t1[u]=r.t1[u]-n,y>A&&(C=x*g,w=S*g),r.t1[u]<=0&&(r.t1[u]=4+o.next()*2,y>5)){let n=o.next()*R,s=i.x+Math.cos(n)*5.5,c=i.z+Math.sin(n)*5.5;a.isFree(s,c,.7)&&(e.events.emit(t.Teleport,m,r.y[u],h,s,c),m=s,h=c,r.px[u]=m,r.pz[u]=h,r.spawnT[u]=.65,r.vx[u]=0,r.vz[u]=0)}break;case 7:{let a=r.hp[u]<r.maxHp[u]*.5,s=r.ax[u];if(r.t2[u]=r.t2[u]-n,r.state[u]===0){T=2.2+Math.sin(c*2.2)*.4;let l=Math.max(-1,Math.min(1,(y-8.5)/4));if(C=(x*l-S*s*.85)*g,w=(S*l+x*s*.85)*g,O=C,k=w,r.t1[u]=r.t1[u]-n,r.t1[u]<=0&&r.spawnT[u]<=0){r.t1[u]=a?1.6:2.4;let n=.55,s=i.x+i.vx*n,c=i.z+i.vz*n;if(e.addHazard(s,c,3,1.1,r.dmg[u]*1.1,!0),a){let t=o.next()*R;e.addHazard(s+Math.cos(t)*4.2,c+Math.sin(t)*4.2,2.6,1.3,r.dmg[u]*1.1,!0),e.addHazard(s-Math.cos(t)*4.2,c-Math.sin(t)*4.2,2.6,1.5,r.dmg[u]*1.1,!0)}e.events.emit(t.EnemyShoot,m,r.y[u]+T,h)}r.t2[u]<=0&&(r.state[u]=1,r.t2[u]=2,r.az[u]=Math.atan2(x,S),e.events.emit(t.ChargeWarn,m,r.y[u],h,x,S,14))}else{let e=Math.max(0,r.t2[u])/2;T=.5+Math.abs(e-.5)*3.4;let t=r.az[u],n=e>.85?2:13;C=Math.sin(t)*n,w=Math.cos(t)*n,O=C,k=w,D=1.2,r.t2[u]<=0&&(r.state[u]=0,r.t2[u]=a?4:5.5,r.ax[u]=-s)}r.t3[u]=r.t3[u]-n,r.t3[u]<=0&&(r.t3[u]=11,mn(e,ln,m,h,a?8:5,2.5));break}case 8:{r.t1[u]=r.t1[u]-n,r.t3[u]=r.t3[u]-n;let a=r.state[u];if(a===0?(y>A&&(C=x*g,w=S*g),r.t1[u]<=0&&r.spawnT[u]<=0&&(y<6.5?(r.state[u]=1,r.t2[u]=1.05,e.addHazard(m,h,5.4,1.05,r.dmg[u]*1.3)):y<22&&(r.state[u]=2,r.t2[u]=.65,r.ax[u]=x,r.az[u]=S,e.events.emit(t.ChargeWarn,m,r.y[u],h,x,S,15)))):a===1?(r.t2[u]=r.t2[u]-n,r.t2[u]<=0&&(r.state[u]=0,r.t1[u]=2.3)):a===2?(r.t2[u]=r.t2[u]-n,O=r.ax[u],k=r.az[u],r.t2[u]<=0&&(r.state[u]=3,r.t2[u]=.75)):(r.t2[u]=r.t2[u]-n,C=r.ax[u]*20,w=r.az[u]*20,O=C,k=w,D=1.3,r.t2[u]<=0&&(r.state[u]=0,r.t1[u]=2.4)),r.t3[u]<=0){r.t3[u]=5.5;for(let t=0;t<4;t++){let n=o.next()*R,a=t===0?0:2.5+o.next()*5;e.addHazard(i.x+Math.cos(n)*a,i.z+Math.sin(n)*a,2.6,1.25+t*.12,r.dmg[u]*.9)}}break}default:{let a=r.hp[u]/r.maxHp[u],s=a>.66?1:a>.33?2:3;s>r.phase[u]&&(r.phase[u]=s,e.bossPhase=s,e.hitstop=.25,e.events.emit(t.BossPhase,m,r.y[u],h,s),e.announce.push(s===2?`Leszy wzywa bór na pomoc!`:`Leszy wpada w szał!`),r.t1[u]=1.2,mn(e,s===2?dn:un,m,h,6,6));let c=r.dmg[u],l=r.state[u];if(r.t1[u]=r.t1[u]-n,r.t3[u]=r.t3[u]-n,l===0){if(y>A){let e=s===3?1.4:s===2?1.15:1;C=x*g*e,w=S*g*e}if(r.t1[u]<=0&&r.spawnT[u]<=0){r.t1[u]=s===1?3.4:s===2?2.8:2.1;let n=o.next();if(y<9.5)r.state[u]=1,r.t2[u]=1.15,e.addHazard(m,h,9,1.15,c*1.2);else if(s>=3&&n<.3)r.state[u]=2,r.t2[u]=.9,r.ax[u]=x,r.az[u]=S,e.events.emit(t.ChargeWarn,m,r.y[u],h,x,S,18);else if(s>=2&&n<.55){for(let t=0;t<10;t++){let n=t/10*R;e.addHazard(i.x+Math.cos(n)*6.5,i.z+Math.sin(n)*6.5,2.4,1.3,c*.8)}e.addHazard(i.x,i.z,4.6,2.3,c)}else{let t=s===1?5:s===2?8:11;for(let n=0;n<t;n++){let t=o.next()*R,r=n===0?0:2+o.next()*8,a=n===0?.4:0;e.addHazard(i.x+i.vx*a+Math.cos(t)*r,i.z+i.vz*a+Math.sin(t)*r,2.6,1+n*.14,c*.9)}}}s>=2&&r.t3[u]<=0&&(r.t3[u]=13,mn(e,o.next()<.5?fn:dn,m,h,3+s*2,7))}else l===1?(r.t2[u]=r.t2[u]-n,r.t2[u]<=0&&(r.state[u]=0,e.events.emit(t.Quake,m,r.y[u],h,1))):l===2?(r.t2[u]=r.t2[u]-n,O=r.ax[u],k=r.az[u],r.t2[u]<=0&&(r.state[u]=3,r.t2[u]=1.25)):(r.t2[u]=r.t2[u]-n,C=r.ax[u]*14,w=r.az[u]*14,O=C,k=w,D=1.3,r.t2[u]<=0&&(r.state[u]=0,e.events.emit(t.Quake,m,r.y[u],h,.6)));break}}m+=(C+r.vx[u])*n,h+=(w+r.vz[u])*n,r.vx[u]=r.vx[u]*s,r.vz[u]=r.vz[u]*s;let j=r.radius[u];if(f.weight<.9){let t=e.grid.query(m,h,j+.8,cn),n=t<20?t:20;for(let e=0;e<n;e++){let t=cn[e];if(t===u||!r.alive[t])continue;let n=m-r.x[t],i=h-r.z[t],a=(j+r.radius[t])*.85,o=n*n+i*i;if(o<a*a&&o>1e-5){let e=Math.sqrt(o),t=(a-e)*.45;m+=n/e*t,h+=i/e*t}}}if(!f.flying&&T<.5&&f.rank!==`boss`)a.resolveCircle(m,h,j*.8)&&(m=a.outX,h=a.outZ);else{let e=Math.hypot(m,h);e>183&&(m*=183/e,h*=183/e)}if(r.x[u]=m,r.z[u]=h,r.y[u]=a.heightAt(m,h),r.oy[u]=T,O!==0||k!==0){let e=Math.atan2(O,k)-r.yaw[u];e=((e+Math.PI)%R+R)%R-Math.PI,r.yaw[u]=r.yaw[u]+e*Math.min(1,n*9)}if(E&&r.atk[u]<=0&&r.spawnT[u]<=0){let t=i.x-m,n=i.z-h,a=j+i.radius+.12;if(t*t+n*n<a*a){let t=r.y[u]+T-(f.flying?.6:0),n=r.y[u]+T+f.height*(r.elite[u]?1.35:1),a=i.onGround?l:i.y;a<n&&a+i.height>t&&(r.atk[u]=1,e.hurtPlayer(r.dmg[u]*D,u))}}}}var gn=[90,120],_n=[130,170],vn=[150,210],yn=[200,280],bn=[60,90],xn=[90,130],Sn=1.5,Cn=60,wn=10,Tn=class{disabled=!1;nextMagnet;nextGift;nextHaste;rng;hasteRng;sx=0;sz=0;constructor(e){this.rng=new Wt((e^1374496523)>>>0),this.nextMagnet=this.rng.range(gn[0],gn[1]),this.nextGift=this.rng.range(vn[0],vn[1]),this.hasteRng=new Wt((e^795581745)>>>0),this.nextHaste=this.hasteRng.range(bn[0],bn[1])}update(e){this.disabled||(e.time>=this.nextMagnet&&(this.nextMagnet=e.time+(this.dropMagnet(e)?this.rng.range(_n[0],_n[1]):wn)),e.time>=this.nextGift&&(this.nextGift=e.time+(this.dropGift(e)?this.rng.range(yn[0],yn[1]):wn)),e.time>=this.nextHaste&&(this.nextHaste=e.time+(this.dropHaste(e)?this.hasteRng.range(xn[0],xn[1]):wn)))}dropHaste(e){if(e.hasteT>0)return!1;let n=e.player,r=e.pickups;for(let e=0;e<r.n;e++)if(r.alive[e]&&r.kind[e]===z.Haste&&Math.hypot(r.x[e]-n.x,r.z[e]-n.z)<Cn)return!1;if(!this.pickSpot(e,this.hasteRng))return!1;for(let e=0;e<r.n;e++)r.alive[e]&&r.kind[e]===z.Haste&&r.free(e);let i=e.map.heightAt(this.sx,this.sz);return r.spawn(z.Haste,this.sx,i,this.sz,0)<0?!1:(e.announce.push(`W pobliżu błysnął szał bojowy! Na chwilę przyspieszy twoje ataki.`),e.events.emit(t.Bonus,this.sx,i,this.sz,3),!0)}dropMagnet(e){let n=e.player,r=e.pickups;for(let e=0;e<r.n;e++)if(r.alive[e]&&r.kind[e]===z.Magnet&&Math.hypot(r.x[e]-n.x,r.z[e]-n.z)<Cn)return!1;if(!this.pickSpot(e))return!1;for(let e=0;e<r.n;e++)r.alive[e]&&r.kind[e]===z.Magnet&&r.free(e);let i=e.map.heightAt(this.sx,this.sz);return r.spawn(z.Magnet,this.sx,i,this.sz,0)<0?!1:(e.announce.push(`W pobliżu pojawił się magnes! Ściągnie bursztyny i monety z całego boru.`),e.events.emit(t.Bonus,this.sx,i,this.sz,0),!0)}dropGift(e){let n=e.player;for(let t of e.chests)if(t.gift&&!t.opened&&Math.hypot(t.x-n.x,t.z-n.z)<Cn)return!1;if(!this.pickSpot(e))return!1;let r=e.spawnChest(this.sx,this.sz,!0,!0,Math.atan2(n.x-this.sx,n.z-this.sz));return e.announce.push(`Dar boru! Darmowa skrzynia czeka w pobliżu.`),e.events.emit(t.Bonus,r.x,r.y,r.z,1),!0}pickSpot(e,t=this.rng){let n=e.player,r=e.map;for(let i=0;i<24;i++){let i=t.next()*R,a=t.range(14,24),o=n.x+Math.cos(i)*a,s=n.z+Math.sin(i)*a;if(Math.hypot(o,s)>176||!r.isFree(o,s,1.2)||r.inPuddle(o,s))continue;let c=!0;for(let t of e.chests)!t.opened&&Math.hypot(t.x-o,t.z-s)<4&&(c=!1);for(let t of e.shrines)Math.hypot(t.x-o,t.z-s)<5&&(c=!1);let l=e.pickups;for(let e=0;e<l.n;e++)l.alive[e]&&l.kind[e]>=z.Magnet&&Math.hypot(l.x[e]-o,l.z[e]-s)<4&&(c=!1);if(c)return this.sx=o,this.sz=s,!0}return!1}};function En(){return{moveX:0,moveZ:0,jump:!1,jumpHeld:!1,dash:!1,interact:!1,camYaw:0}}var Dn={speed:7.4,accelGround:62,accelAir:24,gravity:30,jumpV:11,airJumpV:10,coyote:.12,jumpBuffer:.13,dashSpeed:21,dashTime:.2,dashCooldown:1.5,puddleSlow:.6},On={None:0,Jump:1,AirJump:2,Dash:4,Land:8},kn=class{x=0;y=0;z=0;px=0;py=0;pz=0;vx=0;vy=0;vz=0;yaw=0;onGround=!0;coyote=0;jumpBuffer=0;airJumps=0;dashT=0;dashCd=0;dashX=0;dashZ=1;landT=1;landImpact=0;inPuddle=!1;hp=100;invuln=0;hurtT=1;radius=.45;height=1.8;savePrev(){this.px=this.x,this.py=this.y,this.pz=this.z}};function An(e,t,n,r,i){let a=On.None,o=t.moveX,s=t.moveZ,c=Math.hypot(o,s);c>1&&(o/=c,s/=c);let l=Math.sin(t.camYaw),u=Math.cos(t.camYaw),d=u*o-l*s,f=-l*o-u*s,p=c>.05;e.inPuddle=e.onGround&&r.inPuddle(e.x,e.z);let m=Dn.speed*n.moveSpeed*(e.inPuddle?Dn.puddleSlow:1);if(e.dashCd-=i,t.dash&&e.dashCd<=0&&e.dashT<=0){if(p){let t=Math.hypot(d,f);e.dashX=d/t,e.dashZ=f/t}else e.dashX=Math.sin(e.yaw),e.dashZ=Math.cos(e.yaw);e.dashT=Dn.dashTime,e.dashCd=Dn.dashCooldown,e.invuln<.3&&(e.invuln=.3),a|=On.Dash}if(e.dashT>0){e.dashT-=i;let t=Dn.dashSpeed*n.moveSpeed*(e.inPuddle?.8:1);e.vx=e.dashX*t,e.vz=e.dashZ*t,e.dashT<=0&&(e.vx=e.dashX*m,e.vz=e.dashZ*m)}else{let t=d*m,n=f*m,r=(e.onGround?Dn.accelGround:Dn.accelAir)*i,a=t-e.vx,o=n-e.vz,s=Math.hypot(a,o);s<=r?(e.vx=t,e.vz=n):(e.vx+=a/s*r,e.vz+=o/s*r)}t.jump&&(e.jumpBuffer=Dn.jumpBuffer),e.jumpBuffer>0&&(e.jumpBuffer-=i,e.onGround||e.coyote>0?(e.vy=Dn.jumpV,e.onGround=!1,e.coyote=0,e.jumpBuffer=0,a|=On.Jump):e.airJumps<n.extraJumps&&(e.vy=Dn.airJumpV,e.airJumps++,e.jumpBuffer=0,a|=On.AirJump));let h=e.x+e.vx*i,g=e.z+e.vz*i;r.resolveCircle(h,g,e.radius)&&(h=r.outX,g=r.outZ),e.x=h,e.z=g;let _=r.heightAt(e.x,e.z);if(e.landT+=i,e.onGround)_<e.y-.14?(e.onGround=!1,e.coyote=Dn.coyote,e.vy=0):(e.y=_,e.vy=0);else{e.coyote-=i;let n=Dn.gravity;e.vy>0&&!t.jumpHeld&&(n*=2.1),e.vy-=n*i,e.y+=e.vy*i,e.y<=_&&e.vy<=0&&(e.landImpact=Math.min(1,-e.vy/18),e.y=_,e.vy=0,e.onGround=!0,e.airJumps=0,e.landT=0,a|=On.Land)}return Math.hypot(e.vx,e.vz)>.6&&(e.yaw=Be(e.yaw,Math.atan2(e.vx,e.vz),1-Math.exp(-14*i))),a}var jn=25,Mn=class{acc=0;eventIdx=0;nextElite=70;nextMini=0;nextBoss=0;sx=0;sz=0;forceAlive=0;finalWaveTold=!1;surgeTold=0;surgeOn=!1;disabled=!1;pickSpot(e,t){let n=e.player;for(let r=0;r<6;r++){let r=e.rng.next()*R,i=jn+e.rng.next()*8,a=n.x+Math.cos(r)*i,o=n.z+Math.sin(r)*i,s=Math.hypot(a,o);if(s>178.5&&(a*=178.5/s,o*=178.5/s),!(Math.hypot(a-n.x,o-n.z)<16)&&(!t||e.map.isFree(a,o,.8)))return this.sx=a,this.sz=o,!0}return!1}puddleSpot(e){let t=e.player,n=e.map.puddles,r=e.rng.int(n.length);for(let i=0;i<n.length;i++){let a=n[(r+i)%n.length];if(!a)continue;let o=Math.hypot(a.x-t.x,a.z-t.z);if(o>15&&o<42){let t=e.rng.next()*R,n=e.rng.next()*a.r*.7;return this.sx=a.x+Math.cos(t)*n,this.sz=a.z+Math.sin(t)*n,!0}}return!1}spawnOne(e,t,n=!1){let r=lt[t];if(r===void 0)return-1;let i=t!==`kruk`&&t!==`ognik`&&t!==`jaga`,a=!1;return t===`utopiec`&&e.rng.chance(.5)&&(a=this.puddleSpot(e)),a||=this.pickSpot(e,i),a?e.spawnEnemy(r,this.sx,this.sz,n):-1}pickFromMix(e,t){let n=Object.keys(t),r=e.rng.weighted(n.map(e=>t[e]));return n[Math.max(0,r)]}fire(e,n){if(n.kind===`portal`&&(e.endless||e.won||e.bossSummoned))return;n.text&&e.announce.push(n.text);let r=e.player;if(n.kind===`portal`){e.openPortal();return}if(n.kind===`swarm`){let t=lt[n.enemy];if(t===void 0)return;let i=n.count??12,a=e.rng.next()*R;for(let n=0;n<i;n++){let o=a+n/i*R,s=r.x+Math.cos(o)*24,c=r.z+Math.sin(o)*24,l=Math.hypot(s,c);l>178.5&&(s*=178.5/l,c*=178.5/l),e.spawnEnemy(t,s,c)}return}let i=lt[n.enemy];if(i===void 0)return;let a=-r.x,o=-r.z,s=Math.hypot(a,o);if(s<5){let t=e.rng.next()*R;a=Math.cos(t),o=Math.sin(t)}else a/=s,o/=s;let c=n.kind===`boss`?30:26,l=e.spawnEnemy(i,r.x+a*c,r.z+o*c);l>=0&&e.events.emit(t.BossSpawn,e.enemies.x[l],e.enemies.y[l],e.enemies.z[l],i)}summonBoss(e,n,r){let i=lt.leszy;if(i===void 0)return;e.announce.push(`Leszy, strażnik boru, wychodzi z portalu!`);let a=e.spawnEnemy(i,n,r);a>=0&&e.events.emit(t.BossSpawn,e.enemies.x[a],e.enemies.y[a],e.enemies.z[a],i)}update(e,t){if(this.disabled)return;let n=e.enemies;if(this.forceAlive>0){let{phase:t}=D(e.time),r=0;for(;n.count<this.forceAlive&&r++<40;)this.spawnOne(e,this.pickFromMix(e,t.mix));return}for(;this.eventIdx<x.length&&e.time>=x[this.eventIdx].at;)this.fire(e,x[this.eventIdx]),this.eventIdx++;let{phase:r,progress:i}=D(e.time),a=r.rate,o=1,s=e.endless?0:v(e.time);if(s>0?(o=_,a*=3,s!==this.surgeTold&&(this.surgeTold=s,this.surgeOn=!0,e.announce.push(`Nadciąga fala! Bór rzuca na ciebie wszystko, co ma.`))):this.surgeOn&&(this.surgeOn=!1,!e.endless&&e.time<480&&e.announce.push(`Fala minęła. Bór łapie oddech.`)),!e.endless&&e.time>=480&&!e.bossSummoned&&(r=S,i=Math.min(1,(e.time-480)/90),a=S.rate+(16-S.rate)*i,this.finalWaveTold||(this.finalWaveTold=!0,e.announce.push(`Fala końcowa! Bór z każdą chwilą jest groźniejszy. Wezwij Leszego!`))),e.endless){if(r=b,i=Math.min(1,(e.time-r.from)/240),this.nextMini===0&&(this.nextMini=e.time+30,this.nextBoss=e.time+300),e.time>=this.nextMini){this.nextMini+=75;let t=e.rng.chance(.5);this.fire(e,{at:e.time,kind:`mini`,enemy:t?`jaga`:`poludnica`,text:t?`Baba Jaga znów krąży nad polaną!`:`Południca wraca z żarem!`})}e.time>=this.nextBoss&&(this.nextBoss+=300,this.fire(e,{at:e.time,kind:`boss`,enemy:`leszy`,text:`Kolejny Leszy wychodzi z kniei!`}))}let c=st(e.stats.curse).enemyCount,l=(r.alive[0]+(r.alive[1]-r.alive[0])*i)*c*o,u=n.count;if(u<l&&u<760){let n=(l-u)/l;this.acc+=(e.endless?r.rate:a)*c*(.6+n*2.4)*t;let i=0;for(;this.acc>=1&&i++<12;)--this.acc,this.spawnOne(e,this.pickFromMix(e,r.mix))}if(e.time>=this.nextElite){this.nextElite+=45;let t=this.pickFromMix(e,r.mix);t===`ognik`?this.spawnOne(e,`utopiec`,!0):this.spawnOne(e,t,!0)>=0&&this.nextElite-45==70&&e.announce.push(`Elitarny wróg! Pokonaj go, a zostawi skrzynię.`)}}},Nn=110,Pn=class{cells=new Uint8Array(Nn*Nn);version=0;lastX=1/0;lastZ=1/0;reveal(e,t,n=30){let r=e-this.lastX,i=t-this.lastZ;if(r*r+i*i<2.25)return;this.lastX=e,this.lastZ=t;let a=this.cells,o=Math.max(0,Math.floor((e-n+220)/4)),s=Math.min(Nn-1,Math.floor((e+n+220)/4)),c=Math.max(0,Math.floor((t-n+220)/4)),l=Math.min(Nn-1,Math.floor((t+n+220)/4)),u=n*.3,d=!1;for(let r=c;r<=l;r++){let i=-220+(r+.5)*4-t;for(let t=o;t<=s;t++){let o=-220+(t+.5)*4-e,s=Math.sqrt(o*o+i*i);if(s>=n)continue;let c=s<=n-u?255:Math.round((n-s)/u*255),l=r*Nn+t;c>a[l]&&(a[l]=c,d=!0)}}d&&this.version++}at(e,t){let n=Math.floor((e+220)/4),r=Math.floor((t+220)/4);return n<0||r<0||n>=Nn||r>=Nn?0:this.cells[r*Nn+n]/255}seen(e,t){return this.at(e,t)>.5}coverage(e){let t=0,n=0;for(let r=0;r<Nn;r++){let i=-220+(r+.5)*4;for(let a=0;a<Nn;a++){let o=-220+(a+.5)*4;o*o+i*i>e*e||(n++,this.cells[r*Nn+a]>127&&t++)}}return n>0?t/n:0}},Fn=.3,In=1.5,Ln=1.5,Rn=1.5,zn=.5,Bn=2.6,Vn=.06,Hn=.2,Un=1.75;function Wn(e){return Vn+Hn*Math.max(0,1-e/210)}var Gn=class{map;rng;player=new kn;events=new n;enemies=new dt;grid=new Gt(220,4,800);gems=new pt;pickups=new mt;projectiles=new gt;zones=new vt;hazards=new yt;shots=new bt;spawner=new Mn;bonuses;fog=new Pn;landmarksFound;chests=[];shrines=[];weapons=[];passives=[];blessings=[];items=[];fx={perunStone:0,sparkFlint:0,marzannaScythe:0,wraithSkull:0,hermitMoss:0,wingedShoes:0,travelPurse:0,swarogAnvil:0,smithJug:0,witchMirror:0};itemPool;character;shopLevels;weaponPool;passivePool;announce=[];killsByType=new Int32Array(ct.length);killsByWeapon={};bookTimes={};secrets=[];prompt={kind:``,rich:!1,cost:0,affordable:!1,progress:0};stats;shield=0;time=0;hasteT=0;level=1;xp=0;xpNeed=O(1);kills=0;runKills=0;gold=0;goldCollected=0;bankedTime=0;runGold=0;peakMoveSpeed=1;paidChests=0;chestHinted=!1;rerollsLeft=0;paidRerolls=0;banished=new Set;revivesLeft=0;pendingLevels=0;choice=null;dead=!1;godMode=!1;won=!1;endless=!1;bossIdx=-1;portal=null;bossSummoned=!1;bossPhase=1;evolved=0;shrinesUsed=0;damageTaken=0;armorBlocked=0;unhurtSince=0;unhurtBest=0;burnDealt=0;thornsDealt=0;procDealt=0;executions=0;skullBonus=0;runHp=0;runCrit=0;guardBlocks=0;secret=null;stillT=0;purseM=0;dodges=0;lifestealHealed=0;shieldAbsorbed=0;hpMul=1;dmgMul=1;hitstop=0;cand=new Int32Array(800);bufA=new Int32Array(800);bufB=new Int32Array(800);bufC=new Int32Array(800);constructor(e,t={}){this.map=e,this.rng=new Wt(t.seed??1),this.bonuses=new Tn(t.seed??1),this.character=t.character??m[0],this.shopLevels=t.shop??{},this.weaponPool=new Set(t.weaponPool??fe.filter(e=>!e.evolved&&!e.unlock).map(e=>e.id)),this.passivePool=new Set(t.passivePool??Se.filter(e=>!e.unlock).map(e=>e.id)),this.itemPool=new Set(t.itemPool??De.filter(e=>!e.unlock).map(e=>e.id));let n=this.player;n.y=e.heightAt(0,0),n.yaw=Math.PI,n.savePrev(),this.stats=Qe(this.character,this.shopLevels,this.passives,this.blessings,this.items,this.level),n.hp=this.stats.maxHp,this.shield=this.stats.shield,this.rerollsLeft=Math.floor(this.stats.rerolls),this.revivesLeft=Math.floor(this.stats.revives),this.addWeapon(this.character.startWeapon);for(let t of e.chestSpots)this.chests.push({x:t.x,y:e.heightAt(t.x,t.z),z:t.z,rot:t.rot,free:!1,gift:!1,rich:t.rich,opened:!1,progress:0});for(let t of e.shrines)this.shrines.push({x:t.x,y:e.heightAt(t.x,t.z),z:t.z,kind:t.kind,used:!1,progress:0});this.landmarksFound=e.landmarks.map(()=>!1),this.fog.reveal(n.x,n.z),t.foundSecrets?.includes(`krzywula`)||this.hideSecret(`krzywula`,t.seed??1)}hideSecret(e,t){let n=this.map.obstacles.filter(e=>e.kind===`oak`&&Math.hypot(e.x,e.z)>45&&Math.hypot(e.x,e.z)<165);if(n.length===0)return;let r=n[(Math.imul(t|0,2654435761)>>>0)%n.length],i=Math.hypot(r.x,r.z)||1,a=r.x-r.x/i*(r.r+.9),o=r.z-r.z/i*(r.r+.9);this.secret={id:e,x:a,y:this.map.heightAt(a,o),z:o,found:!1}}updateSecret(){let e=this.secret;if(!e||e.found)return;let n=this.player,r=n.x-e.x,i=n.z-e.z;r*r+i*i>2.2*2.2||(e.found=!0,this.findSecret(e.id),this.announce.push(`Krzywy kij spod dębu! Krzywula czeka w Skarbcu.`),this.events.emit(t.Secret,e.x,e.y,e.z,1))}dayTime(){return Math.min(1,this.time/408)}get paused(){return this.choice!==null||this.dead||this.won&&!this.endless}step(e,n){if(this.paused)return;let r=this.player;r.savePrev(),this.time+=e,this.updateEnemyScaling(),this.hasteT>0&&(this.hasteT-=e,this.hasteT<=0&&(this.hasteT=0,this.refreshStats()));let i=An(r,n,this.stats,this.map,e);i&On.Jump&&this.events.emit(t.Jump,r.x,r.y,r.z),i&On.AirJump&&this.events.emit(t.AirJump,r.x,r.y,r.z),i&On.Dash&&this.events.emit(t.Dash,r.x,r.y,r.z),i&On.Land&&this.events.emit(t.Land,r.x,r.y,r.z,r.landImpact,r.inPuddle||this.map.inPuddle(r.x,r.z)?1:0),r.invuln>0&&(r.invuln-=e),r.hurtT+=e;let a=Math.hypot(r.x-r.px,r.z-r.pz);if(this.stillT=a<.001?this.stillT+e:0,this.fx.travelPurse>0)for(this.purseM+=a;this.purseM>=30;)this.purseM-=30,this.addGold(this.fx.travelPurse);this.stats.regen>0&&r.hp<this.stats.maxHp&&(r.hp=Math.min(this.stats.maxHp,r.hp+this.stats.regen*e)),this.shield<this.stats.shield&&r.hurtT>=3&&(this.shield=Math.min(this.stats.shield,this.shield+this.stats.shield*at*e));let o=this.enemies;this.grid.build(o.n,o.alive,o.x,o.z),this.spawner.update(this,e),this.bonuses.update(this),hn(this,e),Vt(this,e),Ht(this,e),Ut(this,e),this.updateHazards(e),this.updateShots(e),this.updatePickups(e),this.updateInteract(e,n.interact),this.updateSecret(),this.explore(),!this.dead&&this.pendingLevels>0&&this.choice===null&&this.openLevelUp()}explore(){let e=this.player;this.fog.reveal(e.x,e.z);let n=this.map.landmarks;for(let r=0;r<n.length;r++){if(this.landmarksFound[r])continue;let i=n[r],a=i.r+12,o=i.x-e.x,s=i.z-e.z;o*o+s*s<a*a&&(this.landmarksFound[r]=!0,this.announce.push(`Odkryto: ${i.name}`),this.events.emit(t.Discover,i.x,this.map.heightAt(i.x,i.z),i.z,r))}}collect(e,t,n,r=this.bufA){let i=this.enemies,a=this.grid.query(e,t,n+4,this.cand),o=0;for(let s=0;s<a;s++){let a=this.cand[s];if(!i.alive[a])continue;let c=i.x[a]-e,l=i.z[a]-t,u=n+i.radius[a];c*c+l*l<=u*u&&(r[o++]=a)}return o}nearest(e,t,n,r=-1){let i=this.enemies,a=this.grid.query(e,t,n+4,this.cand),o=-1,s=(n+3)*(n+3);for(let n=0;n<a;n++){let a=this.cand[n];if(!i.alive[a]||a===r||i.spawnT[a]>.3)continue;let c=i.x[a]-e,l=i.z[a]-t,u=c*c+l*l;u<s&&(s=u,o=a)}return o}strongest(e,t,n){let r=this.enemies,i=this.grid.query(e,t,n+4,this.cand),a=(n+3)*(n+3),o=-1,s=0,c=0;for(let n=0;n<i;n++){let i=this.cand[n];if(!r.alive[i]||r.spawnT[i]>.3)continue;let l=r.x[i]-e,u=r.z[i]-t,d=l*l+u*u;if(d>=a)continue;let f=r.maxHp[i];(o<0||f>s||f===s&&d<c)&&(o=i,s=f,c=d)}return o}randomInRange(e,t,n){let r=this.collect(e,t,n,this.bufB);return r===0?-1:this.bufB[this.rng.int(r)]}damageEnemy(e,n,r,i,a,o,s,c=r){let l=this.enemies;if(!l.alive[e])return;l.killSrc[e]=c>=0?c:-1;let u=ct[l.type[e]],d=n,f=0;if(r>=0){let t=this.stats;d*=1+this.skullBonus+this.mossBonus()+this.goldPower();let n=et(t.critChance,this.rng.next());if(n>0&&(d*=tt(n,t.critDamage),f=1),o*=t.knockback,t.lifesteal>0){let e=this.player,n=Math.min(it(t.lifesteal,this.rng.next()),t.maxHp-e.hp);n>0&&!this.dead&&(e.hp+=n,this.lifestealHealed+=n)}let i=this.weapons[r];i&&(i.dealt+=d);let a=(s?s.burn*this.stats.damage:0)+d*this.stats.burn;if(a>0&&(l.burnT[e]=3,a>l.burnDps[e]&&(l.burnDps[e]=a,l.burnSrc[e]=r)),s&&s.slow>0){let t=s.slow*(1-u.weight*.7);l.slowT[e]=2,t>l.slowK[e]&&(l.slowK[e]=t)}}else r===-2?(f=2,this.thornsDealt+=d):r===-3?(f=2,this.procDealt+=d):(f=2,this.burnDealt+=d);l.hp[e]=l.hp[e]-d;let p=.035+.085*Math.min(1,d/(l.maxHp[e]*.2));if(p>l.flash[e]&&(l.flash[e]=p),o>0){let t=o*(1-u.weight);l.vx[e]=l.vx[e]+i*t,l.vz[e]=l.vz[e]+a*t}this.events.emit(t.Hit,l.x[e],l.y[e]+l.oy[e],l.z[e],d,f,u.height*(l.elite[e]?1.35:1));let m=l.x[e],h=l.z[e];l.hp[e]<=0?this.killEnemy(e):r>=0&&this.fx.marzannaScythe>0&&!u.rank&&this.rng.next()<Math.min(.6,.005*this.fx.marzannaScythe)&&(this.executions++,l.killSrc[e]=-1,l.hp[e]=0,this.events.emit(t.Hit,m,l.y[e]+l.oy[e],h,0,1,u.height),this.killEnemy(e)),r>=0&&this.itemProcs(m,h,d)}itemProcs(e,n,r){let i=this.fx;if(i.perunStone>0&&this.rng.next()<Math.min(.6,.08*i.perunStone)){let i=this.map.heightAt(e,n);this.events.emit(t.Lightning,e,i,n,e+1.5,i+22,n-1,10473727),this.procCircle(e,n,I,r*L,2)}if(i.sparkFlint>0&&this.rng.next()<Math.min(.6,.06*i.sparkFlint)){let i=3*Math.sqrt(this.stats.area);this.events.emit(t.Explosion,e,this.map.heightAt(e,n)+.8,n,i,16752704),this.procCircle(e,n,i,r*Oe,3)}}procCircle(e,t,n,r,i){let a=this.enemies,o=this.collect(e,t,n,this.bufC);for(let n=0;n<o;n++){let o=this.bufC[n],s=a.x[o]-e,c=a.z[o]-t,l=Math.hypot(s,c);l>.001&&(s/=l,c/=l),this.damageEnemy(o,r,-3,s,c,i,null)}}goldPower(){return this.character.passive.power===`goldPower`?Math.min(Fn,this.gold/10*.01):0}mossBonus(){let e=this.fx.hermitMoss;return e>0?je*e*Math.min(1,this.stillT/1):0}weaponCap(){return 15+Pe(this.fx.smithJug)}addItem(e){let t=F[e];if(!t)return;let n=this.items.find(t=>t.def.id===e);n?n.count++:this.items.push({def:t,count:1}),t.effect&&this.fx[t.effect]++,this.refreshStats()}itemCount(e){return this.items.find(t=>t.def.id===e)?.count??0}damageCircle(e,t,n,r,i,a,o){let s=this.enemies,c=this.collect(e,t,n,this.bufB);for(let n=0;n<c;n++){let c=this.bufB[n],l=s.x[c]-e,u=s.z[c]-t,d=Math.hypot(l,u);d>.001&&(l/=d,u/=d),this.damageEnemy(c,r,i,l,u,a,o)}return c}killEnemy(e){let n=this.enemies,r=n.type[e],i=ct[r],a=n.x[e],o=n.z[e],s=this.map.heightAt(a,o),c=n.elite[e];this.kills++,this.runKills++,this.fx.wraithSkull>0&&(this.skullBonus=Math.min(Ae*this.fx.wraithSkull,this.skullBonus+ke*this.fx.wraithSkull)),this.killsByType[r]=this.killsByType[r]+1;let l=this.weapons[n.killSrc[e]];if(l){let e=ve(l.def.id);this.killsByWeapon[e]=(this.killsByWeapon[e]??0)+1,l.def.rule===`fang`&&this.runHp<(l.def.evolved?80:40)&&this.rng.next()<.04&&(this.runHp+=1,this.refreshStats())}for(let e of this.weapons){if(e.def.rule!==`reap`)continue;let t=c||i.rank?1:0;e===l&&++e.tally>=20&&(e.tally=0,t++),e.charge=Math.min(3,e.charge+t)}this.events.emit(t.Kill,a,n.y[e]+n.oy[e],o,r,c,n.radius[e]);let u=this.stats.luck,d=this.rng,f=i.xp*(c?6:1);if(f>0&&this.gems.spawn(a+d.range(-.3,.3),s,o+d.range(-.3,.3),f),i.rank===`boss`){if(this.hitstop=.35,!this.endless&&!this.won){this.addGold(150);let e=this.pickups;for(let t=0;t<e.n;t++)e.alive[t]&&e.kind[t]===z.Coin&&(this.addGold(e.val[t]),e.free(t));this.won=!0,this.events.emit(t.Win,a,s,o)}else for(let e=0;e<30;e++)this.dropCoin(a+d.range(-6,6),s,o+d.range(-6,6),5)}else if(i.rank===`mini`){for(let e=0;e<10;e++)this.dropCoin(a+d.range(-2.5,2.5),s,o+d.range(-2.5,2.5),4);this.spawnChest(a,o,!0),this.pickups.spawn(z.Bread,a+1,s,o+1,30),this.hitstop=.18}else{if(c){this.spawnChest(a,o,!0);for(let e=0;e<5;e++)this.dropCoin(a+d.range(-1.5,1.5),s,o+d.range(-1.5,1.5),2)}d.next()<Wn(this.time)*(1+u*.6)?this.dropCoin(a,s,o,1):d.next()<.007*(1+u*.5)?d.next()<.25?this.pickups.spawn(z.Honey,a,s,o,60):this.pickups.spawn(z.Bread,a,s,o,25):d.next()<.0012&&this.pickups.spawn(z.Magnet,a,s,o,0)}n.free(e),i.rank&&this.trackBoss()}dropCoin(e,t,n,r){let i=this.pickups.spawn(z.Coin,e,t,n,r);i>=0?this.pickups.mag[i]=1:this.addGold(r)}despawn(e){this.enemies.free(e),e===this.bossIdx&&this.trackBoss()}trackBoss(){let e=this.enemies,t=-1,n=!1;for(let r=0;r<e.n;r++){if(!e.alive[r])continue;let i=ct[e.type[r]].rank;if(!i)continue;let a=i===`boss`;(t<0||a&&!n||a===n&&e.maxHp[r]>=e.maxHp[t])&&(t=r,n=a)}this.bossIdx=t}hurtPlayer(e,n=-1){let r=this.player;if(this.godMode||r.invuln>0||this.dead||this.won&&!this.endless)return;let i=this.stats;if(i.evasion>0&&this.rng.next()<rt(i.evasion)){r.invuln=.5,this.dodges++,this.events.emit(t.Dodge,r.x,r.y,r.z);return}if(n>=0&&i.thorns>0&&this.enemies.alive[n]){let e=this.enemies,t=e.x[n]-r.x,a=e.z[n]-r.z,o=Math.hypot(t,a)||1;if(this.damageEnemy(n,i.thorns*i.damage,-2,t/o,a/o,0,null),this.won&&!this.endless)return}if(this.guardBlock())return;let a=nt(e,i.armor);if(this.armorBlocked+=Math.max(0,e-a),r.invuln=.5+Ne*this.fx.witchMirror,r.hurtT=0,this.shield>0){let e=ot(this.shield,a);if(this.shieldAbsorbed+=a-e.through,this.shield=e.shield,a=e.through,a<=0){this.events.emit(t.ShieldHit,r.x,r.y,r.z);return}}r.hp-=a,this.damageTaken+=a,this.unhurtBest=this.longestUnhurt(),this.unhurtSince=this.time,a>this.stats.maxHp*.15&&this.hitstop<.07&&(this.hitstop=.07),this.events.emit(t.PlayerHit,r.x,r.y,r.z,a),r.hp<=0&&(this.revivesLeft>0?(this.revivesLeft--,r.hp=this.stats.maxHp*.5,r.invuln=2.5,this.events.emit(t.Revive,r.x,r.y,r.z),this.announce.push(`Żywa woda przywraca cię do życia!`),this.damageCircle(r.x,r.z,10,60*this.hpMul,-1,14,null)):(r.hp=0,this.dead=!0,this.events.emit(t.Death,r.x,r.y,r.z)))}guardBlock(){for(let e of this.weapons){if(e.def.kind!==`guard`||e.timer>0)continue;let n=e.stats,r=this.stats,i=this.player;e.timer=Math.max(St(`guard`),n.cooldown*$e(r)),i.invuln=.5+Ne*this.fx.witchMirror,this.guardBlocks++;let a=n.area*r.area;return this.events.emit(t.ShieldHit,i.x,i.y,i.z),this.events.emit(t.Sweep,i.x,i.y+.9,i.z,0,Math.PI*2,a,e.def.color),this.damageCircle(i.x,i.z,a,n.damage*(1+e.bonus)*r.damage,e.slot,n.knockback,n),!0}return!1}diceSix(e){let t=e.def.evolved?le:ce;this.runCrit>=t-1e-9||(this.runCrit=Math.min(t,this.runCrit+se),this.stats.critChance+=se)}longestUnhurt(){return Math.max(this.unhurtBest,this.time-this.unhurtSince)}findSecret(e){this.secrets.includes(e)||this.secrets.push(e)}heal(e){let n=this.player,r=n.hp;n.hp=Math.min(this.stats.maxHp,n.hp+e),n.hp>r&&this.events.emit(t.Heal,n.x,n.y,n.z,n.hp-r)}gainXp(e){this.xp+=e*this.stats.xpGain*st(this.stats.curse).reward;let t=this.level;for(;this.xp>=this.xpNeed;)this.xp-=this.xpNeed,this.level++,this.xpNeed=O(this.level),this.pendingLevels++;this.level!==t&&this.character.passive.perLevel.length>0&&this.refreshStats()}addGold(e){let t=e*this.stats.goldGain*st(this.stats.curse).reward;this.gold+=t,this.goldCollected+=t,this.runGold+=t,!this.chestHinted&&this.paidChests===0&&this.gold>=this.chestCost()&&(this.chestHinted=!0,this.announce.push(`Stać cię na skrzynię! Najbliższe widać na mapie [Tab].`))}spawnEnemy(e,t,n,r=!1){let i=this.enemies,a=i.alloc();if(a<0)return-1;let o=ct[e];i.type[a]=e,i.x[a]=t,i.z[a]=n;let s=this.map.heightAt(t,n);i.y[a]=s,i.px[a]=t,i.py[a]=s,i.pz[a]=n;let c=o.rank?Math.max(1,this.hpMul*.42):this.hpMul,l=o.hp*c*(r?8:1);return i.hp[a]=l,i.maxHp[a]=l,i.speed[a]=o.speed*(.92+this.rng.next()*.16)*st(this.stats.curse).enemySpeed,i.dmg[a]=o.damage*this.dmgMul*(r?1.4:1),i.radius[a]=o.radius*(r?1.35:1),i.elite[a]=+!!r,i.t1[a]=1+this.rng.next()*2.5,i.t2[a]=o.ai===`jaga`?5:0,i.t3[a]=4+this.rng.next()*3,i.ax[a]=this.rng.next()<.5?-1:1,i.oy[a]=o.flying?1.3:0,o.rank===`boss`&&(this.bossPhase=1,i.spawnT[a]=1.6),o.rank&&this.trackBoss(),a}spawnChest(e,t,n,r=!1,i=this.rng.range(0,6.28)){let a={x:e,y:this.map.heightAt(e,t),z:t,rot:i,free:n,gift:r,rich:!1,opened:!1,progress:0};return this.chests.push(a),a}addHazard(e,t,n,r,i,a=!1){let o=this.hazards,s=o.list.alloc();s<0||(o.alive[s]=1,o.air[s]=+!!a,o.x[s]=e,o.z[s]=t,o.y[s]=this.map.heightAt(e,t),o.r[s]=n,o.t[s]=0,o.delay[s]=r,o.dmg[s]=i)}addShot(e,n,r,i,a,o){let s=this.shots,c=s.list.alloc();c<0||(s.alive[c]=1,s.x[c]=e,s.y[c]=n,s.z[c]=r,s.px[c]=e,s.py[c]=n,s.pz[c]=r,s.vx[c]=i,s.vz[c]=a,s.life[c]=3.2,s.dmg[c]=o,this.events.emit(t.EnemyShoot,e,n,r))}addZone(e,n,r,i,a,o,s=_t.Tar){let c=this.zones,l=c.list.alloc();l<0||(c.alive[l]=1,c.slot[l]=o,c.kind[l]=s,c.x[l]=e,c.z[l]=n,c.y[l]=this.map.heightAt(e,n),c.r[l]=r,c.life[l]=i,c.span[l]=i,c.tick[l]=0,c.dmg[l]=a,this.events.emit(t.Zone,e,c.y[l],n,r,s))}updateHazards(e){let n=this.hazards,r=this.player;for(let i=0;i<n.n;i++){if(!n.alive[i]||(n.t[i]=n.t[i]+e,n.t[i]<n.delay[i]))continue;let a=r.x-n.x[i],o=r.z-n.z[i],s=n.r[i]+.15,c=0;if(a*a+o*o<s*s){let e=r.y-this.map.heightAt(r.x,r.z)>1;(n.air[i]||!e)&&(r.invuln<=0&&(c=1),this.hurtPlayer(n.dmg[i]))}this.events.emit(t.Hazard,n.x[i],n.y[i],n.z[i],n.r[i],c),n.free(i)}}updateShots(e){let n=this.shots,r=this.player;for(let i=0;i<n.n;i++){if(!n.alive[i])continue;n.px[i]=n.x[i],n.py[i]=n.y[i],n.pz[i]=n.z[i],n.x[i]=n.x[i]+n.vx[i]*e,n.z[i]=n.z[i]+n.vz[i]*e,n.y[i]=this.map.heightAt(n.x[i],n.z[i])+1.1,n.life[i]=n.life[i]-e;let a=r.x-n.x[i],o=r.z-n.z[i],s=r.y+.9-n.y[i];a*a+o*o<.5625&&Math.abs(s)<1.3?(this.hurtPlayer(n.dmg[i]),this.events.emit(t.Explosion,n.x[i],n.y[i],n.z[i],.8,10109183),n.free(i)):n.life[i]<=0&&n.free(i)}}updatePickups(e){let n=this.player,r=Bn*this.stats.pickup,i=r*r,a=this.gems,o=n.y+.9;for(let r=0;r<a.n;r++){if(!a.alive[r])continue;a.age[r]=a.age[r]+e;let s=n.x-a.x[r],c=n.z-a.z[r],l=s*s+c*c;if(a.mag[r]){let i=o-a.y[r],u=Math.sqrt(l+i*i),d=(15+a.age[r]*12)*e;if(u<=d+.5){this.gainXp(a.val[r]),this.events.emit(t.Gem,n.x,o,n.z,a.val[r]),a.free(r);continue}a.x[r]=a.x[r]+s/u*d,a.y[r]=a.y[r]+i/u*d,a.z[r]=a.z[r]+c/u*d}else l<i&&(a.mag[r]=1,a.age[r]=0)}let s=this.pickups;for(let t=0;t<s.n;t++){if(!s.alive[t])continue;s.age[t]=s.age[t]+e;let r=n.x-s.x[t],a=n.z-s.z[t],c=r*r+a*a,l=s.kind[t];if(s.mag[t]){let n=o-s.y[t],i=Math.sqrt(c+n*n),u=(16+s.age[t]*12)*e;if(i<=u+.5){this.collectPickup(l,s.val[t]),s.free(t);continue}s.x[t]=s.x[t]+r/i*u,s.y[t]=s.y[t]+n/i*u,s.z[t]=s.z[t]+a/i*u}else c<(l===z.Coin?i:2.2*2.2)&&(l!==z.Bread&&l!==z.Honey||n.hp<this.stats.maxHp-.5)&&(s.mag[t]=1,s.age[t]=0)}}collectPickup(e,n){let r=this.player;if(e===z.Coin)this.addGold(n),this.events.emit(t.Coin,r.x,r.y,r.z,n);else if(e===z.Bread||e===z.Honey)this.heal(n),this.events.emit(t.Pickup,r.x,r.y,r.z,e);else if(e===z.Magnet){let e=this.gems;for(let t=0;t<e.n;t++)e.alive[t]&&!e.mag[t]&&(e.mag[t]=1,e.age[t]=0);let n=this.pickups;for(let e=0;e<n.n;e++)n.alive[e]&&!n.mag[e]&&n.kind[e]===z.Coin&&(n.mag[e]=1,n.age[e]=0);this.events.emit(t.Magnet,r.x,r.y,r.z)}else e===z.Haste&&(this.hasteT=15,this.refreshStats(),this.announce.push(`Szał bojowy! Twoje bronie biją szybciej.`),this.events.emit(t.Haste,r.x,r.y,r.z))}chestCost(){return Math.round(10*Un**+this.paidChests)}updateInteract(e,n){let r=this.player,i=this.prompt;i.kind=``,i.progress=0;let a=this.portal;if(a&&!a.used){let t=r.x-a.x,o=r.z-a.z;if(t*t+o*o<=3.2*3.2){i.kind=`portal`,i.affordable=!0,a.progress=n?a.progress+e:0,i.progress=a.progress/In,a.progress>=1.5&&(a.used=!0,this.bossSummoned=!0,this.updateEnemyScaling(),this.hushForest(),this.spawner.summonBoss(this,a.x+7,a.z));return}a.progress=0}for(let t=0;t<this.chests.length;t++){let a=this.chests[t];if(a.opened)continue;let o=r.x-a.x,s=r.z-a.z;if(o*o+s*s>5.76){a.progress=0;continue}if(a.free){this.openChest(a);return}let c=this.chestCost();if(i.kind=`chest`,i.rich=a.rich,i.cost=c,i.affordable=this.gold>=c,n&&i.affordable){if(a.progress+=e,a.progress>=.45){this.gold-=c,this.paidChests++,this.openChest(a);return}}else a.progress=0;i.progress=a.progress/.45}for(let a=0;a<this.shrines.length;a++){let o=this.shrines[a];if(o.used)continue;let s=r.x-o.x,c=r.z-o.z,l=s*s+c*c;if(o.kind===`circle`){if(l<=25){if(o.progress+=e,i.kind=`circle`,i.affordable=!0,i.progress=o.progress/5,o.progress>=5){o.progress=0,this.choice={type:`shrine`,index:a,options:this.circleOptions(),circle:!0},this.events.emit(t.Shrine,o.x,o.y,o.z);return}}else o.progress>0&&(o.progress=Math.max(0,o.progress-zn*e))}else if(l>3.4*3.4)o.progress=0;else{if(i.kind=o.kind===`god`?`shrine`:o.kind,i.affordable=!0,n){if(o.progress+=e,o.progress>=.9){o.progress=0,this.events.emit(t.Shrine,o.x,o.y,o.z),o.kind===`god`?this.choice={type:`shrine`,index:a,options:this.blessingOptions()}:o.kind===`amber`?this.useAmberShrine(o):this.useGreedShrine(o);return}}else o.progress=0;i.progress=o.progress/.9}}}updateEnemyScaling(){let e=st(this.stats.curse),t=this.bossSummoned||this.endless?1:w(this.time);this.hpMul=T(this.time)*e.enemyHp*t,this.dmgMul=E(this.time)*e.enemyDamage*t}openPortal(){if(this.portal)return;let e=this.player,n=e.x,r=e.z+25,i=!1;for(let t=0;t<60&&!i;t++){let t=this.rng.range(0,Math.PI*2),a=this.rng.range(25,40),o=e.x+Math.cos(t)*a,s=e.z+Math.sin(t)*a;Math.hypot(o,s)>168||!this.map.isFree(o,s,3)||(n=o,r=s,i=this.clearWalk(e.x,e.z,o,s))}this.portal={x:n,y:this.map.heightAt(n,r),z:r,progress:0,used:!1},this.events.emit(t.Bonus,n,this.portal.y,r,2)}clearWalk(e,t,n,r){let i=Math.hypot(n-e,r-t),a=Math.ceil(i/1.5);for(let i=1;i<a;i++){let o=i/a;if(!this.map.isFree(e+(n-e)*o,t+(r-t)*o,.9))return!1}return!0}hushForest(){let e=this.enemies,t=this.player;for(let n=0;n<e.n;n++)e.alive[n]&&!ct[e.type[n]].rank&&Math.hypot(e.x[n]-t.x,e.z[n]-t.z)>22&&this.despawn(n)}circleOptions(){let e=qt.slice(),t=[];for(;t.length<3&&e.length>0;)t.push(e.splice(this.rng.int(e.length),1)[0]);return t}useAmberShrine(e){e.used=!0,this.shrinesUsed++;let n=this.gems;for(let e=0;e<n.n;e++)n.alive[e]&&!n.mag[e]&&(n.mag[e]=1,n.age[e]=0);let r=this.player;this.events.emit(t.Magnet,r.x,r.y,r.z),this.announce.push(`Bursztyny z całego boru lecą do ciebie!`)}useGreedShrine(e){e.used=!0,this.shrinesUsed++,this.blessings.push(Jt),this.refreshStats(),this.addGold(30),this.announce.push(`Chciwość ma swoją cenę: bór gęstnieje od wrogów.`);let t=sr(this);t&&(this.choice={type:`chest`,cards:[or(this,t)],gift:!1,greed:!0})}blessingOptions(){let e=Kt.filter(e=>this.blessings.filter(t=>t.id===e.id).length<2);return e.length>0?e:Kt}openChest(e){e.opened=!0,this.events.emit(t.ChestOpen,e.x,e.y,e.z,e.gift?1:e.rich?2:0),this.choice={type:`chest`,cards:lr(this,e.rich),gift:e.gift,rich:e.rich}}refreshStats(){this.refreshStatsInner(),this.stats.moveSpeed>this.peakMoveSpeed&&(this.peakMoveSpeed=this.stats.moveSpeed)}refreshStatsInner(){let e=this.stats.maxHp,t=this.stats.shield;this.stats=Qe(this.character,this.shopLevels,this.passives,this.blessings,this.items,this.level),this.stats.maxHp+=this.runHp,this.stats.critChance+=this.runCrit,this.hasteT>0&&(this.stats.attackSpeed=Math.min(Xe.attackSpeed,this.stats.attackSpeed*Sn)),this.stats.maxHp>e&&(this.player.hp+=this.stats.maxHp-e),this.stats.shield>t&&(this.shield+=this.stats.shield-t),this.shield>this.stats.shield&&(this.shield=this.stats.shield),this.player.hp>this.stats.maxHp&&(this.player.hp=this.stats.maxHp)}findWeapon(e){return this.weapons.find(t=>t.def.id===e)}findPassive(e){return this.passives.find(t=>t.def.id===e)}addWeapon(e){let t=pe[e];if(!t||this.weapons.length>=4)return null;let n={def:t,level:1,stats:ge(t,1),bonus:0,lines:{},slot:this.weapons.length,timer:.4,active:0,span:0,angle:0,queue:0,qT:0,dealt:0,fxCount:0,fxArea:0,ravens:[],charge:0,tally:0,lx:0,lz:0,lastT:-1e9,targets:[]};return this.weapons.push(n),n}refreshWeapon(e){e.stats=ie(ge(e.def,e.level),e.lines)}evolveWeapon(e){let n=e.def.evolution?pe[e.def.evolution.into]:void 0;if(!n)return!1;e.def=n,this.refreshWeapon(e),e.timer=.2,e.active=0,e.queue=0,e.ravens.length=0,e.targets.length=0,this.evolved++;let r=this.player;return this.events.emit(t.Evolve,r.x,r.y,r.z),this.announce.push(`Ewolucja: ${n.name}!`),!0}openLevelUp(){this.pendingLevels--;let e=this.player;this.events.emit(t.LevelUp,e.x,e.y,e.z,this.level),this.choice={type:`levelup`,cards:rr(this,3)}}choose(e){let t=this.choice;if(t){if(t.type===`shrine`){let n=t.options[e];if(!n)return;let r=this.shrines[t.index];r.used=!0,this.shrinesUsed++,this.blessings.push(n),this.refreshStats(),n.instant===`heal`&&this.heal(this.stats.maxHp),n.instant===`gold`&&this.addGold(25),this.announce.push(t.circle?`Święty krąg obdarza: ${n.name}`:`${n.god} błogosławi: ${n.name}`)}else if(t.type===`chest`&&t.rich)for(let e of t.cards)ur(this,e);else{let n=t.cards[e];if(!n)return;ur(this,n)}this.choice=null,this.player.invuln=Math.max(this.player.invuln,.6),this.pendingLevels>0&&this.openLevelUp()}}cancelChoice(){this.choice?.type===`shrine`&&!this.choice.circle&&(this.choice=null)}rerollCost(){return Math.round(8*Ln**+this.paidRerolls)}banishCost(){return Math.round(12*Rn**+this.banished.size)}reroll(){if(this.choice?.type!==`levelup`)return!1;if(this.rerollsLeft>0)this.rerollsLeft--;else{let e=this.rerollCost();if(this.gold<e)return!1;this.gold-=e,this.paidRerolls++}return this.choice={type:`levelup`,cards:rr(this,3)},!0}banish(e){let t=this.choice;if(t?.type!==`levelup`)return!1;let n=t.cards[e];if(!n||!nr(n))return!1;let r=this.banishCost();if(this.gold<r)return!1;this.gold-=r,this.banished.add(n.id);let i=new Set(t.cards.filter((t,n)=>n!==e).map(e=>`${e.kind}:${e.id}`)),a=rr(this,6).find(e=>!i.has(`${e.kind}:${e.id}`));return a?t.cards[e]=a:t.cards.splice(e,1),!0}startEndless(){this.bankedTime=this.time,this.endless=!0,this.won=!1,this.gold=0,this.goldCollected=0,this.kills=0,this.killsByType.fill(0),this.killsByWeapon={}}summary(){let e={};return ct.forEach((t,n)=>{let r=this.killsByType[n];r>0&&(e[t.id]=r)}),{character:this.character.id,time:this.time,kills:this.kills,runKills:this.runKills,runGold:Math.floor(this.runGold),silverGain:this.stats.silverGain,bankedTime:this.bankedTime,peakMoveSpeed:this.peakMoveSpeed,level:this.level,gold:Math.floor(this.gold),goldCollected:Math.floor(this.goldCollected),won:this.won,endless:this.endless,evolved:this.evolved,shrines:this.shrinesUsed,damageTaken:Math.round(this.damageTaken),killsByEnemy:e,weapons:this.weapons.map(e=>({id:e.def.id,name:e.def.name,level:e.level,dealt:Math.round(e.dealt)})),books:Object.fromEntries(this.passives.map(e=>[e.def.id,e.level])),lifestealHealed:Math.round(this.lifestealHealed),burnDealt:Math.round(this.burnDealt),killsByWeapon:{...this.killsByWeapon},longestUnhurt:this.longestUnhurt(),armorBlocked:Math.round(this.armorBlocked),bookTimes:Object.fromEntries(Object.entries(this.bookTimes).map(([e,t])=>[e,t.slice()])),secrets:this.secrets.slice()}}};function Kn(e,t){let n=t.def.evolution;return!n||t.level<5?!1:e.findPassive(n.passive)!==void 0&&pe[n.into]!==void 0}function qn(e,t,n,r,i,a=[],o=0){let s=te(t.kind,ge(t,n)).filter(e=>!a.includes(e)),c=Math.min(s.length,ee[r]-+!!i+o),l=[];for(let t=0;t<c;t++){let t=s.splice(e.int(s.length),1)[0];l.push({stat:t,value:ne(t,r)})}return l}function Jn(e,t,n,r){let i=n?n.level+1:1,a=n&&n.stats.cooldown>0&&n.stats.cooldown*$e(e.stats)<=St(t.kind)+1e-9,o=qn(e.rng,t,i,r,!n,a?[`attackSpeed`]:[],e.fx.swarogAnvil),s=n&&i<=he(t)?t.levels[i-2]?.note??``:``,c=[n?s:t.desc,re(o)].filter(e=>e).join(`. `)+(o.length?`.`:``);return{kind:`weapon`,id:t.id,rarity:r,isNew:!n,level:i,name:t.name,text:c,icon:t.icon,color:t.color,lines:o}}function Yn(e,t,n){let r=e.fixedRarity??n,i=e.fixedRarity?1:P[r].power,a=t===1?`${e.desc} ${e.fmt(e.perLevel*i)}.`:`${e.fmt(e.perLevel*i)}.`;return{kind:`passive`,id:e.id,rarity:r,isNew:t===1,level:t,name:e.name,text:a,icon:e.icon,color:e.color}}function Xn(e){let t=pe[e.def.evolution?.into??``];return{kind:`evolve`,id:e.def.id,rarity:`legendary`,isNew:!0,level:1,name:t.name,text:`Ewolucja broni „${e.def.name}”. ${t.desc}`,icon:t.icon,color:t.color}}var Zn=[{kind:`gold`,id:`zloto`,rarity:`common`,isNew:!1,level:30,name:`Sakiewka`,text:`+30 złota.`,icon:`coin`,color:16764992},{kind:`heal`,id:`chleb`,rarity:`common`,isNew:!1,level:40,name:`Chleb ze smalcem`,text:`Przywraca 40 zdrowia.`,icon:`bread`,color:14262362},{kind:`heal`,id:`miod`,rarity:`rare`,isNew:!1,level:9999,name:`Dzban miodu`,text:`Leczy do pełna.`,icon:`honey`,color:15773744}],Qn=1.6,$n=1.6,er=2.6;function tr(e){let t=[],n=new Set(e.weapons.map(e=>e.def.id));for(let n of e.weapons)Kn(e,n)?t.push({weight:7,fixed:`legendary`,make:()=>Xn(n)}):n.level<e.weaponCap()&&t.push({weight:3,make:t=>Jn(e,n.def,n,t)});for(let n of e.passives)n.level<n.def.maxLevel&&!Ze(e.stats,n.def.stat)&&t.push({weight:Qn,make:e=>Yn(n.def,n.level+1,e)});if(e.weapons.length<4){let r=fe.filter(t=>t.evolved||!e.weaponPool.has(t.id)||e.findWeapon(t.id)||e.banished.has(t.id)?!1:!(t.evolution&&n.has(t.evolution.into))),i=(e.weapons.length<3?4:2)*Math.min(1,9/Math.max(1,r.length));for(let n of r)t.push({weight:i,make:t=>Jn(e,n,void 0,t)})}if(e.passives.length<5){let n=Se.filter(t=>e.passivePool.has(t.id)&&!e.findPassive(t.id)&&!e.banished.has(t.id)&&!Ze(e.stats,t.stat)),r=Math.min($n,16/Math.max(1,n.length));for(let i of n){let n=e.weapons.some(e=>e.def.evolution?.passive===i.id);t.push({weight:n?er:r,make:e=>Yn(i,1,e)})}}return t}function nr(e){return e.isNew&&(e.kind===`weapon`||e.kind===`passive`)}function rr(e,t){let n=tr(e),r=[];for(;r.length<t&&n.length>0;){let t=e.rng.weighted(n.map(e=>e.weight)),i=n.splice(t,1)[0];r.push(i.make(i.fixed??Ee(e.rng,e.stats.luck)))}for(let e=0;r.length<t&&e<Zn.length;e++)r.push(Zn[e]);return r.slice(0,t)}var ir=.6,ar=1.6;function or(e,t,n=0){let r=e.itemCount(t.id)+n,i=r>0?`${t.desc} (masz już ${r}).`:t.desc;return{kind:`item`,id:t.id,rarity:t.rarity,isNew:r===0,level:r+1,name:t.name,text:i,icon:t.icon,color:t.color}}function sr(e,t=!1){let n=De.filter(t=>e.itemPool.has(t.id));if(t){let e=n.filter(e=>e.rarity!==`common`);e.length>0&&(n=e)}if(n.length===0)return;let r=Te(e.stats.luck+(t?ar:ir)).map((e,t)=>n.some(e=>e.rarity===we[t])?e:0),i=we[Math.max(0,e.rng.weighted(r))],a=n.filter(e=>e.rarity===i);return a[e.rng.int(a.length)]??n[e.rng.int(n.length)]}var cr={kind:`gold`,id:`zloto`,rarity:`rare`,isNew:!1,level:60,name:`Garniec złota`,text:`+60 złota.`,icon:`coin`,color:16764992};function lr(e,t=!1){let n=[];for(let t of e.weapons)if(Kn(e,t)){n.push(Xn(t));break}if(!t){if(n.length>0)return n;let t=sr(e);return[t?or(e,t):cr]}for(;n.length<2;){let t=sr(e,!0);for(let r=0;r<6&&t&&n.some(e=>e.kind===`item`&&e.id===t?.id);r++)t=sr(e,!0);if(!t){n.push(cr);continue}let r=t.id;n.push(or(e,t,n.filter(e=>e.kind===`item`&&e.id===r).length))}return n}function ur(e,t){let n=P[t.rarity];switch(t.kind){case`weapon`:{let n=e.findWeapon(t.id);if(!n)n=e.addWeapon(t.id)??void 0;else if(n.level<e.weaponCap())n.level++;else break;if(!n)break;for(let e of t.lines??[])e.stat===`damage`?n.bonus+=e.value:n.lines[e.stat]=(n.lines[e.stat]??0)+e.value;e.refreshWeapon(n);break}case`passive`:{let r=Ce[t.id];if(!r)break;let i=r.fixedRarity?1:n.power,a=e.findPassive(t.id);a?a.level<r.maxLevel&&(a.level++,a.power+=i,(e.bookTimes[r.id]??=[]).push(e.time)):e.passives.length<5&&(e.passives.push({def:r,level:1,power:i}),e.bookTimes[r.id]=[e.time]),e.refreshStats();break}case`item`:F[t.id]&&e.addItem(t.id);break;case`evolve`:{let n=e.findWeapon(t.id);n&&e.evolveWeapon(n);break}case`gold`:e.addGold(t.level);break;case`heal`:e.heal(t.level)}}var dr={sokol:1,dzik:2.5,strzybog:2,glog:1.5,mokosz:1,mgla:.5,magnes:.5,pioro:1.5},fr=7,pr=5,mr=.5,hr=2,gr=.6,_r=.4,vr=[`krag-sila`,`krag-tempo`,`krag-oko`,`krag-obszar`,`krag-zdrowie`,`krag-wal`,`krag-miod`,`krag-wiatr`],yr=e=>e.portal!==null,br=class{skill;input=En();wanderA=0;wanderT=0;react=0;dirX=0;dirZ=0;tally={rerolls:0,paidRerolls:0,banishes:0,circles:0};constructor(e=`good`){this.skill=e}update(e,t){let n=this.input,r=e.player,i=e.enemies,a=this.skill===`good`;n.camYaw=0,n.jump=!1,n.dash=!1,n.jumpHeld=!1,n.interact=!1,this.react-=t;let o=a||this.react<=0;!a&&this.react<=0&&(this.react=.22);let s=0,c=0,l=0,u=r.hp/e.stats.maxHp,d=a?2.3+Math.max(0,.65-u)*9:2.5+Math.max(0,.5-u)*5,f=1e9,p=0,m=0;for(let e=0;e<i.n;e++){if(!i.alive[e])continue;let t=r.x-i.x[e],n=r.z-i.z[e],o=i.radius[e],u=Math.hypot(t,n)||1,h=u-o;h<f&&(f=h,p=-t/u,m=-n/u);let g=i.state[e];if(a&&o>.6&&u<16&&(g===1||g===2||g===3)){let r=t*i.vz[e]-n*i.vx[e]>=0?1:-1;s+=n/u*r*.9,c+=-t/u*r*.9,l+=.3}if(h>d+(o>1?o*1.6:0)+(i.state[e]===2?2.5:0))continue;let _=1/Math.max(.25,h)**2*(o>1?2:1);s+=t/u*_,c+=n/u*_,l+=_}let h=!1,g=e.hazards;for(let e=0;e<g.n;e++){if(!g.alive[e])continue;let t=r.x-g.x[e],i=r.z-g.z[e],o=Math.hypot(t,i),u=g.r[e]+1.2;if(o<u){let r=g.delay[e]-g.t[e],d=(a?6:1.2)*(1+(u-o)),f=o||1;s+=t/f*d,c+=i/f*d,l+=d,a&&r<.22&&!g.air[e]&&(h=!0),a&&r<.5&&o<u-1.5&&(n.dash=!0)}}if(a){let t=e.shots;for(let e=0;e<t.n;e++){if(!t.alive[e])continue;let n=r.x-t.x[e],i=r.z-t.z[e];if(Math.hypot(n,i)<6){let r=t.vx[e],a=t.vz[e],o=n*a-i*r>0?1:-1,l=Math.hypot(r,a)||1;s+=a/l*o*1.5,c+=-r/l*o*1.5}}}let _=0,v=0,y=e.gems,b=a?16:22;for(let e=0;e<y.n;e++){if(!y.alive[e]||y.mag[e])continue;let t=y.x[e]-r.x,n=y.z[e]-r.z,i=Math.hypot(t,n);if(i>b||i<.01)continue;let a=(.4+y.val[e]*.15)/(i*i+2);_+=t/i*a,v+=n/i*a}let x=e.pickups;for(let e=0;e<x.n;e++){if(!x.alive[e]||x.mag[e])continue;let t=x.x[e]-r.x,n=x.z[e]-r.z,i=Math.hypot(t,n),o=x.kind[e]===z.Magnet||x.kind[e]===z.Haste;if(i>(o?a?45:28:25)||i<.01)continue;let s=o?(a?1.6:1.1)/(i*.08+1):3/(i+2);_+=t/i*s,v+=n/i*s}{let t=e.chestCost(),i=a?45:28;for(let o of e.chests){if(o.opened||!o.free&&e.gold<t)continue;let s=o.x-r.x,c=o.z-r.z,l=Math.hypot(s,c);if(l<2.4&&(n.interact=!0),l>i||l<.01)continue;let u=(o.free?2.2:1.2)*(a?1:.7)/(l*.08+1);_+=s/l*u,v+=c/l*u}}if(a&&l<.25)for(let t of e.shrines){if(t.used||t.kind===`greed`||t.kind===`circle`)continue;let e=t.x-r.x,i=t.z-r.z,a=Math.hypot(e,i);if(a<3.2&&(n.interact=!0),a>40||a<2.4)continue;let o=.9/(a*.08+1);_+=e/a*o,v+=i/a*o}let S=!1,C=a&&!yr(e)?this.nearestCircle(e):null;if(C){let e=C.x-r.x,t=C.z-r.z,n=Math.hypot(e,t),i=n<5;if(i&&u>_r){S=!0;let r=.4+5*(n/5)**3;n>.01&&(_+=e/n*r,v+=t/n*r)}else if(!i&&n<40&&l<1&&u>gr){let r=1.1/(n*.06+1);_+=e/n*r,v+=t/n*r}}let w=e.portal;if(w&&!w.used){let t=w.x-r.x,i=w.z-r.z,o=Math.hypot(t,i);if(o<2.8&&(n.interact=!0),o>.01){let n=(a?3:1.5)*(1+Math.max(0,e.time-480)/20);_+=t/o*n,v+=i/o*n}}if(f<40&&f>d+(a?.6:2.5)){let e=a?.5:.12;_+=p*e,v+=m*e}let T=Math.hypot(r.x,r.z);if(T>60){let e=(T-60)*.12;_-=r.x/T*e,v-=r.z/T*e}if(this.wanderT-=t,this.wanderT<=0&&(this.wanderT=1.5+e.rng.next()*2,this.wanderA=e.rng.next()*Math.PI*2),_+=Math.cos(this.wanderA)*.05,v+=Math.sin(this.wanderA)*.05,o){let e=a?S?1.2:5:1.6,t=s*e+_,n=c*e+v,r=Math.hypot(t,n);r>.001&&(t/=r,n/=r),this.dirX=t,this.dirZ=n}return n.moveX=this.dirX,n.moveZ=-this.dirZ,a&&(l>3.5&&r.dashCd<=0&&!S&&(n.dash=!0),h&&r.onGround&&(n.jump=!0),n.jumpHeld=!r.onGround),n}choose(e){let t=e.choice;if(!t)return 0;if(t.type===`shrine`){let n=e.player.hp<e.stats.maxHp*.5;if(t.circle){if(this.tally.circles++,this.skill!==`good`)return e.rng.int(t.options.length);let r=n?[`krag-zdrowie`,...vr]:vr,i=e=>(r.indexOf(e)+100)%100,a=0;return t.options.forEach((e,n)=>{i(e.id)<i(t.options[a].id)&&(a=n)}),a}let r=n?`mokosz`:this.skill===`good`?`perun`:t.options[e.rng.int(t.options.length)]?.id,i=t.options.findIndex(e=>e.id===r);return i>=0?i:0}return t.type===`chest`?0:this.skill===`novice`&&e.rng.chance(.5)?e.rng.int(t.cards.length):(this.skill===`good`&&this.improveOffer(e),this.best(e).i)}best(e){let t=e.choice,n=0,r=-1;return t?.type!==`levelup`&&t?.type!==`chest`||t.cards.forEach((t,i)=>{let a=this.score(e,t);a>r&&(r=a,n=i)}),{i:n,score:r}}spare(e){return e.gold-e.chestCost()*mr}improveOffer(e){for(let t=0;e.choice?.type===`levelup`;){let n=e.choice.cards.findIndex(t=>nr(t)&&t.kind===`passive`&&this.score(e,t)<pr&&!this.evolvesWith(e,t.id));if(n>=0&&this.spare(e)>=e.banishCost()&&e.banish(n)){this.tally.banishes++;continue}if(t>=hr)return;let r=this.best(e).score,i=e.rerollsLeft>0;if(r>=fr||!i&&this.spare(e)<e.rerollCost()||!e.reroll())return;t++,this.tally.rerolls++,i||this.tally.paidRerolls++}}evolvesWith(e,t){let n=e.weapons.length<4;return fe.some(r=>r.evolution?.passive===t&&(e.findWeapon(r.id)!==void 0||n&&e.weaponPool.has(r.id)&&!e.banished.has(r.id)))}nearestCircle(e){if(e.bossSummoned)return null;let t=e.player,n=null,r=1e9;for(let i of e.shrines){if(i.used||i.kind!==`circle`)continue;let e=Math.hypot(i.x-t.x,i.z-t.z);e<r&&(r=e,n=i)}return n}score(e,t){let n={common:0,rare:.5,epic:1,legendary:1.6}[t.rarity];switch(t.kind){case`evolve`:return 100;case`weapon`:return t.isNew?(e.weapons.length<4?9:5)+n:7+n;case`passive`:{if(t.id===`czarnobog`)return 1.5;let r=e.weapons.some(e=>e.def.evolution?.passive===t.id),i=r?0:(dr[t.id]??0)+(t.id===`kiel`&&e.stats.critChance<.15?2:0);return(t.isNew?r?7.5:5.5:6)+n-i}case`heal`:return e.player.hp<e.stats.maxHp*.5?4:1;default:return 2}}},xr=class{game;el;pausedRun=!1;god=!1;open=!1;constructor(e,t){this.game=t,this.el=document.createElement(`div`),this.el.className=`devmenu hidden`,e.appendChild(this.el),this.el.addEventListener(`click`,e=>{if(e.target===this.el){this.close();return}let t=e.target.closest(`[data-dev]`);t&&!t.hasAttribute(`disabled`)&&this.act(t.dataset.dev??``)})}key(e){return e===`Backquote`?(this.toggle(),!0):this.open&&e===`Escape`?(this.close(),!0):!1}toggle(){this.open?this.close():this.show()}show(){this.open=!0,this.game.state===`playing`&&(this.game.pause(),this.pausedRun=!0),this.render(),this.el.classList.remove(`hidden`)}close(){this.open=!1,this.el.classList.add(`hidden`),this.pausedRun&&this.game.state===`paused`&&this.game.resume(),this.pausedRun=!1}inRun(){let e=this.game.state;return e===`playing`||e===`paused`||e===`choice`}act(e){let t=this.game,n=t.world;switch(e){case`god`:this.god=!this.god,n.godMode=this.god,t.ui.toast(this.god?`Dev: nieśmiertelność włączona.`:`Dev: nieśmiertelność wyłączona.`);break;case`gold`:this.inRun()?(n.gold+=1e3,t.ui.toast(`Dev: +1000 złota w tym runie.`)):(t.store.data.gold+=1e3,this.saveMeta(),t.ui.toast(`Dev: +1000 złota do Chaty.`));break;case`silver`:t.store.data.silver+=100,this.saveMeta(),t.ui.toast(`Dev: +100 srebra.`);break;case`lvl1`:case`lvl5`:{if(!this.inRun()||n.dead)return;let r=e===`lvl5`?5:1;for(let e=0;e<r;e++)n.xp=n.xpNeed,n.gainXp(0);t.ui.toast(`Dev: +${r} ${r===1?`poziom`:`poziomów`} (karty po zamknięciu menu).`);break}case`editor`:break;case`close`:this.close();return}t.audio.ui(`click`),this.render()}saveMeta(){let e=this.game;e.store.save(),e.ui.save=e.store.data,e.ui.screen===`shop`&&e.ui.showShop()}render(){let e=this.inRun(),t=e&&!this.game.world.dead?``:` disabled`,n=this.game.store.data;this.el.innerHTML=`
      <div class="devmenu-box">
        <div class="devmenu-head"><b>Menu dewelopera</b><kbd>~</kbd></div>
        <button class="devmenu-row${this.god?` on`:``}" data-dev="god">Nieśmiertelność <span>${this.god?`WŁ`:`WYŁ`}</span></button>
        <button class="devmenu-row" data-dev="gold">+1000 złota <span>${e?`run`:`Chata: ${n.gold}`}</span></button>
        <button class="devmenu-row" data-dev="silver">+100 srebra <span>${n.silver}</span></button>
        <button class="devmenu-row" data-dev="lvl1"${t}>+1 poziom <span>${e?`poz. ${this.game.world.level}`:`tylko w runie`}</span></button>
        <button class="devmenu-row" data-dev="lvl5"${t}>+5 poziomów</button>
        <button class="devmenu-row" data-dev="editor" disabled>Edytor konceptów <span>tylko npm run dev</span></button>
        <button class="devmenu-row close" data-dev="close">Zamknij <span>Esc</span></button>
      </div>`}},Sr=class{game;constructor(e){this.game=e}spawn(e,t=1,n=8,r=!1,i=1.2){let a=this.game.world,o=lt[e];if(o===void 0)return[];let s=this.game.gfx.camYaw,c=[];for(let e=0;e<t;e++){let l=s+Math.PI+(t>1?(e/(t-1)-.5)*i:0),u=a.spawnEnemy(o,a.player.x+Math.sin(l)*n,a.player.z+Math.cos(l)*n,r);u>=0&&c.push(u)}return c}ring(e,t=20,n=6){let r=this.game.world,i=lt[e];if(i!==void 0)for(let e=0;e<t;e++){let a=e/t*Math.PI*2;r.spawnEnemy(i,r.player.x+Math.sin(a)*n,r.player.z+Math.cos(a)*n)}}clearEnemies(){let e=this.game.world;for(let t=0;t<e.enemies.n;t++)e.enemies.alive[t]&&e.despawn(t)}only(...e){let t=this.game.world;t.weapons.length=0;for(let t of e)this.give(t)}give(e,t){let n=this.game.world,r=pe[e];if(!r)return;let i=n.findWeapon(e)??n.addWeapon(e);i&&(i.level=Math.min(t??me(r),me(r)),n.refreshWeapon(i))}god(e=!0){let t=this.game.world;e&&(t.stats.maxHp=1e9,t.player.hp=1e9,t.refreshStats=()=>void 0)}spawner(e){this.game.world.spawner.disabled=!e,this.game.world.bonuses.disabled=!e}magnet(){return this.game.world.bonuses.dropMagnet(this.game.world)}haste(){return this.game.world.bonuses.dropHaste(this.game.world)}gift(){return this.game.world.bonuses.dropGift(this.game.world)}time(e){this.game.world.time=e}teleport(e,t){let n=this.game.world.player;n.x=e,n.z=t,n.y=this.game.world.map.heightAt(e,t),n.savePrev()}gold(e){this.game.world.gold+=e}xp(e){this.game.world.gainXp(e)}},Cr=[{id:`survive3`,name:`Pierwszy zmierzch`,desc:`Przetrwaj 3 minuty.`,reward:`Broń: Lodowy oddech Marzanny`,cond:{type:`survive`,seconds:180}},{id:`survive5`,name:`Noc w borze`,desc:`Przetrwaj 5 minut.`,reward:`Postać: Dobrosława`,cond:{type:`survive`,seconds:300}},{id:`kills1000`,name:`Pogromca licha`,desc:`Pokonaj łącznie 1000 wrogów.`,reward:`Postać: Bogumił`,cond:{type:`totalKills`,count:1e3}},{id:`jaga`,name:`Stłuczony moździerz`,desc:`Pokonaj Babę Jagę.`,reward:`Postać: Jagna, broń: Kruki Welesa`,cond:{type:`killEnemy`,enemy:`jaga`}},{id:`level15`,name:`Zaprawiony w boju`,desc:`Osiągnij 15. poziom w jednym runie.`,reward:`Broń: Włócznia Świętowita`,cond:{type:`level`,level:15}},{id:`kills3000`,name:`Postrach kniei`,desc:`Pokonaj łącznie 3000 wrogów.`,reward:`Broń: Garniec dziegciu`,cond:{type:`totalKills`,count:3e3}},{id:`shrines3`,name:`Pobożny wędrowiec`,desc:`Odwiedź 3 kapliczki w jednym runie.`,reward:`Księga Żar-ptaka (podwójny skok)`,cond:{type:`shrines`,count:3}},{id:`poludnica`,name:`Zmierzch południa`,desc:`Pokonaj Południcę.`,reward:`150 złota`,cond:{type:`killEnemy`,enemy:`poludnica`},gold:150},{id:`evolve`,name:`Dar bogów`,desc:`Ewoluuj dowolną broń.`,reward:`150 złota`,cond:{type:`evolve`},gold:150},{id:`gold1000`,name:`Skarbnik`,desc:`Zbierz łącznie 1000 złota.`,reward:`200 złota`,cond:{type:`totalGold`,count:1e3},gold:200},{id:`leszy`,name:`Władca boru`,desc:`Pokonaj Leszego.`,reward:`Tryb nieskończony, Księga Czarnoboga (klątwa), 500 złota`,cond:{type:`win`},gold:500},{id:`bookKiel`,name:`Sokole oko`,desc:`Podnieś Księgę Sokoła do 8. poziomu w jednym runie.`,reward:`Księga Wilczego Kła (obrażenia krytyczne)`,cond:{type:`book`,book:`sokol`,level:8}},{id:`bookGrod`,name:`Lipowy mur`,desc:`Podnieś Księgę Lipowej Tarczy do 6. poziomu w jednym runie.`,reward:`Księga Grodu (tarcza)`,cond:{type:`book`,book:`tarcza`,level:6}},{id:`bookGlog`,name:`Twardy jak tur`,desc:`Podnieś Księgę Tura do 8. poziomu w jednym runie.`,reward:`Księga Głogu (ciernie)`,cond:{type:`book`,book:`serce`,level:8}},{id:`bookMgla`,name:`Lekki krok`,desc:`Osiągnij +35% szybkości ruchu w jednym runie.`,reward:`Księga Mgły (unik)`,cond:{type:`speed`,value:1.35}},{id:`bookMokosz`,name:`Szeroki zamach`,desc:`Podnieś Księgę Dębu do 8. poziomu w jednym runie.`,reward:`Księga Mokoszy (czas działania)`,cond:{type:`book`,book:`amulet`,level:8}},{id:`bookStrzybog`,name:`Grad krzemieni`,desc:`Podnieś Księgę Krzemieni do 2. poziomu w jednym runie.`,reward:`Księga Strzyboga (szybkość pocisków)`,cond:{type:`book`,book:`sakwa`,level:2}},{id:`bookStrzyga`,name:`Krwawe żniwo`,desc:`Pokonaj 1500 wrogów w jednym runie.`,reward:`Księga Strzygi (kradzież życia)`,cond:{type:`runKills`,count:1500}},{id:`bookDzik`,name:`Taran`,desc:`Pokonaj łącznie 5000 wrogów.`,reward:`Księga Dzika (odrzut)`,cond:{type:`totalKills`,count:5e3}},{id:`luk`,name:`Oko łowczyni`,desc:`Podnieś Księgę Sokoła do 10. poziomu w jednym runie.`,reward:`Broń: Łuk Dziewanny`,cond:{type:`book`,book:`sokol`,level:10}},{id:`szabla`,name:`Zbójnicki fach`,desc:`Pokonaj łącznie 2000 wrogów Ciupagą (lub Toporem Peruna).`,reward:`Broń: Szabla`,cond:{type:`weaponKills`,weapon:`ciupaga`,count:2e3}},{id:`wir`,name:`Siła dzika`,desc:`Podnieś Księgę Dzika do 10. poziomu w jednym runie.`,reward:`Broń: Wir Pochwista`,cond:{type:`book`,book:`dzik`,level:10}},{id:`studnia`,name:`Szept Czarnoboga`,desc:`Podnieś Księgę Czarnoboga do 10. poziomu w jednym runie.`,reward:`Broń: Studnia Nawii`,cond:{type:`book`,book:`czarnobog`,level:10}},{id:`roj`,name:`Bartnik`,desc:`Podnieś Wianek z ziół (lub Kwiat Paproci) do 15. poziomu w jednym runie.`,reward:`Broń: Rój pszczół`,cond:{type:`weaponLevel`,weapon:`wianek`,level:15}},{id:`wapierz`,name:`Smak krwi`,desc:`Podnieś Księgę Strzygi do 12. poziomu w jednym runie.`,reward:`Broń: Kieł wąpierza`,cond:{type:`book`,book:`strzyga`,level:12}},{id:`kostki`,name:`Ulubieniec Welesa`,desc:`Podnieś Księgę Welesa do 12. poziomu w jednym runie.`,reward:`Broń: Kostki Welesa`,cond:{type:`book`,book:`podkowa`,level:12}},{id:`miotla`,name:`Pogromca wiedźmy`,desc:`Pokonaj Babę Jagę łącznie 3 razy.`,reward:`Broń: Miotła Jagi`,cond:{type:`enemyKills`,enemy:`jaga`,count:3}},{id:`kosisko`,name:`Żniwa w południe`,desc:`Pokonaj Południcę łącznie 3 razy.`,reward:`Broń: Kosa Południcy`,cond:{type:`enemyKills`,enemy:`poludnica`,count:3}},{id:`wnyki`,name:`Smolarz`,desc:`Pokonaj łącznie 5000 wrogów Garncem dziegciu (lub Smoczą Smołą).`,reward:`Broń: Wnyki`,cond:{type:`weaponKills`,weapon:`dziegiec`,count:5e3}},{id:`puklerz`,name:`Żelazna skóra`,desc:`Bogumiłem zatrzymaj pancerzem 500 obrażeń w jednym runie.`,reward:`Broń: Puklerz`,cond:{type:`armorBlocked`,amount:500,character:`bogumil`}},{id:`miecz`,name:`W objęciach klątwy`,desc:`Podnieś Księgę Czarnoboga do 15. poziomu przed upływem 6. minuty runu.`,reward:`Broń: Miecz Nawii`,cond:{type:`book`,book:`czarnobog`,level:15,before:360}},{id:`krzywula`,name:`Pod starym dębem`,desc:`Znajdź krzywy kij ukryty pod jednym z dębów w borze.`,reward:`Skarbiec: Krzywula`,cond:{type:`secret`,id:`krzywula`}},{id:`heroRadogost`,name:`Pełny trzos`,desc:`Zbierz 400 złota w jednym runie.`,reward:`Postać: Radogost`,cond:{type:`runGold`,count:400}},{id:`heroStrzezymir`,name:`Wiatr w nogach`,desc:`Osiągnij +60% szybkości ruchu w jednym runie.`,reward:`Postać: Strzeżymir`,cond:{type:`speed`,value:1.6}},{id:`heroMszczuj`,name:`Pragnienie`,desc:`Ulecz 300 zdrowia kradzieżą życia w jednym runie.`,reward:`Postać: Mszczuj`,cond:{type:`lifesteal`,amount:300}},{id:`itemLapcie`,name:`Wiatr pod stopami`,desc:`Osiągnij +50% szybkości ruchu w jednym runie.`,reward:`Skarbiec: Skrzydlate łapcie`,cond:{type:`speed`,value:1.5}},{id:`itemLustro`,name:`Nietknięty`,desc:`Przetrwaj 5 minut, tracąc łącznie najwyżej 150 zdrowia.`,reward:`Skarbiec: Lustro wiedźmy`,cond:{type:`unhurt`,seconds:300,damage:150}},{id:`itemDzban`,name:`Mistrz kuźni`,desc:`Podnieś dowolną broń do 15. poziomu w jednym runie.`,reward:`Skarbiec: Dzban kowala`,cond:{type:`weaponLevel`,level:15}},{id:`itemKowadlo`,name:`Trzy przemiany`,desc:`Ewoluuj 3 bronie w jednym runie.`,reward:`Skarbiec: Kowadło Swaroga`,cond:{type:`evolveCount`,count:3}},{id:`itemKosa`,name:`Kosiarz`,desc:`Pokonaj 3000 wrogów w jednym runie.`,reward:`Skarbiec: Kosa Marzanny`,cond:{type:`runKills`,count:3e3}},{id:`winDobroslawa`,name:`Zielna moc`,desc:`Pokonaj Leszego Dobrosławą.`,reward:`Broń: Wrzeciono Mokoszy, 300 złota`,cond:{type:`winWith`,character:`dobroslawa`},gold:300},{id:`winBogumil`,name:`Kute żelazo`,desc:`Pokonaj Leszego Bogumiłem.`,reward:`300 złota`,cond:{type:`winWith`,character:`bogumil`},gold:300}];Object.fromEntries(Cr.map(e=>[e.id,e]));function wr(e,t){return!t||e.achievements.includes(t)}function Tr(e){return fe.filter(t=>!t.evolved&&(t.silver?e.bought.includes(`weapon:${t.id}`):wr(e,t.unlock))).map(e=>e.id)}function Er(e){return Se.filter(t=>wr(e,t.unlock)).map(e=>e.id)}function Dr(e){return De.filter(t=>t.silver?e.bought.includes(`item:${t.id}`):wr(e,t.unlock)).map(e=>e.id)}var Or={w:4,b:6,i:6};function kr(e,t){return t===`w`?Tr(e):t===`b`?Er(e):Dr(e)}function Ar(e,t){return kr(e,t).filter(n=>!e.disabled.includes(`${t}:${n}`))}function jr(e){return e===`toggler`||e.startsWith(`item:`)||e.startsWith(`weapon:`)}function Mr(e,t){return jr(t)?Nr(e,t):Wr(e,t)}function Nr(e,t){if(e.bought.includes(t))return!1;let n;if(t===`toggler`)n=30;else if(t.startsWith(`weapon:`)){let r=pe[t.slice(7)];if(!r?.silver||r.evolved||!wr(e,r.unlock))return!1;n=r.silver}else{let r=F[t.replace(/^item:/,``)];if(!r?.silver||!t.startsWith(`item:`)||!wr(e,r.unlock))return!1;n=r.silver}return e.silver<n?!1:(e.silver-=n,e.bought.push(t),!0)}function Pr(e,t,n){if(!e.bought.includes(`toggler`)||!kr(e,t).includes(n))return!1;let r=`${t}:${n}`,i=e.disabled.indexOf(r);return i>=0?(e.disabled.splice(i,1),!0):Ar(e,t).length<=Or[t]?!1:(e.disabled.push(r),!0)}function Fr(e,t){let n=Math.max(0,e.time-e.bankedTime)/60+e.kills/400+(e.won?10:0);return Math.floor(n*Math.max(0,t))}function Ir(e){switch(e.type){case`survive`:case`unhurt`:case`unhurtStreak`:return e.seconds;case`totalKills`:case`runKills`:case`totalGold`:case`shrines`:case`runGold`:case`evolveCount`:case`weaponKills`:case`enemyKills`:return e.count;case`level`:case`book`:case`weaponLevel`:return e.level;case`speed`:return e.value-1;case`lifesteal`:case`armorBlocked`:return e.amount;default:return null}}function Lr(e,t){switch(e.type){case`totalKills`:return t.stats.kills;case`totalGold`:return t.stats.gold;case`weaponKills`:return t.stats.killsByWeapon[e.weapon]??0;case`enemyKills`:return t.stats.killsByEnemy[e.enemy]??0;default:return null}}function Rr(e,t){switch(e.type){case`survive`:return t.time;case`runKills`:return t.runKills;case`level`:return t.level;case`shrines`:return t.shrines;case`book`:{if(e.before===void 0)return t.books[e.book]??0;let n=e.before;return(t.bookTimes[e.book]??[]).filter(e=>e<=n).length}case`runGold`:return t.runGold;case`speed`:return t.peakMoveSpeed-1;case`evolveCount`:return t.evolved;case`weaponLevel`:return t.weapons.reduce((t,n)=>e.weapon===void 0||ve(n.id)===e.weapon?Math.max(t,n.level):t,0);case`unhurt`:return t.damageTaken<=e.damage?t.time:0;case`lifesteal`:return t.lifestealHealed;case`unhurtStreak`:return t.longestUnhurt;case`armorBlocked`:return e.character===void 0||t.character===e.character?t.armorBlocked:null;default:return null}}function zr(e,t){for(let[n,r]of Object.entries(t))r>0&&(e[n]=(e[n]??0)+r)}function Br(e,t,n){switch(e.type){case`survive`:return n.time>=e.seconds||n.won;case`totalKills`:return t.stats.kills>=e.count;case`runKills`:return n.runKills>=e.count;case`killEnemy`:return(n.killsByEnemy[e.enemy]??0)>0;case`level`:return n.level>=e.level;case`evolve`:return n.evolved>0;case`totalGold`:return t.stats.gold>=e.count;case`win`:return n.won;case`winWith`:return n.won&&n.character===e.character;case`shrines`:return n.shrines>=e.count;case`book`:case`weaponLevel`:case`unhurtStreak`:case`armorBlocked`:{let t=Rr(e,n);return t!==null&&t>=Ir(e)}case`weaponKills`:case`enemyKills`:return Lr(e,t)>=e.count;case`secret`:return t.found.includes(e.id);case`runGold`:return n.runGold>=e.count;case`speed`:return n.peakMoveSpeed>=e.value-1e-9;case`evolveCount`:return n.evolved>=e.count;case`unhurt`:return n.time>=e.seconds&&n.damageTaken<=e.damage;case`lifesteal`:return n.lifestealHealed>=e.amount}}function Vr(e,t){t.endless||e.stats.runs++,t.won&&e.stats.wins++,e.stats.kills+=t.kills,e.stats.gold+=t.goldCollected,zr(e.stats.killsByWeapon,t.killsByWeapon),zr(e.stats.killsByEnemy,t.killsByEnemy);for(let n of t.secrets)e.found.includes(n)||e.found.push(n);for(let n of t.weapons)pe[n.id]?.evolved&&!e.evolutionsSeen.includes(n.id)&&e.evolutionsSeen.push(n.id);t.time>e.stats.bestTime&&(e.stats.bestTime=t.time),t.level>e.stats.bestLevel&&(e.stats.bestLevel=t.level),e.gold+=t.gold;let n=Fr(t,t.silverGain);e.silver+=n;let r=[],i=0;for(let n of Cr)if(!e.achievements.includes(n.id)){if(Br(n.cond,e,t))e.achievements.push(n.id),r.push(n),n.gold&&(i+=n.gold,e.gold+=n.gold),delete e.best[n.id];else{let r=Rr(n.cond,t);r!==null&&r>(e.best[n.id]??0)&&(e.best[n.id]=r)}}return{goldBanked:t.gold,goldBonus:i,silver:n,unlocked:r}}function Hr(e){let t=[];for(let n of Cr){if(e.achievements.includes(n.id))continue;let r=n.cond,i=Lr(r,e);(i===null?r.type===`secret`&&e.found.includes(r.id):i>=Ir(r))&&(e.achievements.push(n.id),n.gold&&(e.gold+=n.gold),t.push(n))}return t}function Ur(e,t){let n=Ir(t.cond);if(n===null)return null;if(e.achievements.includes(t.id))return{have:n,need:n};let r=Lr(t.cond,e)??e.best[t.id]??0;return t.cond.type===`survive`&&(r=Math.max(r,e.stats.bestTime)),t.cond.type===`level`&&(r=Math.max(r,e.stats.bestLevel)),{have:Math.max(0,Math.min(n,r)),need:n}}function Wr(e,t){let n=qe[t];if(!n)return!1;let r=e.shop[t]??0;if(r>=n.maxLevel)return!1;let i=Je(n,r);return e.gold<i?!1:(e.gold-=i,e.shop[t]=r+1,!0)}var Gr=`megaberg-slowianskie-bory-v1`;function Kr(){return{version:1,gold:0,silver:0,bought:[],disabled:[],shop:{},achievements:[],stats:{runs:0,wins:0,kills:0,gold:0,bestTime:0,bestLevel:0,killsByWeapon:{},killsByEnemy:{}},found:[],evolutionsSeen:[],best:{},options:{master:.8,music:.6,sfx:.8,sensitivity:1,damageNumbers:!0,shake:!0,quality:2},character:m[0].id}}function qr(e,t,n=-1/0,r=1/0){return typeof e==`number`&&Number.isFinite(e)?Math.min(r,Math.max(n,e)):t}function Jr(e){let t=Kr();if(!e||typeof e!=`object`)return t;let n=e;t.gold=Math.floor(qr(n.gold,0,0)),t.silver=Math.floor(qr(n.silver,0,0));let r=e=>Array.isArray(e)?e.filter(e=>typeof e==`string`):[],i=(e,t)=>{let n={};if(!e||typeof e!=`object`||Array.isArray(e))return n;for(let[r,i]of Object.entries(e)){let e=t?Math.floor(qr(i,0,0)):qr(i,0,0);e>0&&(n[r]=e)}return n};if(t.bought=r(n.bought),t.disabled=r(n.disabled),t.found=[...new Set(r(n.found))],t.evolutionsSeen=[...new Set(r(n.evolutionsSeen))],t.best=i(n.best,!1),n.shop&&typeof n.shop==`object`)for(let[e,r]of Object.entries(n.shop)){let n=Math.floor(qr(r,0,0,99));n>0&&(t.shop[e]=n)}if(Array.isArray(n.achievements)&&(t.achievements=n.achievements.filter(e=>typeof e==`string`)),n.stats&&typeof n.stats==`object`){let e=n.stats;t.stats.runs=Math.floor(qr(e.runs,0,0)),t.stats.wins=Math.floor(qr(e.wins,0,0)),t.stats.kills=Math.floor(qr(e.kills,0,0)),t.stats.gold=Math.floor(qr(e.gold,0,0)),t.stats.bestTime=qr(e.bestTime,0,0),t.stats.bestLevel=Math.floor(qr(e.bestLevel,0,0)),t.stats.killsByWeapon=i(e.killsByWeapon,!0),t.stats.killsByEnemy=i(e.killsByEnemy,!0)}if(n.options&&typeof n.options==`object`){let e=n.options;t.options.master=qr(e.master,t.options.master,0,1),t.options.music=qr(e.music,t.options.music,0,1),t.options.sfx=qr(e.sfx,t.options.sfx,0,1),t.options.sensitivity=qr(e.sensitivity,t.options.sensitivity,.2,3),typeof e.damageNumbers==`boolean`&&(t.options.damageNumbers=e.damageNumbers),typeof e.shake==`boolean`&&(t.options.shake=e.shake),t.options.quality=Math.round(qr(e.quality,t.options.quality,0,2))}return typeof n.character==`string`&&m.some(e=>e.id===n.character)&&(t.character=n.character),t}var Yr=class{store;data;healthy=!0;constructor(e){this.store=e,this.data=this.load()}load(){if(!this.store)return Kr();try{let e=this.store.getItem(Gr);return e?Jr(JSON.parse(e)):Kr()}catch{return this.healthy=!1,Kr()}}save(){if(!this.store)return!1;try{return this.store.setItem(Gr,JSON.stringify(this.data)),this.healthy=!0,!0}catch{return this.healthy=!1,!1}}reset(){let e=this.data.options;this.data=Kr(),this.data.options=e;try{this.store?.removeItem(Gr)}catch{this.healthy=!1}this.save()}};function Xr(){try{return typeof localStorage<`u`?localStorage:null}catch{return null}}var Zr=1e3,Qr=1001,$r=1002,ei=1003,ti=1004,ni=1005,ri=1006,ii=1007,ai=1008,oi=1009,si=1010,ci=1011,li=1012,ui=1013,di=1014,fi=1015,pi=1016,mi=1017,hi=1018,gi=1020,_i=35902,vi=35899,yi=1021,bi=1022,xi=1023,Si=1026,Ci=1027,wi=1028,Ti=1029,Ei=1030,Di=1031,Oi=1033,ki=33776,Ai=33777,ji=33778,Mi=33779,Ni=35840,Pi=35841,Fi=35842,Ii=35843,Li=36196,Ri=37492,zi=37496,Bi=37488,Vi=37489,Hi=37490,Ui=37491,Wi=37808,Gi=37809,Ki=37810,qi=37811,Ji=37812,Yi=37813,Xi=37814,Zi=37815,Qi=37816,$i=37817,ea=37818,ta=37819,na=37820,ra=37821,ia=36492,aa=36494,oa=36495,sa=36283,ca=36284,la=36285,ua=36286,da=2300,fa=2301,pa=2302,ma=2303,ha=2400,ga=2401,_a=2402,va=3200,ya=`srgb`,ba=`srgb-linear`,xa=`linear`,Sa=`srgb`,Ca=7680,wa=35044,Ta=35048,Ea=2e3;function Da(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Oa(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function ka(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Aa(){let e=ka(`canvas`);return e.style.display=`block`,e}var ja={};function Ma(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Na(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function B(...e){e=Na(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function V(...e){e=Na(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Pa(...e){let t=e.join(` `);t in ja||(ja[t]=!0,B(...e))}function Fa(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Ia={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},La=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Ra=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),za=1234567,Ba=Math.PI/180,Va=180/Math.PI;function Ha(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ra[e&255]+Ra[e>>8&255]+Ra[e>>16&255]+Ra[e>>24&255]+`-`+Ra[t&255]+Ra[t>>8&255]+`-`+Ra[t>>16&15|64]+Ra[t>>24&255]+`-`+Ra[n&63|128]+Ra[n>>8&255]+`-`+Ra[n>>16&255]+Ra[n>>24&255]+Ra[r&255]+Ra[r>>8&255]+Ra[r>>16&255]+Ra[r>>24&255]).toLowerCase()}function H(e,t,n){return Math.max(t,Math.min(n,e))}function Ua(e,t){return(e%t+t)%t}function Wa(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function Ga(e,t,n){return e===t?0:(n-e)/(t-e)}function Ka(e,t,n){return(1-n)*e+n*t}function qa(e,t,n,r){return Ka(e,t,1-Math.exp(-n*r))}function Ja(e,t=1){return t-Math.abs(Ua(e,t*2)-t)}function Ya(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function Xa(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function Za(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Qa(e,t){return e+Math.random()*(t-e)}function $a(e){return e*(.5-Math.random())}function eo(e){e!==void 0&&(za=e);let t=za+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function to(e){return e*Ba}function no(e){return e*Va}function ro(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function io(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ao(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function oo(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:B(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function so(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function co(e,t){if(t.constructor===Float32Array)return e;let n=so(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function lo(e,t){if(t.constructor===Float32Array)return e;let n=so(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var uo={DEG2RAD:Ba,RAD2DEG:Va,generateUUID:Ha,clamp:H,euclideanModulo:Ua,mapLinear:Wa,inverseLerp:Ga,lerp:Ka,damp:qa,pingpong:Ja,smoothstep:Ya,smootherstep:Xa,randInt:Za,randFloat:Qa,randFloatSpread:$a,seededRandom:eo,degToRad:to,radToDeg:no,isPowerOfTwo:ro,ceilPowerOfTwo:io,floorPowerOfTwo:ao,setQuaternionFromProperEuler:oo,normalize:lo,denormalize:co},U=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},fo=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:B(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(H(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},W=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(mo.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(mo.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return po.copy(this).projectOnVector(e),this.sub(po)}reflect(e){return this.sub(po.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(H(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},po=new W,mo=new fo,G=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return Pa(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(ho.makeScale(e,t)),this}rotate(e){return Pa(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(ho.makeRotation(-e)),this}translate(e,t){return Pa(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(ho.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ho=new G,go=new G().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_o=new G().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function vo(){let e={enabled:!0,workingColorSpace:ba,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=yo(e.r),e.g=yo(e.g),e.b=yo(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=bo(e.r),e.g=bo(e.g),e.b=bo(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?xa:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[ba]:{primaries:t,whitePoint:r,transfer:xa,toXYZ:go,fromXYZ:_o,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ya},outputColorSpaceConfig:{drawingBufferColorSpace:ya}},[ya]:{primaries:t,whitePoint:r,transfer:Sa,toXYZ:go,fromXYZ:_o,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ya}}}),e}var K=vo();function yo(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function bo(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var xo,So=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{xo===void 0&&(xo=ka(`canvas`)),xo.width=e.width,xo.height=e.height;let t=xo.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=xo}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=ka(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=yo(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(yo(t[e]/255)*255):t[e]=yo(t[e]);return{data:t,width:e.width,height:e.height}}return B(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Co=0,wo=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Co++}),this.uuid=Ha(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(To(r[t].image)):e.push(To(r[t]))}else e=To(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function To(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?So.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(B(`Texture: Unable to serialize Texture.`),{})}var Eo=0,Do=new W,Oo=class e extends La{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=Qr,i=Qr,a=ri,o=ai,s=xi,c=oi,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Eo++}),this.uuid=Ha(),this.name=``,this.source=new wo(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new U(0,0),this.repeat=new U(1,1),this.center=new U(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new G,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Do).x}get height(){return this.source.getSize(Do).y}get depth(){return this.source.getSize(Do).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){B(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?B(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zr:e.x-=Math.floor(e.x);break;case Qr:e.x=e.x<0?0:1;break;case $r:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case Zr:e.y-=Math.floor(e.y);break;case Qr:e.y=e.y<0?0:1;break;case $r:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Oo.DEFAULT_IMAGE=null,Oo.DEFAULT_MAPPING=300,Oo.DEFAULT_ANISOTROPY=1;var ko=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=H(this.x,e.x,t.x),this.y=H(this.y,e.y,t.y),this.z=H(this.z,e.z,t.z),this.w=H(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=H(this.x,e,t),this.y=H(this.y,e,t),this.z=H(this.z,e,t),this.w=H(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(H(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ao=class extends La{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ri,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ko(0,0,e,t),this.scissorTest=!1,this.viewport=new ko(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new Oo({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:ri,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new wo(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},jo=class extends Ao{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Mo=class extends Oo{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ei,this.minFilter=ei,this.wrapR=Qr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},No=class extends Oo{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ei,this.minFilter=ei,this.wrapR=Qr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Po=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Fo.setFromMatrixColumn(e,0).length(),i=1/Fo.setFromMatrixColumn(e,1).length(),a=1/Fo.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lo,e,Ro)}lookAt(e,t,n){let r=this.elements;return Vo.subVectors(e,t),Vo.lengthSq()===0&&(Vo.z=1),Vo.normalize(),zo.crossVectors(n,Vo),zo.lengthSq()===0&&(Math.abs(n.z)===1?Vo.x+=1e-4:Vo.z+=1e-4,Vo.normalize(),zo.crossVectors(n,Vo)),zo.normalize(),Bo.crossVectors(Vo,zo),r[0]=zo.x,r[4]=Bo.x,r[8]=Vo.x,r[1]=zo.y,r[5]=Bo.y,r[9]=Vo.y,r[2]=zo.z,r[6]=Bo.z,r[10]=Vo.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],ee=r[14],M=r[3],te=r[7],ne=r[11],re=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*te,i[8]=a*C+o*D+s*j+c*ne,i[12]=a*w+o*O+s*ee+c*re,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*te,i[9]=l*C+u*D+d*j+f*ne,i[13]=l*w+u*O+d*ee+f*re,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*te,i[10]=p*C+m*D+h*j+g*ne,i[14]=p*w+m*O+h*ee+g*re,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*te,i[11]=_*C+v*D+y*j+b*ne,i[15]=_*w+v*O+y*ee+b*re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Fo.set(r[0],r[1],r[2]).length(),o=Fo.set(r[4],r[5],r[6]).length(),s=Fo.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Io.copy(this);let c=1/a,l=1/o,u=1/s;return Io.elements[0]*=c,Io.elements[1]*=c,Io.elements[2]*=c,Io.elements[4]*=l,Io.elements[5]*=l,Io.elements[6]*=l,Io.elements[8]*=u,Io.elements[9]*=u,Io.elements[10]*=u,t.setFromRotationMatrix(Io),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ea,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ea,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Fo=new W,Io=new Po,Lo=new W(0,0,0),Ro=new W(1,1,1),zo=new W,Bo=new W,Vo=new W,Ho=new Po,Uo=new fo,Wo=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(H(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-H(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(H(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-H(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(H(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-H(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:B(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ho.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ho,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Uo.setFromEuler(this),this.setFromQuaternion(Uo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wo.DEFAULT_ORDER=`XYZ`;var Go=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Ko=0,qo=new W,Jo=new fo,Yo=new Po,Xo=new W,Zo=new W,Qo=new W,$o=new fo,es=new W(1,0,0),ts=new W(0,1,0),ns=new W(0,0,1),rs={type:`added`},is={type:`removed`},as={type:`childadded`,child:null},os={type:`childremoved`,child:null},ss=class e extends La{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ko++}),this.uuid=Ha(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new W,n=new Wo,r=new fo,i=new W(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Po},normalMatrix:{value:new G}}),this.matrix=new Po,this.matrixWorld=new Po,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Go,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Jo.setFromAxisAngle(e,t),this.quaternion.multiply(Jo),this}rotateOnWorldAxis(e,t){return Jo.setFromAxisAngle(e,t),this.quaternion.premultiply(Jo),this}rotateX(e){return this.rotateOnAxis(es,e)}rotateY(e){return this.rotateOnAxis(ts,e)}rotateZ(e){return this.rotateOnAxis(ns,e)}translateOnAxis(e,t){return qo.copy(e).applyQuaternion(this.quaternion),this.position.add(qo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(es,e)}translateY(e){return this.translateOnAxis(ts,e)}translateZ(e){return this.translateOnAxis(ns,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yo.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Xo.copy(e):Xo.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Zo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yo.lookAt(Zo,Xo,this.up):Yo.lookAt(Xo,Zo,this.up),this.quaternion.setFromRotationMatrix(Yo),r&&(Yo.extractRotation(r.matrixWorld),Jo.setFromRotationMatrix(Yo),this.quaternion.premultiply(Jo.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(V(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(rs),as.child=e,this.dispatchEvent(as),as.child=null):V(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(is),os.child=e,this.dispatchEvent(os),os.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Yo.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yo.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yo),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(rs),as.child=e,this.dispatchEvent(as),as.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zo,e,Qo),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zo,$o,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};ss.DEFAULT_UP=new W(0,1,0),ss.DEFAULT_MATRIX_AUTO_UPDATE=!0,ss.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var cs=class extends ss{constructor(){super(),this.isGroup=!0,this.type=`Group`}},ls={type:`move`},us=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new cs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new cs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new cs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ls)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new cs;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ds={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fs={h:0,s:0,l:0},ps={h:0,s:0,l:0};function ms(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var q=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ya){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,K.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=K.workingColorSpace){return this.r=e,this.g=t,this.b=n,K.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=K.workingColorSpace){if(e=Ua(e,1),t=H(t,0,1),n=H(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=ms(i,r,e+1/3),this.g=ms(i,r,e),this.b=ms(i,r,e-1/3)}return K.colorSpaceToWorking(this,r),this}setStyle(e,t=ya){function n(t){t!==void 0&&parseFloat(t)<1&&B(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:B(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);B(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ya){let n=ds[e.toLowerCase()];return n===void 0?B(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yo(e.r),this.g=yo(e.g),this.b=yo(e.b),this}copyLinearToSRGB(e){return this.r=bo(e.r),this.g=bo(e.g),this.b=bo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ya){return K.workingToColorSpace(hs.copy(this),e),Math.round(H(hs.r*255,0,255))*65536+Math.round(H(hs.g*255,0,255))*256+Math.round(H(hs.b*255,0,255))}getHexString(e=ya){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=K.workingColorSpace){K.workingToColorSpace(hs.copy(this),t);let n=hs.r,r=hs.g,i=hs.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=K.workingColorSpace){return K.workingToColorSpace(hs.copy(this),t),e.r=hs.r,e.g=hs.g,e.b=hs.b,e}getStyle(e=ya){K.workingToColorSpace(hs.copy(this),e);let t=hs.r,n=hs.g,r=hs.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(fs),this.setHSL(fs.h+e,fs.s+t,fs.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(fs),e.getHSL(ps);let n=Ka(fs.h,ps.h,t),r=Ka(fs.s,ps.s,t),i=Ka(fs.l,ps.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},hs=new q;q.NAMES=ds;var gs=class e{constructor(e,t=25e-5){this.isFogExp2=!0,this.name=``,this.color=new q(e),this.density=t}clone(){return new e(this.color,this.density)}toJSON(){return{type:`FogExp2`,name:this.name,color:this.color.getHex(),density:this.density}}},_s=class extends ss{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wo,this.environmentIntensity=1,this.environmentRotation=new Wo,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},vs=new W,ys=new W,bs=new W,xs=new W,Ss=new W,Cs=new W,ws=new W,Ts=new W,Es=new W,Ds=new W,Os=new ko,ks=new ko,As=new ko,js=class e{constructor(e=new W,t=new W,n=new W){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),vs.subVectors(e,t),r.cross(vs);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){vs.subVectors(r,t),ys.subVectors(n,t),bs.subVectors(e,t);let a=vs.dot(vs),o=vs.dot(ys),s=vs.dot(bs),c=ys.dot(ys),l=ys.dot(bs),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,xs)!==null&&xs.x>=0&&xs.y>=0&&xs.x+xs.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,xs)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,xs.x),s.addScaledVector(a,xs.y),s.addScaledVector(o,xs.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Os.setScalar(0),ks.setScalar(0),As.setScalar(0),Os.fromBufferAttribute(e,t),ks.fromBufferAttribute(e,n),As.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Os,i.x),a.addScaledVector(ks,i.y),a.addScaledVector(As,i.z),a}static isFrontFacing(e,t,n,r){return vs.subVectors(n,t),ys.subVectors(e,t),vs.cross(ys).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return vs.subVectors(this.c,this.b),ys.subVectors(this.a,this.b),vs.cross(ys).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Ss.subVectors(r,n),Cs.subVectors(i,n),Ts.subVectors(e,n);let s=Ss.dot(Ts),c=Cs.dot(Ts);if(s<=0&&c<=0)return t.copy(n);Es.subVectors(e,r);let l=Ss.dot(Es),u=Cs.dot(Es);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Ss,a);Ds.subVectors(e,i);let f=Ss.dot(Ds),p=Cs.dot(Ds);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Cs,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return ws.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(ws,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Ss,a).addScaledVector(Cs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ms=class{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Ps.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Ps.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Ps.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Ps):Ps.fromBufferAttribute(r,t),Ps.applyMatrix4(e.matrixWorld),this.expandByPoint(Ps);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Fs.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Fs.copy(e.boundingBox)),Fs.applyMatrix4(e.matrixWorld),this.union(Fs)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ps),Ps.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Hs),Us.subVectors(this.max,Hs),Is.subVectors(e.a,Hs),Ls.subVectors(e.b,Hs),Rs.subVectors(e.c,Hs),zs.subVectors(Ls,Is),Bs.subVectors(Rs,Ls),Vs.subVectors(Is,Rs);let t=[0,-zs.z,zs.y,0,-Bs.z,Bs.y,0,-Vs.z,Vs.y,zs.z,0,-zs.x,Bs.z,0,-Bs.x,Vs.z,0,-Vs.x,-zs.y,zs.x,0,-Bs.y,Bs.x,0,-Vs.y,Vs.x,0];return!Ks(t,Is,Ls,Rs,Us)||(t=[1,0,0,0,1,0,0,0,1],!Ks(t,Is,Ls,Rs,Us))?!1:(Ws.crossVectors(zs,Bs),t=[Ws.x,Ws.y,Ws.z],Ks(t,Is,Ls,Rs,Us))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ps).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ps).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Ns[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ns[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ns[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ns[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ns[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ns[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ns[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ns[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ns)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ns=[new W,new W,new W,new W,new W,new W,new W,new W],Ps=new W,Fs=new Ms,Is=new W,Ls=new W,Rs=new W,zs=new W,Bs=new W,Vs=new W,Hs=new W,Us=new W,Ws=new W,Gs=new W;function Ks(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Gs.fromArray(e,a);let o=i.x*Math.abs(Gs.x)+i.y*Math.abs(Gs.y)+i.z*Math.abs(Gs.z),s=t.dot(Gs),c=n.dot(Gs),l=r.dot(Gs);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var qs=new W,Js=new U,Ys=0,Xs=class extends La{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ys++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=wa,this.updateRanges=[],this.gpuType=fi,this.version=0,this._normalizationScale=e===void 0?void 0:so(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Js.fromBufferAttribute(this,t),Js.applyMatrix3(e),this.setXY(t,Js.x,Js.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)qs.fromBufferAttribute(this,t),qs.applyMatrix3(e),this.setXYZ(t,qs.x,qs.y,qs.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)qs.fromBufferAttribute(this,t),qs.applyMatrix4(e),this.setXYZ(t,qs.x,qs.y,qs.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qs.fromBufferAttribute(this,t),qs.applyNormalMatrix(e),this.setXYZ(t,qs.x,qs.y,qs.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qs.fromBufferAttribute(this,t),qs.transformDirection(e),this.setXYZ(t,qs.x,qs.y,qs.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?co(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?lo(e,this.array):Math.round(e*t)}},Zs=class extends Xs{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Qs=class extends Xs{constructor(e,t,n){super(new Uint32Array(e),t,n)}},J=class extends Xs{constructor(e,t,n){super(new Float32Array(e),t,n)}},$s=new Ms,ec=new W,tc=new W,nc=class{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?$s.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ec.subVectors(e,this.center);let t=ec.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(ec,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(tc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ec.copy(e.center).add(tc)),this.expandByPoint(ec.copy(e.center).sub(tc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},rc=0,ic=new Po,ac=new ss,oc=new W,sc=new Ms,cc=new Ms,lc=new W,uc=class e extends La{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rc++}),this.uuid=Ha(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Da(e)?Qs:Zs)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new G().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ic.makeRotationFromQuaternion(e),this.applyMatrix4(ic),this}rotateX(e){return ic.makeRotationX(e),this.applyMatrix4(ic),this}rotateY(e){return ic.makeRotationY(e),this.applyMatrix4(ic),this}rotateZ(e){return ic.makeRotationZ(e),this.applyMatrix4(ic),this}translate(e,t,n){return ic.makeTranslation(e,t,n),this.applyMatrix4(ic),this}scale(e,t,n){return ic.makeScale(e,t,n),this.applyMatrix4(ic),this}lookAt(e){return ac.lookAt(e),ac.updateMatrix(),this.applyMatrix4(ac.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(oc).negate(),this.translate(oc.x,oc.y,oc.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new J(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&B(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ms);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)V(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];sc.setFromBufferAttribute(n),this.morphTargetsRelative?(lc.addVectors(this.boundingBox.min,sc.min),this.boundingBox.expandByPoint(lc),lc.addVectors(this.boundingBox.max,sc.max),this.boundingBox.expandByPoint(lc)):(this.boundingBox.expandByPoint(sc.min),this.boundingBox.expandByPoint(sc.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&V(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new nc);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)V(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new W,1/0);else if(e){let n=this.boundingSphere.center;if(sc.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];cc.setFromBufferAttribute(n),this.morphTargetsRelative?(lc.addVectors(sc.min,cc.min),sc.expandByPoint(lc),lc.addVectors(sc.max,cc.max),sc.expandByPoint(lc)):(sc.expandByPoint(cc.min),sc.expandByPoint(cc.max))}sc.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)lc.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(lc));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)lc.fromBufferAttribute(a,t),o&&(oc.fromBufferAttribute(e,t),lc.add(oc)),r=Math.max(r,n.distanceToSquared(lc))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&V(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){V(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Xs(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new W,s[e]=new W;let l=new W,u=new W,d=new W,f=new U,p=new U,m=new U,h=new W,g=new W;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new W,b=new W,x=new W,S=new W;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Xs(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new W,i=new W,a=new W,o=new W,s=new W,c=new W,l=new W,u=new W;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)lc.fromBufferAttribute(e,t),lc.normalize(),e.setXYZ(t,lc.x,lc.y,lc.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Xs(a,r,i)}if(this.index===null)return B(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},dc=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=wa,this.updateRanges=[],this.version=0,this.uuid=Ha()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=fc(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),r=new this.constructor(n,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=fc(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function fc(e){return e.buffer._uuid===void 0&&(e.buffer._uuid=Ha()),e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer._uuid:e.buffer._uuid+`:`+e.byteOffset+`:`+e.byteLength}var pc=new W,mc=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r,this._normalizationScale=e===void 0?void 0:so(e.array)}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)pc.fromBufferAttribute(this,t),pc.applyMatrix4(e),this.setXYZ(t,pc.x,pc.y,pc.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)pc.fromBufferAttribute(this,t),pc.applyNormalMatrix(e),this.setXYZ(t,pc.x,pc.y,pc.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)pc.fromBufferAttribute(this,t),pc.transformDirection(e),this.setXYZ(t,pc.x,pc.y,pc.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Ma(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Xs(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ma(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t===void 0?co(e,this.data.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?lo(e,this.data.array):Math.round(e*t)}},hc=new W,gc=new W,_c=new G,vc=class{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=hc.subVectors(n,t).cross(gc.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(hc),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||_c.getNormalMatrix(e),r=this.coplanarPoint(hc).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},yc=0,bc=class extends La{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yc++}),this.uuid=Ha(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new q(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ca,this.stencilZFail=Ca,this.stencilZPass=Ca,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){B(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?B(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new q().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new vc().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new U().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new U().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},xc=class extends bc{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new q(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Sc,Cc=new W,wc=new W,Tc=new W,Ec=new U,Dc=new U,Oc=new Po,kc=new W,Ac=new W,jc=new W,Mc=new U,Nc=new U,Pc=new U,Fc=class extends ss{constructor(e=new xc){if(super(),this.isSprite=!0,this.type=`Sprite`,Sc===void 0){Sc=new uc;let e=new dc(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Sc.setIndex([0,1,2,0,2,3]),Sc.setAttribute(`position`,new mc(e,3,0,!1)),Sc.setAttribute(`uv`,new mc(e,2,3,!1))}this.geometry=Sc,this.material=e,this.center=new U(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&V(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),wc.setFromMatrixScale(this.matrixWorld),Oc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Tc.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&wc.multiplyScalar(-Tc.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Ic(kc.set(-.5,-.5,0),Tc,a,wc,r,i),Ic(Ac.set(.5,-.5,0),Tc,a,wc,r,i),Ic(jc.set(.5,.5,0),Tc,a,wc,r,i),Mc.set(0,0),Nc.set(1,0),Pc.set(1,1);let o=e.ray.intersectTriangle(kc,Ac,jc,!1,Cc);if(o===null&&(Ic(Ac.set(-.5,.5,0),Tc,a,wc,r,i),Nc.set(0,1),o=e.ray.intersectTriangle(kc,jc,Ac,!1,Cc),o===null))return;let s=e.ray.origin.distanceTo(Cc);s<e.near||s>e.far||t.push({distance:s,point:Cc.clone(),uv:js.getInterpolation(Cc,kc,Ac,jc,Mc,Nc,Pc,new U),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function Ic(e,t,n,r,i,a){Ec.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Dc.copy(Ec):(Dc.x=a*Ec.x-i*Ec.y,Dc.y=i*Ec.x+a*Ec.y),e.copy(t),e.x+=Dc.x,e.y+=Dc.y,e.applyMatrix4(Oc)}var Lc=new W,Rc=new W,zc=new W,Bc=new W,Vc=class{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Lc)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Lc.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Lc.copy(this.origin).addScaledVector(this.direction,t),Lc.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Rc.copy(e).add(t).multiplyScalar(.5),zc.copy(t).sub(e).normalize(),Bc.copy(this.origin).sub(Rc);let i=e.distanceTo(t)*.5,a=-this.direction.dot(zc),o=Bc.dot(this.direction),s=-Bc.dot(zc),c=Bc.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Rc).addScaledVector(zc,d),f}intersectSphere(e,t){if(e.radius<0)return null;Lc.subVectors(e.center,this.origin);let n=Lc.dot(this.direction),r=Lc.dot(Lc)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Lc)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,ee,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,ee=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,ee=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,ee=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,ee=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,ee=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,ee=g)),w===0)return null;let te=S/w,ne=C/w,re=1/w,ie=T-te*D,ae=E-ne*D,oe=O-te*A,se=k-ne*A,ce=j-te*M,le=ee-ne*M,ue=ce*se-le*oe,de=ie*le-ae*ce,fe=oe*ae-se*ie;if(r){if(ue<0||de<0||fe<0)return null}else if((ue<0||de<0||fe<0)&&(ue>0||de>0||fe>0))return null;let pe=ue+de+fe;if(pe===0)return null;let me=re*(ue*D+de*A+fe*M);return(pe>0?me<0:me>0)?null:this.at(me/pe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Hc=class extends bc{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wo,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Uc=new Po,Wc=new Vc,Gc=new nc,Kc=new W,qc=new W,Jc=new W,Yc=new W,Xc=new W,Zc=new W,Qc=new W,$c=new W,Y=class extends ss{constructor(e=new uc,t=new Hc){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Zc.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Xc.fromBufferAttribute(s,e),a?Zc.addScaledVector(Xc,r):Zc.addScaledVector(Xc.sub(t),r))}t.add(Zc)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Gc.copy(n.boundingSphere),Gc.applyMatrix4(i),Wc.copy(e.ray).recast(e.near),Gc.containsPoint(Wc.origin)===!1&&(Wc.intersectSphere(Gc,Kc)===null||Wc.origin.distanceToSquared(Kc)>(e.far-e.near)**2)||(Uc.copy(i).invert(),Wc.copy(e.ray).applyMatrix4(Uc),(n.boundingBox===null||Wc.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Wc)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=tl(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=tl(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=tl(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=tl(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function el(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;$c.copy(s),$c.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo($c);return l<n.near||l>n.far?null:{distance:l,point:$c.clone(),object:e}}function tl(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,qc),e.getVertexPosition(c,Jc),e.getVertexPosition(l,Yc);let u=el(e,t,n,r,qc,Jc,Yc,Qc);if(u){let e=new W;js.getBarycoord(Qc,qc,Jc,Yc,e),i&&(u.uv=js.getInterpolatedAttribute(i,s,c,l,e,new U)),a&&(u.uv1=js.getInterpolatedAttribute(a,s,c,l,e,new U)),o&&(u.normal=js.getInterpolatedAttribute(o,s,c,l,e,new W),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new W,materialIndex:0};js.getNormal(qc,Jc,Yc,t.normal),u.face=t,u.barycoord=e}return u}var nl=class extends Oo{constructor(e=null,t=1,n=1,r,i,a,o,s,c=ei,l=ei,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},rl=class extends Xs{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},il=new Po,al=new Po,ol=[],sl=new Ms,cl=new Po,ll=new Y,ul=new nc,dl=class extends Y{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new rl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,cl)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ms),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,il),sl.copy(e.boundingBox).applyMatrix4(il),this.boundingBox.union(sl)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new nc),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,il),ul.copy(e.boundingSphere).applyMatrix4(il),this.boundingSphere.union(ul)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(ll.geometry=this.geometry,ll.material=this.material,ll.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ul.copy(this.boundingSphere),ul.applyMatrix4(n),e.ray.intersectsSphere(ul)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,il),al.multiplyMatrices(n,il),ll.matrixWorld=al,ll.raycast(e,ol);for(let e=0,n=ol.length;e<n;e++){let n=ol[e];n.instanceId=i,n.object=this,t.push(n)}ol.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new rl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new nl(new Float32Array(r*this.count),r,this.count,wi,fi));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},fl=new nc,pl=new U(.5,.5),ml=new W,hl=class{constructor(e=new vc,t=new vc,n=new vc,r=new vc,i=new vc,a=new vc){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ea,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fl.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fl.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fl)}intersectsSprite(e){return fl.center.set(0,0,0),fl.radius=.7071067811865476+pl.distanceTo(e.center),fl.applyMatrix4(e.matrixWorld),this.intersectsSphere(fl)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(ml.x=r.normal.x>0?e.max.x:e.min.x,ml.y=r.normal.y>0?e.max.y:e.min.y,ml.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(ml)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},gl=new Po,_l=class e{constructor(){this.coordinateSystem=Ea,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];gl.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new hl),n[e].setFromProjectionMatrix(gl,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new hl),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},vl=class extends bc{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new q(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},yl=new Po,bl=new Vc,xl=new nc,Sl=new W,Cl=class extends ss{constructor(e=new uc,t=new vl){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),xl.copy(n.boundingSphere),xl.applyMatrix4(r),xl.radius+=i,e.ray.intersectsSphere(xl)===!1)return;yl.copy(r).invert(),bl.copy(e.ray).applyMatrix4(yl);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Sl.fromBufferAttribute(l,n),wl(Sl,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Sl.fromBufferAttribute(l,a),wl(Sl,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function wl(e,t,n,r,i,a,o){let s=bl.distanceSqToPoint(e);if(s<n){let n=new W;bl.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Tl=class extends Oo{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},El=class extends Oo{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Dl=class extends Oo{constructor(e,t,n=di,r,i,a,o=ei,s=ei,c,l=Si,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new wo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ol=class extends Dl{constructor(e,t=di,n=301,r,i,a=ei,o=ei,s,c=Si){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},kl=class extends Oo{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Al=class e extends uc{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new J(c,3)),this.setAttribute(`normal`,new J(l,3)),this.setAttribute(`uv`,new J(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new W;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},jl=class e extends uc{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new J(u,3)),this.setAttribute(`normal`,new J(d,3)),this.setAttribute(`uv`,new J(f,2));function _(){let a=new W,_=new W,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new U,m=new W,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ml=class e extends jl{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Nl=class e extends uc{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new J(i,3)),this.setAttribute(`normal`,new J(i.slice(),3)),this.setAttribute(`uv`,new J(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new W,r=new W,i=new W;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new W;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new W;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new W,t=new W,n=new W,r=new W,o=new U,s=new U,c=new U;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Pl=class e extends Nl{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Fl=class e extends Nl{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Il=class e extends uc{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new J(p,3)),this.setAttribute(`normal`,new J(m,3)),this.setAttribute(`uv`,new J(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Ll=class e extends uc{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new W,p=new U;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new J(s,3)),this.setAttribute(`normal`,new J(c,3)),this.setAttribute(`uv`,new J(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Rl=class e extends uc{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new W,d=new W,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new J(p,3)),this.setAttribute(`normal`,new J(m,3)),this.setAttribute(`uv`,new J(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},zl=class e extends uc{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new W,f=new W,p=new W;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new J(c,3)),this.setAttribute(`normal`,new J(l,3)),this.setAttribute(`uv`,new J(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Bl(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Hl(i))i.isRenderTargetTexture?(B(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Hl(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Vl(e){let t={};for(let n=0;n<e.length;n++){let r=Bl(e[n]);for(let e in r)t[e]=r[e]}return t}function Hl(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ul(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Wl(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:K.workingColorSpace}var Gl={clone:Bl,merge:Vl},Kl=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ql=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Jl=class extends bc{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Kl,this.fragmentShader=ql,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Bl(e.uniforms),this.uniformsGroups=Ul(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new q().setHex(r.value);break;case`v2`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new ko().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new G().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Po().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Yl=class extends Jl{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Xl=class extends bc{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new q(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new q(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new U(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wo,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Zl=class extends bc{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=va,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ql=class extends bc{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function $l(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function eu(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var tu=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},nu=class extends tu{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ha,endingEnd:ha}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case ga:i=e,o=2*t-n;break;case _a:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case ga:a=e,s=2*n-t;break;case _a:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},ru=class extends tu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},iu=class extends tu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},au=class extends tu{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=cu(n,t,g,y,r);i[p]=ou(x,o,_,b,m)}return i}};function ou(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function su(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function cu(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=ou(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=su(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var lu=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=$l(t,this.TimeBufferType),this.values=$l(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:$l(e.times,Array),values:$l(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),eu(e.settings)&&(n.settings={inTangents:$l(e.settings.inTangents,Array),outTangents:$l(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new iu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ru(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new nu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new au(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case da:t=this.InterpolantFactoryMethodDiscrete;break;case fa:t=this.InterpolantFactoryMethodLinear;break;case pa:t=this.InterpolantFactoryMethodSmooth;break;case ma:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return B(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return da;case this.InterpolantFactoryMethodLinear:return fa;case this.InterpolantFactoryMethodSmooth:return pa;case this.InterpolantFactoryMethodBezier:return ma}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;eu(this.settings)&&(uu(this.settings.inTangents,e),uu(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;eu(this.settings)&&(du(this.settings.inTangents,e),du(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(V(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(V(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){V(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){V(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Oa(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){V(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===pa,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,eu(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function uu(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function du(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}lu.prototype.ValueTypeName=``,lu.prototype.TimeBufferType=Float32Array,lu.prototype.ValueBufferType=Float32Array,lu.prototype.DefaultInterpolation=fa;var fu=class extends lu{constructor(e,t,n){super(e,t,n)}};fu.prototype.ValueTypeName=`bool`,fu.prototype.ValueBufferType=Array,fu.prototype.DefaultInterpolation=da,fu.prototype.InterpolantFactoryMethodLinear=void 0,fu.prototype.InterpolantFactoryMethodSmooth=void 0;var pu=class extends lu{constructor(e,t,n,r){super(e,t,n,r)}};pu.prototype.ValueTypeName=`color`;var mu=class extends lu{constructor(e,t,n,r){super(e,t,n,r)}};mu.prototype.ValueTypeName=`number`;var hu=class extends tu{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)fo.slerpFlat(i,0,a,c-o,a,c,s);return i}},gu=class extends lu{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new hu(this.times,this.values,this.getValueSize(),e)}};gu.prototype.ValueTypeName=`quaternion`,gu.prototype.InterpolantFactoryMethodSmooth=void 0;var _u=class extends lu{constructor(e,t,n){super(e,t,n)}};_u.prototype.ValueTypeName=`string`,_u.prototype.ValueBufferType=Array,_u.prototype.DefaultInterpolation=da,_u.prototype.InterpolantFactoryMethodLinear=void 0,_u.prototype.InterpolantFactoryMethodSmooth=void 0;var vu=class extends lu{constructor(e,t,n,r){super(e,t,n,r)}};vu.prototype.ValueTypeName=`vector`;var yu={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(bu(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!bu(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function bu(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var xu=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},Su=class{constructor(e){this.manager=e===void 0?xu:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},this.priority=`auto`,this.cache=`default`,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Su.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Cu=new WeakMap,wu=class extends Su{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=yu.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=Cu.get(a);e===void 0&&(e=[],Cu.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=ka(`img`);function s(){l(),t&&t(this);let n=Cu.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}Cu.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),yu.remove(`image:${e}`);let n=Cu.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}Cu.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),yu.add(`image:${e}`,o),i.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}},Tu=class extends Su{constructor(e){super(e)}load(e,t,n,r){let i=new Oo,a=new wu(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},Eu=class extends ss{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new q(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Du=class extends Eu{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(ss.DEFAULT_UP),this.updateMatrix(),this.groundColor=new q(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Ou=new Po,ku=new W,Au=new W,ju=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new U(512,512),this.mapType=oi,this.map=null,this.mapPass=null,this.matrix=new Po,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hl,this._frameExtents=new U(1,1),this._viewportCount=1,this._viewports=[new ko(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;ku.setFromMatrixPosition(e.matrixWorld),t.position.copy(ku),Au.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Au),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Ou.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Ou,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Ou)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Mu=new W,Nu=new fo,Pu=new W,Fu=class extends ss{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Po,this.projectionMatrix=new Po,this.projectionMatrixInverse=new Po,this.coordinateSystem=Ea,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Mu,Nu,Pu),Pu.x===1&&Pu.y===1&&Pu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mu,Nu,Pu.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Mu,Nu,Pu),Pu.x===1&&Pu.y===1&&Pu.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mu,Nu,Pu.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Iu=new W,Lu=new U,Ru=new U,zu=class extends Fu{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Va*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ba*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Va*2*Math.atan(Math.tan(Ba*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Iu.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Iu.x,Iu.y).multiplyScalar(-e/Iu.z),Iu.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Iu.x,Iu.y).multiplyScalar(-e/Iu.z)}getViewSize(e,t){return this.getViewBounds(e,Lu,Ru),t.subVectors(Ru,Lu)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ba*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Bu=class extends ju{constructor(){super(new zu(90,1,.5,500)),this.isPointLightShadow=!0}},Vu=class extends Eu{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new Bu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Hu=class extends Fu{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Uu=class extends ju{constructor(){super(new Hu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Wu=class extends Eu{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ss.DEFAULT_UP),this.updateMatrix(),this.target=new ss,this.shadow=new Uu}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Gu=-90,Ku=1,qu=class extends ss{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new zu(Gu,Ku,e,t);r.layers=this.layers,this.add(r);let i=new zu(Gu,Ku,e,t);i.layers=this.layers,this.add(i);let a=new zu(Gu,Ku,e,t);a.layers=this.layers,this.add(a);let o=new zu(Gu,Ku,e,t);o.layers=this.layers,this.add(o);let s=new zu(Gu,Ku,e,t);s.layers=this.layers,this.add(s);let c=new zu(Gu,Ku,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Ju=class extends zu{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},Yu=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Xu.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function Xu(){this._document.hidden===!1&&this.reset()}var Zu=`\\[\\]\\.:\\/`,Qu=RegExp(`[\\[\\]\\.:\\/]`,`g`),$u=`[^\\[\\]\\.:\\/]`,ed=`[^`+Zu.replace(`\\.`,``)+`]`,td=`((?:WC+[\\/:])*)`.replace(`WC`,$u),nd=`(WCOD+)?`.replace(`WCOD`,ed),rd=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,$u),id=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,$u),ad=RegExp(`^`+td+nd+rd+id+`$`),od=[`material`,`materials`,`bones`,`map`],sd=class{constructor(e,t,n){let r=n||cd.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},cd=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Qu,``)}static parseTrackName(e){let t=ad.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);od.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){B(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){V(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){V(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){V(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){V(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){V(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){V(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;V(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){V(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};cd.Composite=sd,cd.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},cd.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},cd.prototype.GetterByBindingType=[cd.prototype._getValue_direct,cd.prototype._getValue_array,cd.prototype._getValue_arrayElement,cd.prototype._getValue_toArray],cd.prototype.SetterByBindingTypeAndVersioning=[[cd.prototype._setValue_direct,cd.prototype._setValue_direct_setNeedsUpdate,cd.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[cd.prototype._setValue_array,cd.prototype._setValue_array_setNeedsUpdate,cd.prototype._setValue_array_setMatrixWorldNeedsUpdate],[cd.prototype._setValue_arrayElement,cd.prototype._setValue_arrayElement_setNeedsUpdate,cd.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[cd.prototype._setValue_fromArray,cd.prototype._setValue_fromArray_setNeedsUpdate,cd.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function ld(e,t,n,r){let i=ud(r);switch(n){case yi:return e*t;case wi:return e*t/i.components*i.byteLength;case Ti:return e*t/i.components*i.byteLength;case Ei:return e*t*2/i.components*i.byteLength;case Di:return e*t*2/i.components*i.byteLength;case bi:return e*t*3/i.components*i.byteLength;case xi:return e*t*4/i.components*i.byteLength;case Oi:return e*t*4/i.components*i.byteLength;case ki:case Ai:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ji:case Mi:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Pi:case Ii:return Math.max(e,16)*Math.max(t,8)/4;case Ni:case Fi:return Math.max(e,8)*Math.max(t,8)/2;case Li:case Ri:case Bi:case Vi:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case zi:case Hi:case Ui:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Wi:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Gi:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Ki:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case qi:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Ji:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Yi:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Xi:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Zi:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Qi:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case $i:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ea:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case ta:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case na:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ra:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case ia:case aa:case oa:return Math.ceil(e/4)*Math.ceil(t/4)*16;case sa:case ca:return Math.ceil(e/4)*Math.ceil(t/4)*8;case la:case ua:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ud(e){switch(e){case oi:case si:return{byteLength:1,components:1};case li:case ci:case pi:return{byteLength:2,components:1};case mi:case hi:return{byteLength:2,components:4};case di:case ui:case fi:return{byteLength:4,components:1};case _i:case vi:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?B(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function dd(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function fd(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var X={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Z={common:{diffuse:{value:new q(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new G}},envmap:{envMap:{value:null},envMapRotation:{value:new G},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new G}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new G}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new G},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new G},normalScale:{value:new U(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new G},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new G}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new G}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new G}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new q(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new q(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0},uvTransform:{value:new G}},sprite:{diffuse:{value:new q(16777215)},opacity:{value:1},center:{value:new U(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new G},alphaMap:{value:null},alphaMapTransform:{value:new G},alphaTest:{value:0}}},pd={basic:{uniforms:Vl([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.fog]),vertexShader:X.meshbasic_vert,fragmentShader:X.meshbasic_frag},lambert:{uniforms:Vl([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new q(0)},envMapIntensity:{value:1}}]),vertexShader:X.meshlambert_vert,fragmentShader:X.meshlambert_frag},phong:{uniforms:Vl([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new q(0)},specular:{value:new q(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:X.meshphong_vert,fragmentShader:X.meshphong_frag},standard:{uniforms:Vl([Z.common,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.roughnessmap,Z.metalnessmap,Z.fog,Z.lights,{emissive:{value:new q(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag},toon:{uniforms:Vl([Z.common,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.gradientmap,Z.fog,Z.lights,{emissive:{value:new q(0)}}]),vertexShader:X.meshtoon_vert,fragmentShader:X.meshtoon_frag},matcap:{uniforms:Vl([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,{matcap:{value:null}}]),vertexShader:X.meshmatcap_vert,fragmentShader:X.meshmatcap_frag},points:{uniforms:Vl([Z.points,Z.fog]),vertexShader:X.points_vert,fragmentShader:X.points_frag},dashed:{uniforms:Vl([Z.common,Z.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:X.linedashed_vert,fragmentShader:X.linedashed_frag},depth:{uniforms:Vl([Z.common,Z.displacementmap]),vertexShader:X.depth_vert,fragmentShader:X.depth_frag},normal:{uniforms:Vl([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,{opacity:{value:1}}]),vertexShader:X.meshnormal_vert,fragmentShader:X.meshnormal_frag},sprite:{uniforms:Vl([Z.sprite,Z.fog]),vertexShader:X.sprite_vert,fragmentShader:X.sprite_frag},background:{uniforms:{uvTransform:{value:new G},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:X.background_vert,fragmentShader:X.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new G}},vertexShader:X.backgroundCube_vert,fragmentShader:X.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:X.cube_vert,fragmentShader:X.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:X.equirect_vert,fragmentShader:X.equirect_frag},distance:{uniforms:Vl([Z.common,Z.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:X.distance_vert,fragmentShader:X.distance_frag},shadow:{uniforms:Vl([Z.lights,Z.fog,{color:{value:new q(0)},opacity:{value:1}}]),vertexShader:X.shadow_vert,fragmentShader:X.shadow_frag}};pd.physical={uniforms:Vl([pd.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new G},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new G},clearcoatNormalScale:{value:new U(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new G},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new G},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new G},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new G},sheen:{value:0},sheenColor:{value:new q(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new G},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new G},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new G},transmissionSamplerSize:{value:new U},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new G},attenuationDistance:{value:0},attenuationColor:{value:new q(0)},specularColor:{value:new q(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new G},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new G},anisotropyVector:{value:new U},anisotropyMap:{value:null},anisotropyMapTransform:{value:new G}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag};var md={r:0,b:0,g:0},hd=new Po,gd=new G;gd.set(-1,0,0,0,1,0,0,0,1);function _d(e,t,n,r,i,a){let o=new q(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new Y(new Al(1,1,1),new Jl({name:`BackgroundCubeMaterial`,uniforms:Bl(pd.backgroundCube.uniforms),vertexShader:pd.backgroundCube.vertexShader,fragmentShader:pd.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(hd.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(gd),l.material.toneMapped=K.getTransfer(i.colorSpace)!==Sa,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Y(new Il(2,2),new Jl({name:`BackgroundMaterial`,uniforms:Bl(pd.background.uniforms),vertexShader:pd.background.vertexShader,fragmentShader:pd.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=K.getTransfer(i.colorSpace)!==Sa,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(md,Wl(e)),n.buffers.color.setClear(md.r,md.g,md.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function vd(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function yd(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function bd(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(B(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&B(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&B(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function xd(e){let t=this,n=null,r=0,i=!1,a=!1,o=new vc,s=new G,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Sd=class extends jo{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Tl(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Al(5,5,5),i=new Jl({name:`CubemapFromEquirect`,uniforms:Bl(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new Y(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ri),new qu(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Cd=256,wd=3,Td=20,Ed=256,Dd=16,Od=3,kd=new W,Ad=new q,jd=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new qu(1,10,null),this._boxMesh=new Y(new Al(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=kd}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Ad));let h=new qu(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Rd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ld(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Cd,ao(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Cd:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Md(e,!1,!1),n=Math.log2(e)-wd;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Md(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=Rd()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Ld()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Pd(),this._integrationMaterial=Fd());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/Dd);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Od)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(Ed*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Id());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function Md(e,t,n){return new Sd(e,{minFilter:ai,generateMipmaps:t,type:pi,colorSpace:ba,depthBuffer:n})}function Nd(e,t,n){return new Jl({name:e,uniforms:t,vertexShader:X.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Pd(){return Nd(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ed}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Fd(){return Nd(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Dd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Id(){return Nd(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Td}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Ld(){return Nd(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Rd(){return Nd(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function zd(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Sd(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new jd(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new jd(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Bd(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Pa(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Vd(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Qs:Zs)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Hd(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Ud(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:V(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Wd(e,t,n){let r=new WeakMap,i=new ko;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Mo(h,p,m,u);g.type=fi,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new U(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Gd(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Kd={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function qd(e,t,n,r,i,a){let o=new jo(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new uc;u.setAttribute(`position`,new J([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new J([0,2,0,0,2,0],2));let d=new Yl({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Y(u,d),p=new Hu(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new jo(t,n,{type:pi,depthBuffer:!1,stencilBuffer:!1}),c=new jo(t,n,{type:pi,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Dl(t,n),a===!0&&(l.format=Ci,l.type=gi)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},K.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Kd[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var Jd=new Oo,Yd=new Dl(1,1),Xd=new Ol(1),Zd=new Mo,Qd=new No,$d=new Tl,ef=[],tf=[],nf=new Float32Array(16),rf=new Float32Array(9),af=new Float32Array(4);function of(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ef[i];if(a===void 0&&(a=new Float32Array(i),ef[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function sf(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function cf(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function lf(e,t){let n=tf[t];n===void 0&&(n=new Int32Array(t),tf[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function uf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function df(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(sf(n,t))return;e.uniform2fv(this.addr,t),cf(n,t)}}function ff(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(sf(n,t))return;e.uniform3fv(this.addr,t),cf(n,t)}}function pf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(sf(n,t))return;e.uniform4fv(this.addr,t),cf(n,t)}}function mf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(sf(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),cf(n,t)}else{if(sf(n,r))return;af.set(r),e.uniformMatrix2fv(this.addr,!1,af),cf(n,r)}}function hf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(sf(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),cf(n,t)}else{if(sf(n,r))return;rf.set(r),e.uniformMatrix3fv(this.addr,!1,rf),cf(n,r)}}function gf(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(sf(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),cf(n,t)}else{if(sf(n,r))return;nf.set(r),e.uniformMatrix4fv(this.addr,!1,nf),cf(n,r)}}function _f(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function vf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(sf(n,t))return;e.uniform2iv(this.addr,t),cf(n,t)}}function yf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(sf(n,t))return;e.uniform3iv(this.addr,t),cf(n,t)}}function bf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(sf(n,t))return;e.uniform4iv(this.addr,t),cf(n,t)}}function xf(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Sf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(sf(n,t))return;e.uniform2uiv(this.addr,t),cf(n,t)}}function Cf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(sf(n,t))return;e.uniform3uiv(this.addr,t),cf(n,t)}}function wf(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(sf(n,t))return;e.uniform4uiv(this.addr,t),cf(n,t)}}function Tf(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function Ef(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Tf(Yd):Jd,n.setTexture2D(t||a,i)}function Df(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Qd,i)}function Of(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Tf(Xd):$d,n.setTextureCube(t||a,i)}function kf(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Zd,i)}function Af(e){switch(e){case 5126:return uf;case 35664:return df;case 35665:return ff;case 35666:return pf;case 35674:return mf;case 35675:return hf;case 35676:return gf;case 5124:case 35670:return _f;case 35667:case 35671:return vf;case 35668:case 35672:return yf;case 35669:case 35673:return bf;case 5125:return xf;case 36294:return Sf;case 36295:return Cf;case 36296:return wf;case 35678:case 36198:case 36298:case 36306:case 35682:return Ef;case 35679:case 36299:case 36307:return Df;case 35680:case 36300:case 36308:case 36293:return Of;case 36289:case 36303:case 36311:case 36292:return kf}}function jf(e,t){e.uniform1fv(this.addr,t)}function Mf(e,t){let n=of(t,this.size,2);e.uniform2fv(this.addr,n)}function Nf(e,t){let n=of(t,this.size,3);e.uniform3fv(this.addr,n)}function Pf(e,t){let n=of(t,this.size,4);e.uniform4fv(this.addr,n)}function Ff(e,t){let n=of(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function If(e,t){let n=of(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Lf(e,t){let n=of(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Rf(e,t){e.uniform1iv(this.addr,t)}function zf(e,t){e.uniform2iv(this.addr,t)}function Bf(e,t){e.uniform3iv(this.addr,t)}function Vf(e,t){e.uniform4iv(this.addr,t)}function Hf(e,t){e.uniform1uiv(this.addr,t)}function Uf(e,t){e.uniform2uiv(this.addr,t)}function Wf(e,t){e.uniform3uiv(this.addr,t)}function Gf(e,t){e.uniform4uiv(this.addr,t)}function Kf(e,t,n){let r=this.cache,i=t.length,a=lf(n,i);sf(r,a)||(e.uniform1iv(this.addr,a),cf(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Tf(Yd):Jd;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function qf(e,t,n){let r=this.cache,i=t.length,a=lf(n,i);sf(r,a)||(e.uniform1iv(this.addr,a),cf(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Qd,a[e])}function Jf(e,t,n){let r=this.cache,i=t.length,a=lf(n,i);sf(r,a)||(e.uniform1iv(this.addr,a),cf(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Tf(Xd):$d;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function Yf(e,t,n){let r=this.cache,i=t.length,a=lf(n,i);sf(r,a)||(e.uniform1iv(this.addr,a),cf(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Zd,a[e])}function Xf(e){switch(e){case 5126:return jf;case 35664:return Mf;case 35665:return Nf;case 35666:return Pf;case 35674:return Ff;case 35675:return If;case 35676:return Lf;case 5124:case 35670:return Rf;case 35667:case 35671:return zf;case 35668:case 35672:return Bf;case 35669:case 35673:return Vf;case 5125:return Hf;case 36294:return Uf;case 36295:return Wf;case 36296:return Gf;case 35678:case 36198:case 36298:case 36306:case 35682:return Kf;case 35679:case 36299:case 36307:return qf;case 35680:case 36300:case 36308:case 36293:return Jf;case 36289:case 36303:case 36311:case 36292:return Yf}}var Zf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Af(t.type)}},Qf=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Xf(t.type)}},$f=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},ep=/(\w+)(\])?(\[|\.)?/g;function tp(e,t){e.seq.push(t),e.map[t.id]=t}function np(e,t,n){let r=e.name,i=r.length;for(ep.lastIndex=0;;){let a=ep.exec(r),o=ep.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){tp(n,l===void 0?new Zf(s,e,t):new Qf(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new $f(s),tp(n,e)),n=e}}}var rp=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);np(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function ip(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var ap=37297,op=0;function sp(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var cp=new G;function lp(e){K._getMatrix(cp,K.workingColorSpace,e);let t=`mat3( ${cp.elements.map(e=>e.toFixed(4))} )`;switch(K.getTransfer(e)){case xa:return[t,`LinearTransferOETF`];case Sa:return[t,`sRGBTransferOETF`];default:return B(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function up(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+sp(e.getShaderSource(t),r)}return i}function dp(e,t){let n=lp(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var fp={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function pp(e,t){let n=fp[t];return n===void 0?(B(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var mp=new W;function hp(){return K.getLuminanceCoefficients(mp),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${mp.x.toFixed(4)}, ${mp.y.toFixed(4)}, ${mp.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function gp(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(yp).join(`
`)}function _p(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function vp(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function yp(e){return e!==``}function bp(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function xp(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Sp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cp(e){return e.replace(Sp,wp)}function wp(e,t){let n=X[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return Cp(n)}var Tp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ep(e){return e.replace(Tp,Dp)}function Dp(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Op(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var kp={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Ap(e){return kp[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var jp={302:`ENVMAP_MODE_REFRACTION`};function Mp(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:jp[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Np={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Pp(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Np[e.combine]||`ENVMAP_BLENDING_NONE`}function Fp(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Ap(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Mp(n),d=Pp(n),f=gp(n),p=_p(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(yp).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(yp).join(`
`),g.length>0&&(g+=`
`)):(h=[Op(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(yp).join(`
`),g=[Op(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:X.tonemapping_pars_fragment,n.toneMapping===0?``:pp(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,X.colorspace_pars_fragment,dp(`linearToOutputTexel`,n.outputColorSpace),hp(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(yp).join(`
`)),o=Cp(o),o=bp(o,n),o=xp(o,n),s=Cp(s),s=bp(s,n),s=xp(s,n),o=Ep(o),s=Ep(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=ip(i,i.VERTEX_SHADER,v),x=ip(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=up(i,b,`vertex`),n=up(i,x,`fragment`);V(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):B(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new rp(i,m),w=vp(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,ap)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=op++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var Ip=0,Lp=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Rp(e),t.set(e,n)),n}},Rp=class{constructor(e){this.id=Ip++,this.code=e,this.usedTimes=0}};function zp(e){return e===1030||e===37490||e===36285}function Bp(e,t,n,r,i,a){let o=new Go,s=new Lp,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&B(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=pd[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),ee=m.isInstancedMesh===!0,M=m.isBatchedMesh===!0,te=!!i.map,ne=!!i.matcap,re=!!b,ie=re&&b.isPMREMTexture===!0,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,de=!!i.metalnessMap,fe=!!i.roughnessMap,pe=i.anisotropy>0,me=i.clearcoat>0,he=i.diffuseRoughness>0,ge=i.dispersion>0,_e=i.retroreflectivity>0,ve=i.iridescence>0,ye=i.sheen>0,be=i.transmission>0,xe=pe&&!!i.anisotropyMap,N=me&&!!i.clearcoatMap,Se=me&&!!i.clearcoatNormalMap,Ce=me&&!!i.clearcoatRoughnessMap,we=he&&!!i.diffuseRoughnessMap,P=ve&&!!i.iridescenceMap,Te=ve&&!!i.iridescenceThicknessMap,Ee=ye&&!!i.sheenColorMap,De=ye&&!!i.sheenRoughnessMap,F=!!i.specularMap,Oe=!!i.specularColorMap,I=!!i.specularIntensityMap,L=be&&!!i.transmissionMap,ke=be&&!!i.thicknessMap,Ae=!!i.gradientMap,je=!!i.alphaMap,Me=i.alphaTest>0,Ne=!!i.alphaHash,Pe=!!i.extensions,R=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(R=e.toneMapping);let Fe=ie?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,Ie={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:M,batchingColor:M&&m._colorsTexture!==null,instancing:ee,instancingColor:ee&&m.instanceColor!==null,instancingMorph:ee&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:K.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:te,matcap:ne,envMap:re,envMapMode:re&&b.mapping,envMapPMREM:ie,envMapMaxLod:ie?Fe.length-1:null,envMapSize:ie?Fe[0].width:null,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&zp(i.normalMap.format),metalnessMap:de,roughnessMap:fe,anisotropy:pe,anisotropyMap:xe,clearcoat:me,clearcoatMap:N,clearcoatNormalMap:Se,clearcoatRoughnessMap:Ce,diffuseRoughness:he,diffuseRoughnessMap:we,dispersion:ge,retroreflection:_e,iridescence:ve,iridescenceMap:P,iridescenceThicknessMap:Te,sheen:ye,sheenColorMap:Ee,sheenRoughnessMap:De,specularMap:F,specularColorMap:Oe,specularIntensityMap:I,transmission:be,transmissionMap:L,thicknessMap:ke,gradientMap:Ae,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:je,alphaTest:Me,alphaHash:Ne,combine:i.combine,mapUv:te&&p(i.map.channel),aoMapUv:ae&&p(i.aoMap.channel),lightMapUv:oe&&p(i.lightMap.channel),bumpMapUv:se&&p(i.bumpMap.channel),normalMapUv:ce&&p(i.normalMap.channel),displacementMapUv:le&&p(i.displacementMap.channel),emissiveMapUv:ue&&p(i.emissiveMap.channel),metalnessMapUv:de&&p(i.metalnessMap.channel),roughnessMapUv:fe&&p(i.roughnessMap.channel),anisotropyMapUv:xe&&p(i.anisotropyMap.channel),clearcoatMapUv:N&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:Se&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:we&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:P&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:Te&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ee&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:De&&p(i.sheenRoughnessMap.channel),specularMapUv:F&&p(i.specularMap.channel),specularColorMapUv:Oe&&p(i.specularColorMap.channel),specularIntensityMapUv:I&&p(i.specularIntensityMap.channel),transmissionMapUv:L&&p(i.transmissionMap.channel),thicknessMapUv:ke&&p(i.thicknessMap.channel),alphaMapUv:je&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ce||pe),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(te||je),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:R,decodeVideoTexture:te&&i.map.isVideoTexture===!0&&K.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&K.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Pe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Pe&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ie.vertexUv1s=c.has(1),Ie.vertexUv2s=c.has(2),Ie.vertexUv3s=c.has(3),c.clear(),Ie}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=pd[t];n=Gl.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new Fp(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function Vp(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Hp(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Up(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Wp(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Hp),r.length>1&&r.sort(t||Up),i.length>1&&i.sort(t||Up)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Gp(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Wp,e.set(t,[i])):n>=r.length?(i=new Wp,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Kp(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new W,color:new q};break;case`SpotLight`:n={position:new W,direction:new W,color:new q,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new W,color:new q,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new W,skyColor:new q,groundColor:new q};break;case`RectAreaLight`:n={color:new q,position:new W,halfWidth:new W,halfHeight:new W}}return e[t.id]=n,n}}}function qp(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new U,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Jp=0;function Yp(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Xp(e){let t=new Kp,n=qp(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new W);let i=new W,a=new Po,o=new Po;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Yp);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Z.LTC_FLOAT_1,r.rectAreaLTC2=Z.LTC_FLOAT_2):(r.rectAreaLTC1=Z.LTC_HALF_1,r.rectAreaLTC2=Z.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Jp++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Zp(e){let t=new Xp(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Qp(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Zp(e),t.set(n,[a])):r>=i.length?(a=new Zp(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var $p=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,em=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,tm=[new W(1,0,0),new W(-1,0,0),new W(0,1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1)],nm=[new W(0,-1,0),new W(0,-1,0),new W(0,0,1),new W(0,0,-1),new W(0,-1,0),new W(0,-1,0)],rm=new Po,im=new W,am=new W;function om(e,t,n){let r=new hl,i=new U,a=new U,o=new ko,s=new Zl,c=new Ql,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Jl({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new U},radius:{value:4}},vertexShader:$p,fragmentShader:em}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new uc;m.setAttribute(`position`,new Xs(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Y(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(B(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){B(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){B(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new jo(i.x,i.y,{format:Ei,type:pi,minFilter:ri,magFilter:ri,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new Dl(i.x,i.y,fi),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Si,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ei,d.map.depthTexture.magFilter=ei}else l.isPointLight?(d.map=new Sd(i.x),d.map.depthTexture=new Ol(i.x,di)):(d.map=new jo(i.x,i.y),d.map.depthTexture=new Dl(i.x,i.y,di)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Si,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=ri,d.map.depthTexture.magFilter=ri):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ei,d.map.depthTexture.magFilter=ei);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),im.setFromMatrixPosition(l.matrixWorld),e.position.copy(im),am.copy(e.position),am.add(tm[t]),e.up.copy(nm[t]),e.lookAt(am),e.updateMatrixWorld(),n.makeTranslation(-im.x,-im.y,-im.z),rm.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(rm,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new jo(i.x,i.y,{format:Ei,type:pi}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function sm(e,t){function n(){let t=!1,n=new ko,r=null,i=new ko(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?de(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Ia[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?de(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,ee=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,te=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),M=te>=2):(te=parseFloat(/^WebGL (\d)/.exec(ne)[1]),M=te>=1);let re=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new ko().fromArray(ae),ce=new ko().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(e.DEPTH_TEST),o.setFunc(3),be(!1),xe(1),de(e.CULL_FACE),ve(0);function de(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function fe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function pe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function me(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function he(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ge={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ge[103]=e.MIN,ge[104]=e.MAX;let _e={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ve(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(fe(e.BLEND),g=!1);else if(g===!1&&(de(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:V(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:V(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:V(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:V(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ge[n],ge[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(_e[r],_e[i],_e[o],_e[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ye(t,n){t.side===2?fe(e.CULL_FACE):de(e.CULL_FACE);let r=t.side===1;n&&(r=!r),be(r),t.blending===1&&t.transparent===!1?ve(0):ve(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?de(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function be(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function xe(t){t===0?fe(e.CULL_FACE):(de(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function N(t){t!==k&&(M&&e.lineWidth(t),k=t)}function Se(t,n,r){t?(de(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):fe(e.POLYGON_OFFSET_FILL)}function Ce(t){t?de(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+ee-1),re!==t&&(e.activeTexture(t),re=t)}function P(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+ee-1:re);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Te(){let t=ie[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ee(){try{e.compressedTexImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function De(){try{e.compressedTexImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function F(){try{e.texSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function I(){try{e.compressedTexSubImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function L(){try{e.compressedTexSubImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){V(`WebGLState:`,e)}}function Ne(t){return d[t]===void 0?e.getParameter(t):d[t]}function Pe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function R(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Fe(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Ie(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function Le(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},re=null,ie={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new q(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:de,disable:fe,bindFramebuffer:pe,drawBuffers:me,useProgram:he,setBlending:ve,setMaterial:ye,setFlipSided:be,setCullFace:xe,setLineWidth:N,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:P,unbindTexture:Te,compressedTexImage2D:Ee,compressedTexImage3D:De,texImage2D:je,texImage3D:Me,pixelStorei:Pe,getParameter:Ne,updateUBOMapping:Ie,uniformBlockBinding:Le,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:F,texSubImage3D:Oe,compressedTexSubImage2D:I,compressedTexSubImage3D:L,scissor:R,viewport:Fe,reset:Re}}function cm(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new U,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):ka(`canvas`)}function v(e,t,n){let r=1,i=ke(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),B(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&B(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];B(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||B(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?xa:K.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,B(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),ee(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),te(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function ee(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&M(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function M(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function te(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let ne=0;function re(){ne=0}function ie(){return ne}function ae(e){ne=e}function oe(){let e=ne;return e>=i.maxTextures&&B(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),ne+=1,e}function se(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ce(t,i){let a=r.get(t);if(t.isVideoTexture&&I(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)B(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)B(`WebGLRenderer: Texture marked for update but image is incomplete`);else{ye(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function le(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ye(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function ue(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ye(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function de(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?be(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let fe={[Zr]:e.REPEAT,[Qr]:e.CLAMP_TO_EDGE,[$r]:e.MIRRORED_REPEAT},pe={[ei]:e.NEAREST,[ti]:e.NEAREST_MIPMAP_NEAREST,[ni]:e.NEAREST_MIPMAP_LINEAR,[ri]:e.LINEAR,[ii]:e.LINEAR_MIPMAP_NEAREST,[ai]:e.LINEAR_MIPMAP_LINEAR},me={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function he(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&B(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,fe[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,fe[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,fe[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,pe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,pe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,me[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ge(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=se(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function _e(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ve(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=_e(n.start,r.width,4),c=_e(t.start,r.width,4);n.start<=i+1&&a===c&&_e(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ye(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ge(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=L(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);he(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===Ci,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&ve(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=ld(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=ld(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=ke(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=ke(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function be(t,o,s){if(o.image.length!==6)return;let c=ge(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=K.getPrimaries(K.workingColorSpace),r=o.colorSpace===``?null:K.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=L(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);he(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===Ci,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?B(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=ke(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function xe(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,F(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function N(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Oe(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,F(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,F(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);Oe(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,F(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,F(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Se(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?de(i.depthTexture,0):ce(i.depthTexture,0);let u=c.__webglTexture,d=F(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Oe(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ce(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)Se(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Se(i.__webglFramebuffer[0],t,0):Se(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),N(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),N(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function we(t,n,i){let a=r.get(t);n!==void 0&&xe(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Ce(t)}function P(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Oe(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=F(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),N(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),he(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)xe(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else xe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),he(c,a),xe(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),he(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)xe(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else xe(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Ce(t)}function Te(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let Ee=[];function De(t){if(t.samples>0){if(Oe(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(Ee.length=0,Ee.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Ee.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ee))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function F(e){return Math.min(i.maxSamples,e.samples)}function Oe(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function I(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function L(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(K.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&B(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):V(`WebGLTextures: Unsupported texture color space:`,n)),t}function ke(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=oe,this.resetTextureUnits=re,this.getTextureUnits=ie,this.setTextureUnits=ae,this.setTexture2D=ce,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=we,this.setupRenderTarget=P,this.updateRenderTargetMipmap=Te,this.updateMultisampleRenderTarget=De,this.setupDepthRenderbuffer=Ce,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=Oe,this.dispose=j}function lm(e,t){function n(n,r=``){let i,a=K.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var um=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,dm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,fm=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new kl(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Jl({vertexShader:um,fragmentShader:dm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Y(new Il(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},pm=class extends La{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new fm,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new U,C=null,w=null,T=new zu;T.viewport=new ko;let E=new zu;E.viewport=new ko;let D=[T,E],O=new Ju,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new us,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new us,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new us,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ee(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,ee),r.removeEventListener(`inputsourceschange`,M);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&B(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,ee),r.addEventListener(`inputsourceschange`,M),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ci:Si,a=_.stencil?gi:di);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new jo(d.textureWidth,d.textureHeight,{format:xi,type:oi,depthTexture:new Dl(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new jo(f.framebufferWidth,f.framebufferHeight,{format:xi,type:oi,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ae.setContext(r),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function M(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function te(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;te(O,i);for(let e=0;e<a.length;e++)te(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ne(e,O,i)};function ne(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=Va*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let re=null;function ie(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new zu,o.layers.enable(n),o.viewport=new ko,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new kl,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}re&&re(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ae=new dd;ae.setAnimationLoop(ie),this.setAnimationLoop=function(e){re=e},this.dispose=function(){}}},mm=new Po,hm=new G;hm.set(-1,0,0,0,1,0,0,0,1);function gm(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Wl(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(mm.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(hm),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function _m(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?B(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):B(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var vm=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ym=null;function bm(){return ym===null&&(ym=new nl(vm,16,16,Ei,pi),ym.name=`DFG_LUT`,ym.minFilter=ri,ym.magFilter=ri,ym.wrapS=Qr,ym.wrapT=Qr,ym.generateMipmaps=!1,ym.needsUpdate=!0),ym}var xm=class{constructor(e={}){let{canvas:t=Aa(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=oi}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Oi,Di,Ti]),g=new Set([oi,di,li,gi,mi,hi]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=ya;let j=0,ee=0,M=null,te=-1,ne=null,re=new ko,ie=new ko,ae=null,oe=new q(0),se=0,ce=t.width,le=t.height,ue=1,de=null,fe=null,pe=new ko(0,0,ce,le),me=new ko(0,0,ce,le),he=!1,ge=new hl,_e=new _l,ve=!1,ye=!1,be=new Po,xe=new W,N=new ko,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ce=!1;function we(){return M===null?ue:1}let P=n;function Te(e,n){return t.getContext(e,n)}let Ee,De,F,Oe,I,L,ke,Ae,je,Me,Ne,Pe,R,Fe,Ie,Le,Re,ze,Be,Ve,He,Ue,We;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,qe,!1),t.addEventListener(`webglcontextrestored`,Je,!1),t.addEventListener(`webglcontextcreationerror`,Ye,!1),P===null){let t=`webgl2`;if(P=Te(t,e),P===null)throw Te(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}Ge()}catch(e){throw t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),V(`WebGLRenderer: `+e.message),e}function Ge(){Ee=new Bd(P),Ee.init(),He=new lm(P,Ee),De=new bd(P,Ee,e,He),F=new sm(P,Ee),De.reversedDepthBuffer&&d&&F.buffers.depth.setReversed(!0),O=P.createFramebuffer(),k=P.createFramebuffer(),A=P.createFramebuffer(),Oe=new Ud(P),I=new Vp,L=new cm(P,Ee,F,I,De,He,Oe),ke=new zd(T),Ae=new fd(P),Ue=new vd(P,Ae),je=new Vd(P,Ae,Oe,Ue),Me=new Gd(P,je,Ae,Ue,Oe),ze=new Wd(P,De,L),Ie=new xd(I),Ne=new Bp(T,ke,Ee,De,Ue,Ie),Pe=new gm(T,I),R=new Gp,Fe=new Qp(Ee),Re=new _d(T,ke,F,Me,p,s),Le=new om(T,Me,De),We=new _m(P,Oe,De,F),Be=new yd(P,Ee,Oe),Ve=new Hd(P,Ee,Oe),Oe.programs=Ne.programs,T.capabilities=De,T.extensions=Ee,T.properties=I,T.renderLists=R,T.shadowMap=Le,T.state=F,T.info=Oe}m!==1009&&(w=new qd(m,t.width,t.height,o,r,i));let Ke=new pm(T,P);this.xr=Ke,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ee.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ee.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ue},this.setPixelRatio=function(e){e!==void 0&&(ue=e,this.setSize(ce,le,!1))},this.getSize=function(e){return e.set(ce,le)},this.setSize=function(e,n,r=!0){Ke.isPresenting?B(`WebGLRenderer: Can't change size while VR device is presenting.`):(ce=e,le=n,t.width=Math.floor(e*ue),t.height=Math.floor(n*ue),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ce*ue,le*ue).floor()},this.setDrawingBufferSize=function(e,n,r){ce=e,le=n,ue=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)V(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){B(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(re)},this.getViewport=function(e){return e.copy(pe)},this.setViewport=function(e,t,n,r){e.isVector4?pe.set(e.x,e.y,e.z,e.w):pe.set(e,t,n,r),F.viewport(re.copy(pe).multiplyScalar(we()).round())},this.getScissor=function(e){return e.copy(me)},this.setScissor=function(e,t,n,r){e.isVector4?me.set(e.x,e.y,e.z,e.w):me.set(e,t,n,r),F.scissor(ie.copy(me).multiplyScalar(we()).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(e){F.setScissorTest(he=e)},this.setOpaqueSort=function(e){de=e},this.setTransparentSort=function(e){fe=e},this.getClearColor=function(e){return e.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor(...arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(M!==null){let t=M.texture.format;e=h.has(t)}if(e){let e=M.texture.type,t=g.has(e),n=Re.getClearColor(),r=Re.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,P.clearBufferuiv(P.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,P.clearBufferiv(P.COLOR,0,v))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,qe,!1),t.removeEventListener(`webglcontextrestored`,Je,!1),t.removeEventListener(`webglcontextcreationerror`,Ye,!1),Re.dispose(),R.dispose(),Fe.dispose(),L.dispose(),I.dispose(),ke.dispose(),Me.dispose(),je.dispose(),Ue.dispose(),We.dispose(),Ne.dispose(),Ke.dispose(),Ke.removeEventListener(`sessionstart`,nt),Ke.removeEventListener(`sessionend`,rt),it.stop()};function qe(e){e.preventDefault(),Ma(`WebGLRenderer: Context Lost.`),E=!0}function Je(){Ma(`WebGLRenderer: Context Restored.`),E=!1;let e=Oe.autoReset,t=Le.enabled,n=Le.autoUpdate,r=Le.needsUpdate,i=Le.type;Ge(),Oe.autoReset=e,Le.enabled=t,Le.autoUpdate=n,Le.needsUpdate=r,Le.type=i}function Ye(e){V(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Xe(e){let t=e.target;t.removeEventListener(`dispose`,Xe),Ze(t)}function Ze(e){Qe(e),I.remove(e)}function Qe(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ne.releaseProgram(e)}),e.isShaderMaterial&&Ne.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Se);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=mt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=je.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ue.setup(i,r,s,n,c);let h,g=Be;if(c!==null&&(h=Ae.get(c),g=Ve,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*we()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*we()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Ee.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ae.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function $e(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),ve===!0&&Ie.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,dt(e,t,r),e.side=0,e.needsUpdate=!0,dt(e,t,r),e.side=2):dt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Fe.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),ye=this.localClippingEnabled,ve=Ie.init(this.clippingPlanes,ye),ve===!0&&Ie.setGlobalState(this.clippingPlanes,t),D!==null&&Le.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];$e(o,n,t,e),r.add(o)}else $e(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ee.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let et=null;function tt(e){et&&et(e)}function nt(){it.stop()}function rt(){it.start()}let it=new dd;it.setAnimationLoop(tt),typeof self<`u`&&it.setContext(self),this.setAnimationLoop=function(e){et=e,Ke.setAnimationLoop(e),e===null?it.stop():it.start()},Ke.addEventListener(`sessionstart`,nt),Ke.addEventListener(`sessionend`,rt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){V(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Ke.enabled===!0&&Ke.isPresenting===!0,r=w!==null&&(M===null||n)&&w.begin(T,M);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ke.enabled===!0&&Ke.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Ke.cameraAutoUpdate===!0&&Ke.updateCamera(t),t=Ke.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,M),x=Fe.get(e,C.length),x.init(t),x.state.textureUnits=L.getTextureUnits(),C.push(x),be.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?_e.setFromArrayCamera(t):ge.setFromProjectionMatrix(be,Ea,t.reversedDepth),ye=this.localClippingEnabled,ve=Ie.init(this.clippingPlanes,ye),b=R.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,Ke.enabled===!0&&Ke.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&at(e,t,-1/0,T.sortObjects)}at(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(de,fe),Ce=Ke.enabled===!1||Ke.isPresenting===!1||Ke.hasDepthSensing()===!1,Ce&&Re.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),ve===!0&&Ie.beginShadows();let i=x.state.shadowsArray;if(Le.render(i,e,t),ve===!0&&Ie.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];st(n,r,e,a)}Ce&&Re.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];ot(b,e,n,n.viewport)}}else r.length>0&&st(n,r,e,t),Ce&&Re.render(e),ot(b,e,t)}M!==null&&ee===0&&(L.updateMultisampleRenderTarget(M),L.updateRenderTargetMipmap(M)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Ue.resetDefaultState(),te=-1,ne=null,C.pop(),C.length>0?(x=C[C.length-1],L.setTextureUnits(x.state.textureUnits),ve===!0&&Ie.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function at(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?_e:ge;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&N.setFromMatrixPosition(e.matrixWorld).applyMatrix4(be);let i=Me.update(e),a=e.material;a.visible&&b.push(e,i,a,n,N.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?_e:ge;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Me.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),N.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),N.copy(e.boundingSphere.center)),N.applyMatrix4(e.matrixWorld).applyMatrix4(be)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,N.z,s,t)}}else a.visible&&b.push(e,i,a,n,N.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)at(i[e],t,n,r)}function ot(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),ve===!0&&Ie.setGlobalState(T.clippingPlanes,n),r&&F.viewport(re.copy(r)),i.length>0&&ct(i,t,n),a.length>0&&ct(a,t,n),o.length>0&&ct(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function st(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=Ee.has(`EXT_color_buffer_half_float`)||Ee.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new jo(1,1,{generateMipmaps:!0,type:e?pi:oi,minFilter:ai,samples:Math.max(4,De.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:K.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||re;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(oe),se=T.getClearAlpha(),se<1&&T.setClearColor(16777215,.5),T.clear(),Ce&&Re.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),ve===!0&&Ie.setGlobalState(T.clippingPlanes,r),ct(e,n,r),L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a),Ee.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,lt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(oe,se),d!==void 0&&(r.viewport=d),T.toneMapping=u}function ct(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&lt(o,t,n,s,l,c)}}function lt(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function ut(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function dt(e,t,n){t.isScene!==!0&&(t=Se);let r=I.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=Ne.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=Ne.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=ke.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Xe),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return z(e,s),d}else s.uniforms=Ne.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=Ne.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ie.uniform),z(e,s),r.needsLights=gt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=ut(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function ft(e,t,n,r,i){let a=I.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=dt(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function pt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=rp.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function z(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function mt(e,t,n,r,i){t.isScene!==!0&&(t=Se),L.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=M===null?T.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:K.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=ke.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),b=x.state.lights;if(ve===!0&&(ye===!0||e!==ne)){let t=e===ne&&r.id===te;Ie.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ie.numPlanes||v.numIntersection!==Ie.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===ut(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?ft(r,t,i,s,h):dt(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(F.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==te&&(te=r.id,O=!0),E||ne!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(P,`projectionMatrix`,e.projectionMatrix),A.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(P,xe.setFromMatrixPosition(e.matrixWorld)),De.logarithmicDepthBuffer&&A.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),ne!==e&&(ne=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(P,`sunShadowMap`,b.state.sunShadowMap,L),b.state.directionalShadowMap.length>0&&A.setValue(P,`directionalShadowMap`,b.state.directionalShadowMap,L),b.state.spotShadowMap.length>0&&A.setValue(P,`spotShadowMap`,b.state.spotShadowMap,L),b.state.pointShadowMap.length>0&&A.setValue(P,`pointShadowMap`,b.state.pointShadowMap,L)),i.isSkinnedMesh){A.setOptional(P,i,`bindMatrix`),A.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(P,`boneTexture`,e.boneTexture,L))}i.isBatchedMesh&&(A.setOptional(P,i,`batchingTexture`),A.setValue(P,`batchingTexture`,i._matricesTexture,L),A.setOptional(P,i,`batchingIdTexture`),A.setValue(P,`batchingIdTexture`,i._indirectTexture,L),A.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(P,`batchingColorTexture`,i._colorsTexture,L));let ee=n.morphAttributes;if((ee.position!==void 0||ee.normal!==void 0||ee.color!==void 0)&&ze.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=bm()),O){if(A.setValue(P,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&ht(j,k),a&&r.fog===!0&&Pe.refreshFogUniforms(j,a),Pe.refreshMaterialUniforms(j,r,ue,le,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}rp.upload(P,pt(v),j,L)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(rp.upload(P,pt(v),j,L),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(P,`center`,i.center),A.setValue(P,`modelViewMatrix`,i.modelViewMatrix),A.setValue(P,`normalMatrix`,i.normalMatrix),A.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];We.update(n,w),We.bind(n,w)}}return w}function ht(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function gt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){M=e,j=t,ee=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest,F.viewport(re),F.scissor(ie),F.setScissorTest(ae),te=-1;return}if(o.__webglFramebuffer===void 0)L.setupRenderTarget(e);else if(o.__hasExternalTextures)L.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);L.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&L.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,re.copy(e.viewport),ie.copy(e.scissor),ae=e.scissorTest}else re.copy(pe).multiplyScalar(ue).floor(),ie.copy(me).multiplyScalar(ue).floor(),ae=he;if(n!==0&&(r=O),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(re),F.scissor(ie),F.setScissorTest(ae),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}te=-1};function _t(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=De.textureFormatReadable(e.format),t.__typeReadable=De.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=_t(o);if(u.__formatReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){V(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,He.convert(c),He.convert(l),a)}finally{let e=M===null?null:I.get(M).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=_t(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,He.convert(l),He.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=M===null?null:I.get(M).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Fa(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;L.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=He.convert(t.format),_=He.convert(t.type),v;t.isData3DTexture?(L.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(L.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(L.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,k),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&L.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?L.setTextureCube(e,0):e.isData3DTexture?L.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?L.setTexture2DArray(e,0):L.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){j=0,ee=0,M=null,F.reset(),Ue.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ea}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=K._getDrawingBufferColorSpace(e),t.unpackColorSpace=K._getUnpackColorSpace()}},Sm=new Po,Cm=new fo,wm=new Wo,Tm=new W,Em=new W,Dm=new q,Om=new W,km=1;function Am(){return km=km*1664525+1013904223>>>0,km/4294967296}var jm=class{pos=[];col=[];anim=[];hasAnim=!1;forceAnim=!1;constructor(e=1){km=e}add(e,t,n={}){let r=e.index?e.toNonIndexed():e;wm.set(n.rx??0,n.ry??0,n.rz??0),Cm.setFromEuler(wm);let i=n.s??1;Tm.set((n.sx??1)*i,(n.sy??1)*i,(n.sz??1)*i),Em.set(n.x??0,n.y??0,n.z??0),Sm.compose(Em,Cm,Tm);let a=r.getAttribute(`position`),o=n.jitter??.07,s=n.swing??0,c=n.flap??0;(s!==0||c!==0)&&(this.hasAnim=!0);let l=n.pivot??0,u=n.flapFrom??0;for(let e=0;e<a.count;e+=3){let n=1+(Am()-.5)*2*o;Dm.set(t);for(let t=0;t<3;t++)Om.fromBufferAttribute(a,e+t).applyMatrix4(Sm),this.pos.push(Om.x,Om.y,Om.z),this.col.push(Dm.r*n,Dm.g*n,Dm.b*n),this.anim.push(s*Math.max(0,l-Om.y),c*Math.max(0,Math.abs(Om.x)-u))}return r!==e&&r.dispose(),e.dispose(),this}box(e,t,n,r,i){return this.add(new Al(e,t,n),r,i)}plane(e,t,n,r){return this.add(new Il(e,t),n,r)}cyl(e,t,n,r,i,a){return this.add(new jl(e,t,n,r,1),i,a)}cone(e,t,n,r,i){return this.add(new Ml(e,t,n,1),r,i)}ico(e,t,n,r){return this.add(new Pl(e,t),n,r)}octa(e,t,n){return this.add(new Fl(e,0),t,n)}tintUpFaces(e,t,n=1){Dm.set(e);let r=this.pos,i=new W,a=new W,o=new W;for(let e=0;e<r.length;e+=9)if(i.set(r[e],r[e+1],r[e+2]),a.set(r[e+3],r[e+4],r[e+5]),o.set(r[e+6],r[e+7],r[e+8]),a.sub(i),o.sub(i),a.cross(o).normalize(),a.y>t){let t=1+(Am()-.5)*.16;for(let r=0;r<9;r+=3)this.col[e+r]=uo.lerp(this.col[e+r],Dm.r*t,n),this.col[e+r+1]=uo.lerp(this.col[e+r+1],Dm.g*t,n),this.col[e+r+2]=uo.lerp(this.col[e+r+2],Dm.b*t,n)}return this}crumple(e){let t=this.pos;for(let n=0;n<t.length;n+=3){let r=t[n],i=t[n+1],a=t[n+2],o=Math.sin(r*12.9898+i*78.233+a*37.719)*43758.5453,s=1+(o-Math.floor(o)-.5)*2*e;t[n]=r*s,t[n+1]=i*s,t[n+2]=a*s}return this}build(){let e=new uc;return e.setAttribute(`position`,new J(this.pos,3)),e.setAttribute(`color`,new J(this.col,3)),(this.hasAnim||this.forceAnim)&&e.setAttribute(`aAnim`,new J(this.anim,2)),e.computeVertexNormals(),e.computeBoundingSphere(),e}},Mm={uCam:{value:new W},uHero:{value:new W},uTime:{value:0},uDetail:{value:null}};function Nm(e,t,n=1){let r=e.getAttribute(`position`),i=new Float32Array(r.count);for(let e=0;e<r.count;e++)i[e]=Math.min(1,Math.max(0,r.getY(e)/t))*n;return e.setAttribute(`aWind`,new Xs(i,1)),e}function Pm(e,t=.25){let n=e.getAttribute(`normal`),r=new W;for(let e=0;e<n.count;e++)r.fromBufferAttribute(n,e).multiplyScalar(t),r.y=1,r.normalize(),n.setXYZ(e,r.x,r.y,r.z);return n.needsUpdate=!0,e}var Fm=new Xl({vertexColors:!0});Fm.onBeforeCompile=e=>{e.uniforms.uCam=Mm.uCam,e.uniforms.uHero=Mm.uHero,e.uniforms.uTime=Mm.uTime,e.uniforms.uDetail=Mm.uDetail,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vMbWorld;
attribute float aWind;
uniform float uTime;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
#ifdef USE_INSTANCING
{
  // Every instance sways with its own phase; higher and thinner parts move more (aWind).
  vec3 mbO = vec3(instanceMatrix[3]);
  float mbP = mbO.x * 0.31 + mbO.z * 0.27;
  float mbS = sin(uTime * 1.15 + mbP + transformed.y * 0.22) * 0.16 + sin(uTime * 2.9 + mbP * 1.7 + transformed.y * 0.9 + transformed.x) * 0.045;
  transformed.x += mbS * aWind;
  transformed.z += mbS * 0.6 * aWind;
}
#endif`).replace(`#include <project_vertex>`,`#include <project_vertex>
vec4 mbWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
mbWorld = instanceMatrix * mbWorld;
#endif
vMbWorld = (modelMatrix * mbWorld).xyz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec3 vMbWorld;
uniform vec3 uCam;
uniform vec3 uHero;
uniform sampler2D uDetail;`).replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
{
  vec3 mbAB = uHero - uCam;
  vec3 mbAP = vMbWorld - uCam;
  float mbT = clamp(dot(mbAP, mbAB) / dot(mbAB, mbAB), 0.0, 1.0);
  if (mbT < 0.9) {
    float mbD = length(mbAP - mbAB * mbT);
    float mbR = mix(3.4, 1.7, mbT);
    float mbA = smoothstep(mbR * 0.5, mbR, mbD);
    float mbN = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
    if (mbA < mbN) discard;
  }
}`).replace(`#include <color_fragment>`,`#include <color_fragment>
{
  // Brush-stroke detail projected along a skewed axis so it shows on walls and tops alike.
  vec2 mbUv = vMbWorld.xz * 0.37 + vMbWorld.y * vec2(0.23, 0.31);
  float mbDt = texture2D(uDetail, mbUv).r;
  diffuseColor.rgb *= 0.62 + mbDt * 0.76;
}`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
// A trace of self-illumination: trunks and stones never sink into pure black at night.
totalEmissiveRadiance += diffuseColor.rgb * 0.1;`)},Fm.customProgramCacheKey=()=>`mb-prop3`;function Im(e,t,n,r,i,a,o,s,c,l=0){let u=e,d=t*16,f=Math.cos(a),p=Math.sin(a);if(l===0)u[d]=f*o,u[d+1]=0,u[d+2]=-p*o,u[d+4]=0,u[d+5]=s,u[d+6]=0,u[d+8]=p*c,u[d+9]=0,u[d+10]=f*c;else{let e=Math.cos(l),t=Math.sin(l);u[d]=f*o,u[d+1]=0,u[d+2]=-p*o,u[d+4]=p*t*s,u[d+5]=e*s,u[d+6]=f*t*s,u[d+8]=p*e*c,u[d+9]=-t*c,u[d+10]=f*e*c}u[d+3]=0,u[d+7]=0,u[d+11]=0,u[d+12]=n,u[d+13]=r,u[d+14]=i,u[d+15]=1}function Lm(e){let t=new jm(e);return t.forceAnim=!0,t}var Rm=16771488;function zm(){let e=Lm(101),t=13793838,n=12461086,r=8013352,i=6567456,a=4860964,o=10246704;e.box(.33,.42,.25,r,{y:.49});for(let t=0;t<4;t++)e.cone(.05,.11,3,t%2?r:i,{x:-.12+t*.08,y:.25,z:.085,rx:Math.PI});for(let t=0;t<3;t++)e.cone(.05,.11,3,t%2?i:r,{x:-.1+t*.1,y:.25,z:-.085,rx:Math.PI});for(let t of[-1,1]){e.cone(.05,.1,3,i,{x:t*.13,y:.255,rx:Math.PI}),e.box(.085,.4,.1,a,{x:t*.205,y:.5,swing:-t*.9,pivot:.72}),e.box(.125,.3,.13,a,{x:t*.085,y:.15,swing:t*1.3,pivot:.34});for(let n=0;n<3;n++)e.plane(.014,.045,12096616,{x:t*.125,y:.07+n*.075,z:.073,jitter:0,swing:t*1.3,pivot:.34});e.octa(.15,6265400,{x:t*.27,y:.645,z:.1,sx:.64,sy:.92,sz:.6,rz:-t*.2,flap:.2,flapFrom:.22}),e.octa(.15,3832374,{x:t*.37,y:.7,z:-.02,sx:.62,sy:.98,sz:.6,rz:-t*.45,flap:.2,flapFrom:.22}),e.box(.035,.035,.03,13674576,{x:t*.115,y:.665,z:.17,jitter:0})}e.box(.38,.13,.33,o,{y:.665}),e.cone(.13,.2,4,o,{y:.57,z:.142,rx:Math.PI,sz:.15}),e.box(.4,.47,.31,t,{y:.955,z:.02});for(let n of[-1,1])e.cone(.08,.38,4,t,{x:n*.176,y:1.35,z:.02,rz:-n*.3}),e.box(.104,.095,.02,1511436,{x:n*.102,y:.986,z:.178}),e.box(.045,.045,.02,Rm,{x:n*.102,y:.986,z:.185,jitter:0}),e.box(.045,.14,.03,15391924,{x:n*.155,y:.83,z:.18});return e.box(.056,.24,.035,n,{y:1.105,z:.185}),e.box(.056,.03,.12,n,{y:1.205,z:.13}),e.box(.19,.042,.03,n,{y:.816,z:.18}),e.build()}function Bm(){let e=Lm(102),t=9418140,n=6261366,r=5603386;e.box(.72,.8,.44,t,{y:1.1,z:.05,rx:.3}),e.box(.6,.4,.4,n,{y:.62}),e.box(.44,.46,.42,t,{y:1.68,z:.3}),e.box(.2,.16,.05,1845794,{y:1.56,z:.52}),e.box(.08,.07,.05,Rm,{x:.11,y:1.76,z:.52,jitter:0}),e.box(.08,.07,.05,Rm,{x:-.11,y:1.76,z:.52,jitter:0});for(let t=0;t<7;t++){let n=t/7*R;e.box(.1,.55+t%3*.12,.05,t%2?r:6986304,{x:Math.cos(n)*.22,y:1.62-t%3*.05,z:.28+Math.sin(n)*.2,rz:Math.cos(n)*.25,rx:Math.sin(n)*.2})}e.box(.9,.12,.5,r,{y:1.5,z:.1,rx:.3}),e.box(.14,.5,.06,6986304,{x:.3,y:1.15,z:.3}),e.box(.14,.4,.06,r,{x:-.26,y:1.2,z:.3});for(let r of[-1,1])e.box(.17,.75,.17,t,{x:r*.47,y:1.05,z:.32,rx:-.75,swing:-r*.5,pivot:1.45}),e.box(.2,.14,.24,n,{x:r*.47,y:.78,z:.66,swing:-r*.5,pivot:1.45}),e.cone(.04,.2,3,14215384,{x:r*.42,y:.72,z:.8,rx:1.3,swing:-r*.5,pivot:1.45}),e.cone(.04,.2,3,14215384,{x:r*.52,y:.72,z:.8,rx:1.3,swing:-r*.5,pivot:1.45}),e.box(.22,.5,.24,n,{x:r*.18,y:.25,swing:r*.9,pivot:.5});return e.build()}function Vm(){let e=Lm(103),t=2169902,n=3485770;e.octa(.3,t,{sx:.8,sy:.75,sz:1.5}),e.box(.2,.2,.22,t,{y:.1,z:.42}),e.cone(.07,.3,4,15043114,{y:.07,z:.66,rx:Math.PI/2}),e.box(.05,.05,.05,16747050,{x:.1,y:.15,z:.48,jitter:0}),e.box(.05,.05,.05,16747050,{x:-.1,y:.15,z:.48,jitter:0}),e.box(.22,.04,.4,n,{y:.02,z:-.55,rx:-.15});for(let r of[-1,1])e.box(.55,.04,.42,n,{x:r*.42,y:.08,flap:1.1,flapFrom:.12}),e.box(.5,.035,.3,t,{x:r*.9,y:.08,z:-.05,flap:1.1,flapFrom:.12}),e.cone(.1,.34,3,t,{x:r*1.2,y:.08,z:-.1,rz:-r*Math.PI/2,flap:1.1,flapFrom:.12});return e.build()}function Hm(){let e=Lm(104);return e.ico(.3,0,14220287,{y:0,jitter:.03}),e.cone(.26,.6,5,8382719,{y:.35,jitter:.05}),e.cone(.14,.4,4,11203839,{x:.16,y:.3,z:.05,rz:-.4,jitter:.05}),e.cone(.12,.36,4,5820656,{x:-.17,y:.26,z:-.05,rz:.45,jitter:.05}),e.box(.07,.09,.04,1060922,{x:.09,y:.02,z:.26,jitter:0}),e.box(.07,.09,.04,1060922,{x:-.09,y:.02,z:.26,jitter:0}),e.build()}function Um(){let e=Lm(105),t=8022668,n=4076368;e.box(.44,.7,.3,t,{y:1.05,rx:.2}),e.box(.36,.3,.26,n,{y:.62}),e.box(.36,.36,.34,t,{y:1.56,z:.14}),e.cone(.08,.3,4,n,{x:.16,y:1.86,z:.1,rz:-.3}),e.cone(.08,.3,4,n,{x:-.16,y:1.86,z:.1,rz:.3}),e.box(.09,.09,.04,16732224,{x:.09,y:1.6,z:.32,jitter:0}),e.box(.09,.09,.04,16732224,{x:-.09,y:1.6,z:.32,jitter:0}),e.cone(.05,.14,3,14207136,{y:1.5,z:.36,rx:1.9});for(let r of[-1,1])e.box(.34,.8,.04,n,{x:r*.3,y:1,z:-.2,rz:r*.25,rx:.15}),e.cone(.12,.4,3,n,{x:r*.42,y:.5,z:-.22,rx:Math.PI}),e.box(.11,.7,.11,t,{x:r*.33,y:.98,z:.2,rx:-.55,swing:-r*.8,pivot:1.35}),e.cone(.035,.22,3,15130572,{x:r*.3,y:.62,z:.46,rx:2.2,swing:-r*.8,pivot:1.35}),e.cone(.035,.22,3,15130572,{x:r*.38,y:.62,z:.46,rx:2.2,swing:-r*.8,pivot:1.35}),e.box(.13,.5,.14,n,{x:r*.12,y:.25,swing:r*1.1,pivot:.5});return e.build()}function Wm(){let e=Lm(106),t=4932156,n=3090984;e.box(.62,.62,1.15,t,{y:.9,rx:-.12}),e.box(.7,.5,.5,n,{y:1.08,z:.34});for(let t=0;t<4;t++)e.cone(.1,.26,3,n,{y:1.34-t*.05,z:.3-t*.26});e.box(.44,.42,.44,t,{y:1.06,z:.82}),e.box(.24,.2,.36,n,{y:.96,z:1.14}),e.box(.08,.06,.04,1380366,{y:1,z:1.33}),e.cone(.09,.26,3,n,{x:.15,y:1.38,z:.74}),e.cone(.09,.26,3,n,{x:-.15,y:1.38,z:.74}),e.box(.08,.06,.04,16764992,{x:.12,y:1.12,z:1.05,jitter:0}),e.box(.08,.06,.04,16764992,{x:-.12,y:1.12,z:1.05,jitter:0}),e.cone(.03,.1,3,15788760,{x:.07,y:.84,z:1.26,rx:Math.PI}),e.cone(.03,.1,3,15788760,{x:-.07,y:.84,z:1.26,rx:Math.PI});for(let r of[-1,1])e.box(.18,.74,.2,t,{x:r*.26,y:.37,z:.42,swing:r*1,pivot:.74}),e.box(.2,.7,.24,n,{x:r*.26,y:.35,z:-.42,swing:-r*1,pivot:.7});return e.cone(.11,.6,4,n,{y:.84,z:-.82,rx:-1.9}),e.build()}function Gm(){let e=Lm(107),t=6891044,n=7745064,r=3806228,i=5118490,a=14207136,o=6968890,s=5925428,c=3811872,l=9075808,u=10116140;e.box(.7,.85,.46,n,{y:1.22}),e.box(.72,.42,.48,n,{y:.78});for(let t=0;t<5;t++){let r=-.28+t*.14;e.cone(.1,.16+t%2*.08,4,n,{x:r,y:.5,z:.19,rx:Math.PI,sz:.4}),e.cone(.1,.2-t%2*.08,4,n,{x:r,y:.5,z:-.19,rx:Math.PI,sz:.4})}for(let t of[-1,1]){e.box(.065,.6,.02,u,{x:t*.2,y:1.33,z:.235}),e.box(.065,.34,.02,u,{x:t*.2,y:.76,z:.245});for(let n=0;n<5;n++)e.box(.035,.035,.03,5906460,{x:t*.2,y:n<4?1.12+n*.14:.76,z:n<4?.237:.247,rz:Math.PI/4})}e.box(.74,.1,.5,c,{y:.98}),e.box(.17,.14,.03,l,{y:.98,z:.26}),e.box(.08,.06,.035,r,{y:.98,z:.262});for(let t of[-.3,-.18,.18,.3])e.box(.03,.03,.03,l,{x:t,y:.98,z:.255});e.box(.42,.42,.4,t,{y:1.84,z:.06}),e.box(.2,.26,.1,1706506,{y:1.74,z:.22});for(let n of[-1,1]){e.box(.14,.09,.03,r,{x:n*.11,y:1.92,z:.262}),e.box(.1,.06,.04,16752688,{x:n*.11,y:1.92,z:.268,jitter:0}),e.cyl(.065,.1,.36,4,a,{x:n*.33,y:2.11,z:.04,rz:-n*1.1}),e.cone(.08,.52,4,a,{x:n*.52,y:2.41,z:.04,rz:-n*.12});for(let t=0;t<3;t++)e.box(.2,.06,.11,t===1?s:o,{x:n*.19,y:2.075,z:-.06+t*.11,rz:n*(.25+t*.12)});for(let t=0;t<3;t++)e.box(.17,.07,.48-t*.07,t===2?s:o,{x:n*(.3+t*.13),y:1.69-t*.03,rz:-n*(.1+t*.14)});let u={swing:-n*.7,pivot:1.6};e.box(.22,.58,.22,t,{x:n*.47,y:1.3,...u});for(let r=0;r<4;r++){let a=1.5-r*.14;e.cone(.09,.24,4,i,{x:n*.57,y:a,rz:-n*2.6,...u}),e.cone(.08,.22,4,r%2?i:t,{x:n*.47,y:a-.04,z:.11,rx:2.6,...u}),e.cone(.08,.22,4,r%2?t:i,{x:n*.47,y:a-.04,z:-.11,rx:-2.6,...u})}e.box(.25,.1,.25,c,{x:n*.47,y:.99,...u}),e.box(.03,.03,.03,l,{x:n*.47,y:.99,z:.13,...u}),e.box(.03,.03,.03,l,{x:n*.6,y:.99,...u}),e.box(.2,.16,.2,t,{x:n*.47,y:.87,...u});let d={swing:n*.9,pivot:.62};e.box(.2,.62,.22,5905436,{x:n*.17,y:.31,...d}),e.box(.23,.14,.28,2759702,{x:n*.17,y:.09,z:.03,...d}),e.box(.25,.04,.31,1380366,{x:n*.17,y:.02,z:.03,...d})}return e.ico(.19,0,12611839,{x:.5,y:.78,z:.17,jitter:.03,swing:-.7,pivot:1.6}),e.cone(.08,.5,4,r,{y:.8,z:-.3,rx:-2.2}),e.build()}function Km(){let e=Lm(108),t=2829114,n=13223092;e.cone(.48,1.5,6,t,{y:.75}),e.box(.36,.5,.26,3487048,{y:1.5}),e.box(.3,.38,.3,n,{y:1.96,z:.04}),e.ico(.11,0,16769088,{y:1.99,z:.19,jitter:0}),e.box(.05,.1,.04,1380366,{y:1.99,z:.28,jitter:0}),e.box(.34,.14,.34,t,{y:2.2}),e.cone(.16,.34,4,t,{y:2.38,z:-.06,rx:-.4});for(let t of[-1,1])e.box(.08,.95,.08,n,{x:t*.27,y:1.2,z:.1,rx:-.2,swing:-t*.6,pivot:1.7}),e.cone(.03,.2,3,n,{x:t*.27,y:.66,z:.2,rx:Math.PI,swing:-t*.6,pivot:1.7}),e.box(.2,.3,.05,2039596,{x:t*.2,y:.3,z:.3,rx:.3});return e.build()}function qm(){let e=Lm(109),t=4861786;return e.cyl(.95,.7,1.3,8,6972536,{y:.65}),e.cyl(1.02,1.02,.14,8,5393504,{y:1.3}),e.cyl(.74,.74,.1,8,3814726,{y:.02}),e.box(.3,.3,.06,9077912,{y:.75,z:.88,rz:Math.PI/4}),e.box(.75,.8,.55,t,{y:1.75,z:.05,rx:.3}),e.box(.9,.2,.6,6044272,{y:2.08,z:.12,rx:.3}),e.box(.44,.44,.42,12165258,{y:2.38,z:.36}),e.cone(.09,.42,4,11045490,{y:2.3,z:.72,rx:1.75}),e.box(.09,.05,.04,11075424,{x:.12,y:2.44,z:.58,jitter:0}),e.box(.09,.05,.04,11075424,{x:-.12,y:2.44,z:.58,jitter:0}),e.box(.5,.22,.48,11740702,{y:2.6,z:.3}),e.cone(.14,.36,4,11740702,{y:2.5,z:0,rx:-2}),e.ico(.2,0,13617344,{y:2.42,z:.02}),e.cyl(.07,.07,2.6,5,6965802,{x:.9,y:1.7,z:.2,rz:.35,rx:.2}),e.cone(.3,.7,6,13213776,{x:1.36,y:.5,z:-.05,rz:.35,rx:Math.PI+.2}),e.box(.16,.6,.16,t,{x:.62,y:1.9,z:.3,rz:-.9}),e.box(.16,.6,.16,t,{x:-.6,y:1.75,z:.3,rz:.7,rx:-.6}),e.build()}function Jm(){let e=Lm(110),t=15920344,n=14856256;e.cone(.72,1.9,7,t,{y:.95}),e.box(.5,.6,.3,t,{y:1.95}),e.box(.52,.07,.32,11740702,{y:1.68}),e.box(.1,.5,.31,11740702,{y:2}),e.box(.34,.38,.32,15785160,{y:2.46,z:.02}),e.box(.08,.05,.04,16777215,{x:.09,y:2.5,z:.18,jitter:0}),e.box(.08,.05,.04,16777215,{x:-.09,y:2.5,z:.18,jitter:0}),e.box(.42,.9,.14,n,{y:2.1,z:-.2}),e.box(.4,.14,.38,n,{y:2.68});for(let t=0;t<9;t++){let n=t/9*R;e.cone(.05,.22,3,t%3==0?13643808:15779920,{x:Math.cos(n)*.23,y:2.78,z:Math.sin(n)*.23,rz:-Math.cos(n)*.5,rx:Math.sin(n)*.5})}return e.box(.12,.7,.12,t,{x:.36,y:1.9,z:.2,rx:-.9}),e.box(.12,.7,.12,t,{x:-.36,y:1.9,z:.2,rx:-.6}),e.cyl(.05,.05,3.1,5,6965802,{x:.5,y:1.9,z:.5,rz:-.25}),e.box(1.1,.2,.04,13160668,{x:.4,y:3.38,z:.5,rz:.35}),e.cone(.1,.5,3,14673648,{x:-.28,y:3.12,z:.5,rz:1.2,sz:.3}),e.build()}function Ym(){let e=Lm(111),t=4010022,n=2760987,r=4877872,i=14273968;e.ico(2.3,1,t,{y:5.2,z:-.3,sx:1.15,sy:1,sz:.95,jitter:.12}),e.ico(1.7,1,n,{y:3.4,z:0,sx:1,sy:1,sz:.85,jitter:.12}),e.ico(1.5,0,t,{y:6.5,z:.5,sx:1.2,sy:.8,sz:1}),e.tintUpFaces(r,.45,.92),e.box(1,1.1,1,i,{y:7,z:1.7,rx:.25}),e.box(.62,.6,1.2,i,{y:6.5,z:2.5,rx:.35}),e.box(.5,.16,.9,12102284,{y:6.1,z:2.4,rx:.5}),e.box(.24,.26,.1,16747040,{x:.3,y:7.1,z:2.22,rx:.25,jitter:0}),e.box(.24,.26,.1,16747040,{x:-.3,y:7.1,z:2.22,rx:.25,jitter:0}),e.box(.3,.3,.1,1708556,{x:.3,y:7.1,z:2.18,rx:.25,s:1.3}),e.box(.3,.3,.1,1708556,{x:-.3,y:7.1,z:2.18,rx:.25,s:1.3});for(let a of[-1,1]){e.cyl(.12,.2,2.4,5,n,{x:a*.9,y:8.4,z:1.3,rz:-a*.55}),e.cyl(.08,.13,1.6,5,n,{x:a*1.9,y:9.5,z:1.3,rz:-a*.15}),e.cyl(.06,.1,1.2,5,n,{x:a*1.25,y:9.3,z:1.5,rz:a*.3,rx:.3}),e.cyl(.06,.1,1.3,5,n,{x:a*2.3,y:8.9,z:1.1,rz:-a*1.1}),e.cyl(.05,.08,.9,5,n,{x:a*2.1,y:10.3,z:1.3,rz:a*.4}),e.box(.12,1.2,.06,r,{x:a*1.6,y:8.5,z:1.3}),e.box(.1,.9,.06,5931574,{x:a*2.4,y:8.3,z:1.1}),e.cyl(.5,.62,3.2,6,t,{x:a*2.6,y:4.6,z:.6,rz:a*.25,rx:-.25,swing:-a*.35,pivot:6.2}),e.cyl(.42,.5,2.6,6,n,{x:a*3.1,y:2.1,z:1.3,rx:-.5,swing:-a*.35,pivot:6.2});for(let t=0;t<3;t++)e.cone(.16,1,4,i,{x:a*(2.8+t*.3),y:.55,z:2.2,rx:2.3,swing:-a*.35,pivot:6.2});e.box(.2,1.6,.08,r,{x:a*2.7,y:3.6,z:.9,swing:-a*.35,pivot:6.2}),e.box(.2,1.3,.08,5931574,{x:a*3.1,y:3.9,z:.5,swing:-a*.35,pivot:6.2}),e.cyl(.6,.85,2.8,6,n,{x:a*1,y:1.4,z:-.2,swing:a*.3,pivot:2.8}),e.box(1.5,.4,1.8,t,{x:a*1,y:.2,z:.1,swing:a*.3,pivot:2.8})}for(let t=0;t<7;t++)e.box(.22,1.4+t%3*.5,.08,t%2?r:5931574,{x:-1.2+t*.4,y:5-t%3*.2,z:1.5});for(let t=0;t<5;t++){let n=t/5*2.4-1.2;e.cyl(.08,.1,.4,5,15261640,{x:Math.sin(n)*1.6,y:7.2+Math.cos(n)*.4,z:-.9}),e.cone(.34,.26,6,11875626,{x:Math.sin(n)*1.6,y:7.52+Math.cos(n)*.4,z:-.9})}return e.build()}function Xm(){return{chochlik:{geo:zm(),cycle:15,hop:.14,emissive:0},utopiec:{geo:Bm(),cycle:6,hop:.05,emissive:0},kruk:{geo:Vm(),cycle:16,hop:0,emissive:0},ognik:{geo:Hm(),cycle:8,hop:0,emissive:3848400},strzyga:{geo:Um(),cycle:10,hop:.06,emissive:0},wilkolak:{geo:Wm(),cycle:12,hop:.1,emissive:0},bies:{geo:Gm(),cycle:7,hop:.05,emissive:0},licho:{geo:Km(),cycle:5,hop:.03,emissive:0},jaga:{geo:qm(),cycle:3,hop:0,emissive:0},poludnica:{geo:Jm(),cycle:4,hop:.04,emissive:4866080},leszy:{geo:Ym(),cycle:2.2,hop:.1,emissive:0}}}function Zm(e,t){let n=new Xl({vertexColors:!0,emissive:e});return n.onBeforeCompile=e=>{e.uniforms.uTime=t.uTime,e.uniforms.uCycle=t.uCycle,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec2 aAnim;
attribute vec4 aFx;
varying vec4 vFx;
uniform float uTime;
uniform float uCycle;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vFx = aFx;
float mbPhase = uTime * uCycle * (1.0 - aFx.w * 0.6) + aFx.z;
float mbS = sin(mbPhase);
transformed.z += aAnim.x * mbS;
transformed.y += aAnim.y * mbS;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec4 vFx;
uniform float uTime;`).replace(`#include <color_fragment>`,`#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.85, 1.0), vFx.w * 0.6);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), vFx.x * 0.8);`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
// A little self-illumination keeps silhouettes readable in the dark forest.
totalEmissiveRadiance += diffuseColor.rgb * 0.22;
// The hit flash stays below the bloom threshold: a white pop, not a flare over half the screen.
totalEmissiveRadiance += vec3(1.0) * vFx.x * 0.4;
// Cool rim light from the sky outlines every creature against the dark ground.
float mbRim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 3.0);
totalEmissiveRadiance += vec3(0.42, 0.4, 0.75) * mbRim * 0.4;
totalEmissiveRadiance += vec3(1.0, 0.7, 0.15) * vFx.y * (0.3 + 0.2 * sin(uTime * 6.0));`)},n.customProgramCacheKey=()=>`mb-creature2`,n}var Qm=class{group=new cs;views=[];constructor(){let e=Xm();for(let t of ct){let n=e[t.id];if(!n)throw Error(`No model for enemy ${t.id}`);let r=t.rank?8:800,i={uTime:{value:0},uCycle:{value:n.cycle}},a=Zm(n.emissive,i),o=new dl(n.geo,a,r),s=new rl(new Float32Array(r*4),4);s.setUsage(Ta),o.geometry.setAttribute(`aFx`,s),o.instanceMatrix.setUsage(Ta),o.frustumCulled=!1,o.castShadow=!0,o.count=0,this.group.add(o),this.views.push({mesh:o,fx:s,uniforms:i,model:n,def:t,count:0})}}setShadows(e){for(let t of this.views)t.mesh.castShadow=e}update(e,t,n){let r=e.enemies,i=this.views;for(let e=0;e<i.length;e++){let t=i[e];t.count=0,t.uniforms.uTime.value=n}for(let e=0;e<r.n;e++){if(!r.alive[e])continue;let a=i[r.type[e]],o=a.count;if(o>=a.mesh.instanceMatrix.count)continue;a.count++;let s=a.def,c=r.px[e],l=r.pz[e],u=c+(r.x[e]-c)*t,d=l+(r.z[e]-l)*t,f=r.y[e]+r.oy[e],p=r.py[e]+(f-r.py[e])*t,m=r.elite[e],h=s.scale*(m?1.35:1),g=h,_=s.flying?.18:.1,v=r.state[e],y=Math.abs(r.x[e]-c)+Math.abs(r.z[e]-l)>.004,b=r.spawnT[e];if(b>0){let e=1-Math.min(1,b/.5);p-=(1-e)*s.height*.7*!s.flying,h*=.35+.65*e,g=h}switch(y&&a.model.hop>0&&(p+=Math.abs(Math.sin(n*a.model.cycle*.5+e*1.3))*a.model.hop),s.ai){case`kamikaze`:if(v===1){let e=1+.3*Math.sin(n*34);h*=e,g*=e}break;case`leaper`:v===1?(g*=.68,h*=1.12):v===2&&(g*=1.15,_=.5);break;case`charger`:v===1?_=-.28:v===2&&(_=.32);break;case`poludnica`:v===1?_=Math.sin(n*25)*.25:v===3&&(_=.4);break;case`leszy`:if(v===1){let t=Math.min(1,r.t2[e]/1.15);g*=1+.1*Math.sin(t*Math.PI),_=-.12*Math.sin(t*Math.PI)}else v===2?_=-.15:v===3&&(_=.25);break;case`jaga`:_=v===1?.5:.12+Math.sin(n*1.7)*.08}let x=r.flash[e];x>.06&&(h*=1.07,g*=.95),Im(a.mesh.instanceMatrix.array,o,u,p,d,r.yaw[e],h,g,h,_);let S=a.fx.array,C=o*4;S[C]=x>0?Math.min(1,x/.1):0,S[C+1]=m,S[C+2]=e*1.618,S[C+3]=r.slowT[e]>0?Math.min(1,r.slowK[e]*1.6):0}for(let e=0;e<i.length;e++){let t=i[e];t.mesh.count=t.count,t.count>0&&(t.mesh.instanceMatrix.needsUpdate=!0,t.fx.needsUpdate=!0,t.mesh.instanceMatrix.clearUpdateRanges(),t.mesh.instanceMatrix.addUpdateRange(0,t.count*16),t.fx.clearUpdateRanges(),t.fx.addUpdateRange(0,t.count*4))}}},$m=new nl(new Float32Array(48841),221,221,wi,fi);$m.minFilter=ei,$m.magFilter=ei,$m.generateMipmaps=!1;var eh={uGroundH:{value:$m},uGroundGrid:{value:new W(-220,2,221)}};function th(e){$m.image.data.set(e.heights),$m.needsUpdate=!0}var nh=`
uniform sampler2D uGroundH;
uniform vec3 uGroundGrid;
// Same interpolation as GameMap.heightAt: two triangles per cell split along u + v = 1.
float mbGroundAt(vec2 p) {
  vec2 f = clamp((p - uGroundGrid.x) / uGroundGrid.y, vec2(0.0), vec2(uGroundGrid.z - 1.001));
  ivec2 c = ivec2(floor(f));
  vec2 uv = f - vec2(c);
  float h00 = texelFetch(uGroundH, c, 0).r;
  float h10 = texelFetch(uGroundH, c + ivec2(1, 0), 0).r;
  float h01 = texelFetch(uGroundH, c + ivec2(0, 1), 0).r;
  float h11 = texelFetch(uGroundH, c + ivec2(1, 1), 0).r;
  if (uv.x + uv.y <= 1.0) return h00 + (h10 - h00) * uv.x + (h01 - h00) * uv.y;
  return h11 + (h01 - h11) * (1.0 - uv.x) + (h10 - h11) * (1.0 - uv.y);
}
`,rh=`
vec4 mvPosition = vec4(transformed, 1.0);
vec4 mbCentre = vec4(0.0, 0.0, 0.0, 1.0);
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
  mbCentre = instanceMatrix * mbCentre;
#endif
vec4 mbWorld = modelMatrix * mvPosition;
mbCentre = modelMatrix * mbCentre;
// Keep the centre's lift above the ground, measured from the ground under each vertex instead.
mbWorld.y = mbGroundAt(mbWorld.xz) + (mbCentre.y - mbGroundAt(mbCentre.xz));
mvPosition = viewMatrix * mbWorld;
gl_Position = projectionMatrix * mvPosition;
`;function ih(e){return e.onBeforeCompile=e=>{Object.assign(e.uniforms,eh),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\n${nh}`).replace(`#include <project_vertex>`,rh)},e.customProgramCacheKey=()=>`mb-ground-decal`,e.polygonOffset=!0,e.polygonOffsetFactor=-2,e.polygonOffsetUnits=-2,e}function ah(e=40,t=10){return new Ll(0,1,e,t).rotateX(-Math.PI/2)}var oh=`
attribute float aSize;
attribute vec4 aColor;
varying vec4 vColor;
uniform float uScale;
void main() {
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / max(0.1, -mv.z);
}`,sh=`
varying vec4 vColor;
uniform float uSoft;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float a = mix(step(d, 1.0), smoothstep(1.0, 0.0, d), uSoft);
  if (a <= 0.01) discard;
  gl_FragColor = vec4(vColor.rgb, vColor.a * a);
  #include <colorspace_fragment>
}`,ch=new q,lh=class{points;max;pos;col;size;vel;life;span;base;grav;drag;rgb;cursor=0;mat;geo;density=1;constructor(e,t,n=1){this.max=e,this.pos=new Float32Array(e*3),this.col=new Float32Array(e*4),this.size=new Float32Array(e),this.vel=new Float32Array(e*3),this.life=new Float32Array(e),this.span=new Float32Array(e),this.base=new Float32Array(e),this.grav=new Float32Array(e),this.drag=new Float32Array(e),this.rgb=new Float32Array(e*3),this.geo=new uc,this.geo.setAttribute(`position`,new Xs(this.pos,3).setUsage(Ta)),this.geo.setAttribute(`aColor`,new Xs(this.col,4).setUsage(Ta)),this.geo.setAttribute(`aSize`,new Xs(this.size,1).setUsage(Ta)),this.mat=new Jl({vertexShader:oh,fragmentShader:sh,uniforms:{uScale:{value:600},uSoft:{value:n}},transparent:!0,depthWrite:!1,blending:t?2:1,toneMapped:!1}),this.points=new Cl(this.geo,this.mat),this.points.frustumCulled=!1,this.points.renderOrder=5}setScale(e,t){this.mat.uniforms.uScale.value=e/(2*Math.tan(t*Math.PI/360))}emit(e,t,n,r,i,a,o,s,c,l=0,u=0){let d=this.cursor;this.cursor=(d+1)%this.max;let f=d*3;this.pos[f]=e,this.pos[f+1]=t,this.pos[f+2]=n,this.vel[f]=r,this.vel[f+1]=i,this.vel[f+2]=a,this.life[d]=o,this.span[d]=o,this.base[d]=s,this.grav[d]=l,this.drag[d]=u,ch.set(c),this.rgb[f]=ch.r,this.rgb[f+1]=ch.g,this.rgb[f+2]=ch.b}burst(e,t,n,r,i,a,o,s,c=0,l=0,u=2){let d=Math.max(1,Math.round(r*this.density));for(let r=0;r<d;r++){let r=Math.random()*6.2832,d=(Math.random()-.5)*3.1416,f=i*(.35+Math.random()*.65),p=Math.cos(d);this.emit(e,t,n,Math.cos(r)*p*f,Math.sin(d)*f+l,Math.sin(r)*p*f,a*(.6+Math.random()*.4),o*(.6+Math.random()*.6),s,c,u)}}update(e){let{pos:t,vel:n,life:r,span:i,base:a,grav:o,drag:s,col:c,size:l,rgb:u}=this;for(let d=0;d<this.max;d++){let f=r[d];if(f<=0){l[d]!==0&&(l[d]=0);continue}let p=f-e;r[d]=p;let m=d*3,h=1-s[d]*e;n[m]=n[m]*h,n[m+1]=(n[m+1]-o[d]*e)*h,n[m+2]=n[m+2]*h,t[m]=t[m]+n[m]*e,t[m+1]=t[m+1]+n[m+1]*e,t[m+2]=t[m+2]+n[m+2]*e;let g=p>0?p/i[d]:0;l[d]=a[d]*(.4+.6*g);let _=d*4;c[_]=u[m],c[_+1]=u[m+1],c[_+2]=u[m+2],c[_+3]=g<.5?g*2:1}this.geo.getAttribute(`position`).needsUpdate=!0,this.geo.getAttribute(`aColor`).needsUpdate=!0,this.geo.getAttribute(`aSize`).needsUpdate=!0}},uh=new q,dh={chochlik:13793838,utopiec:9425056,kruk:4866152,ognik:9433343,strzyga:10125504,wilkolak:9074792,bies:13650490,licho:14735472,jaga:11563232,poludnica:16773296,leszy:8040512},fh=ct.map(e=>dh[e.id]??16777215);function ph(e,t,n,r=!1){let i=new dl(e,t,n);return i.instanceMatrix.setUsage(Ta),i.frustumCulled=!1,i.count=0,r&&(i.setColorAt(0,uh.set(16777215)),i.instanceColor.setUsage(Ta)),i}function mh(e,t,n,r=1){let i=e.instanceColor.array;uh.set(n),i[t*3]=uh.r*r,i[t*3+1]=uh.g*r,i[t*3+2]=uh.b*r}function hh(e,t){e.count=t,t>0&&(e.instanceMatrix.needsUpdate=!0,e.instanceColor&&(e.instanceColor.needsUpdate=!0))}function gh(e,t,n,r,i,a,o,s=0){let c=e,l=t*16,u=Math.min(2,Math.max(.6,o*.6)),d=(n.heightAt(r+u,i)-n.heightAt(r-u,i))/(2*u),f=(n.heightAt(r,i+u)-n.heightAt(r,i-u))/(2*u),p=n.heightAt(r,i)+a,m=Math.cos(s),h=Math.sin(s),g=m,_=-h,v=h,y=m,b=d*g+f*_,x=d*v+f*y;c[l]=g*o,c[l+1]=b*o,c[l+2]=_*o,c[l+3]=0,c[l+4]=-d*o,c[l+5]=o,c[l+6]=-f*o,c[l+7]=0,c[l+8]=v*o,c[l+9]=x*o,c[l+10]=y*o,c[l+11]=0,c[l+12]=r,c[l+13]=p,c[l+14]=i,c[l+15]=1}function _h(e,t,n,r,i,a,o=1){let s=new Ll(e,t,i,o,n,r);s.rotateX(-Math.PI/2);let c=s.getAttribute(`position`),l=new Float32Array(c.count*3);for(let i=0;i<c.count;i++){let o=c.getX(i),s=c.getZ(i),u=Math.atan2(-s,o),d=Math.hypot(o,s),f=a?(u-n)/r:1-Math.abs((u-n)/r-.5)*2;f=r>6.2?1:Math.max(0,Math.min(1,f));let p=(d-e)/(t-e),m=a?f*f:(.25+.75*p)*Math.sqrt(f);l[i*3]=m,l[i*3+1]=m,l[i*3+2]=m}return s.setAttribute(`color`,new Xs(l,3)),s}function vh(){let e=new jm(301),t=new zl(.46,.075,4,9,3.3);return t.rotateX(Math.PI/2),e.add(t,16766042,{sy:.45,jitter:.04}),e.cyl(.05,.05,.5,5,6964518,{x:.46,z:.26,rx:Math.PI/2}),e.build()}function yh(){let e=new jm(302);return e.cyl(.045,.045,1.5,5,9069112,{rx:Math.PI/2}),e.cone(.13,.5,4,15134197,{z:.95,rx:Math.PI/2}),e.box(.2,.05,.05,11740702,{z:.6}),e.build()}function bh(){let e=new jm(304);return e.box(.16,.07,.8,11041348,{z:.3}),e.box(.8,.07,.16,9069112,{x:.3}),e.build()}function xh(){let e=new jm(303);return e.ico(.24,0,4861984,{sy:.9}),e.cyl(.12,.14,.12,6,6965808,{y:.24}),e.build()}function Sh(e){let t=e===`gift`,n=e===`rich`,r=t?15328468:n?8002598:7226662,i=t?13617332:n?4853270:4860952,a=t?15920864:n?9708590:8409644,o=t?3124874:n?16764746:14263361,s=t?10483160:n?16773816:16176250,c=1.1,l=.75,u=[-.36,.36],d=new jm(t?314:n?324:304);d.box(c,.52,l,r,{y:.3});for(let e of[.22,.39])d.box(1.112,.022,.762,i,{y:e,jitter:.03});d.box(1.1600000000000001,.09,.81,o,{y:.07}),d.box(1.1400000000000001,.06,.79,o,{y:.53});for(let e of u)d.box(.11,.5,.8,o,{x:e,y:.3});for(let e of[-1,1])for(let t of[-1,1])d.box(.14,.2,.14,o,{x:e*(c/2-.04),y:.2,z:t*(l/2-.04)}),d.octa(.035,s,{x:e*(c/2-.05),y:.22,z:t*.41000000000000003,jitter:.02});for(let e of u)for(let t of[.2,.4])d.octa(.03,s,{x:e,y:t,z:.41000000000000003,jitter:.02});d.box(.22,.26,.06,o,{y:.4,z:.395}),d.box(.05,.1,.02,2364424,{y:.37,z:.427,jitter:0}),d.octa(.04,2364424,{y:.43,z:.42,jitter:0});let f=new jm(t?315:n?325:305),p=l/2,m=(e,t,n,r=0,i=.07)=>{f.add(new jl(t,t,e,9,1,!1,0,Math.PI),n,{x:r,y:.05,z:p,rz:Math.PI/2,sx:.62,jitter:i})};f.box(c,.07,l,a,{y:.035,z:p}),m(c,.375,a),f.box(1.1400000000000001,.06,.79,o,{y:.03,z:p});for(let e of u)m(.11,.4,o,e);for(let e of u)f.octa(.03,s,{x:e,y:.3125,z:p,jitter:.02});if(f.box(.12,.16,.05,o,{y:.02,z:.78}),t){for(let[e,t,n]of[[-.2,.3,.12],[.2,.26,.1],[.5,.44,.06],[-.48,.3,.06]])d.box(n,.035,.02,3947062,{x:e,y:t,z:.383,jitter:0});d.box(.02,.035,.18,3947062,{x:.558,y:.32,z:.1,jitter:0}),d.box(.02,.035,.14,3947062,{x:-1.1/2-.008,y:.3,z:-.12,jitter:0}),f.octa(.15,8257496,{y:.4225,z:p,sy:1.25,jitter:.03}),f.cone(.08,.3,4,5818488,{x:-.3,y:.3625,z:p,rz:.55}),f.cone(.08,.3,4,5818488,{x:.3,y:.3625,z:p,rz:-.55})}if(n){m(.09,.405,o,0),f.box(.3,.05,.3,o,{y:.3025,z:p,jitter:.01}),f.octa(.17,16726618,{y:.46249999999999997,z:p,sy:1.2,jitter:.02});for(let e of[-.5,.5])d.octa(.07,16726618,{x:e,y:.3,z:.405,jitter:.02})}return{base:d.build(),lid:f.build()}}function Ch(){let e=new jm(306);return e.ico(.3,0,13208133,{y:.16,sy:.5,sz:.75}),e.box(.36,.06,.3,15919832,{y:.3}),e.build()}function wh(){let e=new jm(307);return e.cyl(.2,.24,.34,7,12154940,{y:.17}),e.cyl(.22,.22,.07,7,15773744,{y:.36}),e.build()}function Th(){let e=new jm(309);return e.box(.24,.46,.14,16761370,{x:.11,y:.8,rz:-.5,jitter:.02}),e.box(.46,.15,.14,16767050,{y:.56,rz:.12,jitter:.02}),e.box(.24,.46,.14,16761370,{x:-.11,y:.32,rz:-.5,jitter:.02}),e.cone(.12,.24,4,16767050,{x:-.22,y:.05,rz:Math.PI-.5,jitter:.02}),e.build()}function Eh(){let e=new jm(308),t=.28;e.add(new zl(t,.095,5,8,Math.PI),14165546,{y:.375,rz:Math.PI,jitter:.04});for(let n of[-.28,t])e.box(.19,.3,.19,14165546,{x:n,y:.52,jitter:.04}),e.box(.2,.17,.2,15660024,{x:n,y:.75,jitter:.02});return e.build()}var Dh=16,Oh=46;function kh(){let e=new jl(.12,.46,Dh,10,16,!0);e.translate(0,Dh/2,0);let t=e.getAttribute(`position`),n=new Float32Array(t.count*3);for(let e=0;e<t.count;e++){let r=t.getY(e),i=1-r/Dh;n[e*3]=n[e*3+1]=n[e*3+2]=i*i*Math.min(1,.25+r/2.5)}return e.setAttribute(`color`,new Xs(n,3)),e}function Ah(e){return new Hc({vertexColors:!0,color:e,blending:2,transparent:!0,opacity:.27,depthWrite:!1,side:2,toneMapped:!1,fog:!1})}var jh=16732256,Mh=5963658,Nh=8257488,Ph=5813503,Fh=16765514,Ih=16,Lh=8,Rh=9,zh=class{map;overlay;glowTex;group=new cs;sparks=new lh(2600,!0,1);dust=new lh(700,!1,1);shake=0;showNumbers=!0;camYaw=0;gems;coins;bread;honey;magnets;magnetBeams;hastes;hasteBeams;beamGeo=kh();giftBeamMat=Ah(Nh);blades;trails;fire;stones;spears;pots;sticks;twisters;trapRings;secretMesh;shots;ravens;ravenFx;ravenU={uTime:{value:0},uCycle:{value:18}};zones;hazRing;hazFill;bombs;aura;auraMat;cone;coneArc=0;sweeps=[];sweepGeos=new Map;bolts=[];booms=[];warns=[];flash;flashT=0;chestViews=[];chestLight=new Vu(16753208,0,19,1.4);chestLit=-1;chestPoolGeo=new Il(1,1,8,8).rotateX(-Math.PI/2);chestParts=Sh(`paid`);chestMat=new Xl({vertexColors:!0,emissive:2758150});richParts=Sh(`rich`);richMat=new Xl({vertexColors:!0,emissive:3806216});giftParts=Sh(`gift`);giftMat=new Xl({vertexColors:!0,emissive:1456174});gemGlow;heroRing;mist;mistSeeds;ghosts=[];fireflies;fireflyMat;emitAcc=0;time=0;portalView;portalRing;constructor(e,t,n){this.map=e,this.overlay=t,this.glowTex=n;let r=this.group;this.portalView=new cs,this.portalRing=new Y(new zl(2.1,.22,10,40),new Hc({color:Mh,blending:2,transparent:!0,opacity:.85,depthWrite:!1,toneMapped:!1})),this.portalRing.position.y=2.6;let i=new Y(this.beamGeo,Ah(Mh));i.scale.set(5,1.4,5);let a=new Fc(new xc({map:n,color:Mh,blending:2,depthWrite:!1,transparent:!0,opacity:.55,fog:!1}));a.position.y=2.6,a.scale.setScalar(7),this.portalView.add(this.portalRing,i,a),this.portalView.visible=!1,r.add(this.portalView),this.gems=ph(new Fl(.2,0),new Xl({emissive:13134344,flatShading:!0}),ft,!0),this.coins=ph(new jl(.2,.2,.06,8),new Xl({color:16764992,emissive:10119680,flatShading:!0}),256),this.bread=ph(Ch(),new Xl({vertexColors:!0,emissive:2759176}),64),this.honey=ph(wh(),new Xl({vertexColors:!0,emissive:3811336}),64),this.magnets=ph(Eh(),new Xl({vertexColors:!0,emissive:5903380}),Ih),this.magnetBeams=ph(this.beamGeo,Ah(jh),Ih),this.magnetBeams.renderOrder=3,this.hastes=ph(Th(),new Xl({vertexColors:!0,emissive:5913088}),Lh),this.hasteBeams=ph(this.beamGeo,Ah(Ph),Lh),this.hasteBeams.renderOrder=3,r.add(this.gems,this.coins,this.bread,this.honey,this.magnets,this.magnetBeams,this.hastes,this.hasteBeams),this.gemGlow=ph(new Il(1,1).rotateX(-Math.PI/2),new Hc({map:this.glowTex,color:16751146,blending:2,transparent:!0,opacity:.55,depthWrite:!1,toneMapped:!1}),ft),this.gemGlow.renderOrder=2,r.add(this.gemGlow),this.heroRing=new Y(_h(.72,1,0,R,40,!1),ih(new Hc({vertexColors:!0,color:16765024,blending:2,transparent:!0,opacity:.5,depthWrite:!1,toneMapped:!1}))),this.heroRing.renderOrder=3,r.add(this.heroRing),this.mistSeeds=new Float32Array(184);for(let e=0;e<this.mistSeeds.length;e++)this.mistSeeds[e]=Math.random();this.mist=ph(new Il(1,1),new Hc({map:this.glowTex,color:10128072,transparent:!0,opacity:.2,depthWrite:!1,fog:!1}),46),this.mist.renderOrder=1,r.add(this.mist),this.blades=ph(vh(),new Xl({vertexColors:!0,emissive:11565584}),40,!0),this.trails=ph(_h(.88,1.06,-1.3,1.3,12,!0),new Hc({vertexColors:!0,blending:2,transparent:!0,depthWrite:!1,side:2,toneMapped:!1,opacity:.55}),40,!0),this.trails.renderOrder=4,r.add(this.blades,this.trails),this.fire=ph(new Pl(.2,1),new Hc({toneMapped:!1,transparent:!0,opacity:.92,blending:2,depthWrite:!1}),256,!0),this.fire.renderOrder=4,this.stones=ph(new Pl(.17,0),new Xl({flatShading:!0,emissive:2236962}),256,!0),this.spears=ph(yh(),new Xl({vertexColors:!0,emissive:5588002}),256),this.pots=ph(xh(),new Xl({vertexColors:!0}),64),this.shots=ph(new Pl(.36,0),new Hc({color:12611839,toneMapped:!1}),96),this.sticks=ph(bh(),new Xl({vertexColors:!0,emissive:4468760}),64),this.twisters=ph(new jl(.75,.16,2.2,14,3,!0).translate(0,1.1,0),new Hc({transparent:!0,opacity:.11,blending:2,depthWrite:!1,side:2,toneMapped:!1}),32,!0),this.twisters.renderOrder=4,this.secretMesh=new Y(bh(),new Xl({vertexColors:!0,emissive:6965792})),this.secretMesh.visible=!1,r.add(this.fire,this.stones,this.spears,this.pots,this.shots,this.sticks,this.twisters,this.secretMesh);let o=Xm().kruk.geo;this.ravens=ph(o,Zm(2759782,this.ravenU),24),this.ravenFx=new rl(new Float32Array(96),4),o.setAttribute(`aFx`,this.ravenFx),r.add(this.ravens);let s=ah(40,10),c=(e,t)=>ih(new Hc({transparent:!0,opacity:e,depthWrite:!1,blending:t?2:1,toneMapped:!1}));this.zones=ph(s,c(.5,!1),96,!0),this.hazFill=ph(s,c(.4,!1),96,!0),this.hazRing=ph(new Ll(.93,1,72).rotateX(-Math.PI/2),c(.95,!1),96,!0),this.bombs=ph(new Pl(.45,0),new Hc({color:12124e3,toneMapped:!1}),32),this.trapRings=ph(new Ll(.72,1,9).rotateX(-Math.PI/2),c(.85,!1),96,!0),this.trapRings.renderOrder=3,r.add(this.trapRings),this.zones.renderOrder=2,this.hazFill.renderOrder=3,this.hazRing.renderOrder=3,r.add(this.zones,this.hazFill,this.hazRing,this.bombs),this.auraMat=ih(new Hc({vertexColors:!0,color:8377946,transparent:!0,opacity:.5,blending:2,depthWrite:!1,toneMapped:!1,side:2})),this.aura=new Y(_h(.55,1,0,R,72,!1,4),this.auraMat),this.aura.visible=!1,this.aura.renderOrder=3,this.cone=new Y(new uc,new Hc({vertexColors:!0,color:10479871,transparent:!0,opacity:.55,blending:2,depthWrite:!1,toneMapped:!1,side:2})),this.cone.visible=!1,this.cone.renderOrder=3,r.add(this.aura,this.cone);for(let e=0;e<8;e++){let e=new Y(new uc,new Hc({vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,side:2,toneMapped:!1}));e.visible=!1,e.renderOrder=4,r.add(e),this.sweeps.push({mesh:e,t:0,span:.22,r:1})}for(let e=0;e<14;e++){let e=new uc;e.setAttribute(`position`,new Xs(new Float32Array(324),3));let t=new Y(e,new Hc({color:14216447,transparent:!0,blending:2,depthWrite:!1,side:2,toneMapped:!1,fog:!1}));t.visible=!1,t.frustumCulled=!1,t.renderOrder=6,r.add(t),this.bolts.push({mesh:t,t:0,span:.16,r:1})}let l=_h(.72,1,0,R,64,!1);for(let e=0;e<20;e++){let e=new Y(l,ih(new Hc({vertexColors:!0,transparent:!0,blending:2,depthWrite:!1,toneMapped:!1,side:2})));e.visible=!1,e.renderOrder=4,r.add(e),this.booms.push({mesh:e,t:0,span:.28,r:1})}let u=new Il(1,1,1,16).rotateX(-Math.PI/2).translate(0,0,.5);for(let e=0;e<10;e++){let e=new Y(u,c(.4,!1));e.material.color.set(16730666),e.visible=!1,e.renderOrder=3,r.add(e),this.warns.push({mesh:e,t:0,span:.7,r:1})}this.flash=new Vu(12573951,0,40,1.4),r.add(this.flash),r.add(this.sparks.points,this.dust.points,this.chestLight);let d=new Float32Array(420);for(let e=0;e<d.length;e++)d[e]=Math.random();let f=new uc;f.setAttribute(`position`,new Xs(d,3)),this.fireflyMat=new Jl({uniforms:{uTime:{value:0},uCenter:{value:new W},uScale:{value:600},uNight:{value:0}},vertexShader:`
uniform float uTime; uniform vec3 uCenter; uniform float uScale; uniform float uNight;
varying float vA;
void main() {
  vec3 s = position;
  vec2 cell = vec2(70.0);
  vec2 base = s.xz * cell + vec2(sin(uTime * 0.21 + s.y * 40.0), cos(uTime * 0.17 + s.x * 30.0)) * 2.5;
  vec2 rel = mod(base - uCenter.xz + cell * 0.5, cell) - cell * 0.5;
  vec3 p = vec3(uCenter.x + rel.x, uCenter.y + 0.6 + s.y * 3.2 + sin(uTime * 0.9 + s.z * 50.0) * 0.5, uCenter.z + rel.y);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.5 + 0.5 * sin(uTime * (1.5 + s.z * 2.0) + s.x * 60.0);
  vA = tw * (0.35 + 0.65 * uNight) * smoothstep(34.0, 20.0, length(rel));
  gl_PointSize = (0.16 + 0.12 * tw) * uScale / max(0.1, -mv.z);
}`,fragmentShader:`
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(vec3(0.95, 1.0, 0.45) * a * vA * 1.6, a * vA);
  #include <colorspace_fragment>
}`,transparent:!0,blending:2,depthWrite:!1,toneMapped:!1}),this.fireflies=new Cl(f,this.fireflyMat),this.fireflies.frustumCulled=!1,this.fireflies.renderOrder=5,r.add(this.fireflies)}setViewport(e,t){this.sparks.setScale(e,t),this.dust.setScale(e,t),this.fireflyMat.uniforms.uScale.value=e/(2*Math.tan(t*Math.PI/360))}setDensity(e){this.sparks.density=e,this.dust.density=e,this.mist.visible=e>.6}setFogColor(e){this.mist.material.color.copy(e).multiplyScalar(1.5)}addGhost(e){let t=this.ghosts.find(e=>e.t<=0);if(!t){if(this.ghosts.length>=6)return;let e=new Y(new Al(.6,1.7,.4),new Hc({color:16770720,transparent:!0,blending:2,depthWrite:!1,toneMapped:!1}));e.renderOrder=4,this.group.add(e),t={mesh:e,t:0},this.ghosts.push(t)}t.t=.28,t.mesh.visible=!0,t.mesh.position.copy(e.position),t.mesh.position.y+=.85,t.mesh.rotation.set(.7,e.rotation.y,0,`YXZ`)}handleEvents(e){let t=e.events;for(let n=0;n<t.count;n++)this.onEvent(t.items[n],e)}onEvent(e,n){let r=this.sparks;switch(e.type){case t.Hit:e.b!==2&&r.burst(e.x,e.y+e.c*.5,e.z,e.b===1?6:2,5,.25,.22,e.b===1?16769120:16774352,6),this.showNumbers&&this.overlay.number(e.x,e.y+e.c+.3,e.z,e.a,e.b);break;case t.Kill:{let t=fh[e.a]??16777215,n=e.b>0||e.c>1;r.burst(e.x,e.y+.6,e.z,n?26:9,n?9:6,.5,n?.5:.34,t,9,2),this.dust.burst(e.x,e.y+.3,e.z,n?8:3,2.5,.6,n?1.6:.9,3813440,-.5,.6),n&&this.addShake(e.c>2?1.6:.5),e.c>2&&this.boom(e.x,e.y+3,e.z,12,16760928,.7);break}case t.Gem:r.burst(e.x,e.y,e.z,2,2.5,.3,.2,16756784,0,1.5);break;case t.Coin:r.burst(e.x,e.y+1,e.z,5,3,.4,.22,16769120,0,2);break;case t.LevelUp:for(let t=0;t<40;t++){let n=t/40*R;r.emit(e.x+Math.cos(n)*.6,e.y+.2,e.z+Math.sin(n)*.6,Math.cos(n)*6,2+Math.random()*5,Math.sin(n)*6,.8,.4,t%2?16769658:16775120,3,1.5)}this.boom(e.x,e.y+1,e.z,5,16767072,.45);break;case t.PlayerHit:r.burst(e.x,e.y+1.1,e.z,14,6,.4,.34,16726570,8,1),this.addShake(.75);break;case t.Dodge:r.burst(e.x,e.y+1.1,e.z,8,4,.3,.26,15267071,0,2);break;case t.ShieldHit:r.burst(e.x,e.y+1.1,e.z,12,5,.35,.3,8308991,4,1),this.addShake(.3);break;case t.Lightning:this.bolt(e.a,e.b,e.c,e.x,e.y,e.z,e.d),r.burst(e.x,e.y+.4,e.z,10,8,.3,.3,14216447,10,3),this.flash.position.set(e.x,e.y+3,e.z),this.flashT=.14,this.addShake(.22);break;case t.Sweep:this.sweep(e.x,e.y,e.z,e.a,e.b,e.c,e.d);break;case t.Explosion:this.boom(e.x,e.y,e.z,e.a,e.b,.28),r.burst(e.x,e.y,e.z,10,e.a*3,.4,.4,e.b,4,2);break;case t.Jump:this.dust.burst(e.x,e.y+.1,e.z,5,2.2,.4,.8,9075302,-.4,.3);break;case t.AirJump:for(let t=0;t<14;t++){let n=t/14*R;r.emit(e.x,e.y+.2,e.z,Math.cos(n)*4,-1,Math.sin(n)*4,.4,.34,16747066,0,3)}break;case t.Dash:this.dust.burst(e.x,e.y+.3,e.z,8,3,.45,1.1,10127992,-.3,.4),r.burst(e.x,e.y+.8,e.z,6,3,.3,.22,16773312);break;case t.Land:e.b>0?r.burst(e.x,e.y+.2,e.z,14,4.5,.5,.26,11061480,12,4):this.dust.burst(e.x,e.y+.1,e.z,3+Math.round(e.a*8),2.5+e.a*2,.45,.9,9075302,-.4,.3);break;case t.Heal:for(let t=0;t<10;t++)r.emit(e.x+(Math.random()-.5)*1.2,e.y+.3+Math.random(),e.z+(Math.random()-.5)*1.2,0,2.2,0,.8,.3,8257402,0,.5);break;case t.ChestOpen:{let t=e.a===1?Nh:e.a===2?Fh:16767072;r.burst(e.x,e.y+.8,e.z,e.a===2?70:36,e.a===2?10:8,.8,.4,t,6,4),this.boom(e.x,e.y+.8,e.z,e.a===2?6:3.5,t,e.a===2?.6:.4);break}case t.Bonus:{let t=e.a===3?Ph:e.a===2?Mh:e.a?Nh:jh;this.boom(e.x,e.y+.8,e.z,4.5,t,.6);for(let n=0;n<36;n++){let i=Math.random()*R,a=Math.random()*.9;r.emit(e.x+Math.cos(i)*a,e.y+Math.random()*5,e.z+Math.sin(i)*a,0,2+Math.random()*4,0,1.2,.36,n%3?t:16777215,0,.4)}break}case t.Shrine:for(let t=0;t<30;t++)r.emit(e.x+(Math.random()-.5)*1.5,e.y+Math.random()*4,e.z+(Math.random()-.5)*1.5,0,3+Math.random()*3,0,1.1,.36,16770720,0,.4);break;case t.BossSpawn:this.addShake(1.2),this.dust.burst(e.x,e.y+1,e.z,24,7,1.2,2.6,2761272,-.3,1),r.burst(e.x,e.y+2,e.z,40,10,.9,.5,16747040,2,3);break;case t.Teleport:r.burst(e.x,e.y+1,e.z,14,4,.5,.36,14735472,0,1),r.burst(e.a,this.map.heightAt(e.a,e.b)+1,e.b,14,4,.5,.36,14735472,0,1);break;case t.Death:r.burst(e.x,e.y+1,e.z,60,9,1.1,.5,16726570,6,3),this.addShake(1.5);break;case t.Win:for(let t=0;t<120;t++)r.emit(e.x+(Math.random()-.5)*8,e.y+Math.random()*8,e.z+(Math.random()-.5)*8,(Math.random()-.5)*6,4+Math.random()*8,(Math.random()-.5)*6,1.6,.5,[16767072,8257402,16775120][t%3],3,.5);this.addShake(2);break;case t.Evolve:for(let t=0;t<70;t++){let n=Math.random()*R;r.emit(e.x,e.y+1,e.z,Math.cos(n)*(3+Math.random()*7),2+Math.random()*8,Math.sin(n)*(3+Math.random()*7),1.1,.46,[16767072,16739029,10479871][t%3],5,1.2)}this.boom(e.x,e.y+1,e.z,7,16773296,.5),this.addShake(.8);break;case t.EnemyShoot:r.burst(e.x,e.y,e.z,6,3,.3,.3,12611839);break;case t.Hazard:{this.boom(e.x,e.y+.4,e.z,e.a,16738858,.3),r.burst(e.x,e.y+.4,e.z,Math.round(8+e.a*3),e.a*2.4,.5,.42,16747066,7,4),this.dust.burst(e.x,e.y+.3,e.z,Math.round(3+e.a),e.a,.7,1.6,4864560,-.4,1);let t=n.player,i=Math.hypot(t.x-e.x,t.z-e.z);this.addShake(Math.max(0,.9-i/30)*(e.a>6?1.6:.7));break}case t.Revive:for(let t=0;t<80;t++)r.emit(e.x+(Math.random()-.5)*2,e.y+Math.random()*6,e.z+(Math.random()-.5)*2,0,4+Math.random()*6,0,1.2,.5,12577023,0,.3);this.boom(e.x,e.y+1,e.z,10,12577023,.5),this.addShake(1.2);break;case t.BossPhase:this.addShake(2),r.burst(e.x,e.y+5,e.z,60,14,1,.6,e.a===3?16730666:8040512,3,3),this.boom(e.x,e.y+4,e.z,14,e.a===3?16730666:10145888,.6);break;case t.ChargeWarn:this.warn(e.x,e.y,e.z,e.a,e.b,e.c);break;case t.Quake:this.addShake(1.4*e.a),this.dust.burst(e.x,e.y+.3,e.z,18,9,.9,2.2,4864560,-.3,1);break;case t.Fuse:r.burst(e.x,e.y+.9,e.z,5,2,.3,.3,16777215);break;case t.Zone:e.b===_t.Tar?r.burst(e.x,e.y+.3,e.z,16,e.a*2,.5,.4,16747066,5,3):e.b===_t.Vortex?r.burst(e.x,e.y+.4,e.z,14,e.a*1.5,.5,.36,9067775,2,2):e.b===_t.Trap&&this.dust.burst(e.x,e.y+.1,e.z,3,1.2,.3,.6,6971992,-.3,.3);break;case t.Beam:this.bolt(e.a,e.b,e.c,e.x,e.y,e.z,e.d),r.burst(e.x,e.y,e.z,2,2,.25,.2,e.d);break;case t.Secret:r.burst(e.x,e.y+.6,e.z,40,6,.9,.4,16769162,2,3),this.boom(e.x,e.y+.8,e.z,4,16765024,.5);break;case t.Haste:for(let t=0;t<48;t++){let n=t/48*R;r.emit(e.x+Math.cos(n)*.7,e.y+.3+Math.random()*1.4,e.z+Math.sin(n)*.7,Math.cos(n)*3,3+Math.random()*4,Math.sin(n)*3,.8,.34,t%3?Ph:16773792,-2,.6)}this.boom(e.x,e.y+.8,e.z,6,Ph,.45);break;case t.Magnet:for(let t=0;t<60;t++){let n=t/60*R*3;r.emit(e.x+Math.cos(n)*(1+t*.1),e.y+.5+t*.04,e.z+Math.sin(n)*(1+t*.1),-Math.sin(n)*5,1,Math.cos(n)*5,.9,.36,t%2?jh:15660024,0,1)}this.boom(e.x,e.y+.8,e.z,9,jh,.5);break;case t.Pickup:r.burst(e.x,e.y+1,e.z,8,3,.5,.3,16769184,0,2)}}addShake(e){e>this.shake&&(this.shake=e)}boom(e,t,n,r,i,a){let o=this.booms[0];for(let e of this.booms){if(!e.mesh.visible){o=e;break}e.t>o.t&&(o=e)}o.mesh.visible=!0,o.mesh.position.set(e,Math.max(t-.6,this.map.heightAt(e,n)+.25),n),o.t=0,o.span=a,o.r=r,o.mesh.material.color.set(i)}sweep(e,t,n,r,i,a,o){let s=this.sweeps[0];for(let e of this.sweeps){if(!e.mesh.visible){s=e;break}e.t>s.t&&(s=e)}let c=Math.round(i*100),l=this.sweepGeos.get(c);l||(l=i>6?_h(.3,1,0,R,40,!1):_h(.3,1,-i/2,i,18,!1),this.sweepGeos.set(c,l)),s.mesh.geometry=l,s.mesh.visible=!0,s.mesh.position.set(e,t,n),s.mesh.rotation.y=r-Math.PI/2,s.t=0,s.r=a,s.mesh.material.color.set(o).multiplyScalar(Math.min(1,(5.5/a)**1.5))}bolt(e,t,n,r,i,a,o){let s=this.bolts[0];for(let e of this.bolts){if(!e.mesh.visible){s=e;break}e.t>s.t&&(s=e)}let c=s.mesh.geometry.getAttribute(`position`),l=c.array,u=Math.hypot(r-e,i-t,a-n),d=Math.min(1.6,u*.09),f=.16,p=e,m=t,h=n,g=0;for(let o=1;o<=Rh;o++){let s=o/Rh,c=o===Rh,u=e+(r-e)*s+(c?0:(Math.random()-.5)*d),_=t+(i-t)*s+(c?0:(Math.random()-.5)*d*.4),v=n+(a-n)*s+(c?0:(Math.random()-.5)*d);for(let e=0;e<2;e++){let t=e===0?f:0,n=e===0?0:f;l[g++]=p-t,l[g++]=m,l[g++]=h-n,l[g++]=p+t,l[g++]=m,l[g++]=h+n,l[g++]=u+t,l[g++]=_,l[g++]=v+n,l[g++]=p-t,l[g++]=m,l[g++]=h-n,l[g++]=u+t,l[g++]=_,l[g++]=v+n,l[g++]=u-t,l[g++]=_,l[g++]=v-n}p=u,m=_,h=v}c.needsUpdate=!0,s.mesh.visible=!0,s.t=0,s.mesh.material.color.set(o)}warn(e,t,n,r,i,a){let o=this.warns[0];for(let e of this.warns){if(!e.mesh.visible){o=e;break}e.t>o.t&&(o=e)}o.mesh.visible=!0,o.mesh.position.set(e,t+.25,n),o.mesh.rotation.y=Math.atan2(r,i),o.mesh.scale.set(1.6,1,a),o.t=0}update(e,t,n,r){this.time+=n;let i=this.time,a=this.map,o=e.player,s=o.px+(o.x-o.px)*t,c=o.py+(o.y-o.py)*t,l=o.pz+(o.z-o.pz)*t,u=this.sparks;this.emitAcc+=n;let d=this.emitAcc>=1/45;d&&(this.emitAcc=0);let f=e.portal;this.portalView.visible=f!==null&&!f.used,f&&!f.used&&(this.portalView.position.set(f.x,f.y,f.z),this.portalRing.rotation.y=i*.8,this.portalRing.scale.setScalar(1+Math.sin(i*3)*.05+f.progress*.25),d&&u.emit(f.x+(Math.random()-.5)*3,f.y+Math.random()*1.5,f.z+(Math.random()-.5)*3,0,2+Math.random()*3,0,1.2,.3,Mh,0,.4));{let t=e.gems,n=this.gems.instanceMatrix.array,r=0;for(let e=0;e<t.n;e++){if(!t.alive[e])continue;let a=t.val[e],o=a>=20?2:+(a>=5),s=o===2?1.9:o===1?1.35:1,c=t.age[e],l=t.mag[e]?0:Math.max(0,1-c*2.5),u=t.y[e]+(t.mag[e]?0:.42+Math.sin(i*3+e)*.1+Math.sin(l*Math.PI)*.9);Im(n,r,t.x[e],u,t.z[e],i*2+e,s,s*1.3,s),mh(this.gems,r,o===2?16773280:o===1?16742960:16756784);let d=(1.5+o*.9)*(.9+Math.sin(i*4+e)*.1);Im(this.gemGlow.instanceMatrix.array,r,t.x[e],u-.3,t.z[e],0,d,1,d),r++}hh(this.gems,r),hh(this.gemGlow,r)}{let t=e.pickups,n=0,r=0,a=0,o=0,f=0,p=0,m=0;for(let e=0;e<t.n;e++){if(!t.alive[e])continue;let s=t.kind[e],c=t.x[e],l=t.z[e],h=t.y[e]+(t.mag[e]?0:.35+Math.sin(i*3+e*2)*.1);if(s===z.Coin)Im(this.coins.instanceMatrix.array,n++,c,h+.1,l,i*4+e,1,1,1,1.4);else if(s===z.Bread&&r<64)Im(this.bread.instanceMatrix.array,r++,c,h,l,i+e,1.3,1.3,1.3);else if(s===z.Honey&&a<64)Im(this.honey.instanceMatrix.array,a++,c,h,l,i+e,1.3,1.3,1.3);else if(s===z.Magnet&&o<Ih){if(!t.mag[e]){let n=t.y[e];Im(this.magnetBeams.instanceMatrix.array,f++,c,n,l,0,1,1,1),d&&Math.random()<.2&&u.emit(c+(Math.random()-.5)*.9,n+.3,l+(Math.random()-.5)*.9,0,2+Math.random()*2.5,0,1.1,.26,jh,0,.3)}Im(this.magnets.instanceMatrix.array,o++,c,h+.25,l,i*2.2,1.7,1.7,1.7,.3)}else if(s===z.Haste&&p<Lh){if(!t.mag[e]){let n=t.y[e];Im(this.hasteBeams.instanceMatrix.array,m++,c,n,l,0,1,1,1),d&&Math.random()<.2&&u.emit(c+(Math.random()-.5)*.9,n+.3,l+(Math.random()-.5)*.9,0,2+Math.random()*2.5,0,1.1,.26,Ph,0,.3)}Im(this.hastes.instanceMatrix.array,p++,c,h+.15,l,i*2.6,2,2,2)}}hh(this.coins,n),hh(this.bread,r),hh(this.honey,a),hh(this.magnets,o),hh(this.magnetBeams,f),hh(this.hastes,p),hh(this.hasteBeams,m);let h=.27+Math.sin(i*2.6)*.08;if(this.magnetBeams.material.opacity=h,this.hasteBeams.material.opacity=h,e.hasteT>0&&d&&Math.random()<.6){let e=Math.random()*R;u.emit(s+Math.cos(e)*.6,c+.2+Math.random()*1.2,l+Math.sin(e)*.6,Math.cos(e)*.6,2+Math.random()*2,Math.sin(e)*.6,.6,.22,Math.random()<.7?Ph:16773792,0,.4)}this.giftBeamMat.opacity=h}this.syncChests(e,n,i,d,r);{let t=a.heightAt(s,l);this.heroRing.visible=!e.dead,this.heroRing.position.set(s,t+.12,l),this.heroRing.scale.setScalar(.95+Math.sin(i*3)*.05),this.heroRing.material.opacity=(o.invuln>0?.75:.42)*Math.max(.3,1-(c-t)/5);let r=Math.hypot(o.vx,o.vz);d&&o.inPuddle&&r>1&&u.emit(s+(Math.random()-.5)*.6,t+.3,l+(Math.random()-.5)*.6,(Math.random()-.5)*2,2.5+Math.random()*2,(Math.random()-.5)*2,.45,.2,11061480,12,0),d&&o.onGround&&r>6&&Math.random()<.35&&!o.inPuddle&&this.dust.emit(s,t+.15,l,(Math.random()-.5)*.8,.7,(Math.random()-.5)*.8,.45,.7,9075302,-.3,1);for(let e of this.ghosts)e.t<=0||(e.t-=n,e.mesh.visible=e.t>0,e.mesh.material.opacity=Math.max(0,e.t/.28)*.35)}if(this.mist.visible){let e=this.mist.instanceMatrix.array,t=this.mistSeeds,n=this.mist.instanceMatrix.count;for(let r=0;r<n;r++){let n=t[r*4]*110+i*(.35+t[r*4+2]*.5),o=t[r*4+1]*110+i*.2,c=((n-s+55)%110+110)%110-55,u=((o-l+55)%110+110)%110-55,d=Math.hypot(c,u),f=Math.min(1,Math.max(0,(d-14)/14))*Math.min(1,Math.max(0,(55-d)/12)),p=(16+t[r*4+3]*16)*f,m=s+c,h=l+u;Im(e,r,m,a.heightAt(m,h)+1.2+t[r*4+3]*1.5,h,this.camYaw,p,p*.3,1)}this.mist.count=n,this.mist.instanceMatrix.needsUpdate=!0}{let n=0,r=0,o=!1,f=!1;for(let p of e.weapons){if(e.dead)break;let m=p.def.kind;if(m===`orbit`&&p.active>0){let e=p.stats.cooldown<=0?1:Math.min(1,p.active*4,(p.span-p.active)*5+.2),t=(p.def.evolved?1.35:1.1)*(.4+.6*e);for(let r=0;r<p.fxCount&&n<40;r++){let a=p.angle+r*R/p.fxCount,o=s+Math.sin(a)*p.fxArea,f=l+Math.cos(a)*p.fxArea,m=c+1+Math.sin(i*5+r)*.06;Im(this.blades.instanceMatrix.array,n,o,m,f,a+Math.PI/2+i*.001,t,t,t),Im(this.trails.instanceMatrix.array,n,s,c+1,l,a-Math.PI/2,p.fxArea,1,p.fxArea),mh(this.blades,n,16777215),mh(this.trails,n,p.def.color,e),n++,d&&u.emit(o,m,f,0,.6,0,.3,.2,p.def.color,0,0)}}else if(m===`aura`){if(o=!0,this.aura.position.set(s,a.heightAt(s,l)+.12,l),this.aura.rotation.y=i*.5,this.aura.scale.setScalar(p.fxArea),this.auraMat.color.set(p.def.color),this.auraMat.opacity=.085+Math.sin(i*4)*.02,d){let e=Math.random()*R,t=p.fxArea*(.5+Math.random()*.5);u.emit(s+Math.cos(e)*t,c+.2,l+Math.sin(e)*t,-Math.sin(e)*2,1+Math.random(),Math.cos(e)*2,.8,.24,p.def.color,0,.5)}}else if(m===`cone`&&p.active>0){f=!0;let e=Math.round(p.stats.arc*100);this.coneArc!==e&&(this.coneArc=e,this.cone.geometry.dispose(),this.cone.geometry=p.stats.arc>6?_h(.1,1,0,R,44,!1):_h(.08,1,-p.stats.arc/2,p.stats.arc,14,!1)),this.cone.position.set(s,c+.9,l),this.cone.rotation.y=p.angle-Math.PI/2,this.cone.scale.set(p.fxArea,1,p.fxArea),this.cone.material.opacity=.3+Math.sin(i*20)*.06;for(let e=0;e<3;e++){let t=p.angle+(Math.random()-.5)*p.stats.arc,n=10+Math.random()*8;u.emit(s+Math.sin(t)*.8,c+1+Math.random()*.4,l+Math.cos(t)*.8,Math.sin(t)*n,(Math.random()-.3)*1.5,Math.cos(t)*n,p.fxArea/n,.34,e?15137535:10479871,0,.4)}}else if(m===`guard`){if(d&&p.timer<=0){let e=i*3;for(let t=0;t<2;t++)u.emit(s+Math.cos(e+t*Math.PI)*1.1,c+1,l+Math.sin(e+t*Math.PI)*1.1,0,.4,0,.35,.22,p.def.color,0,0)}}else if(m===`summon`)for(let e of p.ravens){if(r>=24)break;let n=e.px+(e.x-e.px)*t,i=e.py+(e.y-e.py)*t,a=e.pz+(e.z-e.pz)*t;Im(this.ravens.instanceMatrix.array,r,n,i,a,e.yaw,.85,.85,.85,e.state===1?.5:.1);let o=this.ravenFx.array;o[r*4]=0,o[r*4+1]=p.def.evolved?.6:0,o[r*4+2]=r*2.3,o[r*4+3]=0,r++}}hh(this.blades,n),hh(this.trails,n),this.aura.visible=o,this.cone.visible=f,this.ravens.count=r,r>0&&(this.ravens.instanceMatrix.needsUpdate=!0,this.ravenFx.needsUpdate=!0),this.ravenU.uTime.value=i}{let n=e.projectiles,r=0,a=0,o=0,s=0,c=0,l=0;for(let f=0;f<n.n;f++){if(!n.alive[f])continue;let p=e.weapons[n.slot[f]];if(!p)continue;let m=n.px[f]+(n.x[f]-n.px[f])*t,h=n.py[f]+(n.y[f]-n.py[f])*t,g=n.pz[f]+(n.z[f]-n.pz[f])*t,_=n.kind[f];if(_===ht.Lob){s<64&&Im(this.pots.instanceMatrix.array,s++,m,h,g,i*9,1.2,1.2,1.2,i*7),d&&u.emit(m,h,g,0,.5,0,.3,.26,16747066);continue}if(_===ht.Boomerang){c<64&&Im(this.sticks.instanceMatrix.array,c++,m,h,g,i*22+f,1.15,1.15,1.15),d&&u.emit(m,h,g,0,0,0,.2,.18,p.def.color);continue}if(_===ht.Twister){if(l<32){let e=n.radius[f],t=Math.min(1,n.life[f]*2);Im(this.twisters.instanceMatrix.array,l,m,h-1.1,g,i*9+f,e,(.8+e*.25)*t,e),mh(this.twisters,l,p.def.color,.7),l++}if(d){let e=Math.random()*R,t=n.radius[f]*(.3+Math.random()*.7);u.emit(m+Math.cos(e)*t,h-1+Math.random()*.4,g+Math.sin(e)*t,-Math.sin(e)*6,3+Math.random()*2,Math.cos(e)*6,.5,.22,p.def.color,0,.5)}continue}if(_===ht.Homing){Im(this.stones.instanceMatrix.array,a,m,h+Math.sin(i*18+f*1.7)*.12,g,i*12+f,.6,.6,.6),mh(this.stones,a,p.def.color,1.6),a++;continue}let v=Math.atan2(n.vx[f],n.vz[f]);if(p.def.icon===`spear`||p.def.icon===`bow`){let e=p.def.icon===`bow`?.75:1.2;Im(this.spears.instanceMatrix.array,o++,m,h,g,v,e,e,e),d&&u.emit(m,h,g,0,0,0,.25,.22,p.def.color)}else if(_===ht.Bounce){let e=p.def.evolved?1.5:1.1;Im(this.stones.instanceMatrix.array,a,m,h,g,i*12+f,e,e,e),mh(this.stones,a,p.def.color),a++,d&&p.def.evolved&&u.emit(m,h,g,0,0,0,.3,.26,p.def.color)}else{let e=n.radius[f]/.55*(1+Math.sin(i*30+f)*.1);Im(this.fire.instanceMatrix.array,r,m,h,g,i*8+f,e,e,e),mh(this.fire,r,p.def.color,1.2),r++;let t=p.def.icon===`flame`;u.emit(m+(Math.random()-.5)*.3,h+(Math.random()-.5)*.3,g+(Math.random()-.5)*.3,0,1.2,0,.35,t?.5:.3,t?Math.random()<.5?16734746:16760896:p.def.color,-2,1)}}hh(this.fire,r),hh(this.stones,a),hh(this.spears,o),hh(this.pots,s),hh(this.sticks,c),hh(this.twisters,l)}{let n=e.shots,r=0;for(let e=0;e<n.n;e++){if(!n.alive[e])continue;let a=n.px[e]+(n.x[e]-n.px[e])*t,o=n.py[e]+(n.y[e]-n.py[e])*t,s=n.pz[e]+(n.z[e]-n.pz[e])*t,c=1+Math.sin(i*25+e)*.15;Im(this.shots.instanceMatrix.array,r++,a,o,s,i*6,c,c,c),d&&u.emit(a,o,s,0,.4,0,.3,.34,10109183)}hh(this.shots,r)}{let t=e.zones,n=0,r=0;for(let o=0;o<t.n;o++){if(!t.alive[o])continue;let s=e.weapons[t.slot[o]],c=t.r[o],l=t.life[o],f=Math.min(1,l*2,(t.span[o]-l)*6+.1),p=t.kind[o];if(p===_t.Trap){let e=t.span[o]-l>=.5;gh(this.trapRings.instanceMatrix.array,r,a,t.x[o],t.z[o],.1,(c*.22+.2)*(.5+.5*f),o*1.3),mh(this.trapRings,r,s?.def.color??12107976,e?.42+Math.sin(i*5+o)*.06:.2),r++}else if(p===_t.Vortex){if(gh(this.zones.instanceMatrix.array,n,a,t.x[o],t.z[o],.08,c*(.6+.4*f),i*2+o),mh(this.zones,n,1444400,1),n++,d)for(let e=0;e<2;e++){let n=Math.random()*R,r=c*(.8+Math.random()*.8),i=t.x[o]+Math.cos(n)*r,l=t.z[o]+Math.sin(n)*r;u.emit(i,a.heightAt(i,l)+.3+Math.random()*.8,l,-Math.cos(n)*r*1.6-Math.sin(n)*3,.3,-Math.sin(n)*r*1.6+Math.cos(n)*3,.55,.3,e?s?.def.color??9067775:14733567,0,0)}}else if(gh(this.zones.instanceMatrix.array,n,a,t.x[o],t.z[o],.08,c*(.6+.4*f),o),mh(this.zones,n,p===_t.Fire?3805702:2757640,1),n++,d){let e=Math.random()*R,n=Math.sqrt(Math.random())*c,r=t.x[o]+Math.cos(e)*n,i=t.z[o]+Math.sin(e)*n;u.emit(r,a.heightAt(r,i)+.2,i,0,2+Math.random()*2,0,.5,.5,Math.random()<.5?s?.def.color??16747066:16765024,-1,.5)}}hh(this.zones,n),hh(this.trapRings,r)}{let t=e.secret,n=t!==null&&!t.found;if(this.secretMesh.visible=n,n&&t&&(this.secretMesh.position.set(t.x,t.y+.55+Math.sin(i*2)*.08,t.z),this.secretMesh.rotation.set(1.1,i*.8,.4),d&&Math.random()<.5)){let e=Math.random()*R;u.emit(t.x+Math.cos(e)*.5,t.y+.3+Math.random()*1.2,t.z+Math.sin(e)*.5,0,.9,0,.9,.24,16769162,0,0)}}{let t=e.hazards,n=0,r=0;for(let e=0;e<t.n;e++){if(!t.alive[e])continue;let o=t.r[e],s=Math.min(1,t.t[e]/t.delay[e]),c=t.x[e],l=t.z[e],f=t.air[e],p=f?10157888:16726554,m=s>.75?1.5+Math.sin(i*40)*.5:1;if(gh(this.hazRing.instanceMatrix.array,n,a,c,l,.14,o),gh(this.hazFill.instanceMatrix.array,n,a,c,l,.1,o*Math.max(.05,s)),mh(this.hazRing,n,p,m),mh(this.hazFill,n,p,.9*m),n++,f&&r<32){let n=t.y[e]+(1-s)*(1-s)*16+.4;Im(this.bombs.instanceMatrix.array,r++,c,n,l,i*6,1,1,1),d&&u.emit(c,n+.4,l,0,1,0,.3,.34,12124e3)}}hh(this.hazRing,n),hh(this.hazFill,n),hh(this.bombs,r)}if(d){let t=e.enemies,n=t.n;if(n>0)for(let e=0;e<14;e++){let e=Math.floor(Math.random()*n);if(!t.alive[e])continue;let r=t.x[e],i=t.y[e]+t.oy[e],a=t.z[e];t.burnT[e]>0?u.emit(r+(Math.random()-.5)*.5,i+.4+Math.random()*.8,a+(Math.random()-.5)*.5,0,2.2,0,.4,.34,Math.random()<.5?16734746:16760896,-1,.5):t.slowT[e]>0&&t.slowK[e]>.3?u.emit(r+(Math.random()-.5)*.6,i+.3+Math.random(),a+(Math.random()-.5)*.6,0,-.5,0,.5,.2,15137535,0,0):t.elite[e]&&u.emit(r+(Math.random()-.5)*.8,i+Math.random()*1.6,a+(Math.random()-.5)*.8,0,1.4,0,.6,.24,16764992,0,0)}for(let e of a.bonfires)Math.abs(e.x-s)+Math.abs(e.z-l)>60||Math.random()>.5||u.emit(e.x+(Math.random()-.5)*.7,a.heightAt(e.x,e.z)+1+Math.random(),e.z+(Math.random()-.5)*.7,(Math.random()-.5)*.8,2+Math.random()*2.5,(Math.random()-.5)*.8,1.4,.2,Math.random()<.6?16747050:16765024,-.3,.3)}for(let e of this.sweeps){if(!e.mesh.visible)continue;e.t+=n;let t=e.t/e.span;if(t>=1){e.mesh.visible=!1;continue}let r=.55+.45*Math.min(1,t*3);e.mesh.scale.set(e.r*r,1,e.r*r),e.mesh.material.opacity=1-t*t}for(let e of this.bolts){if(!e.mesh.visible)continue;e.t+=n;let t=e.t/e.span;t>=1?e.mesh.visible=!1:e.mesh.material.opacity=(1-t)*(Math.floor(e.t*60)%2?.6:1)}for(let e of this.booms){if(!e.mesh.visible)continue;e.t+=n;let t=e.t/e.span;if(t>=1){e.mesh.visible=!1;continue}let r=e.r*(.3+.7*(1-(1-t)*(1-t)));e.mesh.scale.set(r,1,r),e.mesh.material.opacity=.8*(1-t)}for(let e of this.warns)e.mesh.visible&&(e.t+=n,e.t/e.span>=1?e.mesh.visible=!1:e.mesh.material.opacity=.2+.3*Math.abs(Math.sin(e.t*18)));this.flashT>0&&(this.flashT-=n,this.flash.intensity=this.flashT>0?90*(this.flashT/.14):0),u.update(n),this.dust.update(n);let p=this.fireflyMat.uniforms;p.uTime.value=i,p.uCenter.value.set(s,c,l),p.uNight.value=r}syncChests(e,t,n,r,i){let a=e.chests;for(;this.chestViews.length<a.length;){let e=a[this.chestViews.length],t=new cs,n=e.gift?this.giftParts:e.rich?this.richParts:this.chestParts,r=e.gift?this.giftMat:e.rich?this.richMat:this.chestMat,i=new Y(n.base,r),o=new Y(n.lid,r);o.position.set(0,.56,-.375),i.castShadow=!0,o.castShadow=!0;let s=new Y(this.chestPoolGeo,ih(new Hc({map:this.glowTex,color:16753208,blending:2,depthWrite:!1,transparent:!0,opacity:.3,toneMapped:!1})));s.scale.setScalar(e.gift?6:e.rich?11:7.5),s.position.y=.12,s.renderOrder=2;let c=new Fc(new xc({map:this.glowTex,color:16767072,blending:2,depthWrite:!1,transparent:!0,opacity:.5}));c.scale.setScalar(e.gift?3.8:e.rich?5:3.4),c.position.y=.6,t.add(i,o,c,s);let l=null;e.gift&&(l=new Y(this.beamGeo,this.giftBeamMat),l.renderOrder=3,t.add(l)),t.position.set(e.x,e.y,e.z),t.rotation.y=e.rot,t.userData.size=e.rich?1.3:1,this.group.add(t),this.chestViews.push({group:t,lid:o,glow:c,pool:s,beam:l,openT:0})}let o=e.player,s=-1,c=Oh;for(let e=0;e<a.length;e++){let l=a[e],u=this.chestViews[e],d=u.glow.material,f=u.pool.material,p=Math.hypot(l.x-o.x,l.z-o.z);!l.opened&&p<c&&(s=e,c=p),l.opened?(f.opacity=Math.max(0,f.opacity-t*.5),u.openT+=t,u.lid.rotation.x=-Math.min(1.9,u.openT*9),d.opacity=Math.max(0,.9-u.openT*.6),u.beam&&(u.beam.visible=!1),u.openT>6?u.group.visible=!1:u.openT>4&&u.group.scale.setScalar(Math.max(.01,1-(u.openT-4)/2))):(u.group.visible=!0,u.group.scale.setScalar(l.free?1.15+Math.sin(n*6)*.05:u.group.userData.size),d.opacity=l.gift?.32+Math.sin(n*5)*.1:l.free?.6+Math.sin(n*5)*.2:l.rich?.5+Math.sin(n*3+e)*.14:.26+Math.sin(n*2+e)*.08,d.color.set(l.gift?Nh:l.rich?Fh:l.free?16769658:16757575),f.color.set(l.gift?Nh:l.rich?Fh:16753208),f.opacity=(l.gift?.14:(l.rich?.2:.14)+i*.12)*(.9+Math.sin(n*2.3+e*1.7)*.1),!l.gift&&r&&p<45&&Math.random()<(l.rich?.35:.1)&&this.sparks.emit(l.x+(Math.random()-.5)*.8,l.y+.8,l.z+(Math.random()-.5)*.6,(Math.random()-.5)*.3,.7+Math.random()*(l.rich?2:.9),(Math.random()-.5)*.3,1.3,l.rich?.2:.13,l.rich?Fh:16760906,0,.4),l.gift&&r&&Math.random()<.2&&this.sparks.emit(l.x+(Math.random()-.5)*1.2,l.y+.4,l.z+(Math.random()-.5)*1.2,0,2+Math.random()*2.5,0,1.1,.26,Nh,0,.3))}let l=this.chestLight;this.chestLit!==s&&l.intensity<.4&&(this.chestLit=s);let u=this.chestLit>=0?a[this.chestLit]:void 0,d=0;if(u&&this.chestLit===s){let e=1-Math.min(1,Math.max(0,(c-Oh*.6)/(Oh*.4)));d=(u.gift?10:15+i*15)*e*(.92+Math.sin(n*7+1.3)*.05+Math.sin(n*17)*.03),l.color.set(u.gift?Nh:16753208),l.position.set(u.x,u.y+1.25,u.z)}l.intensity+=(d-l.intensity)*Math.min(1,t*6)}setMap(e){this.map=e}reset(){for(let e of this.chestViews)this.group.remove(e.group),e.glow.material.dispose(),e.pool.material.dispose();this.chestViews.length=0,this.chestLit=-1,this.chestLight.intensity=0;for(let e of[this.sweeps,this.bolts,this.booms,this.warns])for(let t of e)t.mesh.visible=!1;for(let e of this.ghosts)e.t=0,e.mesh.visible=!1;this.shake=0}},Bh=11740702,Vh=5913124,Hh=15130572,Uh=7222304,Wh=8672046,Gh=3877408,Kh=5521454,qh=10129536,Jh=15769648,Yh=14263361,Xh=10497058,Zh=11891790,Qh=13802092,$h=4861988,eg=3350810,tg=3103284,ng=5212730,rg=7776330,ig=15241376,ag=16756800,og=class{group=new cs;body=new cs;torso=new cs;armL=new cs;armR=new cs;legL=new cs;legR=new cs;mat=new Xl({vertexColors:!0});shadow;phase=0;jumpT=1;wasGround=!0;lean=0;amp=0;constructor(e){this.mat.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
totalEmissiveRadiance += diffuseColor.rgb * 0.06;
float mbRim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.5);
totalEmissiveRadiance += vec3(0.75, 0.62, 0.45) * mbRim * 0.22;`)},this.mat.customProgramCacheKey=()=>`mb-hero`,this.group.add(this.body),this.body.add(this.torso,this.legL,this.legR),this.torso.add(this.armL,this.armR),this.shadow=new Y(new Il(1.7,1.7,2,2).rotateX(-Math.PI/2),ih(new Hc({map:e,color:0,transparent:!0,opacity:.5,depthWrite:!1}))),this.shadow.renderOrder=2,this.group.add(this.shadow)}part(e,t){let n=new Y(t.build(),this.mat);n.castShadow=!0,e.add(n)}clear(e){for(let t=e.children.length-1;t>=0;t--){let n=e.children[t];n.isMesh&&(n.geometry.dispose(),e.remove(n))}}setLook(e){for(let e of[this.torso,this.armL,this.armR,this.legL,this.legR])this.clear(e);let t=e.style===`bogumil`?1.18:1;this.body.scale.setScalar(e.build),this.torso.position.set(0,.85,0),this.legL.position.set(.14*t,.86,0),this.legR.position.set(-.14*t,.86,0),this.armL.position.set(.35*t,.6,0),this.armR.position.set(-.35*t,.6,0);for(let[n,r]of[[this.legL,1],[this.legR,-1]]){let i=new jm(31+r);e.style===`dobroslawa`?i.box(.15,.5,.16,e.skin,{y:-.45}):(i.box(.27*t,.34,.29,e.pants,{y:-.17}),i.box(.3*t,.22,.32,e.pants,{y:-.4})),i.box(.17,.3,.18,15130572,{y:-.62}),i.box(.18,.035,.19,Vh,{y:-.55,rz:.35*r}),i.box(.18,.035,.19,Vh,{y:-.68,rz:-.35*r}),i.box(.19,.1,.31,4861726,{y:-.81,z:.05}),e.style===`bogumil`&&(i.box(.2,.05,.2,Vh,{y:-.745}),i.box(.21,.08,.12,Vh,{y:-.8,z:.16}),i.box(.22,.035,.35,2759186,{y:-.845,z:.05})),this.part(n,i)}let n=e.outfit===`perun`,r=new jm(41);if(r.box(.54*t,.62,.3,e.shirt,{y:.36}),r.box(.58*t,.2,.34,e.style===`jagna`?e.pants:e.shirt,{y:-.02}),r.box(.585*t,.045,.345,e.trim,{y:-.1}),r.box(.56*t,.09,.33,n?$h:Bh,{y:.1}),n?(r.box(.07,.1,.03,eg,{x:.15,y:.1,z:.17}),r.box(.05,.3,.035,eg,{x:.15,y:-.06,z:.185}),r.box(.095,.2,.05,$h,{x:.15,y:-.24,z:.19}),r.box(.068,.068,.05,$h,{x:.15,y:-.34,z:.19,rz:Math.PI/4}),r.box(.03,.2,.025,Zh,{x:.15,y:-.01,z:.215,jitter:.03}),r.box(.1,.075,.025,Qh,{x:.2,y:.045,z:.215,jitter:.03}),r.box(.05,.11,.024,Qh,{x:.235,y:.045,z:.215,jitter:.03})):e.style!==`bogumil`&&(r.box(.06,.34,.05,Bh,{x:.15,y:-.1,z:.175,rz:.08}),r.box(.09,.07,.06,Yh,{x:.15,y:-.28,z:.175})),r.box(.24,.05,.31,e.trim,{y:.65}),n){r.box(.08,.1,.31,e.trim,{y:.6}),r.box(.06,.17,.02,Qh,{x:.035,y:.5,z:.155,rz:-.45,jitter:.03}),r.box(.1,.04,.02,Qh,{x:.035,y:.428,z:.156,jitter:.03}),r.box(.04,.18,.02,Qh,{x:.03,y:.345,z:.155,rz:-.45,jitter:.03});for(let e=0;e<3;e++)r.box(.1,.02,.02,Zh,{x:-.165,y:.5,z:.155,rz:e*Math.PI/3,jitter:.03})}else r.box(.09,.3,.31,e.trim,{y:.5});if(e.style!==`bogumil`&&!n&&(r.box(.04,.04,.315,Hh,{y:.52,rz:Math.PI/4}),r.box(.04,.04,.315,Hh,{y:.42,rz:Math.PI/4})),r.box(.14,.1,.14,e.skin,{y:.71}),r.box(.31,.32,.3,e.skin,{y:.9}),r.box(.05,.05,.02,2759700,{x:.08,y:.93,z:.155}),r.box(.05,.05,.02,2759700,{x:-.08,y:.93,z:.155}),r.box(.06,.05,.05,e.skin,{y:.87,z:.16}),e.style===`wojmir`){r.box(.35,.14,.34,e.hair,{y:1.08}),r.box(.35,.2,.1,e.hair,{y:.98,z:-.14});for(let t=0;t<7;t++){let n=t/7*R;r.cone(.09,.26,4,e.hair,{x:Math.cos(n)*.11,y:1.2,z:Math.sin(n)*.11+.02,rz:-Math.cos(n)*.6,rx:Math.sin(n)*.6+.2})}r.cone(.1,.24,4,e.hair,{y:1.16,z:.17,rx:1})}else if(e.style===`dobroslawa`){r.box(.35,.14,.34,e.hair,{y:1.07}),r.box(.35,.34,.1,e.hair,{y:.93,z:-.15}),r.box(.1,.5,.1,e.hair,{y:.55,z:-.2}),r.box(.12,.06,.12,Bh,{y:.32,z:-.2});for(let e=0;e<10;e++){let t=e/10*R,n=e%3==0;r.ico(n?.065:.075,0,n?e%2?15919576:15317050:5212730,{x:Math.cos(t)*.2,y:1.12,z:Math.sin(t)*.2})}r.cyl(.3,.46,.62,7,e.pants,{y:-.36}),r.box(.3,.5,.04,15130572,{y:-.32,z:.4,rx:-.26}),r.box(.3,.05,.045,Bh,{y:-.5,z:.445,rx:-.26}),r.box(.94,.045,.045,Bh,{y:-.66,z:0})}else if(e.style===`bogumil`){r.box(.35,.09,.34,e.hair,{y:1.09}),r.box(.32,.2,.14,e.hair,{y:.78,z:.13}),r.box(.33,.1,.1,e.hair,{y:.84,z:.06}),r.box(.12,.05,.04,e.hair,{x:.085,y:.985,z:.16,rz:.16}),r.box(.12,.05,.04,e.hair,{x:-.085,y:.985,z:.16,rz:-.16}),r.box(.68,.1,.39,Gh,{y:.68}),r.box(.33,.22,.06,e.hair,{y:.97,z:-.14});for(let e=0;e<12;e++){let t=e/12*R;Math.sin(t)>.55||r.cone(.09,.22,4,e%2?Gh:Kh,{x:Math.cos(t)*.33,y:.68,z:Math.sin(t)*.19,rz:-Math.cos(t)*2,rx:Math.sin(t)*2})}r.box(.03,.15,.02,Xh,{x:.05,y:.6,z:.155,rz:-.38}),r.box(.03,.15,.02,Xh,{x:-.05,y:.6,z:.155,rz:.38}),r.box(.075,.075,.035,Jh,{y:.555,z:.17,rz:Math.PI/4,jitter:0}),r.box(.69,.035,.35,Xh,{y:-.04}),r.box(.46,.76,.04,Uh,{y:.12,z:.185}),r.box(.02,.76,.045,Wh,{x:.225,y:.12,z:.186}),r.box(.02,.76,.045,Wh,{x:-.225,y:.12,z:.186}),r.box(.46,.02,.045,Wh,{y:-.25,z:.186}),r.box(.46,.025,.045,Vh,{y:.49,z:.187});for(let e of[-1,1])r.box(.09,.3,.04,Vh,{x:e*.18,y:.6,z:.17,rz:e*.1}),r.box(.12,.085,.03,qh,{x:e*.175,y:.53,z:.2}),r.box(.06,.035,.035,2759700,{x:e*.175,y:.53,z:.2}),r.box(.09,.56,.03,Vh,{x:e*.17,y:.38,z:-.16});r.box(.44,.07,.03,Vh,{y:.1,z:-.175}),r.box(.07,.3,.05,Bh,{x:.13,y:-.06,z:.23}),r.box(.075,.03,.055,8264212,{x:.13,y:.02,z:.23}),r.box(.075,.03,.055,8264212,{x:.13,y:-.07,z:.23}),r.box(.075,.03,.055,8264212,{x:.13,y:-.16,z:.23}),r.box(.1,.09,.075,Yh,{x:.13,y:-.25,z:.23})}else{r.box(.36,.14,.35,e.hair,{y:1.07}),r.box(.36,.36,.1,e.hair,{y:.92,z:-.15});for(let t of[-1,1])r.box(.05,.3,.22,e.hair,{x:t*.17,y:.93,z:-.03});r.box(.32,.06,.03,e.hair,{y:1.03,z:.155}),r.cone(.07,.12,4,e.hair,{y:1.18,z:-.02});for(let e=0;e<14;e++){let t=e/14*R+.22,n=Math.cos(t),i=Math.sin(t);r.cone(.05,.22,4,e%2?ng:rg,{x:n*.23,y:1.13,z:i*.23,rz:-n*1.05,rx:i*1.05}),e%3==0&&r.ico(.05,0,e%2?ig:15919576,{x:n*.21,y:1.09,z:i*.21})}r.box(.4,.045,.39,tg,{y:1.09}),r.octa(.055,ag,{x:.12,y:1.13,z:.2,jitter:0}),r.box(.64,.14,.37,tg,{y:.61}),r.box(.4,.07,.38,tg,{y:.52});for(let t of[-1,1])r.box(.09,.42,.305,e.pants,{x:t*.23,y:.3}),r.box(.045,.36,.31,Bh,{x:t*.16,y:.31}),r.box(.035,.035,.02,Bh,{x:t*.085,y:.36,z:.155,rz:Math.PI/4}),r.box(.035,.035,.02,Bh,{x:t*.085,y:.25,z:.155,rz:Math.PI/4});r.cyl(.3,.46,.62,7,e.pants,{y:-.36}),r.cyl(.427,.443,.055,7,Bh,{y:-.53}),r.cyl(.444,.451,.025,7,Bh,{y:-.59}),r.cyl(.453,.468,.055,7,Hh,{y:-.645})}this.part(this.torso,r);for(let[t,n]of[[this.armL,1],[this.armR,-1]]){let r=new jm(51+n);e.style===`bogumil`?(r.box(.24,.22,.25,e.shirt,{y:-.07}),r.box(.245,.04,.255,Xh,{y:-.15}),r.box(.2,.2,.21,e.skin,{y:-.28}),r.box(.17,.3,.18,e.skin,{y:-.45}),r.box(.2,.14,.21,4860956,{y:-.46}),r.box(.03,.04,.04,qh,{x:n*.105,y:-.46}),r.box(.04,.04,.03,qh,{y:-.46,z:.11}),r.box(.19,.12,.2,e.skin,{y:-.6})):(r.box(.18,.38,.2,e.shirt,{y:-.17}),r.box(.19,.045,.21,e.trim,{y:-.36}),e.style===`jagna`&&(r.box(.185,.04,.205,Bh,{y:-.1}),r.box(.05,.05,.02,Bh,{x:n*.092,y:-.21,rz:Math.PI/4,ry:Math.PI/2})),r.box(.13,.22,.14,e.skin,{y:-.48})),this.part(t,r)}}update(e,t,n,r){let i=Ie(e.px,e.x,t),a=Ie(e.py,e.y,t),o=Ie(e.pz,e.z,t);this.group.position.set(i,a,o),this.group.rotation.y=e.yaw;let s=Math.hypot(e.vx,e.vz),c=e.dashT>0;this.amp=Re(this.amp,e.onGround?Fe(s/7,0,1.15):0,14,n),this.phase+=s*n*1.55;let l=this.amp,u=Math.sin(this.phase);this.wasGround&&!e.onGround&&e.vy>0&&(this.jumpT=0),this.wasGround=e.onGround,this.jumpT+=n;let d=u*.95*l,f=-u*.95*l,p=-u*.8*l,m=u*.8*l,h=.08+Math.sin(r*1.7)*.02,g=Math.abs(Math.cos(this.phase))*.07*l+Math.sin(r*2.1)*.008,_=.16*l,v=1;if(!e.onGround){let t=Fe(e.vy/11,-1,1);d=-.75+t*.25,f=.35-t*.2,p=-1.3*Math.max(.3,Math.abs(t)),m=-1.1*Math.max(.3,Math.abs(t)),h=.7,_=.1-t*.12,v=1+Fe(e.vy*.012,-.08,.12)}this.jumpT<.14&&(v*=Ie(.74,1.14,this.jumpT/.14)),e.onGround&&e.landT<.2&&(v*=1-(.12+e.landImpact*.22)*(1-e.landT/.2)),c&&(_=.85,p=1.2,m=1.2,d=.9,f=-.5,v*=.86,g=-.12),this.lean=Re(this.lean,_,c?30:12,n);let y=1/Math.sqrt(v);this.body.position.y=g,this.body.rotation.x=this.lean,this.group.scale.set(y,v,y),this.legL.rotation.x=d,this.legR.rotation.x=f,this.armL.rotation.x=p,this.armR.rotation.x=m,this.armL.rotation.z=h,this.armR.rotation.z=-h,this.torso.rotation.y=u*.12*l;let b=+(e.hurtT<.12);this.mat.emissive.setScalar(b*.9),this.body.visible=!(e.hurtT<.6&&e.hurtT>.12&&Math.floor(r*20)%2==0),this.shadow.position.y=.06,this.shadow.scale.setScalar(1)}setGround(e){let t=this.group.position.y-e;this.shadow.position.y=(-t+.06)/this.group.scale.y;let n=Fe(1-t/6,.35,1);this.shadow.scale.setScalar(n),this.shadow.material.opacity=.5*n}},sg=70,cg=new W,lg=class{canvas;ctx;nums=[];cursor=0;w=0;h=0;dirty=!1;constructor(e){this.canvas=e,this.ctx=e.getContext(`2d`);for(let e=0;e<sg;e++)this.nums.push({x:0,y:0,z:0,text:``,life:0,span:1,flag:0,ox:0});this.resize(),window.addEventListener(`resize`,()=>this.resize())}resize(){this.w=this.canvas.clientWidth||window.innerWidth,this.h=this.canvas.clientHeight||window.innerHeight,this.canvas.width=this.w,this.canvas.height=this.h}number(e,t,n,r,i){let a=this.nums[this.cursor];this.cursor=(this.cursor+1)%sg,a.x=e,a.y=t,a.z=n,a.text=String(r>=10?Math.round(r):Math.max(1,Math.round(r))),a.span=i===1?.85:.6,a.life=a.span,a.flag=i,a.ox=(Math.random()-.5)*26}clear(){for(let e of this.nums)e.life=0}draw(e,t){let n=this.ctx;this.dirty&&=(n.clearRect(0,0,this.w,this.h),!1),n.textAlign=`center`,n.lineJoin=`round`;for(let r=0;r<sg;r++){let i=this.nums[r];if(i.life<=0)continue;i.life-=t;let a=1-i.life/i.span;if(cg.set(i.x,i.y+a*1.1,i.z).project(e),cg.z>1||cg.z<-1)continue;let o=(cg.x*.5+.5)*this.w+i.ox,s=(-cg.y*.5+.5)*this.h,c=a<.15?.6+a/.15*.6:1.2-Math.min(.2,(a-.15)*.6),l=(i.flag===1?26:i.flag===2?14:18)*c;n.globalAlpha=a>.6?1-(a-.6)/.4:1,n.font=`bold ${l.toFixed(0)}px Georgia, serif`,n.lineWidth=4,n.strokeStyle=`rgba(20,10,10,0.85)`,n.fillStyle=i.flag===1?`#ffd23a`:i.flag===2?`#ff8a3a`:`#fff6e0`;let u=i.flag===1?`${i.text}!`:i.text;n.strokeText(u,o,s),n.fillText(u,o,s),this.dirty=!0}n.globalAlpha=1}},ug={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},dg=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},fg=new Hu(-1,1,1,-1,0,1),pg=new class extends uc{constructor(){super(),this.setAttribute(`position`,new J([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new J([0,2,0,0,2,0],2))}},mg=class{constructor(e){this._mesh=new Y(pg,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,fg)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},hg=class extends dg{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Jl?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Gl.clone(e.uniforms),this.material=new Jl({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new mg(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},gg=class extends dg{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},_g=class extends dg{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},vg=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new U);this._width=n.width,this._height=n.height,t=new jo(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:pi}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new hg(ug),this.copyPass.material.blending=0,this.timer=new Yu}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}gg!==void 0&&(r instanceof gg?n=!0:r instanceof _g&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new U);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},yg=class extends dg{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new q}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},bg={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new q(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},xg=class e extends dg{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new U(256,256):new U(e.x,e.y),this.clearColor=new q(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new jo(i,a,{type:pi,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new jo(i,a,{type:pi,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new jo(i,a,{type:pi,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=bg;this.highPassUniforms=Gl.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Jl({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new W(1,1,1),new W(1,1,1),new W(1,1,1),new W(1,1,1),new W(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Gl.clone(ug.uniforms),this.blendMaterial=new Jl({uniforms:this.copyUniforms,vertexShader:ug.vertexShader,fragmentShader:ug.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new q,this._oldClearAlpha=1,this._basic=new Hc,this._fsQuad=new mg(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new U(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new Jl({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new U(.5,.5)},direction:{value:new U(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Jl({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};xg.BlurDirectionX=new U(1,0),xg.BlurDirectionY=new U(0,1);var Sg={uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1.3},uTime:{value:0},uVignette:{value:.36},uGrain:{value:.014},uSaturation:{value:1.06},uContrast:{value:1.04},uNight:{value:0},uAspect:{value:1.6}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }`,fragmentShader:`
    #include <common>
    #include <tonemapping_pars_fragment>
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uNight;
    uniform float uAspect;
    varying vec2 vUv;

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      col = ACESFilmicToneMapping(col);
      // Grade in display space, where equal steps look equal: a tint added in linear light would flood the shadows.
      col = sRGBTransferOETF(vec4(max(col, 0.0), 1.0)).rgb;

      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      // Split toning: shadows lean violet-blue, highlights lean amber.
      vec3 shadowTint = mix(vec3(0.012, -0.004, 0.022), vec3(-0.004, 0.004, 0.026), uNight);
      vec3 lightTint = mix(vec3(0.03, 0.012, -0.02), vec3(0.016, 0.012, -0.006), uNight);
      col += shadowTint * (1.0 - smoothstep(0.0, 0.5, l));
      col += lightTint * smoothstep(0.45, 1.0, l);
      col = mix(vec3(l), col, uSaturation);
      col = (col - 0.5) * uContrast + 0.5;

      vec2 q = (vUv - 0.5) * vec2(min(uAspect, 1.9) / 1.6, 1.0);
      float v = smoothstep(0.32, 0.98, length(q));
      col *= 1.0 - v * uVignette;

      float n = rand(vUv * 913.0 + fract(uTime) * 61.0) - 0.5;
      col += n * uGrain;

      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }`},Cg=class{renderer;composer;bloom;final;target;constructor(e,t,n,r){this.renderer=e;let i=e.getDrawingBufferSize(new U);this.target=new jo(i.x,i.y,{type:pi,samples:r}),this.composer=new vg(e,this.target),this.composer.addPass(new yg(t,n)),this.bloom=new xg(new U(i.x/2,i.y/2),.55,.7,.92),this.composer.addPass(this.bloom),this.final=new hg(Sg),this.final.material.toneMapped=!1,this.composer.addPass(this.final)}setSize(e,t,n){this.composer.setPixelRatio(n),this.composer.setSize(e,t),this.bloom.setSize(Math.max(2,Math.floor(e*n/2)),Math.max(2,Math.floor(t*n/2))),this.final.uniforms.uAspect.value=e/Math.max(1,t)}render(e,t,n,r){let i=this.final.uniforms;i.uTime.value=t,i.uNight.value=n,i.toneMappingExposure.value=r;let a=this.renderer.toneMapping;this.renderer.toneMapping=0,this.composer.render(e),this.renderer.toneMapping=a}dispose(){this.bloom.dispose(),this.final.dispose(),this.composer.dispose(),this.target.dispose()}},wg=new URL(`props-C_cNLurZ.bin`,import.meta.url).href,Tg={fir0:{offset:0,verts:2514},fir1:{offset:40224,verts:2514},fir2:{offset:80448,verts:2514},fir_lod:{offset:120672,verts:510},pine0:{offset:128832,verts:2607},pine1:{offset:170544,verts:2607},pine_lod:{offset:212256,verts:615},oak0:{offset:222096,verts:2718},oak1:{offset:265584,verts:2718},oak_lod:{offset:309072,verts:762},birch0:{offset:321264,verts:1338},birch1:{offset:342672,verts:1338},birch_lod:{offset:364080,verts:615},rock0:{offset:373920,verts:198},rock1:{offset:377088,verts:132},rock2:{offset:379200,verts:198},menhir0:{offset:382368,verts:720},menhir1:{offset:393888,verts:720},bush0:{offset:405408,verts:2916},bush1:{offset:452064,verts:456},ancient_oak:{offset:459360,verts:13458},hut:{offset:674688,verts:3912},idol:{offset:737280,verts:2322}},Eg=new URL(`detail-BsPBQ4kJ.jpg`,import.meta.url).href,Dg=new URL(`dirt-BN7W7fi1.jpg`,import.meta.url).href,Og=new URL(`forest_floor-DAqr7BsX.jpg`,import.meta.url).href,kg=new URL(`grass-QjMV-9Kt.jpg`,import.meta.url).href,Ag=new URL(`moon-CIZgZopw.jpg`,import.meta.url).href,jg=new URL(`moss-AlqAutdH.jpg`,import.meta.url).href,Mg={grass:kg,forest:Og,dirt:Dg,mud:new URL(`mud-NLr8I5q0.jpg`,import.meta.url).href,rock:new URL(`rock-Y5FwVUU5.jpg`,import.meta.url).href,moss:jg,moon:Ag},Ng={detail:Eg},Pg=new Map,Fg=new Map;function Ig(e=256){let t=new Uint8Array(e*e*4),n=(e,t,n)=>{let r=e*374761393+t*668265263+n*1442695041|0;return r=Math.imul(r^r>>>13,1274126177),((r^r>>>16)>>>0)/4294967296},r=(e,t,r,i)=>{let a=Math.floor(e),o=Math.floor(t),s=e-a,c=t-o,l=s*s*(3-2*s),u=c*c*(3-2*c),d=e=>(e%r+r)%r,f=n(d(a),d(o),i),p=n(d(a+1),d(o),i),m=n(d(a),d(o+1),i),h=n(d(a+1),d(o+1),i);return f+(p-f)*l+(m-f+(f-p+h-m)*l)*u},i=(t,n,i,a)=>{let o=0,s=.5,c=0,l=i;for(let i=0;i<4;i++)o+=r(t*l/e,n*l/e,l,a+i)*s,c+=s,s*=.5,l*=2;return o/c};for(let n=0;n<e;n++)for(let r=0;r<e;r++){let a=(n*e+r)*4;t[a]=Math.round(i(r,n,4,1)*255),t[a+1]=Math.round(i(r,n,16,9)*255),t[a+2]=Math.round(i(r,n,8,21)*255),t[a+3]=255}let a=new nl(t,e,e,xi);return a.wrapS=Zr,a.wrapT=Zr,a.magFilter=ri,a.minFilter=ai,a.generateMipmaps=!0,a.needsUpdate=!0,a}async function Lg(e){let t=new Tu,n=[];for(let[e,t]of Object.entries(Mg))n.push([e,t,!0]);for(let[e,t]of Object.entries(Ng))n.push([e,t,!1]);let r=0,i=n.length+1;await Promise.all([(async()=>{let t=await fetch(wg);if(!t.ok)throw Error(`Modele: HTTP ${t.status}`);Bg(await t.arrayBuffer()),e?.(++r,i)})(),...n.map(async([n,a,o])=>{let s=await t.loadAsync(a);s.colorSpace=o?ya:``,n!==`moon`&&(s.wrapS=Zr,s.wrapT=Zr),s.anisotropy=8,Pg.set(n,s),e?.(++r,i)})]),Pg.set(`noise`,Ig())}function Rg(e){let t=Pg.get(e);if(!t)throw Error(`Tekstura "${e}" nie jest wczytana (loadAssets).`);return t}var zg=new Float32Array(256);for(let e=0;e<256;e++){let t=e/255;zg[e]=t<=.04045?t/12.92:((t+.055)/1.055)**2.4}function Bg(e){for(let[t,n]of Object.entries(Tg)){let r=new Float32Array(e.slice(n.offset,n.offset+n.verts*12)),i=new Uint8Array(e,n.offset+n.verts*12,n.verts*4),a=new Float32Array(n.verts*3),o=new Float32Array(n.verts);for(let e=0;e<n.verts;e++)a[e*3]=zg[i[e*4]],a[e*3+1]=zg[i[e*4+1]],a[e*3+2]=zg[i[e*4+2]],o[e]=i[e*4+3]/255;let s=new uc;s.setAttribute(`position`,new Xs(r,3)),s.setAttribute(`color`,new Xs(a,3)),s.setAttribute(`aWind`,new Xs(o,1)),s.computeVertexNormals(),s.computeBoundingSphere(),Fg.set(t,s)}}function Vg(e){let t=Fg.get(e);if(!t)throw Error(`Model "${e}" nie jest wczytany (loadAssets).`);return t}var Hg=15327952,Ug=11740702,Wg={god:16762480,circle:8308991,amber:16752672,greed:12599551};function Gg(){let e=new jm(77);e.box(1.9,.35,1.5,6709879,{y:.17}),e.box(1.4,.3,1.1,5920363,{y:.48}),e.box(.46,2.3,.46,5913894,{y:1.75}),e.box(.52,.12,.52,7228462,{y:1.1}),e.box(.52,.12,.52,7228462,{y:2.3}),e.box(.2,.2,.05,9069112,{y:1.7,z:.24,rz:Math.PI/4}),e.box(1.15,1,.8,7030571,{y:3.35}),e.box(.8,.7,.06,3810582,{y:3.32,z:.4});for(let t=0;t<3;t++)e.box(.5,.07,.05,13212245,{y:3.32,z:.44,rz:t*Math.PI/3});e.box(.14,.14,.06,14726501,{y:3.32,z:.46,rz:Math.PI/4}),e.box(1,.1,1.2,4928032,{x:-.38,y:4.1,rz:.72}),e.box(1,.1,1.2,4928032,{x:.38,y:4.1,rz:-.72}),e.box(.95,.06,1.22,5600303,{x:-.4,y:4.17,rz:.72}),e.box(.95,.06,1.22,4876844,{x:.4,y:4.17,rz:-.72}),e.box(.08,.6,.08,7030571,{y:4.75});for(let t=0;t<4;t++)e.box(.5,.06,.06,9069112,{y:4.85,rz:t*Math.PI/4});e.box(1.5,.06,.3,Hg,{y:3.88,z:.3});for(let t of[-1,1])e.box(.34,1.5,.05,Hg,{x:t*.76,y:3.15,z:.3,rz:t*.06}),e.box(.35,.09,.06,Ug,{x:t*.79,y:2.72,z:.3,rz:t*.06}),e.box(.35,.05,.06,Ug,{x:t*.8,y:2.56,z:.3,rz:t*.06}),e.box(.12,.12,.062,Ug,{x:t*.77,y:2.96,z:.3,rz:Math.PI/4}),e.box(.35,.05,.06,Ug,{x:t*.74,y:3.6,z:.3,rz:t*.06}),e.box(.3,.1,.03,14208952,{x:t*.81,y:2.38,z:.3});for(let[t,n,r]of[[-.55,.45,.5],[-.3,.3,.6],[.35,.5,.55],[.6,.3,.45],[.05,.25,.65]])e.cyl(.07,.08,n,5,15260864,{x:t,y:.63+n/2,z:r});return e.build()}var Kg=[[-.55,1.13,.5],[-.3,.98,.6],[.35,1.18,.55],[.6,.98,.45],[.05,.93,.65]];function qg(){let e=new jm(5);for(let t=0;t<8;t++){let n=t/8*R;e.ico(.26,0,6051946,{x:Math.cos(n)*.95,y:.12,z:Math.sin(n)*.95,sy:.7,ry:n})}for(let t=0;t<5;t++){let n=t/5*R+.3;e.cyl(.11,.14,1.7,5,4008476,{x:Math.cos(n)*.38,y:.62,z:Math.sin(n)*.38,rz:Math.cos(n)*.62,rx:-Math.sin(n)*.62})}return e.cyl(.6,.7,.1,7,2300436,{y:.05}),e.build()}function Jg(e){let t=[];for(let n=0;n+8<e.length;n+=9){let r=e.slice(n,n+9);t.push(...r,r[3],r[4],r[5],r[0],r[1],r[2],r[6],r[7],r[8])}let n=new uc;return n.setAttribute(`position`,new J(t,3)),n}function Yg(){let e=new jm(9);for(let t=0;t<6;t++){let n=t/6*R+.2+t%2*.25,r=1.15+t%3*.14,i=.95+t%2*.3,a=e=>[r*e,r*(i*e-(i-.12)*e*e)],o=[],s=[];for(let e=0;e<6;e++){let t=.14+e/6*.8,n=.062,[r,i]=a(t-n),[c,l]=a(t+n),[u,d]=a(t+.03),f=.4*(1-t)**.6*Math.min(1,t*4+.35),p=e<3?o:s;for(let e of[-1,1])p.push(r,i,0,c,l,0,u+.05,d-.05-f*.18,e*f)}let[c,l]=a(.9),[u,d]=a(1.04);s.push(c,l,-.045,c,l,.045,u,d,0),e.add(Jg(o),t%2?3109942:3834424,{ry:n,jitter:.12}),e.add(Jg(s),t%2?6069312:7319112,{ry:n,jitter:.12})}return e.build()}function Xg(){let e=new jm(3);for(let t=0;t<7;t++){let n=t/7*R,r=.42+t*5%7*.06,i=.08+t%3*.09,a=.045,o=i*.35,s=r*.55,c={x:Math.cos(n)*.13,z:Math.sin(n)*.13,ry:n*1.7,jitter:.15};e.add(Jg([-.045,0,0,a,0,0,o+a*.7,s,0,-.045,0,0,o+a*.7,s,0,o-a*.7,s,0]),t%2?4156974:3499048,c),e.add(Jg([o-a*.7,s,0,o+a*.7,s,0,i,r,0]),t%2?7644484:6592060,c)}return e.build()}function Zg(){let e=new jm(4);for(let t of[-1,1]){let n=Jg([0,0,0,.1,.26,.07,.16,.58,0,0,0,0,.16,.58,0,.1,.26,-.07]);e.add(n,t<0?3832890:4886080,{x:t*.03,ry:t<0?Math.PI*.9:.2,jitter:.1})}let t=0,n=0;for(let r=0;r<=5;r++){let i=r/5,a=.02+i*i*.3,o=.16+i*.52-i*i*.18;if(r>0){let r=Math.hypot(a-t,o-n);e.cyl(.011,.013,r,3,6263880,{x:(a+t)/2,y:(o+n)/2,z:.02,rz:-Math.atan2(a-t,o-n)}),e.octa(.05,16447210,{x:a+.015,y:o-.055,z:.02,sy:.9,jitter:.02})}t=a,n=o}return e.build()}function Qg(){let e=new jm(6),t=(t,n,r,i)=>{e.cyl(.045*r,.07*r,.26*r,5,15722192,{x:t,y:.13*r,z:n}),e.cyl(.075*r,.06*r,.03*r,5,14274486,{x:t,y:.19*r,z:n}),e.cyl(.2*r,.17*r,.03*r,7,15129796,{x:t,y:.265*r,z:n}),e.add(new Rl(.21*r,7,3,0,R,0,Math.PI/2),i,{x:t,y:.275*r,z:n,sy:.72,jitter:.08});for(let[i,a]of[[0,.1],[1.3,.62],[2.6,.7],[3.8,.6],[5.1,.72],[.5,.8]]){let o=.2*r*a,s=Math.sqrt(Math.max(0,1-a*a))*.21*r*.72;e.octa(.028*r,16513006,{x:t+Math.cos(i)*o,y:.28*r+s,z:n+Math.sin(i)*o,sy:.6,jitter:.02})}};return t(0,0,1,13119519),t(.24,.1,.62,13908514),e.build()}function $g(){let e=new jm(12);for(let t=0;t<5;t++){let n=t/5*R+.4,r=.8+t%3*.16,i=Jg([.14,.2,0,.3,.36,.3,.52,.34,0,.14,.2,0,.52,.34,0,.3,.36,-.3,.3,.36,.3,.62,.3,.26,.52,.34,0,.3,.36,-.3,.52,.34,0,.62,.3,-.26,.62,.3,.26,.98,.12,0,.52,.34,0,.62,.3,-.26,.52,.34,0,.98,.12,0]);e.add(i,t%2?2976314:3898430,{ry:n,s:r,jitter:.14}),e.add(Jg([0,0,-.02,0,0,.02,.16,.21,0]),4880954,{ry:n,s:r})}return e.build()}function e_(){let e=new jm(15);for(let[t,n,r,i]of[[0,0,.3,6962204],[.5,.22,1.9,5517338],[-.42,.36,4.1,8016932],[.2,-.5,2.9,6043674]])e.add(Jg([-.11,0,0,0,.012,.06,.13,0,0,-.11,0,0,.13,0,0,0,.012,-.06]),i,{x:t,y:.05,z:n,ry:r,jitter:.12});return e.build()}function t_(){let e=new jm(8);return e.ico(.24,0,7103604,{y:.06,sy:.55,sz:.8}),e.ico(.12,0,8024704,{x:.24,y:.03,z:.08,sy:.6}),e.tintUpFaces(5931574,.55,.85),e.build()}var n_=4,r_=new Hc({color:16738842,transparent:!0,opacity:.9,fog:!1,toneMapped:!1}),i_=new Hc({color:16766042,transparent:!0,opacity:.95,fog:!1,toneMapped:!1}),a_=44,o_=92,s_=235,c_=78,l_=class{group=new cs;flames=[];shrineFlames=[];shrineAuras=[];glowTex;sources=[];lights=[];order=[];chunks=new Map;pending=new Map;geos=new Map;plantMul=1;shadows=!0;constructor(e,t){this.glowTex=p_(),Mm.uDetail.value=Rg(`detail`);for(let e=0;e<n_;e++){let e=new Vu(16746552,0,30,1.6);this.lights.push(e),this.group.add(e)}this.geos.set(`shrine`,Gg()),this.geos.set(`bonfire`,qg()),this.geos.set(`fern`,Pm(Nm(Yg(),.5,.5))),this.geos.set(`grass`,Pm(Nm(Xg(),.6,.55))),this.geos.set(`lily`,Pm(Nm(Zg(),.6,.4),.5)),this.geos.set(`burdock`,Pm(Nm($g(),.5,.3))),this.geos.set(`litter`,Pm(e_(),0)),this.geos.set(`mushroom`,Qg()),this.geos.set(`pebble`,t_()),this.placeObstacles(e),this.buildBorderForest(e),this.buildUndergrowth(e),this.flush(),this.setQuality(t),this.buildFlames(e)}geo(e){return this.geos.get(e)??Vg(e)}chunkAt(e,t){let n=Math.floor(e/a_),r=Math.floor(t/a_),i=(n+512)*1024+(r+512),a=this.chunks.get(i);return a||(a={x:(n+.5)*a_,z:(r+.5)*a_,near:[],far:[],plants:[]},this.chunks.set(i,a)),a}put(e,t,n,r,i,a,o,s=.08){let c=this.chunkAt(r,i),l=`${e}|${t}|${c.x}|${c.z}`,u=this.pending.get(l);u||(u={geo:this.geo(e),layer:t,chunk:c,list:[]},this.pending.set(l,u)),u.list.push({x:r,y:n.heightAt(r,i)-s,z:i,rot:a,s:o})}flush(){for(let e of this.pending.values()){let t=new dl(e.geo,Fm,e.list.length);e.list.forEach((e,n)=>Im(t.instanceMatrix.array,n,e.x,e.y,e.z,e.rot,e.s,e.s,e.s)),t.instanceMatrix.needsUpdate=!0,t.computeBoundingSphere(),t.receiveShadow=!0,t.castShadow=e.layer===`near`,t.matrixAutoUpdate=!1,t.visible=!1,this.group.add(t),e.layer===`plants`?e.chunk.plants.push({mesh:t,placed:e.list.length}):e.chunk[e.layer].push(t)}this.pending.clear()}placeObstacles(e){e.obstacles.forEach((t,n)=>{let r=Ve(n*31+7,91);switch(t.kind){case`pine`:{let n=r<.38,i=t.scale*(n?.9:.86);this.put(n?r<.19?`pine0`:`pine1`:r<.6?`fir0`:r<.8?`fir1`:`fir2`,`near`,e,t.x,t.z,t.rot,i),this.put(n?`pine_lod`:`fir_lod`,`far`,e,t.x,t.z,t.rot,i);break}case`oak`:this.put(r<.5?`oak0`:`oak1`,`near`,e,t.x,t.z,t.rot,t.scale*.9),this.put(`oak_lod`,`far`,e,t.x,t.z,t.rot,t.scale*.9);break;case`birch`:this.put(r<.5?`birch0`:`birch1`,`near`,e,t.x,t.z,t.rot,t.scale),this.put(`birch_lod`,`far`,e,t.x,t.z,t.rot,t.scale);break;case`rock`:{let n=r<.34?`rock0`:r<.67?`rock1`:`rock2`;this.put(n,`near`,e,t.x,t.z,t.rot,t.scale,.12),this.put(n,`far`,e,t.x,t.z,t.rot,t.scale,.12);break}case`menhir`:{let n=r<.5?`menhir0`:`menhir1`;this.put(n,`near`,e,t.x,t.z,t.rot,t.scale,.1),this.put(n,`far`,e,t.x,t.z,t.rot,t.scale,.1);break}case`ancientOak`:this.put(`ancient_oak`,`near`,e,t.x,t.z,t.rot,t.scale,.15),this.put(`ancient_oak`,`far`,e,t.x,t.z,t.rot,t.scale,.15);break;case`hut`:this.put(`hut`,`near`,e,t.x,t.z,t.rot,t.scale,.05),this.put(`hut`,`far`,e,t.x,t.z,t.rot,t.scale,.05);break;case`idol`:this.put(`idol`,`near`,e,t.x,t.z,t.rot,t.scale,.1),this.put(`idol`,`far`,e,t.x,t.z,t.rot,t.scale,.1);break;case`shrine`:this.put(`shrine`,`near`,e,t.x,t.z,t.rot,1),this.put(`shrine`,`far`,e,t.x,t.z,t.rot,1);break;case`bonfire`:this.put(`bonfire`,`near`,e,t.x,t.z,0,1),this.put(`bonfire`,`far`,e,t.x,t.z,0,1)}})}buildBorderForest(e){let t=new Wt(4242);for(let n=0;n<1500;n++){let n=t.range(0,R),r=183+t.next()**1.4*30,i=Math.cos(n)*r,a=Math.sin(n)*r,o=t.next(),s=o<.62?`fir_lod`:o<.9?`pine_lod`:`oak_lod`,c=s===`oak_lod`?t.range(1.5,2.3):t.range(1.3,2.4),l=t.range(0,R);this.put(s,`near`,e,i,a,l,c),this.put(s,`far`,e,i,a,l,c)}}buildUndergrowth(e){let t=new Wt(999),n=(n,r,i,a,o,s=`plants`)=>{let c=0,l=0;for(;c<r&&l++<r*30;){let r=t.range(0,R),l=Math.sqrt(t.next())*186,u=Math.cos(r)*l,d=Math.sin(r)*l;e.inPuddle(u,d)||t.next()>o(u,d)||(this.put(n,s,e,u,d,t.range(0,R),t.range(i,a),.02),c++)}},r=(t,n)=>e.isFree(t,n,2.2)?.12:+!!e.isFree(t,n,.3),i=(t,n)=>1-Math.min(1,e.pathAt(t,n)*3);n(`fern`,3400,.8,1.7,(e,t)=>r(e,t)*i(e,t)),n(`grass`,2e4,.8,1.7,(t,n)=>(Ue(t/9+5.5,n/9+1.5,3)<.6&&e.isFree(t,n,.2)?1:.08)*i(t,n)),n(`lily`,1600,.9,1.5,(t,n)=>(Ue(t/6+40,n/6+13,2)>.6&&e.isFree(t,n,.2)?1:.02)*i(t,n)),n(`mushroom`,640,.8,1.6,r),n(`pebble`,1200,.6,1.8,(t,n)=>e.isFree(t,n,.3)?.6:0),n(`burdock`,900,.8,1.5,(t,n)=>(e.isFree(t,n,3)?.03:+!!e.isFree(t,n,.9))*i(t,n)),n(`litter`,1500,.55,1,(t,n)=>e.pathAt(t,n)>.3&&e.isFree(t,n,.3)?1:.015);let a=(t,n)=>(e.isFree(t,n,.6)&&!e.isFree(t,n,3.2)?1:.03)*i(t,n);n(`bush0`,420,.8,1.5,a,`near`),n(`bush1`,520,.9,1.7,a,`near`)}setQuality(e){this.plantMul=e<=0?.35:e===1?.7:1,this.shadows=e>0;for(let e of this.chunks.values()){for(let t of e.plants)t.mesh.count=Math.max(1,Math.floor(t.placed*this.plantMul));for(let t of e.near)t.castShadow=this.shadows}}makeFlame(e){let t=new cs,n=[];[[.52,1.5,r_,0],[.36,1.15,i_,.05],[.3,.95,r_,0]].forEach(([r,i,a,o],s)=>{let c=new Ml(r*e,i*e,5,1);c.translate(0,i*e/2,0);let l=new Y(c,a);l.position.set(s===2?.22*e:0,o*e,s===2?-.12*e:0),n.push(l),t.add(l)});let r=new Fc(new xc({map:this.glowTex,color:16747066,blending:2,depthWrite:!1,transparent:!0,opacity:.55,fog:!1}));return r.scale.setScalar(5.5*e),r.position.y=.8*e,t.add(r),{group:t,cones:n,phase:Math.random()*10}}buildFlames(e){for(let t of e.obstacles){if(t.kind!==`hut`)continue;let n=Math.cos(t.rot),r=Math.sin(t.rot),i=(e,i)=>[t.x+e*n+i*r,t.z-e*r+i*n],a=e.heightAt(t.x,t.z)-.05,[o,s]=i(.95,1.75),c=new Fc(new xc({map:this.glowTex,color:16756816,blending:2,depthWrite:!1,transparent:!0,opacity:.75,fog:!1}));c.scale.setScalar(3.2),c.position.set(o,a+4.45,s),this.group.add(c);let[l,u]=i(.6,3.4);this.sources.push({x:l,y:a+3.4,z:u,intensity:42,range:18,phase:2.1,on:!0})}for(let t of e.bonfires){let n=this.makeFlame(1.45),r=e.heightAt(t.x,t.z);n.group.position.set(t.x,r+.15,t.z),this.group.add(n.group),this.flames.push(n),this.sources.push({x:t.x,y:r+1.6,z:t.z,intensity:95,range:30,phase:n.phase,on:!0})}for(let t of e.shrines){let n=new cs;n.position.set(t.x,e.heightAt(t.x,t.z)-.08,t.z),n.rotation.y=t.rot;for(let[e,t,r]of Kg){let i=this.makeFlame(.12);i.group.position.set(e,t,r),n.add(i.group),this.flames.push(i)}this.addShrineAura(n,t.kind),this.group.add(n),this.shrineFlames.push(n),this.sources.push({x:t.x+Math.sin(t.rot)*1,y:n.position.y+1.4,z:t.z+Math.cos(t.rot)*1,intensity:16,range:10,phase:Math.random()*10,on:!0})}}addShrineAura(e,t){let n=Wg[t],r=e=>new xc({map:this.glowTex,color:n,blending:2,depthWrite:!1,transparent:!0,opacity:e,fog:!1}),i=new Y(d_,ih(new Hc({map:this.glowTex,color:n,blending:2,depthWrite:!1,transparent:!0,opacity:t===`circle`?.42:.3})));i.rotation.x=-Math.PI/2,i.position.y=.22,t===`circle`&&i.scale.setScalar(f_),e.add(i);let a=new Fc(r(.3));a.position.y=3.3,a.scale.setScalar(6),e.add(a);let o=[];for(let t=0;t<u_;t++){let t=new Fc(r(0));t.scale.setScalar(.34),o.push(t),e.add(t)}this.shrineAuras.push({ground:i,halo:a,motes:o,phase:Math.random()*10})}dispose(){this.group.traverse(e=>{e instanceof dl?e.dispose():e instanceof Fc?e.material.dispose():e instanceof Y&&e.geometry!==d_&&e.geometry.dispose()});for(let e of this.geos.values())e.dispose();for(let e of this.shrineAuras)e.ground.material.dispose();this.glowTex.dispose()}setShrineUsed(e,t){let n=this.shrineFlames[e];n&&(n.visible=!t);let r=this.sources[this.sources.length-this.shrineFlames.length+e];r&&(r.on=!t)}update(e,t,n){Mm.uTime.value=e;for(let e of this.chunks.values()){let r=e.x-t,i=e.z-n,a=Math.sqrt(r*r+i*i),o=a<o_,s=!o&&a<s_,c=a<c_;for(let t=0;t<e.near.length;t++)e.near[t].visible=o;for(let t=0;t<e.far.length;t++)e.far[t].visible=s;for(let t=0;t<e.plants.length;t++)e.plants[t].mesh.visible=c}let r=this.sources,i=this.order;i.length=0;for(let e=0;e<r.length;e++)r[e].on&&i.push(e);let a=e=>{let i=r[e];return(i.x-t)*(i.x-t)+(i.z-n)*(i.z-n)};i.sort((e,t)=>a(e)-a(t));for(let t=0;t<this.lights.length;t++){let n=this.lights[t],o=i[t];if(o===void 0){n.intensity=0;continue}let s=r[o],c=Math.sqrt(a(o)),l=1-Math.min(1,Math.max(0,(c-40)/22)),u=e*9+s.phase;n.position.set(s.x,s.y,s.z),n.distance=s.range,n.intensity=s.intensity*l*(.85+Math.sin(u)*.09+Math.sin(u*2.7+1.3)*.07)}for(let t=0;t<this.flames.length;t++){let n=this.flames[t],r=e*9+n.phase,i=.82+Math.sin(r)*.1+Math.sin(r*2.7+1.3)*.08;for(let e=0;e<n.cones.length;e++){let t=n.cones[e];t.scale.set(1+Math.sin(r*1.3+e)*.12,i+Math.sin(r*1.9+e*2)*.16,1+Math.cos(r*1.1+e)*.12),t.rotation.y=r*.4+e}}for(let t=0;t<this.shrineAuras.length;t++){let n=this.shrineAuras[t];if(!this.shrineFlames[t].visible)continue;let r=e+n.phase,i=.5+.5*Math.sin(r*1.3);n.ground.material.opacity=.22+i*.12,n.halo.material.opacity=.24+i*.12,n.halo.scale.setScalar(5.6+i*.8);for(let e=0;e<n.motes.length;e++){let t=n.motes[e],i=(r*.11+e/n.motes.length)%1,a=e*2.4+r*.35,o=1.5+Math.sin(e*1.7+r*.5)*.45;t.position.set(Math.cos(a)*o,.5+i*5.2,Math.sin(a)*o),t.material.opacity=Math.sin(i*Math.PI)*.85}}}},u_=7,d_=new Il(11,11,10,10),f_=1.5;function p_(){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.25,`rgba(255,255,255,0.55)`),n.addColorStop(.6,`rgba(255,255,255,0.12)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64);let r=new El(e);return r.colorSpace=ya,r}var m_=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`,h_=`
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uSunDir;
uniform vec3 uSunCol;
uniform vec3 uMoonDir;
uniform float uNight;
uniform float uTime;
uniform sampler2D uMoonTex;
varying vec3 vDir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise3(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y);
  float b = mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y);
  return mix(a, b, f.z);
}
float fbm3(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += noise3(p) * a;
    p = p * 2.03 + vec3(17.3, 9.1, 4.7);
    a *= 0.5;
  }
  return s / 0.9375;
}
/** Cloud density in a direction of the sky: big heaps, wider than tall, with smaller billows riding on them. */
float clouds(vec3 p) {
  float big = fbm3(p);
  float small = fbm3(p * 3.1 + big * 1.6);
  return big * 0.7 + small * 0.3;
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.22, h));
  col = mix(col, uTop, smoothstep(0.16, 0.7, h));

  float sd = max(dot(d, uSunDir), 0.0);
  col += uSunCol * (pow(sd, 5.0) * 0.45 + pow(sd, 90.0) * 0.9);

  // Heaped clouds drifting over the forest, sampled by direction, so they have no seam and keep their
  // size down to the horizon. The side of every heap that faces the sun or the moon is lit, the rest stays dark.
  vec3 lightDir = normalize(mix(uSunDir, uMoonDir, uNight));
  vec3 cp = vec3(d.x, d.y * 2.4, d.z) * 2.6 + vec3(uTime * 0.004, 0.0, uTime * 0.0015);
  float dens = clouds(cp);
  float lit = clamp((dens - clouds(cp + lightDir * 0.22)) * 3.2 + 0.25, 0.0, 1.0);
  float cloud = smoothstep(0.47, 0.58, dens) * smoothstep(0.0, 0.07, h);
  float thick = smoothstep(0.5, 0.75, dens);
  float ld = max(dot(d, lightDir), 0.0);
  float near = pow(ld, 3.0);
  vec3 dayBody = mix(uTop, uMid, 0.3) * 0.95;
  vec3 dayRim = uHorizon * 1.25 + uSunCol * 0.45;
  vec3 nightBody = mix(uMid, vec3(0.17, 0.11, 0.32), 0.7) * 0.8;
  vec3 nightRim = vec3(0.36, 0.29, 0.62);
  vec3 body = mix(dayBody, nightBody, uNight);
  vec3 rim = mix(dayRim, nightRim, uNight);
  vec3 cloudCol = mix(body * (1.0 - thick * 0.3), rim, lit * (0.35 + near * 0.65));
  // Silver lining where a cloud passes close to the light.
  cloudCol += rim * pow(ld, 24.0) * (1.0 - thick) * 0.6;
  // A hole in the clouds around the moon keeps it in the clear.
  cloud *= 1.0 - uNight * 0.8 * smoothstep(0.972, 0.996, dot(d, uMoonDir));
  col = mix(col, cloudCol, cloud * 0.9);

  // Stars.
  vec2 suv = vec2(atan(d.z, d.x) * 40.0, h * 70.0);
  vec2 g = floor(suv);
  float r = hash(g);
  float star = step(0.972, r) * smoothstep(0.2, 0.0, length((fract(suv) - 0.5) * vec2(1.0, 0.6)));
  col += vec3(0.9, 0.92, 1.0) * star * uNight * (0.55 + 0.45 * sin(uTime * 2.0 + r * 90.0)) * smoothstep(0.06, 0.3, h) * (1.0 - cloud);

  // Moon: a painted disc with a soft halo, rising as the night deepens.
  float md = max(dot(d, uMoonDir), 0.0);
  vec3 mr = normalize(cross(vec3(0.0, 1.0, 0.0), uMoonDir));
  vec3 mu = cross(uMoonDir, mr);
  vec2 muv = vec2(dot(d, mr), dot(d, mu)) / 0.075;
  float disc = (1.0 - smoothstep(0.92, 1.0, length(muv))) * step(0.0, dot(d, uMoonDir));
  vec3 moonCol = texture2D(uMoonTex, muv * 0.4 + 0.5).rgb;
  col = mix(col, moonCol * 1.25, disc * uNight * (1.0 - cloud * 0.7));
  col += vec3(0.32, 0.4, 0.62) * (pow(md, 60.0) * 0.5 + pow(md, 600.0) * 0.5) * uNight * (1.0 - disc);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,g_=[{top:3811950,mid:10111612,horizon:15894346,fog:7034502,hemiSky:10455766,hemiGround:6965814,hemiInt:1.55,sun:16754792,sunInt:2.3,fogDensity:.013},{top:2104398,mid:5519215,horizon:11030634,fog:4536426,hemiSky:8024264,hemiGround:4864576,hemiInt:1.45,sun:13666970,sunInt:1.2,fogDensity:.0155},{top:527394,mid:1252416,horizon:2371670,fog:1712450,hemiSky:6848720,hemiGround:3421262,hemiInt:1.6,sun:10468607,sunInt:1.5,fogDensity:.016}],__=new q,v_=new q;function y_(e,t,n,r){return __.set(t),v_.set(n),e.copy(__).lerp(v_,r)}var b_=class{mesh;sun;hemi;fog;mat;sunDir=new W;night=0;lightDir=new W(0,1,0);reflect=new q;constructor(e){this.mat=new Jl({vertexShader:m_,fragmentShader:h_,side:1,depthWrite:!1,depthTest:!0,fog:!1,uniforms:{uTop:{value:new q},uMid:{value:new q},uHorizon:{value:new q},uSunDir:{value:new W(0,.1,-1)},uSunCol:{value:new q},uMoonDir:{value:new W(.5,.26,.6).normalize()},uNight:{value:0},uTime:{value:0},uMoonTex:{value:Rg(`moon`)}}}),this.mesh=new Y(new Rl(1,24,16),this.mat),this.mesh.scale.setScalar(450),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-10,e.add(this.mesh),this.hemi=new Du(16777215,4473924,1),e.add(this.hemi),this.sun=new Wu(16777215,2),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(2048,2048);let t=this.sun.shadow.camera;t.left=-42,t.right=42,t.top=42,t.bottom=-42,t.near=1,t.far=220,this.sun.shadow.bias=-6e-4,this.sun.shadow.normalBias=.06,this.sun.shadow.intensity=.72,e.add(this.sun),e.add(this.sun.target),this.fog=new gs(7034502,.014),e.fog=this.fog,this.setTime(0,0)}setTime(e,t){e=Fe(e,0,1);let n=e<.5?0:1,r=e<.5?e/.5:(e-.5)/.5,i=g_[n],a=g_[n+1],o=this.mat.uniforms;y_(o.uTop.value,i.top,a.top,r),y_(o.uMid.value,i.mid,a.mid,r),y_(o.uHorizon.value,i.horizon,a.horizon,r),y_(this.fog.color,i.fog,a.fog,r),this.fog.density=i.fogDensity+(a.fogDensity-i.fogDensity)*r,y_(this.hemi.color,i.hemiSky,a.hemiSky,r),y_(this.hemi.groundColor,i.hemiGround,a.hemiGround,r),this.hemi.intensity=i.hemiInt+(a.hemiInt-i.hemiInt)*r,y_(this.sun.color,i.sun,a.sun,r),this.sun.intensity=i.sunInt+(a.sunInt-i.sunInt)*r,this.night=Fe((e-.35)/.5,0,1),o.uNight.value=this.night,o.uTime.value=t;let s=.2-e*.55;this.sunDir.set(-.55,s,-.8).normalize(),o.uSunDir.value.copy(this.sunDir);let c=Fe(1-e*1.5,0,1);o.uSunCol.value.set(16751184).multiplyScalar(c)}follow(e,t,n,r){this.mesh.position.copy(e);let i=this.mat.uniforms,a=i.uMoonDir.value,o=this.night,s=uo.lerp(-.55,a.x,o),c=uo.lerp(.42,a.y+.45,o),l=uo.lerp(-.8,a.z,o),u=Math.hypot(s,c,l);this.lightDir.set(s/u,c/u,l/u),this.reflect.copy(i.uMid.value).lerp(i.uHorizon.value,.45),this.sun.position.set(t+s/u*90,n+c/u*90,r+l/u*90),this.sun.target.position.set(t,n,r)}},x_=new q(661030),S_=new q(1912896),C_=`
attribute float aEdge;
varying float vEdge;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vEdge = aEdge;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,w_=`
uniform vec3 uDeep;
uniform vec3 uSky;
uniform vec3 uLightDir;
uniform vec3 uLightCol;
uniform float uTime;
uniform sampler2D uNoise;
varying float vEdge;
varying vec3 vWorld;
#include <common>
#include <fog_pars_fragment>
void main() {
  // Two scrolling noise layers make a cheap, soft ripple normal.
  vec2 p = vWorld.xz;
  vec2 a = texture2D(uNoise, p * 0.11 + vec2(uTime * 0.012, uTime * 0.008)).rg;
  vec2 b = texture2D(uNoise, p * 0.23 - vec2(uTime * 0.01, -uTime * 0.014)).gb;
  vec2 rip = (a + b - 1.0) * 0.55;
  vec3 n = normalize(vec3(rip.x, 1.0, rip.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 col = mix(uDeep, uSky * 0.8, 0.12 + fres * 0.55);
  // Glitter of the low sun / the moon.
  vec3 h = normalize(uLightDir + v);
  float spec = pow(max(dot(n, h), 0.0), 180.0);
  col += uLightCol * spec * 2.2;
  // Soft shore: the rim fades into the mud, with a pale foam line just inside it.
  float shore = smoothstep(1.0, 0.72, vEdge);
  col += vec3(0.16, 0.2, 0.2) * smoothstep(0.62, 0.9, vEdge) * (0.5 + 0.5 * sin(uTime * 1.3 + vEdge * 40.0 + p.x)) * 0.35;
  gl_FragColor = vec4(col, shore * 0.9);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,T_=class{group=new cs;water;constructor(e){let t=48841,n=new Float32Array(t*3),r=new Float32Array(t*3),i=new Float32Array(t*4),a=new Float32Array(t),o=e.heights,s=new Float32Array(t),c=new Float32Array(t);for(let t of e.obstacles){let e=t.kind===`pine`||t.kind===`oak`||t.kind===`birch`||t.kind===`ancientOak`,n=t.kind===`rock`||t.kind===`menhir`;if(!e&&!n)continue;let r=e?t.kind===`ancientOak`?11:5.5*t.scale:2.4*t.scale,i=Math.max(0,Math.floor((t.x-r+220)/2)),a=Math.min(220,Math.ceil((t.x+r+220)/2)),o=Math.max(0,Math.floor((t.z-r+220)/2)),l=Math.min(220,Math.ceil((t.z+r+220)/2));for(let n=o;n<=l;n++)for(let o=i;o<=a;o++){let i=Math.hypot(-220+o*2-t.x,-220+n*2-t.z),a=1-Le(r*.25,r,i),l=n*221+o;e&&(s[l]=Math.min(1,s[l]+a*.75));let u=1-Le(t.r*.8,t.r*2.4+1.2,i);u>c[l]&&(c[l]=u)}}for(let t=0;t<221;t++)for(let l=0;l<221;l++){let u=t*221+l,d=-220+l*2,f=-220+t*2,p=o[u];n[u*3]=d,n[u*3+1]=p,n[u*3+2]=f;let m=Math.hypot(d,f),h=o[u-+(l>0)],g=o[u+ +(l<220)],_=o[u-(t>0?221:0)],v=o[u+(t<220?221:0)],y=Math.hypot(g-h,v-_)/4,b=Ue(d/9+5.5,f/9+1.5,3),x=Ue(d/17+60,f/17+20,2),S=Le(174,190,m),C=Le(.6,.72,b)*.6;C=Math.max(C,(1-Le(3,9,m))*.95),C=Math.max(C,e.pathAt(d,f));let w=0;for(let t of e.puddles){let e=Math.hypot(t.x-d,t.z-f);w=Math.max(w,1-Le(t.r*.85,t.r*1.75,e))}let T=Le(.42,.8,y)*(1-S),E=Math.max(s[u],S);i[u*4]=E,i[u*4+1]=C*(1-w),i[u*4+2]=w,i[u*4+3]=T,a[u]=Le(.52,.7,Ue(d/23+14.2,f/23+51.7,2))*(1-E*.6);let D=.86+x*.28;D*=1-c[u]*.42,D*=1-S*.45;let O=(b-.5)*.12,k=Ve(l*7+3,t*13+5)*.04;r[u*3]=D*(1+O)+k,r[u*3+1]=D+k,r[u*3+2]=D*(1-O)+k}let l=new Uint32Array(290400),u=0;for(let e=0;e<220;e++)for(let t=0;t<220;t++){let n=e*221+t;l[u++]=n,l[u++]=n+221,l[u++]=n+1,l[u++]=n+1,l[u++]=n+221,l[u++]=n+221+1}let d=new uc;d.setAttribute(`position`,new Xs(n,3)),d.setAttribute(`color`,new Xs(r,3)),d.setAttribute(`aSplat`,new Xs(i,4)),d.setAttribute(`aMoss`,new Xs(a,1)),d.setIndex(new Xs(l,1)),d.computeVertexNormals();let f=new Xl({vertexColors:!0}),p={uGrass:{value:Rg(`grass`)},uMoss:{value:Rg(`moss`)},uForest:{value:Rg(`forest`)},uDirt:{value:Rg(`dirt`)},uMud:{value:Rg(`mud`)},uRock:{value:Rg(`rock`)},uNoise:{value:Rg(`noise`)}};f.onBeforeCompile=e=>{Object.assign(e.uniforms,p),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec4 aSplat;
attribute float aMoss;
varying vec4 vSplat;
varying float vMoss;
varying vec2 vGround;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vSplat = aSplat;
vMoss = aMoss;
vGround = position.xz;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform sampler2D uGrass;
uniform sampler2D uMoss;
uniform sampler2D uForest;
uniform sampler2D uDirt;
uniform sampler2D uMud;
uniform sampler2D uRock;
uniform sampler2D uNoise;
varying vec4 vSplat;
varying float vMoss;
varying vec2 vGround;
// Sharpens a soft per-vertex weight with noise so borders between materials look torn, not airbrushed.
float mbEdge(float w, float n, float soft) {
  return smoothstep(0.5 - soft, 0.5 + soft, w + (n - 0.5) * 0.7);
}`).replace(`#include <map_fragment>`,`{
  vec2 gp = vGround;
  vec3 nz = texture2D(uNoise, gp / 37.0).rgb;
  vec3 nz2 = texture2D(uNoise, gp / 9.0 + 0.31).rgb;
  // Each layer is sampled at two unrelated scales and mixed by slow noise: no visible tiling grid.
  vec2 uvA = gp / 5.5;
  vec2 uvB = vec2(gp.y, -gp.x) / 14.0 + 0.43;
  float mixAB = smoothstep(0.3, 0.7, nz.b);
  vec3 grass = mix(texture2D(uGrass, uvA).rgb, texture2D(uGrass, uvB).rgb, mixAB * 0.6);
  grass *= vec3(1.25, 0.92, 0.78);
  vec3 moss = mix(texture2D(uMoss, uvA * 0.8).rgb, texture2D(uMoss, uvB).rgb, mixAB * 0.5) * vec3(0.92, 0.82, 0.7);
  vec3 forest = mix(texture2D(uForest, uvA * 0.9).rgb, texture2D(uForest, uvB * 1.3).rgb, mixAB * 0.5) * 0.9;
  vec3 dirt = texture2D(uDirt, gp / 6.5).rgb;
  dirt = mix(vec3(dot(dirt, vec3(0.3, 0.5, 0.2))), dirt, 0.32) * vec3(0.56, 0.56, 0.52);
  vec3 mud = texture2D(uMud, gp / 6.0).rgb * 0.85;
  vec3 rock = texture2D(uRock, gp / 8.0).rgb * 0.8;
  vec3 col = mix(grass, moss, mbEdge(vMoss, nz2.r, 0.22));
  col = mix(col, forest, mbEdge(vSplat.x, nz2.g, 0.3));
  col = mix(col, rock, mbEdge(vSplat.w, nz2.b, 0.2));
  col = mix(col, dirt, mbEdge(vSplat.y, nz2.r, 0.18));
  col = mix(col, mud, mbEdge(vSplat.z, nz2.g, 0.25));
  // Slow patches of lighter and darker ground.
  col *= 0.86 + nz.r * 0.3;
  diffuseColor.rgb *= col;
}`)},f.customProgramCacheKey=()=>`mb-terrain`;let m=new Y(d,f);m.receiveShadow=!0,m.matrixAutoUpdate=!1,m.frustumCulled=!1,this.group.add(m),this.water=new Jl({vertexShader:C_,fragmentShader:w_,transparent:!0,depthWrite:!1,fog:!0,uniforms:Gl.merge([Z.fog,{uDeep:{value:new q(1912896)},uSky:{value:new q(10111612)},uLightDir:{value:new W(0,1,0)},uLightCol:{value:new q(16777215)},uTime:{value:0},uNoise:{value:null}}])}),this.water.uniforms.uNoise.value=Rg(`noise`);for(let t of e.puddles){let e=t.r>8?28:14,n=[0,0,0],r=[0],i=[];for(let i=1;i<=3;i++){let a=i/3;for(let i=0;i<e;i++){let o=i/e*Math.PI*2,s=t.r*1.25*(.82+Ve(i*13+Math.floor(t.x),Math.floor(t.z))*.3)*a;n.push(Math.cos(o)*s,0,Math.sin(o)*s),r.push(a)}}for(let t=0;t<e;t++)i.push(0,1+(t+1)%e,1+t);for(let t=1;t<3;t++){let n=1+(t-1)*e,r=1+t*e;for(let t=0;t<e;t++){let a=(t+1)%e;i.push(n+t,n+a,r+t,n+a,r+a,r+t)}}let a=new uc;a.setAttribute(`position`,new J(n,3)),a.setAttribute(`aEdge`,new J(r,1)),a.setIndex(i);let o=new Y(a,this.water);o.position.set(t.x,t.y,t.z),o.renderOrder=1,this.group.add(o)}}dispose(){let e=new Set;this.group.traverse(t=>{let n=t;n.isMesh&&(n.geometry.dispose(),e.add(n.material))});for(let t of e)t.dispose()}update(e,t,n,r,i){let a=this.water.uniforms;a.uDeep.value.copy(S_).lerp(x_,t),a.uSky.value.copy(n),a.uLightDir.value.copy(r),a.uLightCol.value.copy(i),a.uTime.value=e}},E_=class{canvas;map;renderer;scene=new _s;camera=new zu(62,1,.3,700);sky;terrain;props;hero;enemies;fx;overlay;glowTex;shakeEnabled=!0;menuOrbit=!1;photo=null;heroLight;focus=new W;focusInit=!1;camYaw=0;camPitch=.36;camDist=9;shake=0;clock=0;distExtra=0;ghostAcc=0;post=null;quality;constructor(e,t,n,r){this.canvas=e,this.map=n,this.quality=r,th(n),this.renderer=new xm({canvas:e,antialias:!1,powerPreference:`high-performance`}),this.renderer.outputColorSpace=ya,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.3,this.renderer.shadowMap.type=1,this.glowTex=p_(),this.sky=new b_(this.scene),this.terrain=new T_(n),this.scene.add(this.terrain.group),this.props=new l_(n,r),this.scene.add(this.props.group),this.hero=new og(this.glowTex),this.scene.add(this.hero.group),this.heroLight=new Vu(16763024,6,16,1.5),this.scene.add(this.heroLight),this.enemies=new Qm,this.scene.add(this.enemies.group),this.overlay=new lg(t),this.fx=new zh(n,this.overlay,this.glowTex),this.scene.add(this.fx.group),this.applyQuality(r),this.resize(),window.addEventListener(`resize`,()=>this.resize())}setMap(e){e!==this.map&&(this.map=e,th(e),this.scene.remove(this.terrain.group,this.props.group),this.terrain.dispose(),this.props.dispose(),this.terrain=new T_(e),this.scene.add(this.terrain.group),this.props=new l_(e,this.quality),this.scene.add(this.props.group),this.fx.setMap(e))}applyQuality(e){this.quality=e,this.renderer.shadowMap.enabled=e>0,this.sky.sun.castShadow=e>0,this.sky.sun.shadow.mapSize.setScalar(e===2?2048:1024),this.sky.sun.shadow.map?.dispose(),this.sky.sun.shadow.map=null,this.enemies.setShadows(e>0),this.props.setQuality(e),this.fx.setDensity(e===0?.5:e===1?.8:1),this.post?.dispose(),this.post=e>0?new Cg(this.renderer,this.scene,this.camera,e===2?4:2):null,this.scene.traverse(e=>{let t=e.material;t&&(t.needsUpdate=!0)}),this.resize()}resize(){let e=this.canvas.clientWidth||window.innerWidth,t=this.canvas.clientHeight||window.innerHeight,n=this.quality,r=window.devicePixelRatio||1,i=n===0?1:n===1?1.5:2,a=n===0?21e5:n===1?23e5:32e5;this.renderer.setPixelRatio(Math.max(.5,Math.min(r,i,Math.sqrt(a/Math.max(1,e*t))))),this.renderer.setSize(e,t,!1),this.post?.setSize(e,t,this.renderer.getPixelRatio()),this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix(),this.fx.setViewport(t,this.camera.fov)}rotateCamera(e,t){this.camYaw+=e,this.camPitch=Fe(this.camPitch+t,.08,1.25)}resetRun(){this.fx.reset(),this.overlay.clear(),this.focusInit=!1,this.shake=0}render(e,t,n){this.clock+=n;let r=e.player;this.menuOrbit&&(this.camYaw+=n*.06);let i=this.photo;this.hero.group.visible=!e.dead&&!i?.hideHero,this.hero.update(r,t,n,this.clock);let a=this.hero.group.position;this.hero.setGround(this.map.heightAt(a.x,a.z)),this.focusInit||=(this.focus.set(a.x,a.y+1.7,a.z),!0),this.focus.x=Re(this.focus.x,a.x,22,n),this.focus.z=Re(this.focus.z,a.z,22,n),this.focus.y=Re(this.focus.y,a.y+1.7,9,n);let o=e.bossIdx,s=o>=0&&e.enemies.alive[o]?e.enemies.radius[o]:0;this.distExtra=Re(this.distExtra,s>2?6:s>0?2.5:0,2,n),i&&this.focus.set(i.x,i.y,i.z);let c=i?0:this.distExtra,l=this.camDist+c,u=this.camPitch+c*.012,d=Math.cos(u),f=this.focus.x+Math.sin(this.camYaw)*d*l,p=this.focus.z+Math.cos(this.camYaw)*d*l,m=this.focus.y+Math.sin(u)*l,h=this.map.heightAt(f,p)+.8;if(m<h&&(m=h),this.camera.position.set(f,m,p),this.camera.lookAt(this.focus.x,this.focus.y+(i?0:.6),this.focus.z),this.fx.shake>this.shake&&(this.shake=this.fx.shake),this.fx.shake=0,this.shakeEnabled||(this.shake=0),this.shake>.001){let e=this.shake*.35;this.camera.position.x+=(Math.random()-.5)*e,this.camera.position.y+=(Math.random()-.5)*e,this.camera.rotation.z+=(Math.random()-.5)*e*.04,this.shake=Re(this.shake,0,9,n)}Mm.uCam.value.copy(this.camera.position),Mm.uHero.value.set(a.x,a.y+1.2,a.z),this.sky.setTime(e.dayTime(),this.clock),this.sky.follow(this.camera.position,Math.round(a.x/2)*2,0,Math.round(a.z/2)*2),this.terrain.update(this.clock,this.sky.night,this.sky.reflect,this.sky.lightDir,this.sky.sun.color),this.props.update(this.clock,a.x,a.z),this.heroLight.position.set(a.x,a.y+2.6,a.z),this.heroLight.intensity=3.5+this.sky.night*5.5;for(let t=0;t<e.shrines.length;t++)this.props.setShrineUsed(t,e.shrines[t].used);this.enemies.update(e,t,this.clock),this.fx.camYaw=this.camYaw,this.fx.setFogColor(this.sky.fog.color),r.dashT>0&&n>.002&&(this.ghostAcc+=n,this.ghostAcc>.045&&(this.ghostAcc=0,this.fx.addGhost(this.hero.group))),this.fx.update(e,t,n,this.sky.night),this.post?this.post.render(n,this.clock,this.sky.night,this.renderer.toneMappingExposure):this.renderer.render(this.scene,this.camera),this.overlay.draw(this.camera,n)}},D_=new URL(`parchment-DrBB034W.jpg`,import.meta.url).href,O_=1024,k_=195,A_=O_/(k_*2),j_=`#3b2a1a`,M_=e=>(e+k_)*A_;function N_(e,t){let n=document.createElement(`canvas`);return n.width=e,n.height=t,[n,n.getContext(`2d`)]}var P_={god:`#f4d98a`,circle:`#7ec8ff`,amber:`#ffb040`,greed:`#c070ff`},F_=class{map;root;canvas;ctx;info;parchment=new Image;base=null;unknown=null;revealed;revealedCtx;fogCanvas;fogCtx;fogData;fogVersion=-1;fogOwner=null;size=0;clock=0;visible=!1;constructor(e,t){this.map=t,this.root=document.createElement(`div`),this.root.className=`mapscreen`;let n=document.createElement(`div`);n.className=`mapsheet`,n.style.backgroundImage=`url(${D_})`,this.root.appendChild(n);let r=document.createElement(`h3`);r.textContent=`Słowiańskie Bory`,n.appendChild(r),this.canvas=document.createElement(`canvas`),n.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`),this.info=document.createElement(`div`),this.info.className=`maplegend`,n.appendChild(this.info),e.appendChild(this.root),[this.revealed,this.revealedCtx]=N_(O_,O_),[this.fogCanvas,this.fogCtx]=N_(Nn,Nn),this.fogData=this.fogCtx.createImageData(Nn,Nn),this.parchment.onload=()=>{this.base=null,this.unknown=null,this.fogVersion=-1},this.parchment.src=D_,window.addEventListener(`resize`,()=>this.size=0)}setMap(e){e!==this.map&&(this.map=e,this.base=null,this.fogVersion=-1)}setVisible(e){e!==this.visible&&(this.visible=e,this.root.classList.toggle(`open`,e))}paper(e){this.parchment.complete&&this.parchment.naturalWidth>0?e.drawImage(this.parchment,0,0,O_,O_):(e.fillStyle=`#d8c69c`,e.fillRect(0,0,O_,O_))}buildUnknown(){let[e,t]=N_(O_,O_);t.save(),t.beginPath(),t.arc(O_/2,O_/2,O_/2-3,0,R),t.clip(),this.paper(t),t.fillStyle=`rgba(52, 36, 22, 0.52)`,t.fillRect(0,0,O_,O_),t.strokeStyle=`rgba(40, 26, 14, 0.2)`,t.lineWidth=1.2;for(let e=-1024;e<O_;e+=13)t.beginPath(),t.moveTo(e,0),t.lineTo(e+O_,O_),t.stroke();t.strokeStyle=`rgba(30, 20, 10, 0.3)`,t.lineWidth=1.4;for(let e=0;e<260;e++){let n=Ve(e,11)*O_,r=Ve(e,23)*O_,i=6+Ve(e,5)*5;t.beginPath(),t.moveTo(n-i*.6,r+i*.5),t.lineTo(n,r-i*.7),t.lineTo(n+i*.6,r+i*.5),t.stroke()}return t.restore(),e}buildBase(){let e=this.map,[t,n]=N_(O_,O_);n.save(),n.beginPath(),n.arc(O_/2,O_/2,O_/2-3,0,R),n.clip(),this.paper(n);let r=O_/2,[i,a]=N_(r,r),o=a.createImageData(r,r),s=o.data,c=k_*2/r;for(let t=0;t<r;t++){let n=-k_+(t+.5)*c;for(let i=0;i<r;i++){let a=-k_+(i+.5)*c,o=Math.hypot(a,n),l=e.heightAt(a,n),u=Math.max(-1,Math.min(1,(e.heightAt(a-1.5,n-1.5)-e.heightAt(a+1.5,n+1.5))*.42)),d=132,f=150,p=88,m=Math.max(0,Math.min(1,(l+2)/9));d+=m*34,f+=m*14,p+=m*6;let h=e.pathAt(a,n),g=Math.max(0,1-o/9),_=Math.max(h,g);_>0&&(d+=(196-d)*_,f+=(160-f)*_,p+=(108-p)*_);let v=Math.max(0,Math.min(1,(o-180+4)/12));d+=(66-d)*v,f+=(84-f)*v,p+=(58-p)*v;let y=1+u*.3,b=(t*r+i)*4;s[b]=d*y,s[b+1]=f*y,s[b+2]=p*y,s[b+3]=205}}a.putImageData(o,0,0),n.imageSmoothingQuality=`high`,n.drawImage(i,0,0,O_,O_);for(let t of e.puddles){n.beginPath();for(let e=0;e<=14;e++){let r=e/14*R,i=t.r*(1+(Ve(e%14*13+Math.floor(t.x),Math.floor(t.z))-.5)*.28),a=M_(t.x+Math.cos(r)*i),o=M_(t.z+Math.sin(r)*i);e===0?n.moveTo(a,o):n.lineTo(a,o)}if(n.fillStyle=`#6f93a8`,n.fill(),n.strokeStyle=`rgba(40, 62, 82, 0.85)`,n.lineWidth=1.3,n.stroke(),t.r>8){n.strokeStyle=`rgba(220, 235, 240, 0.5)`,n.lineWidth=1;for(let e=0;e<4;e++){let r=M_(t.x-6+e*3.5),i=M_(t.z-4+e*5%9);n.beginPath(),n.moveTo(r,i),n.quadraticCurveTo(r+5,i-3,r+10,i),n.stroke()}}}let l=[];for(let t of e.obstacles)(t.kind===`pine`||t.kind===`oak`||t.kind===`birch`||t.kind===`rock`)&&l.push({x:t.x,z:t.z,kind:t.kind,s:t.scale});for(let e=0;e<1500;e++){let t=Ve(e,77)*R,n=183+Ve(e,91)*(k_-180);l.push({x:Math.cos(t)*n,z:Math.sin(t)*n,kind:`pine`,s:1.5+Ve(e,3)})}l.sort((e,t)=>e.z-t.z),n.lineWidth=.9,n.lineJoin=`round`;for(let e of l){let t=M_(e.x),r=M_(e.z),i=2.6+e.s*1.5;e.kind===`pine`?(n.beginPath(),n.moveTo(t-i*.62,r+i*.45),n.lineTo(t,r-i*1.15),n.lineTo(t+i*.62,r+i*.45),n.closePath(),n.fillStyle=`#3f6245`,n.fill(),n.strokeStyle=`rgba(24, 38, 26, 0.9)`,n.stroke()):e.kind===`oak`?(n.beginPath(),n.arc(t,r-i*.3,i*.82,0,R),n.fillStyle=`#58793f`,n.fill(),n.strokeStyle=`rgba(30, 44, 22, 0.9)`,n.stroke()):e.kind===`birch`?(n.strokeStyle=`#efe8d6`,n.lineWidth=1.3,n.beginPath(),n.moveTo(t,r+i*.5),n.lineTo(t,r-i*.3),n.stroke(),n.lineWidth=.9,n.beginPath(),n.ellipse(t,r-i*.55,i*.55,i*.72,0,0,R),n.fillStyle=`#9db45a`,n.fill(),n.strokeStyle=`rgba(52, 66, 26, 0.85)`,n.stroke()):(n.beginPath(),n.moveTo(t-i*.6,r+i*.3),n.lineTo(t-i*.2,r-i*.45),n.lineTo(t+i*.45,r-i*.3),n.lineTo(t+i*.65,r+i*.3),n.closePath(),n.fillStyle=`#8d8a96`,n.fill(),n.strokeStyle=`rgba(40, 38, 50, 0.85)`,n.stroke())}return n.restore(),t}updateFog(e){let t=e.fog;if(this.fogOwner===t&&this.fogVersion===t.version&&this.base)return;this.fogOwner=t,this.fogVersion=t.version,this.base||=this.buildBase();let n=this.fogData.data,r=t.cells;for(let e=0;e<r.length;e++)n[e*4+3]=r[e];this.fogCtx.putImageData(this.fogData,0,0);let i=this.revealedCtx;i.globalCompositeOperation=`source-over`,i.clearRect(0,0,O_,O_),i.imageSmoothingEnabled=!0,i.imageSmoothingQuality=`high`;let a=440*A_;i.drawImage(this.fogCanvas,M_(-220),M_(-220),a,a),i.globalCompositeOperation=`source-in`,i.drawImage(this.base,0,0)}landmark(e,t,n,r,i){switch(e.save(),e.translate(n,r),e.scale(i,i),e.lineWidth=1.6,e.strokeStyle=j_,e.lineJoin=`round`,t){case`circle`:e.fillStyle=`#a9a6b4`;for(let t=0;t<7;t++){let n=t/7*R;e.beginPath(),e.rect(Math.cos(n)*9-2,Math.sin(n)*9-3.5,4,7),e.fill(),e.stroke()}break;case`oak`:e.fillStyle=`#6a4a2a`,e.fillRect(-2.2,0,4.4,10),e.strokeRect(-2.2,0,4.4,10),e.fillStyle=`#4f7a38`,e.beginPath(),e.arc(-5,-2,6.5,0,R),e.arc(5,-2,6.5,0,R),e.arc(0,-8,7.5,0,R),e.fill(),e.beginPath(),e.arc(0,-4,12.5,Math.PI*.95,Math.PI*2.05),e.stroke();break;case`hut`:e.beginPath(),e.moveTo(0,0),e.lineTo(0,9),e.moveTo(-4,11),e.lineTo(0,8),e.lineTo(4,11),e.stroke(),e.fillStyle=`#8a6238`,e.fillRect(-7,-9,14,9),e.strokeRect(-7,-9,14,9),e.fillStyle=`#5a3d26`,e.beginPath(),e.moveTo(-10,-9),e.lineTo(0,-18),e.lineTo(10,-9),e.closePath(),e.fill(),e.stroke();break;case`idol`:e.fillStyle=`#b9b3a4`,e.fillRect(-3.5,-14,7,24),e.strokeRect(-3.5,-14,7,24),e.fillRect(-5.5,-17,11,4.5),e.strokeRect(-5.5,-17,11,4.5),e.beginPath(),e.moveTo(-3.5,-6),e.lineTo(3.5,-6),e.moveTo(-3.5,2),e.lineTo(3.5,2),e.stroke();break;case`barrow`:e.fillStyle=`#8fa35c`,e.beginPath(),e.moveTo(-13,6),e.quadraticCurveTo(0,-14,13,6),e.closePath(),e.fill(),e.stroke(),e.fillStyle=`#a9a6b4`,e.fillRect(-2,-12,4,8),e.strokeRect(-2,-12,4,8)}e.restore()}label(e,t,n,r,i){e.font=`italic ${Math.round(14*i)}px Georgia, serif`,e.textAlign=`center`,e.lineWidth=3.5*i,e.strokeStyle=`rgba(236, 222, 186, 0.9)`,e.strokeText(t,n,r),e.fillStyle=j_,e.fillText(t,n,r)}draw(e,t,n){if(this.clock+=n,this.size===0){let e=Math.round(Math.min(window.innerHeight*.74,window.innerWidth*.8,860)),t=Math.min(window.devicePixelRatio||1,2);this.size=Math.round(e*t),this.canvas.width=this.size,this.canvas.height=this.size,this.canvas.style.width=`${e}px`,this.canvas.style.height=`${e}px`}this.unknown||=this.buildUnknown(),this.updateFog(e);let r=this.ctx,i=this.size,a=i/O_,o=i/760;r.clearRect(0,0,i,i),r.imageSmoothingQuality=`high`,r.drawImage(this.unknown,0,0,i,i),r.drawImage(this.revealed,0,0,i,i);let s=e.fog,c=this.map,l=e=>M_(e)*a;r.strokeStyle=j_,r.lineWidth=3*o,r.beginPath(),r.arc(i/2,i/2,i/2-3*o,0,R),r.stroke(),r.lineWidth=1*o,r.beginPath(),r.arc(i/2,i/2,i/2-8*o,0,R),r.stroke();for(let e of c.bonfires){if(!s.seen(e.x,e.z))continue;let t=l(e.x),n=l(e.z);r.fillStyle=`#e8792a`,r.strokeStyle=j_,r.lineWidth=1.2*o,r.beginPath(),r.moveTo(t,n-7*o),r.quadraticCurveTo(t+6*o,n,t,n+4*o),r.quadraticCurveTo(t-6*o,n,t,n-7*o),r.fill(),r.stroke()}for(let t of e.shrines){if(!s.seen(t.x,t.z))continue;let e=l(t.x),n=l(t.z);r.fillStyle=t.used?`#9a8f7c`:P_[t.kind],r.strokeStyle=j_,r.lineWidth=1.4*o,r.beginPath(),r.moveTo(e-5*o,n-2*o),r.lineTo(e,n-9*o),r.lineTo(e+5*o,n-2*o),r.lineTo(e+3.2*o,n-2*o),r.lineTo(e+3.2*o,n+6*o),r.lineTo(e-3.2*o,n+6*o),r.lineTo(e-3.2*o,n-2*o),r.closePath(),r.fill(),r.stroke()}for(let t of e.chests){if(t.opened||!t.gift&&!s.seen(t.x,t.z))continue;let e=l(t.x),n=l(t.z);t.gift&&(r.fillStyle=`rgba(63, 208, 168, ${.3+Math.sin(this.clock*4)*.12})`,r.beginPath(),r.arc(e,n,11*o,0,R),r.fill());let i=t.rich?1.35*o:o;t.rich&&(r.fillStyle=`rgba(255, 200, 60, ${.3+Math.sin(this.clock*3)*.1})`,r.beginPath(),r.arc(e,n,12*o,0,R),r.fill()),r.fillStyle=t.gift?`#3fd0a8`:t.rich?`#a8242e`:t.free?`#ffd040`:`#b9772f`,r.strokeStyle=j_,r.lineWidth=1.3*o,r.beginPath(),r.rect(e-5*i,n-3.5*i,10*i,7.5*i),r.fill(),r.stroke(),t.rich&&(r.strokeStyle=`#ffd24a`,r.lineWidth=1.6*o),r.beginPath(),r.moveTo(e-5*i,n-.5*i),r.lineTo(e+5*i,n-.5*i),r.stroke()}{let t=e.pickups;for(let e=0;e<t.n;e++){if(!t.alive[e]||t.kind[e]!==z.Haste||t.mag[e])continue;let n=l(t.x[e]),i=l(t.z[e]);r.fillStyle=`rgba(70, 150, 240, ${.3+Math.sin(this.clock*4)*.12})`,r.beginPath(),r.arc(n,i,11*o,0,R),r.fill(),r.fillStyle=`#ffe45a`,r.strokeStyle=j_,r.lineWidth=1.2*o,r.beginPath(),r.moveTo(n+2.5*o,i-7*o),r.lineTo(n-4.5*o,i+1*o),r.lineTo(n-.5*o,i+1*o),r.lineTo(n-2.5*o,i+7*o),r.lineTo(n+4.5*o,i-1.5*o),r.lineTo(n+.5*o,i-1.5*o),r.closePath(),r.fill(),r.stroke()}}{let t=e.pickups;for(let e=0;e<t.n;e++){if(!t.alive[e]||t.kind[e]!==z.Magnet||t.mag[e])continue;let n=l(t.x[e]),i=l(t.z[e]);r.fillStyle=`rgba(216, 38, 42, ${.26+Math.sin(this.clock*4)*.12})`,r.beginPath(),r.arc(n,i,11*o,0,R),r.fill();for(let[e,t]of[[j_,5.6],[`#d8262a`,3.2]])r.strokeStyle=e,r.lineWidth=t*o,r.beginPath(),r.moveTo(n-4*o,i-6*o),r.lineTo(n-4*o,i+1*o),r.arc(n,i+1*o,4*o,Math.PI,0,!0),r.lineTo(n+4*o,i-6*o),r.stroke();r.strokeStyle=`#f2f4f6`,r.lineWidth=3.2*o,r.beginPath(),r.moveTo(n-4*o,i-5.2*o),r.lineTo(n-4*o,i-2.6*o),r.moveTo(n+4*o,i-5.2*o),r.lineTo(n+4*o,i-2.6*o),r.stroke()}}let u=0;c.landmarks.forEach((t,n)=>{if(!e.landmarksFound[n]&&!s.seen(t.x,t.z))return;u++;let i=l(t.x),a=l(t.z);this.landmark(r,t.kind,i,a,o),this.label(r,t.name,i,a+(t.kind===`lake`?5:30)*o,o)});let d=e.enemies,f=e.bossIdx;if(f>=0&&d.alive[f]){let e=l(d.x[f]),t=l(d.z[f]),n=.5+.5*Math.sin(this.clock*5);r.strokeStyle=`rgba(170, 24, 20, ${.75-n*.45})`,r.lineWidth=2*o,r.beginPath(),r.arc(e,t,(9+n*7)*o,0,R),r.stroke(),r.fillStyle=`#b3261e`,r.strokeStyle=j_,r.lineWidth=1.4*o,r.beginPath(),r.arc(e,t,6*o,0,R),r.fill(),r.stroke()}let p=e.portal;if(p&&!p.used){let e=l(p.x),t=l(p.z),n=.5+.5*Math.sin(this.clock*4);r.strokeStyle=`rgba(60, 220, 110, ${.8-n*.4})`,r.lineWidth=2*o,r.beginPath(),r.arc(e,t,(8+n*6)*o,0,R),r.stroke(),r.fillStyle=`#3ad870`,r.strokeStyle=j_,r.lineWidth=1.4*o,r.beginPath(),r.arc(e,t,5*o,0,R),r.fill(),r.stroke()}let m=e.player,h=l(m.x),g=l(m.z),_=Math.atan2(-Math.cos(t),-Math.sin(t)),v=r.createRadialGradient(h,g,0,h,g,46*o);v.addColorStop(0,`rgba(255, 244, 200, 0.55)`),v.addColorStop(1,`rgba(255, 244, 200, 0)`),r.fillStyle=v,r.beginPath(),r.moveTo(h,g),r.arc(h,g,46*o,_-.5,_+.5),r.closePath(),r.fill(),r.save(),r.translate(h,g),r.rotate(_),r.fillStyle=`#c8281e`,r.strokeStyle=`#fff3d6`,r.lineWidth=2*o,r.lineJoin=`round`,r.beginPath(),r.moveTo(11*o,0),r.lineTo(-7*o,7*o),r.lineTo(-3.5*o,0),r.lineTo(-7*o,-7*o),r.closePath(),r.stroke(),r.fill(),r.restore();let y=i-46*o,b=50*o;r.fillStyle=j_,r.beginPath(),r.moveTo(y,b-22*o),r.lineTo(y+7*o,b),r.lineTo(y,b-5*o),r.lineTo(y-7*o,b),r.closePath(),r.fill(),r.font=`bold ${Math.round(15*o)}px Georgia, serif`,r.textAlign=`center`,r.fillText(`N`,y,b+17*o);let x=`Odkryto ${Math.round(s.coverage(180)*100)}% boru  •  miejsca: ${u}/${c.landmarks.length}`;this.info.dataset.t!==x&&(this.info.dataset.t=x,this.info.innerHTML=`<span><i class="mk mk-hero"></i>ty</span><span><i class="mk mk-shrine"></i>kapliczka</span><span><i class="mk mk-chest"></i>skrzynia</span><span><i class="mk mk-rich"></i>bogata skrzynia</span><span><i class="mk mk-gift"></i>dar boru</span><span><i class="mk mk-magnet"></i>magnes</span><span><i class="mk mk-haste"></i>szał bojowy</span><span><i class="mk mk-fire"></i>ognisko</span><span><i class="mk mk-boss"></i>boss</span><span><i class="mk mk-portal"></i>portal</span><b>${x}</b>`)}},I_={sickle:`<path d="M5 20l5-5" stroke-width="2.6" stroke-linecap="round" fill="none" stroke="currentColor"/><path d="M9.5 15.5C5 10 8 3 16 3c3 0 5 1.5 5.5 3-2-1-4.5-1-6.5 0-3.5 1.800-4.500 6-2.500 9.500z"/>`,flame:`<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 2.500-7 1.500 1 2 2.500 2 4 1.500-2 2-5 1.500-9z"/><path d="M12 13c1 1.500 2.500 2.500 2.500 4.500a2.500 2.500 0 0 1-5 0c0-1.500 1.500-2.500 2.500-4.500z" fill="#fff" opacity=".45"/>`,bolt:`<path d="M14 1L4 14h6l-2 9 11-14h-6.500z"/>`,axe:`<path d="M6 22L15 5" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M12 3c4-2 8 0 10 4-3 0-5 2-6 5l-5-3c1-2 1-4 1-6z"/>`,wreath:`<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.200"/><g><circle cx="12" cy="4.500" r="2.200"/><circle cx="19" cy="9" r="2"/><circle cx="18" cy="17" r="2.200"/><circle cx="12" cy="19.500" r="2"/><circle cx="6" cy="17" r="2.200"/><circle cx="5" cy="9" r="2"/></g>`,stone:`<path d="M4 14l3-8 7-3 6 5 1 8-6 5-8-1z"/><path d="M7 6l5 5 8-3M12 11l-1 9" stroke="#000" stroke-opacity=".25" fill="none"/>`,raven:`<path d="M2 9l5-1c2-4 7-5 10-2l5 1-4 2c0 5-4 9-10 9l-4 3 1-5c-2-2-3-4-3-7z"/><circle cx="15" cy="8.500" r="1" fill="#000" opacity=".5"/>`,frost:`<g stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><path d="M12 2v20M3.300 7l17.400 10M20.700 7L3.300 17"/><path d="M12 5.500l-2.500-2M12 5.500l2.500-2M12 18.500l-2.500 2M12 18.500l2.500 2"/></g>`,spear:`<path d="M3 21L16 8" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" fill="none"/><path d="M14 6l8-4-4 8z"/>`,bow:`<path d="M6 3c8 2 12 8 12 18" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round"/><path d="M6 3l12 18" fill="none" stroke="currentColor" stroke-width="1" opacity=".6"/><path d="M3 15L15 8" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" fill="none"/><path d="M13.500 6l5 0.500-3 4z"/>`,pot:`<path d="M8 3h8v3c3 2 4 5 4 8 0 4-3 7-8 7s-8-3-8-7c0-3 1-6 4-8z"/><path d="M8 6h8" stroke="#000" stroke-opacity=".3"/>`,belt:`<rect x="1" y="8" width="22" height="8" rx="2"/><rect x="9" y="6" width="6" height="12" rx="1.500" fill="#fff" opacity=".5"/><rect x="11" y="8.500" width="2" height="7" fill="#000" opacity=".35"/>`,flint:`<path d="M3 20l6-9 6 2 5 7z"/><path d="M14 2l1.500 4L20 5l-3 3.500L19 13l-4-2-3 3 .500-4.500L9 7l4-.500z" fill="#fff" opacity=".7"/>`,amulet:`<path d="M5 2c1 5 4 7 7 8 3-1 6-3 7-8" fill="none" stroke="currentColor" stroke-width="1.800"/><circle cx="12" cy="15.500" r="6"/><path d="M12 11v9M8 15.500h8" stroke="#000" stroke-opacity=".3"/>`,boot:`<path d="M7 2h7v11l7 3v5H4v-6z"/><path d="M4 18h17" stroke="#000" stroke-opacity=".3"/>`,heart:`<path d="M12 21C4 15 2 11 2 7.500 2 4.500 4.500 3 7 3c2 0 4 1 5 3 1-2 3-3 5-3 2.500 0 5 1.500 5 4.500 0 3.500-2 7.500-10 13.500z"/>`,honey:`<path d="M6 8h12l1 12H5z"/><rect x="5" y="4" width="14" height="4" rx="1.500"/><path d="M9 8v5a1.500 1.500 0 0 0 3 0V8" fill="#fff" opacity=".5"/>`,magnet:`<path d="M4 3h5v10a3 3 0 0 0 6 0V3h5v10a8 8 0 0 1-16 0z"/><path d="M4 7h5M15 7h5" stroke="#fff" stroke-width="2" opacity=".7"/>`,horseshoe:`<path d="M5 21V10a7 7 0 0 1 14 0v11h-4V10a3 3 0 0 0-6 0v11z"/><g fill="#000" opacity=".35"><circle cx="7" cy="12" r="1"/><circle cx="17" cy="12" r="1"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/></g>`,shield:`<path d="M12 2l9 3v7c0 5-4 8.500-9 10-5-1.500-9-5-9-10V5z"/><path d="M12 5v14M5 10h14" stroke="#000" stroke-opacity=".25"/>`,pouch:`<path d="M8 3h8l-2 4c4 2 6 5 6 9 0 3-2 5-8 5s-8-2-8-5c0-4 2-7 6-9z"/><path d="M8 7h8" stroke="#000" stroke-opacity=".4" stroke-width="1.500"/>`,feather:`<path d="M20 3c-9 0-14 5-15 13l-2 5 5-2c8-1 12-7 12-16z"/><path d="M4 20L16 7" stroke="#000" stroke-opacity=".3"/>`,book:`<path d="M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 5v15" stroke="#000" stroke-opacity=".35"/>`,coin:`<circle cx="12" cy="12" r="9.500"/><circle cx="12" cy="12" r="6" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/><path d="M12 8v8M9.500 10h5M9.500 14h5" stroke="#000" stroke-opacity=".35" stroke-width="1.500"/>`,bread:`<path d="M2 14c0-5 4-8 10-8s10 3 10 8v2c0 1.500-1 2-2 2H4c-1 0-2-.500-2-2z"/><path d="M8 8l2 4M13 7.500l2 4" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/>`,dice:`<rect x="3" y="3" width="18" height="18" rx="3.500"/><g fill="#000" opacity=".45"><circle cx="8" cy="8" r="1.600"/><circle cx="16" cy="8" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="8" cy="16" r="1.600"/><circle cx="16" cy="16" r="1.600"/></g>`,water:`<path d="M12 2c4 6 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7 7-13z"/><path d="M9 15a3 3 0 0 0 3 3" stroke="#fff" stroke-opacity=".6" fill="none" stroke-width="1.500"/>`,skull:`<path d="M12 2c5 0 9 3.500 9 8.500 0 3-1.500 5-3.500 6.500V21h-11v-4C4.500 15.500 3 13.500 3 10.500 3 5.500 7 2 12 2z"/><g fill="#000" opacity=".55"><circle cx="8.500" cy="11" r="2.200"/><circle cx="15.500" cy="11" r="2.200"/><path d="M12 14l-1.300 3h2.600z"/></g>`,chest:`<path d="M3 10c0-3.500 2-6 5-6h8c3 0 5 2.500 5 6v10H3z"/><path d="M3 11h18" stroke="#000" stroke-opacity=".4" stroke-width="1.500"/><rect x="10.500" y="9" width="3" height="5" rx="1" fill="#fff" opacity=".6"/>`,lock:`<rect x="4" y="10" width="16" height="12" rx="2.500"/><path d="M7.500 10V7a4.500 4.500 0 0 1 9 0v3" fill="none" stroke="currentColor" stroke-width="2.400"/>`,star:`<path d="M12 2l3 6.500 7 .800-5.200 4.800 1.500 7L12 17.500 5.700 21l1.500-7L2 9.300l7-.800z"/>`,home:`<path d="M2 12L12 3l10 9h-3v9h-5v-6h-4v6H5v-9z"/>`,gear:`<path d="M10 2h4l.600 3 2.600 1.500 2.900-1 2 3.500-2.300 2v3l2.300 2-2 3.500-2.900-1-2.600 1.500-.600 3h-4l-.600-3-2.600-1.500-2.900 1-2-3.500 2.300-2v-3L1.900 9l2-3.500 2.900 1L9.400 5z"/><circle cx="12" cy="12" r="3.200" fill="#000" opacity=".4"/>`,eye:`<path d="M1 12c3-5 7-7.500 11-7.500S20 7 23 12c-3 5-7 7.500-11 7.500S4 17 1 12z"/><circle cx="12" cy="12" r="4.200" fill="#000" opacity=".45"/><circle cx="13.300" cy="10.700" r="1.300" fill="#fff" opacity=".8"/>`,fang:`<path d="M4 3h16c0 6-2 10-4 13l-1 5-3-6-3 6-1-5C6 13 4 9 4 3z"/><path d="M12 4v9" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/>`,thorn:`<path d="M11 22V9" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" fill="none"/><path d="M11 17l-6-3 6 0zM11 12l6-3-6 0zM11 8l-4-5 4 2zM11 8l5-4-2 4z"/><circle cx="17" cy="15" r="2.200"/>`,cloud:`<path d="M6 19a4.500 4.500 0 0 1-.500-9 6.500 6.500 0 0 1 12.500-1.500A5 5 0 0 1 18 19z"/><path d="M4 14h9M7 16.500h11" stroke="#fff" stroke-opacity=".5" stroke-width="1.300"/>`,palisade:`<path d="M3 22V7l2-3 2 3v15zM9.500 22V5l2-3 2 3v17zM16 22V7l2-3 2 3v15z"/><path d="M2 12h20M2 17h20" stroke="#000" stroke-opacity=".35" stroke-width="1.600"/>`,hourglass:`<path d="M5 2h14v2c0 4-4 6-5 8 1 2 5 4 5 8v2H5v-2c0-4 4-6 5-8-1-2-5-4-5-8z"/><path d="M8 19c1-2 3-3 4-4 1 1 3 2 4 4z" fill="#fff" opacity=".55"/>`,wind:`<g fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M2 8h12a3 3 0 1 0-3-3"/><path d="M2 13h17a3 3 0 1 1-3 3"/><path d="M4 18h7"/></g>`,tusk:`<path d="M3 21c0-9 5-16 14-18-4 4-6 8-6 12 2-2 5-3 9-3-3 5-9 8-17 9z"/><path d="M6 18c2-4 5-8 9-11" stroke="#000" stroke-opacity=".25" fill="none"/>`,horn:`<path d="M3 20c2-1 4-1 6-3 4-4 6-9 7-14 1 0 2 1 2 2-1 6-3 11-7 15-2 2-5 3-8 3z"/><path d="M14 7l2 1M12 11l2 1M10 14l2 1" stroke="#000" stroke-opacity=".3" stroke-width="1.300"/>`,helmet:`<path d="M3 16c0-6 4-11 9-11s9 5 9 11z"/><path d="M12 2v3M2 16h20v3H2z"/><path d="M11 9h2v7h-2z" fill="#000" opacity=".3"/>`,honeycomb:`<path d="M7 3l4 2.300v4.600L7 12.200 3 9.900V5.300zM17 3l4 2.300v4.600l-4 2.300-4-2.300V5.300zM12 11.800l4 2.300v4.600l-4 2.300-4-2.300v-4.600z"/>`,beads:`<g><circle cx="12" cy="4" r="2.300"/><circle cx="18" cy="7" r="2.300"/><circle cx="19.500" cy="13" r="2.300"/><circle cx="16" cy="18" r="2.300"/><circle cx="8" cy="18" r="2.300"/><circle cx="4.500" cy="13" r="2.300"/><circle cx="6" cy="7" r="2.300"/></g><path d="M12 20.500v2.500" stroke="currentColor" stroke-width="2"/>`,claw:`<path d="M4 21c1-6 2-12 6-17 0 5-1 10-3 17zM10 21c1-6 3-11 7-15-1 5-2 10-4 15zM15 21c2-5 4-8 7-10-1 4-2 7-4 10z"/>`,pelt:`<path d="M6 2l2 3h8l2-3 1 5c2 1 3 3 2 5l-2 1 1 9-4-2-4 3-4-3-4 2 1-9-2-1c-1-2 0-4 2-5z"/><circle cx="9.500" cy="9" r="1" fill="#000" opacity=".4"/><circle cx="14.500" cy="9" r="1" fill="#000" opacity=".4"/>`,cup:`<path d="M4 3h16c0 6-3 10-6 11v4h3v3H7v-3h3v-4C7 13 4 9 4 3z"/><path d="M7 6h10" stroke="#fff" stroke-opacity=".45" stroke-width="1.500"/>`,moss:`<path d="M2 20c1-4 3-6 6-6 1-3 3-5 6-4 2-2 6-1 7 2 1 2 1 5 1 8z"/><g fill="#000" opacity=".25"><circle cx="8" cy="18" r="1"/><circle cx="13" cy="15" r="1"/><circle cx="17" cy="17" r="1"/></g>`,mirror:`<ellipse cx="12" cy="9" rx="6.500" ry="7.500"/><ellipse cx="12" cy="9" rx="4.300" ry="5.300" fill="#fff" opacity=".45"/><path d="M11 16.500h2V22h-2z"/>`,anvil:`<path d="M2 6h15c2 0 4 1 5 3h-6l-1 3c0 1 1 2 3 2v3H6v-3c2 0 3-1 3-2L8 9H4C3 9 2 8 2 6z"/><path d="M5 18h14v3H5z"/>`,wand:`<path d="M3 21L15 9" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M17 2l1.200 3 3 1.200-3 1.200L17 10.400l-1.200-3-3-1.200 3-1.200z"/><circle cx="20.500" cy="13" r="1"/><circle cx="11" cy="3.500" r="1"/>`,bee:`<ellipse cx="12" cy="13.500" rx="5" ry="6.500"/><path d="M7.500 11h9M7 14.500h10M8.500 18h7" stroke="#000" stroke-opacity=".45" stroke-width="1.600"/><path d="M9 8C6 3 2 4 3 8c.500 2 3 2.500 5 1.500zM15 8c3-5 7-4 6 0-.500 2-3 2.500-5 1.500z" opacity=".6"/>`,trap:`<path d="M2 15a10 7 0 0 1 20 0z"/><path d="M4 15l1.500-4 2 4 2-5 2.500 5 2.500-5 2 5 2-4 1.500 4" fill="#000" opacity=".4"/><path d="M2 17h20v3H2z"/>`,broom:`<path d="M21 2L11 12" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M12.500 9.500l2 2L7 22l-5-1-1-5z"/><path d="M5 20l5-6M2.500 17l5-4" stroke="#000" stroke-opacity=".35" fill="none"/>`,boomerang:`<path d="M3 20C3 9 9 3 20 3c1.500 0 2 2 .500 2.500C13 7.500 8 13 5.500 20.500 5 22 3 21.500 3 20z"/>`,whirl:`<g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M3 5h18" stroke-width="2.600"/><path d="M5.500 9.500h13" stroke-width="2.400"/><path d="M8 14h9" stroke-width="2.200"/><path d="M10 18h5" stroke-width="2"/><path d="M11.500 21.500h2" stroke-width="1.800"/></g>`,spiral:`<path d="M12 12a2 2 0 1 1 2 2 4.500 4.500 0 1 1-4.500-4.500 7 7 0 1 1 7 7 9.500 9.500 0 0 1-9.500 4" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/>`,sabre:`<path d="M4 20C6 11 11 5 21 2c-3 8-8 13-15 17z"/><path d="M2 18l5 4M3.500 21.500l2-2" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" fill="none"/>`,buckler:`<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.500" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.500"/><circle cx="12" cy="12" r="3" fill="#fff" opacity=".55"/>`,spindle:`<path d="M12 1v22" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" fill="none"/><path d="M12 5c4 2 5 5 5 7s-1 5-5 7c-4-2-5-5-5-7s1-5 5-7z"/><path d="M7.500 10l9 3M7.500 13.500l8.500 2.500M8.500 7.500l8 2.500" stroke="#000" stroke-opacity=".35" fill="none"/>`,tooth:`<path d="M6 2h12c1 5-1 9-2.500 12L12 22l-3.500-8C7 11 5 7 6 2z"/><path d="M9 4c0 4 1 7 3 10" stroke="#fff" stroke-opacity=".5" fill="none" stroke-width="1.500"/>`,scythe:`<path d="M6 22L15 3" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" fill="none"/><path d="M15 3C9 1 4 3 1 8c5-2.500 9-2 13 .500z"/>`,sword:`<path d="M20 2l2 0 0 2-11 11-2-2z"/><path d="M6 12l6 6-2 2-2-2-4 4-2-2 4-4-2-2z"/>`};function Q(e,t,n=24){let r=I_[e]??I_.star;return`<svg class="icon" viewBox="0 0 24 24" width="${n}" height="${n}" fill="currentColor"${t?` style="color:${t}"`:``} aria-hidden="true">${r}</svg>`}function L_(e){return`#${e.toString(16).padStart(6,`0`)}`}var R_=e=>`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(Math.floor(e%60)).padStart(2,`0`)}`,z_={orbit:`Krążące ostrza`,bolt:`Pocisk`,lightning:`Piorun`,sweep:`Zamach`,aura:`Aura`,bounce:`Rykoszet`,summon:`Przywołanie`,cone:`Stożek`,lob:`Rzut ze strefą`,homing:`Pociski naprowadzane`,trap:`Pułapki`,trail:`Ognisty ślad`,boomerang:`Powracający rzut`,wander:`Wędrujące wiry`,vortex:`Wir wciągający`,guard:`Blok i kontra`,tether:`Nić`};function B_(e,t){let n=t?Ur(e,t):null;if(!t||!n)return``;let r=t.cond.type,i=e=>r===`survive`||r===`unhurt`||r===`unhurtStreak`?R_(e):r===`speed`?`+${Math.round(e*100)}%`:Math.floor(e).toLocaleString(`pl-PL`);return`<div class="progress"><div class="dmg-bar"><i style="width:${Math.round(n.have/Math.max(1e-9,n.need)*100)}%"></i></div><b>${i(n.have)} / ${i(n.need)}</b></div>`}function $(e,t,n){let r=document.createElement(e);return r.className=t,n.appendChild(r),r}var V_=class{actions;screen=`none`;panel;hud;xpFill;xpLevel;timer;hpFill;hpText;shieldFill;weapons;passives;items;kills;gold;dashFill;prompt;banner;hint;hurt;boss;bossName;bossFill;toasts;surge;surgeText;surgeFill;haste;hasteText;hasteFill;cache={};bannerT=0;bannerQueue=[];optionsBack=`menu`;selectedCharacter=`wojmir`;confirmReset=!1;save;constructor(e,t,n){this.actions=t,this.save=n,this.selectedCharacter=n.character,this.hud=$(`div`,`hud hidden`,e);let r=$(`div`,`xp`,this.hud);this.xpFill=$(`div`,`xp-fill`,r),this.xpLevel=$(`div`,`xp-level`,r),this.timer=$(`div`,`timer`,this.hud),this.surge=$(`div`,`surge hidden`,this.hud),this.surgeText=$(`div`,`surge-text`,this.surge),this.surgeFill=$(`div`,`surge-fill`,$(`div`,`surge-bar`,this.surge)),this.boss=$(`div`,`boss hidden`,this.hud),this.bossName=$(`div`,`boss-name`,this.boss),this.bossFill=$(`div`,`boss-fill`,$(`div`,`boss-bar`,this.boss));let i=$(`div`,`tl`,this.hud),a=$(`div`,`hp`,i);this.hpFill=$(`div`,`hp-fill`,a),this.shieldFill=$(`div`,`shield-fill`,a),this.hpText=$(`span`,`hp-text`,a),this.weapons=$(`div`,`slots`,i),this.passives=$(`div`,`slots small`,i),this.items=$(`div`,`slots small items`,i);let o=$(`div`,`tr`,this.hud);this.kills=$(`div`,`stat`,o),this.gold=$(`div`,`stat`,o);let s=$(`div`,`dash`,this.hud);this.dashFill=$(`div`,`dash-fill`,s),$(`span`,``,s).textContent=`ZRYW`,this.haste=$(`div`,`haste hidden`,this.hud),this.hasteText=$(`span`,``,this.haste),this.hasteFill=$(`i`,``,this.haste),this.prompt=$(`div`,`prompt hidden`,this.hud),this.banner=$(`div`,`banner hidden`,this.hud),this.hint=$(`div`,`hint hidden`,this.hud),this.hint.textContent=`Kliknij, aby obracać kamerę myszą  •  strzałki ← → też działają  •  Tab: mapa`,this.hurt=$(`div`,`hurt`,e),this.toasts=$(`div`,`toasts`,e),this.panel=$(`div`,`panel hidden`,e),this.panel.addEventListener(`click`,e=>this.onClick(e)),this.panel.addEventListener(`input`,e=>this.onInput(e)),this.panel.addEventListener(`mouseover`,e=>{let t=e.target.closest(`[data-act]`);t&&t!==this.lastHover&&(this.lastHover=t,this.actions.uiSound(`hover`))})}lastHover=null;openedAt=0;onClick(e){let t=e.target.closest(`[data-act]`);if(!t||t.classList.contains(`disabled`))return;let n=t.dataset.act,r=t.dataset.arg??``;this.run(n,r)}run(e,t){let n=this.actions;switch(e){case`play`:n.uiSound(`click`),this.showCharacters();break;case`shop`:n.uiSound(`click`),this.showShop();break;case`achievements`:n.uiSound(`click`),this.showAchievements();break;case`arsenal`:n.uiSound(`click`),this.showArsenal();break;case`options`:n.uiSound(`click`),this.showOptions(this.screen===`pause`?`pause`:`menu`);break;case`back`:n.uiSound(`click`),this.screen===`options`&&this.optionsBack===`pause`?this.showPause():this.showMenu();break;case`pick`:n.uiSound(`click`),this.selectedCharacter=t,this.showCharacters();break;case`start`:n.uiSound(`click`),n.start(this.selectedCharacter);break;case`buy`:n.buy(t);break;case`choose`:n.choose(Number(t));break;case`reroll`:n.reroll();break;case`pool`:n.toggle(t.slice(0,1),t.slice(2));break;case`banish`:n.banish(Number(t));break;case`cancel`:n.cancelChoice();break;case`resume`:n.uiSound(`click`),n.resume();break;case`restart`:n.uiSound(`click`),n.restart();break;case`endrun`:n.uiSound(`click`),n.endRun();break;case`menu`:n.uiSound(`click`),n.toMenu();break;case`endless`:n.uiSound(`click`),n.endless();break;case`toggle`:n.uiSound(`click`),n.option(t,!this.save.options[t]),this.showOptions(this.optionsBack);break;case`quality`:n.uiSound(`click`),n.option(`quality`,Number(t)),this.showOptions(this.optionsBack);break;case`reset`:this.confirmReset?(this.confirmReset=!1,n.resetSave(),this.toast(`Postęp został zresetowany.`),this.showOptions(this.optionsBack)):(this.confirmReset=!0,n.uiSound(`deny`),this.showOptions(this.optionsBack))}}onInput(e){let t=e.target,n=t.dataset.opt;if(!n)return;let r=Number(t.value);this.actions.option(n,r);let i=t.parentElement?.querySelector(`.val`);i&&(i.textContent=n===`sensitivity`?`${r.toFixed(1)}×`:`${Math.round(r*100)}%`)}key(e){let t=e.startsWith(`Digit`)?Number(e.slice(5)):e.startsWith(`Numpad`)?Number(e.slice(6)):NaN;if(this.screen===`choice`){let n=this.panel.querySelectorAll(`.card[data-act="choose"]`).length;return t>=1&&t<=n?(this.actions.choose(t-1),!0):(e===`Enter`||e===`Space`)&&(n===1||this.panel.querySelector(`button[data-act="choose"]`))?(this.actions.choose(0),!0):e===`KeyR`?(this.actions.reroll(),!0):e===`Escape`&&this.panel.querySelector(`[data-act="cancel"]`)?(this.actions.cancelChoice(),!0):!1}if(e===`Escape`){if(this.screen===`pause`)return this.actions.resume(),!0;if(this.screen===`characters`||this.screen===`shop`||this.screen===`achievements`||this.screen===`arsenal`||this.screen===`options`)return this.run(`back`,``),!0}if(e===`Enter`||e===`Space`){if(this.screen===`menu`)return this.run(`play`,``),!0;if(this.screen===`characters`)return this.run(`start`,``),!0;if(this.screen===`end`&&e===`Enter`&&performance.now()-this.openedAt>700)return this.actions.restart(),!0}if(this.screen===`characters`&&(e===`ArrowLeft`||e===`ArrowRight`||e===`KeyA`||e===`KeyD`)){let t=m.filter(e=>wr(this.save,e.unlock)),n=t[(t.findIndex(e=>e.id===this.selectedCharacter)+(e===`ArrowLeft`||e===`KeyA`?-1:1)+t.length)%t.length];return n&&(this.selectedCharacter=n.id,this.showCharacters()),!0}return!1}open(e,t,n=``){e!==this.screen&&(this.openedAt=performance.now()),this.screen=e,this.panel.className=`panel ${n}`,this.panel.innerHTML=t,this.lastHover=null}close(){this.screen=`none`,this.panel.className=`panel hidden`,this.panel.innerHTML=``}showMenu(){let e=this.save,t=e.stats.bestTime>0?`Najdłuższy run: ${R_(e.stats.bestTime)}  •  Zwycięstwa: ${e.stats.wins}  •  Pokonani wrogowie: ${e.stats.kills}`:`Bór czeka. Zapada zmierzch.`;this.open(`menu`,`<div class="menu">
        <div class="title"><span class="t1">MegaBerg</span><span class="t2">Słowiańskie Bory</span><div class="orn"></div></div>
        <div class="menu-buttons">
          <button class="btn primary" data-act="play">${Q(`sword`)} Graj</button>
          <button class="btn" data-act="shop">${Q(`home`)} Chata <span class="pill">${Q(`coin`,`#ffd040`,14)} ${e.gold}</span></button>
          <button class="btn" data-act="achievements">${Q(`star`)} Osiągnięcia <span class="pill">${e.achievements.length}/${Cr.length}</span></button>
          <button class="btn" data-act="arsenal">${Q(`sickle`)} Arsenał <span class="pill">${Tr(e).length}/${fe.filter(e=>!e.evolved).length}</span></button>
          <button class="btn" data-act="options">${Q(`gear`)} Opcje</button>
        </div>
        <div class="menu-foot">${t}</div>
        <div class="controls">
          <b>Sterowanie</b>
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> ruch</span>
          <span><kbd>Mysz</kbd> / <kbd>←</kbd><kbd>→</kbd> kamera</span>
          <span><kbd>Spacja</kbd> skok</span>
          <span><kbd>Shift</kbd> zryw</span>
          <span><kbd>E</kbd> skrzynie i kapliczki</span>
          <span><kbd>Tab</kbd> mapa (przytrzymaj)</span>
          <span><kbd>Esc</kbd> pauza</span>
        </div>
      </div>`,`dim-soft`)}showCharacters(){let e=this.save;wr(e,m.find(e=>e.id===this.selectedCharacter)?.unlock)||(this.selectedCharacter=`wojmir`);let t=m.map(t=>{let n=wr(e,t.unlock),r=pe[t.startWeapon],i=Cr.find(e=>e.id===t.unlock),a=t.id===this.selectedCharacter?` selected`:``;return n?`<div class="char${a}" data-act="pick" data-arg="${t.id}">
        <div class="char-portrait" style="--c1:${L_(t.look.shirt)};--c2:${L_(t.look.hair)};--c3:${L_(t.look.pants)}"><i></i><b></b><u></u></div>
        <h3>${t.name}</h3><div class="sub">${t.title}</div>
        <p>${t.desc}</p>
        <div class="char-row">${Q(r?.icon??`star`,L_(r?.color??16777215),18)} ${r?.name??``}</div>
        <div class="char-bonus">${t.bonus}</div>
        <div class="char-passive"><b>${t.passive.name}:</b> ${t.passive.desc}</div>
      </div>`:`<div class="char locked"><div class="char-portrait">${Q(`lock`,`#8a8296`,44)}</div><h3>???</h3><p class="muted">${i?i.desc:``}</p></div>`}).join(``);this.open(`characters`,`<div class="sheet wide">
        <h2>Wybierz bohatera</h2>
        <div class="chars">${t}</div>
        <div class="row">
          <button class="btn" data-act="back">Wróć</button>
          <button class="btn primary" data-act="start">Wyrusz w bór</button>
        </div>
      </div>`,`dim`)}showShop(){let e=this.save,t=Ke.map(t=>{let n=e.shop[t.id]??0,r=n>=t.maxLevel,i=Je(t,n),a=!r&&e.gold>=i,o=Array.from({length:t.maxLevel},(e,t)=>`<i class="${t<n?`on`:``}"></i>`).join(``);return`<div class="shop-item${r?` maxed`:``}">
        <div class="shop-icon">${Q(t.icon,`#e9c46a`,30)}</div>
        <div class="shop-body"><h4>${t.name}</h4><p>${t.desc}</p><div class="shop-eff">${t.fmt(t.perLevel)} / poziom</div><div class="pips">${o}</div></div>
        <button class="btn small${a?` primary`:` disabled`}" data-act="buy" data-arg="${t.id}">${r?`Maks.`:`${Q(`coin`,`#ffd040`,14)} ${i}`}</button>
      </div>`}).join(``),n=`<span class="pill big silver">${Q(`coin`,`#d8dde6`,16)} ${e.silver} srebra</span>`,r=(t,n,r,i)=>{let a=e.bought.includes(t),o=wr(e,n.unlock),s=Cr.find(e=>e.id===n.unlock),c=o&&!a&&e.silver>=(n.silver??0),l=a?`<button class="btn small disabled">${i}</button>`:o?`<button class="btn small${c?` primary`:` disabled`}" data-act="buy" data-arg="${t}">${Q(`coin`,`#d8dde6`,14)} ${n.silver}</button>`:`<button class="btn small disabled">${Q(`lock`,`#8a8296`,14)}</button>`;return`<div class="shop-item${a?` maxed`:``}">
          <div class="shop-icon">${Q(n.icon,o?L_(n.color):`#6f6880`,30)}</div>
          <div class="shop-body"><h4>${o?n.name:`???`}</h4><p>${o?n.desc:`Odblokuj: ${s?.desc??``}`}</p>${o?``:B_(e,s)}<div class="shop-eff">${r}</div></div>
          ${l}
        </div>`},i=fe.filter(e=>e.silver&&!e.evolved).map(t=>r(`weapon:${t.id}`,t,`Broń`,e.disabled.includes(`w:${t.id}`)?`Wyłączona z puli`:`Na kartach`)).join(``)+De.filter(e=>e.silver).map(e=>r(`item:${e.id}`,e,P[e.rarity].name,`W skrzyniach`)).join(``),a=e.bought.includes(`toggler`),o=`<div class="shop-item${a?` maxed`:``}">
        <div class="shop-icon">${Q(`wand`,`#d8dde6`,30)}</div>
        <div class="shop-body"><h4>Rózga wróżbity</h4><p>Pozwala wyłączyć bronie, księgi i skarby, których nie chcesz widzieć na kartach i w skrzyniach.</p></div>
        ${a?`<button class="btn small disabled">Masz</button>`:`<button class="btn small${e.silver>=30?` primary`:` disabled`}" data-act="buy" data-arg="toggler">${Q(`coin`,`#d8dde6`,14)} 30</button>`}
      </div>`,s=(t,n,r)=>{let i=kr(e,t),a=Ar(e,t).length,o=i.map(n=>{let i=r(n),a=e.disabled.includes(`${t}:${n}`);return`<button class="chip${a?` off`:``}" data-act="pool" data-arg="${t}:${n}" title="${a?`Wyłączone, kliknij, by włączyć`:`Kliknij, by wyłączyć`}">${Q(i.icon,L_(i.color),16)} ${i.name}</button>`}).join(``);return`<div class="pool"><h4>${n} <em>${a} z ${i.length} włączonych (min. ${Or[t]})</em></h4><div class="chips">${o}</div></div>`},c=a?`<h3 class="shop-head">Pule (Rózga wróżbity)</h3>
        ${s(`w`,`Bronie`,e=>pe[e])}
        ${s(`b`,`Księgi`,e=>Ce[e])}
        ${s(`i`,`Skarby`,e=>F[e])}`:``;this.open(`shop`,`<div class="sheet wide">
        <h2>Chata</h2>
        <p class="lead">Złoto wyniesione z boru zamienia się w trwałe ulepszenia, a srebro z każdego runu otwiera Skarbiec. <span class="pill big">${Q(`coin`,`#ffd040`,16)} ${e.gold}</span> ${n}</p>
        <div class="shop">${t}</div>
        <h3 class="shop-head">Skarbiec (srebro)</h3>
        <p class="muted">Skarb lub broń odblokowane osiągnięciem kupisz tu za srebro; od tej chwili skarb trafia do skrzyń, a broń na karty.</p>
        <div class="shop">${i}${o}</div>
        ${c}
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,`dim`)}showAchievements(){let e=this.save,t=Cr.map(t=>{let n=e.achievements.includes(t.id);return`<div class="ach${n?` done`:``}">${Q(n?`star`:`lock`,n?`#ffd040`:`#6f6880`,22)}<div><h4>${t.name}</h4><p>${t.desc}</p></div><div class="ach-reward">${t.reward}</div></div>`}).join(``);this.open(`achievements`,`<div class="sheet">
        <h2>Osiągnięcia</h2>
        <div class="achs">${t}</div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,`dim`)}showArsenal(){let e=this.save,t=fe.filter(e=>!e.evolved).map(t=>{let n=Cr.find(e=>e.id===t.unlock);if(!wr(e,t.unlock))return`<div class="shop-item arsenal-item locked">
          <div class="shop-icon">${Q(`lock`,`#8a8296`,28)}</div>
          <div class="shop-body"><h4>???</h4><p>Odblokuj: ${n?.desc??``}</p>${B_(e,n)}</div>
        </div>`;let r=t.evolution?pe[t.evolution.into]:void 0,i=t.evolution?Ce[t.evolution.passive]:void 0,a=r?e.evolutionsSeen.includes(r.id)?`Ewolucja: ${r.name}${i?` (${i.name})`:``}`:`Ewolucja: ???`:``,o=t.silver&&!e.bought.includes(`weapon:${t.id}`)?`<div class="arsenal-buy">Do kupienia w Skarbcu za ${t.silver} srebra</div>`:``;return`<div class="shop-item arsenal-item${o?` locked`:``}">
          <div class="shop-icon">${Q(t.icon,L_(t.color),30)}</div>
          <div class="shop-body"><h4>${t.name}</h4><p>${t.desc}</p><div class="shop-eff">Typ ataku: ${z_[t.kind]}</div><div class="arsenal-evo">${a}</div>${o}</div>
        </div>`}).join(``);this.open(`arsenal`,`<div class="sheet wide">
        <h2>Arsenał</h2>
        <p class="lead">Bronie, które mogą trafić na karty. Kolejne odblokujesz stylem gry.</p>
        <div class="shop">${t}</div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,`dim`)}showOptions(e){this.optionsBack=e;let t=this.save.options,n=(e,t,n,r,i,a)=>`<label class="opt"><span>${t}</span><input type="range" min="${r}" max="${i}" step="${a}" value="${n}" data-opt="${e}"><span class="val">${e===`sensitivity`?`${n.toFixed(1)}×`:`${Math.round(n*100)}%`}</span></label>`,r=(e,t,n)=>`<div class="opt"><span>${t}</span><button class="btn small ${n?`primary`:``}" data-act="toggle" data-arg="${e}">${n?`Włączone`:`Wyłączone`}</button><span class="val"></span></div>`,i=[`Niska`,`Średnia`,`Wysoka`].map((e,n)=>`<button class="btn small ${t.quality===n?`primary`:``}" data-act="quality" data-arg="${n}">${e}</button>`).join(``);this.open(`options`,`<div class="sheet narrow">
        <h2>Opcje</h2>
        ${n(`master`,`Głośność ogólna`,t.master,0,1,.05)}
        ${n(`music`,`Muzyka`,t.music,0,1,.05)}
        ${n(`sfx`,`Efekty`,t.sfx,0,1,.05)}
        ${n(`sensitivity`,`Czułość myszy`,t.sensitivity,.2,3,.1)}
        ${r(`damageNumbers`,`Liczby obrażeń`,t.damageNumbers)}
        ${r(`shake`,`Wstrząsy ekranu`,t.shake)}
        <div class="opt"><span>Jakość grafiki</span><div class="seg">${i}</div><span class="val"></span></div>
        <div class="opt danger"><span>Postęp gry</span><button class="btn small danger" data-act="reset">${this.confirmReset?`Na pewno? Kliknij ponownie`:`Resetuj postęp`}</button><span class="val"></span></div>
        <div class="row"><button class="btn" data-act="back">Wróć</button></div>
      </div>`,`dim`)}showPause(e){e&&(this.pauseWorld=e);let t=this.pauseWorld,n=``;if(t){let e=t.stats,r=e=>`${e>=0?`+`:``}${Math.round(e*100)}%`,i=[[`Czas trwania`,e.duration!==1,r(e.duration-1)],[`Szybkość pocisków`,e.projectileSpeed!==1,r(e.projectileSpeed-1)],[`Odrzut`,e.knockback!==1,r(e.knockback-1)],[`Kradzież życia`,e.lifesteal>0,`${Math.round(e.lifesteal*100)}%`],[`Ciernie`,e.thorns>0,e.thorns.toFixed(0)],[`Unik`,e.evasion>0,`${Math.round(rt(e.evasion)*100)}%`],[`Tarcza`,e.shield>0,e.shield.toFixed(0)],[`Klątwa`,e.curse>0,r(e.curse)]].filter(e=>e[1]).map(e=>`<div class="b-stat"><span>${e[0]}</span><b>${e[2]}</b></div>`).join(``),a=t.weapons.map(e=>`<div class="b-item">${Q(e.def.icon,L_(e.def.color),20)} ${e.def.name} <em>${e.def.evolved?`EWO `:``}poz. ${e.level}</em></div>`).join(``),o=t.passives.map(e=>`<div class="b-item">${Q(e.def.icon,L_(e.def.color),20)} ${e.def.name} <em>poz. ${e.level}</em></div>`).join(``),s=t.blessings.map(e=>`<div class="b-item">${Q(e.icon,L_(e.color),20)} ${e.name}</div>`).join(``),c=t.items.map(e=>`<div class="b-item">${Q(e.def.icon,L_(e.def.color),20)} ${e.def.name} <em>×${e.count}</em></div>`).join(``);n=`<div class="build">
        <div><h4>Bronie</h4>${a}</div>
        <div><h4>Księgi i błogosławieństwa</h4>${o||`<div class="muted">brak</div>`}${s}${c?`<h4>Skarby</h4>${c}`:``}</div>
        <div><h4>Statystyki</h4>
          <div class="b-stat"><span>Obrażenia</span><b>${r(e.damage-1)}</b></div>
          <div class="b-stat"><span>Odnowienie</span><b>${r(e.cooldown-1)}</b></div>
          <div class="b-stat"><span>Obszar</span><b>${r(e.area-1)}</b></div>
          <div class="b-stat"><span>Szybkość</span><b>${r(e.moveSpeed-1)}</b></div>
          <div class="b-stat"><span>Pancerz</span><b>${e.armor.toFixed(e.armor%1?1:0)}</b></div>
          <div class="b-stat"><span>Regeneracja</span><b>${e.regen.toFixed(1)}/s</b></div>
          <div class="b-stat"><span>Szczęście</span><b>${r(e.luck)}</b></div>
          <div class="b-stat"><span>Zasięg zbierania</span><b>${r(e.pickup-1)}</b></div>
          <div class="b-stat"><span>Szybkość ataku</span><b>${r(e.attackSpeed-1)}</b></div>
          <div class="b-stat"><span>Krytyk</span><b>${Math.round(e.critChance*100)}% × ${e.critDamage.toFixed(1)}</b></div>
          ${i}
        </div>
      </div>`}this.open(`pause`,`<div class="sheet">
        <h2>Pauza</h2>
        ${n}
        <div class="row">
          <button class="btn primary" data-act="resume">Wznów</button>
          <button class="btn" data-act="options">Opcje</button>
          <button class="btn" data-act="endrun">Zakończ run</button>
        </div>
      </div>`,`dim`)}pauseWorld=null;cardHtml(e,t,n){let r=P[e.rarity],i=e.kind===`evolve`?`EWOLUCJA`:e.kind===`gold`||e.kind===`heal`?`Dar boru`:e.isNew?`NOWE`:e.kind===`item`?`${e.level}. sztuka`:`Poziom ${e.level}`,a=e.kind===`weapon`||e.kind===`evolve`?`Broń`:e.kind===`passive`?`Księga`:e.kind===`item`?`Skarb`:`Łup`;return`<div class="card r-${e.rarity}" data-act="choose" data-arg="${t}" style="--rc:${r.color}">
      ${n?`<div class="card-key">${t+1}</div>`:``}
      <div class="card-rarity">${r.name}</div>
      <div class="card-icon" style="--ic:${L_(e.color)}">${Q(e.icon,L_(e.color),54)}</div>
      <h3>${e.name}</h3>
      <div class="card-tag">${a} • ${i}</div>
      <p>${e.text}</p>
    </div>`}blessLevelHtml(e,t){let n=e.blessings.filter(e=>e.id===t).length+1,r=Math.max(2,n);return`<div class="bless-lvl"><span>Podnosi do poziomu <b>${n}</b> / ${r}</span><div class="pips">${Array.from({length:r},(e,t)=>`<i class="${t<n-1?`on`:t===n-1?`next`:``}"></i>`).join(``)}</div></div>`}showChoice(e){let t=e.choice;if(t){if(t.type===`levelup`){let n=e.banishCost(),r=t.cards.map((t,r)=>{let i=nr(t)?`<button class="banish${e.gold>=n?``:` off`}" data-act="banish" data-arg="${r}" title="Usuń tę kartę z puli do końca runu">Wygnaj · ${n} zł</button>`:``;return`<div class="card-wrap">${this.cardHtml(t,r,!0)}${i}</div>`}).join(``),i=e.rerollCost(),a=e.rerollsLeft>0?`Przelosuj (${e.rerollsLeft})`:`Przelosuj · ${i} zł`,o=`<button class="btn small${e.rerollsLeft>0||e.gold>=i?``:` off`}" data-act="reroll">${Q(`dice`,`#e9c46a`,16)} ${a} <kbd>R</kbd></button>`;this.open(`choice`,`<div class="choice"><h2>Awans! Poziom ${e.level}</h2><p class="lead">Wybierz jedną kartę</p><div class="cards">${r}</div><div class="row">${o}</div></div>`,`dim levelup`)}else if(t.type===`chest`){let e=t.cards.map((e,t)=>this.cardHtml(e,t,!1)).join(``),n=t.greed?`<h2>Ołtarz chciwości</h2><p class="lead">Złoto i skarb… za klątwę do końca runu.</p>`:t.gift?`<h2 class="gift">Dar boru</h2><p class="lead">Bór obdarza cię za darmo…</p>`:t.rich?`<h2 class="rich">Bogata skrzynia</h2><p class="lead">Skarby strzeżone przez to miejsce są twoje, wszystkie naraz…</p>`:`<h2>Skrzynia</h2><p class="lead">W środku znajdujesz…</p>`,r=t.rich&&t.cards.length>1?`Weź wszystko`:`Weź`;this.open(`choice`,`<div class="choice">${n}<div class="cards">${e}</div><div class="row"><button class="btn primary" data-act="choose" data-arg="0">${r} <kbd>Enter</kbd></button></div></div>`,`dim chest`)}else{let n=t.options.map((n,r)=>`<div class="card bless" data-act="choose" data-arg="${r}" style="--rc:${L_(n.color)}">
          <div class="card-key">${r+1}</div>
          <div class="card-rarity">${n.god}</div>
          <div class="card-icon" style="--ic:${L_(n.color)}">${Q(n.icon,L_(n.color),54)}</div>
          <h3>${n.name}</h3><p>${n.desc}</p>${t.circle?``:this.blessLevelHtml(e,n.id)}</div>`).join(``),r=t.circle?`<h2>Święty krąg</h2><p class="lead">Krąg naładowany. Wybierz jego dar.</p>`:`<h2>Kapliczka</h2><p class="lead">Któremu z bogów złożysz pokłon?</p>`,i=t.circle?``:`<button class="btn small" data-act="cancel">Odejdź <kbd>Esc</kbd></button>`;this.open(`choice`,`<div class="choice">${r}<div class="cards">${n}</div><div class="row">${i}</div></div>`,`dim shrine`)}}}showEnd(e,t,n){let r=Math.max(1,...e.weapons.map(e=>e.dealt)),i=e.weapons.slice().sort((e,t)=>t.dealt-e.dealt).map(e=>{let t=pe[e.id];return`<div class="dmg-row">${Q(t?.icon??`star`,L_(t?.color??16777215),18)}<span class="dmg-name">${e.name}</span><div class="dmg-bar"><i style="width:${Math.round(e.dealt/r*100)}%;background:${L_(t?.color??16777215)}"></i></div><b>${e.dealt.toLocaleString(`pl-PL`)}</b></div>`}).join(``),a=e.burnDealt>0?`<div class="dmg-row">${Q(`flame`,`#ff8a3a`,18)}<span class="dmg-name">Podpalenie</span><div class="dmg-bar"><i style="width:${Math.min(100,Math.round(e.burnDealt/r*100))}%;background:#ff8a3a"></i></div><b>${e.burnDealt.toLocaleString(`pl-PL`)}</b></div>`:``,o=Object.entries(e.killsByEnemy).sort((e,t)=>t[1]-e[1]).slice(0,5).map(([e,t])=>`${ct.find(t=>t.id===e)?.name??e}: ${t}`).join(`  •  `),s=t.unlocked.length?`<div class="unlocks"><h4>Nowe osiągnięcia</h4>${t.unlocked.map(e=>`<div class="unlock">${Q(`star`,`#ffd040`,18)} <b>${e.name}</b> — ${e.reward}</div>`).join(``)}</div>`:``;this.open(`end`,`<div class="sheet end ${e.won?`won`:`lost`}">
        <h2>${e.won?`Zwycięstwo!`:e.endless?`Bór cię pochłonął`:`Poległeś w borze`}</h2>
        <p class="lead">${e.won?`Leszy pada. Bór znów jest spokojny.`:e.endless?`Tryb nieskończony dobiegł końca. Leszy i tak już pokonany.`:`Złe moce zwyciężyły tym razem. Chata czeka na twoje złoto.`}</p>
        <div class="end-stats">
          <div><span>Czas</span><b>${R_(e.time)}</b></div>
          <div><span>Zabójstwa</span><b>${e.kills}</b></div>
          <div><span>Poziom</span><b>${e.level}</b></div>
          <div><span>Złoto</span><b>${Q(`coin`,`#ffd040`,16)} ${t.goldBanked}${t.goldBonus?` <em>+${t.goldBonus}</em>`:``}</b></div>
          <div><span>Srebro</span><b>${Q(`coin`,`#d8dde6`,16)} ${t.silver}</b></div>
        </div>
        <h4>Obrażenia według broni</h4>
        <div class="dmg">${i}${a}</div>
        <p class="muted small">${o}</p>
        ${s}
        <div class="row">
          ${n?`<button class="btn" data-act="endless">Graj dalej (tryb nieskończony)</button>`:``}
          <button class="btn primary" data-act="restart">Jeszcze raz</button>
          <button class="btn" data-act="shop">Chata</button>
          <button class="btn" data-act="menu">Menu</button>
        </div>
      </div>`,`dim`)}showContextLost(){this.setHud(!1),this.open(`none`,`<div class="sheet narrow"><h2>Utracono kontekst grafiki</h2><p class="lead">Karta graficzna przerwała połączenie z grą. Postęp z Chaty jest zapisany. Odśwież stronę (F5), aby grać dalej.</p></div>`,`dim`)}setHud(e){this.hud.classList.toggle(`hidden`,!e),e||(this.hurt.style.opacity=`0`)}setHint(e){this.hint.classList.toggle(`hidden`,!e)}set(e,t,n){this.cache[e]!==t&&(this.cache[e]=t,n(t))}resetHud(){for(let e of Object.keys(this.cache))delete this.cache[e];this.surge.classList.add(`hidden`),this.haste.classList.add(`hidden`),this.hud.classList.remove(`surging`),this.bannerQueue=[],this.bannerT=0,this.banner.classList.add(`hidden`)}updateHud(e,t){let n=e.player,r=e.stats;this.set(`xp`,Math.round(e.xp/e.xpNeed*500),e=>this.xpFill.style.width=`${e/5}%`),this.set(`lvl`,e.level,e=>this.xpLevel.textContent=`Poziom ${e}`),this.set(`time`,Math.floor(e.time),e=>this.timer.textContent=R_(e)),this.set(`hp`,Math.round(n.hp/r.maxHp*300),e=>this.hpFill.style.width=`${e/3}%`),this.set(`hpt`,`${Math.ceil(n.hp)} / ${r.maxHp}${r.shield>0?`  +${Math.ceil(e.shield)}`:``}`,e=>this.hpText.textContent=e),this.set(`shield`,r.shield>0?Math.round(e.shield/r.shield*300):-1,e=>{this.shieldFill.style.display=e<0?`none`:`block`,this.shieldFill.style.width=`${Math.max(0,e)/3}%`}),this.set(`kills`,e.kills,e=>this.kills.innerHTML=`${Q(`skull`,`#e8dfd0`,18)} ${e}`),this.set(`gold`,Math.floor(e.gold),e=>this.gold.innerHTML=`${Q(`coin`,`#ffd040`,18)} ${e}`);let i=n.dashCd<=0?100:Math.round((1-n.dashCd/1.5)*100);this.set(`dash`,i,e=>{this.dashFill.style.width=`${e}%`,this.dashFill.parentElement?.classList.toggle(`ready`,e===100)});let a=e.weapons.map(e=>`${e.def.id}${e.level}`).join(`,`)+`/${e.weaponCap()}`;this.set(`weapons`,a,()=>{this.weapons.innerHTML=e.weapons.map(t=>{let n=e.weaponCap(),r=t.level>=n?`MAX`:`${t.def.evolved?`★`:``}${t.level}`;return`<div class="slot${t.def.evolved?` evo`:``}" style="--c:${L_(t.def.color)}" title="${t.def.name}">${Q(t.def.icon,L_(t.def.color),26)}<b>${r}</b></div>`}).join(``)});let o=e.passives.map(e=>`${e.def.id}${e.level}`).join(`,`)+e.blessings.length;this.set(`passives`,o,()=>{this.passives.innerHTML=e.passives.map(e=>`<div class="slot" style="--c:${L_(e.def.color)}" title="${e.def.name}">${Q(e.def.icon,L_(e.def.color),18)}<b>${e.level}</b></div>`).join(``)+e.blessings.map(e=>`<div class="slot bl" style="--c:${L_(e.color)}" title="${e.name}">${Q(e.icon,L_(e.color),18)}</div>`).join(``)});let s=e.items.map(e=>`${e.def.id}${e.count}`).join(`,`);this.set(`items`,s,()=>{this.items.innerHTML=e.items.map(e=>`<div class="slot" style="--c:${P[e.def.rarity].color}" title="${e.def.name}: ${e.def.desc}">${Q(e.def.icon,L_(e.def.color),18)}${e.count>1?`<b>${e.count}</b>`:``}</div>`).join(``)});let c=e.prompt,l=``;if(c.kind===`chest`){let e=c.rich?`bogatą skrzynię`:`skrzynię`;l=c.affordable?`Przytrzymaj [E], aby otworzyć ${e} (${c.cost} złota)`:`${c.rich?`Bogata skrzynia`:`Skrzynia`} kosztuje ${c.cost} złota`}else c.kind===`shrine`?l=`Przytrzymaj [E], aby pokłonić się w kapliczce`:c.kind===`circle`?l=`Stój w świętym kręgu, aż się naładuje`:c.kind===`amber`?l=`Przytrzymaj [E]: kapliczka bursztynowa przyciągnie bursztyny z całego boru`:c.kind===`greed`?l=`Przytrzymaj [E]: ołtarz chciwości da skarb i złoto za klątwę (+15%)`:c.kind===`portal`&&(l=`Przytrzymaj [E], aby otworzyć portal i wezwać Leszego`);if(this.set(`prompt`,l,e=>{this.prompt.classList.toggle(`hidden`,e===``),this.prompt.innerHTML=`<span>${e}</span><i></i>`}),l){let e=this.prompt.lastElementChild;e&&(e.style.width=`${Math.round(c.progress*100)}%`)}let u=e.endless?0:y(e.time),d=!e.endless&&!e.bossSummoned&&e.time>=480;this.set(`surge`,u>0?1:d?2:0,e=>{this.surge.classList.toggle(`hidden`,e===0),this.surge.classList.toggle(`final`,e===2),this.hud.classList.toggle(`surging`,e!==0),e===2&&(this.surgeText.innerHTML=`<b>Fala końcowa</b> potrwa, dopóki nie wezwiesz Leszego`,this.surgeFill.style.width=`100%`)}),u>0&&(this.set(`surgeT`,Math.ceil(u),e=>this.surgeText.innerHTML=`<b>Fala boru</b> koniec za ${e} s`),this.set(`surgeW`,Math.round(u/30*200),e=>this.surgeFill.style.width=`${e/2}%`)),this.set(`haste`,+(e.hasteT>0),e=>this.haste.classList.toggle(`hidden`,e===0)),e.hasteT>0&&(this.set(`hasteT`,Math.ceil(e.hasteT),e=>this.hasteText.innerHTML=`${Q(`flint`,`#ffe45a`,15)} Szał bojowy <b>${e} s</b>`),this.set(`hasteW`,Math.round(e.hasteT/15*200),e=>this.hasteFill.style.width=`${e/2}%`));let f=e.bossIdx;if(f>=0&&e.enemies.alive[f]){let t=ct[e.enemies.type[f]];this.set(`boss`,t.name,e=>{this.boss.classList.remove(`hidden`),this.boss.classList.toggle(`big`,t.rank===`boss`),this.bossName.textContent=e}),this.set(`bossHp`,Math.round(e.enemies.hp[f]/e.enemies.maxHp[f]*400),e=>this.bossFill.style.width=`${e/4}%`)}else this.set(`boss`,``,()=>this.boss.classList.add(`hidden`));for(;e.announce.length>0;)this.bannerQueue.push(e.announce.shift());this.bannerT>0?(this.bannerT-=t,this.bannerT<=0&&this.banner.classList.add(`hidden`)):this.bannerQueue.length>0&&(this.banner.textContent=this.bannerQueue.shift(),this.banner.classList.remove(`hidden`),this.banner.style.animation=`none`,this.banner.offsetWidth,this.banner.style.animation=``,this.bannerT=3.2);let p=n.hp/r.maxHp<.3?.35+Math.sin(e.time*6)*.12:0,m=Math.max(p,n.hurtT<.5?.75*(1-n.hurtT/.5):0);this.set(`hurt`,Math.round(m*20),e=>this.hurt.style.opacity=String(e/20))}toast(e){let t=$(`div`,`toast`,this.toasts);t.textContent=e,setTimeout(()=>t.remove(),4200)}};function H_(){return(Date.now()^Math.random()*2147483647)>>>0}var U_=class{input;map=new an(H_());gfx;loop;audio=new c;store=new Yr(Xr());ui;mapScreen;devMenu;world;state=`menu`;bot=null;debug=new Sr(this);simInput=En();jumpQueued=!1;dashQueued=!1;hitstopT=0;endT=0;runSaved=!1;secretsSaved=0;character;perfFinish=!1;mapHeld=!1;perf={frames:0,simMs:0,renderMs:0,steps:0,since:0,worst:0};constructor(e,t,n){this.input=new u(e),Hr(this.store.data).length>0&&this.store.save();let r=this.store.data.options;this.gfx=new E_(e,t,this.map,r.quality),this.character=h[this.store.data.character]??m[0],this.world=this.makeWorld(!0),this.ui=new V_(n,{start:e=>this.startRun(e),choose:e=>this.choose(e),reroll:()=>this.reroll(),banish:e=>this.banish(e),cancelChoice:()=>this.cancelChoice(),resume:()=>this.resume(),restart:()=>this.startRun(this.character.id),endRun:()=>this.finishRun(),toMenu:()=>this.toMenu(),endless:()=>this.continueEndless(),buy:e=>this.buy(e),toggle:(e,t)=>this.toggle(e,t),option:(e,t)=>this.setOption(e,t),resetSave:()=>this.resetSave(),uiSound:e=>this.audio.ui(e)},this.store.data),this.mapScreen=new F_(n,this.map),this.devMenu=new xr(n,this),this.applyOptions(),this.loop=new p({step:e=>this.step(e),render:(e,t)=>this.render(e,t)}),e.addEventListener(`click`,()=>{this.state===`playing`&&this.input.requestLock()}),window.addEventListener(`pointerdown`,()=>this.audio.unlock()),document.addEventListener(`pointerlockchange`,()=>{!document.pointerLockElement&&this.state===`playing`&&!this.bot&&this.pause()}),document.addEventListener(`visibilitychange`,()=>{document.hidden&&this.state===`playing`&&!this.bot&&this.pause()}),this.input.onKey=e=>this.onKey(e),e.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),(this.state===`playing`||this.state===`paused`||this.state===`choice`||this.state===`ending`)&&this.bankRun(),this.state=`end`,this.loop.stop(),this.input.exitLock(),this.ui.showContextLost()}),this.toMenu()}start(){this.loop.start()}makeWorld(e){let t=this.store.data,n=new Gn(this.map,{seed:H_(),character:this.character,shop:t.shop,weaponPool:Ar(t,`w`),passivePool:Ar(t,`b`),itemPool:Ar(t,`i`),foundSecrets:t.found});return e&&(n.spawner.disabled=!0),this.devMenu?.god&&(n.godMode=!0),n}startRun(e){let t=h[e];t&&wr(this.store.data,t.unlock)&&(this.character=t),this.store.data.character=this.character.id,this.store.save(),this.newMap(),this.world=this.makeWorld(!1),this.runSaved=!1,this.secretsSaved=0,this.hitstopT=0,this.gfx.hero.setLook(this.character.look),this.gfx.resetRun(),this.gfx.menuOrbit=!1,this.gfx.camYaw=0,this.gfx.camPitch=.36,this.ui.close(),this.ui.resetHud(),this.ui.setHud(!0),this.state=`playing`,this.audio.unlock(),this.audio.intensity=.3,this.input.clearPressed(),this.input.requestLock(),this.world.announce.push(`Zapada zmierzch. Przetrwaj do świtu złych mocy!`)}newMap(e=H_()){this.map=new an(e),this.gfx.setMap(this.map),this.mapScreen.setMap(this.map)}toMenu(){(this.state===`playing`||this.state===`paused`||this.state===`choice`)&&this.bankRun(),this.state=`menu`,this.input.exitLock(),this.world=this.makeWorld(!0),this.gfx.hero.setLook(this.character.look),this.gfx.resetRun(),this.gfx.menuOrbit=!0,this.gfx.camPitch=.24,this.audio.intensity=.15,this.ui.setHud(!1),this.ui.save=this.store.data,this.ui.showMenu()}bankRun(){if(this.runSaved)return null;this.runSaved=!0;let e=Vr(this.store.data,this.world.summary());return this.store.save()||this.ui.toast(`Nie udało się zapisać postępu (pamięć przeglądarki niedostępna).`),e}saveSecrets(){let e=this.store.data.found;for(let t of this.world.secrets.slice(this.secretsSaved))e.includes(t)||e.push(t);this.secretsSaved=this.world.secrets.length,this.store.save()}finishRun(){let e=this.world.summary(),t=this.bankRun()??{goldBanked:0,goldBonus:0,silver:0,unlocked:[]};this.state=`end`,this.input.exitLock(),this.ui.setHud(!1),this.ui.save=this.store.data,this.ui.showEnd(e,t,this.world.won&&!this.world.dead),this.audio.intensity=.15}continueEndless(){this.world.startEndless(),this.runSaved=!1,this.ui.close(),this.ui.setHud(!0),this.state=`playing`,this.input.requestLock(),this.world.announce.push(`Tryb nieskończony: bór nie zna litości.`)}pause(){this.state===`playing`&&(this.state=`paused`,this.input.exitLock(),this.ui.showPause(this.world))}resume(){this.state===`paused`&&(this.state=`playing`,this.ui.close(),this.input.clearPressed(),this.input.requestLock())}choose(e){this.state===`choice`&&(this.audio.ui(`card`),this.world.choose(e),this.afterChoice())}reroll(){this.state===`choice`&&(this.world.reroll()?(this.audio.ui(`click`),this.ui.showChoice(this.world)):this.audio.ui(`deny`))}banish(e){this.state===`choice`&&(this.world.banish(e)?(this.audio.ui(`click`),this.ui.showChoice(this.world)):this.audio.ui(`deny`))}cancelChoice(){this.state===`choice`&&(this.world.cancelChoice(),this.afterChoice())}afterChoice(){this.world.choice?this.ui.showChoice(this.world):(this.state=`playing`,this.ui.close(),this.input.clearPressed(),this.bot||this.input.requestLock())}toggle(e,t){Pr(this.store.data,e,t)?(this.store.save(),this.audio.ui(`click`)):this.audio.ui(`deny`),this.ui.save=this.store.data,this.ui.showShop()}buy(e){Mr(this.store.data,e)?(this.store.save(),this.audio.ui(`buy`)):this.audio.ui(`deny`),this.ui.save=this.store.data,this.ui.showShop()}setOption(e,t){let n=this.store.data.options;e in n&&(n[e]=t,this.store.save(),this.applyOptions())}applyOptions(){let e=this.store.data.options;this.audio.setVolumes(e.master,e.music,e.sfx),this.gfx.fx.showNumbers=e.damageNumbers,this.gfx.shakeEnabled=e.shake,this.gfx.quality!==e.quality&&this.gfx.applyQuality(e.quality)}resetSave(){this.store.reset(),this.ui.save=this.store.data,this.character=m[0]}onKey(e){this.audio.unlock(),this.devMenu.key(e)||this.ui.key(e)||(e===`Escape`||e===`KeyP`)&&this.state===`playing`&&this.pause()}step(e){if(this.state!==`playing`&&this.state!==`ending`)return;let t=this.world;if(this.state===`ending`){this.endT-=e,this.endT<=0&&this.finishRun();return}if(this.hitstopT>0){this.hitstopT-=e;return}let n=performance.now(),r=this.simInput;if(this.bot)r=this.bot.update(t,e);else{let e=this.input;r.moveX=+!!e.down(`KeyD`)-!!e.down(`KeyA`),r.moveZ=+!!e.down(`KeyW`)-!!e.down(`KeyS`),r.jump=this.jumpQueued,r.dash=this.dashQueued,r.jumpHeld=e.down(`Space`),r.interact=e.down(`KeyE`),r.camYaw=this.gfx.camYaw,this.jumpQueued=!1,this.dashQueued=!1}if(t.step(e,r),this.gfx.fx.handleEvents(t),this.audio.handleEvents(t),this.audio.update(t,e),t.events.clear(),t.secrets.length>this.secretsSaved&&this.saveSecrets(),t.hitstop>0&&(this.hitstopT=t.hitstop,t.hitstop=0),this.perf.simMs+=performance.now()-n,this.perf.steps++,t.dead)this.state=`ending`,this.endT=1.4;else if(t.won&&!t.endless)this.state=`ending`,this.endT=2.4;else if(t.choice){if(this.bot)for(;t.choice;)t.choose(this.bot.choose(t));else this.state=`choice`,this.input.exitLock(),this.ui.showChoice(t)}let i=t.bossIdx>=0&&t.time>=480;this.audio.intensity=i?1:t.bossIdx>=0?.8:.3+Math.min(1,t.time/480)*.4}render(e,t){let n=performance.now(),r=this.input;if(this.state===`playing`){r.consume(`Space`)&&(this.jumpQueued=!0),(r.consume(`ShiftLeft`)||r.consume(`ShiftRight`))&&(this.dashQueued=!0);let e=.0024*this.store.data.options.sensitivity,n=-r.mouseDX*e,i=r.mouseDY*e,a=2.2*t;r.down(`ArrowLeft`)&&(n+=a),r.down(`ArrowRight`)&&(n-=a),r.down(`ArrowUp`)&&(i+=a*.6),r.down(`ArrowDown`)&&(i-=a*.6),this.gfx.rotateCamera(n,i),this.ui.setHint(!r.locked&&!this.bot)}else r.clearPressed();r.mouseDX=0,r.mouseDY=0;let i=this.state===`paused`||this.state===`choice`||this.state===`end`;this.gfx.render(this.world,i?1:e,i?Math.min(t,.001):t),(this.state===`playing`||this.state===`ending`)&&this.ui.updateHud(this.world,t),this.mapScreen.setVisible(this.state===`playing`&&(r.down(`Tab`)||this.mapHeld)),this.mapScreen.visible&&this.mapScreen.draw(this.world,this.gfx.camYaw,t),this.perfFinish&&this.gfx.renderer.getContext().finish();let a=performance.now()-n;this.perf.renderMs+=a,this.perf.frames++,a>this.perf.worst&&(this.perf.worst=a)}setBot(e){this.bot=e?new br(e):null,this.bot&&this.ui.setHint(!1)}resetPerf(){let e=this.perf;e.frames=0,e.simMs=0,e.renderMs=0,e.steps=0,e.worst=0,e.since=performance.now()}perfReport(){let e=this.perf,t=(performance.now()-e.since)/1e3;return{fps:+(e.frames/t).toFixed(1),simMsPerStep:+(e.simMs/Math.max(1,e.steps)).toFixed(3),cpuMsPerFrame:+(e.renderMs/Math.max(1,e.frames)).toFixed(3),worstFrameMs:+e.worst.toFixed(2),enemies:this.world.enemies.count}}};function W_(){try{let e=document.createElement(`canvas`);return!!(e.getContext(`webgl2`)??e.getContext(`webgl`))}catch{return!1}}var G_=document.getElementById(`game`),K_=document.getElementById(`overlay`),q_=document.getElementById(`ui`);if(!W_())q_.innerHTML=`<div class="panel dim"><div class="sheet narrow"><h2>Brak WebGL</h2><p class="lead">Ta przeglądarka nie udostępnia WebGL, więc gra 3D nie może się uruchomić. Otwórz grę w aktualnym Chrome, Firefoksie lub Edge z włączoną akceleracją sprzętową.</p></div></div>`;else{let t=document.createElement(`div`);t.className=`loading`,t.style.backgroundImage=`url(${e})`,t.innerHTML=`<div class="loading-box"><h1>MegaBerg</h1><h2>Słowiańskie Bory</h2><div class="loading-bar"><i></i></div><p>Bór się budzi…</p></div>`,document.body.appendChild(t);let n=t.querySelector(`i`);try{await Lg((e,t)=>n.style.width=`${Math.round(e/t*100)}%`)}catch(e){throw t.querySelector(`p`).textContent=`Nie udało się wczytać plików gry. Odśwież stronę (F5).`,e}let r=new U_(G_,K_,q_);r.start(),t.classList.add(`done`),setTimeout(()=>t.remove(),700),window.__mb=r;let i=new URLSearchParams(location.search);i.get(`autostart`)&&r.startRun(i.get(`char`)??r.store.data.character);let a=i.get(`bot`);(a===`good`||a===`novice`)&&r.setBot(a);let o=Number(i.get(`speed`));o>0&&(r.loop.timeScale=o);let s=Number(i.get(`force`));s>0&&(r.world.spawner.forceAlive=s)}