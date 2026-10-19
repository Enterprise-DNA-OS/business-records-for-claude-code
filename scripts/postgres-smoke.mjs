// An explicit disposable TEST_DATABASE_URL is required. Existing schemas are untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { migrate } from './migrate.mjs';
import { seed } from './seed.mjs';
import { run, readCommands } from './lib/domain.mjs';
if(!process.env.TEST_DATABASE_URL)throw Error('Set TEST_DATABASE_URL to a disposable private Postgres database');
process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'records-pg-'));
process.env.FILES_DIR=path.join(tmp,'originals');
const schema='records_test_'+crypto.randomBytes(8).toString('hex');
const db=await getDb();
try{
 assert.equal(db.mode,'postgres');await db.exec(`create schema ${schema}; set search_path to ${schema},public`);
 await migrate(db);assert.equal((await migrate(db)).ran.length,0);await seed(db);await seed(db);
 for(const command of readCommands){let args=[];if(['show','versions','history'].includes(command))args=['Supplier service agreement'];if(command==='search')args=['supplier'];await run(db,command,args);}
 assert.equal((await run(db,'records')).length,5);
 const opt={actor:'Postgres test',next:'2099-01-01',evidence:'Fictional validation'};
 await assert.rejects(()=>run(db,'propose-disposal',['Supplier invoice disputed'],opt),/hold/);
 await assert.rejects(()=>run(db,'review',['Supplier invoice March'],opt),/tax floor/);
 await run(db,'review',['Supplier service agreement'],opt);
 assert.equal((await run(db,'show',['Supplier service agreement'])).record.review_current,true);
 await run(db,'edit',['Supplier service agreement'],{actor:'Test',owner:'New owner'});
 assert.equal((await run(db,'show',['Supplier service agreement'])).record.review_current,false);
 const csv=path.join(REPO_ROOT,'examples/docuware-index.csv'),map=path.join(REPO_ROOT,'examples/column-map.json');
 await run(db,'import',['docuware',csv],{actor:'Test',cabinet:'Operations',map,'dry-run':true});
 assert.equal((await run(db,'records')).length,5);
 assert.equal((await run(db,'import',['docuware',csv],{actor:'Test',cabinet:'Operations',map})).added,2);
 assert.equal((await run(db,'import',['docuware',csv],{actor:'Test',cabinet:'Operations',map})).skipped,2);
 await assert.rejects(()=>db.query('delete from events'),/append-only/);
 assert.equal((await run(db,'integrity')).every(v=>v.result==='ok'),true);
 console.log('Postgres PASS: migrations, repeatable seed, every read, tax floors, holds, review invalidation, imports, history and original checksums');
}finally{try{await db.exec(`set search_path to public; drop schema if exists ${schema} cascade`);}finally{await db.close();fs.rmSync(tmp,{recursive:true,force:true});}}
