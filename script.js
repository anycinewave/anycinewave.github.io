[
  {
    let catalog=[],selected=null,filter="todos";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const favs=()=>JSON.parse(localStorage.getItem("cinewave-favs")||"[]");
const saveFavs=x=>localStorage.setItem("cinewave-favs",JSON.stringify(x));

function card(x){
  const e=document.createElement("article");
  e.className="card"; e.style.setProperty("--a",x.color||"#5b3b9e");
  e.innerHTML=`<div class="poster"><b>${escapeHtml(x.title)}</b></div>
    <div class="card-body"><strong>${escapeHtml(x.title)}</strong>
    <div class="meta">${x.type==="serie"?"Série":"Filme"} • ${x.year||"—"}</div></div>`;
  e.onclick=()=>openDetail(x);
  return e;
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderRail(id,items){let r=$(id);r.innerHTML="";items.forEach(x=>r.appendChild(card(x)))}
function render(){
  renderRail("#movieRail",catalog.filter(x=>x.type==="filme"));
  renderRail("#seriesRail",catalog.filter(x=>x.type==="serie"));
  const fs=favs(); renderRail("#favRail",catalog.filter(x=>fs.includes(x.id)));
  $("#noFav").style.display=fs.length?"none":"block";
}

function openDetail(x){
  selected=x;
  $("#detailPoster").style.setProperty("--a",x.color||"#5b3b9e");
  $("#detailPoster").textContent=x.title;
  $("#detailTitle").textContent=x.title;
  $("#detailType").textContent=x.type==="serie"?"SÉRIE":"FILME";

  const rating=x.rating ?? x.score ?? x.avaliacao;
  const genre=Array.isArray(x.genres)?x.genres.join(" • "):(x.genre||"—");
  const ratingText=rating!==undefined && rating!==null && rating!=="" ? `⭐ ${rating}` : "⭐ —";
  $("#detailMeta").textContent=`${ratingText}   •   📅 ${x.year||"—"}   •   🎭 ${genre}`;

  $("#detailDesc").textContent=x.desc||"";
  $("#modal").classList.add("open");

  const f=favs();
  $("#fav").textContent=f.includes(x.id)?"♥ Remover":"♡ Favoritar";

  const ep=$("#episodes"); ep.innerHTML="";
  if(x.episodes){
    ep.innerHTML="<h3>Episódios</h3>";
    x.episodes.forEach(a=>{
      const b=document.createElement("div");
      b.className="episode";
      b.textContent=`Temporada ${a.season} • Episódio ${a.ep} — ${a.title}`;
      b.onclick=()=>play(a.url,a.title);
      ep.appendChild(b);
    });
  }
}

function play(url,title){
  if(!url){toast("Este título não possui uma URL de reprodução autorizada no catálogo.");return}
  window.open(url,"_blank","noopener,noreferrer");
}

function openRave(title){
  // Prefer a platform-provided deep link if one is present in the catalog.
  // Never request or store Rave credentials.
  const deepLink=selected?.raveUrl || selected?.rave_url || "";
  if(deepLink){
    window.location.href=deepLink;
    setTimeout(()=>window.open("https://rave.io/","_blank","noopener,noreferrer"),900);
    return;
  }
  if(navigator.clipboard) navigator.clipboard.writeText(title).catch(()=>{});
  // Without an official deep link supplied by Rave, a website cannot
  // reliably create a room or log the user into the app.
  window.location.href="rave://";
  setTimeout(()=>{
    window.open("https://rave.io/","_blank","noopener,noreferrer");
    toast("O app Rave foi solicitado. Se não abrir, use o aplicativo instalado e procure o título.");
  },1000);
}

function toast(t){$("#toast").textContent=t;$("#toast").style.display="block";setTimeout(()=>$("#toast").style.display="none",2300)}

$("#watch").onclick=()=>selected&&play(selected.url,selected.title);
$("#rave").onclick=()=>selected&&openRave(selected.title);
$("#fav").onclick=()=>{
  let f=favs();
  if(f.includes(selected.id))f=f.filter(x=>x!==selected.id);else f.push(selected.id);
  saveFavs(f); $("#fav").textContent=f.includes(selected.id)?"♥ Remover":"♡ Favoritar";
  render(); toast(f.includes(selected.id)?"Adicionado aos favoritos":"Removido dos favoritos");
};

$("#close").onclick=()=>$("#modal").classList.remove("open");
$(".backdrop").onclick=()=>$("#modal").classList.remove("open");
$("#theme").onclick=()=>document.body.classList.toggle("light");

$("#searchOpen").onclick=()=>{$("#searchPanel").classList.add("open");$("#search").focus()};
$("#searchClose").onclick=()=>$("#searchPanel").classList.remove("open");
$("#search").oninput=e=>{
  const q=e.target.value.toLowerCase().trim(),r=$("#results"); r.innerHTML="";
  catalog.filter(x=>
    x.title.toLowerCase().includes(q) ||
    (x.genres||[]).some(g=>g.toLowerCase().includes(q))
  ).forEach(x=>{
    const d=document.createElement("div");d.className="result";
    d.innerHTML=`<b>${escapeHtml(x.title)}</b><div class="meta">${x.type} • ${x.year||"—"}</div>`;
    d.onclick=()=>{$("#searchPanel").classList.remove("open");openDetail(x)};
    r.appendChild(d);
  });
};

$("#heroWatch").onclick=()=>document.querySelector("#movies").scrollIntoView();
$("#heroInfo").onclick=()=>toast("Escolha um título para ver as opções de reprodução autorizada.");

$$(".see").forEach(b=>b.onclick=()=>{
  const t=b.dataset.jump,arr=catalog.filter(x=>x.type===t);
  toast(`${arr.length} ${t==="filme"?"filmes":"séries"} no catálogo.`);
  (t==="filme"?$("#movies"):$("#series")).scrollIntoView();
});

fetch("data/catalog.json").then(r=>r.json()).then(d=>{
  catalog=d;
  render();
  const genres=[...new Set(catalog.flatMap(x=>x.genres||[]))];
  genres.forEach(g=>{
    const b=document.createElement("button");b.className="chip";b.textContent=g;
    b.onclick=()=>{
      const arr=catalog.filter(x=>(x.genres||[]).includes(g));
      renderRail("#movieRail",arr.filter(x=>x.type==="filme"));
      renderRail("#seriesRail",arr.filter(x=>x.type==="serie"));
      toast(`${arr.length} título(s) em ${g}`);
    };
    $("#chips").appendChild(b);
  });
}).catch(()=>toast("Não foi possível carregar o catálogo."));
