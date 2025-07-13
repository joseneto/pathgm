import { getUserLang } from '../helpers/getUserLang';

export async function helpCommand(ctx: any) {
  const lang = getUserLang(ctx);

  const textPt = `
<b>🧙‍♂️ PathGM - Central de Ajuda</b>

📚 <a href="https://github.com/joseneto/pathgm">Clique aqui para abrir a documentação completa</a>

🎯 <b>Comandos Essenciais:</b>
• <code>/menu</code> - Explore todos os recursos disponíveis
• <code>/comando -h</code> - Ajuda específica para qualquer comando
• <code>/gennpc</code> - Crie NPCs únicos com IA
• <code>/genplot</code> - Gere tramas envolventes
• <code>/genencounter</code> - Construa encontros balanceados
• <code>/narrate</code> - Transforme texto em narração épica

🏷️ <b>Sistema de Tags - A Chave do Conteúdo Personalizado:</b>
• <b>O que são:</b> Palavras-chave que conectam seu conteúdo
• <b>Como funcionam:</b> Influenciam diretamente os resultados da IA
• <b>Integração:</b> Criam relacionamentos entre NPCs, locais e tramas
• <b>Personalização:</b> Quanto mais específicas, mais únicos os resultados

🎪 <b>Exemplos Práticos de Tags:</b>
• <code>taverna, comerciante, segredo</code> → NPC taverneiro misterioso
• <code>floresta, magia corrompida</code> → Local com temas sombrios
• <code>nobre, conspiração, traição</code> → Trama política complexa

💡 <b>Dica Pro:</b> Use tags que você já criou para conectar novo conteúdo ao seu mundo existente!

🎲 <b>Gerenciamento de Jogadores:</b>
• <code>/newplayer</code> - Adicione personagens manualmente
• <code>/importplayer</code> - Importe do Pathbuilder2e
• <code>/roll</code> - Role dados para personagens específicos
• <code>/rollall</code> - Role para todos os personagens

✨ <b>Dica:</b> Todo comando tem ajuda detalhada! Use <code>/comando help</code> para aprender mais.
`;

  const textEn = `
<b>🧙‍♂️ PathGM - Help Center</b>

📚 <a href="https://github.com/joseneto/pathgm">Click here to open the complete documentation</a>

🎯 <b>Essential Commands:</b>
• <code>/menu</code> - Explore all available features
• <code>/command -h</code> - Specific help for any command
• <code>/gennpc</code> - Create unique NPCs with AI
• <code>/genplot</code> - Generate engaging plots
• <code>/genencounter</code> - Build balanced encounters
• <code>/narrate</code> - Transform text into epic narration

🏷️ <b>Tag System - The Key to Personalized Content:</b>
• <b>What they are:</b> Keywords that connect your content
• <b>How they work:</b> Directly influence AI generation results
• <b>Integration:</b> Create relationships between NPCs, places, and plots
• <b>Customization:</b> More specific tags = more unique results

🎪 <b>Practical Tag Examples:</b>
• <code>tavern, merchant, secret</code> → Mysterious tavern keeper NPC
• <code>forest, corrupted magic</code> → Location with dark themes
• <code>noble, conspiracy, betrayal</code> → Complex political plot

💡 <b>Pro Tip:</b> Use tags you've already created to connect new content to your existing world!

🎲 <b>Player Management:</b>
• <code>/newplayer</code> - Add characters manually
• <code>/importplayer</code> - Import from Pathbuilder2e
• <code>/roll</code> - Roll dice for specific characters
• <code>/rollall</code> - Roll for all characters

✨ <b>Tip:</b> Every command has detailed help! Use <code>/command help</code> to learn more.
`;

  const text = lang === 'pt' ? textPt : textEn;

  await ctx.reply(text, { parse_mode: 'HTML', disable_web_page_preview: false });
}
