const modaleVisite = document.getElementById('modale')
const backdropModale = document.getElementById('backdropModal')
const closeButton = document.getElementById('closeModal')
const openModalBtn = document.getElementById('openModal')

openModalBtn.addEventListener('click', ()=>{
  modaleVisite.style.display = 'block';
  backdropModale.style.display = 'block';
})

closeButton.addEventListener('click', () => {
  modaleVisite.style.display = 'none';
  backdropModale.style.display = 'none';
})


