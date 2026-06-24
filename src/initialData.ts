import { Category, Material } from "./types";

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-ict", name: "ICT" },
  { id: "cat-gereedschap", name: "Gereedschap" },
  { id: "cat-lesmateriaal", name: "Lesmateriaal" },
  { id: "cat-sport", name: "Sport" },
  { id: "cat-overig", name: "Overig" }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: "mat-1",
    name: "Laptop oplader",
    categoryId: "cat-ict",
    totalQuantity: 5,
    optionalBarcode: "01020304",
    optionalImageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    notes: "Standaard USB-C laptop oplader 65W.",
    createdAt: new Date("2026-06-01").toISOString()
  },
  {
    id: "mat-2",
    name: "HDMI kabel",
    categoryId: "cat-ict",
    totalQuantity: 10,
    optionalBarcode: "87110022",
    optionalImageUrl: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=400&q=80",
    notes: "HDMI naar HDMI high-speed kabel (1.5 meter).",
    createdAt: new Date("2026-06-02").toISOString()
  },
  {
    id: "mat-3",
    name: "Verlengsnoer",
    categoryId: "cat-gereedschap",
    totalQuantity: 4,
    optionalBarcode: "54112233",
    optionalImageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=400&q=80",
    notes: "Robuust verlengsnoer met 4 stopcontacten (5 meter).",
    createdAt: new Date("2026-06-03").toISOString()
  },
  {
    id: "mat-4",
    name: "Whiteboard markers",
    categoryId: "cat-lesmateriaal",
    totalQuantity: 20,
    optionalBarcode: "40047649",
    optionalImageUrl: "https://images.unsplash.com/photo-1580565214735-51234c2170c5?auto=format&fit=crop&w=400&q=80",
    notes: "Doos met rode, blauwe, groene en zwarte whiteboard stiften.",
    createdAt: new Date("2026-06-04").toISOString()
  },
  {
    id: "mat-5",
    name: "Sporthesjes",
    categoryId: "cat-sport",
    totalQuantity: 30,
    optionalBarcode: "31122334",
    optionalImageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80",
    notes: "Gele trainingshesjes voor teamactiviteiten.",
    createdAt: new Date("2026-06-05").toISOString()
  }
];
