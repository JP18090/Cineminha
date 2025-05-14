package Projeto;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Espetaculo {
    String nome;
    String data;
    String horario;
    double preco;
    List<Boolean> assentos; 
    List<Cliente> compradores;

    public Espetaculo(String nome, String data, String horario, double preco, int totalAssentos, int assentosOcupados) {
        this.nome = nome;
        this.data = data;
        this.horario = horario;
        this.preco = preco;
        this.assentos = new ArrayList<>();
        this.compradores = new ArrayList<>();

        for (int i = 0; i < totalAssentos; i++) {
            assentos.add(false);
            compradores.add(null);
        }

        Random random = new Random();
        for (int i = 0; i < assentosOcupados; i++) {
            int assentoAleatorio;
            do {
                assentoAleatorio = random.nextInt(totalAssentos);
            } while (assentos.get(assentoAleatorio));
            assentos.set(assentoAleatorio, true);
        }
    }

    public void mostrarAssentos() {
        System.out.println("Assentos Disponíveis:");
        for (int i = 0; i < assentos.size(); i++) {
            if (i % 10 == 0 && i != 0) {
                System.out.println(); 
            }
            System.out.print(assentos.get(i) ? "XX " : (i + 1) + " ");
        }
        System.out.println();
    }

    public Cliente consultarComprador(int assento) {
        if (assento < 0 || assento >= compradores.size()) {
            return null; 
        }
        return compradores.get(assento);
    }
}
