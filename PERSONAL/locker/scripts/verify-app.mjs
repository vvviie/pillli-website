import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const port = 4173
const baseUrl = `http://127.0.0.1:${port}`
const shots = '/tmp/locker-shots'

const waitForServer = (child) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Preview server did not start')), 20000)
  const onData = (chunk) => {
    const text = String(chunk)
    if (text.includes('Local:') || text.includes(baseUrl)) {
      clearTimeout(timer)
      resolve()
    }
  }
  child.stdout.on('data', onData)
  child.stderr.on('data', onData)
  child.on('exit', (code) => {
    clearTimeout(timer)
    reject(new Error(`Preview server exited with ${code}`))
  })
})

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
})

const fail = async (page, message) => {
  const body = await page.locator('body').innerText().catch(() => '')
  throw new Error(`${message}\n\n${body.slice(0, 800)}`)
}

let page
const errors = []
try {
  await waitForServer(server)
  await mkdir(shots, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  page = await context.newPage()
  page.setDefaultTimeout(20000)
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.goto(baseUrl)
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker?.ready
    return Boolean(registration)
  })
  await page.reload()
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller))
  await page.getByRole('heading', { name: 'Locker' }).waitFor()
  await page.screenshot({ path: `${shots}/01-setup.png`, fullPage: true })

  await page.getByLabel('Display name').fill('Jerick')
  await page.getByRole('textbox', { name: 'Master password', exact: true }).fill('locker-passphrase')
  await page.getByRole('textbox', { name: 'Confirm master password', exact: true }).fill('locker-passphrase')
  await page.getByRole('button', { name: 'Create vault' }).click()
  await page.getByRole('checkbox', { name: 'I saved this recovery code' }).check()
  await page.screenshot({ path: `${shots}/02-recovery.png`, fullPage: true })
  await page.getByRole('button', { name: 'Open Locker' }).click()
  await page.getByRole('heading', { name: /Jerick/ }).waitFor()
  await page.screenshot({ path: `${shots}/03-dashboard.png`, fullPage: true })

  await page.getByRole('button', { name: 'Vault', exact: true }).click()
  await page.getByRole('button', { name: 'Add credential' }).click()
  await page.getByLabel('Title').fill('GitHub')
  await page.getByLabel('Username or email').fill('ada@example.com')
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('offline-secret')
  await page.getByLabel('Website').fill('github.com')
  await page.getByRole('button', { name: 'Save credential' }).click()
  await page.getByRole('button', { name: 'GitHub ada@example.com' }).waitFor()

  await page.getByRole('button', { name: 'Lock vault' }).click()
  await page.getByRole('heading', { name: 'Unlock your vault' }).waitFor()
  await page.getByRole('textbox', { name: 'Master password', exact: true }).fill('locker-passphrase')
  await page.getByRole('button', { name: 'Unlock', exact: true }).click()
  await page.getByRole('button', { name: 'GitHub ada@example.com' }).waitFor()

  await context.setOffline(true)
  await page.getByRole('button', { name: 'Notes', exact: true }).click()
  await page.getByRole('button', { name: 'New note' }).click()
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Offline note')
  await page.getByRole('textbox', { name: 'Note', exact: true }).fill('Written without a network.')
  await page.keyboard.press('ControlOrMeta+s')
  await page.getByRole('button', { name: /^Offline note/ }).waitFor()
  await page.getByText('Saved', { exact: true }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Unlock your vault' }).waitFor()
  await page.screenshot({ path: `${shots}/04-offline-lock.png`, fullPage: true })
  await page.getByRole('textbox', { name: 'Master password', exact: true }).fill('locker-passphrase')
  await page.getByRole('button', { name: 'Unlock', exact: true }).click()
  await page.getByRole('button', { name: /^Offline note/ }).waitFor()
  await page.getByRole('button', { name: 'Vault', exact: true }).click()
  await page.getByRole('button', { name: 'GitHub ada@example.com' }).waitFor()
  await page.screenshot({ path: `${shots}/05-offline-vault.png`, fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.screenshot({ path: `${shots}/06-mobile-menu.png`, fullPage: true })
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click()
  await page.screenshot({ path: `${shots}/07-mobile-dashboard.png`, fullPage: true })

  if (errors.length > 0) await fail(page, `Page errors: ${errors.join('\n')}`)
  await browser.close()
  console.log('Locker offline flow passed')
} catch (error) {
  await page.screenshot({ path: `${shots}/failure.png`, fullPage: true }).catch(() => {})
  const body = await page.locator('body').innerText().catch(() => '')
  console.error(error)
  console.error('PAGE TEXT:\n', body.slice(0, 1200))
  console.error('CONSOLE:\n', errors.join('\n'))
  process.exitCode = 1
} finally {
  server.kill('SIGKILL')
  setTimeout(() => process.exit(process.exitCode ?? 0), 200).unref()
}
