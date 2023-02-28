import ini from 'ini'
import fs from 'fs'
import path from 'path'

(async () => {
    const config = ini.parse(fs.readFileSync(path.join(process.cwd(), 'config.ini'), 'utf-8'))

    console.log({...config})
})()