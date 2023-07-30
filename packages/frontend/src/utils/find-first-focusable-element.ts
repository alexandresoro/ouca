// https://stackoverflow.com/questions/62668699/programmatically-focus-an-elements-first-eligable-child

export const findFirstFocusableElement = (
  container: HTMLElement | null,
  byTag?: keyof HTMLElementTagNameMap
): HTMLElement | undefined => {
  if (!container) {
    return undefined;
  }
  return Array.from(container.getElementsByTagName(byTag ?? "*") as HTMLCollectionOf<HTMLElement>).find((element) =>
    isFocusable(element)
  );
};

const isFocusable = (item: HTMLElement): boolean => {
  if (item.tabIndex < 0) {
    return false;
  }
  switch (item.tagName) {
    case "A":
      return !!(item as HTMLAnchorElement).href;
    case "INPUT":
      return (item as HTMLInputElement).type !== "hidden" && !(item as HTMLInputElement).disabled;
    case "SELECT":
    case "TEXTAREA":
    case "BUTTON":
      return !(item as HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement).disabled;
    default:
      return false;
  }
};
