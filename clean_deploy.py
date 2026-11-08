import subprocess
import os

token = None
with open('career-productivity/portfolio/.env', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('GITHUB_TOKEN='):
            token = line.split('=', 1)[1].strip()

cwd = os.path.abspath('career-productivity/portfolio')

def run_git(cmd):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=True)
    print(f"[{cmd}] -> {p.returncode}")
    if p.stdout.strip():
        print("OUT:", p.stdout.strip())
    if p.stderr.strip():
        print("ERR:", p.stderr.strip())

run_git('git init')
run_git('git config user.name "Nicolas Grivelet"')
run_git('git config user.email "nicolas.grivelet@edu.devinci.fr"')
run_git('git add .')
run_git('git commit -m "Initial release: personal portfolio and engineering showcase"')
run_git('git branch -M main')
run_git(f'git remote add origin https://{token}@github.com/nicolas-grivelet/portfolio.git')
run_git('git push -u origin main')
