import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Users, TicketIcon, DollarSign } from "lucide-react";
import Navigation from "@/components/navigation";
import ShowModal from "@/components/show-modal";
import ClientModal from "@/components/client-modal";
import SeatMap from "@/components/seat-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import type { Espetaculo, Cliente } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Espetaculo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Dashboard metrics query
  const { data: metrics, isLoading: metricsLoading } = useQuery({
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
    enabled: activeTab === "clientes",
  });

  // Create show mutation
  const createShowMutation = useMutation({
    mutationFn: async (data: any) => {
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
    mutationFn: async (data: any) => {
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
                <TableHead className="text-slate-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredShows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400">
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
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" data-testid={`button-view-show-${show.id}`}>
                          👁️
                        </Button>
                        <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300" data-testid={`button-edit-show-${show.id}`}>
                          ✏️
                        </Button>
                      </div>
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
                    <Button variant="secondary" size="sm" className="flex-1 bg-navy-700 hover:bg-navy-600" data-testid={`button-view-client-${client.id}`}>
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
        <SeatMap show={selectedShow} clients={clients} onTicketSold={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/espetaculos"] });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
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
    </div>
  );
}
