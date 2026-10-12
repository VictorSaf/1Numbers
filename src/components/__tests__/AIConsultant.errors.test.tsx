import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider } from "@/contexts/LanguageContext";

/**
 * The server now types its failures (Task 3 contract): 503 means no model
 * key, 429 means rate-limited, anything else is a generic failure. Each one
 * gets its own on-screen text -- collapsing them back into one message would
 * lose the distinction the honesty test relies on for 503.
 *
 * jsdom reports navigator.language as en-US, so English strings are asserted.
 */

vi.mock("@/contexts/AuthContext", () => {
  const value = { user: { id: "u1", email: "u1@test.local" } };
  return { useAuth: () => value };
});

vi.mock("@/hooks/use-profile", () => {
  const profile = { id: "p1", fullName: "Victor Ion Safta", birthDate: "1990-08-25" };
  const value = { profile, loading: false, hasProfile: true, profileData: null, refetch: () => {} };
  return { useProfile: () => value };
});

import { AIConsultant } from "@/components/AIConsultant";

const QUESTION = "What does my chart say about this year?";

const ask = async (fetchImpl: () => Promise<unknown>) => {
  vi.stubGlobal("localStorage", {
    getItem: () => "test-token",
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  });
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(
    <LanguageProvider>
      <AIConsultant />
    </LanguageProvider>,
  );
  await user.type(
    screen.getByPlaceholderText(/What does my Life Path Number mean/i),
    QUESTION,
  );
  await user.keyboard("{Enter}");
  return fetchMock;
};

afterEach(() => vi.unstubAllGlobals());

describe("when the server answers 429", () => {
  it("says too many questions, not the 503 or generic text", async () => {
    await ask(() =>
      Promise.resolve({ ok: false, status: 429, json: async () => ({ error: "ai_busy" }) }),
    );

    expect(await screen.findByText(/too many questions/i)).toBeInTheDocument();
    expect(screen.queryByText(/not available right now/i)).not.toBeInTheDocument();
  });
});

describe("when the server answers 502", () => {
  it("shows the generic could-not-get-an-answer text", async () => {
    await ask(() =>
      Promise.resolve({ ok: false, status: 502, json: async () => ({ error: "ai_failed" }) }),
    );

    expect(await screen.findByText(/could not get an answer/i)).toBeInTheDocument();
  });
});

describe("the request sent to the server", () => {
  it("sends profileContext and question, not the old userPrompt field", async () => {
    const fetchMock = await ask(() =>
      Promise.resolve({ ok: true, status: 200, json: async () => ({ answer: "Reply" }) }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
    const body = JSON.parse(calls[0][1].body as string);

    expect(body).toHaveProperty("profileContext");
    expect(body).toHaveProperty("question", QUESTION);
    expect(body).toHaveProperty("conversationHistory");
    expect(body).not.toHaveProperty("userPrompt");
  });
});
