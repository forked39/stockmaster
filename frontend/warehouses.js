// warehouses.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadWarehouses(){
  try{
    const rows = await apiFetch('/warehouses');
    const tb = el('#wh-body'); tb.innerHTML = '';
    if(!rows?.length){ tb.innerHTML = '<tr><td colspan="4" class="empty">No warehouses</td></tr>'; return; }
    rows.forEach(w=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${w.short_code}</td><td>${w.wh_name}</td><td>${w.address||''}</td><td><button class="btn secondary" data-id="${w.id}">Edit</button></td>`;
      tb.appendChild(tr);
    });
  }catch(err){ console.warn(err); el('#wh-body').innerHTML = '<tr><td colspan="4" class="empty">Demo</td></tr>'; }
}

el('#newWh')?.addEventListener('click', async ()=>{
  const code = prompt('Short code'); if(!code) return;
  const name = prompt('Name'); if(!name) return;
  const addr = prompt('Address');
  try{ await apiFetch('/warehouses', { method: 'POST', body: { short_code: code, wh_name: name, address: addr } }); showToast('Created'); loadWarehouses(); }
  catch(err){ showToast('Create failed','error'); }
});

loadWarehouses();
