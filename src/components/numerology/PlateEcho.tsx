import { ReactNode } from "react";
import { Dial } from "@/components/numerology/Dial";
import type { DialFigure } from "@/lib/dial";

/**
 * Cadranul, întors mic, acolo unde capitolul vorbește despre el.
 *
 * Fără asta, figura din frontispiciu ar fi un antet: apare o dată sus și
 * dispare. Întoarsă în capitolul 2 -- unde subiectul e chiar coarda -- și în 3
 * -- unde subiectul sunt golurile -- devine un limbaj: a doua oară când o vezi,
 * o citești deja.
 */
export const PlateEcho = ({ figure, children }: { figure: DialFigure; children: ReactNode }) => (
  <div className="grid gap-5 rounded-xl bg-plate p-5 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:items-center sm:gap-7 sm:p-6">
    <Dial figure={figure} size="echo" className="mx-auto max-w-[200px]" />
    <div className="min-w-0">{children}</div>
  </div>
);

export default PlateEcho;
