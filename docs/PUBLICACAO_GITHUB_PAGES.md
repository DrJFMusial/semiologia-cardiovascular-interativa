# Publicação no GitHub Pages

**Este projeto não foi publicado.** Os passos abaixo só devem ser executados com a aprovação do professor.

## Opção A: publicação automática por GitHub Actions (recomendada)

1. Criar um repositório no GitHub (por exemplo, `semiologia-cardiovascular`). Público, se a aula for aberta aos alunos; o GitHub Pages em repositório privado exige plano pago.
2. Enviar o código-fonte (sem `node_modules`, `dist` e `dist-offline`, já listados no `.gitignore`):
   ```bash
   git init
   git add .
   git commit -m "Semiologia Cardiovascular Interativa 0.2.0"
   git branch -M main
   git remote add origin https://github.com/USUARIO/semiologia-cardiovascular.git
   git push -u origin main
   ```
3. No repositório: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. O fluxo `.github/workflows/deploy.yml` roda a cada envio para `main`: instala, gera o `dist/` e publica. O endereço fica em `https://USUARIO.github.io/semiologia-cardiovascular/`.

## Opção B: publicação manual do `dist/`

1. `npm run build`.
2. Enviar o conteúdo de `dist/` para a raiz de uma branch `gh-pages`.
3. Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / `root`.

## Endereços úteis

- Apresentação: `…/semiologia-cardiovascular/?modo=apresentacao`
- Estudo: `…/semiologia-cardiovascular/?modo=estudo`
- Slide específico (apresentação): `…/#/4`

## Sala de aula sem internet

Usar `dist-offline/index.html` (gerado por `npm run build:offline`): um único arquivo, abre com duplo clique no Chrome, Edge ou Firefox.
