# Modelagem do banco de dados — TechLearn Academy

Arquivos gerados a partir da cópia real do Azure SQL `TechLearnAcademy_PIMIV-Azure-20261107-211435.bacpac`, de 7 de novembro de 2026.

## Conteúdo

- `TechLearnAcademy_Modelagem_Banco.drawio`: arquivo editável com três páginas (MER conceitual, modelo lógico e modelo físico).
- `01_MER_Conceitual.*`: visão de negócio, sem detalhes técnicos desnecessários.
- `02_Modelo_Logico.*`: 19 tabelas, atributos e chaves.
- `03_Modelo_Fisico.*`: 19 tabelas, 127 colunas, tipos SQL, nulabilidade, identidade e relacionamentos.
- `TechLearnAcademy_Modelagem_Banco.pdf`: os três diagramas reunidos.
- `inventario_esquema.json`: inventário técnico utilizado para conferência.

## Conferência

O esquema contém 19 tabelas, 127 colunas, 27 chaves estrangeiras, 2 procedures, 2 triggers, 25 índices e 34 restrições CHECK.

O BACPAC foi adotado como fonte principal porque representa o banco efetivamente exportado do Azure. Os domínios e as alterações mais recentes também foram conferidos com os scripts do diretório `Banco`, especialmente `Instalar-banco-do-site.sql` e `08-dados-pessoais-usuarios.sql`.

## Como abrir e editar

1. Acesse https://app.diagrams.net/.
2. Escolha **Dispositivo**.
3. Abra `TechLearnAcademy_Modelagem_Banco.drawio`.
4. Use as abas inferiores para alternar entre os três modelos.

O arquivo `.drawio` usa caixas e conectores nativos, permitindo mover entidades, editar textos e reorganizar os relacionamentos.

## Notação

- `PK`: chave primária.
- `FK`: chave estrangeira.
- `UQ`: coluna participante de restrição única.
- `IDENTITY`: numeração automática do SQL Server.
- `NOT NULL`: campo obrigatório no banco.
- `NULL`: campo opcional no banco.
- `1:N`: um registro da tabela principal pode se relacionar com vários registros da tabela dependente.
