import {randomBytes} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync,existsSync,chmodSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));process.chdir(root);
if(Number(process.versions.node.split('.')[0])<24)throw Error('Install Node.js 24 or newer first.');
mkdirSync('runtime',{recursive:true,mode:0o700});
const access='runtime/desktop-access.json';
if(!existsSync(access))writeFileSync(access,JSON.stringify({password:randomBytes(18).toString('hex'),secret:randomBytes(32).toString('hex')},null,2),{mode:0o600,flag:'wx'});
const credentials=JSON.parse(readFileSync(access,'utf8'));
const port=process.env.PORT??'3000';
const env={...process.env,HOST:'127.0.0.1',PORT:port,APP_ORIGIN:`http://127.0.0.1:${port}`,COOKIE_SECURE:'false',SITE_PASSWORD:credentials.password,SESSION_SECRET:credentials.secret};
console.log('Open http://127.0.0.1:'+port+' in your browser.');
console.log('Your private sign-in password is the password field in '+access+'. Do not share that file.');
console.log('Live searches are blocked; this tests the form, queue and honest failure display.');
const children=['src/worker.ts','src/server.ts'].map(file=>spawn(process.execPath,['--import','tsx',file],{env,stdio:'inherit'}));
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code;}
for(const child of children)child.on('exit',code=>stop(code??0));
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
