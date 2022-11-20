let sira=1;
let renkIndis=0;

const satirlar= document.querySelectorAll(`tr`);
const haftaDrop=document.getElementById("haftaSec");
const yazarDrop=document.getElementById("yazarSec");
satirlar.forEach((satir,index)=>{
  if (haftaDrop.value!==`/` || yazarDrop.value!==`/`){
    if (satir.previousElementSibling!== null){    
      renkIndis++;
      renkIndis=(renkIndis-1)%3+1; 
      satir.classList.add(`renk${renkIndis}`);
    }
  }
  else{
    if (satir.previousElementSibling!== null){        
      if (satir.previousElementSibling.children[2].textContent !== satir.children[2].textContent){
        renkIndis++;
        renkIndis=(renkIndis-1)%3+1;        
      }        
      satir.classList.add(`renk${renkIndis}`);
      if (index%2===0){
        satir.classList.add(`cift`);
      }
    }
  }
});


if (document.getElementById("oykuTablosu")){
  const satirSayisi=document.getElementById("oykuTablosu").children[0].childElementCount-1;
  if (satirSayisi>1){
    document.getElementById(`sayiMetin`).textContent="Öykü Sayısı: "+satirSayisi;
  }
}  

function siralamaDegistir(){   
  const siraDugme=document.getElementById(`haftaBaslik`);   
  if (sira===1){
    siraDugme.textContent="Hafta ▼";
  }else{
    siraDugme.textContent="Hafta ▲";
  } 
  sira=-sira;
  reverseTable();
}  

function reverseTable() {
  var table = document.getElementById("oykuTablosu");
  var trContent = [];
  for (let i = 1; i < table.rows.length; i++) {
    trContent.push(table.rows[i].innerHTML);
  }
  trContent.reverse();
  for (let i = 1; i < table.rows.length; i++) {
    table.rows[i].innerHTML = trContent[i-1];
  }
}

document.getElementById("haftaSec").addEventListener("change",(event)=>{window.location.href=event.target.value});
document.getElementById("yazarSec").addEventListener("change",(event)=>{window.location.href=event.target.value});
document.getElementById("randomButton").addEventListener("click",()=>{window.location.href='/rastgele'}); 
document.getElementById("haftaBaslik").addEventListener("click",siralamaDegistir); 