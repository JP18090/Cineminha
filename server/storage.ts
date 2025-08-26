import { type Espetaculo, type Cliente, type Venda, type InsertEspetaculo, type InsertCliente, type InsertVenda } from "@shared/schema";
import { randomUUID } from "crypto";

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
      const id = randomUUID();
      const ocupados = Math.floor(Math.random() * 10); // Random occupied seats
      const assentosArray = Array.from({length: ocupados}, () => Math.floor(Math.random() * show.totalAssentos) + 1);
      
      this.espetaculos.set(id, {
        ...show,
        id,
        assentosOcupados: JSON.stringify(assentosArray),
      });
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

export const storage = new MemStorage();
