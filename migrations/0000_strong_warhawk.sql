CREATE TABLE "clientes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"historico_compras" text DEFAULT '[]',
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "espetaculos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"data" text NOT NULL,
	"horario" text NOT NULL,
	"preco" numeric(10, 2) NOT NULL,
	"total_assentos" integer NOT NULL,
	"assentos_ocupados" text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "vendas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espetaculo_id" varchar NOT NULL,
	"cliente_id" varchar NOT NULL,
	"assento" integer NOT NULL,
	"tipo_ingresso" text NOT NULL,
	"preco_final" numeric(10, 2) NOT NULL,
	"data_venda" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_espetaculo_id_espetaculos_id_fk" FOREIGN KEY ("espetaculo_id") REFERENCES "public"."espetaculos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;