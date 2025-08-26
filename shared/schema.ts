import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const espetaculos = pgTable("espetaculos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  data: text("data").notNull(),
  horario: text("horario").notNull(),
  preco: decimal("preco", { precision: 10, scale: 2 }).notNull(),
  totalAssentos: integer("total_assentos").notNull(),
  assentosOcupados: text("assentos_ocupados").default("[]"), // JSON array of occupied seat numbers
});

export const clientes = pgTable("clientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  historicoCompras: text("historico_compras").default("[]"), // JSON array of purchase amounts
});

export const vendas = pgTable("vendas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  espetaculoId: varchar("espetaculo_id").notNull().references(() => espetaculos.id),
  clienteId: varchar("cliente_id").notNull().references(() => clientes.id),
  assento: integer("assento").notNull(),
  tipoIngresso: text("tipo_ingresso").notNull(), // "inteira", "meia", "professor"
  precoFinal: decimal("preco_final", { precision: 10, scale: 2 }).notNull(),
  dataVenda: text("data_venda").notNull(),
});

export const insertEspetaculoSchema = createInsertSchema(espetaculos).omit({
  id: true,
  assentosOcupados: true,
});

export const insertClienteSchema = createInsertSchema(clientes).omit({
  id: true,
  historicoCompras: true,
});

export const insertVendaSchema = createInsertSchema(vendas).omit({
  id: true,
  dataVenda: true,
});

export type InsertEspetaculo = z.infer<typeof insertEspetaculoSchema>;
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type InsertVenda = z.infer<typeof insertVendaSchema>;

export type Espetaculo = typeof espetaculos.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Venda = typeof vendas.$inferSelect;
