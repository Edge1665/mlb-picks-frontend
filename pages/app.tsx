import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Row = {
  date: string
  playerId: number
  playerName: string
  team: string
  lineupSpot?: number | null
  hr_prob_pa_model: number
  hit_prob_pa_model: number
  hr_anytime_prob: number
  hits_1plus_prob: number
  hits_2plus_prob: number
}

type Tab = 'HR' | 'H1' | 'H2'

export default function AppPage(){
  const [rows, setRows] = useState<Row[]>([])
  const [status, setStatus] = useState<string>('loading…')
  const [tab, setTab] = useState<Tab>('HR')

  useEffect(()=>{
    const run = async () => {
      try {
        const sess = await supabase.auth.getSession()
        const token = sess.data.session?.access_token
        const base = process.env.NEXT_PUBLIC_API_BASE as string
        setStatus('fetching markets…')
        const res = await fetch(`${base}/markets`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setRows(data)
        setStatus('live (auto-refresh ~5 min)')
      } catch (e:any) {
        setStatus(`error: ${e.message || 'failed to load'}`)
      }
    }
    run()
    const id = setInterval(run, 5*60*1000)
    return ()=> clearInterval(id)
  }, [])

  const sorted = useMemo(()=>{
    const copy = [...rows]
    if (tab === 'HR') copy.sort((a,b)=> b.hr_anytime_prob - a.hr_anytime_prob)
    if (tab === 'H1') copy.sort((a,b)=> b.hits_1plus_prob - a.hits_1plus_prob)
    if (tab === 'H2') copy.sort((a,b)=> b.hits_2plus_prob - a.hits_2plus_prob)
    return copy
  }, [rows, tab])

  const fmt = (p:number)=> `${(p*100).toFixed(1)}%`

  const TabBtn = ({t,label}:{t:Tab,label:string}) => {
    const active = t===tab
    return (
      <button
        onClick={()=>setTab(t)}
        className="btn"
        style={{background: active ? '#2563eb' : '#334155'}}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Today’s Player Picks</div>
          <div className="subtitle">{status}</div>
        </div>
        <a className="badge" href="/" onClick={async (e)=>{e.preventDefault(); await supabase.auth.signOut(); location.href='/'}}>Sign out</a>
      </div>

      <div className="card" style={{marginBottom:12}}>
        <div className="title">How to read this</div>
        <div className="subtitle">
          • <b>HR Anytime</b>: chance the player hits ≥1 HR today.<br/>
          • <b>1+ Hits</b>: chance of at least one hit today.<br/>
          • <b>2+ Hits</b>: chance of two or more hits today.<br/>
          Values refresh automatically about every 5 minutes.
        </div>
      </div>

      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <TabBtn t="HR" label="HR Anytime" />
        <TabBtn t="H1" label="1+ Hits" />
        <TabBtn t="H2" label="2+ Hits" />
      </div>

      <div className="grid">
        {sorted.map((r)=> (
          <div className="card" key={r.playerId}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
              <div style={{fontWeight:700, fontSize:18}}>{r.playerName}</div>
              <div className="badge">{r.team}</div>
            </div>
            <div className="subtitle">Lineup spot: {r.lineupSpot ?? '—'}</div>

            {tab==='HR' && (
              <>
                <div className="subtitle">HR Anytime</div>
                <div style={{fontSize:24, fontWeight:800}}>{fmt(r.hr_anytime_prob)}</div>
                <div className="subtitle">Per-PA HR model: {fmt(r.hr_prob_pa_model)}</div>
              </>
            )}

            {tab==='H1' && (
              <>
                <div className="subtitle">1+ Hits</div>
                <div style={{fontSize:24, fontWeight:800}}>{fmt(r.hits_1plus_prob)}</div>
                <div className="subtitle">Per-PA Hit model: {fmt(r.hit_prob_pa_model)}</div>
              </>
            )}

            {tab==='H2' && (
              <>
                <div className="subtitle">2+ Hits</div>
                <div style={{fontSize:24, fontWeight:800}}>{fmt(r.hits_2plus_prob)}</div>
                <div className="subtitle">Per-PA Hit model: {fmt(r.hit_prob_pa_model)}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
