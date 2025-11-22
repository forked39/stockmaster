// Dashboard page logic
async function loadDashboard(){
  try{
    const k = await apiFetch('/dashboard/kpis');
    document.getElementById('total-products').textContent = k.total_products ?? 0;
    document.getElementById('low-stock').textContent = k.low_stock_count ?? 0;
    document.getElementById('pending-receipts').textContent = k.pending_receipts ?? 0;
    document.getElementById('pending-deliveries').textContent = k.pending_deliveries ?? 0;
  }catch(e){
    console.warn('KPIs fallback', e);
    document.getElementById('total-products').textContent = 12;
    document.getElementById('low-stock').textContent = 2;
    document.getElementById('pending-receipts').textContent = 1;
    document.getElementById('pending-deliveries').textContent = 0;
  }
  await loadActivity();
}
async function loadActivity(){
  try{
    const rows = await apiFetch('/ledger/recent');
    const tb = document.getElementById('activity-body'); tb.innerHTML='';
    if(!rows.length) { tb.innerHTML='<tr><td colspan="5" class="empty">No activity</td></tr>'; return; }
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fmtDate(r.created_at)}</td><td>${r.type}</td><td>${r.product_name}</td><td>${r.change_qty}</td><td>${r.ref || ''}</td>`;
      tb.appendChild(tr);
    });
  }catch(e){
    document.getElementById('activity-body').innerHTML = '<tr><td colspan="5" class="empty">Demo activity — connect backend</td></tr>';
  }
}
loadDashboard(); setInterval(loadDashboard,12000);
