import {Store,dbPath} from './store.js';
import {blockedResult} from './contracts.js';
const store=new Store(dbPath);
function tick(){store.purge();const job=store.claim();if(job)store.finish(String(job.id),blockedResult(String(job.id),JSON.parse(String(job.input))));}
tick();const timer=setInterval(tick,1000);for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(timer);store.db.close();process.exit(0);});
