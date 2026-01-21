(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&o(c)}).observe(document,{childList:!0,subtree:!0});function i(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=i(n);fetch(n.href,a)}})();function I(){const e=document.getElementById("themeToggle"),t=document.documentElement,i=localStorage.getItem("theme"),o=window.matchMedia("(prefers-color-scheme: dark)").matches,n=i||(o?"dark":"light");t.setAttribute("data-theme",n),e==null||e.addEventListener("click",()=>{const c=t.getAttribute("data-theme")==="dark"?"light":"dark";t.setAttribute("data-theme",c),localStorage.setItem("theme",c),t.classList.add("theme-transitioning"),setTimeout(()=>{t.classList.remove("theme-transitioning")},300)}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",a=>{localStorage.getItem("theme")||t.setAttribute("data-theme",a.matches?"dark":"light")})}const M=document.createElement("style");M.textContent=`
  html.theme-transitioning,
  html.theme-transitioning *,
  html.theme-transitioning *::before,
  html.theme-transitioning *::after {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
  }
`;document.head.appendChild(M);function P(){A(),k()}function A(){const e=document.querySelectorAll(".reveal, .stagger-children"),t=new IntersectionObserver(i=>{i.forEach(o=>{o.isIntersecting&&o.target.classList.add("active")})},{threshold:.1,rootMargin:"0px 0px -50px 0px"});e.forEach(i=>{t.observe(i)})}function k(){const e=document.querySelectorAll(".stat-number[data-target]"),t=new IntersectionObserver(i=>{i.forEach(o=>{if(o.isIntersecting){const n=parseInt(o.target.dataset.target);T(o.target,n),t.unobserve(o.target)}})},{threshold:.5});e.forEach(i=>{t.observe(i)})}function T(e,t){const o=performance.now(),n=0;function a(c){const m=c-o,u=Math.min(m/2e3,1),l=1-Math.pow(1-u,4),h=Math.floor(n+(t-n)*l);e.textContent=h,u<1?requestAnimationFrame(a):(e.textContent=t,t>=100&&e.textContent!=="100"&&(e.textContent=t+"+"))}requestAnimationFrame(a)}function D(){const e=document.getElementById("particles");if(!e)return;const t=e.getContext("2d");let i=[],o,n={x:null,y:null,radius:150};const a={particleCount:80,particleSize:2,lineDistance:150,particleSpeed:.5,particleColor:getComputedStyle(document.documentElement).getPropertyValue("--accent-primary").trim()||"#6366f1"};function c(){e.width=window.innerWidth,e.height=window.innerHeight,u()}class m{constructor(){this.x=Math.random()*e.width,this.y=Math.random()*e.height,this.size=Math.random()*a.particleSize+1,this.speedX=(Math.random()-.5)*a.particleSpeed,this.speedY=(Math.random()-.5)*a.particleSpeed,this.opacity=Math.random()*.5+.2}update(){if(this.x+=this.speedX,this.y+=this.speedY,this.x>e.width&&(this.x=0),this.x<0&&(this.x=e.width),this.y>e.height&&(this.y=0),this.y<0&&(this.y=e.height),n.x!==null&&n.y!==null){const s=n.x-this.x,f=n.y-this.y,d=Math.sqrt(s*s+f*f);if(d<n.radius){const g=(n.radius-d)/n.radius,y=s/d*g*2,x=f/d*g*2;this.x-=y,this.y-=x}}}draw(){t.beginPath(),t.arc(this.x,this.y,this.size,0,Math.PI*2),t.fillStyle=a.particleColor,t.globalAlpha=this.opacity,t.fill(),t.globalAlpha=1}}function u(){i=[];const r=Math.min(a.particleCount,Math.floor(e.width*e.height/15e3));for(let s=0;s<r;s++)i.push(new m)}function l(){for(let r=0;r<i.length;r++)for(let s=r+1;s<i.length;s++){const f=i[r].x-i[s].x,d=i[r].y-i[s].y,g=Math.sqrt(f*f+d*d);if(g<a.lineDistance){const y=(1-g/a.lineDistance)*.3;t.beginPath(),t.strokeStyle=`rgba(99, 102, 241, ${y})`,t.lineWidth=1,t.moveTo(i[r].x,i[r].y),t.lineTo(i[s].x,i[s].y),t.stroke()}}}function h(){t.clearRect(0,0,e.width,e.height),i.forEach(r=>{r.update(),r.draw()}),l(),o=requestAnimationFrame(h)}window.addEventListener("resize",c),window.addEventListener("mousemove",r=>{n.x=r.clientX,n.y=r.clientY}),window.addEventListener("mouseout",()=>{n.x=null,n.y=null}),document.addEventListener("visibilitychange",()=>{document.hidden?cancelAnimationFrame(o):h()}),c(),h()}function O(){const e=document.getElementById("droneCanvas");if(!e)return;const t=e.getContext("2d");let i,o=0,n=0,a=0;function c(){const l=e.parentElement;e.width=l.offsetWidth,e.height=l.offsetHeight}function m(){const l=e.width/2,h=e.height/2+Math.sin(a)*10,r=Math.min(e.width,e.height)*.35;t.clearRect(0,0,e.width,e.height);const s=document.documentElement.getAttribute("data-theme")!=="light",f=s?"#6366f1":"#4f46e5",d=s?"#22d3ee":"#0891b2",g=s?"#1a1a25":"#e2e8f0",y=s?"#f8fafc":"#0f172a";t.save(),t.translate(l,h),t.rotate(Math.sin(o*.5)*.05);const x=r*.8;[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4].forEach((p,w)=>{const v=Math.cos(p+o*.1)*x,b=Math.sin(p+o*.1)*x*.5;t.beginPath(),t.moveTo(0,0),t.lineTo(v,b),t.strokeStyle=g,t.lineWidth=8,t.stroke(),t.beginPath(),t.arc(v,b,15,0,Math.PI*2),t.fillStyle=y,t.fill(),t.beginPath(),t.ellipse(v,b,35,10,n+w*Math.PI/2,0,Math.PI*2);const L=t.createRadialGradient(v,b,0,v,b,35);L.addColorStop(0,`${d}80`),L.addColorStop(1,`${d}00`),t.fillStyle=L,t.fill()}),t.beginPath(),t.ellipse(0,0,40,25,0,0,Math.PI*2);const C=t.createLinearGradient(-40,-25,40,25);C.addColorStop(0,f),C.addColorStop(1,d),t.fillStyle=C,t.fill(),t.beginPath(),t.arc(0,10,12,0,Math.PI*2),t.fillStyle="#000",t.fill(),t.beginPath(),t.arc(0,10,8,0,Math.PI*2);const E=t.createRadialGradient(0,10,0,0,10,8);E.addColorStop(0,"#4a5568"),E.addColorStop(.5,"#1a202c"),E.addColorStop(1,"#2d3748"),t.fillStyle=E,t.fill(),t.beginPath(),t.arc(-2,8,3,0,Math.PI*2),t.fillStyle="rgba(255, 255, 255, 0.3)",t.fill(),[{x:-25,y:0},{x:25,y:0}].forEach((p,w)=>{t.beginPath(),t.arc(p.x,p.y,4,0,Math.PI*2),t.fillStyle=w===0?"#22c55e":"#ef4444",t.fill(),t.beginPath(),t.arc(p.x,p.y,8,0,Math.PI*2),t.fillStyle=w===0?"rgba(34, 197, 94, 0.3)":"rgba(239, 68, 68, 0.3)",t.fill()}),t.restore()}function u(){o+=.02,n+=.3,a+=.03,m(),i=requestAnimationFrame(u)}e.addEventListener("mousemove",l=>{const h=e.getBoundingClientRect(),r=l.clientX-h.left-e.width/2;l.clientY-h.top-e.height/2,o+=r*1e-4}),document.addEventListener("visibilitychange",()=>{document.hidden?cancelAnimationFrame(i):u()}),window.addEventListener("resize",c),c(),u()}document.addEventListener("DOMContentLoaded",()=>{I(),P(),D(),O(),q(),B(),F(),Y(),R()});function q(){const e=document.getElementById("navbar");window.addEventListener("scroll",()=>{window.scrollY>50?e.classList.add("scrolled"):e.classList.remove("scrolled")}),document.querySelectorAll('a[href^="#"]').forEach(t=>{t.addEventListener("click",function(i){i.preventDefault();const o=document.querySelector(this.getAttribute("href"));o&&o.scrollIntoView({behavior:"smooth",block:"start"})})})}function B(){const e=document.getElementById("typingText");if(!e)return;const t=["AI/ML Solutions Architect","Computer Vision Expert","NLP & LLM Specialist","Turning Research into Products","End-to-End AI Developer"];let i=0,o=0,n=!1,a=100;function c(){const m=t[i];n?(e.textContent=m.substring(0,o-1),o--,a=50):(e.textContent=m.substring(0,o+1),o++,a=100),!n&&o===m.length?(n=!0,a=2e3):n&&o===0&&(n=!1,i=(i+1)%t.length,a=500),setTimeout(c,a)}c()}function F(){const e=document.querySelectorAll(".filter-btn"),t=document.querySelectorAll(".project-card");e.forEach(i=>{i.addEventListener("click",()=>{e.forEach(n=>n.classList.remove("active")),i.classList.add("active");const o=i.dataset.filter;t.forEach(n=>{const a=n.dataset.category;o==="all"||a.includes(o)?(n.style.display="block",n.style.animation="fade-in-up 0.5s ease forwards"):n.style.display="none"})})})}function Y(){const e=document.getElementById("contactForm");e&&e.addEventListener("submit",t=>{t.preventDefault();const i=new FormData(e),o=Object.fromEntries(i),n=encodeURIComponent(o.subject),a=encodeURIComponent(`Hi Yash,

${o.message}

Best,
${o.name}
${o.email}`);window.location.href=`mailto:yashpratap424@gmail.com?subject=${n}&body=${a}`,alert("Opening your email client...")})}function R(){const e=document.getElementById("menuBtn"),t=document.getElementById("navLinks");!e||!t||(e.addEventListener("click",()=>{t.classList.toggle("mobile-active"),e.classList.toggle("active")}),t.querySelectorAll("a").forEach(i=>{i.addEventListener("click",()=>{t.classList.remove("mobile-active"),e.classList.remove("active")})}))}const S=document.createElement("style");S.textContent=`
  @media (max-width: 768px) {
    .nav-links {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: var(--space-xl);
      flex-direction: column;
      align-items: center;
      gap: var(--space-lg);
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-base);
    }
    
    .nav-links.mobile-active {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      display: flex;
    }
    
    .nav-menu-btn.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }
    
    .nav-menu-btn.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
`;document.head.appendChild(S);
