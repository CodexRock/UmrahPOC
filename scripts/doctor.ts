import {spawnSync} from 'node:child_process';import {mkdirSync,writeFileSync} from 'node:fs';
const commands=[['--version'],['login','status'],['plugin','list','--json','--available'],['mcp','list']];
// No auth files or process environment contents are read or exported.
const probes=commands.map(args=>{const r=spawnSync('codex',args,{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});return {command:['codex',...args],exitCode:r.status,output:(r.stdout+r.stderr).replace(/Bearer\s+\S+/gi,'Bearer [REDACTED]'),error:r.error?.message};});
mkdirSync('runtime',{recursive:true,mode:0o700});writeFileSync('runtime/doctor.json',JSON.stringify({at:new Date().toISOString(),surface:'managed cloud CLI; not persistent deployment',probes},null,2),{mode:0o600});console.log('Probe evidence saved privately to runtime/doctor.json. Inspect locally before sharing. Exit codes and catalog availability require separate interpretation.');
