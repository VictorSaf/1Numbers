import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/**
 * Lista de file: bandă cu filet pe ecran lat, meniu care se deschide pe telefon.
 *
 * Măsurat la 390px: /unelte are opt file, 1421px de conținut în 358px vizibili
 * -- șase din opt cădeau complet în afara ecranului. Pagina nu depășea, fiindcă
 * banda derula pe orizontală, dar o filă pe care n-o vezi și nu știi că există
 * e tot una cu una care lipsește.
 *
 * Pe ecran lat banda se ÎNFĂȘOARĂ: opt file într-un rând care nu se rupe
 * împingeau documentul la 1711px într-un viewport de 1280.
 *
 * Pe telefon devine un buton cu fila curentă, care deschide restul pe verticală.
 * Lista e UNA singură -- randată de două ori, Radix ar primi două seturi de file
 * cu aceleași valori.
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // Eticheta butonului urmează fila activă. Radix scrie `data-state` pe
  // declanșatoare, deci se citește de acolo -- și se reciteşte la fiecare
  // schimbare, altfel butonul ar rămâne pe prima filă.
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const read = () => {
      const active = el.querySelector('[role="tab"][data-state="active"]');
      setCurrent(active?.textContent?.trim() ?? "");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-state"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="num flex min-h-11 w-full items-center justify-between gap-3 px-1 text-[0.68rem] uppercase tracking-[0.14em] text-gilt sm:hidden"
      >
        <span className="truncate">{current}</span>
        <span
          aria-hidden="true"
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        >
          ▾
        </span>
      </button>

      <TabsPrimitive.List
        ref={(node) => {
          listRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<unknown>).current = node;
        }}
        // Închide meniul după alegere: altfel rămâne deschis peste conținutul
        // pe care omul tocmai l-a cerut.
        onClick={() => setOpen(false)}
        className={cn(
          "min-h-11 items-stretch gap-1 text-muted-foreground",
          "flex-col pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:pb-0",
          open ? "flex" : "hidden sm:flex",
          className,
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </div>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "num inline-flex min-h-11 shrink-0 items-center whitespace-nowrap ring-offset-background transition-colors",
      "text-[0.68rem] uppercase tracking-[0.14em]",
      // Pe telefon: rând de meniu, filet la stânga. Pe ecran lat: filă cu
      // filet dedesubt. Aceeași stare, două orientări.
      "justify-start border-l-2 border-transparent px-3",
      "sm:justify-center sm:border-l-0 sm:border-b-2 sm:px-4",
      "data-[state=active]:border-gilt data-[state=active]:text-gilt",
      "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Banda de file are deja filet dedesubt. Primul bloc din panou nu-și mai
      // desenează unul la 24px sub el -- două linii paralele se citesc ca o greșeală.
      "mt-6 [&>*:first-child]:border-t-0",
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
