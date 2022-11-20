function tatilEt(){   
    let confirmAction = confirm("Haftayı tatil etmek istediğine emin misin?");
    if (!confirmAction){return false;}
    const putMethod = {
      method: 'PUT', // Method itself
      headers: {
        'Content-type': 'application/json  ; charset=UTF-8' // Indicates the content 
      }
    }

    fetch(`/uyeSayfa/haftaTatili`,putMethod)
      .catch(err => console.log(err)); // Do something with the error
}

document.getElementById("vacationButton")?.addEventListener("click",tatilEt);