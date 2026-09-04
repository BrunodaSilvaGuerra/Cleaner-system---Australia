const teamAbns=savedWorkspace.teamAbns||[];
const abnField=document.createElement('label');abnField.className='team-only';abnField.innerHTML='ABN <input id="teamAbn" inputmode="numeric" maxlength="14" placeholder="12 345 678 901" />';document.querySelector('#teamRate').closest('label').before(abnField);
document.querySelectorAll('.edit-team').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#teamAbn').value=teamAbns[+button.dataset.index]}));
document.querySelector('.edit-modal').addEventListener('submit',()=>{if(editTarget?.kind==='team')teamAbns[editTarget.index]=document.querySelector('#teamAbn').value});
