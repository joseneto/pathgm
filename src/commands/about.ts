import { escapeMarkdown } from '../utils/escapeMarkdown';
import { getUserLang } from '../helpers/getUserLang';

export async function aboutCommand(ctx: any) {
  const lang = getUserLang(ctx);

  const textPt = `
🧙‍♂️ *PathGM* – Seu companheiro arcano para campanhas épicas de Pathfinder 2e Remaster!

🎲 **O que posso conjurar para você:**
• 🎭 NPCs com personalidades ricas e segredos sombrios
• 🎯 Tramas envolventes que prendem seus jogadores
• ⚔️ Encontros balanceados e desafiadores
• 🏛️ Locais detalhados, de tavernas a masmorras antigas
• 📦 Itens mágicos únicos com poderes especiais
• 🗺️ Regiões inteiras com culturas e conflitos
• 🎭 Eventos dinâmicos que escalam para aventuras épicas
• 🎙️ Narração épica com múltiplas vozes e áudio imersivo
• 🧙‍♂️ Sistema completo de gerenciamento de jogadores
• 📝 Organização de notas e dados da campanha

✨ **Powered by AI** – Cada criação é única e contextualizada com sua campanha existente!

🌐 Website: pathgm\.app
📧 Suporte: contact@pathgm\.app
`;

  const textEn = `
🧙‍♂️ *PathGM* – Your arcane companion for epic Pathfinder 2e Remaster campaigns!

🎲 **What I can conjure for you:**
• 🎭 NPCs with rich personalities and dark secrets
• 🎯 Engaging plots that captivate your players
• ⚔️ Balanced and challenging encounters
• 🏛️ Detailed locations, from taverns to ancient dungeons
• 📦 Unique magical items with special powers
• 🗺️ Entire regions with cultures and conflicts
• 🎭 Dynamic events that escalate into epic adventures
• 🎙️ Epic narration with multiple voices and immersive audio
• 🧙‍♂️ Complete player management system
• 📝 Campaign notes and data organization

✨ **Powered by AI** – Every creation is unique and contextualized with your existing campaign!

🌐 Website: pathgm\.app
📧 Support: contact@pathgm\.app
`;

  await ctx.replyWithMarkdownV2(escapeMarkdown(lang === 'pt' ? textPt : textEn));
}
