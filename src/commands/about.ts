import { escapeMarkdown } from '../utils/escapeMarkdown';
import { getUserLang } from '../helpers/getUserLang';

export async function aboutCommand(ctx: any) {
  const lang = getUserLang(ctx);

  const textPt = `
🧙‍♂️ *PathGM* – Bot open-source do Telegram para ferramentas essenciais de mesa!

🎲 **Ferramentas principais:**
• 🎯 **Rolagem de dados** para grupos e personagens individuais
• 📥 **Importação de personagens** do Pathbuilder2e
• 🔄 **Sincronização** de fichas atualizadas
• 🛠️ **Edição simples** de atributos dos personagens

🔓 **Projeto Open Source** – Totalmente gratuito!

PathGM é um bot do Telegram open-source focado em ferramentas essenciais para mesa: rolagem de dados e importação de personagens do Pathbuilder.

🌐 GitHub: https://github.com/joseneto/pathgm
📧 Suporte: Abra uma issue no GitHub

📚 Procurando ferramentas de IA para campanhas? Visite mythbind.com
`;

  const textEn = `
🧙‍♂️ *PathGM* – Open-source Telegram bot for essential tabletop tools!

🎲 **Core Tools:**
• 🎯 **Dice rolling** for groups and individual characters
• 📥 **Character import** from Pathbuilder2e
• 🔄 **Synchronization** of updated character sheets
• 🛠️ **Simple editing** of character attributes

🔓 **Open Source Project** – Completely free!

PathGM is an open-source Telegram bot focused on essential tabletop tools: dice rolling and character import from Pathbuilder.

🌐 GitHub: https://github.com/joseneto/pathgm
📧 Support: Open an issue on GitHub

📚 Looking for AI-powered campaign tools? Check out mythbind.com
`;

  await ctx.replyWithMarkdownV2(escapeMarkdown(lang === 'pt' ? textPt : textEn));
}
