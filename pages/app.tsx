import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Row = {
  date: string
  playerId: number
  playerName: string
  team: string
  hr_prob_pa: number
  hit_prob_pa: number
  hr_edge_vs_market?: number | null
  hit_edge_vs_market?: number | null
}

export default function AppPage(){
  const [rows, setRows] = useState<Row[]>([])
  const [status, setStatus] = useState<string>('connecting...')

  useEffect(()=>{
    const run = async () => {
      const sess = await supabase.auth.getSession()
      const token = sess.data.session?.access_token
      const base = process.env.NEXT_PUBLIC_API_BASE as string
      const wsurl = process.env.NEXT_PUBLIC_WS_URL as string
      try {
        const res = await fetch(`${base}/predictions`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        const data = await res.json()
        setRows(data)
      } catch (e:any) {
        setStatus('failed to fetch initial data')
      }
      try {
        const ws = new WebSocket(wsurl)
        ws.onopen = ()=> setStatus('live updates connected')
        ws.onmessage = (ev)=>{
          const data = JSON.parse(ev.data)
          setRows(data)
        }
        ws.onclose = ()=> setStatus('live disconnected')
        return ()=> ws.close()
      } catch (e:any) {
        setStatus('websocket error')
      }
    }
    run()
  }, [])

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Today&apos;s Picks (HR & Hits)</div>
          <div className="subtitle">{status}</div>
        </div>
        <a className="badge" href="/" onClick={async (e)=>{e.preventDefault(); await supabase.auth.signOut(); location.href='/'}}>Sign out</a>
      </div>
      <div className="grid">
        {rows.map((r)=> (
          <div className="card" key={r.playerId}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:700}}>{r.playerName}</div>
                <div className="subtitle">{r.team}</div>
              </div>
              <div className="badge">{r.date}</div>
            </div>
            <div style={{display:'flex', gap:16, marginTop:8}}>
              <div>
                <div className="subtitle">HR prob / PA</div>
                <div style={{fontSize:20, fontWeight:700}}>{(r.hr_prob_pa*100).toFixed(1)}%</div>
                {r.hr_edge_vs_market!=null && <div className="subtitle">Edge: {(r.hr_edge_vs_market*100).toFixed(1)}%</div>}
              </div>
              <div>
                <div className="subtitle">Hit prob / PA</div>
                <div style={{fontSize:20, fontWeight:700}}>{(r.hit_prob_pa*100).toFixed(1)}%</div>
                {r.hit_edge_vs_market!=null && <div className="subtitle">Edge: {(r.hit_edge_vs_market*100).toFixed(1)}%</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
