package Projeto;

import java.util.List;
import java.util.Scanner;

public class Menu {
    public static void inicializarEspetaculos(List<Espetaculo> espetaculos) {
        espetaculos.add(new Espetaculo("A Fantástica Fábrica de Chocolate", "15/05/2024", "19h30", 30.00, 50, 10)); 
        espetaculos.add(new Espetaculo("Castelo Rá-Tim-Bum", "30/05/2024", "20h30", 50.00, 50, 8));  
        espetaculos.add(new Espetaculo("A Branca de Neve", "02/03/2025", "21h30", 35.00, 50, 5));  
    }

    public static void menuPrincipal(List<Espetaculo> espetaculos, List<Cliente> clientes, Scanner entrada) {
        char menuOption;
        do {
            System.out.println("Bem-vindo ao Cineminha!");
            System.out.println("1. Cadastrar Espetáculo");
            System.out.println("2. Cadastrar Cliente");
            System.out.println("3. Compra de Entradas");
            System.out.println("4. Sair");
            System.out.print("Escolha uma opção: ");
            menuOption = entrada.next().charAt(0);

            switch (menuOption) {
                case '1':
                    Operacoes.cadastrarEspetaculo(espetaculos, entrada);
                    break;
                case '2':
                    Operacoes.menuClientes(clientes, entrada);
                    break;
                case '3':
                    Operacoes.menuCompra(espetaculos, clientes, entrada);
                    break;
                case '4':
                    System.out.println("Saindo...");
                    break;
                default:
                    System.out.println("Opção inválida! Tente novamente.");
            }
            System.out.println(); 
        } while (menuOption != '4');
    }
}
