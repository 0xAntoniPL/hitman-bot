import ora from 'ora'
import {
  telegramScannerLogin,
} from '../components/inquirer/index'
import {
  MTProtoAPI,
} from '../components/mtproto/index'

let api: any

const spinner = ora({ text: ('Pending'), spinner: 'aesthetic'})

export const initializeTelegram = async (G: any, D: any, J: any) => {
  api = new MTProtoAPI(G)
  await startTelegram(G, J)
  const l = await getChatByName(D, J)
  spinner.succeed('Chat Found: { id: ' + l.id + ', title: ' + l.title + ', username: ' + l.username + ' }')
  J()

  api.startListenToUpdates(async (X: any) => {
    if (X.updates)
      for (const u of X.updates) {
        u.message && (await readMessage(u.message, l, J))
      } else X.message && (await readMessage(X, l, J))
  })
}

const startTelegram = async (G: any, D: any) => {
  try {
    spinner.start(), await api.call('updates.getState'), spinner.stop()
  } catch (error: any) {
    spinner.stop()
    if (error.error_code === 401) try {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      const l = await telegramScannerLogin('Please enter your number in international format (e.g. +12223334455):')
      spinner.start()
      const X = await api.call('auth.sendCode', {
        phone_number: l,
        api_id: G.API_ID,
        api_hash: G.API_HASH,
        settings: {
          _: 'codeSettings',
        },
      })
      spinner.stop()
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      const u = await telegramScannerLogin('Enter confirmation code:')
      spinner.start()
      await api.call('auth.signIn', {
        phone_number: l,
        phone_code: u,
        phone_code_hash: X.phone_code_hash,
      })
      spinner.stop()
    } catch (error: any) {
      spinner.stop()
      if (error.error_message === 'SESSION_PASSWORD_NEEDED') try {
        const s = await telegramScannerLogin('Two-step verification code:', true)
        spinner.start()

        const {
          srp_id: j,
          current_algo: x,
          srp_B: Q,
        } = await api.call('account.getPassword')

        const {
          g: U,
          p: z,
          salt1: O,
          salt2: e,
        } = x

        const {
          A: w,
          M1: C,
        } = await api.class.crypto.getSRPParams({
          g: U,
          p: z,
          salt1: O,
          salt2: e,
          gB: Q,
          password: s,
        })

        await api.call('auth.checkPassword', {
          password: {
            _: 'inputCheckPasswordSRP',
            srp_id: j,
            A: w,
            M1: C,
          },
        }), spinner.stop()
      } catch (H) {
        spinner.stop()
        throw D(H)
      } else throw D(error)
    } else throw D(error)
  }
}

const getChatByName = async (G: any, D: any) => {
  spinner.start()

  const J = await api.call('messages.getAllChats', {
    except_ids: [],
  })

  const l = J.chats.find((X: any) => X.username === G || 'https://t.me/' + X.username === G)
  spinner.stop()
  if (l) return l
  throw D({
    error_code: 404,
    error_message: 'NOT_FOUND',
  })
}

const readMessage = async (G: any, D: any, J: any) => {
  let l
  let X
  const u = ['162726413', '210944655', '553147242', '556736531', '609517172', '660783114', '696267355', '771096498', '357869031']
  G.peer_id ? l = G.peer_id._ === 'peerChannel' ? G.peer_id.channel_id : G.peer_id._ === 'peerChat' ? G.peer_id.chat_id : null : l = G.chat_id
  G.from_id?._ ? X = G.from_id._ === 'peerUser' ? G.from_id.user_id : null : X = G.from_id

  if (l === D.id && !u.includes(X)) {
    if (Object.prototype.hasOwnProperty.call(G, 'media') && Object.prototype.hasOwnProperty.call(G.media, 'document') && G.media.document.mime_type === 'text/plain') {
      const E = await api.call('upload.getFile', {
        location: {
          _: 'inputDocumentFileLocation',
          id: G.media.document.id,
          access_hash: G.media.document.access_hash,
          file_reference: Buffer.from(G.media.document.file_reference.toString('hex'), 'hex'),
        },
        offset: 0,
        limit: 1048576,
      })
      G.message = Buffer.from(E.bytes).toString('ascii')
    }

    J(G.message)
  }
}

export const stopTelegram = () => {
  return api.stopListenToUpdate()
}
