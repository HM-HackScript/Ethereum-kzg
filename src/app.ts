import axios from 'axios';
import { ethers } from 'ethers';
import moment from 'moment';
import puppeteer from 'puppeteer';
import libCookie from 'cookie'
import ini from 'ini'
import fs from 'fs'
import path from 'path'
import { omitString } from './utils/utils';

const { account_config: { privateKeys }, environment: { proxy, chrome_path, debug_chrome, system, complete_close, cmdProxys } } = ini.parse(fs.readFileSync(path.join(process.cwd(), 'config.ini'), 'utf-8'))

const getProxySetting = (proxyStr: string) => {
    if (!(/(\S+):\/\/(\S+):(\d+)/.test(proxyStr))) {
        return false
    }
    const matchs: any = proxyStr.match(/(\S+):\/\/(\S+):(\d+)/)

    return {
        protocol: matchs?.[1],
        host: matchs?.[2],
        port: Number(matchs?.[3])
    }
}

const getSignatureSiwe = async (privateKey: string, nonce: string) => {
    const signer = new ethers.Wallet(privateKey)
    const address = signer.address
    const nowTime = Date.now()
    const start = moment(nowTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
    const end = moment(nowTime + 3600 * 24 * 1000).utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'

    const raw = `oidc.signinwithethereum.org wants you to sign in with your Ethereum account:\n${address}\n\nYou are signing-in to seq.ceremony.ethereum.org.\n\nURI: https://oidc.signinwithethereum.org\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${start}\nExpiration Time: ${end}\nResources:\n- https://seq.ceremony.ethereum.org/auth/callback/eth`
    const signature = await signer.signMessage(raw)

    return {
        address: address,
        signature: signature,
        siwe: {
            "message": {
                "domain": "oidc.signinwithethereum.org",
                "address": address,
                "statement": "You are signing-in to seq.ceremony.ethereum.org.",
                "uri": "https://oidc.signinwithethereum.org",
                "version": "1",
                "nonce": nonce,
                "issuedAt": start,
                "expirationTime": end,
                "chainId": 1,
                "resources": ["https://seq.ceremony.ethereum.org/auth/callback/eth"]
            },
            "raw": `oidc.signinwithethereum.org wants you to sign in with your Ethereum account:\n${address}\n\nYou are signing-in to seq.ceremony.ethereum.org.\n\nURI: https://oidc.signinwithethereum.org\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${start}\nExpiration Time: ${end}\nResources:\n- https://seq.ceremony.ethereum.org/auth/callback/eth`,
            "signature": signature,
            "ens": null
        }
    }
}

const getSessionId = async (privateKey: string[2], cmdProxy: string, cmdProxyIndex: number) => {
    console.log('open browser ...')
    // const executablePath = path.join(process.cwd(), '.local-chromium')
    const executablePath = chrome_path

    console.log('browser route: ', executablePath)
    const browser = await puppeteer.launch({
        headless: !debug_chrome,
        executablePath: executablePath,
        args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote']
    })

    const page = await browser.newPage()
    await page.deleteCookie()

    console.log('open ethereum sign website ...')
    await page.goto(`https://oidc.signinwithethereum.org/authorize?response_type=code&client_id=5aeae9f0-56a3-41dd-beea-a6c456ad1c5f&state=eyJyZWRpcmVjdCI6bnVsbH0&redirect_uri=https%3A%2F%2Fseq.ceremony.ethereum.org%2Fauth%2Fcallback%2Feth&scope=openid`);

    const cookie = await page.cookies()
    const matches = page.url().match(/nonce=(\S+)&domain/ig)
    const nonce = matches?.[0].slice(0, -7).split('=')[1]

    if (!nonce) throw new Error("nonce undified");

    await page.close()

    const session = cookie[0].value

    const { address, siwe } = await getSignatureSiwe(privateKey[1], nonce)

    console.log('wallet sign message ...')

    return new Promise((resovle, reject) => {
        axios.get(`https://oidc.signinwithethereum.org/sign_in?redirect_uri=https://seq.ceremony.ethereum.org/auth/callback/eth&state=eyJyZWRpcmVjdCI6bnVsbH0&client_id=5aeae9f0-56a3-41dd-beea-a6c456ad1c5f`, {
            headers: {
                cookie: `${libCookie.serialize('session', session)}; ${libCookie.serialize('siwe', JSON.stringify(siwe))}`
            },
            proxy: getProxySetting(proxy)
        }).then(res => {
            if (res.status === 200) {
                if (!res.data.session_id) {
                    console.log(res)
                } else {
                    console.log(`<${address}> get session success => ${res.data.session_id}`)

                    if (system !== 'mac') {
                        console.log('Only Windows: generate bat in cli ...')
                        fs.writeFileSync(
                            path.join(process.cwd(), `cli/【${privateKey[0]}#${cmdProxyIndex + 1}】${omitString(address)}.bat`),
                            `@echo off\ntitle=[ID#${privateKey[0]} IP#${cmdProxyIndex + 1}]- ${omitString(address)} \nset http_proxy=${cmdProxy}\nset https_proxy=${cmdProxy}\ncurl ipinfo.io\nkzgcli-win.exe contribute --session-id ${res.data.session_id}\npause`,
                            { flag: 'w' }
                        )
                    }

                    console.log('write record to session.txt success!')
                    fs.writeFileSync(
                        path.join(process.cwd(), 'session.txt'),
                        `【${moment().format('YYYY-MM-DD HH:mm:ss')}】- ADSID: ${privateKey[0]}  |  ${address}  |  ${res.data.session_id}\n`,
                        { flag: 'a' }
                    )
                }
            }

            resovle(res)
        }).catch((err: any) => {
            console.error(`<${address}> get session error`)

            // 贡献已成功
            if (err.response.data?.code?.includes('AuthErrorPayload')) {
                console.log(`<${address}> user already contributed`)
                const successText = fs.readFileSync(path.join(process.cwd(), 'success.txt'), 'utf-8')
                if (!successText.includes(address)) {
                    fs.writeFileSync(
                        path.join(process.cwd(), 'success.txt'),
                        `【${moment().format('YYYY-MM-DD HH:mm:ss')}】- ADSID: ${privateKey[0]}  |  ${address}  |  ${omitString(privateKey[0], 8, 4)}\n`,
                        { flag: 'a' }
                    )
                }

                console.log(`Recorded by contributed account <${address}>`)
                resovle({})
            } else {
                err.response.data ?? console.log(err.response.data)
            }
            // if (JSON.stringify(err).includes('AuthErrorPayload::UserCreatedAfterDeadline')) {
            //     console.log({
            //         status: 'ERR_BAD_REQUEST',
            //         code: 'AuthErrorPayload::UserCreatedAfterDeadline',
            //         error: 'user created after deadline'
            //     })
            // }

            reject(err)
        })
    })
}


(async () => {
    let pks: any = privateKeys || []
    console.log(`=====  Total Wallet Count: ${pks.length}  =====`)
    pks = pks.map((item: string) => item.split(',').map(i => i.trim()))

    for (let index = 0; index < pks.length; index++) {
        const privateKey = pks[index];
        const cmdProxyIndex = index % cmdProxys.length
        const useProxy = cmdProxys[cmdProxyIndex]

        console.log(`---> start ${index + 1} of ${pks.length} <---`)
        try {
            await getSessionId(privateKey, useProxy, cmdProxyIndex)
        } catch (error: any) {
            console.log(error.message)
        }

        console.log(`---> end ${index + 1} of ${pks.length} <---\n`)
    }

    fs.writeFileSync(
        path.join(process.cwd(), 'session.txt'),
        `===============================================================\n`,
        { flag: 'a' }
    )

    if (complete_close) {
        console.log(`script execution completed，auto shutdown after 30s ...`)
        setTimeout(() => { process.exit() }, 30000)
    } else {
        console.log(`script execution completed .`)
    }

})()

