(async () => {
  try {
    const res = await fetch('http://localhost:5176/');
    console.log('status', res.status);
    const t = await res.text();
    console.log('length', t.length);
    console.log(t.slice(0, 400));
  } catch (e) {
    console.error('error', e.message || e);
    process.exit(1);
  }
})();