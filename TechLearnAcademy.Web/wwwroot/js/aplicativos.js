// Controla somente o download do APK mostrado na página de aplicativos.
class PaginaAplicativos {
    constructor() {
        this.botaoApk = document.getElementById("baixar-apk");
        this.mensagemDownload = document.getElementById("mensagem-download");
        this.baixando = false;
    }
    iniciar() {
        this.botaoApk.addEventListener("click", evento => this.baixarApk(evento));
    }

    // O arquivo é baixado do próprio site; a mensagem avisa se ele estiver indisponível.
    async baixarApk(evento) {
        evento.preventDefault();
        if (this.baixando) return;
        this.baixando = true;
        this.botaoApk.setAttribute("aria-disabled", "true");
        this.botaoApk.textContent = "Preparando APK...";
        this.mensagemDownload.textContent = "Preparando o arquivo para baixar.";
        try {
            const resposta = await fetch(this.botaoApk.href);
            if (!resposta.ok) throw new Error("Falha no download.");
            // Informa ao navegador o tipo correto do instalador Android.
            const arquivo = new Blob([await resposta.arrayBuffer()], {
                type: "application/vnd.android.package-archive"
            });
            const endereco = URL.createObjectURL(arquivo);
            const link = document.createElement("a");
            link.href = endereco;
            link.download = "TechLearnAcademy-Android.apk";
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(endereco), 60000);
            this.mensagemDownload.textContent = "Download solicitado. Abra o APK no celular para instalar.";
        } catch (erro) {
            this.mensagemDownload.textContent = "Não foi possível baixar o APK. Tente novamente mais tarde.";
        } finally {
            this.baixando = false;
            this.botaoApk.removeAttribute("aria-disabled");
            this.botaoApk.textContent = "Baixar APK Android";
        }
    }
}

new PaginaAplicativos().iniciar();
