// Controla cadastro, login e recuperação de senha antes da entrada no site.
const pagina = document.body.dataset.pagina;

// O login recebe o perfil da API e segue para o painel correspondente.
if (pagina === "login") {
    enviarFormulario("form-login", async function () {
        const email = textoCampo("email");
        verificarEmail(email);
        const usuario = await requisicao("/api/usuarios/login", "POST", { email: email, senha: valor("senha") });
        const destino = destinoPerfil(usuario.perfil);
        if (!destino) throw new Error("Perfil de usuário não reconhecido.");
        aviso("Login realizado com sucesso.", "sucesso");
        // O token da API não é salvo. O navegador envia o cookie HttpOnly.
        setTimeout(function () { location.href = destino; }, 600);
    }, "Entrando...");
}

// O formulário público cria um aluno após validar dados pessoais e senha.
if (pagina === "cadastro") {
    configurarSexo("sexo", "area-sexo-outro", "sexo-outro");
    enviarFormulario("form-cadastro", async function (formulario) {
        const nome = textoCampo("nome");
        const email = textoCampo("email");
        verificarNome(nome);
        verificarEmail(email);
        verificarSenha(valor("senha"), valor("confirmar-senha"));
        const resposta = await requisicao("/api/usuarios/cadastro", "POST", {
            nome: nome, email: email, telefone: textoCampo("telefone"), sexo: valor("sexo"), sexoOutro: textoCampo("sexo-outro"),
            senha: valor("senha"), confirmarSenha: valor("confirmar-senha")
        });
        formulario.reset();
        campo("sexo").dispatchEvent(new Event("change"));
        aviso(resposta.mensagem, "sucesso");
    }, "Cadastrando...");
}

// A resposta é igual para e-mails cadastrados ou não, sem expor contas existentes.
if (pagina === "recuperar") {
    enviarFormulario("form-recuperar", async function (formulario) {
        const email = textoCampo("email");
        verificarEmail(email);
        const resposta = await requisicao("/api/usuarios/recuperar-senha", "POST", { email: email });
        formulario.reset();
        aviso(resposta.mensagem, "sucesso");
    }, "Enviando...");
}

if (pagina === "redefinir") {
    campo("token").value = new URLSearchParams(location.search).get("token") || "";
    enviarFormulario("form-redefinir", async function (formulario) {
        verificarSenha(valor("senha"), valor("confirmar-senha"));
        const resposta = await requisicao("/api/usuarios/redefinir-senha", "POST", {
            token: textoCampo("token"), senha: valor("senha"), confirmarSenha: valor("confirmar-senha")
        });
        formulario.reset();
        // Remove o código do endereço depois de usar o link recebido por e-mail.
        history.replaceState(null, "", "redefinir-senha.html");
        aviso(resposta.mensagem + " Volte ao login para entrar.", "sucesso");
    });
}

