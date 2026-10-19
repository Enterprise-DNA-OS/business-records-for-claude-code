import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { migrate } from './migrate.mjs';
import { seed } from './seed.mjs';
import { run } from './lib/domain.mjs';
import { format } from './records.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'business-records-demo-'));
process.env.DATABASE_URL='';process.env.DATA_DIR=path.join(dir,'db');process.env.FILES_DIR=path.join(dir,'originals');process.env.OUTPUT_DIR=dir;
let db;
try{db=await getDb();await migrate(db);await seed(db);
 console.log('Fictional records only. No remote database used.');
 for(const cmd of ['review-queue','retention-due','attention']){console.log('\n'+cmd+'\n'+format(await run(db,cmd)));}
 await db.close();db=null;
 for(const script of ['view','docs']){const r=spawnSync(process.execPath,[`scripts/${script}.mjs`],{cwd:REPO_ROOT,env:process.env,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||r.stdout);console.log(r.stdout.trim());}
 console.log('Demo PASS'+(process.argv.includes('--keep')?` at ${dir}`:''));
}finally{if(db)await db.close();if(!process.argv.includes('--keep'))fs.rmSync(dir,{recursive:true,force:true});}
