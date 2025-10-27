// Foto kelompok popup
document.querySelectorAll('.kelompok-container img').forEach(image =>{
    image.onclick = () =>{
      document.querySelector('.popup-image').style.display = 'block';
      document.querySelector('.popup-image img').src = image.getAttribute('src');
    }
  });
  
  document.querySelector('.popup-image span').onclick = () =>{
    document.querySelector('.popup-image').style.display = 'none';
  }
  
  // Produk
  const products = [
    {id:1,name:'Galon Isi Ulang 19L',desc:'Air mineral isi ulang 19 liter, sanitasi terjaga',price:25000},
    {id:2,name:'Galon Baru 19L (Kosong)',desc:'Galon PET kosong untuk pertama kali',price:35000},
    {id:3,name:'Isi Ulang 19L - Paket Hemat x3',desc:'3x isi ulang, hemat 10%',price:67500},
    {id:4,name:'Filter & Sanitasi Tambahan',desc:'Layanan sanitasi ekstra untuk galon',price:12000},
    {id:5,name:'Langganan Bulanan (4 isi)',desc:'4 isi per bulan dengan diskon',price:90000},
    {id:6,name:'Delivery Express',desc:'Pengantaran prioritas dalam 24 jam',price:20000}
  ];
  
  const formatRP = v => 'Rp' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  const productsGrid = document.getElementById('productsGrid');
  function renderProducts(list){
    productsGrid.innerHTML = '';
    list.forEach(p=>{
      const card = document.createElement('div'); 
      card.className='card';
      card.innerHTML = `
        <div class="img"></div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div class="small">${p.desc}</div>
            </div>
            <div class="price">${formatRP(p.price)}</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="btn" data-add="${p.id}">Tambah</button>
            <button class="btn ghost" data-info="${p.id}">Detail</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }
  renderProducts(products);
  
  // Cart logic
  let cart = JSON.parse(localStorage.getItem('ecogalon_cart')||'[]');
  const cartCountEl = document.getElementById('cartCount');
  const cartListEl = document.getElementById('cartList');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartPanel = document.getElementById('cartPanel');
  
  function saveCart(){ 
    localStorage.setItem('ecogalon_cart', JSON.stringify(cart)); 
    updateCartUI(); 
  }
  function updateCartUI(){
    cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
    cartListEl.innerHTML = '';
    let total = 0;
    cart.forEach(item=>{
      total += item.qty*item.price;
      const row = document.createElement('div'); 
      row.className='cart-item';
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${item.name}</div>
          <div class="small">${formatRP(item.price)} x ${item.qty}</div>
        </div>
        <div class="qty">
          <button class="btn ghost" data-dec="${item.id}">-</button>
          <div class="small" style="min-width:22px;text-align:center">${item.qty}</div>
          <button class="btn" data-inc="${item.id}">+</button>
        </div>`;
      cartListEl.appendChild(row);
    });
    cartTotalEl.textContent = formatRP(total);
  }
  
  document.body.addEventListener('click', e=>{
    if(e.target.dataset.add){
      const id = Number(e.target.dataset.add); 
      const p = products.find(x=>x.id===id);
      const existing = cart.find(x=>x.id===id);
      if(existing) existing.qty++;
      else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
      saveCart();
      showToast('Ditambahkan ke keranjang');
    }
    if(e.target.dataset.info){
      const id = Number(e.target.dataset.info); 
      const p = products.find(x=>x.id===id);
      alert(p.name + "\n\n" + p.desc + "\nHarga: " + formatRP(p.price));
    }
    if(e.target.dataset.inc){
      const id = Number(e.target.dataset.inc); 
      const it = cart.find(x=>x.id===id); 
      if(it){ it.qty++; saveCart(); }
    }
    if(e.target.dataset.dec){
      const id = Number(e.target.dataset.dec); 
      const it = cart.find(x=>x.id===id); 
      if(it){ it.qty--; if(it.qty<=0) cart = cart.filter(x=>x.id!==id); saveCart(); }
    }
  });
  
  document.getElementById('openCartBtn').addEventListener('click', ()=>{ 
    cartPanel.style.display = cartPanel.style.display==='none'?'block':'none'; 
    updateCartUI(); 
  });
  document.getElementById('checkoutBtn').addEventListener('click', ()=>{ openModal(); });
  
  // search
  document.getElementById('searchInput').addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p=>p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    renderProducts(filtered);
  });
  
  // modal
  const modal = document.getElementById('modalBackdrop');
  document.getElementById('orderNow').addEventListener('click', openModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  
  function openModal(){ 
    if(cart.length===0){ 
      if(!confirm('Keranjang kosong. Mau pesan 1 galon 19L sekarang?')) return; 
      cart.push({id:1,name:products[0].name,price:products[0].price,qty:1}); 
      saveCart(); 
    }
    modal.style.display='flex'; 
  }
  function closeModal(){ modal.style.display='none'; }
  
  document.getElementById('submitOrder').addEventListener('click', ()=>{
    const name = document.getElementById('nameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    if(!name||!phone||!address){ alert('Mohon isi semua data pemesanan.'); return; }
    const order = {customer:{name,phone,address},items:cart, total:cart.reduce((s,i)=>s+i.qty*i.price,0), date:new Date().toISOString()};
    console.log('Order submitted', order);
    cart = []; saveCart(); closeModal(); alert('Pesanan diterima! Tim kami akan menghubungi Anda.');
  });
  
  // toast
  function showToast(msg){
    const t = document.createElement('div'); 
    t.textContent = msg; 
    t.style= 'position:fixed;left:50%;transform:translateX(-50%);bottom:36px;background:#0f172a;color:white;padding:8px 14px;border-radius:8px;opacity:0;transition:all .25s';
    document.body.appendChild(t);
    requestAnimationFrame(()=>{ t.style.opacity=1; t.style.bottom='46px'; });
    setTimeout(()=>{ t.style.opacity=0; t.style.bottom='36px'; setTimeout(()=>t.remove(),300); },1200);
  }
  
  // init
  (function(){ 
    document.getElementById('year').textContent = new Date().getFullYear(); 
    updateCartUI(); 
  })();
  