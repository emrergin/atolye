const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const satirlar= document.querySelectorAll(`tr`);
satirlar.forEach((satir)=>{
  if (satir.previousElementSibling!== null){
    if (satir.previousElementSibling.children[2].textContent !== satir.children[2].textContent){
      satir.style.backgroundColor=`rgb(${randomBetween(220,255)},${randomBetween(220,255)},${randomBetween(220,255)})`;
    }
    else{
      satir.style.backgroundColor=satir.previousElementSibling.style.backgroundColor;
    }
  }
});

const siraDugme=document.getElementById(`haftaBaslik`);
const satirSayisi=document.getElementById("oykuTablosu").children[0].childElementCount-1;
if (satirSayisi>1){
  document.getElementById(`sayiMetin`).textContent="Öykü Sayısı: "+satirSayisi;
}

function siralamaDegistir(){  
  if (siraDugme.textContent==="Hafta ▲"){
      siraDugme.textContent="Hafta ▼";
  }else if(siraDugme.textContent==="Hafta ▼"){
    siraDugme.textContent="Hafta ▲";
  } 
  reverseTable();
}  

function reverseTable() {
  var table = document.getElementById("oykuTablosu");
  var trContent = [];
  for (var i = 1, row; row = table.rows[i]; i++) {
    trContent.push(row.innerHTML);
  }
  trContent.reverse()
  for (var i = 1, row; row = table.rows[i]; i++) {
    row.innerHTML = trContent[i];
  }
}