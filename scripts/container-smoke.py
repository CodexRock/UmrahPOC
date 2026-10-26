"""Private Docker smoke test. Requires prebuilt umrah-proof:cloud-test image."""
import datetime, http.cookiejar, json, os, secrets, socket, subprocess, tempfile, time, urllib.request, uuid
from pathlib import Path

env = os.environ.copy()
for name in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH'):
    env.pop(name, None)
def docker(*args):
    return subprocess.check_output(['docker', '--host=unix:///var/run/docker.sock', *args], env=env, text=True).strip()

suffix = uuid.uuid4().hex[:12]
volume, api, worker = ['umrah-smoke-' + suffix + s for s in ('-data', '-api', '-worker')]
with socket.socket() as s:
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
origin = f'http://127.0.0.1:{port}'
password = secrets.token_hex(24)
with tempfile.TemporaryDirectory(prefix='umrah-docker-') as tmp:
    auth = Path(tmp) / 'app.env'
    auth.write_text(f'SITE_PASSWORD={password}\nSESSION_SECRET={secrets.token_hex(32)}\nHOST=0.0.0.0\nAPP_ORIGIN={origin}\nCOOKIE_SECURE=false\n')
    auth.chmod(0o600)
    try:
        docker('volume', 'create', volume)
        common = ['--cap-drop=ALL', '--security-opt=no-new-privileges', '-v', volume + ':/app/runtime']
        docker('run', '-d', '--name', api, '--env-file', str(auth), '-p', f'127.0.0.1:{port}:3000', *common, 'umrah-proof:cloud-test')
        docker('run', '-d', '--name', worker, *common, 'umrah-proof:cloud-test', 'npm', 'run', 'worker')
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        def call(path, data=None, extra=None):
            headers = {'Origin': origin, 'Content-Type': 'application/json', **(extra or {})}
            req = urllib.request.Request(origin + path, data=None if data is None else json.dumps(data).encode(), headers=headers)
            with opener.open(req, timeout=3) as response:
                return json.load(response)
        ready = False
        for _ in range(100):
            try:
                with opener.open(origin, timeout=1) as r:
                    ready = r.status == 200
                if ready: break
            except (OSError, urllib.error.URLError): pass
            time.sleep(.1)
        assert ready, 'Container HTTP startup failed'
        call('/api/login', {'password': password})
        date = lambda days: (datetime.date.today() + datetime.timedelta(days=days)).isoformat()
        request = {'originAirport':'CDG','arrivalAirport':'JED','departureAirport':'JED','outboundDate':date(90),'returnDate':date(98),'cityOrder':['makkah','madinah'],'makkahNights':4,'madinahNights':3,'adults':2,'rooms':1,'displayCurrency':'EUR','locale':'en','preferences':{'checkedBaggagePreferred':True}}
        job = call('/api/jobs', request, {'Idempotency-Key':suffix})
        assert call('/api/jobs', request, {'Idempotency-Key':suffix})['id'] == job['id']
        for _ in range(100):
            result = call('/api/jobs/' + job['id'])
            if result['state'] == 'blocked': break
            time.sleep(.1)
        assert result['state'] == 'blocked'
        assert result['result']['journeys'] == []
        docker('restart', worker)
        assert call('/api/jobs/' + job['id'])['state'] == 'blocked'
        assert docker('inspect', '--format', '{{.Config.User}}', api) == 'node'
        print('PASS: unprivileged Docker API + worker, authenticated submission, idempotency, persisted blocked result, worker restart. No live provider call.')
    except Exception:
        for container in (api, worker):
            subprocess.run(['docker','--host=unix:///var/run/docker.sock','logs','--tail','30',container],env=env)
        raise
    finally:
        for container in (api, worker):
            subprocess.run(['docker','--host=unix:///var/run/docker.sock','rm','-f',container],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        subprocess.run(['docker','--host=unix:///var/run/docker.sock','volume','rm',volume],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
