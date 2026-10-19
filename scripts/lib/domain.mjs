import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { REPO_ROOT, dataDir } from './db.mjs';
import { parseCsv } from './csv.mjs';
export const archiveTables=['workspace','cabinets','retention_classes','records','versions','reviews','holds','tasks','controls','events'];
export const readCommands=['help','cabinets','classes','records','show','search','versions','review-queue','retention-due','holds','tasks','attention','compliance','insights','history','duplicates','integrity'];
export const writeCommands=['init','add-cabinet','add','edit','attach','review','propose-disposal','hold','release-hold','add-task','complete-task','log-control','archive','import'];
export function text(v,label='value'){if(typeof v!=='string'||!v.trim())throw Error(`${label} is required`);if(v.length>4000)throw Error(`${label} exceeds 4000 characters`);return v.trim();}
export function date(v,label='date',optional=false){if(optional&&(v===undefined||v===''))return null;v=text(v,label);if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`${label} must be a real YYYY-MM-DD date`);return v;}
function bool(v){if(v===undefined||v===null||v==='')return null;if(['true','yes','1'].includes(String(v).toLowerCase()))return true;if(['false','no','0',''].includes(String(v??'').toLowerCase()))return false;throw Error('personal must be yes or no');}
export function fileRoot(){return path.resolve(process.env.FILES_DIR||path.join(dataDir(),'..','originals'));}
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
async function event(db,id,action,actor,detail){await db.query('insert into events(record_id,action,actor,detail) values($1,$2,$3,$4)',[id,action,actor,JSON.stringify(detail)]);}
export async function find(db,table,q){
 if(!['records','cabinets','retention_classes','holds','tasks'].includes(table))throw Error('Unknown record type');q=text(q,'record identifier');
 let rows=await db.query(`select * from ${table} where id::text=$1 or lower(name)=lower($1) order by id`,[q]);
 if(!rows.length)rows=await db.query(`select * from ${table} where starts_with(id::text,lower($1)) or position(lower($1) in lower(name))>0 order by name,id`,[q]);
 if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No matching'} ${table}: ${q}${rows.length?'\n'+rows.map(r=>r.id+'  '+r.name).join('\n'):''}`);
 return rows[0];
}
export async function attach(db,recordId,file,actor,evidence){
 const stat=fs.statSync(file);if(!stat.isFile()||stat.size>50*1024*1024)throw Error('Original must be a file no larger than 50 MB');
 const bytes=fs.readFileSync(file),digest=hash(bytes);const root=fileRoot();fs.mkdirSync(root,{recursive:true,mode:0o700});
 const dest=path.join(root,digest);
 if(fs.existsSync(dest)){if(hash(fs.readFileSync(dest))!==digest)throw Error('Stored original checksum mismatch');}
 else fs.writeFileSync(dest,bytes,{flag:'wx',mode:0o600});
 const last=(await db.query('select * from versions where record_id=$1 order by version desc limit 1',[recordId]))[0];
 if(last?.sha256===digest)return {skipped:true,version:last.version};
 const row=(await db.query('insert into versions(record_id,version,sha256,bytes,original_name,actor,evidence) values($1,$2,$3,$4,$5,$6,$7) returning *',[recordId,(last?.version||0)+1,digest,bytes.length,path.basename(file),actor,evidence]))[0];
 await event(db,recordId,'attach',actor,{version:row.version,sha256:digest});return row;
}
export async function integrity(db){const out=[];for(const v of await db.query('select v.*,r.name from versions v join records r on r.id=v.record_id order by r.name,v.version')){let result='missing';try{result=hash(fs.readFileSync(path.join(fileRoot(),v.sha256)))===v.sha256?'ok':'changed';}catch(e){if(e.code!=='ENOENT')throw e;}out.push({record_id:v.record_id,record:v.name,version:v.version,result,sha256:v.sha256});}return out;}
const rules={
 'NZ-TAX-7':{source:'https://www.ird.govt.nz/records',basis:'NZ tax records: seven tax years; owner supplies period end and reviews exceptions'},
 'NZ-PRIVACY-9':{source:'https://www.privacy.org.nz/privacy-principles/9/',basis:'Review continued lawful purpose for personal information; no automatic deletion'},
 'NZ-PRIVACY-5':{source:'https://www.privacy.org.nz/privacy-principles/5/',basis:'Evidence of storage safeguards; a log is not verification'},
 'LOCAL':{source:'docs/local-policy.md',basis:'Local operating control, not a statutory deadline'}
};
export async function compliance(db){
 const rows=[];const add=(record,rule,finding)=>rows.push({record,rule,finding,...rules[rule]});
 for(const r of await db.query('select * from record_register order by name')){
 if(r.record_class==='unclassified')add(r.name,'LOCAL','Choose a retention class');
 if(r.years>0&&(!r.period_end||!r.retain_until||r.retain_until<r.statutory_floor))add(r.name,'NZ-TAX-7','Missing period end or stated retention date shorter than the seven-year floor');
 if(r.personal===null)add(r.name,'LOCAL','Classify whether the record contains personal information');
 if(r.personal&&(!r.review_current||!r.next_review||r.next_review<=today()))add(r.name,'NZ-PRIVACY-9','Personal-information purpose review due');
 if(!r.retain_until)add(r.name,'LOCAL','Retention end not recorded');
 if(r.active_holds>0)add(r.name,'LOCAL','Active hold blocks disposal proposal');
 if(!r.current_version)add(r.name,'LOCAL','Original absent from owned archive');
 }
 for(const name of ['access-review','restore-test','storage-location']){const c=(await db.query('select * from controls where name=$1 order by created_at desc,id desc limit 1',[name]))[0];if(!c||c.next_review<=today())add(name,name==='storage-location'?'NZ-TAX-7':'NZ-PRIVACY-5','Control evidence missing or due for review');}
 return rows;
}
function today(){return new Date().toISOString().slice(0,10);}
export const questions=[
 'Which originals are missing from the owned archive?',
 'Which expired records remain under a hold?',
 'Which personal records need a purpose review?',
 'Which owners have overdue follow-up tasks?',
 'Which tax records have a retention date below the required floor?',
 'Which cabinets contain unclassified records?',
 'Which current versions have not been reviewed?',
 'Which records contain identical original files?',
 'Which records qualify for a disposal review with no hold?',
 'Which archived records still carry preservation holds?'
];
export async function insights(db){const sql=[
 'select name,cabinet,owner from record_register where current_version=0',
 'select name,owner,retention_end,active_holds from record_register where retention_end<current_date and active_holds>0',
 'select name,owner,next_review from record_register where personal and (not coalesce(review_current,false) or coalesce(next_review,current_date)<=current_date)',
 'select owner,count(*) as overdue from tasks where completed_at is null and due<current_date group by owner order by owner',
 'select name,retain_until,statutory_floor from record_register where years>0 and (period_end is null or retain_until is null or retain_until<statutory_floor)',
 "select cabinet,count(*) as unclassified from record_register where record_class='unclassified' group by cabinet order by cabinet",
 'select name,current_version,owner from record_register where current_version>0 and not coalesce(review_current,false)',
 'select sha256,count(distinct record_id) as records from versions group by sha256 having count(distinct record_id)>1',
 "select name,owner,retention_end from record_register where retention_end<current_date and active_holds=0 and current_version>0 and record_class<>'unclassified' and (years=0 or period_end is not null)",
 "select name,active_holds from record_register where status='archived' and active_holds>0"
 ];const results=[];for(const [i,question]of questions.entries())results.push({question,rows:await db.query(sql[i])});return results;
}
async function importIndex(db,file,opt,actor){
 const cabinet=await find(db,'cabinets',opt.cabinet);const map=JSON.parse(fs.readFileSync(text(opt.map,'--map'),'utf8'));
 if(!map.fields||typeof map.fields!=='object')throw Error('Mapping requires fields');
 const rows=parseCsv(fs.readFileSync(text(file,'CSV file'),'utf8'));if(!rows.length)throw Error('No data rows found');
 const need=['cabinet','source_id','name','document_date'];
 for(const key of need)if(!map.fields[key])throw Error(`Missing mapping: ${key}`);
 for(const col of Object.values(map.fields))if(!Object.hasOwn(rows[0],col))throw Error(`Missing CSV column: ${col}`);
 const classes=await db.query('select * from retention_classes');let added=0,skipped=0;const ignored=Object.keys(rows[0]).filter(h=>!Object.values(map.fields).includes(h));
 for(const [index,row]of rows.entries()){
 const v=Object.fromEntries(Object.entries(map.fields).map(([k,col])=>[k,row[col]?.trim()||'']));
 if(v.cabinet!==cabinet.source_name)throw Error(`CSV row ${index+2}: source cabinet does not match ${cabinet.source_name}`);
 const recordClass=map.classes?.[v.record_class]||'unclassified';const cl=classes.find(c=>c.name===recordClass);if(!cl)throw Error(`Unknown mapped class ${recordClass}`);
 const values={name:text(v.name,'title'),document_date:date(v.document_date),period_end:date(v.period_end,'period end',true),retain_until:date(v.retain_until,'retention date',true),review_due:date(v.review_due,'review date',true),owner:v.owner||'Unassigned',personal:bool(v.personal),external_ref:v.external_ref||'',class_id:cl.id};
 const sourceId=text(v.source_id,'source id'),digest=hash(JSON.stringify(values));
 const old=(await db.query('select * from records where cabinet_id=$1 and source_id=$2',[cabinet.id,sourceId]))[0];
 if(old){if(old.source_hash!==digest)throw Error(`CSV row ${index+2}: conflicting source ID ${sourceId}; no records changed`);skipped++;continue;}
 const keys=Object.keys(values),params=[cabinet.id,sourceId,digest,...Object.values(values)];
 const r=(await db.query(`insert into records(cabinet_id,source_id,source_hash,${keys.join(',')}) values(${params.map((_,i)=>'$'+(i+1)).join(',')}) returning id`,params))[0];
 await event(db,r.id,'import',actor,{source:'docuware',source_id:sourceId,cabinet:cabinet.name});added++;
 }
 return {added,skipped,ignored_columns:ignored,originals_imported:0,dry_run:!!opt['dry-run']};
}
export async function run(db,command,args=[],opt={}){
 if(opt['dry-run']&&command!=='import')throw Error('--dry-run is supported only for import');
 const write=writeCommands.includes(command);if(!write&&!readCommands.includes(command)&&!['export','draft-review','draft-handover','weekly-review'].includes(command))throw Error('Unknown command; run help');
 const actor=write?text(opt.actor,'--actor'):null;
 await db.exec('BEGIN');
 try{
 if(write&&command!=='init'){if(!(await db.query('select * from workspace where id=1 for update')).length)throw Error('Initialise a workspace first');}
 const out=await execute(db,command,args,opt,actor);
 await db.exec(opt['dry-run']?'ROLLBACK':'COMMIT');return out;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
async function execute(db,command,args,opt,actor){
 const [q,second]=args;
 if(command==='help')return {reads:readCommands,writes:writeCommands,files:['export','draft-review','draft-handover','weekly-review'],usage:'node scripts/records.mjs <command> [record] --actor="Name" --json. See docs/cli.md.'};
 if(command==='init'){
 if((await db.query('select * from workspace')).length)throw Error('Workspace already initialised');
 await db.query('insert into workspace(id,name) values(1,$1)',[text(q,'business name')]);
 await db.exec(`insert into retention_classes(name,years,basis,source) values ('unclassified',0,'Owner must classify and set a retention date','Local policy'),('nz-tax',7,'Seven tax years after supplied tax-period end; review exceptions','https://www.ird.govt.nz/records'),('business-general',0,'Owner sets date from lawful purpose','https://www.privacy.org.nz/privacy-principles/9/')`);
 await event(db,null,'init',actor,{business:q});return {business:q};
 }
 if(command==='add-cabinet'){const r=(await db.query('insert into cabinets(name,source_name) values($1,$2) returning *',[text(q,'cabinet name'),text(opt.source,'--source')]))[0];await event(db,null,command,actor,{id:r.id,name:r.name});return r;}
 if(command==='cabinets')return db.query('select * from cabinets order by name');
 if(command==='classes')return db.query('select * from retention_classes order by name');
 if(command==='records')return db.query('select id,name,cabinet,record_class,owner,status,current_version,active_holds from record_register order by name');
 if(command==='search')return db.query('select id,name,cabinet,external_ref,owner from record_register where position(lower($1) in lower(name||\' \'||external_ref||\' \'||owner))>0 order by name',[text(q,'search text')]);
 if(command==='review-queue')return db.query('select name,cabinet,owner,current_version,reason from review_queue order by name');
 if(command==='retention-due')return db.query("select name,owner,retention_end,active_holds,decision from retention_queue where decision<>'Retain' order by name");
 if(command==='attention')return db.query('select name,owner,kind,reason from attention_queue order by kind,name');
 if(command==='holds')return db.query('select h.id,h.name,r.name record,h.reason,h.imposed_by,h.released_at from holds h join records r on r.id=h.record_id order by h.created_at,h.id');
 if(command==='tasks')return db.query('select t.id,t.name,r.name record,t.owner,t.due,t.completed_at from tasks t join records r on r.id=t.record_id order by t.due,t.id');
 if(command==='compliance')return compliance(db);
 if(command==='insights')return insights(db);
 if(command==='integrity')return integrity(db);
 if(command==='duplicates')return db.query('select sha256,count(distinct record_id) as records from versions group by sha256 having count(distinct record_id)>1');
 if(command==='export'){const out={format:'business-records-v1',exported_at:new Date().toISOString(),originals:'Not embedded. Back up FILES_DIR separately.',data:{}};for(const t of archiveTables)out.data[t]=await db.query(`select * from ${t} order by id`);return out;}
 if(command==='import'){if(q!=='docuware')throw Error('Supported importer: docuware');return importIndex(db,second,opt,actor);}
 if(command==='log-control'){if(!['access-review','restore-test','storage-location'].includes(q))throw Error('Unknown control');const due=date(opt.next,'--next');if(due<=today())throw Error('Next review must be in the future');const r=(await db.query('insert into controls(name,actor,evidence,next_review) values($1,$2,$3,$4) returning *',[q,actor,text(opt.evidence,'--evidence'),due]))[0];await event(db,null,command,actor,{control:r.id});return r;}
 if(command==='release-hold'){const h=await find(db,'holds',q);if(h.released_at)throw Error('Hold already released');const evidence=text(opt.evidence,'--evidence');await db.query('update holds set released_at=now(),released_by=$1,release_evidence=$2 where id=$3',[actor,evidence,h.id]);await event(db,h.record_id,command,actor,{hold:h.id,evidence});return {released:h.id};}
 if(command==='complete-task'){const t=await find(db,'tasks',q);if(t.completed_at)throw Error('Task already completed');const evidence=text(opt.evidence,'--evidence');await db.query('update tasks set completed_at=now(),evidence=$1 where id=$2',[evidence,t.id]);await event(db,t.record_id,command,actor,{task:t.id,evidence});return {completed:t.id};}
 if(command==='add'){
 const cabinet=await find(db,'cabinets',opt.cabinet),cl=await find(db,'retention_classes',opt.class||'unclassified');
 const r=(await db.query('insert into records(cabinet_id,name,class_id,document_date,period_end,retain_until,review_due,owner,personal,external_ref) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning *',[cabinet.id,text(q,'title'),cl.id,date(opt.date,'--date'),date(opt.period,'--period',true),date(opt.retain,'--retain',true),date(opt.review,'--review',true),opt.owner||'Unassigned',bool(opt.personal),opt.reference||'']))[0];await event(db,r.id,command,actor,{name:r.name});return r;
 }
 if(['weekly-review','draft-review'].includes(command))return {attention:await execute(db,'attention',[],{},null),retention:await execute(db,'retention-due',[],{},null),compliance:await compliance(db)};
 const record=await find(db,'records',q);const rr=(await db.query('select * from record_register where id=$1',[record.id]))[0];
 if(command==='show'||command==='draft-handover')return {record:rr,versions:await db.query('select * from versions where record_id=$1 order by version',[record.id]),holds:await db.query('select * from holds where record_id=$1 order by created_at',[record.id]),tasks:await db.query('select * from tasks where record_id=$1 order by due',[record.id]),history:await db.query('select action,actor,detail,created_at from events where record_id=$1 order by created_at,id',[record.id])};
 if(command==='history')return db.query('select action,actor,detail,created_at from events where record_id=$1 order by created_at,id',[record.id]);
 if(command==='versions')return db.query('select version,sha256,bytes,original_name,actor,created_at from versions where record_id=$1 order by version',[record.id]);
 if(command==='attach'){if(record.status!=='active')throw Error('Archived records cannot receive a new version');return attach(db,record.id,text(second,'original file'),actor,text(opt.evidence,'--evidence'));}
 if(command==='hold'){const h=(await db.query('insert into holds(record_id,name,reason,imposed_by) values($1,$2,$3,$4) returning *',[record.id,text(opt.name,'--name'),text(opt.reason,'--reason'),actor]))[0];await event(db,record.id,command,actor,{hold:h.id,reason:h.reason});return h;}
 if(command==='add-task'){const t=(await db.query('insert into tasks(record_id,name,owner,due) values($1,$2,$3,$4) returning *',[record.id,text(opt.name,'--name'),text(opt.owner,'--owner'),date(opt.due,'--due')]))[0];await event(db,record.id,command,actor,{task:t.id});return t;}
 if(command==='edit'){
 const fields={name:'name',owner:'owner',reference:'external_ref',retain:'retain_until',review:'review_due',period:'period_end',personal:'personal',class:'class_id'};const values=[],sets=[];
 for(const [flag,column]of Object.entries(fields)){if(opt[flag]===undefined)continue;let value=opt[flag];if(['retain','review','period'].includes(flag))value=date(value,flag);else if(flag==='personal')value=bool(value);else if(flag==='class')value=(await find(db,'retention_classes',value)).id;else value=text(value,flag);values.push(value);sets.push(column+'=$'+values.length);}
 if(!sets.length)throw Error('No edit fields provided');values.push(record.id);await db.query(`update records set ${sets.join(',')},revision=revision+1 where id=$${values.length}`,values);await event(db,record.id,command,actor,{before:record,changed:sets.map(s=>s.split('=')[0])});return {updated:record.id,review_invalidated:true};
 }
 if(['review','propose-disposal'].includes(command)){
 const next=date(opt.next,'--next');if(next<=today())throw Error('Next review must be in the future');
 if(!rr.current_version||rr.record_class==='unclassified'||!rr.retention_end||(rr.years>0&&!rr.period_end))throw Error('Attach an original, classify the record and set its retention basis before review');
 if(rr.statutory_floor&&(!rr.retain_until||rr.retain_until<rr.statutory_floor))throw Error('Retention date is below the tax floor');
 if(command==='propose-disposal'&&(rr.active_holds>0||rr.retention_end>=today()))throw Error('Active hold or unexpired retention blocks disposal proposal');
 const checks=await integrity(db);if(checks.some(c=>c.record_id===record.id&&c.result!=='ok'))throw Error('Original integrity check failed');
 const evidence=text(opt.evidence,'--evidence');const r=(await db.query('insert into reviews(record_id,revision,version,outcome,next_review,actor,evidence) values($1,$2,$3,$4,$5,$6,$7) returning *',[record.id,rr.revision,rr.current_version,command==='review'?'keep':'dispose-proposed',next,actor,evidence]))[0];
 await event(db,record.id,command,actor,{review:r.id,evidence});return {...r,deleted:false};
 }
 if(command==='archive'){await db.query("update records set status='archived',revision=revision+1 where id=$1",[record.id]);await event(db,record.id,command,actor,{evidence:text(opt.evidence,'--evidence')});return {archived:record.id,originals_retained:true};}
 throw Error('Unsupported command');
}
