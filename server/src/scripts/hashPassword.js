import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password || password.length < 8) {
  console.error('Usage : npm run hash-password -- "TonMotDePasse"  (8 caractères minimum)')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log('\nColle cette ligne dans server/.env :\n')
console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`)
