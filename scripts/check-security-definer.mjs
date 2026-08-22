#!/usr/bin/env node
/**
 * CI guard for the security finding
 * `SUPA_authenticated_security_definer_function_executable`.
 *
 * Fails the build when a SECURITY DEFINER function in the API-exposed `public`
 * schema is executable by signed-in users (roles `authenticated` or `public`).
 *
 * Two complementary checks:
 *  1. Static analysis of `supabase/migrations` (always runs, no credentials).
 *  2. Live database check via `psql` when SUPABASE_DB_URL is provided.
 *
 * Usage: node scripts/check-security-definer.mjs
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const MIGRATIONS_DIR = 'supabase/migrations';
const EXPOSED_ROLES = ['authenticated', 'public'];
const FINDING_ID = 'SUPA_authenticated_security_definer_function_executable';

/** Functions intentionally allowed to stay SECURITY DEFINER + client-callable. */
const ALLOWLIST = new Set([]);

/**
 * Extracts the SQL text of every `CREATE FUNCTION public.<name>` block.
 * @param {string} sql
 * @returns {Array<{ name: string, body: string }>}
 */
const extractFunctionBlocks = (sql) => {
    const pattern = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)\s*\(/gi;
    const blocks = [];
    let match;

    while ((match = pattern.exec(sql)) !== null) {
        const rest = sql.slice(match.index);
        const terminator = rest.search(/\$(?:function)?\$\s*;/i);
        const body = terminator === -1 ? rest : rest.slice(0, terminator);
        blocks.push({ name: match[1].toLowerCase(), body });
    }

    return blocks;
};

/**
 * Replays every migration to derive the final state of public functions.
 * @returns {Map<string, { securityDefiner: boolean, exposed: boolean }>}
 */
const buildFunctionState = () => {
    const state = new Map();

    if (!existsSync(MIGRATIONS_DIR)) {
        return state;
    }

    const files = readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort();

    for (const file of files) {
        const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');

        for (const { name, body } of extractFunctionBlocks(sql)) {
            state.set(name, {
                securityDefiner: /SECURITY\s+DEFINER/i.test(body),
                // Postgres grants EXECUTE to PUBLIC by default on creation.
                exposed: true,
            });
        }

        const revokes = /REVOKE\s+(?:ALL|EXECUTE)[^;]*?ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*?FROM\s+([^;]+);/gi;
        for (const [, name, roles] of sql.matchAll(revokes)) {
            const entry = state.get(name.toLowerCase());
            if (entry && EXPOSED_ROLES.some((role) => roles.toLowerCase().includes(role))) {
                entry.exposed = false;
            }
        }

        const grants = /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*?TO\s+([^;]+);/gi;
        for (const [, name, roles] of sql.matchAll(grants)) {
            const entry = state.get(name.toLowerCase());
            if (entry && EXPOSED_ROLES.some((role) => roles.toLowerCase().includes(role))) {
                entry.exposed = true;
            }
        }

        const drops = /DROP\s+FUNCTION\s+(?:IF\s+EXISTS\s+)?public\.([a-z0-9_]+)/gi;
        for (const [, name] of sql.matchAll(drops)) {
            state.delete(name.toLowerCase());
        }
    }

    return state;
};

/** @returns {string[]} offending function names found by static analysis. */
const runStaticCheck = () => {
    const state = buildFunctionState();

    return [...state.entries()]
        .filter(([name, entry]) => entry.securityDefiner && entry.exposed && !ALLOWLIST.has(name))
        .map(([name]) => name);
};

/** @returns {string[] | null} offending functions from the live DB, or null when skipped. */
const runDatabaseCheck = () => {
    const connectionString = process.env.SUPABASE_DB_URL;

    if (!connectionString) {
        return null;
    }

    const query = `
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.prosecdef
          AND (
            has_function_privilege('authenticated', p.oid, 'EXECUTE')
            OR has_function_privilege('public', p.oid, 'EXECUTE')
          )
        ORDER BY p.proname;
    `;

    try {
        const output = execFileSync('psql', [connectionString, '-tAc', query], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        return output
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && !ALLOWLIST.has(line));
    } catch (error) {
        console.error(`⚠️ Live database check skipped: ${error.message}`);
        return null;
    }
};

const main = () => {
    const staticOffenders = runStaticCheck();
    const databaseOffenders = runDatabaseCheck();
    const offenders = [...new Set([...staticOffenders, ...(databaseOffenders ?? [])])];

    console.log(`🔐 Security check: ${FINDING_ID}`);
    console.log(`   Migrations analysed: ${existsSync(MIGRATIONS_DIR) ? 'yes' : 'no'}`);
    console.log(`   Live database check: ${databaseOffenders === null ? 'skipped' : 'ran'}`);

    if (offenders.length > 0) {
        console.error('\n❌ SECURITY DEFINER functions in the public schema are executable by signed-in users:');
        offenders.forEach((name) => console.error(`   - public.${name}()`));
        console.error(
            '\nFix by revoking EXECUTE from PUBLIC/anon/authenticated, switching to SECURITY INVOKER,\n' +
            'or moving the function into a non-exposed schema (e.g. private).',
        );
        process.exit(1);
    }

    console.log('✅ No exposed SECURITY DEFINER functions found.');
};

main();
