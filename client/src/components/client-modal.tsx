import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function ClientModal({ open, onOpenChange, onSubmit, isLoading }: ClientModalProps) {
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
