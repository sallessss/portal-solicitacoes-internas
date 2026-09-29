import { z } from "zod";

export const DESCRICAO_MAX_LENGTH = 500;

export const categoriaSolicitacaoSchema = z.enum(
  ["TI", "RH", "COMPRAS", "FINANCEIRO", "INFRAESTRUTURA"],
  {
    required_error: "Selecione uma categoria.",
    invalid_type_error: "Selecione uma categoria.",
  },
);

export const solicitacaoSchema = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório.").max(120),
  descricao: z
    .string()
    .trim()
    .min(10, "Informe uma descrição com pelo menos 10 caracteres.")
    .max(
      DESCRICAO_MAX_LENGTH,
      `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`,
    ),
  categoria: z.preprocess(
    (value) => (value === "" ? undefined : value),
    categoriaSolicitacaoSchema,
  ),
});

export type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;
