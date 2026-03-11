package Projeto;

import java.util.ArrayList;
import java.util.List;

public class Cliente {
    private String nome;
    private String cpf;
    private double compraAtual;
    private List<Double> historicoCompras;

    public Cliente() {
        this.historicoCompras = new ArrayList<>();
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCPF() {
        return cpf;
    }

    public void setCPF(String cpf) {
        this.cpf = cpf;
    }

    public void setCompraAtual(double valor) {
        this.compraAtual = valor;
        this.historicoCompras.add(valor);
    }

    public void exibirHistorico() {
        System.out.println("Histórico de Compras:");
        for (Double valor : historicoCompras) {
            System.out.printf("- R$ %.2f\n", valor);
        }
    }

    @Override
    public String toString() {
        return "Nome: " + nome + " | CPF: " + cpf;
    }
}
