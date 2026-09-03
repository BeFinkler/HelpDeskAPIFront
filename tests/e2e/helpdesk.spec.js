import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

test('cliente abre, técnico atende e cliente consulta a solução em tela móvel', async ({
  browser,
}) => {
  const backend = process.env.HELPDESK_BACKEND_DIR || path.resolve('../HelpDeskAPIBack');
  const technician = JSON.parse(await readFile(path.join(backend, '.local/e2e-user.json'), 'utf8'));
  const email = `cliente-${Date.now()}@example.com`;
  const password = randomBytes(12).toString('base64url');
  const clientContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    baseURL: 'http://localhost:5174',
  });
  const technicianContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    baseURL: 'http://localhost:5174',
  });
  const client = await clientContext.newPage();
  const support = await technicianContext.newPage();
  try {
    await client.goto('/cadastro');
    await client.getByLabel('Nome completo').fill('Cliente de Homologação');
    await client.getByLabel('E-mail', { exact: true }).fill(email);
    await client.getByLabel('Senha', { exact: true }).fill(password);
    await client.getByLabel('Confirme sua senha').fill(password);
    await client.getByRole('button', { name: 'Criar minha conta' }).click();
    await expect(client).toHaveURL(/\/login$/);
    await client.getByLabel('E-mail', { exact: true }).fill(email);
    await client.getByLabel('Senha', { exact: true }).fill(password);
    await client.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(client).toHaveURL(/\/painel$/);
    await client.getByRole('link', { name: 'Novo chamado', exact: true }).first().click();
    await client.getByLabel('Título do chamado').fill('Computador sem acesso à rede');
    await client.getByLabel('Categoria', { exact: true }).selectOption('rede');
    await client
      .getByLabel('O que aconteceu?')
      .fill('Desde esta manhã, a estação não consegue acessar a rede interna.');
    await client.getByRole('button', { name: 'Abrir chamado', exact: true }).click();
    await expect(client).toHaveURL(/\/chamados\/\d+$/);
    const ticketUrl = client.url();
    await expect(
      client.getByRole('heading', { name: 'Computador sem acesso à rede' }),
    ).toBeVisible();
    await client
      .getByLabel('Adicionar comentário')
      .fill('<script>alert("texto, sem execução")</script>');
    await client.getByRole('button', { name: 'Enviar comentário' }).click();
    await expect(
      client.getByText('<script>alert("texto, sem execução")</script>', { exact: true }),
    ).toBeVisible();
    await client.reload();
    await expect(
      client.getByRole('heading', { name: 'Computador sem acesso à rede' }),
    ).toBeVisible();

    await support.goto('/login');
    await support.getByLabel('E-mail', { exact: true }).fill(technician.email);
    await support.getByLabel('Senha', { exact: true }).fill(technician.senha);
    await support.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(support).toHaveURL(/\/painel$/);
    await support.goto(ticketUrl);
    await support.getByRole('button', { name: 'Assumir chamado' }).click();
    await expect(support.getByRole('button', { name: 'Concluir atendimento' })).toBeVisible();
    await support
      .getByLabel('Adicionar comentário')
      .fill('Identifiquei uma configuração de rede incorreta.');
    await support.getByRole('button', { name: 'Enviar comentário' }).click();
    await expect(
      support.getByText('Identifiquei uma configuração de rede incorreta.', { exact: true }),
    ).toBeVisible();
    await support.getByRole('button', { name: 'Concluir atendimento' }).click();
    await support
      .getByLabel('Como o problema foi resolvido?')
      .fill('Configuração corrigida e acesso à rede validado com o cliente.');
    await support.getByRole('button', { name: 'Confirmar conclusão' }).click();
    await expect(support.getByRole('heading', { name: 'Solução do atendimento' })).toBeVisible();

    await client.setViewportSize({ width: 390, height: 844 });
    await client.reload();
    await expect(
      client.getByText('Configuração corrigida e acesso à rede validado com o cliente.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(client.getByLabel('Adicionar comentário')).toHaveCount(0);
    await client.getByRole('button', { name: 'Abrir menu' }).click();
    await expect(client.getByRole('link', { name: 'Meus chamados', exact: true })).toBeVisible();
    await client.getByRole('button', { name: 'Fechar menu', exact: true }).last().click();
    await expect(
      client.getByRole('link', { name: 'Meus chamados', exact: true }),
    ).not.toBeVisible();
    await client.screenshot({ path: 'test-results/chamado-mobile.png', fullPage: true });
    await support.screenshot({ path: 'test-results/chamado-tecnico.png', fullPage: true });

    await client.route('**/api/v1/auth/me', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sessão expirada.' } }),
      }),
    );
    await client.reload();
    await expect(client).toHaveURL(/\/login$/);
    await expect(
      client.getByText('Sua sessão expirou. Entre novamente.', { exact: true }),
    ).toBeVisible();
  } finally {
    await clientContext.close();
    await technicianContext.close();
  }
});

test('cadastro informa confirmação de senha divergente', async ({ page }) => {
  const password = randomBytes(12).toString('base64url');
  await page.goto('/cadastro');
  await page.getByLabel('Nome completo').fill('Novo Cliente');
  await page.getByLabel('E-mail', { exact: true }).fill('validacao@example.com');
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByLabel('Confirme sua senha').fill(`${password}x`);
  await page.getByRole('button', { name: 'Criar minha conta' }).click();
  await expect(page.getByText('As senhas precisam ser iguais.', { exact: true })).toBeVisible();
});
