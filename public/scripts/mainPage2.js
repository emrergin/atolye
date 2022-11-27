function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
    filterFunction() ;
}
  
function filterFunction() {
    const dropdownContainer = document.getElementById("myDropdown");
    const allAuthorLinks = dropdownContainer.getElementsByTagName("a");
    const input = document.getElementById("authorInput");
    const filter = input.value.toUpperCase();
    const gosterilecekler = [];
    for (let i = 0; i < allAuthorLinks.length; i++) {
        const txtValue = allAuthorLinks[i].textContent || allAuthorLinks[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            allAuthorLinks[i].style.display = "none";
            gosterilecekler.push(allAuthorLinks[i]);
        } else {
            allAuthorLinks[i].style.display = "none";
        }
    }
    
    gosterilecekler.slice(0,10).forEach(a=>a.style.display = "");
    if(gosterilecekler.length>10){
        document.getElementById("more-text").style.display="";
    }
    else{
        document.getElementById("more-text").style.display="none";
    }    
}

function openRandom(){
    fetch('/api/rastgele')
    .then((response) => response.json())
    .then((data) => window.open(data, '_blank'));    
}

function weekNavigation(e){
    if(e.target !== e.currentTarget) return;
    // console.log(document.getElementById("weekInput").value);
    window.location.href="/hafta/"+document.getElementById("weekInput").value;
}


document.getElementById("authorInput").addEventListener("keyup",filterFunction);
document.getElementById("yazarDugme").addEventListener("click",myFunction);
document.getElementById("randomButton").addEventListener("click",openRandom);
document.getElementById("weekButton").addEventListener("click",weekNavigation);