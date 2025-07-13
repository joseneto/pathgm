export function cleanOpenAIJson(input: string): string {
  let str = input
    // Remove conteúdo antes/depois do JSON (tenta pegar só o bloco { ... })
    .replace(/^.*?({[\s\S]*})[\s\S]*?$/s, '$1')

    // Corrige aspas curvas para aspas normais
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

    // Corrige 'chave': → "chave":
    .replace(/'([\w\d_]+)'\s*:/g, '"$1":')

    // Corrige valores com aspas simples: "chave": 'valor' → "chave": "valor"
    .replace(/:\s*'([^']*)'/g, (_, val) => `: "${val.replace(/"/g, '\\"')}"`)

    // Corrige vírgulas finais inválidas
    .replace(/,\s*([}\]])/g, '$1')

    // Remove duplas aspas seguidas: ""chave"": → "chave"
    .replace(/""([^"]+?)""/g, '"$1"')

    // Remove aspas ao redor de objetos (às vezes o modelo gera string de JSON)
    .replace(/^"(.*)"$/, '$1');

  return str;
}
