/* global module */
// statusConfig.js — Lista FIXA de serviços monitorados.
// As URLs vêm só daqui (nunca de input do usuário), então não há risco de SSRF.
//   sonda:      URL testada por HTTP (qualquer resposta < 500 = no ar)
//   statuspage: página de status oficial (formato Atlassian Statuspage ou incidentes do Google)

const STATUSPAGE = (host) => ({ tipo: 'statuspage', url: `https://${host}/api/v2/summary.json` });
const GOOGLE_WORKSPACE = { tipo: 'google', url: 'https://www.google.com/appsstatus/dashboard/incidents.json' };

const SERVICOS = [
  // --- Comunicação / Meta ---
  { id: 'whatsapp', nome: 'WhatsApp', grupo: 'Comunicação', sonda: 'https://web.whatsapp.com/' },
  { id: 'facebook', nome: 'Facebook', grupo: 'Comunicação', sonda: 'https://www.facebook.com/' },
  { id: 'instagram', nome: 'Instagram', grupo: 'Comunicação', sonda: 'https://www.instagram.com/' },
  { id: 'messenger', nome: 'Messenger', grupo: 'Comunicação', sonda: 'https://www.messenger.com/' },
  { id: 'telegram', nome: 'Telegram', grupo: 'Comunicação', sonda: 'https://web.telegram.org/' },
  { id: 'discord', nome: 'Discord', grupo: 'Comunicação', sonda: 'https://discord.com/', statuspage: STATUSPAGE('discordstatus.com') },

  // --- Vídeo ---
  { id: 'youtube', nome: 'YouTube', grupo: 'Vídeo', sonda: 'https://www.youtube.com/' },
  { id: 'tiktok', nome: 'TikTok', grupo: 'Vídeo', sonda: 'https://www.tiktok.com/' },
  { id: 'netflix', nome: 'Netflix', grupo: 'Vídeo', sonda: 'https://www.netflix.com/' },
  { id: 'twitch', nome: 'Twitch', grupo: 'Vídeo', sonda: 'https://www.twitch.tv/' },
  { id: 'spotify', nome: 'Spotify', grupo: 'Vídeo', sonda: 'https://open.spotify.com/' },

  // --- Google ---
  { id: 'google', nome: 'Google (Busca)', grupo: 'Google', sonda: 'https://www.google.com/' },
  { id: 'gmail', nome: 'Gmail', grupo: 'Google', sonda: 'https://mail.google.com/', statuspage: GOOGLE_WORKSPACE, filtroGoogle: /gmail/i },
  { id: 'google-conta', nome: 'Conta Google', grupo: 'Google', sonda: 'https://accounts.google.com/' },
  { id: 'google-drive', nome: 'Google Drive', grupo: 'Google', sonda: 'https://drive.google.com/', statuspage: GOOGLE_WORKSPACE, filtroGoogle: /drive/i },

  // --- Microsoft ---
  { id: 'ms-login', nome: 'Microsoft Entra / Login', grupo: 'Microsoft', sonda: 'https://login.microsoftonline.com/' },
  { id: 'ms-outlook', nome: 'Outlook', grupo: 'Microsoft', sonda: 'https://outlook.office.com/' },
  { id: 'ms-teams', nome: 'Teams', grupo: 'Microsoft', sonda: 'https://teams.microsoft.com/' },
  { id: 'ms-365', nome: 'Microsoft 365', grupo: 'Microsoft', sonda: 'https://www.office.com/' },

  // --- Outros ---
  { id: 'cloudflare', nome: 'Cloudflare', grupo: 'Outros', sonda: 'https://www.cloudflare.com/', statuspage: STATUSPAGE('www.cloudflarestatus.com') },
  { id: 'github', nome: 'GitHub', grupo: 'Outros', sonda: 'https://github.com/', statuspage: STATUSPAGE('www.githubstatus.com') },
  { id: 'openai', nome: 'OpenAI / ChatGPT', grupo: 'Outros', sonda: 'https://chatgpt.com/', statuspage: STATUSPAGE('status.openai.com') },
];

module.exports = { SERVICOS };
