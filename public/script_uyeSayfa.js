const tarihMetni=document.getElementById(`tarihMetin`);    

const gunler = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const isler = ["Öykü Yazma","","","Taahhüt","","Öykü Yazma","Öykü Yazma"];

const bugununTarihi = new Date();
let gun = gunler[bugununTarihi.getDay()];
let gunIs = isler[bugununTarihi.getDay()];

tarihMetni.textContent= bugununTarihi.toLocaleString("tr-TR");
tarihMetni.textContent+= `. Bugün ${gun}.`;
if (gunIs){tarihMetni.textContent+= ` ${gunIs} günü.`;}