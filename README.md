# TechLearn Academy — PIM IV

Plataforma acadêmica de cursos com quatro perfis: Aluno, Mentor, Gestor e Administrador. O site e a API estão hospedados no Azure; a API grava os dados no Azure SQL Database.

**Site:** https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/

## Como as partes se conectam

```text
Navegador ou desktop
        ↓ HTTPS / JSON
API em C# (.NET 10) no Azure App Service
        ↓ SQL
Azure SQL Database
```

O site usa HTML, CSS e JavaScript sem framework. O desktop do Administrador usa Windows Forms e chama a mesma API. Uma alteração feita no desktop aparece no site porque ambos usam o mesmo banco por meio da API.

## Onde está cada parte

| Pasta | Conteúdo |
| --- | --- |
| `TechLearnAcademy.Api/` | Controladores, regras, modelos e acesso ao SQL. É o projeto publicado no Azure. |
| `TechLearnAcademy.Web/wwwroot/` | Páginas HTML, CSS e JavaScript do site. A API inclui esses arquivos ao publicar. |
| `Banco/` | Scripts SQL para criar ou atualizar a estrutura. |
| `Conteudos/` | Catálogo e manifesto dos materiais dos cursos. |
| `output/pdf/cursos/` | PDFs organizados por curso, usados como materiais. |
| `TechLearnAcademy.Desktop.Recuperado/` | Código C# reconstruído do executável desktop nativo entregue. |
| `TechLearnAcademy.Tests/` e `Testes/` | Verificações do projeto. |
| `Diagramas/` e `Documentacao/` | Diagramas UML, relatório e guias. |

`TechLearnAcademy.Desktop/` e `TechLearnAcademy.Mobile/` guardam **protótipos antigos** com WebView. Eles não correspondem aos aplicativos nativos distribuídos hoje. O projeto-fonte original do aplicativo Android nativo não foi encontrado; o APK continua disponível na [página de aplicativos](https://techlearn-proj-pim-hyayf7cehyd3edfq.westus3-01.azurewebsites.net/aplicativos.html). O código do desktop recuperado compila, mas não preserva os comentários nem a formatação originais.

## Executar localmente

1. Instale o SDK .NET 10, Visual Studio com ASP.NET e desenvolvimento para desktop com .NET, e SQL Server LocalDB ou SQL Server.
2. No SSMS, conectado a uma instância **sem** o banco `TechLearnAcademy_PIMIV`, execute `Banco/Instalar-banco-do-site.sql` uma vez. Para atualizar um banco existente, leia antes `Documentacao/banco.md`.
3. Copie `TechLearnAcademy.Api/appsettings.Development.example.json` para `TechLearnAcademy.Api/appsettings.Development.json` e ajuste somente a conexão local. Esse arquivo pessoal é ignorado pelo Git.
4. Abra `TechLearnAcademy.slnx` no Visual Studio e execute `TechLearnAcademy.Api`. O perfil local usa `https://localhost:7291/`.
5. Para abrir o desktop nativo, execute o projeto `TechLearnAcademy.Desktop.Recuperado`. Ele já aponta para a API publicada no Azure por `servidor.txt`.

O banco do Azure e as credenciais de e-mail ficam nas configurações do serviço, **fora do Git**. Um clone do repositório não copia as contas e registros reais; os scripts criam a estrutura do banco.

## Para apresentar ao professor

- **Git:** guarda versões do código. Cada commit registra uma parte coerente: estrutura, API, site, banco, aplicativos ou documentação.
- **GitHub:** hospeda este repositório privado para revisão e colaboração.
- **Azure:** executa o site e a API; o Azure SQL guarda os dados. Enviar um commit ao GitHub **não publica automaticamente** uma nova versão no Azure neste projeto.
- **Fluxo de cadastro:** a tela envia dados à API, a API valida e grava no SQL, e depois responde à tela.

Veja também [arquitetura e POO](Documentacao/orientacao-a-objetos.md), [banco](Documentacao/banco.md), [requisitos](Documentacao/requisitos.md) e [aplicativos](APLICATIVOS-LEIA-ME.md).
