import { mkdir, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const sourcePath = resolve(root, "script.js");
const source = await readFile(sourcePath, "utf8");
const bankStart = source.indexOf("let sections = [");
const bankEnd = source.indexOf("\n\nconst DEFAULT_SECTIONS", bankStart);

if (bankStart < 0 || bankEnd < 0) throw new Error("Não foi possível localizar o banco padrão em script.js.");

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(0, bankEnd)}\nglobalThis.__BANDA5_BANK__ = sections;`, context);
const privateBank = JSON.parse(JSON.stringify(context.__BANDA5_BANK__));
const publicBank = JSON.parse(JSON.stringify(privateBank, (key, value) => ["correct", "explanation"].includes(key) ? undefined : value));

const publicSource = `window.BANDA5_PRODUCTION_BUILD = true;\n${source.slice(0, bankStart)}let sections = ${JSON.stringify(publicBank, null, 2)};${source.slice(bankEnd)}`;
const dist = resolve(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await writeFile(resolve(dist, "script.js"), publicSource, "utf8");
for (const file of ["index.html", "styles.css", "backend.js", "supabase-config.js"]) await copyFile(resolve(root, file), resolve(dist, file));

const seedSql = `-- Gerado por npm run build. Execute depois de supabase/schema.sql.\n` +
`do $seed$\n` +
`declare\n` +
`  v_data jsonb := $bank$${JSON.stringify(privateBank)}$bank$::jsonb;\n` +
`  v_revision uuid := gen_random_uuid();\n` +
`  v_updated_at timestamptz := now();\n` +
`begin\n` +
`  insert into private.question_bank_versions (revision, data, published_at, published_by)\n` +
`  values (v_revision, v_data, v_updated_at, null)\n` +
`  on conflict (revision) do update set data = excluded.data, published_at = excluded.published_at, published_by = null;\n` +
`  insert into private.question_banks (id, data, revision, updated_at, updated_by)\n` +
`  values (1, v_data, v_revision, v_updated_at, null)\n` +
`  on conflict (id) do update set data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at, updated_by = null;\n` +
`  insert into public.question_banks (id, data, revision, updated_at, updated_by)\n` +
`  values (1, private.sanitize_question_bank(v_data), v_revision, v_updated_at, null)\n` +
`  on conflict (id) do update set data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at, updated_by = null;\n` +
`end;\n` +
`$seed$;\n`;
await writeFile(resolve(root, "supabase", "seed-default-bank.sql"), seedSql, "utf8");

const objectiveCount = privateBank.flatMap(section => section.dynamicInstrument ? Object.values(section.questionsByInstrument || {}).flat() : section.questions || []).filter(question => ["quiz", "audioQuiz"].includes(question.type)).length;
process.stdout.write(`Build público criado em dist/ com ${objectiveCount} respostas protegidas.\n`);
