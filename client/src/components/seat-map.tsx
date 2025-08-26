import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Espetaculo, Cliente } from "@shared/schema";

interface SeatMapProps {
  show: Espetaculo;
  clients: Cliente[];
  onTicketSold: () => void;
}

export default function SeatMap({ show, clients, onTicketSold }: SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
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
      setSelectedSeat(null);
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
    if (!selectedSeat || !clientCPF) return;

    try {
      const client = await findClientByCPF();
      if (!client) {
        alert("Cliente não encontrado. Cadastre o cliente primeiro.");
        return;
      }

      await createSaleMutation.mutateAsync({
        espetaculoId: show.id,
        clienteId: client.id,
        assento: selectedSeat,
        tipoIngresso: ticketType,
        precoFinal: calculatePrice(),
      });
    } catch (error) {
      alert("Erro ao processar venda. Tente novamente.");
    }
  };

  const renderSeat = (seatNumber: number) => {
    const isOccupied = assentosOcupados.includes(seatNumber);
    const isSelected = selectedSeat === seatNumber;

    return (
      <button
        key={seatNumber}
        onClick={() => !isOccupied && setSelectedSeat(seatNumber)}
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
                <span className="text-slate-300">Assento selecionado:</span>
                <span className="text-white" data-testid="selected-seat-display">
                  {selectedSeat || "-"}
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
                  R$ {calculatePrice().toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleConfirmPurchase}
              disabled={!selectedSeat || !clientCPF || createSaleMutation.isPending}
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
