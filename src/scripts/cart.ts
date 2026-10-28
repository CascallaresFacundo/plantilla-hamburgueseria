type Item = { n: string; p: number };

const $ = (id: string) => document.getElementById(id) as HTMLElement;
const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
const WA = document.body.dataset.wa ?? '';

const items: Record<string, Item> = {};
document.querySelectorAll<HTMLElement>('.item').forEach((el) => {
  items[el.dataset.id!] = { n: el.dataset.name!, p: Number(el.dataset.price) };
});
const cart: Record<string, number> = {};

const stepper = (id: string) =>
  `<div class="step"><button data-m="${id}" aria-label="Quitar uno">−</button>${cart[id]}<button data-a="${id}" aria-label="Agregar uno">+</button></div>`;

const control = (id: string) =>
  cart[id] ? stepper(id) : `<button class="add" data-a="${id}" aria-label="Agregar ${items[id].n}">+</button>`;

function totals() {
  let n = 0;
  let t = 0;
  for (const id in cart) {
    n += cart[id];
    t += cart[id] * items[id].p;
  }
  return { n, t };
}

function update() {
  document.querySelectorAll<HTMLElement>('.item').forEach((el) => {
    el.querySelector('.ctl')!.innerHTML = control(el.dataset.id!);
  });
  const { n, t } = totals();
  $('bar').classList.toggle('on', n > 0);
  $('cnt').textContent = `${n} ${n === 1 ? 'producto' : 'productos'}, ver pedido`;
  $('tot').textContent = fmt(t);
  $('tot2').textContent = fmt(t);
  $('hct').textContent = fmt(t);
  $('lines').innerHTML = Object.keys(cart)
    .map(
      (id) =>
        `<div class="row"><span>${items[id].n}<br><small>${fmt(items[id].p)}</small></span><span class="step"><button data-m="${id}" aria-label="Quitar uno">−</button>${cart[id]}<button data-a="${id}" aria-label="Agregar uno">+</button></span></div>`
    )
    .join('');
  if (!n) $('sheet').classList.remove('on');
}

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button');
  if (!b) return;
  if (b.dataset.a) {
    cart[b.dataset.a] = (cart[b.dataset.a] || 0) + 1;
    update();
  }
  if (b.dataset.m) {
    const id = b.dataset.m;
    cart[id]--;
    if (cart[id] <= 0) delete cart[id];
    update();
  }
});

$('open').addEventListener('click', () => $('sheet').classList.add('on'));
$('hcart').addEventListener('click', () => {
  if (totals().n) $('sheet').classList.add('on');
  else location.hash = 'carta';
});
$('close').addEventListener('click', () => $('sheet').classList.remove('on'));

const mode = () => document.querySelector<HTMLInputElement>('input[name=m]:checked')!.value;
document.querySelectorAll('input[name=m]').forEach((r) =>
  r.addEventListener('change', () => {
    $('addrBox').style.display = mode() === 'Delivery' ? 'block' : 'none';
  })
);

$('send').addEventListener('click', () => {
  const { t } = totals();
  if (!t) return;
  const val = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
  let msg =
    'Hola, quiero hacer un pedido:\n\n' +
    Object.keys(cart)
      .map((id) => `${cart[id]}x ${items[id].n} (${fmt(items[id].p * cart[id])})`)
      .join('\n') +
    `\n\nTotal: ${fmt(t)}\nNombre: ${val('name') || '-'}\nEntrega: ${mode()}`;
  if (mode() === 'Delivery') msg += `\nDirección: ${val('addr') || '-'}`;
  if (val('note')) msg += `\nAclaraciones: ${val('note')}`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
});

const setMode = (m: string) => {
  const r = document.querySelector<HTMLInputElement>(`input[name=m][value=${m}]`);
  if (r) {
    r.checked = true;
    r.dispatchEvent(new Event('change'));
  }
};
document.querySelectorAll<HTMLElement>('[data-mode]').forEach((a) => a.addEventListener('click', () => setMode(a.dataset.mode!)));

const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.cats a'));
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.hash === '#' + e.target.id));
    }),
  { rootMargin: '-30% 0px -60% 0px' }
);
document.querySelectorAll('.group').forEach((g) => io.observe(g));

document.querySelectorAll<HTMLImageElement>('.ph img').forEach((img) => {
  const drop = () => img.remove();
  if (img.complete && img.naturalWidth === 0) drop();
  else img.addEventListener('error', drop);
});

update();
