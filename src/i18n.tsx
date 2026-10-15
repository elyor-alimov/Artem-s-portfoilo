import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import * as en from './data/content';
import * as ru from './data/content.ru';
import { messages, type Message } from './data/messages';
export type Language = 'en' | 'ru';
const STORAGE_KEY = 'artem-portfolio-language';
function initialLanguage():Language {
 try { return localStorage.getItem(STORAGE_KEY)==='ru'?'ru':'en'; } catch { return 'en'; }
}
const Context=createContext<{
 language:Language; setLanguage:(language:Language)=>void; t:(key:Message)=>string;
 site:typeof en.site; projects:en.Project[]; expertise:typeof en.expertise; experience:typeof en.experience;
}|null>(null);
export function LanguageProvider({children}:{children:ReactNode}) {
 const [language,setLanguage]=useState<Language>(initialLanguage);
 const t=(key:Message):string=>language==='ru'?messages[key]:key;
 useLayoutEffect(()=>{
  document.documentElement.lang=language;
  try {localStorage.setItem(STORAGE_KEY,language);}catch{/* Language switching works when storage is disabled. */}
  const updateMeta=(selector:string,key:Message)=>document.querySelector(selector)?.setAttribute('content',t(key));
  updateMeta('meta[name="description"]','Artem Yugay — Brand & Marketing Manager in Tashkent. Integrated campaigns, brand experiences and end-to-end execution.');
  updateMeta('meta[property="og:title"]','Artem Yugay — Making brands matter');
  updateMeta('meta[property="og:description"]','Selected work across automotive, finance and live experiences. Strategy, creativity and execution.');
 },[language]);
 const content=language==='ru'?ru:en;
 return <Context.Provider value={{language,setLanguage,t,site:content.site,projects:content.projects,expertise:content.expertise,experience:content.experience}}>{children}</Context.Provider>;
}
export function useLocale(){const context=useContext(Context);if(!context)throw new Error('LanguageProvider is required');return context;}
