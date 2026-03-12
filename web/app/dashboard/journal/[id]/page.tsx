import TradeDetailClient from './client-page'
export default function TradeDetailPage({ params }: { params: { id: string } }) {
  return <TradeDetailClient id={params.id} />
}
