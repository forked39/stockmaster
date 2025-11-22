// locations.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadLocations(){
  try{
    const rows = await apiFetch('/locations');
    const tb = el('#loc-body'); tb.innerHTML = '';
    if(!rows?.length){ tb.innerHTML = '<tr><td colspan="4" class="empty">No locations</td></tr>'; return; }
    rows.forEach(l=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${l.loc_name}</td><td>${l.wh_name||''}</td><td>${l.short_code||''}</td>
        <td><button class="btn secondary" data-id="${l.id}">Edit</button></td>`;
      tb.appendChild(tr);
    });
  }catch(err){ console.warn(err); el('#loc-body').innerHTML = '<tr><td colspan="4" class="empty">Demo</td></tr>'; }
}

el('#newLoc')?.addEventListener('click', async ()=>{
  const name = prompt('Location name'); if(!name) return;
  const whId = prompt('Warehouse ID (optional)');
  try{ await apiFetch('/locations', { method:'POST', body: { loc_name: name, warehouse_id: whId || null } }); showToast('Created'); loadLocations(); }
  catch(err){ showToast('Create failed','error'); }
});

loadLocations();
