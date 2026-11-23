  /* ---------- EDIT YOUR MENU HERE ---------- */
  const MENU = [
    { id: 1, name: "Espresso",        cat: "coffee", price: 75.0, desc: "Rich, bold, and short." },
    { id: 2, name: "Caffe Latte",     cat: "coffee", price: 80.0, desc: "Espresso with steamed milk." },
    { id: 3, name: "Iced Americano",  cat: "coffee", price: 75.0, desc: "Cold, clean, and strong." },
    { id: 4, name: "Matcha Latte",    cat: "tea",    price: 100.0, desc: "Ceremonial matcha, oat or dairy milk." },
    { id: 5, name: "Jasmine Tea",     cat: "tea",    price: 75.0, desc: "Fragrant loose-leaf green tea." },
    { id: 6, name: "Butter Croissant",cat: "food",   price: 80.0, desc: "Baked fresh every morning." },
    { id: 7, name: "Banana Bread",    cat: "food",   price: 70.0, desc: "Moist, warm, and homemade." },
    { id: 8, name: "Ham & Cheese Toastie", cat: "food", price: 100.0, desc: "Grilled on sourdough." }
  ];
  const money = n => "₱" + n.toFixed(2);   // change "₱" to your currency symbol
  // { itemId: quantity }, remembered between visits
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem("cart") || "{}"); } catch (e) { cart = {}; }
  // drop anything that is no longer on the menu
  Object.keys(cart).forEach(id => { if (!MENU.some(i => i.id == id)) delete cart[id]; });

  /* ---------- MOBILE NAV ---------- */
  const toggle = document.getElementById("menu-toggle");
  const links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open"); toggle.setAttribute("aria-expanded", false);
  }));

  /* ---------- HIGHLIGHT ACTIVE NAV LINK ON SCROLL ---------- */
  const navAnchors = [...links.querySelectorAll("a")];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section").forEach(s => observer.observe(s));

  /* ---------- MENU RENDER + FILTER ---------- */
  const grid = document.getElementById("menu-grid");
  function renderMenu(cat = "all") {
    grid.innerHTML = "";
    MENU.filter(i => cat === "all" || i.cat === cat).forEach(item => {
      const el = document.createElement("article");
      el.className = "item";
      const artName = {
        1: "espresso", 2: "caffe-latte", 3: "iced-americano", 4: "matcha-latte",
        5: "jasmine-tea", 6: "butter-croissant", 7: "banana-bread", 8: "ham-cheese-toastie"
      }[item.id];

      el.innerHTML = `
        <button class="product-flip" type="button" aria-pressed="false"
          aria-label="Show illustration of ${item.name}. Activate again to return to details.">
          <span class="product-flip-inner">
            <span class="product-face product-front">
              <span class="product-hint">TAP TO SEE THE ILLUSTRATION ↗</span>
              <span class="product-name">${item.name}</span>
              <span class="product-description">${item.desc}</span>
              <span class="product-price">${money(item.price)}</span>
            </span>
            <span class="product-face product-back">
              <img src="${artName}.jpg" alt="${item.name} illustration" loading="lazy">
              <span class="back-caption">${item.name}</span>
              <span class="back-hint">TAP TO FLIP BACK ↻</span>
            </span>
          </span>
        </button>
        <div class="item-actions">
          <button class="add" data-id="${item.id}" type="button">Add to order</button>
        </div>`;
      grid.appendChild(el);
    });
  }
  document.getElementById("tabs").addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-pressed", t === tab));
    renderMenu(tab.dataset.cat);
  });
  grid.addEventListener("click", e => {
    const flip = e.target.closest(".product-flip");
    if (flip) {
      const flipped = flip.closest(".item").classList.toggle("is-flipped");
      flip.setAttribute("aria-pressed", String(flipped));
      const name = flip.closest(".item").querySelector(".product-name").textContent;
      flip.setAttribute("aria-label", flipped
        ? `Show ${name} details. Activate again to return to the illustration.`
        : `Show illustration of ${name}. Activate again to return to details.`);
      return;
    }

    const btn = e.target.closest(".add");
    if (!btn) return;
    addToCart(Number(btn.dataset.id));
    btn.textContent = "Added!";
    btn.classList.add("added");
    setTimeout(() => { btn.textContent = "Add to order"; btn.classList.remove("added"); }, 900);
  });

  /* ---------- CART ---------- */
  const drawer = document.getElementById("drawer");
  const cartList = document.getElementById("cart-items");
  function addToCart(id) { cart[id] = (cart[id] || 0) + 1; updateCart(); }
  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    updateCart();
  }
  function updateCart() {
    const ids = Object.keys(cart);
    let count = 0, total = 0;
    cartList.innerHTML = ids.length ? "" : '<li class="empty">Your order is empty. Add something from the menu.</li>';
    ids.forEach(id => {
      const item = MENU.find(i => i.id == id);
      count += cart[id]; total += item.price * cart[id];
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.name}</span>
        <span class="qty">
          <button data-id="${id}" data-d="-1" aria-label="Remove one ${item.name}">&minus;</button>
          ${cart[id]}
          <button data-id="${id}" data-d="1" aria-label="Add one ${item.name}">+</button>
        </span>
        <span>${money(item.price * cart[id])}</span>`;
      cartList.appendChild(li);
    });
    document.getElementById("cart-count").textContent = count;
    document.getElementById("cart-total").textContent = money(total);
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
  }
  cartList.addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (b) {
      e.stopPropagation();
      changeQty(Number(b.dataset.id), Number(b.dataset.d));
    }
  });
  const setDrawer = open => { drawer.classList.toggle("open", open); drawer.setAttribute("aria-hidden", !open); };
  const openCart = document.getElementById("open-cart");
  openCart.addEventListener("click", () => setDrawer(true));
  document.getElementById("close-cart").addEventListener("click", () => setDrawer(false));
  document.addEventListener("click", e => {
    if (drawer.classList.contains("open") && !drawer.contains(e.target) && !openCart.contains(e.target)) setDrawer(false);
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setDrawer(false); });
  document.getElementById("checkout").addEventListener("click", () => {
    if (!Object.keys(cart).length) return alert("Add an item to your order first.");
    // TODO: connect this to your real ordering system or send the order by email/message.
    alert("Thanks! Your order has been placed.");
    cart = {}; updateCart(); setDrawer(false);
  });

  /* ---------- CONTACT FORM ---------- */
  document.getElementById("contact-form").addEventListener("submit", e => {
    e.preventDefault();
    const msg = document.getElementById("form-msg");
    const f = e.target;
    if (![...f.querySelectorAll("[required]")].every(x => x.value.trim()) || !f.email.validity.valid) {
      msg.textContent = "Please fill in your name, a valid email, and a message.";
      return;
    }
    // TODO: send the form data to your backend or a form service.
    msg.textContent = "Message sent. We'll get back to you soon!";
    f.reset();
  });


  /* ---------- ABOUT BOOK PAGE TURNING ---------- */
  const aboutPages = [...document.querySelectorAll('.book-page')];
  const aboutPrev = document.getElementById('about-prev');
  const aboutNext = document.getElementById('about-next');
  const aboutPageLabel = document.getElementById('about-page-label');
  const aboutChapterLabel = document.getElementById('about-chapter-label');
  const aboutProgressFill = document.getElementById('about-progress-fill');
  const aboutChapters = ['Our story', 'The Litterbox feeling', 'When to visit', 'A little note'];
  let currentAboutPage = 0;

  function showAboutPage(index) {
    if (!aboutPages.length) return;
    currentAboutPage = Math.max(0, Math.min(index, aboutPages.length - 1));
    aboutPages.forEach((page, i) => {
      const active = i === currentAboutPage;
      page.hidden = !active;
      page.classList.toggle('is-active', active);
      page.setAttribute('aria-hidden', String(!active));
    });
    aboutPrev.disabled = currentAboutPage === 0;
    aboutNext.disabled = currentAboutPage === aboutPages.length - 1;
    aboutPageLabel.textContent = `${String(currentAboutPage + 1).padStart(2, '0')} / ${String(aboutPages.length).padStart(2, '0')}`;
    aboutChapterLabel.textContent = aboutChapters[currentAboutPage];
    aboutProgressFill.style.width = `${((currentAboutPage + 1) / aboutPages.length) * 100}%`;
  }
  aboutPrev.addEventListener('click', () => showAboutPage(currentAboutPage - 1));
  aboutNext.addEventListener('click', () => showAboutPage(currentAboutPage + 1));
  document.addEventListener('keydown', e => {
    const aboutSection = document.getElementById('about');
    if (!aboutSection || !aboutSection.contains(document.activeElement)) return;
    if (e.key === 'ArrowLeft') showAboutPage(currentAboutPage - 1);
    if (e.key === 'ArrowRight') showAboutPage(currentAboutPage + 1);
  });
  showAboutPage(0);

  /* ---------- INIT ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  renderMenu();
  updateCart();
