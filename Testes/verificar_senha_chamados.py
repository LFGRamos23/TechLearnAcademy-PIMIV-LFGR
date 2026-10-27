"""Verifica recuperação e chamados em um banco LOCAL novo, sem dados reais.

Execute com Python no Windows. Usa SMTP fictício local e deixa uma evidência
sem senhas, e-mails ou tokens em tmp/verificacao-senha-chamados/resultado.json.
"""

import base64
import hashlib
import json
import os
import re
import socketserver
import subprocess
import threading
import time
import urllib.error
import urllib.request
from email.parser import BytesParser
from email.policy import default
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tmp" / "verificacao-senha-chamados"
OUT.mkdir(parents=True, exist_ok=True)
DB = "TechLearnAcademy_TesteSenhaChamados_" + datetime.now().strftime("%Y%m%d%H%M%S")
BASE = "http://127.0.0.1:5418"
PASSWORD = "Teste123!"
checks = []
mailbox = []


def check(condition, description):
    checks.append({"verificacao": description, "passou": bool(condition)})
    (OUT / "resultado.json").write_text(json.dumps(checks, ensure_ascii=False, indent=2), encoding="utf-8")
    if not condition:
        raise AssertionError(description)


def sql(query, input_file=None):
    args = ["sqlcmd", "-b", "-S", r"(localdb)\MSSQLLocalDB", "-E"]
    options = "SET ANSI_NULLS ON; SET QUOTED_IDENTIFIER ON; SET ANSI_PADDING ON; SET ANSI_WARNINGS ON; SET ARITHABORT ON; SET CONCAT_NULL_YIELDS_NULL ON; SET NUMERIC_ROUNDABORT OFF; "
    args += ["-i", str(input_file)] if input_file else ["-Q", options + query]
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError((result.stderr or result.stdout).strip())


def req(path, data=None, token=None, status=200):
    raw = json.dumps(data).encode() if data is not None else None
    headers = {"Content-Type": "application/json"} if raw is not None else {}
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(BASE + path, raw, headers)
    try:
        result = urllib.request.urlopen(request, timeout=15)
    except urllib.error.HTTPError as error:
        result = error
    body = result.read()
    check(result.status == status, f"{path}: HTTP {status}")
    return json.loads(body) if body else {}


class SMTP(socketserver.StreamRequestHandler):
    def handle(self):
        self.wfile.write(b"220 smtp local\r\n")
        while line := self.rfile.readline():
            command = line.decode(errors="replace").strip().upper()
            if command.startswith(("EHLO", "HELO")):
                self.wfile.write(b"250-smtp local\r\n250 SIZE 1500000\r\n")
            elif command == "DATA":
                self.wfile.write(b"354 Continue\r\n")
                data = b""
                while (line := self.rfile.readline()) not in (b".\r\n", b""):
                    data += line
                mailbox.append(BytesParser(policy=default).parsebytes(data))
                self.wfile.write(b"250 Accepted\r\n")
            elif command == "QUIT":
                self.wfile.write(b"221 Bye\r\n")
                break
            else:
                self.wfile.write(b"250 OK\r\n")


def login(email, password=PASSWORD):
    return req("/api/usuarios/login", {"email": email, "senha": password})["token"]


def main():
    # O instalador se recusa a sobrescrever um banco existente.
    installer = (ROOT / "Banco" / "Instalar-banco-do-site.sql").read_text(encoding="utf-8-sig")
    (OUT / "instalar.sql").write_text(installer.replace("TechLearnAcademy_PIMIV", DB), encoding="utf-8")
    sql("", OUT / "instalar.sql")
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", PASSWORD.encode(), salt, 600000)
    saved = "600000." + base64.b64encode(salt).decode() + "." + base64.b64encode(digest).decode()
    sql(f"USE {DB}; INSERT INTO Usuarios(Nome,Email,EmailContato,SenhaHash,Perfil) VALUES(N'Admin de Teste','admin@teste.invalid','admin@teste.invalid','{saved}','Administrador')")

    smtp = socketserver.ThreadingTCPServer(("127.0.0.1", 2528), SMTP)
    threading.Thread(target=smtp.serve_forever, daemon=True).start()
    env = dict(os.environ)
    env.update({
        "ASPNETCORE_URLS": BASE,
        "ASPNETCORE_ENVIRONMENT": "Production",
        "ConnectionStrings__Banco": rf"Server=(localdb)\MSSQLLocalDB;Database={DB};Integrated Security=true;Encrypt=false;TrustServerCertificate=true",
        "Email__Servidor": "127.0.0.1", "Email__Porta": "2528",
        "Email__Remetente": "testes@teste.invalid", "Email__UsarTls": "false",
        "Email__UrlRedefinicao": BASE + "/redefinir-senha.html",
    })
    api = subprocess.Popen(["dotnet", "run", "--no-launch-profile", "--project", str(ROOT / "TechLearnAcademy.Api"), "--no-restore"], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(60):
            try:
                urllib.request.urlopen(BASE + "/index.html", timeout=2)
                break
            except Exception:
                if api.poll() is not None:
                    raise RuntimeError("API encerrou antes de iniciar")
                time.sleep(1)
        else:
            raise RuntimeError("API não iniciou em 60 segundos")

        admin = login("admin@teste.invalid")
        users = {}
        for role in ("Gestor", "Mentor"):
            user = req("/api/administracao/usuarios", {"nome": role + " Teste", "emailContato": role.lower() + "@teste.invalid", "perfil": role, "senha": PASSWORD, "confirmarSenha": PASSWORD}, admin, 201)
            users[role] = {"id": user["id"], "email": user["email"], "token": login(user["email"])}
        req("/api/usuarios/cadastro", {"nome": "Aluno Teste", "email": "aluno@teste.invalid", "senha": PASSWORD, "confirmarSenha": PASSWORD}, status=201)
        aluno = login("aluno@teste.invalid")

        for role in ("Gestor", "Mentor"):
            actor = users[role]
            ticket = req("/api/chamados", {"assunto": "Pedido de teste", "texto": "Solicitação fictícia"}, actor["token"], 201)["id"]
            own = req(f"/api/chamados/{ticket}", token=actor["token"])
            check(not own["podeAtender"] and not own["podeResponder"] and not own["podeEncerrar"], f"{role}: próprio chamado permite apenas acompanhar")
            req(f"/api/chamados/{ticket}/assumir", {}, actor["token"], 409)
            req(f"/api/chamados/{ticket}/mensagens", {"texto": "Resposta indevida"}, actor["token"], 403)
            receiver = admin if role == "Gestor" else users["Gestor"]["token"]
            req(f"/api/chamados/{ticket}/assumir", {}, receiver)
            again = req(f"/api/chamados/{ticket}", token=actor["token"])
            check(not again["podeResponder"], f"{role}: continua sem responder após atendimento")
            req(f"/api/chamados/{ticket}/mensagens", {"texto": "Resposta indevida"}, actor["token"], 403)
            req(f"/api/chamados/{ticket}/mensagens", {"texto": "Resposta do responsável"}, receiver)

        req("/api/usuarios/recuperar-senha", {"email": "aluno@teste.invalid"})
        check(len(mailbox) == 1, "SMTP local recebeu e-mail de recuperação")
        token = re.search(r"token=([A-F0-9]+)", mailbox[-1].get_content()).group(1)
        req("/api/usuarios/redefinir-senha", {"token": token, "senha": "Nova123!", "confirmarSenha": "Nova123!"})
        req("/api/usuarios/redefinir-senha", {"token": token, "senha": PASSWORD, "confirmarSenha": PASSWORD}, status=400)
        check(True, "Token usado duas vezes foi recusado")
        req("/api/usuarios/perfil", token=aluno, status=401)
        login("aluno@teste.invalid", "Nova123!")
        req("/api/usuarios/recuperar-senha", {"email": "aluno@teste.invalid"})
        check(len(mailbox) == 2, "Novo e-mail de recuperação enviado")
        expired = re.search(r"token=([A-F0-9]+)", mailbox[-1].get_content()).group(1)
        sql(f"USE {DB}; UPDATE RecuperacoesSenha SET DataCriacao=DATEADD(MINUTE,-40,SYSUTCDATETIME()),Validade=DATEADD(MINUTE,-10,SYSUTCDATETIME()) WHERE UsuarioId=(SELECT Id FROM Usuarios WHERE Email='aluno@teste.invalid') AND Utilizado=0")
        req("/api/usuarios/redefinir-senha", {"token": expired, "senha": PASSWORD, "confirmarSenha": PASSWORD}, status=400)
        check(True, "Token vencido foi recusado")
        count = len(mailbox)
        req("/api/usuarios/recuperar-senha", {"email": "admin@teste.invalid"})
        check(len(mailbox) == count, "Administrador não recebe recuperação pelo site")
        print(f"Concluído: {len(checks)} verificações locais passaram.")
    finally:
        api.terminate()
        try:
            api.wait(timeout=10)
        except subprocess.TimeoutExpired:
            api.kill()
        smtp.shutdown()
        smtp.server_close()


if __name__ == "__main__":
    main()
