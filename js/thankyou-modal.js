(function(){
  const S={isOpen:false,qrVisible:false,lastActive:null,nodes:{},opts:{}};
  const COPY={
    title:'🎉 Arquivos prontos!',
    l1:'Espero que essa ferramenta tenha te ajudado a economizar um tempinho hoje.',
    l2:'Se ela te poupou horas (ou dores de cabeça 😅), que tal me dar uma força pra manter o projeto?',
    show:'🩵 Mostrar QR Code para ajudar',
    copy:'Copiar chave Pix',
    helped:'✅ Já ajudei / Só quero baixar',
    footer:'Obrigado por usar o site! Que sua próxima numeração seja ainda mais rápida 😄',
    how:'Copiar chave Pix',
    howTxt:'A doação é opcional e ajuda a manter a ferramenta online e evoluir novas funções.'
  };
  const el=(t,c,a={})=>{const e=document.createElement(t);if(c)e.className=c;
    for(const[k,v]of Object.entries(a)){if(k==='text')e.textContent=v;else e.setAttribute(k,v)}return e};
  const placeholderQR=()=> 'data:image/svg+xml;utf8,'+encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
      <rect width="100%" height="100%" fill="#f2f2f2"/><g fill="#ccc">
      ${Array.from({length:10}).map((_,i)=>Array.from({length:10}).map((_,j)=>((i+j)%2===0?`<rect x="${j*22}" y="${i*22}" width="22" height="22"/>`:``)).join('')).join('')}
      </g><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#777">QR Code</text></svg>`
  );
  const ping=(ev,p={})=>{
    if(window.dataLayer?.push)window.dataLayer.push({event:ev,...p});
    else console.log('[thankyou]',ev,p);
  };
  const trap=(root)=>{
    const f=root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first=f[0], last=f[f.length-1];
    const onKey=(e)=>{
      if(e.key==='Tab'){
        if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
      }else if(e.key==='Escape'){e.preventDefault();closeThankYouSupportModal();}
    };
    root.addEventListener('keydown',onKey);
    return ()=>root.removeEventListener('keydown',onKey);
  };
  function render(){
    const c={...COPY, ...(S.opts.copy||{})};
    const backdrop=el('div','tys-backdrop',{'data-tys':'backdrop'});
    const modal=el('div','tys-modal',{role:'dialog','aria-modal':'true','aria-labelledby':'tys-title','aria-describedby':'tys-desc'});
    const header=el('div','tys-header');
    const title=el('h2','tys-title',{id:'tys-title',text:c.title,tabindex:'-1'});
    const btnX=el('button','tys-close',{'aria-label':'Fechar',title:'Fechar (Esc)'}); btnX.textContent='✕';
    header.append(title,btnX);

    const body=el('div','tys-body',{id:'tys-desc'});
    body.append(el('p',null,{text:c.l1}), el('p','tys-muted',{text:c.l2}));

    const row=el('div','tys-row');
    const how=el('button','tys-link',{type:'button',text:c.how});
    row.append(how);

    const qr=el('div','tys-qr');
    const qrImg=el('img','tys-qr-img',{alt:'QR Code para contribuição', src:S.opts.qrImageUrl||placeholderQR()});
    const key=el('div','tys-key'); key.textContent=S.opts.paymentKey||'';
    qr.append(qrImg,key);

    const actions=el('div','tys-actions');
    const b1=el('button','tys-btn tys-btn-primary',{type:'button',text:c.show});
    const b2=el('button','tys-btn tys-btn-outline',{type:'button',text:c.helped});
    actions.append(b1,b2);

    const foot=el('div','tys-footer'); foot.textContent=c.footer;

    body.append(row,qr,actions,foot); modal.append(header,body); backdrop.append(modal);

    backdrop.addEventListener('click',(e)=>{if(e.target===backdrop)closeThankYouSupportModal();});
    btnX.addEventListener('click',()=>closeThankYouSupportModal());
    
    how.addEventListener('click',async()=>{
        if(S.opts.paymentKey){
            try{ await navigator.clipboard.writeText(S.opts.paymentKey);
              const old=how.textContent; how.textContent='Chave copiada!'; ping('thankyou_copy_key',{len:S.opts.paymentKey.length}); S.opts.onCopyKey?.();
              setTimeout(()=>how.textContent=old,1800);
            }catch{ alert('Não foi possível copiar. Copie manualmente no campo abaixo.'); }
        }
    });

    b1.addEventListener('click',()=>{
      if(!S.qrVisible){
        S.qrVisible=true; qr.classList.add('tys-visible');
        b1.setAttribute('aria-pressed','true'); ping('thankyou_show_qr'); S.opts.onShowQR?.();
      }
    });
    b2.addEventListener('click',()=>{ ping('thankyou_helped'); S.opts.onHelped?.(); closeThankYouSupportModal(); });

    const root=S.opts.container?.nodeType===1?S.opts.container:document.body;
    root.appendChild(backdrop);
    S.nodes={backdrop,modal,title};
    requestAnimationFrame(()=>backdrop.classList.add('tys-open'));
    title.focus();
    S.untrap=trap(modal);
    const onEsc=(e)=>{if(e.key==='Escape')closeThankYouSupportModal();};
    document.addEventListener('keydown',onEsc); S.offEsc=()=>document.removeEventListener('keydown',onEsc);
    ping('thankyou_open'); S.opts.onShow?.();
  }
  window.openThankYouSupportModal=function(options={}){
    if(S.isOpen) return;
    S.isOpen=true; S.qrVisible=false; S.opts=options; S.lastActive=document.activeElement; render();
  };
  window.closeThankYouSupportModal=function(){
    if(!S.isOpen) return; S.isOpen=false;
    const {backdrop}=S.nodes; if(backdrop?.parentNode){backdrop.classList.remove('tys-open'); setTimeout(()=>{backdrop.parentNode?.removeChild(backdrop)},200);}
    S.untrap?.(); S.offEsc?.(); S.lastActive?.focus?.(); ping('thankyou_close'); S.opts.onClose?.(); S.nodes={}; S.opts={};
  };
  // helper opcional para seu fluxo de download
  window.showSupportThenDownload=function(downloadUrl, opts={}){
    openThankYouSupportModal({
      ...opts,
      onHelped:()=>{ opts.onHelped?.(); if(downloadUrl) window.location.href=downloadUrl; }
    });
  };
})();