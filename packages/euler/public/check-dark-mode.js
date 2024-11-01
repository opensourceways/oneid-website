function getCookie(key) {
  const name = `${encodeURIComponent(key)}=`;
  const decodedCookies = decodeURIComponent(document.cookie);
  const cookies = decodedCookies.split('; ');
  for (const cookie of cookies) {
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }

  return null;
}

const e = getCookie('openEuler-theme-appearance') || 'auto',
  a = window.matchMedia('(prefers-color-scheme: dark)').matches;
(!e || e === 'auto' ? a : e === 'dark') && document.documentElement.classList.add('dark');