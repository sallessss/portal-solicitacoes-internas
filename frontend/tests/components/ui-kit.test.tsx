import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal, Pagination, StatusBadge } from "@/components/ui-kit";

describe("StatusBadge", () => {
  it("mostra o texto amigável do status", () => {
    render(<StatusBadge status="EM_ATENDIMENTO" />);

    expect(screen.getByText("Em atendimento")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("calcula o intervalo exibido e navega entre páginas", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        size={10}
        totalElements={26}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("11-20 de 26 solicitações")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Próxima página"));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe("Modal", () => {
  it("renderiza conteúdo e chama fechamento pelo botão", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Excluir solicitação?" description="Confirme a exclusão.">
        <button type="button">Excluir</button>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Excluir solicitação?")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Fechar"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
