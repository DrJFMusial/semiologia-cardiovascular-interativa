/** Tema explícito, preservado entre modos e sessões quando o armazenamento permite. */
export function toggleTheme() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try { localStorage.setItem('e2m08-theme', theme); } catch { /* mantém escolha nesta página */ }
  document.dispatchEvent(new Event('themechange'));
  return theme;
}
