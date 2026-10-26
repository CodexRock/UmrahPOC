import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runProcess} from '../src/process.js';
// Operator configuration only; never accepted from a website request.
const executable=process.env.UMRAH_CODEX_BINARY??'codex';
const cwd=mkdtempSync(join(tmpdir(),'umrah-cli-smoke-'));
try{
 const version=await runProcess(executable,['--version']);
 const r=await runProcess(executable,['exec','--ephemeral','--skip-git-repo-check','--sandbox','read-only','--json','-'],{cwd,stdin:'Reply exactly CLI_OK. Do not call any tools or read files. This is only a bounded CLI connectivity check.',timeoutMs:40000,maxBytes:200000});
 const events=r.stdout.split('\n').flatMap(line=>{try{return [JSON.parse(line)]}catch{return []}});
 const completed=events.some(e=>e.type==='turn.completed');
 const exactMarker=events.some(e=>e.type==='item.completed'&&e.item?.type==='agent_message'&&e.item.text==='CLI_OK');
 const startupReadOnly=/failed to initialize in-process app-server client: Read-only file system/.test(r.stderr);
 const report={observedAt:new Date().toISOString(),surface:'CLI execution smoke, not a supplier search',version:version.stdout.match(/codex-cli [\d.]+/)?.[0]??'unavailable',exitCode:r.code,failure:r.failure??null,completed,exactMarker,status:r.code===0&&completed&&exactMarker?'passed':'blocked',reason:startupReadOnly?'CLI initialization failed: read-only filesystem. No model response was obtained.':/no_biscuit_no_service/.test(r.stdout+r.stderr)?'Runtime request rejected: no_biscuit_no_service.':r.code===0&&completed&&exactMarker?'Minimal non-interactive model call succeeded. Plugin access still requires separate proof.':'No successful minimal model response; inspect supported runtime diagnostics privately.'};
 mkdirSync('runtime',{recursive:true,mode:0o700});writeFileSync('runtime/cli-smoke.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify(report,null,2));if(report.status!=='passed')process.exitCode=2;
}finally{rmSync(cwd,{recursive:true,force:true});}
