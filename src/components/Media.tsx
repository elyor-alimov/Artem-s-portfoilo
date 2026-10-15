import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
export const asset = (path:string) => `${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
export function Media({src,alt,priority=false,contain=false,className=''}:{src?:string;alt:string;priority?:boolean;contain?:boolean;className?:string}) {
 const [failed,setFailed] = useState(false);
 useEffect(()=>setFailed(false),[src]);
 return <div className={`media ${contain?'contain':''} ${className}`}>
  {src && !failed ? <img src={asset(src)} alt={alt} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'} onError={()=>setFailed(true)}/> : <div className="media-fallback" role="img" aria-label={`${alt} — visual placeholder`}><span className="fallback-grid"/><span className="mono">VISUAL ARCHIVE / COMING INTO FOCUS</span><strong>{alt}</strong><span className="mono">CAMPAIGN MATERIAL TO FOLLOW ↗</span></div>}
 </div>;
}
export function Video({src,poster,title,loop=false}:{src?:string;poster?:string;title:string;loop?:boolean}) {
 const ref=useRef<HTMLVideoElement>(null); const [visible,setVisible]=useState(false); const [failed,setFailed]=useState(false); const [playing,setPlaying]=useState(false);
 const holder=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!holder.current)return;const ob=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)setVisible(true);else ref.current?.pause();},{rootMargin:'200px'});ob.observe(holder.current);return()=>ob.disconnect();},[]);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const stop=()=>{if(mq.matches)ref.current?.pause();};mq.addEventListener('change',stop);return()=>mq.removeEventListener('change',stop);},[]);
 return <div ref={holder} className="video-block">{src&&!failed?<><video ref={ref} src={visible?asset(src):undefined} poster={poster?asset(poster):undefined} preload="none" muted playsInline controls loop={loop} onError={()=>setFailed(true)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} aria-label={title}/><button className="video-toggle" onClick={()=>{if(ref.current){if(playing)ref.current.pause();else void ref.current.play().catch(()=>setFailed(true));}}}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Play film'}</button></>:<><Media src={poster} alt={title}/><div className="video-caption"><Play size={18}/><span>Campaign film<span className="mono">EDITABLE VIDEO SLOT · ORIGINAL FOOTAGE TO FOLLOW</span></span></div></>}</div>;
}
