// receipt-detail.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

const rid = new URLSearchParams(window.location.search).get('id');
let items = [];

async function loadWarehousesForSelect(){
  try{
    const whs = await apiFetch('/warehouses');
    const sel = el('#to_warehouse'); sel.innerHTML = '<option value="">Select</option>';
    whs.forEach(w => sel.insertAdjacentHTML('beforeend', `<option value="${w.id}">${w.wh_name}</option>`));
  }catch(e){ console.warn(e); }
}

async function loadLocations(warehouseId){
  const sel = el('#to_location'); sel.innerHTML = '<option value="">Select</option>';
  if(!warehouseId) return;
  const locs = await apiFetch(`/locations?warehouse_id=${warehouseId}`);
  locs.forEach(l => sel.insertAdjacentHTML('beforeend', `<option value="${l.id}">${l.loc_name}</option>`));
}

function renderItems(){
  const tb = el('#items-body'); tb.innerHTML = '';
  if(!items.length){ tb.innerHTML = '<tr><td colspan="3" class="empty">No items</td></tr>'; return; }
  items.forEach((it, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.product_name||it.product_id}</td><td>${it.quantity}</td><td><button class="btn secondary" data-i="${idx}">Remove</button></td>`;
    tb.appendChild(tr);
  });
  tb.querySelectorAll('button[data-i]').forEach(b=> b.addEventListener('click', e => { items.splice(+e.target.dataset.i,1); renderItems(); }));
}

el('#to_warehouse')?.addEventListener('change', e=> loadLocations(e.target.value));
el('#addItem')?.addEventListener('click', async ()=>{
  const pid = prompt('Product id or SKU'); if(!pid) return;
  const qty = prompt('Quantity'); if(!qty || isNaN(qty)) return showToast('Invalid qty','error');
  let pname = pid;
  try{ const p = await apiFetch(`/products?sku=${encodeURIComponent(pid)}`); if(p && p.length) pname = p[0].product_name; } catch(e){}
  items.push({ product_id: pid, product_name: pname, quantity: parseInt(qty,10) });
  renderItems();
});

el('#saveBtn')?.addEventListener('click', async ()=>{
  try{
    const payload = {
      reference: el('#reference').value,
      from_contact: el('#from_contact').value,
      warehouse_id: el('#to_warehouse').value || null,
      location_id: el('#to_location').value || null,
      schedule_date: el('#schedule_date').value,
      status: 'draft',
      items
    };
    if(rid){
      await apiFetch(`/receipts/${rid}`, { method: 'PUT', body: payload });
      showToast('Saved');
    } else {
      const res = await apiFetch('/receipts', { method: 'POST', body: payload });
      showToast('Created');
      if(res && res.id) location.href = `receipt-detail.html?id=${res.id}`;
    }
  }catch(err){ console.error(err); showToast('Save failed','error'); }
});

el('#validateBtn')?.addEventListener('click', async ()=>{
  if(!rid){ showToast('Save before validating','error'); return; }
  if(!confirm('Validate receipt and add stock?')) return;
  try{
    await apiFetch(`/receipts/${rid}/validate`, { method: 'POST' });
    showToast('Receipt validated');
    location.href = 'receipts.html';
  }catch(err){ console.error(err); showToast('Validate failed','error'); }
});

(async function init(){
  await loadWarehousesForSelect();
  if(rid){
    try{
      const r = await apiFetch(`/receipts/${rid}`);
      el('#reference').value = r.reference || '';
      el('#from_contact').value = r.from_contact || '';
      el('#schedule_date').value = r.schedule_date ? r.schedule_date.split('T')[0] : '';
      if(r.warehouse_id) { el('#to_warehouse').value = r.warehouse_id; await loadLocations(r.warehouse_id); el('#to_location').value = r.location_id || ''; }
      items = (r.items || []).map(it => ({ product_id: it.product_id, product_name: it.product_name, quantity: it.quantity }));
      renderItems();
    }catch(e){ console.warn(e); }
  }
})();
