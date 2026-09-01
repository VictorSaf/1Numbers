import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * When the server cannot answer, the consultant says so.
 *
 * It used to invent. On any non-2xx response -- and on any network error --
 * generateLocalResponse produced a paragraph telling the reader, by name, that
 * they had "remarkable potential", and pushed it into the conversation as an
 * ordinary assistant message. Same bubble, same styling, no marker. Nothing on
 * screen distinguished it from an answer a model had actually written about
 * this person's chart, and the text depended on none of their numbers.
 *
 * jsdom reports navigator.language as en-US, so the strings asserted here are
 * the English ones.
 */

vi.mock("@/contexts/AuthContext", () => {
  const value = { user: { id: "u1", email: "u1@test.local" } };
  return { useAuth: () => value };
});

// The returned value must be referentially stable across renders. AIConsultant
// keys an effect on aiContext?.profile.birthDate -- a Date built inside a
// useMemo -- so a mock that hands back a fresh object each call produces a new
// Date each render, which re-fires the effect, which sets state, forever. The
// real useProfiles holds the profile in state, so production never sees this.
vi.mock("@/hooks/use-profile", () => {
  const profile = { id: "p1", fullName: "Victor Ion Safta", birthDate: "1990-08-25" };
  const value = { profile, loading: false, hasProfile: true, profileData: null, refetch: () => {} };
  return { useProfile: () => value };
});

import { AIConsultant } from "@/components/AIConsultant";

const QUESTION = "What does my chart say about this year?";

const askAndFail = async (fetchImpl: () => Promise<unknown>) => {
  // Without this the component throws on localStorage.getItem while building
  // the request headers, lands in the catch, and every assertion below passes
  // without fetch ever being called -- green for the wrong reason.
  vi.stubGlobal("localStorage", {
    getItem: () => "test-token",
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  });
  vi.stubGlobal("fetch", vi.fn(fetchImpl));
  const user = userEvent.setup();
  const view = render(
    <LanguageProvider>
      <AIConsultant />
    </LanguageProvider>,
  );
  // Submitted with Enter, which the textarea handles, because the send button
  // renders a bare <Send /> icon with no label and therefore has no accessible
  // name to query by. Noted, not fixed here.
  await user.type(
    screen.getByPlaceholderText(/What does my Life Path Number mean/i),
    QUESTION,
  );
  await user.keyboard("{Enter}");
  return view;
};

const serverRefuses = () =>
  Promise.resolve({
    ok: false,
    status: 503,
    json: async () => ({ error: "ai_unavailable" }),
  });

const networkDies = () => Promise.reject(new Error("network down"));

afterEach(() => vi.unstubAllGlobals());

describe("when the server answers 503", () => {
  it("puts no invented answer on screen", async () => {
    await askAndFail(serverRefuses);

    await waitFor(() => expect(screen.getByText(QUESTION)).toBeInTheDocument());
    expect(screen.queryByText(/remarkable potential/i)).not.toBeInTheDocument();
  });

  it("says the consultant is unavailable", async () => {
    await askAndFail(serverRefuses);

    expect(await screen.findByText(/not available right now/i)).toBeInTheDocument();
  });

  it("leaves the question as the only message in the conversation", async () => {
    const { container } = await askAndFail(serverRefuses);

    await waitFor(() => expect(screen.getByText(QUESTION)).toBeInTheDocument());
    // One bubble means the question and nothing answering it. If the bubble
    // markup changes this breaks loudly, which is the point.
    expect(container.querySelectorAll("p.whitespace-pre-wrap")).toHaveLength(1);
  });
});

describe("when the network fails outright", () => {
  it("puts no invented answer on screen", async () => {
    await askAndFail(networkDies);

    await waitFor(() => expect(screen.getByText(QUESTION)).toBeInTheDocument());
    expect(screen.queryByText(/remarkable potential/i)).not.toBeInTheDocument();
  });
});
