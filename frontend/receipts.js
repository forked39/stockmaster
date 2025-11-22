// receipts.js
async function loadReceipts(q=''){
  try{
    const qstr = q ? `?q=${encodeURIComponent(q)}` : '';
    const rows = await apiFetch('/receipts' + qstr);
    const tb = document.getElementById('receipts-body');
    tb.innerHTML = '';
    if(!rows.length){
      tb.innerHTML = '<tr><td colspan="5" class="empty">No receipts</td></tr>';
      return;
    }
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.ref || 'REC/' + r.id}</td>
        <td>${r.vendor || '-'}</td>
        <td>${fmtDate(r.created_at)}</td>
        <td>${r.status}</td>
        <td><a class="btn secondary" href="receipt-detail.html?id=${r.id}">Open</a></td>`;
      tb.appendChild(tr);
    });
  }catch(err){
    console.warn('loadReceipts error', err);
    document.getElementById('receipts-body').innerHTML = '<tr><td colspan="5" class="empty">Demo list — start your backend</td></tr>';
  }
}

document.getElementById('newReceipt').addEventListener('click', ()=> location.href = 'receipt-detail.html');
document.getElementById('receipt-search').addEventListener('input', e => loadReceipts(e.target.value));

loadReceipts();
