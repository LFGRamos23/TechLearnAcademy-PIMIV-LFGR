# Diagramas UML — TechLearn Academy

Abra **TechLearnAcademy-Diagramas-simples.asta** no Astah. O projeto contém os quatro tipos pedidos:

| Tipo | Onde encontrar | O que mostra |
| --- | --- | --- |
| Casos de uso | Raiz: `Casos de uso - TechLearn Academy` | Os 14 casos existentes, os quatro perfis e a participação de cada um. |
| Classes | Pacote `DIAGRAMAS DE CLASSES - SIMPLES`: desenho `00` | As nove classes principais e suas relações. |
| Sequência | Dentro de **cada um dos 14 casos de uso** | Ator, interface, controle e página(s) do site, nessa ordem. |
| Atividade | Dentro de **cada um dos 14 casos de uso** | Passos da função, decisão e caminhos de êxito/erro. |

Cada caso de uso contém **três diagramas próprios**: classes, sequência e atividade. Para encontrá-los, expanda o caso no painel à esquerda do Astah. O diagrama de casos de uso geral continua na raiz. A pasta [Imagens](Imagens/) reúne a exportação atual; o arquivo `.asta` é a versão completa para edição e apresentação.

## Onde entra a interface com o usuário

O círculo com uma barra à esquerda que aparece no Astah é o elemento **`<<boundary>>` (fronteira)**. Ele representa a tela pela qual a pessoa interage com o sistema. O elemento foi chamado de **`interface`**, como pedido:

- No diagrama de classes `01 - Acessar cursos`, o ícone `interface` indica a interface visual.
- **Em todos os 14 diagramas de sequência**, a linha de vida `interface:interface` usa essa mesma classe `<<boundary>>` e fica entre o ator e o controle.
- O símbolo não precisa aparecer nos diagramas de casos de uso nem de atividade. As **nove classes de negócio do código** continuam sendo as listadas abaixo.

O nome `interface` representa o contato do usuário com o site. O círculo com uma seta é `<<control>>`: o controlador da API que recebe a ação. À direita fica a página real usada no caso, por exemplo `cursos.html` ou `chamados.html`. Os quatro elementos aparecem da esquerda para a direita como o professor pediu. O estereótipo `<<boundary>>` não significa uma `interface` da linguagem C#.

No diagrama de casos de uso, **Aluno** fica à esquerda e **Gestor, Admin e Mentor** ficam à direita, na ordem mostrada na imagem enviada. As linhas contínuas mostram quem usa cada função. Os seis vínculos rotulados `<<include>>` foram restaurados com as mesmas direções visuais do desenho original. O caso **Criar curso**, que já existia no arquivo atualizado, foi mantido. Nos diagramas de sequência, as setas numeradas mostram a ordem das ações. Nos diagramas de atividade, as saídas dos losangos estão marcadas com `[sim]` e `[não]`.

## Como ler cada caixa

- A primeira parte é o nome da classe: por exemplo, `Usuario`.
- A segunda parte contém os **atributos**, ou seja, os dados que a classe guarda. Exemplo: `Nome: string` é um texto.
- A terceira parte contém as **operações** que existem nessa classe no código. `AtualizarDados()` é um método; `Curso(...)` é o construtor, que cria um curso.
- `+` indica que o código permite acessar o membro publicamente. `int` é número inteiro, `bool` é verdadeiro/falso e `decimal` é número com casas decimais. `lista` abrevia um tipo longo usado pelas alternativas de `Questao`.
- A linha entre duas caixas mostra uma relação. `1` significa um; `0..*` significa zero ou muitos. O curso aceita até **quatro módulos ativos** (`0..4`).
- A frase sob as caixas explica a função do caso de uso. As descrições detalhadas também estão no campo **Definition** de cada classe, atributo, operação, relação e desenho no Astah.
- Não há `<<servico>>` ou outro estereótipo nas caixas. O estereótipo é opcional nesse tipo de desenho; estas são simplesmente as classes de negócio que vocês podem apresentar.

## As nove classes do código

| Classe | Para que serve |
| --- | --- |
| `Usuario` | Conta de Aluno, Mentor, Gestor ou Administrador; o atributo `Perfil` diferencia os quatro. |
| `Curso` | Nome, descrição, carga horária e disponibilidade de um curso. |
| `Modulo` | Parte ordenada do curso. |
| `Material` | Link ou PDF de um módulo. |
| `Matricula` | Liga aluno e curso e guarda progresso e tentativa atual. |
| `Avaliacao` | Avaliação de um módulo. |
| `Questao` | Pergunta e alternativas da avaliação. |
| `Resultado` | Calcula acertos, percentual, nota e aprovação. |
| `OrientacaoMentor` | Guarda uma orientação escrita pelo mentor para o aluno. |

## Por que alguns desenhos têm só uma classe?

Vários casos tratam apenas de **Usuario**. Por isso `Permitir acesso`, `Bloquear acesso`, `Incluir Usuário` e outros repetem essa classe. Eles são funções diferentes do site, mas **não exigem classes diferentes**. A lógica de cadastro, permissões e banco de dados fica em outros arquivos do programa; não inventamos métodos nessa classe para encher a caixa. Por exemplo, a classe `Usuario` tem o atributo `Ativo`, mas não tem um método chamado `BloquearAcesso()` no código.

Os construtores e métodos desenhados existem nas classes C#. Tipos longos foram abreviados apenas quando indicado. A classe `OrientacaoMentor` usa `MentorId` e `AlunoId` para apontar para duas contas da classe `Usuario`. `Resultado` é um cálculo, sem associação física por ID com outra das nove classes.

## Limite do arquivo original

O diagrama de casos de uso fornecido não contém casos próprios para recursos mais recentes do site, como certificados e relatórios. Os 14 desenhos focados correspondem aos **14 casos já presentes no modelo Astah**. Para desenhar esses recursos novos por caso, o diagrama de casos de uso também precisará ser ampliado.

O arquivo `.asta` original e as exportações anteriores permanecem no histórico do Git e no PC. Para a apresentação, use somente a versão **simples** indicada acima.
