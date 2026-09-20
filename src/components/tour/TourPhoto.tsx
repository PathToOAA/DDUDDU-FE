import { ImageIcon } from "lucide-react";
import { useState } from "react";
export default function TourPhoto({src,alt,className=""}:{src?:string;alt:string;className?:string}) {
 const [failed,setFailed]=useState("");
 const safe = src && /^https?:\/\/(?:[a-z0-9-]+\.)*(?:visitkorea\.or\.kr|knto\.or\.kr)(?:\/|$)/i.test(src) ? src.replace(/^http:/,"https:") : "";
 return safe && failed!==safe ? <img src={safe} alt={alt} loading="lazy" className={className} onError={()=>setFailed(safe)} /> : <div className={`flex items-center justify-center gap-2 bg-[#eaf1eb] text-xs text-[#64796b] ${className}`}><ImageIcon size={22}/>등록된 사진이 없어요</div>;
}
