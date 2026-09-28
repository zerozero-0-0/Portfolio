// 本番 KV の AtCoder レートを dev 用のローカル KV にコピーする。
// 事前に `wrangler login` が必要。ユーザー名は .dev.vars の ATCODER_USERNAME から読む
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BINDING = "LANG_STATS";

function readUsername() {
	if (process.env.ATCODER_USERNAME) return process.env.ATCODER_USERNAME;
	try {
		const match = readFileSync(".dev.vars", "utf8").match(
			/^ATCODER_USERNAME=(.+)$/m,
		);
		if (match) return match[1].trim();
	} catch {}
	throw new Error(".dev.vars に ATCODER_USERNAME を設定してください");
}

const wrangler = (args, options = {}) =>
	execFileSync("pnpm", ["exec", "wrangler", ...args], {
		encoding: "utf8",
		...options,
	});

const key = `atcoder-rate:${readUsername()}`;

// --preview false: 本番の namespace (id) を読む
const value = wrangler(
	["kv", "key", "get", key, "--binding", BINDING, "--remote", "--preview", "false"],
	{ stdio: ["ignore", "pipe", "inherit"] },
).trim();

const file = join(mkdtempSync(join(tmpdir(), "atcoder-rate-")), "rate.json");
writeFileSync(file, value);

// dev のローカル KV は preview_id の namespace を使うので --preview を付ける
wrangler(
	["kv", "key", "put", key, "--path", file, "--binding", BINDING, "--local", "--preview"],
	{ stdio: "inherit" },
);
console.log(`synced ${key}: ${value}`);
