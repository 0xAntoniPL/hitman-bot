// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@mtp... Remove this comment to see the full error message
import {MTProto, MTProtoError} from '@mtproto/core'
import {
  sleep,
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@mtp... Remove this comment to see the full error message
} from '@mtproto/core/src/utils/common/index'
import {
  getCoreLocation,
} from '../../utilities/index'

export class MTProtoAPI {
    ['class'];

    constructor(G: any) {
      this.class = new MTProto({
        api_id: G.API_ID,
        api_hash: G.API_HASH,
        storageOptions: {
          path: getCoreLocation('session.json'),
        },
      })
    }

    // @ts-expect-error ts-migrate(7023) FIXME: '['call']' implicitly has return type 'any' becaus... Remove this comment to see the full error message
    async ['call'](method: string, params, options = {}) {
      try {
        return await this.class.call(method, params, options)
      } catch (error: Error | MTProtoError) {
        const {
          error_code,
          error_message,
        } = error

        if (error_code === 303) {
          const [type, dcIdAsString] = error_message.split('_MIGRATE_')
          const dcId = Number(dcIdAsString)

          type === 'PHONE' ? await this.class.setDefaultDc(dcId) : Object.assign(options, {
            dcId: dcId,
          })

          return this.call(method, params, options)
        }

        if (error_code === 420) return await sleep(Number(error_message.split('FLOOD_WAIT_')[1]) * 1000), this.call(method, params, options)
        throw error
      }
    }

    ['startListenToUpdates'](G: any) {
      this.class.updates.on('updates', G)
      this.class.updates.on('updateShortChatMessage', G)
      this.class.updates.on('updateShortMessage', G)
      this.class.updates.on('updateShortSentMessage', G)
    }

    ['stopListenToUpdate']() {
      this.class.updates.removeAllListeners('updates')
      this.class.updates.removeAllListeners('updateShortChatMessage')
      this.class.updates.removeAllListeners('updateShortMessage')
      this.class.updates.removeAllListeners('updateShortSentMessage')
    }
}
