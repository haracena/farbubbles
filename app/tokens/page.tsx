import { TokensDataTable } from '@/components/Tokens/DataTable'

export default function TokensPage() {
  return (
    <main className="container mx-auto px-4 pt-6 pb-20">
      <div className="">
        <h1 className="text-2xl font-bold text-white">Tokens</h1>
        <p className="mt-1 text-neutral-400">
          Press on the token to see more details
        </p>
      </div>
      <TokensDataTable />
    </main>
  )
}
