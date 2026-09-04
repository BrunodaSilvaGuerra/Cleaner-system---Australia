// The workspace starts empty only once. Afterwards, it restores the records saved in this browser.
const empty=(icon,title,copy,action='')=>`<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${copy}</p>${action}</div>`;
if(!jobs.length){
  document.querySelector('#todayJobs').innerHTML=empty('◷','No jobs scheduled today','Create your first job to start building today’s schedule.','<button class="new-job">+ New job</button>');
  document.querySelector('#jobsTable').innerHTML=`<tr class="empty-table"><td colspan="6">${empty('◷','No jobs yet','Add a client and cleaner, then create your first scheduled job.')}</td></tr>`;
}
if(!clients.length)document.querySelector('#clientsTable').innerHTML=`<tr class="empty-table"><td colspan="7">${empty('♙','No clients yet','Add your first client to begin scheduling cleaning services.','<button class="new-job">+ Add client</button>')}</td></tr>`;
if(!team.length){
  document.querySelector('#teamGrid').innerHTML=empty('♧','No cleaners yet','Add a cleaner to manage availability, Telegram and attendance.','<button class="new-job">+ Add cleaner</button>');
  document.querySelector('.stat-card:nth-child(3) .neutral').textContent='No team members added';
}
if(!invoices.length)document.querySelector('#invoicesTable').innerHTML=`<tr class="empty-table"><td colspan="7">${empty('$','No invoices yet','Invoices will appear here once you record completed jobs.')}</td></tr>`;
document.querySelector('#attentionList').innerHTML=empty('✓','All caught up','There are no approvals or operational items waiting for you.');
document.querySelectorAll('#jobs .table-tabs button,#invoices .table-tabs button').forEach(button=>button.textContent=button.textContent.replace(/\s*\d+\s*/,' '));
document.querySelectorAll('.new-job').forEach(button=>button.addEventListener('click',()=>{if(button.textContent.includes('client'))showView('clients');else if(button.textContent.includes('cleaner'))showView('team');else modal.classList.add('open')}));
