# Git e GitHub para a banca

## O que foi organizado

O Git registra versões do projeto no computador. O GitHub guarda uma cópia online desse histórico em um repositório **privado**. Os commits desta importação foram agrupados por assunto: estrutura inicial, API, interface web, banco, PDFs dos cursos, desktop, testes e documentação. Eles registram a organização feita agora; não representam datas antigas de desenvolvimento.

O Azure executa a aplicação. O Azure SQL guarda os registros dos usuários e cursos. O GitHub guarda o código e os scripts SQL, mas não as senhas nem uma cópia dos dados reais do banco. Neste projeto, enviar código ao GitHub não atualiza o Azure automaticamente.

## Como mostrar ao professor

1. Abra o repositório e mostre o `README.md`, que explica as pastas.
2. Clique em **History** para mostrar os commits. Cada mensagem diz qual parte foi adicionada.
3. Abra `TechLearnAcademy.Api/`, `TechLearnAcademy.Web/wwwroot/` e `Banco/` para mostrar API, telas e banco.
4. Abra `Diagramas/` e `Documentacao/` para apresentar UML, manuais e requisitos.
5. Explique que a sequência é: **tela → API → banco**. O desktop também usa a mesma API.

## Para continuar o trabalho

Depois de alterar arquivos no computador, execute na pasta do projeto:

```powershell
git status
git add caminho-do-arquivo
git commit -m "feat: descrever a mudança feita"
git push
```

`git status` mostra o que mudou. `git add` escolhe os arquivos. `git commit` salva uma versão local. `git push` envia os commits ao GitHub. Para trazer mudanças feitas por outro colaborador, use `git pull` antes de começar a editar.

Faça um commit por mudança coerente e escreva uma mensagem que explique o que foi feito. Não coloque senhas, chaves, backups do banco, `bin/` ou `obj/` no Git. O arquivo `.gitignore` ajuda a manter esses itens fora do repositório.

## Acesso do professor

Como o repositório é privado, o professor precisa ter uma conta no GitHub. Quando o nome de usuário dele for conhecido, o proprietário poderá convidá-lo em **Settings → Collaborators → Add people**. O convite só dá acesso depois que o professor o aceitar.
