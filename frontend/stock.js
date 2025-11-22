// stock.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadStock(q='') {
  try {
    const rows = await apiFetch('/stock' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    const tb = el('#stock-body'); tb.innerHTML = '';
    if (!rows?.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No stock</td></tr>'; return; }
    rows.forEach(r => {
      const free = (r.qty_on_hand||0) - (r.qty_reserved||0);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.product_name}</td><td>${r.sku||''}</td><td>${r.qty_on_hand||0}</td><td>${free}</td><td>${r.reorder_point||0}</td>
        <td><button class="btn secondary" data-id="${r.product_id}">Adjust</button></td>`;
      tb.appendChild(tr);
    });

    tb.querySelectorAll('button[data-id]').forEach(b => b.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      const qty = prompt('Enter counted quantity (for default warehouse)');
      if (qty == null) return;
      if (isNaN(qty)) return showToast('Invalid number','error');
      await apiFetch('/adjustments', { method:'POST', body: { product_id: id, warehouse_id: null, location_id: null, counted_qty: parseInt(qty,10), reason: 'Manual adjust' } });
      showToast('Adjusted');
      loadStock();
    }));

  } catch (err) {
    console.warn(err);
    el('#stock-body').innerHTML = '<tr><td colspan="6" class="empty">Demo — backend not ready</td></tr>';
  }
}

el('#stock-search')?.addEventListener('input', e => loadStock(e.target.value));
loadStock();
