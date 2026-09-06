let catalog=[],selected=null,filter="todos";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const favs=()=>JSON.parse(localStorage.getItem("cinewave-favs")||"[]");
const saveFavs=x=>localStorage.setItem("cinewave-favs",JSON.stringify(x));
function card(x){let e=document.createElement("article");e.className="card";e.style.setProperty("--a",x.color);e.innerHTML=`<div class="poster"><b>${x.title}</b></div><div class="card-body"><strong>${x.title}</strong><div class="meta">${x.type==="serie"?"Série":"Filme"} • ${x.year}</div></div>`;e.onclick=()=>openDetail(x);return e}
function renderRail(id,items){let r=$(id);r.innerHTML="";items.forEach(x=>r.appendChild(card(x)))}
function render(){renderRail("#movieRail",catalog.filter(x=>x.type==="filme"));renderRail("#seriesRail",catalog.filter(x=>x.type==="serie"));let fs=favs();renderRail("#favRail",catalog.filter(x=>fs.includes(x.id)));$("#noFav").style.display=fs.length?"none":"block"}
function openDetail(x){selected=x;$("#detailPoster").style.setProperty("--a",x.color);$("#detailPoster").textContent=x.title;$("#detailTitle").textContent=x.title;$("#detailType").textContent=x.type==="serie"?"SÉRIE":"FILME";$("#detailMeta").textContent=`${x.year} • ${x.genres.join(" • ")}`;$("#detailDesc").textContent=x.desc;$("#modal").classList.add("open");let f=favs();$("#fav").textContent=f.includes(x.id)?"♥ Remover":"♡ Favoritar";let ep=$("#episodes");ep.innerHTML="";if(x.episodes){ep.innerHTML="<h3>Episódios</h3>";x.episodes.forEach(a=>{let b=document.createElement("div");b.className="episode";b.textContent=`Temporada ${a.season} • Episódio ${a.ep} — ${a.title}`;b.onclick=()=>play(a.url,a.title);ep.appendChild(b)})}}
function play(url,title){if(!url){toast("Este episódio é um modelo. Adicione uma URL de vídeo autorizada no catálogo.");return}window.open(url,"_blank","noopener,noreferrer")}
function toast(t){$("#toast").textContent=t;$("#toast").style.display="block";setTimeout(()=>$("#toast").style.display="none",2300)}
$("#watch").onclick=()=>selected&&play(selected.url,selected.title);
$("#fav").onclick=()=>{let f=favs();if(f.includes(selected.id))f=f.filter(x=>x!==selected.id);else f.push(selected.id);saveFavs(f);$("#fav").textContent=f.includes(selected.id)?"♥ Remover":"♡ Favoritar";render();toast(f.includes(selected.id)?"Adicionado aos favoritos":"Removido dos favoritos")};
$("#rave").onclick=()=>{if(!selected)return;navigator.clipboard?.writeText(selected.title);window.open("https://rave.io/","_blank","noopener,noreferrer");toast("Título copiado. Procure o conteúdo dentro do serviço compatível no Rave.")};
$("#close").onclick=()=>$("#modal").classList.remove("open");$(".backdrop").onclick=()=>$("#modal").classList.remove("open");
$("#theme").onclick=()=>document.body.classList.toggle("light");
$("#searchOpen").onclick=()=>{$("#searchPanel").classList.add("open");$("#search").focus()};$("#searchClose").onclick=()=>$("#searchPanel").classList.remove("open");
$("#search").oninput=e=>{let q=e.target.value.toLowerCase();let r=$("#results");r.innerHTML="";catalog.filter(x=>x.title.toLowerCase().includes(q)||x.genres.some(g=>g.toLowerCase().includes(q))).forEach(x=>{let d=document.createElement("div");d.className="result";d.innerHTML=`<b>${x.title}</b><div class="meta">${x.type} • ${x.year}</div>`;d.onclick=()=>{$("#searchPanel").classList.remove("open");openDetail(x)};r.appendChild(d)})};
$("#heroWatch").onclick=()=>document.querySelector("#movies").scrollIntoView();
$("#heroInfo").onclick=()=>toast("Use o catálogo para descobrir títulos autorizados e salve seus favoritos.");
$$(".see").forEach(b=>b.onclick=()=>{let t=b.dataset.jump;let arr=catalog.filter(x=>x.type===t);toast(`${arr.length} ${t==="filme"?"filmes":"séries"} no catálogo de demonstração.`);(t==="filme"?$("#movies"):$("#series")).scrollIntoView()});
const genres=[...new Set(catalog.flatMap(x=>x.genres))];genres.forEach(g=>{let b=document.createElement("button");b.className="chip";b.textContent=g;b.onclick=()=>{let arr=catalog.filter(x=>x.genres.includes(g));renderRail("#movieRail",arr.filter(x=>x.type==="filme"));renderRail("#seriesRail",arr.filter(x=>x.type==="serie"));toast(`${arr.length} título(s) em ${g}`)};$("#chips").appendChild(b)});
fetch("data/catalog.json").then(r=>r.json()).then(d=>{catalog=d;render();});
