import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
export function useMotion(root: RefObject<HTMLElement|null>, key:string) {
 useLayoutEffect(()=>{
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const ctx=gsap.context(()=>{
    gsap.from('.hero-line > span',{yPercent:115,rotate:2,duration:1.1,stagger:.11,ease:'power4.out',delay:.12});
    gsap.from('.hero-visual',{clipPath:'inset(0 0 100% 0)',duration:1.2,delay:.35,ease:'power3.inOut'});
    gsap.from('.intro-mark',{opacity:0,y:12,duration:.7});
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{y:45,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach(el=>gsap.fromTo(el,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));
    gsap.fromTo('.scroll-progress',{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
   },root);
   return ()=>ctx.revert();
  });
  const refresh=()=>ScrollTrigger.refresh();
  document.fonts.ready.then(refresh);
  return ()=>mm.revert();
 },[key,root]);
}
