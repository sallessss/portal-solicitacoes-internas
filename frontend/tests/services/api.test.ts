import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch, setToken, toQueryString } from "@/services/api";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("envia token Bearer em requisições autenticadas", async () => {
    setToken("token-teste");
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiFetch("/dashboard");

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect((init?.headers as Headers).get("Authorization")).toBe("Bearer token-teste");
  });

  it("não envia token quando auth é false", async () => {
    setToken("token-teste");
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ token: "abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiFetch("/auth/login", { method: "POST", auth: false });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect((init?.headers as Headers).has("Authorization")).toBe(false);
  });

  it("converte erros da API em ApiError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "Dados inválidos",
          details: [{ field: "titulo", message: "O título é obrigatório" }],
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(apiFetch("/solicitacoes")).rejects.toMatchObject({
      status: 400,
      message: "Dados inválidos",
      details: [{ field: "titulo", message: "O título é obrigatório" }],
    });
  });
});

describe("toQueryString", () => {
  it("ignora valores vazios e mantém valores preenchidos", () => {
    expect(
      toQueryString({
        page: 0,
        size: 10,
        status: "ABERTO",
        categoria: "",
        titulo: null,
      }),
    ).toBe("?page=0&size=10&status=ABERTO");
  });
});
