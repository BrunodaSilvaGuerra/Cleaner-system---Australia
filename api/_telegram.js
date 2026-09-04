const crypto=require('crypto');
function env(name){const value=process.env[name];if(!value)throw new Error(name+' is not configured');return value}
async function telegram(method,payload){const response=await fetch('https://api.telegram.org/bot'+env('TELEGRAM_BOT_TOKEN')+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();if(!data.ok)throw new Error(data.description||'Telegram request failed');return data.result}
async function kv(command){const url=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;const token=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;if(!url||!token)throw new Error('KV_REST_API_URL (or UPSTASH_REDIS_REST_URL) is not configured');const response=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command)});const data=await response.json();if(data.error)throw new Error(data.error);return data.result}
async function setInvite(token,data){await kv(['SET','cleaner-invite:'+token,JSON.stringify(data),'EX',60*60*24*30])}
async function getInvite(token){const raw=await kv(['GET','cleaner-invite:'+token]);return raw?JSON.parse(raw):null}
async function getApplications(){const raw=await kv(['GET','cleaner-applications']);return raw?JSON.parse(raw):[]}
async function saveApplications(applications){await kv(['SET','cleaner-applications',JSON.stringify(applications)])}
async function addApplication(application){const applications=await getApplications();applications.unshift(application);await saveApplications(applications)}
async function setRegistration(chatId,data){await kv(['SET','cleaner-registration:'+chatId,JSON.stringify(data),'EX',60*60*24])}
async function getRegistration(chatId){const raw=await kv(['GET','cleaner-registration:'+chatId]);return raw?JSON.parse(raw):null}
async function deleteRegistration(chatId){await kv(['DEL','cleaner-registration:'+chatId])}
function json(res,status,body){res.status(status).json(body)}
function makeToken(){return crypto.randomBytes(18).toString('base64url')}
module.exports={env,telegram,setInvite,getInvite,getApplications,saveApplications,addApplication,setRegistration,getRegistration,deleteRegistration,json,makeToken};
