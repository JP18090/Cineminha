import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function ShowModal({ open, onOpenChange, onSubmit, isLoading }: ShowModalProps) {
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
      ...formData,
      preco: parseFloat(formData.preco),
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
