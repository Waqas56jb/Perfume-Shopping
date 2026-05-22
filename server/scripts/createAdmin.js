#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────
 *  Create the first admin user with a bcrypt-hashed password.
 *
 *  Interactive mode:
 *    node scripts/createAdmin.js
 *
 *  Non-interactive (CI / scripted):
 *    node scripts/createAdmin.js admin@eleganza-parfums.com "MyP@ssw0rd!" "Yassine Lahjab" owner
 *
 *  Roles:  owner | admin | editor
 * ───────────────────────────────────────────────────────────────────────── */

import 'dotenv/config';
import readline from 'node:readline';
import { findAdminByEmail, createAdminUser } from '../repositories/adminRepo.js';

function ask(rl, q, opts = {}) {
  return new Promise((resolve) => {
    if (opts.mask) {
      // Minimal masking — Node TTY hack
      process.stdout.write(q);
      const stdin = process.stdin;
      let value = '';
      stdin.resume();
      stdin.setRawMode(true);
      stdin.setEncoding('utf8');
      const onData = (ch) => {
        if (ch === '') process.exit(1);            // Ctrl-C
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (ch === '' || ch === '') {        // Backspace
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write('\b \b');
          }
          return;
        }
        value += ch;
        process.stdout.write('*');
      };
      stdin.on('data', onData);
    } else {
      rl.question(q, (answer) => resolve(answer.trim()));
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  let email, password, name, role;

  if (args.length >= 3) {
    [email, password, name, role = 'admin'] = args;
  } else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('');
    console.log('👤  Eleganza · Create admin user');
    console.log('────────────────────────────────────');
    email = await ask(rl, 'Email:    ');
    password = await ask(rl, 'Password: ', { mask: true });
    name = await ask(rl, 'Name:     ');
    role = (await ask(rl, 'Role (owner/admin/editor) [admin]: ')) || 'admin';
    rl.close();
  }

  if (!email || !password || !name) {
    console.error('✖ email, password and name are required.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('✖ password must be at least 8 characters.');
    process.exit(1);
  }
  if (!['owner', 'admin', 'editor'].includes(role)) {
    console.error('✖ role must be one of: owner, admin, editor');
    process.exit(1);
  }

  const existing = await findAdminByEmail(email);
  if (existing) {
    console.error(`✖ An admin with email "${email}" already exists.`);
    process.exit(1);
  }

  const user = await createAdminUser({ email, password, name, role });

  console.log('');
  console.log('✓ Admin created:');
  console.log('  id:    ', user.id);
  console.log('  email: ', user.email);
  console.log('  name:  ', user.name);
  console.log('  role:  ', user.role);
  console.log('');
  console.log('You can now sign in at  http://localhost:5174/login');
  console.log('');
}

main().catch((err) => {
  console.error('Unexpected error:', err?.message || err);
  process.exit(1);
});
