import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../dist/script.js", import.meta.url), "utf8");
const files = (await readdir(new URL("../dist/", import.meta.url))).sort();
const expectedFiles = ["backend.js", "index.html", "script.js", "styles.css", "supabase-config.js"];
if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) throw new Error(`Arquivos inesperados no pacote público: ${files.join(", ")}`);
if (!source.startsWith("window.BANDA5_PRODUCTION_BUILD = true;")) throw new Error("O bundle não está marcado como produção.");

const bankStart = source.indexOf("let sections = ");
const bankEnd = source.indexOf("\n\nconst DEFAULT_SECTIONS", bankStart);
if (bankStart < 0 || bankEnd < 0) throw new Error("Banco público não encontrado no bundle.");

const context = {};
vm.createContext(context);
vm.runInContext(`${source.slice(bankStart, bankEnd)}\nglobalThis.__PUBLIC_BANK__ = sections;`, context);
const questions = context.__PUBLIC_BANK__.flatMap(section => section.dynamicInstrument
  ? Object.values(section.questionsByInstrument || {}).flat()
  : section.questions || []);
const leaked = questions.filter(question => Object.hasOwn(question, "correct") || Object.hasOwn(question, "explanation"));

if (leaked.length) throw new Error(`O bundle público expôs o gabarito de ${leaked.length} pergunta(s).`);
if (!questions.length) throw new Error("O bundle público ficou sem perguntas.");

process.stdout.write(`Bundle verificado: ${questions.length} perguntas e nenhum gabarito exposto.\n`);
