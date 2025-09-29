let data={students:[],routes:[]};
const dias=['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];

async function loadData(){
  const res=await fetch('data/schedule.json');
  data=await res.json();
  populateDaySelect();
  render();
  requestNotificationPermission();
  scheduleReminders();
}

function populateDaySelect(){
  const sel=document.getElementById('daySelect');
  sel.innerHTML='';
  const hoje=new Date();
  for(let i=0;i<7;i++){
    const d=new Date();
    d.setDate(hoje.getDate()+i);
    const nome=d.toLocaleDateString('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'});
    const opt=document.createElement('option');
    opt.value=dias[d.getDay()];
    opt.textContent=nome;
    sel.appendChild(opt);
  }
  sel.value=dias[hoje.getDay()];
  sel.addEventListener('change',render);
}

function render(){
  const dia=document.getElementById('daySelect').value;
  const tbody=document.getElementById('tbody');
  tbody.innerHTML='';
  const lista=data.students.filter(s=>s.days.includes(dia));
  lista.sort((a,b)=>a.time.localeCompare(b.time));
  lista.forEach(s=>{
    const tr=document.createElement('tr');
    const checked=s.confirmed?'checked':'';
    tr.innerHTML=`<td>${s.time}</td><td>${s.name}</td><td>${s.school}</td><td>${s.notes||''}</td>
    <td><input type="checkbox" data-id="${s.id}" ${checked}></td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change',e=>{
      const id=Number(e.target.dataset.id);
      const st=data.students.find(x=>x.id===id);
      st.confirmed=e.target.checked;
      saveLocal();
    });
  });
}

function saveLocal(){ localStorage.setItem('recolha_data',JSON.stringify(data)); }
function loadLocal(){ const s=localStorage.getItem('recolha_data'); if(s) data=JSON.parse(s); }

document.getElementById('resetBtn').addEventListener('click',()=>{
  data.students.forEach(s=>s.confirmed=false);
  saveLocal();
  render();
});

function requestNotificationPermission(){
  if('Notification' in window){ Notification.requestPermission(); }
}
function scheduleReminders(){
  if(!('Notification' in window)) return;
  const hoje=new Date();
  const dia=dias[hoje.getDay()];
  const hojeLista=data.students.filter(s=>s.days.includes(dia));
  hojeLista.forEach(s=>{
    if(!s.time) return;
    const [hh,mm]=s.time.split(':').map(Number);
    const agendado=new Date(); agendado.setHours(hh,mm,0,0);
    agendado.setMinutes(agendado.getMinutes()-20);
    const delay=agendado.getTime()-Date.now();
    if(delay>0){
      setTimeout(()=>{
        new Notification('Recolha Escolar',{body:`${s.name} - ${s.school} às ${s.time}`});
      },delay);
    }
  });
}

window.addEventListener('load',()=>{ loadLocal(); loadData(); });
