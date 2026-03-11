import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

type TicketType = "inteira" | "meia" | "professor";

interface Espetaculo {
	id: string;
	nome: string;
	data: string;
	horario: string;
	preco: string;
	totalAssentos: number;
	assentosOcupados: string;
}

interface Cliente {
	id: string;
	nome: string;
	cpf: string;
	historicoCompras: string;
}

interface Venda {
	id: string;
	espetaculoId: string;
	clienteId: string;
	assento: number;
	tipoIngresso: TicketType;
	precoFinal: string;
	dataVenda: string;
}

const app = express();
const port = Number(process.env.PORT ?? 5000);
const isDev = process.env.NODE_ENV !== "production";

app.use(express.json());

const toMoney = (value: number) => value.toFixed(2);
const sanitizeCpf = (value: string) => value.replace(/\D/g, "");

const shows: Espetaculo[] = [
	{
		id: crypto.randomUUID(),
		nome: "A Fantástica Fábrica de Chocolate",
		data: "2026-03-20",
		horario: "19:30",
		preco: "30.00",
		totalAssentos: 50,
		assentosOcupados: JSON.stringify([2, 9, 13]),
	},
	{
		id: crypto.randomUUID(),
		nome: "Castelo Rá-Tim-Bum",
		data: "2026-03-25",
		horario: "20:30",
		preco: "50.00",
		totalAssentos: 40,
		assentosOcupados: JSON.stringify([1, 5, 7, 8]),
	},
];

const clients: Cliente[] = [];
const sales: Venda[] = [];

app.get("/api/espetaculos", (_req, res) => {
	res.json(shows);
});

app.post("/api/espetaculos", (req, res) => {
	const { nome, data, horario, preco, totalAssentos } = req.body ?? {};

	if (!nome || !data || !horario || !preco || !Number.isInteger(totalAssentos) || totalAssentos <= 0) {
		return res.status(400).json({ message: "Dados de espetáculo inválidos." });
	}

	const show: Espetaculo = {
		id: crypto.randomUUID(),
		nome: String(nome),
		data: String(data),
		horario: String(horario),
		preco: String(preco),
		totalAssentos,
		assentosOcupados: "[]",
	};

	shows.push(show);
	res.status(201).json(show);
});

app.get("/api/clientes", (_req, res) => {
	res.json(clients);
});

app.post("/api/clientes", (req, res) => {
	const { nome, cpf } = req.body ?? {};
	const cleanCpf = sanitizeCpf(String(cpf ?? ""));

	if (!nome || cleanCpf.length !== 11) {
		return res.status(400).json({ message: "Dados de cliente inválidos." });
	}

	if (clients.some((client) => sanitizeCpf(client.cpf) === cleanCpf)) {
		return res.status(409).json({ message: "CPF já cadastrado." });
	}

	const cliente: Cliente = {
		id: crypto.randomUUID(),
		nome: String(nome),
		cpf: cleanCpf,
		historicoCompras: "[]",
	};

	clients.push(cliente);
	res.status(201).json(cliente);
});

app.get("/api/clientes/cpf/:cpf", (req, res) => {
	const cpf = sanitizeCpf(req.params.cpf);
	const client = clients.find((item) => sanitizeCpf(item.cpf) === cpf);

	if (!client) {
		return res.status(404).json({ message: "Cliente não encontrado." });
	}

	res.json(client);
});

app.post("/api/vendas", (req, res) => {
	const { espetaculoId, clienteId, assento, assentos, tipoIngresso, precoFinal } = req.body ?? {};

	if (!espetaculoId || !clienteId || !tipoIngresso || precoFinal === undefined) {
		return res.status(400).json({ message: "Dados de venda inválidos." });
	}

	if (!["inteira", "meia", "professor"].includes(tipoIngresso)) {
		return res.status(400).json({ message: "Tipo de ingresso inválido." });
	}

	const show = shows.find((item) => item.id === espetaculoId);
	const client = clients.find((item) => item.id === clienteId);

	if (!show || !client) {
		return res.status(404).json({ message: "Cliente ou espetáculo não encontrado." });
	}

	const seatsFromBody = Array.isArray(assentos)
		? assentos
		: assento !== undefined
		? [assento]
		: [];

	if (seatsFromBody.length === 0) {
		return res.status(400).json({ message: "Nenhum assento informado." });
	}

	const normalizedSeats = Array.from(new Set(seatsFromBody.map((value) => Number(value))));
	if (
		normalizedSeats.some(
			(seatNumber) => !Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > show.totalAssentos,
		)
	) {
		return res.status(400).json({ message: "Um ou mais assentos são inválidos." });
	}

	const occupiedSeats = JSON.parse(show.assentosOcupados || "[]") as number[];
	const unavailableSeats = normalizedSeats.filter((seatNumber) => occupiedSeats.includes(seatNumber));
	if (unavailableSeats.length > 0) {
		return res.status(409).json({ message: `Assentos já ocupados: ${unavailableSeats.join(", ")}.` });
	}

	occupiedSeats.push(...normalizedSeats);
	show.assentosOcupados = JSON.stringify(occupiedSeats.sort((a, b) => a - b));

	const finalPrice = Number(precoFinal);
	const safePrice = Number.isFinite(finalPrice) ? finalPrice : Number(show.preco);

	const createdSales: Venda[] = normalizedSeats.map((seatNumber) => ({
		id: crypto.randomUUID(),
		espetaculoId: show.id,
		clienteId: client.id,
		assento: seatNumber,
		tipoIngresso: tipoIngresso as TicketType,
		precoFinal: toMoney(safePrice),
		dataVenda: new Date().toISOString(),
	}));

	sales.push(...createdSales);

	const clientHistory = JSON.parse(client.historicoCompras || "[]") as number[];
	createdSales.forEach((sale) => {
		clientHistory.push(Number(sale.precoFinal));
	});
	client.historicoCompras = JSON.stringify(clientHistory);

	res.status(201).json({
		vendas: createdSales,
		assentosVendidos: normalizedSeats,
		clienteAtualizado: client,
	});
});

app.get("/api/dashboard/metrics", (_req, res) => {
	const receitaTotal = sales.reduce((acc, item) => acc + Number(item.precoFinal), 0);

	res.json({
		totalEspetaculos: shows.length,
		totalClientes: clients.length,
		ingressosVendidos: sales.length,
		receitaTotal,
	});
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function setupFrontend() {
	if (isDev) {
		const { createServer } = await import("vite");
		const vite = await createServer({
			server: { middlewareMode: true },
			appType: "custom",
		});

		app.use(vite.middlewares);

		app.use("*", async (req, res, next) => {
			try {
				const htmlPath = path.resolve(projectRoot, "client", "index.html");
				const template = await fs.readFile(htmlPath, "utf-8");
				const html = await vite.transformIndexHtml(req.originalUrl, template);
				res.status(200).set({ "Content-Type": "text/html" }).end(html);
			} catch (error) {
				vite.ssrFixStacktrace(error as Error);
				next(error);
			}
		});
		return;
	}

	const distPath = path.resolve(projectRoot, "dist", "public");
	app.use(express.static(distPath));
	app.use("*", (_req, res) => {
		res.sendFile(path.resolve(distPath, "index.html"));
	});
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	const message = err instanceof Error ? err.message : "Erro interno";
	res.status(500).json({ message });
});

setupFrontend()
	.then(() => {
		app.listen(port, "0.0.0.0", () => {
			console.log(`Cineminha server rodando na porta ${port}`);
		});
	})
	.catch((error) => {
		console.error("Falha ao iniciar servidor:", error);
		process.exit(1);
	});
