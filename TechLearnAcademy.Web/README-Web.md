# Site TechLearn Academy — referência de 08/11/2026

Esta pasta contém HTML, CSS e JavaScript sem framework de interface. A API ASP.NET Core é a fonte dos dados. Consulte [estado do repositório](../Documentacao/estado-atual-20261108.md) para distinguir código, publicação e testes datados.

## Abrir e entender

Execute `TechLearnAcademy.Api` e abra `https://localhost:7291/` com a conexão SQL de desenvolvimento configurada. A API serve os arquivos web da mesma origem, permitindo o envio de cookies HttpOnly. `TechLearnAcademy.Web` também permite prévia separada, mas os recursos de cadastro, login e cursos exigem a API acessível e a origem liberada no backend.

`wwwroot/js/config.js` define `URL_API`: a string vazia usa a mesma origem. `api.js` centraliza pedidos `fetch`, mensagens, navegação por perfil e validações de interface. `publico.js` cuida de cadastro, login e recuperação; `perfil.js` edita conta; `aluno.js`, `mentor.js`, `gestor.js` e `administrador.js` organizam as telas por perfil. O atributo `data-pagina` escolhe o início de cada página.

## Jornadas

| Pessoa | Páginas e ações principais |
| --- | --- |
| Visitante | `index.html`, `cadastro.html`, `recuperar-senha.html` e `redefinir-senha.html`. |
| Aluno | Painel, catálogo, matrícula, estudo por módulo, avaliação, resultado, chamados e certificados. |
| Mentor | Painel, alunos vinculados, orientações e chamados. |
| Gestor | Cursos, módulos, materiais, avaliações, relatórios, certificados e chamados. |
| Administrador | Usuários, painel e atendimento administrativo. |

O cadastro atual pede nome, e-mail, telefone com DDD, gênero e senha. A regra visível e a API exigem pelo menos **8 caracteres**, maiúscula, número e símbolo, sem espaços. A API aplica de novo as validações; esconder menus não autoriza acesso. A web não guarda senha nem token em `localStorage` ou `sessionStorage`. O login usa cookie de sessão HttpOnly.

A página carrega o widget VLibras de `vlibras.gov.br`, uma dependência externa de acessibilidade. Isso não traduz PDFs nem substitui testes de navegação por teclado e de tecnologias assistivas.

O HTML `aplicativos.html` aponta para APK e ZIP desktop hospedados no Azure. Esses binários não aparecem na árvore do Git; `TechLearnAcademy.Mobile/` é um protótipo MAUI antigo e não gera o APK Java entregue.
