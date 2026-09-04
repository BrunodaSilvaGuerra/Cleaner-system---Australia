(function(){
  const storageKey='cleanly-workspace-v1';
  function saveWorkspace(){
    const data={jobs,clients,team,invoices,clientRates,clientLocationData,teamProfiles,teamAbns,invoiceDetails,companyProfile};
    localStorage.setItem(storageKey,JSON.stringify(data));
  }
  let timer;
  function scheduleSave(){clearTimeout(timer);timer=setTimeout(saveWorkspace,120);}
  document.addEventListener('submit',scheduleSave,true);
  document.addEventListener('click',scheduleSave,true);
  window.addEventListener('beforeunload',saveWorkspace);
  window.addEventListener('pagehide',saveWorkspace);
  setInterval(saveWorkspace,3000);
  saveWorkspace();
}());
