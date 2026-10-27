# Aplicativos da TechLearn Academy

Os aplicativos instalados usam a API publicada no Azure. Eles enviam pedidos por HTTPS e recebem JSON. A API confere o usuário e acessa o Azure SQL; os aplicativos não se conectam diretamente ao banco.

## Desktop do Administrador

- **Distribuição:** [página de aplicativos](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/aplicativos.html), versão 1.0.2 para Windows de 64 bits.
- **Tecnologia:** C# e Windows Forms, com telas nativas.
- **Funções:** entrar como Administrador, consultar e editar usuários, cadastrar Mentor ou Gestor, atender chamados e consultar o painel.
- **Código disponível:** `TechLearnAcademy.Desktop.Recuperado/`. Foi reconstruído do executável entregue e compilou com zero erros e avisos. Leia o `LEIA-ME.md` da pasta antes de estudar o código.
- **Configuração:** `servidor.txt` contém a raiz HTTPS da API. Internet e API disponíveis são necessários.

O ZIP publicado no Azure contém o executável, `servidor.txt` e um manual, mas não contém os arquivos-fonte originais. A pasta `TechLearnAcademy.Desktop/` deste repositório é um protótipo antigo que abre o site em WebView2; não representa o executável nativo distribuído.

## Aplicativo Android

- **Distribuição:** APK na mesma [página de aplicativos](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/aplicativos.html).
- **Tecnologia da versão entregue:** telas nativas Android.
- **Código-fonte:** não foi encontrado nas pastas atuais do projeto. O arquivo `TechLearnAcademy.Mobile/` é um protótipo .NET MAUI com WebView e **não** gera o APK nativo entregue.

Não apresente o código MAUI como se fosse o código do APK. Para alterar o aplicativo Android nativo, é necessário recuperar o projeto-fonte original ou reconstruí-lo a partir do APK, identificando o resultado como reconstrução.

## Explicação curta para a banca

“O site, o desktop e o Android usam a mesma API no Azure. A API valida o login e as permissões e grava no Azure SQL. O desktop é feito com Windows Forms e permite ao Administrador gerenciar usuários e chamados. Os protótipos antigos com WebView foram mantidos apenas como histórico e estão fora da solução principal.”
