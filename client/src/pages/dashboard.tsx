import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Users, TicketIcon, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import type { Espetaculo, Cliente, InsertEspetaculo, InsertCliente } from "@shared/schema";

interface DashboardMetrics {
  totalEspetaculos: number;
  totalClientes: number;
  ingressosVendidos: number;
  receitaTotal: number;
}

// Navigation Component
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "espetaculos", label: "Espetáculos" },
    { id: "clientes", label: "Clientes" },
    { id: "ingressos", label: "Ingressos" },
  ];

  return (
    <nav className="bg-navy-800 border-b border-navy-700" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3" data-testid="logo">
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
              <Film className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">Cineminha</span>
          </div>
          
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "text-white bg-navy-700"
                    : "text-slate-300 hover:text-white hover:bg-navy-700"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Show Modal Component
interface ShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertEspetaculo) => void;
  isLoading: boolean;
}

function ShowModal({ open, onOpenChange, onSubmit, isLoading }: ShowModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    horario: "",
    preco: "",
    totalAssentos: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nome: formData.nome,
      data: formData.data,
      horario: formData.horario,
      preco: formData.preco,
      totalAssentos: parseInt(formData.totalAssentos),
    });
    setFormData({
      nome: "",
      data: "",
      horario: "",
      preco: "",
      totalAssentos: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-2xl" data-testid="modal-show">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-white">
              Cadastrar Novo Espetáculo
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
              data-testid="button-close-show-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-create-show">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-300">Nome do Espetáculo</Label>
              <Input
                placeholder="Ex: O Rei Leão"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="bg-navy-700 border-navy-600 text-white placeholder-slate-400"
                required
                data-testid="input-show-name"
              />
            </div>
            <div>
              <Label className="text-slate-300">Data</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => handleChange("data", e.target.value)}
                className="bg-navy-700 border-navy-600 text-white"
                required
                data-testid="input-show-date"
              />
            </div>
            <div>
              <Label className="text-slate-300">Horário</Label>
              <Input
                type="time"
                value={formData.horario}
                onChange={(e) => handleChange("horario", e.target.value)}
                className="bg-navy-700 border-navy-600 text-white"
                required
                data-testid="input-show-time"
              />
            </div>
            <div>
              <Label className="text-slate-300">Preço do Ingresso</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.preco}
                  onChange={(e) => handleChange("preco", e.target.value)}
                  className="bg-navy-700 border-navy-600 text-white placeholder-slate-400 pl-8"
                  required
                  data-testid="input-show-price"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-slate-300">Total de Assentos</Label>
              <Input
                type="number"
                min="1"
                max="200"
                placeholder="50"
                value={formData.totalAssentos}
                onChange={(e) => handleChange("totalAssentos", e.target.value)}
                className="bg-navy-700 border-navy-600 text-white placeholder-slate-400"
                required
                data-testid="input-show-seats"
              />
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 bg-navy-700 hover:bg-navy-600"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-show"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={isLoading}
              data-testid="button-submit-show"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar Espetáculo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Client Modal Component
interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertCliente) => void;
  isLoading: boolean;
}

function ClientModal({ open, onOpenChange, onSubmit, isLoading }: ClientModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      nome: "",
      cpf: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    handleChange("cpf", formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-lg" data-testid="modal-client">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-white">
              Cadastrar Novo Cliente
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white"
              data-testid="button-close-client-modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-create-client">
          <div>
            <Label className="text-slate-300">Nome Completo</Label>
            <Input
              placeholder="Ex: Maria Silva"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className="bg-navy-700 border-navy-600 text-white placeholder-slate-400"
              required
              data-testid="input-client-name"
            />
          </div>
          <div>
            <Label className="text-slate-300">CPF</Label>
            <Input
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => handleCPFChange(e.target.value)}
              className="bg-navy-700 border-navy-600 text-white placeholder-slate-400"
              required
              data-testid="input-client-cpf"
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 bg-navy-700 hover:bg-navy-600"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-client"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
              data-testid="button-submit-client"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Seat Map Component
interface SeatMapProps {
  show: Espetaculo;
  onTicketSold: () => void;
}

function SeatMap({ show, onTicketSold }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [clientCPF, setClientCPF] = useState("");
  const [ticketType, setTicketType] = useState("inteira");
  const queryClient = useQueryClient();

  const assentosOcupados = JSON.parse(show.assentosOcupados || "[]");
  const basePrice = parseFloat(show.preco);

  const calculatePrice = () => {
    switch (ticketType) {
      case "meia":
        return basePrice * 0.5;
      case "professor":
        return basePrice * 0.3;
      default:
        return basePrice;
    }
  };

  const createSaleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vendas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/espetaculos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      setSelectedSeats([]);
      setClientCPF("");
      onTicketSold();
    },
  });

  const findClientByCPF = async () => {
    try {
      const response = await apiRequest("GET", `/api/clientes/cpf/${clientCPF.replace(/\D/g, "")}`);
      return await response.json();
    } catch {
      return null;
    }
  };

  const handleConfirmPurchase = async () => {
    if (selectedSeats.length === 0 || !clientCPF) return;

    try {
      const client = await findClientByCPF();
      if (!client) {
        alert("Cliente não encontrado. Cadastre o cliente primeiro.");
        return;
      }

      await createSaleMutation.mutateAsync({
        espetaculoId: show.id,
        clienteId: client.id,
        assentos: selectedSeats,
        tipoIngresso: ticketType,
        precoFinal: calculatePrice(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        alert("Um ou mais assentos já foram vendidos. Atualize e selecione novamente.");
        return;
      }
      alert("Erro ao processar venda. Tente novamente.");
    }
  };

  const toggleSeat = (seatNumber: number) => {
    setSelectedSeats((previous) =>
      previous.includes(seatNumber)
        ? previous.filter((seat) => seat !== seatNumber)
        : [...previous, seatNumber].sort((a, b) => a - b),
    );
  };

  const renderSeat = (seatNumber: number) => {
    const isOccupied = assentosOcupados.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);

    return (
      <button
        key={seatNumber}
        onClick={() => !isOccupied && toggleSeat(seatNumber)}
        className={`w-8 h-8 rounded text-xs font-medium flex items-center justify-center transition-colors ${
          isOccupied
            ? "bg-red-500 cursor-not-allowed text-white"
            : isSelected
            ? "bg-blue-500 text-white"
            : "bg-green-500 hover:bg-green-400 text-white cursor-pointer"
        }`}
        disabled={isOccupied}
        data-testid={`seat-${seatNumber}`}
      >
        {seatNumber}
      </button>
    );
  };

  const renderSeatMap = () => {
    const rows = [];
    const seatsPerRow = 10;
    const totalRows = Math.ceil(show.totalAssentos / seatsPerRow);

    for (let row = 0; row < totalRows; row++) {
      const rowSeats = [];
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatNumber = row * seatsPerRow + seat;
        if (seatNumber <= show.totalAssentos) {
          rowSeats.push(renderSeat(seatNumber));
        }
      }
      rows.push(
        <div key={row} className="flex justify-center space-x-2">
          {rowSeats}
        </div>
      );
    }

    return rows;
  };

  return (
    <Card className="bg-navy-800 border-navy-700" data-testid="seat-selection">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Seleção de Assentos</h3>
        
        {/* Theater Screen */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-300 text-navy-900 px-8 py-2 rounded-lg text-sm font-medium">
            PALCO
          </div>
        </div>

        {/* Seat Map */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="space-y-2" data-testid="seat-map">
            {renderSeatMap()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-8 mb-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-300">Disponível</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-slate-300">Selecionado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-slate-300">Ocupado</span>
          </div>
        </div>

        {/* Client and Ticket Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Informações do Cliente</h4>
            <div>
              <Label className="text-slate-300">CPF do Cliente</Label>
              <Input
                placeholder="000.000.000-00"
                value={clientCPF}
                onChange={(e) => setClientCPF(e.target.value)}
                className="bg-navy-700 border-navy-600 text-white placeholder-slate-400"
                data-testid="input-client-cpf-sale"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium">Detalhes da Compra</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Assentos selecionados:</span>
                <span className="text-white" data-testid="selected-seat-display">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Quantidade:</span>
                <span className="text-white" data-testid="selected-seat-count">
                  {selectedSeats.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Tipo de ingresso:</span>
                <Select value={ticketType} onValueChange={setTicketType}>
                  <SelectTrigger className="bg-navy-700 border-navy-600 text-white w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inteira">Inteira</SelectItem>
                    <SelectItem value="meia">Meia</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Preço:</span>
                <span className="text-green-400 font-medium" data-testid="final-price">
                  R$ {(calculatePrice() * selectedSeats.length).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleConfirmPurchase}
              disabled={selectedSeats.length === 0 || !clientCPF || createSaleMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600"
              data-testid="button-confirm-purchase"
            >
              {createSaleMutation.isPending ? "Processando..." : "Confirmar Compra"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedShow, setSelectedShow] = useState<Espetaculo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Dashboard metrics query
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: activeTab === "dashboard",
  });

  // Shows query
  const { data: shows = [], isLoading: showsLoading } = useQuery<Espetaculo[]>({
    queryKey: ["/api/espetaculos"],
    enabled: activeTab === "espetaculos" || activeTab === "ingressos",
  });

  // Clients query
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Cliente[]>({
    queryKey: ["/api/clientes"],
    enabled: true,
  });

  // Create show mutation
  const createShowMutation = useMutation({
    mutationFn: async (data: InsertEspetaculo) => {
      const response = await apiRequest("POST", "/api/espetaculos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/espetaculos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setShowModal(false);
    },
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertCliente) => {
      const response = await apiRequest("POST", "/api/clientes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      setClientModal(false);
    },
  });

  const filteredShows = shows.filter(show =>
    show.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.cpf.includes(clientSearchQuery)
  );

  const getAvailableSeats = (show: Espetaculo) => {
    const ocupados = JSON.parse(show.assentosOcupados || "[]");
    return show.totalAssentos - ocupados.length;
  };

  const getClientStats = (client: Cliente) => {
    const historico = JSON.parse(client.historicoCompras || "[]");
    const totalPurchases = historico.length;
    const totalSpent = historico.reduce((sum: number, value: number) => sum + value, 0);
    return { totalPurchases, totalSpent };
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white" data-testid="dashboard-title">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema de gestão de espetáculos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Espetáculos</p>
                <p className="text-2xl font-bold text-white" data-testid="total-shows">
                  {metricsLoading ? "..." : metrics?.totalEspetaculos || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Film className="text-yellow-500 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Clientes Cadastrados</p>
                <p className="text-2xl font-bold text-white" data-testid="total-clients">
                  {metricsLoading ? "..." : metrics?.totalClientes || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Ingressos Vendidos</p>
                <p className="text-2xl font-bold text-white" data-testid="tickets-sold">
                  {metricsLoading ? "..." : metrics?.ingressosVendidos || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <TicketIcon className="text-green-500 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-white" data-testid="total-revenue">
                  {metricsLoading ? "..." : `R$ ${metrics?.receitaTotal?.toFixed(2).replace(".", ",") || "0,00"}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="text-amber-500 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Film className="text-red-500" />
              <h3 className="text-lg font-semibold text-white">Novo Espetáculo</h3>
            </div>
            <p className="text-slate-400 mb-6">Cadastre um novo espetáculo no sistema</p>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600" 
              onClick={() => setShowModal(true)}
              data-testid="button-new-show"
            >
              Cadastrar Espetáculo
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-navy-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Novo Cliente</h3>
            </div>
            <p className="text-slate-400 mb-6">Registre um novo cliente</p>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600" 
              onClick={() => setClientModal(true)}
              data-testid="button-new-client"
            >
              Cadastrar Cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEspetaculos = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="shows-title">Espetáculos</h1>
          <p className="text-slate-400 mt-1">Gerencie todos os espetáculos disponíveis</p>
        </div>
        <Button 
          className="bg-red-500 hover:bg-red-600 flex items-center space-x-2" 
          onClick={() => setShowModal(true)}
          data-testid="button-new-show-header"
        >
          <Film className="w-4 h-4" />
          <span>Novo Espetáculo</span>
        </Button>
      </div>

      <Card className="bg-navy-800 border-navy-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar espetáculos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-navy-700 border-navy-600 text-white placeholder-slate-400"
              data-testid="input-search-shows"
            />
            <Select>
              <SelectTrigger className="bg-navy-700 border-navy-600 text-white w-48">
                <SelectValue placeholder="Todas as datas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="2024-05">Maio 2024</SelectItem>
                <SelectItem value="2025-03">Março 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-navy-800 border-navy-700">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-navy-700">
                <TableHead className="text-slate-300">Nome</TableHead>
                <TableHead className="text-slate-300">Data</TableHead>
                <TableHead className="text-slate-300">Horário</TableHead>
                <TableHead className="text-slate-300">Preço</TableHead>
                <TableHead className="text-slate-300">Assentos</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredShows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400">
                    Nenhum espetáculo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredShows.map((show) => (
                  <TableRow key={show.id} className="border-navy-700 hover:bg-navy-700" data-testid={`row-show-${show.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Film className="text-red-500 w-5 h-5" />
                        </div>
                        <span className="text-white font-medium">{show.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{show.data}</TableCell>
                    <TableCell className="text-slate-300">{show.horario}</TableCell>
                    <TableCell className="text-slate-300">R$ {parseFloat(show.preco).toFixed(2).replace(".", ",")}</TableCell>
                    <TableCell>
                      <span className="text-green-400">{getAvailableSeats(show)}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-300">{show.totalAssentos}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 bg-opacity-20 text-green-400">
                        Disponível
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );

  const renderClientes = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="clients-title">Clientes</h1>
          <p className="text-slate-400 mt-1">Gerencie todos os clientes cadastrados</p>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2" 
          onClick={() => setClientModal(true)}
          data-testid="button-new-client-header"
        >
          <Users className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      <Card className="bg-navy-800 border-navy-700">
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={clientSearchQuery}
            onChange={(e) => setClientSearchQuery(e.target.value)}
            className="w-full bg-navy-700 border-navy-600 text-white placeholder-slate-400"
            data-testid="input-search-clients"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientsLoading ? (
          <div className="col-span-full text-center text-slate-400">Carregando...</div>
        ) : filteredClients.length === 0 ? (
          <div className="col-span-full text-center text-slate-400">Nenhum cliente encontrado</div>
        ) : (
          filteredClients.map((client) => {
            const stats = getClientStats(client);
            return (
              <Card key={client.id} className="bg-navy-800 border-navy-700 hover:border-navy-600" data-testid={`card-client-${client.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center">
                      <Users className="text-blue-500 w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{client.nome}</h3>
                      <p className="text-slate-400 text-sm">{client.cpf}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Compras realizadas:</span>
                      <span className="text-white">{stats.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total gasto:</span>
                      <span className="text-green-400">R$ {stats.totalSpent.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 bg-navy-700 hover:bg-navy-600"
                      onClick={() => {
                        setSelectedClient(client);
                        setHistoryModalOpen(true);
                      }}
                      data-testid={`button-view-client-${client.id}`}
                    >
                      Ver Histórico
                    </Button>
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300" data-testid={`button-edit-client-${client.id}`}>
                      ✏️
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderIngressos = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white" data-testid="tickets-title">Venda de Ingressos</h1>
        <p className="text-slate-400 mt-1">Selecione um espetáculo e venda ingressos</p>
      </div>

      <Card className="bg-navy-800 border-navy-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Selecionar Espetáculo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showsLoading ? (
              <div className="col-span-full text-center text-slate-400">Carregando...</div>
            ) : shows.length === 0 ? (
              <div className="col-span-full text-center text-slate-400">Nenhum espetáculo disponível</div>
            ) : (
              shows.map((show) => (
                <Card
                  key={show.id}
                  className={`bg-navy-700 cursor-pointer hover:bg-navy-600 transition-colors border-2 ${
                    selectedShow?.id === show.id ? "border-green-500" : "border-transparent hover:border-green-500"
                  }`}
                  onClick={() => setSelectedShow(show)}
                  data-testid={`card-select-show-${show.id}`}
                >
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-2">{show.nome}</h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>📅 {show.data}</p>
                      <p>🕐 {show.horario}</p>
                      <p>💰 R$ {parseFloat(show.preco).toFixed(2).replace(".", ",")}</p>
                      <p>🪑 {getAvailableSeats(show)}/{show.totalAssentos} disponíveis</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedShow && (
        <SeatMap show={selectedShow} onTicketSold={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/espetaculos"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
          queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
        }} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "espetaculos" && renderEspetaculos()}
        {activeTab === "clientes" && renderClientes()}
        {activeTab === "ingressos" && renderIngressos()}
      </div>

      <ShowModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={(data) => createShowMutation.mutate(data)}
        isLoading={createShowMutation.isPending}
      />

      <ClientModal
        open={clientModal}
        onOpenChange={setClientModal}
        onSubmit={(data) => createClientMutation.mutate(data)}
        isLoading={createClientMutation.isPending}
      />

      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white max-w-lg" data-testid="modal-client-history">
          <DialogHeader>
            <DialogTitle>
              Histórico de Compras {selectedClient ? `- ${selectedClient.nome}` : ""}
            </DialogTitle>
          </DialogHeader>

          {selectedClient ? (
            (() => {
              const historico = JSON.parse(selectedClient.historicoCompras || "[]") as number[];
              const totalSpent = historico.reduce((sum, value) => sum + value, 0);
              return (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm">CPF: {selectedClient.cpf}</p>
                  <div className="bg-navy-700 rounded-md p-3">
                    <p className="text-slate-300 text-sm">Compras realizadas: {historico.length}</p>
                    <p className="text-green-400 font-medium">Total gasto: R$ {totalSpent.toFixed(2).replace(".", ",")}</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {historico.length === 0 ? (
                      <p className="text-slate-400 text-sm">Nenhuma compra registrada.</p>
                    ) : (
                      historico.map((valor, index) => (
                        <div
                          key={`${selectedClient.id}-purchase-${index}`}
                          className="flex justify-between items-center bg-navy-700 rounded-md px-3 py-2 text-sm"
                        >
                          <span className="text-slate-300">Compra {index + 1}</span>
                          <span className="text-white">R$ {valor.toFixed(2).replace(".", ",")}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-slate-400 text-sm">Selecione um cliente para visualizar o histórico.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
