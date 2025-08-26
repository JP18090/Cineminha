package Projeto;

import java.util.List;
import java.util.Scanner;

public class Operacoes {
    public static void cadastrarEspetaculo(List<Espetaculo> espetaculos, Scanner entrada) {
        System.out.print("Quantos espetáculos você deseja cadastrar? ");
        int quantidade = entrada.nextInt();
        entrada.nextLine();

        for (int i = 0; i < quantidade; i++) {
            System.out.println("Cadastro do espetáculo " + (i + 1) + ":");
            System.out.print("Nome: ");
            String nome = entrada.nextLine();
            System.out.print("Data (dd/mm/yyyy): ");
            String data = entrada.nextLine();
            System.out.print("Horário (hh:mm): ");
            String horario = entrada.nextLine();
            System.out.print("Valor do ingresso: ");
            double preco = entrada.nextDouble();
            System.out.print("Número total de assentos: ");
            int totalAssentos = entrada.nextInt();
            entrada.nextLine();
            espetaculos.add(new Espetaculo(nome, data, horario, preco, totalAssentos, 0));
            System.out.println("Espetáculo cadastrado com sucesso!\n");
        }
    }

    public static void menuClientes(List<Cliente> clientes, Scanner entrada) {
        while (true) {
            System.out.println("\nCadastro de Clientes:");
            System.out.println("1. Novo Cliente");
            System.out.println("2. Exibir Cliente");
            System.out.println("3. Listar Todos");
            System.out.println("4. Voltar");
            System.out.print("Escolha: ");
            int opcao = entrada.nextInt();
            entrada.nextLine();

            switch (opcao) {
                case 1: cadastrarNovoCliente(clientes, entrada); break;
                case 2: exibirCliente(clientes, entrada); break;
                case 3: listarClientes(clientes); break;
                case 4: return;
                default: System.out.println("Opção inválida.");
            }
        }
    }

    public static void cadastrarNovoCliente(List<Cliente> clientes, Scanner entrada) {
        System.out.print("CPF: ");
        String cpf = entrada.nextLine();

        for (Cliente c : clientes) {
            if (c.getCPF().equals(cpf)) {
                System.out.println("Cliente já cadastrado.");
                return;
            }
        }

        Cliente cliente = new Cliente();
        cliente.setCPF(cpf);
        System.out.print("Nome: ");
        cliente.setNome(entrada.nextLine());
        clientes.add(cliente);
        System.out.println("Cliente cadastrado!");
    }

    public static void exibirCliente(List<Cliente> clientes, Scanner entrada) {
        System.out.print("CPF do cliente: ");
        String cpf = entrada.nextLine();
        for (Cliente c : clientes) {
            if (c.getCPF().equals(cpf)) {
                System.out.println(c);
                c.exibirHistorico();
                return;
            }
        }
        System.out.println("Cliente não encontrado.");
    }

    public static void listarClientes(List<Cliente> clientes) {
        if (clientes.isEmpty()) {
            System.out.println("Nenhum cliente cadastrado.");
        } else {
            for (Cliente c : clientes) {
                System.out.println(c);
            }
        }
    }

    public static void menuCompra(List<Espetaculo> espetaculos, List<Cliente> clientes, Scanner entrada) {
    if (espetaculos.isEmpty()) {
        System.out.println("Nenhum espetáculo cadastrado.");
        return;
    }

    System.out.println("Espetáculos disponíveis:");
    for (int i = 0; i < espetaculos.size(); i++) {
        Espetaculo e = espetaculos.get(i);
        System.out.printf("%d - %s (%s às %s)\n", i + 1, e.nome, e.data, e.horario);
    }

    System.out.print("Escolha o número do espetáculo: ");
    int indiceEspetaculo = entrada.nextInt() - 1;
    entrada.nextLine();

    if (indiceEspetaculo < 0 || indiceEspetaculo >= espetaculos.size()) {
        System.out.println("Espetáculo inválido.");
        return;
    }

    Espetaculo escolhido = espetaculos.get(indiceEspetaculo);
    escolhido.mostrarAssentos();

    System.out.print("Escolha o número do assento: ");
    int numAssento = entrada.nextInt() - 1;
    entrada.nextLine();

    if (numAssento < 0 || numAssento >= escolhido.assentos.size()) {
        System.out.println("Assento inválido.");
        return;
    }

    if (escolhido.assentos.get(numAssento)) {
        System.out.println("Assento já ocupado.");
        return;
    }

    System.out.print("CPF do cliente: ");
    String cpf = entrada.nextLine();
    Cliente cliente = null;
    for (Cliente c : clientes) {
        if (c.getCPF().equals(cpf)) {
            cliente = c;
            break;
        }
    }

    if (cliente == null) {
        System.out.println("Cliente não encontrado. Cadastre primeiro.");
        return;
    }

    System.out.println("Tipo de ingresso:");
    System.out.println("1 - Inteira");
    System.out.println("2 - Meia");
    System.out.println("3 - Professor");
    System.out.print("Escolha: ");
    int tipo = entrada.nextInt();
    entrada.nextLine();

    double precoFinal = escolhido.preco;
    if (tipo == 2) {
        precoFinal *= 0.5;
    } else if (tipo == 3) {
        precoFinal *= 0.3;
    }

    System.out.printf("Total a pagar: R$ %.2f\n", precoFinal);
    System.out.print("Confirmar compra (s/n)? ");
    char confirmar = entrada.next().charAt(0);
    entrada.nextLine();

    if (confirmar == 's' || confirmar == 'S') {
        escolhido.assentos.set(numAssento, true);
        escolhido.compradores.set(numAssento, cliente);
        cliente.setCompraAtual(precoFinal);
        System.out.println("Compra realizada com sucesso!");
    } else {
        System.out.println("Compra cancelada.");
    }
}

}
