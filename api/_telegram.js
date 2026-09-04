const crypto=require('crypto');
function env(name){const value=process.env[name];if(!value)throw new Error(name+' is not configured');return value}
async function telegram(method,payload){const response=await fetch('https://api.telegram.org/bot'+env('TELEGRAM_BOT_TOKEN')+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!data.ok)throw new Error(data.description||'Telegram request failed');return data.result}
async function kv(command){const response=await fetch(env('KV_REST_API_URL'),{method:'POST',headers:{Authorization:'Bearer '+env('KV_REST_API_TOKEN'),'Content-Type':'application/json'},body:JSON.stringify(command)});const data=await response.json();if(data.error)throw new Error(data.error);return data.result}
async function setInvite(token,data){await kv(['SET','cleaner-invite:'+token,JSON.stringify(data),'EX',60*60*24*30])}
async function getInvite(token){const raw=await kv(['GET','cleaner-invite:'+token]);return raw?JSON.parse(raw):null}
async function getApplications(){const raw=await kv(['GET','cleaner-applications']);return raw?JSON.parse(raw):[]}
async function saveApplications(applications){await kv(['SET','cleaner-applications',JSON.stringify(applications)])}
function json(res,status,body){res.status(status).json(body)}
function makeToken(){return crypto.randomBytes(18).toString('base64url')}
module.exports={env,telegram,setInvite,getInvite,getApplications,saveApplications,json,makeToken};
