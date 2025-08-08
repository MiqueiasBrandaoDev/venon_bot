const express = require('express');
const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
const port = 3050;

// Variáveis globais
let qrCodeBase64 = '';
let clientInstance = null;

// Rota para obter o QR Code em Base64
app.get('/qrcode', (req, res) => {
    if (qrCodeBase64) {
        return res.json({ qrcode: qrCodeBase64 });
    } else {
        return res.status(404).json({ error: 'QR Code ainda não disponível' });
    }
});

// Rota para verificar o status da conexão
app.get('/status', (req, res) => {
    if (clientInstance) {
        return res.json({ status: 'connected' });
    } else {
        return res.json({ status: 'disconnected' });
    }
});

// Inicia o servidor Express
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    initVenom(); // Inicia o Venom após o servidor estar pronto
});

// Função para iniciar o Venom-Bot
function initVenom() {
    console.log('Iniciando Venom Bot...');

    venom.create(
        'apibotzap', // Nome da sessão
        (base64Qr, asciiQR) => {
            console.log('Executando QR-CODE:');
            console.log(asciiQR); // Mostra QR Code em ASCII no console

            // Armazena o QR Code em Base64 (removendo o prefixo se necessário)
            qrCodeBase64 = base64Qr.includes('base64,')
                ? base64Qr.split('base64,')[1]
                : base64Qr;

            // Opcional: Salvar o QR Code como arquivo
            const qrCodePath = path.join(__dirname, 'qrcode.png');
            const qrCodeData = qrCodeBase64;
            fs.writeFileSync(qrCodePath, qrCodeData, 'base64');
            console.log('QR Code salvo em:', qrCodePath);
        },
        // Status callback - terceiro parâmetro (undefined no seu modelo)
        (statusSession, session) => {
            console.log('Status da sessão:', statusSession);
            // Você pode adicionar lógica adicional aqui baseada no status
        },
        // Opções do navegador - quarto parâmetro
        {
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            // Parâmetros adicionais para resolver problemas comuns
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
            ignoreHTTPSErrors: true
        }
    )
    .then((client) => {
        console.log('Venom Bot iniciado com sucesso!');
        clientInstance = client;

    })
    .catch((error) => {
        console.error('Erro ao iniciar o Venom Bot:', error);
    });
}

// Rota para enviar mensagens
app.post('/send-message', async (req, res) => {
    try {
        if (!clientInstance) {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp não está conectado'
            });
        }

        const { to, message, mediaUrl, mediaType } = req.body;

        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Destinatário e mensagem são obrigatórios'
            });
        }

        // Enviar mensagem de texto simples
        if (!mediaUrl) {
            await clientInstance.sendText(to, message);
            return res.json({ success: true, message: 'Mensagem enviada com sucesso' });
        }

        // Enviar mensagem com mídia
        else {
            switch (mediaType) {
                case 'image':
                    await clientInstance.sendImage(to, mediaUrl, 'image', message);
                    break;
                case 'document':
                    await clientInstance.sendFile(to, mediaUrl, 'document', message);
                    break;
                case 'video':
                    await clientInstance.sendVideoAsGif(to, mediaUrl, 'video', message);
                    break;
                default:
                    await clientInstance.sendText(to, message);
            }
            return res.json({ success: true, message: 'Mensagem com mídia enviada com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro ao enviar mensagem: ' + error.message
        });
    }
});
