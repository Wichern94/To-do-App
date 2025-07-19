// funkcje pomocnicze:
    // do pokazywania:
export function showElement(el) {
    el?.classList.remove('hidden');
    el.classList.add('visible');
};
    // do chowania:
export function hideElement(el) {
    el?.classList.add('hidden',);
    el.classList.remove('visible');
};
    // do toggle:
    export function toggleElement(el) {
        el?.classList.toggle('hidden');
    };