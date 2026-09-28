import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile('lib/contact-validation.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { CONTACT_COUNTRIES, getEmailError, getPhoneError, getOtherInterestError, normalizeNationalPhone, parsePhoneInput } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('Email validates dot-atom addresses, domain labels and bounded lengths', () => {
  for (const value of ['qa@example.test', '  user+project@sub.example.com  ', 'first.last@example.co.uk', 'qa@xn--bcher-kva.de']) {
    assert.equal(getEmailError(value), undefined, value)
  }
  assert.equal(getEmailError('  '), 'emailRequired')
  for (const value of ['qa', 'qa@', 'qa@example', 'qa@@example.com', 'qa..user@example.com', '.qa@example.com',
    'qa.@example.com', 'qa@-example.com', 'qa@example-.com', 'qa@exa_mple.com', 'qa@example..com',
    'qa user@example.com', 'qa@example.com\r\n', 'a'.repeat(65)+'@example.com', 'qa@'+('a'.repeat(64))+'.com',
    'qa@'+('longdomain.'.repeat(30))+'com', 'qa@example.123']) assert.equal(getEmailError(value), 'emailInvalid', value)
})

test('Phones validate national length, formatting and the selected country', () => {
  for (const [country, phone] of [['+52','222 123 4567'], ['+52','+52 (222) 123-4567'],
    ['+1','2025550123'], ['+34','612345678'], ['+56','912345678'], ['+57','3001234567'],
    ['+54','1123456789'], ['+54','+54 9 11 2345 6789']]) assert.equal(getPhoneError(phone,country),undefined,phone)
  assert.equal(normalizeNationalPhone('+52 (222) 123-4567','+52'),'2221234567')
  assert.equal(getPhoneError('  ','+52'),'phoneRequired')
  for (const [country, phone] of [['+52','1234567'], ['+52','22212345678'], ['+52','0000000000'],
    ['+52','2222222222'], ['+52','+1 2025550123'], ['+52','+52 1 2221234567'], ['+52','222ABC4567'],
    ['+52','2221234567\n'], ['+52','++522221234567'], ['+1','1234567890'], ['+1','2021550123'],
    ['+34','61234567'], ['+56','9123456789'], ['+57','300123456'], ['+54','81123456789'],
    ['+999','2221234567']]) assert.equal(getPhoneError(phone,country),'phoneInvalid',phone)
})

test('Phone entry limits national digits without guessing a country or truncating numbers', () => {
  assert.deepEqual(parsePhoneInput('222 123-4567', '+52'), { phone: '2221234567', countryCode: '+52' })
  assert.deepEqual(parsePhoneInput('', '+52'), { phone: '', countryCode: '+52' })
  for (const plan of CONTACT_COUNTRIES) {
    const phone = '2'.repeat(plan.max)
    assert.deepEqual(parsePhoneInput(phone, plan.code), { phone, countryCode: plan.code })
    assert.equal(parsePhoneInput(phone + '3', plan.code), null)
  }
  for (const value of ['22212345678', '+52 22212345678', '+44 7700900123', '222ABC1234567',
    '++522221234567', '2221234567\n']) assert.equal(parsePhoneInput(value, '+52'), null, value)
})

test('International paste/autofill selects the supported calling code and keeps every national digit', () => {
  for (const [value, countryCode, phone] of [
    ['+52 (222) 123-4567', '+52', '2221234567'],
    ['+1 202 555 0123', '+1', '2025550123'],
    ['+34 612 345 678', '+34', '612345678'],
    ['+54 9 11 2345 6789', '+54', '91123456789'],
    ['+56 912 345 678', '+56', '912345678'],
    ['+57 300 123 4567', '+57', '3001234567'],
  ]) {
    const parsed = parsePhoneInput(value, '+52')
    assert.deepEqual(parsed, { phone, countryCode })
    assert.equal(getPhoneError(parsed.phone, parsed.countryCode), undefined)
    assert.equal(`${parsed.countryCode}${parsed.phone}`, value.replace(/[^\d+]/g, ''))
  }
  assert.deepEqual(parsePhoneInput('612345678', '+52'), { phone: '612345678', countryCode: '+52' })
})

test('The open-text option is required, single-line and limited to 160 code points', () => {
  assert.equal(getOtherInterestError('  '),'otherInterestRequired')
  assert.equal(getOtherInterestError('Integrar nuestro catálogo con una API'),undefined)
  assert.equal(getOtherInterestError('x'.repeat(160)),undefined)
  assert.equal(getOtherInterestError('x'.repeat(161)),'otherInterestInvalid')
  assert.equal(getOtherInterestError('Consulta\r\nBcc: otro'),'otherInterestInvalid')
  assert.equal(getOtherInterestError('Consulta\0oculta'),'otherInterestInvalid')
})
