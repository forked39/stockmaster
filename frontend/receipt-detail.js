// receipt-detail.js
const rparams = new URLSearchParams(window.location.search);
const receiptId = rparams.get('id');
let items = [];

function renderItems(){
  const tbody = document.getElementById('items-body');
  tbody.innerHTML = '';
  if(!items.length){
    tbody.innerHTML = '<tr><td colspan="3" class="empty">No items</td></tr>';
    return;
  }
  items.forEach((it, idx)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.product_name || it.product_id}</td><td>${it.qty}</td>
      <td><button class="btn secondary" data-i="${idx}">Remove</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button[data-i]').forEach(b => {
    b.addEventListener('click', e => {
      const i = +e.target.dataset.i;
      items.splice(i,1);
      renderItems();
    });
  });
}

document.getElementById('addItem').addEventListener('click', () => {
  const pid = prompt('Product id or name');
  if(!pid) return;
  const qty = prompt('Quantity');
  if(!qty || isNaN(qty)) { showToast('Invalid qty','error'); return; }
  items.push({product_id: pid, product_name: pid, qty: parseInt(qty,10)});
  renderItems();
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  try{
    const payload = { vendor: document.getElementById('vendor').value, ref: document.getElementById('ref').value, items };
    // create or update
    if(receiptId){
      await apiFetch(`/receipts/${receiptId}`, { method: 'PUT', body: payload });
      showToast('Saved');
    } else {
      const res = await apiFetch('/receipts', { method: 'POST', body: payload });
      showToast('Created');
      if(res && res.id) location.href = `receipt-detail.html?id=${res.id}`;
    }
  }catch(err){ console.error(err); showToast('Save failed','error'); }
});

document.getElementById('validateBtn').addEventListener('click', async () => {
  if(!confirm('Validate receipt and add stock?')) return;
  try{
    if(receiptId){
      await apiFetch(`/receipts/${receiptId}/validate`, { method: 'POST' });
      showToast('Validated');
      location.href = 'receipts.html';
    } else {
      const res = await apiFetch('/receipts', { method: 'POST', body: { vendor: document.getElementById('vendor').value, items } });
      await apiFetch(`/receipts/${res.id}/validate`, { method: 'POST' });
      showToast('Validated');
      location.href = 'receipts.html';
    }
  }catch(err){ console.error(err); showToast('Validation failed','error'); }
});

(async function init(){
  if(receiptId){
    try{
      const r = await apiFetch(`/receipts/${receiptId}`);
      document.getElementById('vendor').value = r.vendor || '';
      document.getElementById('ref').value = r.ref || '';
      items = (r.items || []).map(it => ({ product_id: it.product_id, product_name: it.product_name, qty: it.qty }));
      renderItems();
    }catch(err){ console.warn(err); }
  }
})();
