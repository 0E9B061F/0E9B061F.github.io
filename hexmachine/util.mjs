import { relative } from "node:path"

export const tcase = s => {
  return s.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
}

export const mkhref = (base, abs) => {
  const p = relative(base, abs)
  return `/${p}`
}

export const ancestors =obj=> {
  switch (true) {
    case (obj === undefined): return;
    case (obj === null): return [];
    default:
      return [obj, ...(ancestors(Object.getPrototypeOf(obj)))];
  }
}
