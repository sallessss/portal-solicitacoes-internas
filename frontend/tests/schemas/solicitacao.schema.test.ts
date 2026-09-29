import { describe, expect, it } from "vitest";
import { DESCRICAO_MAX_LENGTH, solicitacaoSchema } from "@/schemas/solicitacao.schema";

describe("solicitacaoSchema", () => {
  it("aceita uma solicitação válida", () => {
    const result = solicitacaoSchema.safeParse({
      titulo: "Troca de teclado",
      descricao: "Teclado apresenta falhas em algumas teclas.",
      categoria: "TI",
    });

    expect(result.success).toBe(true);
  });

  it("bloqueia descrições acima do limite permitido pelo backend", () => {
    const result = solicitacaoSchema.safeParse({
      titulo: "Compra de equipamento",
      descricao: "a".repeat(DESCRICAO_MAX_LENGTH + 1),
      categoria: "COMPRAS",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.descricao).toContain(
        `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`,
      );
    }
  });

  it("exige uma categoria válida", () => {
    const result = solicitacaoSchema.safeParse({
      titulo: "Atualização cadastral",
      descricao: "Solicito atualização dos dados cadastrais.",
      categoria: "",
    });

    expect(result.success).toBe(false);
  });
});
