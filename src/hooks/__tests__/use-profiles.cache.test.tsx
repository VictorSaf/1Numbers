import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useProfiles } from "../use-profiles";
import { useProfile } from "../use-profile";

/**
 * O singură listă de profiluri, oricâți o citesc.
 *
 * Pe /eu, pagina, comutatorul, comparația și consultantul cereau fiecare
 * `GET /profiles/all` la montare -- patru cereri pentru aceeași listă. Și nu
 * se vedeau între ele: profilul schimbat în comutator rămânea vechi în pagină
 * până la un reload.
 */

const getAllProfiles = vi.fn();
const setActiveProfile = vi.fn();
vi.mock("@/services/api", () => {
  const svc = {
    getAllProfiles: (...a: unknown[]) => getAllProfiles(...a),
    setActiveProfile: (...a: unknown[]) => setActiveProfile(...a),
  };
  return { api: svc, default: svc };
});

const auth = { isAuthenticated: true, user: { id: "u1" } as { id: string } | null };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ ...auth, isLoading: false }),
}));

const A = { id: "a", userId: "u1", fullName: "Ana", birthDate: "1990-05-15", category: "eu", isActive: true, createdAt: "", updatedAt: "" };
const B = { id: "b", userId: "u1", fullName: "Bia", birthDate: "1991-06-16", category: "eu", isActive: false, createdAt: "", updatedAt: "" };

const Active = ({ testId }: { testId: string }) => {
  const { activeProfile, switchProfile } = useProfiles();
  return (
    <div>
      <span data-testid={testId}>{activeProfile?.fullName ?? "-"}</span>
      <button onClick={() => switchProfile("b")}>{`switch-${testId}`}</button>
    </div>
  );
};

const Legacy = () => {
  const { profile, refetch } = useProfile();
  return (
    <div>
      <span data-testid="legacy">{profile?.fullName ?? "-"}</span>
      <button onClick={() => refetch()}>refetch</button>
    </div>
  );
};

const withClient = (ui: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  auth.isAuthenticated = true;
  auth.user = { id: "u1" };
  getAllProfiles.mockReset().mockResolvedValue({ success: true, profiles: [A, B] });
  setActiveProfile.mockReset().mockResolvedValue({ success: true });
});

describe("useProfiles, cache comun", () => {
  it("doi consumatori, o singură cerere", async () => {
    withClient(
      <>
        <Active testId="one" />
        <Active testId="two" />
        <Legacy />
      </>,
    );

    await waitFor(() => expect(screen.getByTestId("one").textContent).toBe("Ana"));
    expect(screen.getByTestId("two").textContent).toBe("Ana");
    expect(screen.getByTestId("legacy").textContent).toBe("Ana");
    expect(getAllProfiles).toHaveBeenCalledTimes(1);
  });

  it("comutarea dintr-un loc se vede peste tot", async () => {
    withClient(
      <>
        <Active testId="one" />
        <Active testId="two" />
      </>,
    );
    await waitFor(() => expect(screen.getByTestId("two").textContent).toBe("Ana"));

    getAllProfiles.mockResolvedValue({
      success: true,
      profiles: [{ ...B, isActive: true }, { ...A, isActive: false }],
    });
    fireEvent.click(screen.getByText("switch-one"));

    await waitFor(() => expect(screen.getByTestId("two").textContent).toBe("Bia"));
    expect(screen.getByTestId("one").textContent).toBe("Bia");
    expect(setActiveProfile).toHaveBeenCalledWith("b");
  });

  it("fără cont, nicio cerere", async () => {
    auth.isAuthenticated = false;
    auth.user = null;
    withClient(<Active testId="one" />);

    await act(async () => {});
    expect(screen.getByTestId("one").textContent).toBe("-");
    expect(getAllProfiles).not.toHaveBeenCalled();
  });

  it("refetch din useProfile chiar cere din nou", async () => {
    withClient(<Legacy />);
    await waitFor(() => expect(screen.getByTestId("legacy").textContent).toBe("Ana"));
    expect(getAllProfiles).toHaveBeenCalledTimes(1);

    getAllProfiles.mockResolvedValue({ success: true, profiles: [{ ...A, fullName: "Ana Maria" }] });
    fireEvent.click(screen.getByText("refetch"));

    await waitFor(() => expect(screen.getByTestId("legacy").textContent).toBe("Ana Maria"));
    expect(getAllProfiles).toHaveBeenCalledTimes(2);
  });

  it("un răspuns fără succes nu rămâne în cache ca listă goală", async () => {
    // Altfel un sughiț al serverului ar ține pagina fără hartă cinci minute.
    getAllProfiles.mockResolvedValueOnce({ success: false });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(
      <QueryClientProvider client={client}><Active testId="one" /></QueryClientProvider>,
    );
    await waitFor(() => expect(getAllProfiles).toHaveBeenCalledTimes(1));

    rerender(
      <QueryClientProvider client={client}>
        <Active testId="one" />
        <Active testId="two" />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("two").textContent).toBe("Ana"));
    expect(getAllProfiles).toHaveBeenCalledTimes(2);
  });
});
