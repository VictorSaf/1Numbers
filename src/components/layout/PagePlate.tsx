import { ReactNode } from "react";

/**
 * Capul unei pagini: o placă, ca frontispiciul hărții.
 *
 * Harta se deschide cu o suprafață închisă care spune unde ai ajuns, apoi
 * intră în capitole numerotate. Restul platformei se deschidea cu un titlu pe
 * suprafața paginii -- alt început pentru același produs.
 *
 * `figure` e ce ține de pagina asta anume: cadranul la compatibilitate, cartea
 * la zi. Când nu există niciun desen propriu, placa rămâne o placă -- cerul și
 * filetul de alamă sunt destule, iar un desen pus ca să umple spațiul ar fi
 * exact decorul pe care l-am scos de peste tot.
 *
 * `children` e conținutul care intră ÎN placă, sub cap: la „Voi doi", cele două
 * formulare stau înăuntru, fiindcă ele SUNT începutul paginii -- rezultatul se
 * arată dedesubt, în afară. Ce intră aici primește `.on-plate`, care rescrie
 * tokenii de culoare pentru suprafața închisă; altfel un câmp desenat cu
 * `--line` ar fi invizibil pe tema deschisă.
 *
 * Nu urmează tema, deliberat: e un obiect, ca toate plăcile. Vezi comentariul
 * din index.css.
 */
export const PagePlate = ({
  eyebrow,
  title,
  subtitle,
  figure,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  figure?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) => (
  <section className="relative overflow-hidden rounded-2xl bg-plate">
    <div className="plate-sky" aria-hidden="true" />

    <div className="relative px-6 py-10 sm:px-10 lg:py-14">
      <div
        className={
          figure
            ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center lg:gap-12"
            : ""
        }
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 shrink-0 bg-plate-gilt-dim" aria-hidden="true" />
            <span className="num text-[0.63rem] uppercase tracking-[0.18em] text-plate-gilt">
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-4 font-heading text-3xl leading-[1.1] text-plate-ink sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-plate-muted sm:text-lg">
              {subtitle}
            </p>
          )}

          {actions && <div className="mt-8 flex flex-wrap items-center gap-2.5">{actions}</div>}
        </div>

        {figure && <div className="min-w-0">{figure}</div>}
      </div>

      {children && (
        <div className="on-plate mt-10 border-t border-plate-gilt-dim pt-10 text-plate-ink">
          {children}
        </div>
      )}
    </div>
  </section>
);

export default PagePlate;
