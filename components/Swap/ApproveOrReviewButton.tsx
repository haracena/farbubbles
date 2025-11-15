import { MAX_ALLOWANCE } from '@/blockchain/constants'
import { useEffect } from 'react'
import { Address, erc20Abi } from 'viem'
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

export default function ApproveOrReviewButton({
  taker,
  onClick,
  sellTokenAddress,
  disabled,
  price,
}: {
  taker: Address
  onClick: () => void
  sellTokenAddress: Address
  disabled?: boolean
  price: any
}) {
  // Determine the spender from price.issues.allowance
  const spender = price?.issues?.allowance?.spender
  console.log('spender', spender)

  // 1. Read from erc20, check approval for the determined spender to spend sellToken
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [taker, spender],
    enabled: !!sellTokenAddress && !!taker && !!spender,
  })

  // 2. (only if no allowance): write to erc20, approve token allowance for the determined spender
  const { data } = useSimulateContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, MAX_ALLOWANCE],
    enabled: !!sellTokenAddress && !!taker && !!spender,
  })

  // Define useWriteContract for the 'approve' operation
  const {
    data: writeContractResult,
    writeContractAsync: writeContract,
    error,
  } = useWriteContract()

  // useWaitForTransactionReceipt to wait for the approval transaction to complete
  const { data: approvalReceiptData, isLoading: isApproving } =
    useWaitForTransactionReceipt({
      hash: writeContractResult,
    })

  // Call `refetch` when the transaction succeeds
  useEffect(() => {
    if (data) {
      refetchAllowance()
    }
  }, [data, refetchAllowance])

  // If price.issues.allowance is null, show the Review Trade button
  if (
    price?.issues?.allowance === undefined ||
    price?.issues?.allowance === null
  ) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // fetch data, when finished, show quote view
          onClick()
        }}
        className="w-full rounded-lg bg-blue-500 p-2 text-white"
      >
        {disabled ? 'Insufficient Balance' : 'Review Trade'}
      </button>
    )
  }

  if (error) {
    console.error('Error approving spender to spend sell token:', error)
    return (
      <button
        type="button"
        className="w-full rounded-lg bg-red-500 p-2 text-white"
      >
        Error
      </button>
    )
  }

  if (allowance === 0n) {
    return (
      <button
        type="button"
        className="w-full rounded-lg bg-blue-500 p-2 text-white"
        onClick={async () => {
          await writeContract({
            abi: erc20Abi,
            address: sellTokenAddress,
            functionName: 'approve',
            args: [spender, MAX_ALLOWANCE],
          })
          console.log('approving spender to spend sell token')

          refetchAllowance()
        }}
      >
        {isApproving ? 'Approving…' : 'Approve'}
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        // fetch data, when finished, show quote view
        onClick()
      }}
      className="w-full bg-blue-500 p-2 text-white not-odd:rounded-lg"
    >
      {disabled ? 'Insufficient Balance' : 'Review Trade'}
    </button>
  )
}
