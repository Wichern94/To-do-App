// funkcje pomocnicze:
    // do pokazywania:
export function showElement(el) {
    el?.classList.remove('hidden');
};
    // do chowania:
export function hideElement(el) {
    el?.classList.add('hidden');
};
    // do toggle:
    export function toggleElement(el) {
        el?.classList.toggle('hidden');
    };