export const getAmountsOut_abi = {
  inputs: [
    {
      internalType: 'uint256',
      name: 'amountIn',
      type: 'uint256',
    }, {
      internalType: 'address[]',
      name: 'path',
      type: 'address[]',
    },
  ],
  name: 'getAmountsOut',
  outputs: [
    {
      internalType: 'uint256[]',
      name: 'amounts',
      type: 'uint256[]',
    },
  ],
  stateMutability: 'view',
  type: 'function',
}
export const swapExactETHForTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactETHForTokens',
  outputs: [{
    internalType: 'uint256[]',
    name: 'amounts',
    type: 'uint256[]',
  }],
  stateMutability: 'payable',
  type: 'function',
}
export const swapExactKCSForTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactKCSForTokens',
  outputs: [{
    internalType: 'uint256[]',
    name: 'amounts',
    type: 'uint256[]',
  }],
  stateMutability: 'payable',
  type: 'function',
}
export const swapExactAVAXForTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactAVAXForTokens',
  outputs: [{
    internalType: 'uint256[]',
    name: 'amounts',
    type: 'uint256[]',
  }],
  stateMutability: 'payable',
  type: 'function',
}
export const swapExactTokensForETHSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountIn',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const swapExactTokensForKCSSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountIn',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactTokensForKCSSupportingFeeOnTransferTokens',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'amountIn',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountOutMin',
    type: 'uint256',
  }, {
    internalType: 'address[]',
    name: 'path',
    type: 'address[]',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'swapExactTokensForAVAXSupportingFeeOnTransferTokens',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const addLiquidity_abi = {
  inputs: [{
    internalType: 'address',
    name: 'tokenA',
    type: 'address',
  }, {
    internalType: 'address',
    name: 'tokenB',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'amountADesired',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountBDesired',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountAMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountBMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'addLiquidity',
  outputs: [{
    internalType: 'uint256',
    name: 'amountA',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountB',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const addLiquidityETH_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'amountTokenDesired',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETHMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'addLiquidityETH',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETH',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }],
  stateMutability: 'payable',
  type: 'function',
}
export const addLiquidityKCS_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'amountTokenDesired',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCSMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'addLiquidityKCS',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCS',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }],
  stateMutability: 'payable',
  type: 'function',
}
export const addLiquidityAVAX_abi = {
  type: 'function',
  stateMutability: 'payable',
  outputs: [{
    type: 'uint256',
    name: 'amountToken',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAX',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'liquidity',
    internalType: 'uint256',
  }],
  name: 'addLiquidityAVAX',
  inputs: [{
    type: 'address',
    name: 'token',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'amountTokenDesired',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountTokenMin',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAXMin',
    internalType: 'uint256',
  }, {
    type: 'address',
    name: 'to',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'deadline',
    internalType: 'uint256',
  }],
}
export const removeLiquidity_abi = {
  inputs: [{
    internalType: 'address',
    name: 'tokenA',
    type: 'address',
  }, {
    internalType: 'address',
    name: 'tokenB',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountAMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountBMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'removeLiquidity',
  outputs: [{
    internalType: 'uint256',
    name: 'amountA',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountB',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityETH_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETHMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'removeLiquidityETH',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETH',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityKCS_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCSMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'removeLiquidityKCS',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCS',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityAVAX_abi = {
  type: 'function',
  stateMutability: 'nonpayable',
  outputs: [{
    type: 'uint256',
    name: 'amountToken',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAX',
    internalType: 'uint256',
  }],
  name: 'removeLiquidityAVAX',
  inputs: [{
    type: 'address',
    name: 'token',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'liquidity',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountTokenMin',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAXMin',
    internalType: 'uint256',
  }, {
    type: 'address',
    name: 'to',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'deadline',
    internalType: 'uint256',
  }],
}
export const removeLiquidityETHSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETHMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'removeLiquidityETHSupportingFeeOnTransferTokens',
  outputs: [{
    internalType: 'uint256',
    name: 'amountETH',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityKCSSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCSMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }],
  name: 'removeLiquidityKCSSupportingFeeOnTransferTokens',
  outputs: [{
    internalType: 'uint256',
    name: 'amountKCS',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityAVAXSupportingFeeOnTransferTokens_abi = {
  type: 'function',
  stateMutability: 'nonpayable',
  outputs: [{
    type: 'uint256',
    name: 'amountAVAX',
    internalType: 'uint256',
  }],
  name: 'removeLiquidityAVAXSupportingFeeOnTransferTokens',
  inputs: [{
    type: 'address',
    name: 'token',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'liquidity',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountTokenMin',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAXMin',
    internalType: 'uint256',
  }, {
    type: 'address',
    name: 'to',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'deadline',
    internalType: 'uint256',
  }],
}
export const removeLiquidityETHWithPermit_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETHMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'approveMax',
    type: 'bool',
  }, {
    internalType: 'uint8',
    name: 'v',
    type: 'uint8',
  }, {
    internalType: 'bytes32',
    name: 'r',
    type: 'bytes32',
  }, {
    internalType: 'bytes32',
    name: 's',
    type: 'bytes32',
  }],
  name: 'removeLiquidityETHWithPermit',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETH',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityKCSWithPermit_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCSMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'approveMax',
    type: 'bool',
  }, {
    internalType: 'uint8',
    name: 'v',
    type: 'uint8',
  }, {
    internalType: 'bytes32',
    name: 'r',
    type: 'bytes32',
  }, {
    internalType: 'bytes32',
    name: 's',
    type: 'bytes32',
  }],
  name: 'removeLiquidityKCSWithPermit',
  outputs: [{
    internalType: 'uint256',
    name: 'amountToken',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCS',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityAVAXWithPermit_abi = {
  type: 'function',
  stateMutability: 'nonpayable',
  outputs: [{
    type: 'uint256',
    name: 'amountToken',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAX',
    internalType: 'uint256',
  }],
  name: 'removeLiquidityAVAXWithPermit',
  inputs: [{
    type: 'address',
    name: 'token',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'liquidity',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountTokenMin',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAXMin',
    internalType: 'uint256',
  }, {
    type: 'address',
    name: 'to',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'deadline',
    internalType: 'uint256',
  }, {
    type: 'bool',
    name: 'approveMax',
    internalType: 'bool',
  }, {
    type: 'uint8',
    name: 'v',
    internalType: 'uint8',
  }, {
    type: 'bytes32',
    name: 'r',
    internalType: 'bytes32',
  }, {
    type: 'bytes32',
    name: 's',
    internalType: 'bytes32',
  }],
}
export const removeLiquidityETHWithPermitSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountETHMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'approveMax',
    type: 'bool',
  }, {
    internalType: 'uint8',
    name: 'v',
    type: 'uint8',
  }, {
    internalType: 'bytes32',
    name: 'r',
    type: 'bytes32',
  }, {
    internalType: 'bytes32',
    name: 's',
    type: 'bytes32',
  }],
  name: 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
  outputs: [{
    internalType: 'uint256',
    name: 'amountETH',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityKCSWithPermitSupportingFeeOnTransferTokens_abi = {
  inputs: [{
    internalType: 'address',
    name: 'token',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountTokenMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountKCSMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'approveMax',
    type: 'bool',
  }, {
    internalType: 'uint8',
    name: 'v',
    type: 'uint8',
  }, {
    internalType: 'bytes32',
    name: 'r',
    type: 'bytes32',
  }, {
    internalType: 'bytes32',
    name: 's',
    type: 'bytes32',
  }],
  name: 'removeLiquidityKCSWithPermitSupportingFeeOnTransferTokens',
  outputs: [{
    internalType: 'uint256',
    name: 'amountKCS',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens_abi = {
  type: 'function',
  stateMutability: 'nonpayable',
  outputs: [{
    type: 'uint256',
    name: 'amountAVAX',
    internalType: 'uint256',
  }],
  name: 'removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens',
  inputs: [{
    type: 'address',
    name: 'token',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'liquidity',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountTokenMin',
    internalType: 'uint256',
  }, {
    type: 'uint256',
    name: 'amountAVAXMin',
    internalType: 'uint256',
  }, {
    type: 'address',
    name: 'to',
    internalType: 'address',
  }, {
    type: 'uint256',
    name: 'deadline',
    internalType: 'uint256',
  }, {
    type: 'bool',
    name: 'approveMax',
    internalType: 'bool',
  }, {
    type: 'uint8',
    name: 'v',
    internalType: 'uint8',
  }, {
    type: 'bytes32',
    name: 'r',
    internalType: 'bytes32',
  }, {
    type: 'bytes32',
    name: 's',
    internalType: 'bytes32',
  }],
}
export const removeLiquidityWithPermit_abi = {
  inputs: [{
    internalType: 'address',
    name: 'tokenA',
    type: 'address',
  }, {
    internalType: 'address',
    name: 'tokenB',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'liquidity',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountAMin',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountBMin',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'to',
    type: 'address',
  }, {
    internalType: 'uint256',
    name: 'deadline',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'approveMax',
    type: 'bool',
  }, {
    internalType: 'uint8',
    name: 'v',
    type: 'uint8',
  }, {
    internalType: 'bytes32',
    name: 'r',
    type: 'bytes32',
  }, {
    internalType: 'bytes32',
    name: 's',
    type: 'bytes32',
  }],
  name: 'removeLiquidityWithPermit',
  outputs: [{
    internalType: 'uint256',
    name: 'amountA',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'amountB',
    type: 'uint256',
  }],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const abiDecoder_abis = [swapExactETHForTokens_abi, swapExactKCSForTokens_abi, swapExactAVAXForTokens_abi, swapExactTokensForETHSupportingFeeOnTransferTokens_abi, swapExactTokensForKCSSupportingFeeOnTransferTokens_abi, swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi, addLiquidity_abi, addLiquidityETH_abi, addLiquidityKCS_abi, addLiquidityAVAX_abi, removeLiquidity_abi, removeLiquidityETH_abi, removeLiquidityKCS_abi, removeLiquidityAVAX_abi, removeLiquidityETHSupportingFeeOnTransferTokens_abi, removeLiquidityKCSSupportingFeeOnTransferTokens_abi, removeLiquidityAVAXSupportingFeeOnTransferTokens_abi, removeLiquidityETHWithPermit_abi, removeLiquidityKCSWithPermit_abi, removeLiquidityAVAXWithPermit_abi, removeLiquidityETHWithPermitSupportingFeeOnTransferTokens_abi, removeLiquidityKCSWithPermitSupportingFeeOnTransferTokens_abi, removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens_abi, removeLiquidityWithPermit_abi]
export const currentEpoch_abi = {
  inputs: [],
  name: 'currentEpoch',
  outputs: [{
    internalType: 'uint256',
    name: '',
    type: 'uint256',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const paused_abi = {
  inputs: [],
  name: 'paused',
  outputs: [{
    internalType: 'bool',
    name: '',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const pcsRounds_abi = {
  inputs: [{
    internalType: 'uint256',
    name: '',
    type: 'uint256',
  }],
  name: 'rounds',
  outputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'startTimestamp',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'lockTimestamp',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'closeTimestamp',
    type: 'uint256',
  }, {
    internalType: 'int256',
    name: 'lockPrice',
    type: 'int256',
  }, {
    internalType: 'int256',
    name: 'closePrice',
    type: 'int256',
  }, {
    internalType: 'uint256',
    name: 'lockOracleId',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'closeOracleId',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'totalAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'bullAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'bearAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'rewardBaseCalAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'rewardAmount',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'oracleCalled',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const pcsBetBear_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }],
  name: 'betBear',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
}
export const pcsBetBull_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }],
  name: 'betBull',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
}
export const pcsClaimable_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'user',
    type: 'address',
  }],
  name: 'claimable',
  outputs: [{
    internalType: 'bool',
    name: '',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const pcsRefundable_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'user',
    type: 'address',
  }],
  name: 'refundable',
  outputs: [{
    internalType: 'bool',
    name: '',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const pcsLedger_abi = {
  inputs: [{
    internalType: 'uint256',
    name: '',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: '',
    type: 'address',
  }],
  name: 'ledger',
  outputs: [{
    internalType: 'enum PancakePredictionV2.Position',
    name: 'position',
    type: 'uint8',
  }, {
    internalType: 'uint256',
    name: 'amount',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'claimed',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const pcsClaim_abi = {
  inputs: [{
    internalType: 'uint256[]',
    name: 'epochs',
    type: 'uint256[]',
  }],
  name: 'claim',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const predictionPcs_abis = [paused_abi, currentEpoch_abi, pcsRounds_abi, pcsBetBear_abi, pcsBetBull_abi, pcsClaimable_abi, pcsRefundable_abi, pcsLedger_abi, pcsClaim_abi]
export const predictionPcsLatestRoundData_abi = {
  inputs: [],
  name: 'latestRoundData',
  outputs: [{
    internalType: 'uint80',
    name: 'roundId',
    type: 'uint80',
  }, {
    internalType: 'int256',
    name: 'answer',
    type: 'int256',
  }, {
    internalType: 'uint256',
    name: 'startedAt',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'updatedAt',
    type: 'uint256',
  }, {
    internalType: 'uint80',
    name: 'answeredInRound',
    type: 'uint80',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const cgRounds_abi = {
  inputs: [{
    internalType: 'uint256',
    name: '',
    type: 'uint256',
  }],
  name: 'Rounds',
  outputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'bullAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'bearAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'rewardBaseCalAmount',
    type: 'uint256',
  }, {
    internalType: 'uint256',
    name: 'rewardAmount',
    type: 'uint256',
  }, {
    internalType: 'int256',
    name: 'lockPrice',
    type: 'int256',
  }, {
    internalType: 'int256',
    name: 'closePrice',
    type: 'int256',
  }, {
    internalType: 'uint32',
    name: 'startTimestamp',
    type: 'uint32',
  }, {
    internalType: 'uint32',
    name: 'lockTimestamp',
    type: 'uint32',
  }, {
    internalType: 'uint32',
    name: 'closeTimestamp',
    type: 'uint32',
  }, {
    internalType: 'uint32',
    name: 'lockPriceTimestamp',
    type: 'uint32',
  }, {
    internalType: 'uint32',
    name: 'closePriceTimestamp',
    type: 'uint32',
  }, {
    internalType: 'bool',
    name: 'closed',
    type: 'bool',
  }, {
    internalType: 'bool',
    name: 'cancelled',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const cgBetBear_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }],
  name: 'user_BetBear',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
}
export const cgBetBull_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }],
  name: 'user_BetBull',
  outputs: [],
  stateMutability: 'payable',
  type: 'function',
}
export const cgClaimable_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'user',
    type: 'address',
  }],
  name: 'claimable',
  outputs: [{
    internalType: 'bool',
    name: '',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const cgRefundable_abi = {
  inputs: [{
    internalType: 'uint256',
    name: 'epoch',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: 'user',
    type: 'address',
  }],
  name: 'refundable',
  outputs: [{
    internalType: 'bool',
    name: '',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const cgBets_abi = {
  inputs: [{
    internalType: 'uint256',
    name: '',
    type: 'uint256',
  }, {
    internalType: 'address',
    name: '',
    type: 'address',
  }],
  name: 'Bets',
  outputs: [{
    internalType: 'enum CandleGeniePredictionV3.Position',
    name: 'position',
    type: 'uint8',
  }, {
    internalType: 'uint256',
    name: 'amount',
    type: 'uint256',
  }, {
    internalType: 'bool',
    name: 'claimed',
    type: 'bool',
  }],
  stateMutability: 'view',
  type: 'function',
}
export const cgClaim_abi = {
  inputs: [{
    internalType: 'uint256[]',
    name: 'epochs',
    type: 'uint256[]',
  }],
  name: 'user_Claim',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}
export const predictionCg_abis = [paused_abi, currentEpoch_abi, cgRounds_abi, cgBetBear_abi, cgBetBull_abi, cgClaimable_abi, cgRefundable_abi, cgBets_abi, cgClaim_abi]