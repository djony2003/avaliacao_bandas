# Banda 5 — Diagnóstico Musical

Aplicação responsiva para aplicar diagnósticos musicais, receber os resultados dos alunos em um banco centralizado e administrar perguntas e áudios em um painel protegido.

## O que esta versão faz

- Cada aluno começa uma avaliação zerada ao abrir o app.
- As perguntas são organizadas por seção e por instrumento.
- O avaliador pode criar, editar, excluir e ordenar perguntas.
- Exercícios podem usar áudio sintetizado ou gravações reais em MP3, WAV, M4A, OGG e formatos compatíveis.
- As gravações publicadas ficam disponíveis para todos os alunos.
- Ao concluir, o aluno envia o resultado diretamente ao banco.
- A nota enviada pelo navegador é recalculada no banco antes de ser salva.
- O painel administrativo lista, busca, exporta, revisa, arquiva e exclui resultados.
- Alterações ainda não publicadas ficam como rascunho neste computador.
- O relatório individual continua disponível em PDF, JSON e CSV.
- Ao abrir os arquivos-fonte localmente, sem banco configurado, o app mantém o modo local anterior. O pacote público de `dist/` permanece bloqueado até receber uma configuração válida.

No pacote de produção, o gabarito não é enviado ao navegador. As respostas corretas ficam no esquema privado do banco, e a pontuação é calculada pela função SQL no momento do envio.

## Configuração do banco online

Esta versão usa Supabase para banco de dados, login administrativo e armazenamento dos áudios.

1. Na pasta do projeto, execute `npm run build`. O comando cria o pacote público em `dist/` e atualiza `supabase/seed-default-bank.sql`.
2. Crie um projeto em [supabase.com](https://supabase.com/).
3. Abra **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e execute.
4. Ainda no SQL Editor, execute `supabase/seed-default-bank.sql` para publicar o banco inicial. Esse arquivo contém o gabarito e não deve ser hospedado junto com o site.
5. Em **Authentication > Users**, crie somente a sua conta administrativa com e-mail e senha.
6. No SQL Editor, autorize essa conta executando:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'SEU_EMAIL';
   ```

7. Em **Project Settings > API**, copie a URL do projeto e a chave pública (`publishable` ou `anon`).
8. Preencha `supabase-config.js`:

   ```js
   window.BANDA5_SUPABASE = {
     url: "https://SEU-PROJETO.supabase.co",
     publishableKey: "SUA_CHAVE_PUBLICA"
   };
   ```

9. Execute `npm run build` novamente, para copiar a configuração ao pacote público.
10. Hospede **somente o conteúdo da pasta `dist/`**. Não publique a raiz do repositório, pois ela contém o banco privado usado para gerar a versão segura.

Nunca coloque a chave `service_role` no projeto ou no navegador. A chave pública é a correta para este app; as regras de segurança de `supabase/schema.sql` garantem que somente a conta registrada em `admins` possa editar perguntas, gerenciar áudios e consultar respostas.

No modo online, a senha do painel passa a ser a senha da conta criada no Supabase. Use uma senha forte; o código local `047232` serve somente enquanto o app estiver em modo local e não deve proteger dados publicados na internet.

## Recuperação de senha

No login administrativo, use **Esqueci a senha**. O Supabase envia um link ao e-mail da conta e o app abre a caixa para cadastrar uma nova senha. Para funcionar no endereço publicado, inclua esse endereço em **Authentication > URL Configuration > Redirect URLs** no painel do Supabase.

## Fluxo dos alunos

1. O aluno abre o mesmo link público da avaliação.
2. Preenche nome, e-mail e todas as etapas.
3. Na última pergunta, clica em **Enviar e ver diagnóstico**. O banco valida todas as respostas, recalcula a pontuação e registra somente um envio por protocolo.
4. Recebe um protocolo curto de confirmação.
5. O resultado aparece em **Editar perguntas > Respostas recebidas** para o administrador.

## Estrutura da avaliação

- Questões gerais, harmonia, escalas e intervalos.
- Percepção musical com exercícios de áudio.
- Divisão de vozes para cordas e teclas.
- Técnica específica para bateria, baixo, violão, guitarra, teclado e vocal.
- Prática em conjunto e plano individual de 90 dias.
- Revisão pedagógica das respostas incorretas com explicações.

A pontuação geral combina 65% das questões objetivas e auditivas com 35% da autoavaliação. O resultado é um instrumento pedagógico e deve ser complementado por observação prática do líder.

## Arquivos principais

- `index.html` — telas do diagnóstico e painel administrativo.
- `styles.css` — layout responsivo.
- `script.js` — perguntas, navegação, editor, pontuação e painel.
- `backend.js` — integração com banco, login e armazenamento.
- `supabase-config.js` — endereço e chave pública do projeto.
- `supabase/schema.sql` — tabelas, regras de acesso e área de áudios.
- `supabase/seed-default-bank.sql` — banco inicial completo e privado, gerado pelo build.
- `tools/build-production.mjs` — separa o gabarito e prepara o site seguro em `dist/`.

## Validação local

Use `npm run check` para verificar a sintaxe JavaScript e `npm run build` para regenerar o pacote de produção. O diretório `dist/` é ignorado pelo Git porque deve sempre ser recriado a partir do código versionado.
