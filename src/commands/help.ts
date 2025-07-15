import { getUserLang } from '../helpers/getUserLang';

export async function helpCommand(ctx: any) {
  const lang = getUserLang(ctx);

  const textPt = `
<b>🧙‍♂️ PathGM - Central de Ajuda</b>

📚 <a href="https://github.com/joseneto/pathgm">Clique aqui para abrir a documentação completa</a>

🎯 <b>Comandos Principais:</b>
• <code>/pathgm</code> - Iniciar o bot (alias para /start)
• <code>/menu</code> - Explore todos os recursos disponíveis
• <code>/comando -h</code> - Ajuda específica para qualquer comando

🎲 <b>Rolagem de Dados:</b>
• <code>/d20</code> - Role um d20 simples
• <code>/roll</code> - Role dados para personagens específicos
• <code>/rollall</code> - Role para todos os personagens

🧙‍♂️ <b>Gerenciamento de Personagens:</b>
• <code>/importplayer</code> - Importe do Pathbuilder2e
• <code>/syncplayers</code> - Sincronize fichas atualizadas
• <code>/newplayer</code> - Crie personagens manualmente
• <code>/editplayer</code> - Edite atributos dos personagens
• <code>/listplayers</code> - Liste e filtre personagens

🔓 <b>Projeto Open Source:</b>
PathGM é um bot focado em ferramentas essenciais: rolagem de dados e importação de personagens do Pathbuilder.

✨ <b>Dica:</b> Todo comando tem ajuda detalhada! Use <code>/comando help</code> para aprender mais.
`;

  const textEn = `
<b>🧙‍♂️ PathGM - Help Center</b>

📚 <a href="https://github.com/joseneto/pathgm">Click here to open the complete documentation</a>

🎯 <b>Main Commands:</b>
• <code>/pathgm</code> - Start the bot (alias for /start)
• <code>/menu</code> - Explore all available features
• <code>/command -h</code> - Specific help for any command

🎲 <b>Dice Rolling:</b>
• <code>/d20</code> - Roll a simple d20
• <code>/roll</code> - Roll dice for specific characters
• <code>/rollall</code> - Roll for all characters

🧙‍♂️ <b>Character Management:</b>
• <code>/importplayer</code> - Import from Pathbuilder2e
• <code>/syncplayers</code> - Sync updated character sheets
• <code>/newplayer</code> - Create characters manually
• <code>/editplayer</code> - Edit character attributes
• <code>/listplayers</code> - List and filter characters

🔓 <b>Open Source Project:</b>
PathGM is a bot focused on essential tools: dice rolling and character import from Pathbuilder.

✨ <b>Tip:</b> Every command has detailed help! Use <code>/command help</code> to learn more.
`;

  const text = lang === 'pt' ? textPt : textEn;

  await ctx.reply(text, { parse_mode: 'HTML', disable_web_page_preview: false });
}
