# Venom Bot - WhatsApp API

Bot do WhatsApp usando Venom-Bot para envio de mensagens via API REST.

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

O servidor será iniciado na porta 3050.

## Endpoints

### GET /qrcode
Retorna o QR Code em base64 para conectar ao WhatsApp.

### GET /status  
Verifica se o WhatsApp está conectado.

### POST /send-message
Envia mensagem de texto ou mídia.

**Body:**
```json
{
  "to": "5511999999999",
  "message": "Sua mensagem aqui",
  "mediaUrl": "opcional - URL da mídia",
  "mediaType": "opcional - image/document/video"
}
```

## Uso

1. Inicie o servidor: `npm start`
2. Acesse `/qrcode` para obter o QR Code
3. Escaneie o QR Code no WhatsApp Web
4. Use `/send-message` para enviar mensagens