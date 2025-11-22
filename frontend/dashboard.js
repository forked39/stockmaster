// dashboard.js


async function loadKPIs() {
  try {
    const [productCount, lowStock, pendingReceipts, pendingDeliveries] = await Promise.all([
      apiFetch('/products/count'),
      apiFetch('/stock/low'),
      apiFetch('/receipts?status=draft'),
      apiFetch('/deliveries?status=draft')
    ]);
    el('#k-total').textContent = productCount?.count ?? '0';
    el('#k-low').textContent = (lowStock?.length ?? 0);
    el('#k-receipts').textContent = (pendingReceipts?.length ?? 0);
    el('#k-deliveries').textContent = (pendingDeliveries?.length ?? 0);
  } catch (err) {
    console.warn('KPIs load failed', err);
    el('#k-total').textContent = '—';
    el('#k-low').textContent = '—';
    el('#k-receipts').textContent = '—';
    el('#k-deliveries').textContent = '—';
  }
}

async function loadRecentMoves(q='') {
  const body = el('#recent-body');
  try {
    const rows = await apiFetch('/move_history' + (q ? `?q=${encodeURIComponent(q)}` : '?limit=10'));
    body.innerHTML = '';
    if (!rows?.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty">No recent moves</td></tr>';
      return;
    }
    rows.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fmtDate(m.date)}</td><td>${m.movement_type||m.type||'-'}</td><td>${m.product_name||'-'}</td><td>${m.quantity}</td><td>${m.from_location||''}</td><td>${m.to_location||''}</td>`;
      body.appendChild(tr);
    });
  } catch (err) {
    console.warn('Recent moves load failed', err);
    body.innerHTML = '<tr><td colspan="6" class="empty">Backend not connected</td></tr>';
  }
}

el('#dash-search')?.addEventListener('input', e => {
  const q = e.target.value.trim();
  loadRecentMoves(q);
});

loadKPIs();
loadRecentMoves();
