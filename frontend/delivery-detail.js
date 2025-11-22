// delivery-detail.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

const did = new URLSearchParams(window.location.search).get('id');
let ditems = [];

function renderDItems(){
  const t = el('#ditems-body'); t.innerHTML = '';
  if(!ditems.length){ t.innerHTML = '<tr><td colspan="3" class="empty">No items</td></tr>'; return; }
  ditems.forEach((it, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.product_name||it.product_id}</td><td>${it.quantity}</td><td><button class="btn secondary" data-i="${idx}">Remove</button></td>`;
    t.appendChild(tr);
  });
  t.querySelectorAll('button[data-i]').forEach(b=> b.addEventListener('click', e=>{
    ditems.splice(+e.target.dataset.i,1); renderDItems();
  }));
}

el('#addDItem')?.addEventListener('click', async ()=>{
  const pid = prompt('Product id or SKU'); if(!pid) return;
  const qty = prompt('Quantity'); if(!qty || isNaN(qty)) return showToast('Invalid qty','error');
  let pname = pid;
  try{ const p = await apiFetch(`/products?sku=${encodeURIComponent(pid)}`); if(p && p.length) pname = p[0].product_name; }catch(e){}
  ditems.push({ product_id: pid, product_name: pname, quantity: parseInt(qty,10) });
  renderDItems();
});

el('#saveDelivery')?.addEventListener('click', async ()=>{
  try{
    const payload = {
      reference: el('#reference').value,
      delivery_address: el('#delivery_address').value,
      schedule_date: el('#schedule_date').value,
      responsible: el('#responsible').value,
      status: 'draft',
      items: ditems
    };
    if(did){
      await apiFetch(`/deliveries/${did}`, { method: 'PUT', body: payload });
      showToast('Saved');
    } else {
      const res = await apiFetch('/deliveries', { method: 'POST', body: payload });
      showToast('Created'); if(res && res.id) location.href = `delivery-detail.html?id=${res.id}`;
    }
  }catch(err){ console.error(err); showToast('Save failed','error'); }
});

el('#validateDelivery')?.addEventListener('click', async ()=>{
  if(!did){ showToast('Save before validating','error'); return; }
  if(!confirm('Validate delivery and reduce stock?')) return;
  try{
    await apiFetch(`/deliveries/${did}/validate`, { method: 'POST' });
    showToast('Validated'); location.href='deliveries.html';
  }catch(err){ console.error(err); showToast('Validate failed','error'); }
});

(async function init(){
  if(did){
    try{
      const d = await apiFetch(`/deliveries/${did}`);
      el('#reference').value = d.reference || '';
      el('#delivery_address').value = d.delivery_address || '';
      el('#schedule_date').value = d.schedule_date ? d.schedule_date.split('T')[0] : '';
      el('#responsible').value = d.responsible || '';
      ditems = (d.items||[]).map(it => ({ product_id: it.product_id, product_name: it.product_name, quantity: it.quantity }));
      renderDItems();
    }catch(e){ console.warn(e); }
  }
})();
