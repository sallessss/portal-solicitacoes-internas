import { describe, expect, it } from "vitest";
import { categoriaLabel, nextStatus, statusLabel } from "@/utils/labels";

describe("labels", () => {
  it("traduz categorias e status para exibição", () => {
    expect(categoriaLabel("COMPRAS")).toBe("Compras");
    expect(categoriaLabel("INFRAESTRUTURA")).toBe("Infraestrutura");
    expect(statusLabel("EM_ATENDIMENTO")).toBe("Em atendimento");
    expect(statusLabel("CONCLUIDO")).toBe("Concluído");
  });

  it("calcula somente o próximo status permitido", () => {
    expect(nextStatus("ABERTO")).toBe("EM_ATENDIMENTO");
    expect(nextStatus("EM_ATENDIMENTO")).toBe("CONCLUIDO");
    expect(nextStatus("CONCLUIDO")).toBeNull();
  });
});
