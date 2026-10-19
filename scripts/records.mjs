#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { run } from './lib/domain.mjs';
import { table } from './lib/format.mjs';
export function parse(argv){const options={},args=[];for(const a of argv){if(a.startsWith('--')){const eq=a.indexOf('=');const key=a.slice(2,eq<0?undefined:eq);if(Object.hasOwn(options,key))throw Error(`Duplicate option ${key}`);options[key]=eq<0?true:a.slice(eq+1);}else args.push(a);}const allowed=['json','actor','cabinet','source','map','dry-run','name','class','date','period','retain','review','owner','personal','reference','evidence','next','reason','due','out'];for(const key of Object.keys(options))if(!allowed.includes(key))throw Error(`Unknown option --${key}`);return {command:args.shift()||'help',args,options};}
export function format(v){if(Array.isArray(v)){if(!v.length)return '(none)';if(v[0]?.question)return v.map(x=>x.question+'\n'+format(x.rows)).join('\n\n');return table(v,Object.keys(v[0]).map(key=>({key,label:key.replace(/_/g,' '),width:key==='id'?12:90,format:x=>typeof x==='object'?JSON.stringify(x):String(x??'')})));}if(v&&typeof v==='object')return Object.entries(v).map(([k,x])=>typeof x==='object'?k+'\n'+format(x):k+': '+x).join('\n');return String(v);}
export async function main(argv){const {command,args,options}=parse(argv);const db=await getDb();try{const out=await run(db,command,args,options);if(command==='export'||command.startsWith('draft-')||command==='weekly-review'){
 const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,command==='export'?'exports':'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const dest=options.out?path.resolve(options.out):path.join(dir,`${command}-${Date.now()}.${command==='export'?'json':'md'}`);
 fs.writeFileSync(dest,command==='export'?JSON.stringify(out,null,2):'# DRAFT: '+command+'\n\nInternal review only. Nothing sent or deleted.\n\n'+format(out)+'\n',{flag:'wx',mode:0o600});
 console.log(options.json?JSON.stringify({file:dest}):`Written ${dest}`);
 }else console.log(options.json?JSON.stringify(out,null,2):format(out));}finally{await db.close();}}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
