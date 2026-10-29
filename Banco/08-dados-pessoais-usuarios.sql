-- Execute no banco TechLearn Academy já existente, após conferir a conexão.
-- Pode ser repetido. Os usuários atuais permanecem cadastrados; os novos campos começam vazios.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.Usuarios', 'Telefone') IS NULL
    ALTER TABLE dbo.Usuarios ADD Telefone nvarchar(11) NULL;
IF COL_LENGTH('dbo.Usuarios', 'Sexo') IS NULL
    ALTER TABLE dbo.Usuarios ADD Sexo nvarchar(20) NULL;
IF COL_LENGTH('dbo.Usuarios', 'SexoOutro') IS NULL
    ALTER TABLE dbo.Usuarios ADD SexoOutro nvarchar(60) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Usuarios_Telefone' AND parent_object_id=OBJECT_ID('dbo.Usuarios'))
    EXEC(N'ALTER TABLE dbo.Usuarios ADD CONSTRAINT CK_Usuarios_Telefone
        CHECK (Telefone IS NULL OR (LEN(Telefone) IN (10,11) AND Telefone NOT LIKE ''%[^0-9]%''))');
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Usuarios_Sexo' AND parent_object_id=OBJECT_ID('dbo.Usuarios'))
    EXEC(N'ALTER TABLE dbo.Usuarios ADD CONSTRAINT CK_Usuarios_Sexo
        CHECK (Sexo IS NULL OR Sexo IN (N''Masculino'',N''Feminino'',N''Outro''))');
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Usuarios_SexoOutro' AND parent_object_id=OBJECT_ID('dbo.Usuarios'))
    EXEC(N'ALTER TABLE dbo.Usuarios ADD CONSTRAINT CK_Usuarios_SexoOutro
        CHECK ((ISNULL(Sexo,N'''')=N''Outro'' AND SexoOutro IS NOT NULL AND LEN(LTRIM(RTRIM(SexoOutro))) BETWEEN 2 AND 60)
            OR (ISNULL(Sexo,N'''')<>N''Outro'' AND SexoOutro IS NULL))');

COMMIT TRANSACTION;
