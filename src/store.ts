import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export class Store{
 db:DatabaseSync;
 constructor(path:string){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true,mode:0o700});this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY); INSERT OR IGNORE INTO migrations VALUES(1); CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,owner TEXT NOT NULL,key TEXT NOT NULL,input TEXT NOT NULL,state TEXT NOT NULL,created INTEGER NOT NULL,lease INTEGER,attempt INTEGER NOT NULL DEFAULT 0,result TEXT,UNIQUE(owner,key));`);}
 submit(owner:string,key:string,input:unknown){this.db.exec('BEGIN IMMEDIATE');try{const old=this.db.prepare('SELECT * FROM jobs WHERE owner=? AND key=?').get(owner,key);if(old){if(old.input!==JSON.stringify(input))throw Error('Idempotency conflict');this.db.exec('COMMIT');return old;}if(Number(this.db.prepare("SELECT count(*) AS n FROM jobs WHERE state='queued'").get()!.n)>=5)throw Error('Queue full');const id=randomUUID();this.db.prepare("INSERT INTO jobs(id,owner,key,input,state,created) VALUES(?,?,?,?,'queued',?)").run(id,owner,key,JSON.stringify(input),Date.now());this.db.exec('COMMIT');return this.get(id,owner)!;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 get(id:string,owner:string){return this.db.prepare('SELECT * FROM jobs WHERE id=? AND owner=?').get(id,owner);}
 claim(){this.db.exec('BEGIN IMMEDIATE');try{this.db.prepare("UPDATE jobs SET state='failed',result=? WHERE state='running' AND lease<?").run(JSON.stringify({status:'failed',reason:'Worker interrupted; submit a new request. No automatic search replay.'}),Date.now());const active=this.db.prepare("SELECT id FROM jobs WHERE state='running'").get();const job=active?undefined:this.db.prepare("SELECT * FROM jobs WHERE state='queued' ORDER BY created LIMIT 1").get();if(job)this.db.prepare("UPDATE jobs SET state='running',lease=?,attempt=attempt+1 WHERE id=?").run(Date.now()+600000,job.id!);this.db.exec('COMMIT');return job;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 finish(id:string,result:unknown){const status=(result as {status?:unknown})?.status;if(!['succeeded','partial','blocked','failed'].includes(String(status)))throw Error('Invalid terminal result');return this.db.prepare("UPDATE jobs SET state=?,result=?,lease=NULL WHERE id=? AND state='running' AND lease>=?").run(String(status),JSON.stringify(result),id,Date.now());}
 cancel(id:string,owner:string){return this.db.prepare("UPDATE jobs SET state='cancelled',lease=NULL WHERE id=? AND owner=? AND state IN ('queued','running')").run(id,owner);}
 purge(){this.db.prepare("DELETE FROM jobs WHERE created<? AND state NOT IN ('queued','running')").run(Date.now()-86400000);}
}
export const dbPath=process.env.DB_PATH??'runtime/jobs.sqlite';
