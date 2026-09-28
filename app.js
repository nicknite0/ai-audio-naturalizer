import { FFmpeg } from 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js';
import { fetchFile, toBlobURL } from 'https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js';

const $=s=>document.querySelector(s);
const file=$('#file'),drop=$('#drop'),video=$('#video'),thumb=$('#thumb'),placeholder=$('#placeholder'),meta=$('#meta'),empty=$('#empty'),processBtn=$('#process'),status=$('#status'),processedBtn=$('#processed'),originalBtn=$('#original'),download=$('#download');
const sliders=['strength','harsh','smooth','warm','level'];
let sourceFile=null,originalURL=null,processedURL=null,ffmpeg=null;

sliders.forEach(id=>{const el=$('#'+id),out=$('#'+id+'Out');el.addEventListener('input',()=>out.textContent=id==='level'?el.value+' dB':el.value)});
const presets={light:[30,35,25,20,0],natural:[60,70,50,40,0],strong:[85,90,75,60,-1]};
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('primary'));b.classList.add('primary');presets[b.dataset.preset].forEach((v,i)=>{const el=$('#'+sliders[i]);el.value=v;el.dispatchEvent(new Event('input'))})}));

function load(f){
 if(!f||!f.type.startsWith('video/'))return;
 sourceFile=f;if(originalURL)URL.revokeObjectURL(originalURL);originalURL=URL.createObjectURL(f);
 video.src=originalURL;thumb.src=originalURL;thumb.style.display='block';placeholder.style.display='none';empty.style.display='none';processBtn.disabled=false;processedBtn.disabled=true;download.hidden=true;
 video.onloadedmetadata=()=>{meta.innerHTML='<b>'+f.name+'</b><br>'+Math.round(f.size/1048576)+' MB<br>'+Math.round(video.duration)+' sec'};
 status.textContent='Clip loaded. Ready to naturalize the entire soundtrack.';
}
file.addEventListener('change',()=>load(file.files[0]));
drop.addEventListener('dragover',e=>{e.preventDefault();drop.style.borderColor='#159eff'});
drop.addEventListener('dragleave',()=>drop.style.borderColor='');
drop.addEventListener('drop',e=>{e.preventDefault();drop.style.borderColor='';load(e.dataTransfer.files[0])});

async function ensureFFmpeg(){
 if(ffmpeg)return;
 status.textContent='Loading local audio engine…';
 ffmpeg=new FFmpeg();
 ffmpeg.on('progress',({progress})=>{status.textContent='Naturalizing audio… '+Math.max(0,Math.min(100,Math.round(progress*100)))+'%'});
 const base='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
 await ffmpeg.load({coreURL:await toBlobURL(base+'/ffmpeg-core.js','text/javascript'),wasmURL:await toBlobURL(base+'/ffmpeg-core.wasm','application/wasm')});
}

function audioFilter(){
 const strength=+$('#strength').value/100, harsh=+$('#harsh').value/100, smooth=+$('#smooth').value/100, warm=+$('#warm').value/100, level=+$('#level').value;
 const highGain=-(1.0+4.0*harsh)*strength;
 const presence=-(0.5+2.2*harsh)*strength;
 const lowGain=(0.3+2.0*warm)*strength;
 const threshold=0.10+(1-smooth)*0.16;
 const ratio=1.5+smooth*2.5;
 const attack=12+smooth*18, release=120+smooth*180;
 let f='highpass=f=45,equalizer=f=250:t=q:w=0.8:g='+lowGain.toFixed(2)+',equalizer=f=3200:t=q:w=1.1:g='+presence.toFixed(2)+',equalizer=f=7000:t=q:w=0.9:g='+highGain.toFixed(2)+',acompressor=threshold='+threshold.toFixed(3)+':ratio='+ratio.toFixed(2)+':attack='+attack.toFixed(0)+':release='+release.toFixed(0);
 if($('#loudness').checked)f+=',loudnorm=I=-16:LRA=11:TP=-1.5';
 if(level!==0)f+=',volume='+level+'dB';
 if($('#clipping').checked)f+=',alimiter=limit=0.95';
 return f;
}

processBtn.addEventListener('click',async()=>{
 if(!sourceFile)return;
 processBtn.disabled=true;processedBtn.disabled=true;download.hidden=true;
 try{
  await ensureFFmpeg();
  await ffmpeg.writeFile('input.mp4',await fetchFile(sourceFile));
  await ffmpeg.exec(['-i','input.mp4','-map','0:v:0','-map','0:a:0','-c:v','copy','-af',audioFilter(),'-c:a','aac','-b:a','192k','-movflags','+faststart','output.mp4']);
  const data=await ffmpeg.readFile('output.mp4');
  if(processedURL)URL.revokeObjectURL(processedURL);
  processedURL=URL.createObjectURL(new Blob([data.buffer],{type:'video/mp4'}));
  processedBtn.disabled=false;download.hidden=false;download.href=processedURL;download.download=sourceFile.name.replace(/\.mp4$/i,'')+'-naturalized.mp4';
  video.src=processedURL;processedBtn.classList.add('primary');originalBtn.classList.remove('primary');
  status.textContent='Done. Processed the complete soundtrack; video stream was copied unchanged.';
 }catch(err){console.error(err);status.textContent='Processing failed: '+(err?.message||err)+'. Try Chrome/Edge and a short MP4 first.'}
 finally{processBtn.disabled=false}
});
originalBtn.addEventListener('click',()=>{if(!originalURL)return;const t=video.currentTime;video.src=originalURL;video.currentTime=t;originalBtn.classList.add('primary');processedBtn.classList.remove('primary');status.textContent='Original audio selected.'});
processedBtn.addEventListener('click',()=>{if(!processedURL)return;const t=video.currentTime;video.src=processedURL;video.currentTime=t;processedBtn.classList.add('primary');originalBtn.classList.remove('primary');status.textContent='Naturalized audio selected.'});