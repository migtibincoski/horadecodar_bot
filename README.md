# Hora de Codar Discord Bot

Este é um bot para Discord desenvolvido em Node.js, utilizando a biblioteca `discord.js`. O bot possui várias funcionalidades, incluindo comandos de interação e um servidor web simples.

## Funcionalidades

- **Comandos de Interação**: O bot responde a comandos como `suggestion`, `rules` e `community_role`.
- **Webhook de Debug**: Envia logs de debug para um webhook do Discord.
- **Servidor Web**: Um servidor web simples que responde a requisições GET e POST.

## Configuração

1. Clone o repositório:
   ```bash
   $ git clone https://github.com/seu-usuario/seu-repositorio.git
   $ cd seu-repositorio
   ```

2. Instale as dependências:
   ```bash
   $ npm install
   $ yarn
   ```

3. Crie um arquivo `.env` com as seguintes variáveis:
   ```env
   DISCORD_TOKEN=seu_token_do_discord
   DISCORD_DEBUG_WEBHOOK_URL=sua_url_do_webhook
   DISCORD_COMMUNITY_ROLE_CHAT_ID=id_do_canal_para_roles
   DISCORD_SUGGESTION_CHAT_ID=id_do_canal_para_sugestoes
   IS_DEV_WORKSPACE=true_ou_false
   ```

4. Inicie o bot:
   ```bash
   node index.js
   ```

## Uso

- **Comando `suggestion`**: Abre um modal para enviar sugestões.
- **Comando `rules`**: Exibe as regras da comunidade.
- **Comando `community_role`**: Abre um modal para solicitar um papel na comunidade.

## Contribuição

Sinta-se à vontade para abrir issues e pull requests. Toda contribuição é bem-vinda!

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
