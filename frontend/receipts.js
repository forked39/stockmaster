// receipts.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadReceipts(q='') {
  try {
    const rows = await apiFetch('/receipts' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    const tb = el('#receipts-body'); tb.innerHTML = '';
    if (!rows?.length) { tb.innerHTML = '<tr><td colspan="7" class="empty">No receipts</td></tr>'; return; }
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.reference || ('WH/IN/' + r.id)}</td>
        <td>${r.from_contact || '-'}</td>
        <td>${r.to_location_name || r.to_warehouse_name || '-'}</td>
        <td>${r.contact || '-'}</td>
        <td>${fmtDate(r.schedule_date)}</td>
        <td>${r.status}</td>
        <td><a class="btn secondary" href="receipt-detail.html?id=${r.id}">Open</a></td>`;
      tb.appendChild(tr);
    });
  } catch (err) {
    console.warn(err);
    el('#receipts-body').innerHTML = '<tr><td colspan="7" class="empty">Demo — backend not ready</td></tr>';
  }
}

el('#receipt-search')?.addEventListener('input', e => loadReceipts(e.target.value));
el('#newReceipt')?.addEventListener('click', () => location.href='receipt-detail.html');
loadReceipts();
