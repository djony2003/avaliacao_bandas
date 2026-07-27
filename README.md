# Banda 5 - Diagnóstico Musical

Site estático e responsivo para aplicar o diagnóstico musical direcionado da Banda 5.

## Estrutura da avaliação
- Base comum: pulso, dinâmica, estrutura, escuta, preparo e atuação em conjunto.
- Conhecimento demonstrado: teoria, ritmo, harmonia, transposição e campo harmônico.
- Percepção: exercícios gerados pelo navegador ou gravações reais carregadas pelo avaliador.
- Módulos específicos: bateria, baixo, violão, guitarra, teclado e vocal.
- Plano individual: dificuldade concreta, disponibilidade e meta de 90 dias.
- Revisão pedagógica: mostra cada questão objetiva incorreta, a resposta esperada e uma orientação de estudo para o líder.

A pontuação geral combina 65% das questões objetivas (incluindo áudio) e 35% das respostas de autoavaliação. O relatório PDF inclui uma página específica com as respostas que precisam ser revisadas. O resultado deve ser complementado por observação prática do líder.

## Como usar
1. Abra `index.html` no navegador.
2. O participante responde pelo celular ou computador.
3. Cada nova aplicação começa sem respostas ou progresso anteriores.
4. Ao final, o participante vê um resumo por áreas e pode baixar o resultado em JSON ou CSV.
5. O botão **Gerar relatório PDF** abre um documento A4; na janela de impressão, escolha **Salvar como PDF**.

## Editor do avaliador

- O botão **Editar perguntas** abre a área protegida por senha.
- É possível criar, editar, excluir e ordenar perguntas.
- Os formatos incluem texto curto, e-mail, número, texto longo, alternativas, escalas e exercícios com áudio.
- Perguntas e configurações ficam no armazenamento local do navegador.
- Gravações ficam no IndexedDB do navegador e não são incluídas no JSON exportado.

## Arquivos
- `index.html` — estrutura do site
- `styles.css` — visual
- `script.js` — perguntas, navegação, pontuação e exportação

## Publicação

O projeto atual é estático. Para receber respostas automaticamente será necessário conectar a interface a uma API e a um banco de dados. Até essa etapa, os participantes podem baixar os resultados em JSON, CSV ou PDF.

## Observação
O resultado é um diagnóstico pedagógico, não uma avaliação de valor pessoal ou espiritual.
