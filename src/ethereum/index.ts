let primary: any
let secondary: any

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeEthereum = (nodeList: any) => {
  return new Promise(resolve => {
    primary = nodeList.primary
    secondary = nodeList.secondary
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    // eslint-disable-next-line no-promise-executor-return
    return resolve()
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPrimary = () => primary
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getSecondary = () => secondary

