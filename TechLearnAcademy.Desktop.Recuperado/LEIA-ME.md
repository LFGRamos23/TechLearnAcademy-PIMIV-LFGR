# Código do desktop recuperado

Esta pasta contém o código C# **recuperado do executável desktop versão 1.0.2** publicado no Azure. O ZIP disponível no site contém apenas o executável, `servidor.txt` e um manual; não contém os arquivos-fonte originais. Conferimos que o executável do ZIP do Azure é idêntico ao arquivo em `Downloads/entregas/Desktop` por SHA-256.

O código foi reconstruído por descompilação. Ele permite estudar e modificar o aplicativo, mas **não é uma cópia exata dos arquivos originais**: comentários, formatação e alguns detalhes escolhidos pelo compilador não podem ser recuperados. O arquivo de projeto foi ajustado para compilar, e `servidor.txt` é copiado para a pasta de saída.

## Abrir no Visual Studio

1. Abra `TechLearnAcademy.Desktop.csproj` nesta pasta.
2. Escolha este projeto como projeto de inicialização.
3. Pressione **F5**. Para entrar, use uma conta Administrador do site.

É necessário o SDK .NET 10 e a carga de trabalho de desenvolvimento para desktop com .NET. A versão recuperada compilou com **zero erros e zero avisos** em 27/10/2026.

## Arquivos principais

| Arquivo | Papel |
| --- | --- |
| `TechLearnAcademy.Desktop/Program.cs` | Inicia o aplicativo e abre o login. |
| `TechLearnAcademy.Desktop/TelaLogin.cs` | Tela de entrada do Administrador. |
| `TechLearnAcademy.Desktop/TelaPrincipal.cs` | Janela principal, abas, usuários e chamados. |
| `TechLearnAcademy.Desktop/TelaUsuario.cs` | Cadastro e edição de usuários. |
| `TechLearnAcademy.Desktop/TelaChamado.cs` | Conversa e atendimento de chamados. |
| `TechLearnAcademy.Desktop/ApiCliente.cs` | Comunicação com a API do site. |
| `TechLearnAcademy.Desktop/Configuracao.cs` e `servidor.txt` | Endereço da API no Azure. |
| `TechLearnAcademy.Desktop/Estilo.cs` | Aparência dos controles. |
| `TechLearnAcademy.Desktop/Validacao.cs` | Validação dos campos. |

As outras classes pequenas representam dados recebidos da API, como `Usuario`, `Chamado` e `ResumoAdmin`.

**Atenção:** o protótipo antigo `TechLearnAcademy.Desktop` com WebView2 não faz parte da árvore atual do Git, embora continue no PC e no histórico. Para estudar a versão nativa entregue, abra o projeto desta pasta `TechLearnAcademy.Desktop.Recuperado`.
