// products.js
if (!localStorage.getItem("token")) {
  window.location.href = "auth.html";
}

async function loadProducts(q='') {
  try {
    const rows = await apiFetch('/products' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    const tb = el('#products-body');
    tb.innerHTML = '';
    if (!rows?.length) {
      tb.innerHTML = '<tr><td colspan="6" class="empty">No products</td></tr>';
      return;
    }
    rows.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.product_name}</td><td>${p.sku||''}</td><td>${p.uom||''}</td><td>${p.unit_cost ?? ''}</td>
        <td>${p.category_name || p.category || ''}</td>
        <td>
          <button class="btn secondary" data-id="${p.id}">Edit</button>
          <button class="btn" data-del="${p.id}">Delete</button>
        </td>`;
      tb.appendChild(tr);
    });

    tb.querySelectorAll('button[data-id]').forEach(b => b.addEventListener('click', e => {
      const id = e.target.dataset.id;
      location.href = `products-edit.html?id=${id}`;
    }));
    tb.querySelectorAll('button[data-del]').forEach(b => b.addEventListener('click', async e => {
      if (!confirm('Delete product?')) return;
      const id = e.target.dataset.del;
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      showToast('Deleted');
      loadProducts();
    }));
  } catch (err) {
    console.warn(err);
    el('#products-body').innerHTML = '<tr><td colspan="6" class="empty">Demo — backend not ready</td></tr>';
  }
}

el('#product-search')?.addEventListener('input', e => loadProducts(e.target.value));
el('#new-product')?.addEventListener('click', async () => {
  const name = prompt('Product name'); if(!name) return;
  const sku = prompt('SKU'); const uom = prompt('Unit (pcs/kg)'); const cost = prompt('Unit cost'); const category = prompt('Category');
  try {
    await apiFetch('/products', { method: 'POST', body: { product_name: name, sku, uom, unit_cost: parseFloat(cost||0), category }});
    showToast('Created');
    loadProducts();
  } catch(err) { showToast('Create failed','error'); }
});

loadProducts();
