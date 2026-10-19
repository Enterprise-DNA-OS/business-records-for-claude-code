import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { attach } from './lib/domain.mjs';
export async function seed(db) {
 const ws=await db.query('select name from workspace');
 if(ws.length&&ws[0].name!=='Kauri Office Demo')throw Error('Demo seed refuses an existing business workspace');
 await db.exec('BEGIN');
 try {
 await db.exec(fs.readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));
 for(const n of [1,2,3,5]) {
 const id='30000000-0000-0000-0000-'+String(n).padStart(12,'0');
 if(!(await db.query('select id from versions where record_id=$1',[id])).length) await attach(db,id,path.join(REPO_ROOT,'examples',`demo-${n}.txt`),'Demo operator','Fictional demo original');
 }
 await db.exec('COMMIT');
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const db=await getDb();try{await seed(db);console.log('Fictional seed ready');}finally{await db.close();}}
