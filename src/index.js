const userURL = 'http://localhost:3000/api/v1/users/1'
const fetchUser = async () => {
  let res = await fetch(userURL)
  let user = await res.json()
  return user
}

document.addEventListener('DOMContentLoaded', () => {
  const sidenav = document.querySelector('.sidenav')
  const main = document.querySelector('.main')
  const saveButton = document.getElementById('save')
  const deleteButton = document.getElementById('delete')
  fetchUser().then(user => slapNotesOnSideBar(user.notes, sidenav))
  sidenav.addEventListener('click', event => {
    fetchUser().then(currentUser => {
      slapNotesOnMain(event, currentUser, main)
    })
  })
  saveButton.addEventListener('click', event => {
    fetchUser().then(currentUser => {
      submitChangesToContent(event, currentUser, main)
    })
  })
  deleteButton.addEventListener('click', event => {
    fetchUser().then(currentUser => {
      deleteNote(event, currentUser, main)
    })
  })
})

function slapNotesOnSideBar (elements, landing) {
  elements.forEach(element => {
    landing.innerHTML +=
      `<div id=${element.id}>
        <h4 class='title'>${element.title}</h4>
        <p class='hidden-body'>${element.body}</p>
      </div>`
  })
}

function slapNotesOnMain (event, user, lando) {
  let content = lando.children[0]
  let saveDelete = lando.children[1]
  const sideNav = document.querySelector('.sidenav')
  let target = event.target
  if (event.target.className === 'title') {
    content.innerHTML =
      `<div id=${target.parentNode.id}>
        <h4 class='title' contenteditable='true'>${target.innerText}</h4>
        <p contenteditable='true'>${target.parentNode.children[1].innerText}</p>
      </div>`
    saveDelete.style.display = 'inline'
  } else if (event.target.className === 'create') {
    fetch('http://localhost:3000/api/v1/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        'title': 'New Note',
        'body': '',
        'user_id': user.id
      })
    })
      .then(res => res.json())
      .then(note => {
        content.innerHTML =
          `<div id=${note.id}>
            <h4 class='title' contenteditable='true'>${note.title}</h4>
            <p contenteditable='true'>${note.body}</p>
          </div>`
        saveDelete.style.display = 'inline'
        sideNav.innerHTML +=
          `<div id=${note.id}>
            <h4 class='title'>${note.title}</h4>
            <p class='hidden-body'>${note.body}</p>
          </div>`
      })
  }
}

function submitChangesToContent (e, user, lando) {
  let content = lando.children[0].children[0]
  const sidenav = document.querySelector('.sidenav')
  const sideNavNotes = Array.from(sidenav.children)
  fetch('http://localhost:3000/api/v1/notes/' + content.id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      'id': content.id,
      'title': content.children[0].innerText,
      'body': content.children[1].innerText,
      'user': user
    })
  })
    .then(res => res.json())
    .then(note => {
      sideNavNotes.forEach(child => {
        if (parseInt(child.id) === note.id) {
          child.children[0].innerText = note.title
          child.children[1].innerText = note.body
        }
      })
    })
}

function deleteNote (e, user, lando) {
  let content = lando.children[0].children[0]
  let saveDelete = lando.children[1]
  const sidenav = document.querySelector('.sidenav')
  const sideNavNotes = Array.from(sidenav.children)
  fetch('http://localhost:3000/api/v1/notes/' + content.id,
    { method: 'DELETE' })
    .then(res => res.json())
    .then(result => {
      content.remove()
      saveDelete.style.display = 'none'
      sideNavNotes.forEach(child => {
        if (parseInt(child.id) === result.noteId) {
          child.remove()
        }
      })
    })
}
