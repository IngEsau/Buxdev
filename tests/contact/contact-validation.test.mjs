import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile('lib/contact-validation.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { getEmailError, getPhoneError, getOtherInterestError, normalizeNationalPhone } =
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

test('The open-text option is required, single-line and limited to 160 code points', () => {
  assert.equal(getOtherInterestError('  '),'otherInterestRequired')
  assert.equal(getOtherInterestError('Integrar nuestro catálogo con una API'),undefined)
  assert.equal(getOtherInterestError('x'.repeat(160)),undefined)
  assert.equal(getOtherInterestError('x'.repeat(161)),'otherInterestInvalid')
  assert.equal(getOtherInterestError('Consulta\r\nBcc: otro'),'otherInterestInvalid')
  assert.equal(getOtherInterestError('Consulta\0oculta'),'otherInterestInvalid')
})
