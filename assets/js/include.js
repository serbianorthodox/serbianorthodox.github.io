async function inject(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(url + ' not found');
    host.innerHTML = await res.text();
  } catch (e) {
    console.error('Include failed:', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await inject('#include-header', '/partials/header.html');
  await inject('#include-footer', '/partials/footer.html');
});
