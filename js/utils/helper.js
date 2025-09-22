export function showElement(el) {
  el?.classList.remove('hidden');
  el.classList.add('visible');
}

export function hideElement(el) {
  el?.classList.add('hidden');
  el.classList.remove('visible');
}

export function toggleElement(el) {
  el?.classList.toggle('hidden');
}
