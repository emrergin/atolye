const tarihMetni=document.getElementById(`tarihMetin`);  

const bugununTarihi = new Date();

tarihMetni.textContent= bugununTarihi.toLocaleString("tr-TR", {year: 'numeric', month: 'long', 
day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit'});

const gorevKutu=document.getElementById("gorevMetni");
if (gorevKutu){
    gorevKutu.innerHTML=gorevKutu.textContent;
    var linkText = document.querySelector(`#gorevMetni a`);
    if (linkText){
    linkText.style="text-decoration: underline;color:#5656A5;";
    }    
}

const yorumYuzdeKutusu=document.getElementById("yorumYuzdesiSayisi");
if (yorumYuzdeKutusu){
    const yorumYuzdesi = yorumYuzdeKutusu.dataset.yuzde;
    let yorumYuzdeKutusuDegerO=Math.max((Math.round(yorumYuzdesi*100)-60)/40,0);  
    yorumYuzdeKutusu.style.color = `rgb(${200*(1-yorumYuzdeKutusuDegerO)}, ${200*(yorumYuzdeKutusuDegerO)}, 0)`;
}

const onaycekbokslari = document.querySelectorAll('.onayladimBox');

onaycekbokslari.forEach((boks) => {
    boks.truth=true;
    boks.addEventListener('change', onayladim);
});

const onaylamacekbokslari = document.querySelectorAll('.onaylamadimBox');

onaylamacekbokslari.forEach((boks) => {
    boks.truth=false;
    boks.addEventListener('change', onayladim);
});


function yazcam(){
    const someData = {
    title: "katilim beyani",
    katilim : document.querySelector('input[name="katilim"]:checked').value
    }    

    const putMethod = {
    method: 'PUT', // Method itself
    headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
    },
    body: JSON.stringify(someData)
    }

    fetch(`/uyeSayfa/yazcam`,putMethod)
    .then(() =>location.reload())
    .catch(err => console.log(err)); // Do something with the error
}

function yorumladim(){
    if(event.target.checked){
    event.target.nextElementSibling.style.visibility = "visible";
    }
    else
    {
    event.target.nextElementSibling.style.visibility = "hidden";
    }
}

function yorumladimOnay(){    
    const someData = {
    title: "yorumlama beyani",
    yorumladim : true
    }    

    const putMethod = {
    method: 'PUT', // Method itself
    headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
    },
    body: JSON.stringify(someData)
    }
    fetch(`/uyeSayfa/yorumladim/${event.target.dataset.yorumid}`,putMethod)
    .then(() =>location.reload())
    .catch(err => console.log(err)); // Do something with the error
}

function onayladim(){
    document.querySelector(`button[data-yorumid='${event.target.dataset.yorumid}']`).style.visibility = "visible";
}

function onayladimOnay(){
    deger= document.querySelector('input[name="onay"]:checked').value;
    
    const someData = {
    title: "onaylama beyani",
    onayladim : deger
    }    

    const putMethod = {
    method: 'PUT', // Method itself
    headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
    },
    body: JSON.stringify(someData)
    }
    fetch(`/uyeSayfa/onayladim/${event.target.dataset.yorumid}`,putMethod)
    .then(() =>location.reload())
    .catch(err => console.log(err)); // Do something with the error
}

function yeniTaslak(){

    const someData = {
    content: null
    }  

    const putMethod = {
    method: 'PUT', // Method itself
    headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
    },
    body: JSON.stringify(someData)
    }
    fetch(`/uyeSayfa/yeniTaslak`,putMethod)
    .then(() =>location.reload())
    .catch(err => console.log(err)); // Do something with the error
}

function taslakSil(){
    let param = event.target.getAttribute('data-draft-id');
    const putMethod = {
    method: 'DELETE', // Method itself
    headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
    }
    }
    fetch(`/uyeSayfa/yeniTaslak/${param}`,putMethod)
    .then(() =>location.reload())
    .catch(err => console.log(err)); // Do something with the error
}

//hydrate uyeStatus
document.getElementById("radio-one")?.addEventListener("change", yazcam);
document.getElementById("radio-two")?.addEventListener("change", yazcam);

document.querySelectorAll('.yorumladimBox').forEach(box=>{
    box.addEventListener("change",yorumladim);
})

document.querySelectorAll('.onayOnay').forEach(box=>{
    box.addEventListener("click",onayladimOnay);
})

document.querySelectorAll('.yorumOnay').forEach(box=>{
    box.addEventListener("click",yorumladimOnay);
})

document.getElementById("newDraft").addEventListener("click",yeniTaslak); 
document.querySelectorAll('.deleteDraft').forEach(button=>{
    button.addEventListener("click",taslakSil);
})