// ledger.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadLedger(q='') {
  try {
    const rows = await apiFetch('/ledger' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    const tb = el('#ledger-body'); tb.innerHTML = '';
    if (!rows?.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">No move history found</td></tr>'; return; }
    rows.forEach(move => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${move.reference||''}</td><td>${fmtDate(move.date)}</td><td>${move.product_name||''}</td>
        <td>${move.from_location||''}</td><td>${move.to_location||''}</td><td>${move.change_qty||move.quantity||0}</td>
        <td>${move.movement_type||move.type||''}</td><td>${move.status||'done'}</td>`;
      tb.appendChild(tr);
    });
  } catch (err) {
    console.error('Ledger error:', err);
    el('#ledger-body').innerHTML = '<tr><td colspan="8" class="empty">Backend not connected</td></tr>';
  }
}

el('#ledger-search')?.addEventListener('input', e => loadLedger(e.target.value));
loadLedger();
