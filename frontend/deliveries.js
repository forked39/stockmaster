// deliveries.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadDeliveries(q='') {
  try {
    const rows = await apiFetch('/deliveries' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    const tb = el('#deliveries-body'); tb.innerHTML = '';
    if (!rows?.length) { tb.innerHTML = '<tr><td colspan="7" class="empty">No deliveries</td></tr>'; return; }
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.reference || ('WH/OUT/' + r.id)}</td><td>${r.from_location_name||''}</td>
        <td>${r.delivery_address || r.to_location_name || ''}</td><td>${r.contact||''}</td>
        <td>${fmtDate(r.schedule_date)}</td><td>${r.status}</td>
        <td><a class="btn secondary" href="delivery-detail.html?id=${r.id}">Open</a></td>`;
      tb.appendChild(tr);
    });
  } catch (err) {
    console.warn(err);
    el('#deliveries-body').innerHTML = '<tr><td colspan="7" class="empty">Demo — backend not ready</td></tr>';
  }
}

el('#delivery-search')?.addEventListener('input', e => loadDeliveries(e.target.value));
el('#newDelivery')?.addEventListener('click', () => location.href='delivery-detail.html');
loadDeliveries();
