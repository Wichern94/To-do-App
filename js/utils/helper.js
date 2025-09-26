export function showElement(el) {
  el?.classList.remove('hidden');
  el.classList.add('visible');
  el.removeAttribute('tabindex');
}

export function hideElement(el) {
  el?.classList.add('hidden');
  el.classList.remove('visible');
  el.setAttribute('tabindex', '-1');
}

export function toggleElement(el) {
  el?.classList.toggle('hidden');
}
