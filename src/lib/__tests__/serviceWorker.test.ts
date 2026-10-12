import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("registerServiceWorker", () => {
  const register = vi.fn(() => Promise.resolve({ waiting: null, addEventListener: vi.fn() }));

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("PROD", true);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register, addEventListener: vi.fn(), controller: null },
    });
    register.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("înregistrează workerul și când pagina s-a încărcat deja", async () => {
    // React montează AppUpdatePrompt după evenimentul „load”: un ascultător
    // pus atunci nu se mai declanșa, iar în producție nu exista niciun worker.
    expect(document.readyState).toBe("complete");
    const { registerServiceWorker } = await import("../serviceWorker");
    registerServiceWorker(() => {});
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });
});
