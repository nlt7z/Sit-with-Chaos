/**
 * Playground “visual experiments” — shared between /playground and About Design Journey.
 */
export type VisualExperimentImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

/** Order matches playground: mixed rhythm — panorama, portraits, landscapes, squares. */
export const visualExperimentImages = [
  {
    src: "/assets/Playground/visual/image%20479.jpg",
    width: 1600,
    height: 900,
    alt: "Visual experiment — widescreen panorama",
  },
  {
    src: "/assets/Playground/visual/image%20453.jpg",
    width: 704,
    height: 1000,
    alt: "Visual experiment — narrow portrait study",
  },
  {
    src: "/assets/Playground/visual/image%20476.jpg",
    width: 4000,
    height: 2994,
    alt: "Visual experiment — wide architectural render",
  },
  {
    src: "/assets/Playground/visual/922152463a67314e1a7f61c1343874f5%201.jpg",
    width: 2560,
    height: 2560,
    alt: "Visual experiment — square composition",
  },
  {
    src: "/assets/Playground/visual/image%20445.jpg",
    width: 1310,
    height: 1600,
    alt: "Visual experiment — vertical interior board",
  },
  {
    src: "/assets/Playground/visual/image%20477.jpg",
    width: 4000,
    height: 3000,
    alt: "Visual experiment — broad landscape artwork",
  },
  {
    src: "/assets/Playground/visual/image%20451.jpg",
    width: 1400,
    height: 1400,
    alt: "Visual experiment — square graphic",
  },
  {
    src: "/assets/Playground/visual/image%20444.jpg",
    width: 1286,
    height: 1600,
    alt: "Visual experiment — vertical interior board",
  },
  {
    src: "/assets/Playground/visual/image%20480.jpg",
    width: 1526,
    height: 976,
    alt: "Visual experiment — landscape detail",
  },
  {
    src: "/assets/Playground/visual/image%20452.jpg",
    width: 954,
    height: 1000,
    alt: "Visual experiment — upright square frame",
  },
  {
    src: "/assets/Playground/visual/3da17a45aebe0054642ef4221d6d0410%201.jpg",
    width: 2560,
    height: 2560,
    alt: "Visual experiment — square composition",
  },
  {
    src: "/assets/Playground/visual/97cc70be3aeb5a76bcdf70bf2b4375c8%201.jpg",
    width: 2560,
    height: 2560,
    alt: "Visual experiment — square composition",
  },
  {
    src: "/assets/Playground/visual/ec59d655d15ee8d9b0201b19e296ff77%201.jpg",
    width: 2560,
    height: 2560,
    alt: "Visual experiment — square composition",
  },
] as const satisfies readonly VisualExperimentImage[];
