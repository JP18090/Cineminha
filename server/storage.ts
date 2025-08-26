import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { espetaculos, clientes, vendas, type Espetaculo, type Cliente, type Venda, type InsertEspetaculo, type InsertCliente, type InsertVenda } from "@shared/schema";
import { randomUUID } from "crypto";

// Configure neon with SSL options
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store'
  }
});
const db = drizzle(sql);

export interface IStorage {
  // Espetáculos
  getEspetaculos(): Promise<Espetaculo[]>;
  getEspetaculo(id: string): Promise<Espetaculo | undefined>;
  createEspetaculo(espetaculo: InsertEspetaculo): Promise<Espetaculo>;
  updateEspetaculo(id: string, espetaculo: Partial<Espetaculo>): Promise<Espetaculo | undefined>;
  
  // Clientes
  getClientes(): Promise<Cliente[]>;
  getCliente(id: string): Promise<Cliente | undefined>;
  getClienteByCpf(cpf: string): Promise<Cliente | undefined>;
  createCliente(cliente: InsertCliente): Promise<Cliente>;
  updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente | undefined>;
  
  // Vendas
  getVendas(): Promise<Venda[]>;
  getVendasByEspetaculo(espetaculoId: string): Promise<Venda[]>;
  getVendasByCliente(clienteId: string): Promise<Venda[]>;
  createVenda(venda: InsertVenda): Promise<Venda>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalEspetaculos: number;
    totalClientes: number;
    ingressosVendidos: number;
    receitaTotal: number;
  }>;
}

// Keep MemStorage for reference but use DatabaseStorage
export class MemStorage implements IStorage {
  private espetaculos: Map<string, Espetaculo> = new Map();
  private clientes: Map<string, Cliente> = new Map();
  private vendas: Map<string, Venda> = new Map();

  constructor() {
    // Initialize with sample data from Java code
    this.initializeData();
  }

  private initializeData() {
    // Sample shows from Java initialization
    const sampleShows: InsertEspetaculo[] = [
      {
        nome: "A Fantástica Fábrica de Chocolate",
        data: "15/05/2024",
        horario: "19h30",
        preco: "30.00",
        totalAssentos: 50,
      },
      {
        nome: "Castelo Rá-Tim-Bum",
        data: "30/05/2024",
        horario: "20h30",
        preco: "50.00",
        totalAssentos: 50,
      },
      {
        nome: "A Branca de Neve",
        data: "02/03/2025",
        horario: "21h30",
        preco: "35.00",
        totalAssentos: 50,
      },
    ];

    sampleShows.forEach(show => {
      const showId = randomUUID();
      const ticketsSold = Math.floor(Math.random() * 10) + 5; // 5-14 tickets sold
      const assentosArray = Array.from({length: ticketsSold}, () => Math.floor(Math.random() * show.totalAssentos) + 1);
      
      this.espetaculos.set(showId, {
        ...show,
        id: showId,
        assentosOcupados: JSON.stringify(assentosArray),
      });
      
      // Create sample clients and sales for each show
      for (let i = 0; i < ticketsSold; i++) {
        const clientId = randomUUID();
        const vendaId = randomUUID();
        
        // Create sample client
        this.clientes.set(clientId, {
          id: clientId,
          nome: `Cliente ${i + 1} - ${show.nome.split(' ')[0]}`,
          cpf: `${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}.${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}.${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
          historicoCompras: `[${show.preco}]`
        });
        
        // Create sale with full price (inteira)
        this.vendas.set(vendaId, {
          id: vendaId,
          espetaculoId: showId,
          clienteId: clientId,
          assento: assentosArray[i],
          tipoIngresso: "inteira",
          precoFinal: show.preco,
          dataVenda: new Date().toISOString(),
        });
      }
    });
  }

  async getEspetaculos(): Promise<Espetaculo[]> {
    return Array.from(this.espetaculos.values());
  }

  async getEspetaculo(id: string): Promise<Espetaculo | undefined> {
    return this.espetaculos.get(id);
  }

  async createEspetaculo(espetaculo: InsertEspetaculo): Promise<Espetaculo> {
    const id = randomUUID();
    const newEspetaculo: Espetaculo = {
      ...espetaculo,
      id,
      assentosOcupados: "[]",
    };
    this.espetaculos.set(id, newEspetaculo);
    return newEspetaculo;
  }

  async updateEspetaculo(id: string, espetaculo: Partial<Espetaculo>): Promise<Espetaculo | undefined> {
    const existing = this.espetaculos.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...espetaculo };
    this.espetaculos.set(id, updated);
    return updated;
  }

  async getClientes(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async getCliente(id: string): Promise<Cliente | undefined> {
    return this.clientes.get(id);
  }

  async getClienteByCpf(cpf: string): Promise<Cliente | undefined> {
    return Array.from(this.clientes.values()).find(cliente => cliente.cpf === cpf);
  }

  async createCliente(cliente: InsertCliente): Promise<Cliente> {
    const id = randomUUID();
    const newCliente: Cliente = {
      ...cliente,
      id,
      historicoCompras: "[]",
    };
    this.clientes.set(id, newCliente);
    return newCliente;
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente | undefined> {
    const existing = this.clientes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...cliente };
    this.clientes.set(id, updated);
    return updated;
  }

  async getVendas(): Promise<Venda[]> {
    return Array.from(this.vendas.values());
  }

  async getVendasByEspetaculo(espetaculoId: string): Promise<Venda[]> {
    return Array.from(this.vendas.values()).filter(venda => venda.espetaculoId === espetaculoId);
  }

  async getVendasByCliente(clienteId: string): Promise<Venda[]> {
    return Array.from(this.vendas.values()).filter(venda => venda.clienteId === clienteId);
  }

  async createVenda(venda: InsertVenda): Promise<Venda> {
    const id = randomUUID();
    const newVenda: Venda = {
      ...venda,
      id,
      dataVenda: new Date().toISOString(),
    };
    this.vendas.set(id, newVenda);

    // Update occupied seats in the show
    const espetaculo = this.espetaculos.get(venda.espetaculoId);
    if (espetaculo) {
      const assentosOcupados = JSON.parse(espetaculo.assentosOcupados || "[]");
      assentosOcupados.push(venda.assento);
      await this.updateEspetaculo(venda.espetaculoId, {
        assentosOcupados: JSON.stringify(assentosOcupados),
      });
    }

    // Update client purchase history
    const cliente = this.clientes.get(venda.clienteId);
    if (cliente) {
      const historico = JSON.parse(cliente.historicoCompras || "[]");
      historico.push(parseFloat(venda.precoFinal));
      await this.updateCliente(venda.clienteId, {
        historicoCompras: JSON.stringify(historico),
      });
    }

    return newVenda;
  }

  async getDashboardMetrics(): Promise<{
    totalEspetaculos: number;
    totalClientes: number;
    ingressosVendidos: number;
    receitaTotal: number;
  }> {
    const vendas = await this.getVendas();
    const receitaTotal = vendas.reduce((total, venda) => total + parseFloat(venda.precoFinal), 0);

    return {
      totalEspetaculos: this.espetaculos.size,
      totalClientes: this.clientes.size,
      ingressosVendidos: vendas.length,
      receitaTotal,
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getEspetaculos(): Promise<Espetaculo[]> {
    return await db.select().from(espetaculos);
  }

  async getEspetaculo(id: string): Promise<Espetaculo | undefined> {
    const result = await db.select().from(espetaculos).where(eq(espetaculos.id, id));
    return result[0];
  }

  async createEspetaculo(espetaculo: InsertEspetaculo): Promise<Espetaculo> {
    const result = await db.insert(espetaculos).values(espetaculo).returning();
    return result[0];
  }

  async updateEspetaculo(id: string, espetaculo: Partial<Espetaculo>): Promise<Espetaculo | undefined> {
    const result = await db.update(espetaculos).set(espetaculo).where(eq(espetaculos.id, id)).returning();
    return result[0];
  }

  async getClientes(): Promise<Cliente[]> {
    return await db.select().from(clientes);
  }

  async getCliente(id: string): Promise<Cliente | undefined> {
    const result = await db.select().from(clientes).where(eq(clientes.id, id));
    return result[0];
  }

  async getClienteByCpf(cpf: string): Promise<Cliente | undefined> {
    const result = await db.select().from(clientes).where(eq(clientes.cpf, cpf));
    return result[0];
  }

  async createCliente(cliente: InsertCliente): Promise<Cliente> {
    const result = await db.insert(clientes).values(cliente).returning();
    return result[0];
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente | undefined> {
    const result = await db.update(clientes).set(cliente).where(eq(clientes.id, id)).returning();
    return result[0];
  }

  async getVendas(): Promise<Venda[]> {
    return await db.select().from(vendas);
  }

  async getVendasByEspetaculo(espetaculoId: string): Promise<Venda[]> {
    return await db.select().from(vendas).where(eq(vendas.espetaculoId, espetaculoId));
  }

  async getVendasByCliente(clienteId: string): Promise<Venda[]> {
    return await db.select().from(vendas).where(eq(vendas.clienteId, clienteId));
  }

  async createVenda(venda: InsertVenda): Promise<Venda> {
    const result = await db.insert(vendas).values({
      ...venda,
      dataVenda: new Date().toISOString(),
    }).returning();

    // Update occupied seats in the show
    const espetaculo = await this.getEspetaculo(venda.espetaculoId);
    if (espetaculo) {
      const assentosOcupados = JSON.parse(espetaculo.assentosOcupados || "[]");
      assentosOcupados.push(venda.assento);
      await this.updateEspetaculo(venda.espetaculoId, {
        assentosOcupados: JSON.stringify(assentosOcupados),
      });
    }

    // Update client purchase history
    const cliente = await this.getCliente(venda.clienteId);
    if (cliente) {
      const historico = JSON.parse(cliente.historicoCompras || "[]");
      historico.push(parseFloat(venda.precoFinal.toString()));
      await this.updateCliente(venda.clienteId, {
        historicoCompras: JSON.stringify(historico),
      });
    }

    return result[0];
  }

  async getDashboardMetrics(): Promise<{
    totalEspetaculos: number;
    totalClientes: number;
    ingressosVendidos: number;
    receitaTotal: number;
  }> {
    const [espetaculosCount, clientesCount, vendasData] = await Promise.all([
      db.select().from(espetaculos),
      db.select().from(clientes),
      db.select().from(vendas)
    ]);

    const receitaTotal = vendasData.reduce((total, venda) => total + parseFloat(venda.precoFinal), 0);

    return {
      totalEspetaculos: espetaculosCount.length,
      totalClientes: clientesCount.length,
      ingressosVendidos: vendasData.length,
      receitaTotal,
    };
  }

  async initializeData() {
    // Check if data already exists
    const existingShows = await this.getEspetaculos();
    if (existingShows.length > 0) return;

    // Sample shows from Java initialization
    const sampleShows: InsertEspetaculo[] = [
      {
        nome: "A Fantástica Fábrica de Chocolate",
        data: "15/05/2024",
        horario: "19h30",
        preco: "30.00",
        totalAssentos: 50,
      },
      {
        nome: "Castelo Rá-Tim-Bum",
        data: "30/05/2024",
        horario: "20h30",
        preco: "50.00",
        totalAssentos: 50,
      },
      {
        nome: "A Branca de Neve",
        data: "02/03/2025",
        horario: "21h30",
        preco: "35.00",
        totalAssentos: 50,
      },
    ];

    // Insert sample shows
    for (const show of sampleShows) {
      const createdShow = await this.createEspetaculo(show);
      
      // Create some initial ticket sales with full price (inteira)
      const ticketsSold = Math.floor(Math.random() * 10) + 5; // 5-14 tickets sold
      const assentosOcupados: number[] = [];
      
      for (let i = 0; i < ticketsSold; i++) {
        let randomSeat;
        do {
          randomSeat = Math.floor(Math.random() * show.totalAssentos) + 1;
        } while (assentosOcupados.includes(randomSeat));
        
        assentosOcupados.push(randomSeat);
        
        // Create a sample client for each sale
        const sampleClient = await this.createCliente({
          nome: `Cliente ${i + 1} - ${show.nome.split(' ')[0]}`,
          cpf: `${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}.${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}.${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`
        });

        // Create the sale (all tickets are "inteira" - full price)
        await db.insert(vendas).values({
          espetaculoId: createdShow.id,
          clienteId: sampleClient.id,
          assento: randomSeat,
          tipoIngresso: "inteira",
          precoFinal: show.preco,
          dataVenda: new Date().toISOString(),
        });
      }
      
      // Update show with occupied seats
      await this.updateEspetaculo(createdShow.id, {
        assentosOcupados: JSON.stringify(assentosOcupados),
      });
    }
  }
}

// Use MemStorage for now, can be switched to DatabaseStorage when needed
export const storage = new MemStorage();
