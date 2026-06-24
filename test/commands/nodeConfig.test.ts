import {expect, test} from '@oclif/test'

describe('evmNodes', () => {
  test
  .stdout()
  .command(['evmNodes'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['evmNodes', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
