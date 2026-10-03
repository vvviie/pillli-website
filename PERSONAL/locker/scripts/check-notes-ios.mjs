import { chromium } from 'playwright'

const shots = '/tmp/locker-shots'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })
page.setDefaultTimeout(15000)
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto('http://127.0.0.1:4173/')
await page.getByRole('heading', { name: 'Locker', exact: true }).waitFor()
await page.getByLabel('Display name').fill('Jerick')
await page.getByRole('textbox', { name: 'Master password', exact: true }).fill('locker-passphrase')
await page.getByRole('textbox', { name: 'Confirm master password', exact: true }).fill('locker-passphrase')
await page.getByRole('button', { name: 'Create vault' }).click()
await page.getByRole('checkbox', { name: 'I saved this recovery code' }).check()
await page.getByRole('button', { name: 'Open Locker' }).click()
await page.getByRole('button', { name: 'Notes', exact: true }).click()
await page.screenshot({ path: `${shots}/ios-empty.png` })

const writeNote = async (title, lines) => {
  await page.getByRole('button', { name: 'New note' }).click()
  await page.keyboard.type(title)
  await page.keyboard.press('Enter')
  for (const line of lines) await page.keyboard.type(line)
  await page.getByRole('button', { name: new RegExp(`^${title}`) }).waitFor()
}

await writeNote('Groceries', ['Weekly run\n'])
await page.getByRole('button', { name: 'Add checklist' }).click()
await page.keyboard.type('Eggs\nMilk\nCoffee')
await writeNote('Trip ideas', ['Palawan in December, check flights'])
await writeNote('Wi-Fi codes', ['Home: ask Jerick'])

await page.getByRole('button', { name: /^Groceries/ }).click()
await page.getByRole('button', { name: 'More note actions' }).click()
await page.screenshot({ path: `${shots}/ios-menu.png` })
await page.getByRole('menuitem', { name: 'Pin note' }).click()
const opensInView = await page.getByRole('region', { name: 'Preview' }).isVisible()
await page.getByRole('region', { name: 'Preview' }).getByRole('checkbox').first().check()
await page.getByText('Saved', { exact: true }).waitFor()
const groups = await page.locator('.note-groups h2').allInnerTexts()
await page.screenshot({ path: `${shots}/ios-desktop.png` })

await page.getByRole('button', { name: 'Add checklist' }).click()
await page.keyboard.type('Bread')
const afterChecklist = await page.getByRole('textbox', { name: 'Note', exact: true }).inputValue()
await page.getByRole('button', { name: 'Preview note' }).click()
await page.getByText('Weekly run').click()
const editFocused = await page.getByRole('textbox', { name: 'Note', exact: true }).evaluate((element) => element === document.activeElement)

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(400)
await page.screenshot({ path: `${shots}/ios-mobile-editor.png` })
await page.locator('.note-back').click()
await page.screenshot({ path: `${shots}/ios-mobile-list.png` })

console.log(JSON.stringify({ groups, opensInView, afterChecklist, editFocused, errors }, null, 2))
await browser.close()
