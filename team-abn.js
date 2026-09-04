const teamAbns=['12 345 678 901','23 456 789 012','34 567 890 123','45 678 901 234','56 789 012 345','67 890 123 456'];
const abnField=document.createElement('label');abnField.className='team-only';abnField.innerHTML='ABN <input id="teamAbn" inputmode="numeric" maxlength="14" placeholder="12 345 678 901" />';document.querySelector('#teamRate').closest('label').before(abnField);
document.querySelectorAll('.edit-team').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#teamAbn').value=teamAbns[+button.dataset.index]}));
document.querySelector('.edit-modal').addEventListener('submit',()=>{if(editTarget?.kind==='team')teamAbns[editTarget.index]=document.querySelector('#teamAbn').value});
