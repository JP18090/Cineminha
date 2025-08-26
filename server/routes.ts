import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { insertEspetaculoSchema, insertClienteSchema, insertVendaSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const storage = await getStorage();
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard metrics" });
    }
  });

  // Espetáculos routes
  app.get("/api/espetaculos", async (req, res) => {
    try {
      const storage = await getStorage();
      const espetaculos = await storage.getEspetaculos();
      res.json(espetaculos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching shows" });
    }
  });

  app.get("/api/espetaculos/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const espetaculo = await storage.getEspetaculo(req.params.id);
      if (!espetaculo) {
        return res.status(404).json({ message: "Show not found" });
      }
      res.json(espetaculo);
    } catch (error) {
      res.status(500).json({ message: "Error fetching show" });
    }
  });

  app.post("/api/espetaculos", async (req, res) => {
    try {
      const validatedData = insertEspetaculoSchema.parse(req.body);
      const storage = await getStorage();
      const espetaculo = await storage.createEspetaculo(validatedData);
      res.status(201).json(espetaculo);
    } catch (error) {
      res.status(400).json({ message: "Invalid show data" });
    }
  });

  // Clientes routes
  app.get("/api/clientes", async (req, res) => {
    try {
      const storage = await getStorage();
      const clientes = await storage.getClientes();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.get("/api/clientes/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const cliente = await storage.getCliente(req.params.id);
      if (!cliente) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.get("/api/clientes/cpf/:cpf", async (req, res) => {
    try {
      const storage = await getStorage();
      const cliente = await storage.getClienteByCpf(req.params.cpf);
      if (!cliente) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.post("/api/clientes", async (req, res) => {
    try {
      const validatedData = insertClienteSchema.parse(req.body);
      const storage = await getStorage();
      
      // Check if CPF already exists
      const existingCliente = await storage.getClienteByCpf(validatedData.cpf);
      if (existingCliente) {
        return res.status(400).json({ message: "CPF already registered" });
      }
      
      const cliente = await storage.createCliente(validatedData);
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
    }
  });

  // Vendas routes
  app.get("/api/vendas", async (req, res) => {
    try {
      const storage = await getStorage();
      const vendas = await storage.getVendas();
      res.json(vendas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales" });
    }
  });

  app.get("/api/vendas/espetaculo/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const vendas = await storage.getVendasByEspetaculo(req.params.id);
      res.json(vendas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching show sales" });
    }
  });

  app.get("/api/vendas/cliente/:id", async (req, res) => {
    try {
      const storage = await getStorage();
      const vendas = await storage.getVendasByCliente(req.params.id);
      res.json(vendas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client sales" });
    }
  });

  app.post("/api/vendas", async (req, res) => {
    try {
      const validatedData = insertVendaSchema.parse(req.body);
      const storage = await getStorage();
      const venda = await storage.createVenda(validatedData);
      
      // Update show's occupied seats
      const vendas = await storage.getVendasByEspetaculo(validatedData.espetaculoId);
      const assentosOcupados = vendas.map(v => v.assento).filter((seat): seat is number => seat !== undefined);
      
      await storage.updateEspetaculo(validatedData.espetaculoId, {
        assentosOcupados: JSON.stringify(assentosOcupados)
      });
      
      res.status(201).json(venda);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
    }
  });

  // Test database connection and initialize data
  app.post("/api/init-db", async (req, res) => {
    try {
      const storage = await getStorage();
      if ('initializeDatabase' in storage) {
        await (storage as any).initializeDatabase();
        res.json({ success: true, message: "Database initialized with sample data" });
      } else {
        res.json({ success: false, message: "Using in-memory storage" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: `Error: ${error}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}