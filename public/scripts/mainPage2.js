function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
    document.getElementById("authorInput").focus();
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
    gosterilecekler.forEach(a=>a.style.display = "");
    // gosterilecekler.slice(0,10).forEach(a=>a.style.display = "");
    // if(gosterilecekler.length>10){
    //     document.getElementById("more-text").style.display="";
    // }
    // else{
    //     document.getElementById("more-text").style.display="none";
    // }    
}

function openRandom(){
    fetch('/api/rastgele')
    .then((response) => response.json())
    .then((data) => window.open(data, '_blank'));    
}

function weekNavigation(e){
    const weekInput = document.getElementById("weekInput");
    if(e.target !== e.currentTarget || !weekInput.checkValidity()|| weekInput.value==="")
    {
        return;
    }
    window.location.href="/hafta/"+weekInput.value;
}

function getWeek(e){
    if(e.key==="Enter"){
        e.preventDefault();
        document.getElementById("weekButton").click();
    }
}


document.getElementById("authorInput").addEventListener("keyup",filterFunction);
document.getElementById("yazarDugme").addEventListener("click",myFunction);
document.getElementById("randomButton").addEventListener("click",openRandom);
document.getElementById("weekButton").addEventListener("click",weekNavigation);
document.getElementById("weekInput").addEventListener("keypress",getWeek);