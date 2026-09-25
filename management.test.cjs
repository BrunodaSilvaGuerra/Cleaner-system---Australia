const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function app(initial={},route='vehicles') {
  const nodes={}, storage={}; const node=s=>nodes[s]??=( {innerHTML:'',value:'',textContent:'',style:{},showModal(){this.open=true;},close(){this.open=false;}} );
  const context={document:{querySelector:node},localStorage:{getItem:()=>JSON.stringify({vehicles:[],maintenance:[],transactions:[],employees:[],shifts:[],timesheets:[],...initial}),setItem:(k,v)=>storage[k]=JSON.parse(v)},location:{hash:'#vehicles'},window:{addEventListener(){}},crypto:require('node:crypto').webcrypto,FormData:class{constructor(v){return Object.entries(v);}},setTimeout(){},Intl,Date,console};
  context.location.hash='#'+route;
  vm.runInNewContext(fs.readFileSync('management.js','utf8'),context);
  return {nodes,storage,context,submit:r=>node('#recordForm').onsubmit({preventDefault(){},target:r})};
}
test('vehicle saves, escapes user input and rejects duplicate registration',()=>{
  const a=app(); const r={name:'<img src=x>',plate:'abc123',state:'NSW',odometer:'100',rego:'2027-01-01',status:'Active'};
  a.submit(r);assert.equal(a.storage['cleanly-management-v1'].vehicles[0].plate,'ABC123');assert.match(a.nodes['#rows'].innerHTML,/&lt;img/);
  a.submit(r);assert.match(a.nodes['#error'].textContent,/already exists/);assert.equal(a.storage['cleanly-management-v1'].vehicles.length,1);
});
test('saved records render on startup and filtering removes unmatched rows',()=>{
  const a=app({vehicles:[{id:'v1',name:'Van',plate:'ABC',state:'WA',status:'Active'}]});assert.match(a.nodes['#rows'].innerHTML,/Van/);
  a.nodes['#search'].oninput({target:{value:'missing'}});assert.match(a.nodes['#rows'].innerHTML,/No matching/);
});
test('negative odometer is rejected',()=>{
  const a=app();a.submit({name:'Van',plate:'ABC',state:'WA',odometer:'-1',rego:'2027-01-01',status:'Active'});assert.match(a.nodes['#error'].textContent,/non-negative/);assert.equal(Object.keys(a.storage).length,0);
});
test('overlapping shifts are rejected but adjacent shifts are saved',()=>{
  const a=app({shifts:[{id:'s1',employee:'e1',name:'Office',date:'2026-09-25',start:'09:00',end:'12:00',status:'Published'}]},'shifts');
  const r={employee:'e1',name:'Office',date:'2026-09-25',start:'11:00',end:'13:00',status:'Draft'};
  a.submit(r);assert.match(a.nodes['#error'].textContent,/overlapping/);
  a.submit({...r,start:'12:00'});assert.equal(a.storage['cleanly-management-v1'].shifts.length,2);
});
test('timesheets reject invalid breaks and calculate net worked hours',()=>{
  const a=app({},'timesheets');const r={employee:'e1',date:'2026-09-25',start:'09:00',end:'12:00',break:'190',status:'Pending'};
  a.submit(r);assert.match(a.nodes['#error'].textContent,/Break/);
  a.submit({...r,break:'30'});assert.match(a.nodes['#rows'].innerHTML,/2.50/);
});
test('finance calculates inclusive GST for taxable transactions',()=>{
  const a=app({},'transactions');a.submit({name:'Service',contact:'Client',type:'Income',amount:'100',tax:'10% GST',date:'2026-09-25',due:'2026-09-30',status:'Paid'});
  assert.match(a.nodes['#rows'].innerHTML,/110.00/);assert.match(a.nodes['#content'].innerHTML,/10.00/);
});
