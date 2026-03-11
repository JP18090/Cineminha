package Projeto;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class CineminhaApp {
    static List<Espetaculo> espetaculos = new ArrayList<>();
    static List<Cliente> listaClientes = new ArrayList<>();
    static Scanner entrada = new Scanner(System.in);

    public static void main(String[] args) {
        Menu.inicializarEspetaculos(espetaculos);
        Menu.menuPrincipal(espetaculos, listaClientes, entrada);
    }
}
