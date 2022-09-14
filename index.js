
const todoDesc = document.querySelector('#todo-description');
const severity = document.querySelector('#select-severity');
const addTodoBtn = document.querySelector('#add-todo');
const formAddTodo = document.querySelector('#form');
const loading = document.querySelector('#loading');
const btnDeleteTodo = document.querySelector('.btn.btn-danger');
const search = document.querySelector('#search');
const filterAll = document.querySelector('.filter-all');
const filterOpen = document.querySelector('.filter-open');
const filterClose = document.querySelector('.filter-close');
const todoOrder = document.querySelector('#todo-order');

const endpoint = 'https://tony-json-server.herokuapp.com/api/todos';

// render
function renderTodo(page = 1, limit = 5) {
    search.value = '';
    loading.classList.add('loading');
    fetch(`${endpoint}/?_page=${page}&_limit=${limit}`)
    .then(res => res.json())
    .then(data => {
        let todoList = data.data;
        if(todoList.length > 0) {
            document.querySelector('#container-todo').innerHTML = '';
            todoList.forEach((todo) => {
                const todoTemplate = `
                <div class="card mb-4">
                        <div class="card-header">
                            <span class="card-id">${todo.id}</span>
                            <span class="todo-status badge badge-secondary">${todo.status}</span>
                        </div>
                        <div class="card-body">
                            <div class="card-title">
                                <p class="todo-desc font-weight-bold">${todo.description}</p>
                                <p class="badge badge-primary">${todo.severity}</p>
                                <div class="btn-control text-right">
                                    <button onclick="updateStatus(${todo.id})" class="btn btn-primary todo-update">
                                        now: ${todo.status} || change here
                                    </button>
                                    <button onclick="deleteTodo(${todo.id})" class="btn btn-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.querySelector('#container-todo').insertAdjacentHTML('beforeend', todoTemplate);
                   loading.classList.remove('loading');

                
            })
            handlePagination(page);
            searchByDesc();
        } else {
            document.querySelector('#container-todo').innerHTML = 'KHÔNG CÓ TODO NÀO.';
        }
    });
}

renderTodo();

// add
function addTodo(e) {
    e.preventDefault();
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            "id": new Date().getTime(),
            "description": todoDesc.value.trim() === '' ? '(this todo has no title)' : todoDesc.value,
            "severity": severity.value,
            "status": "open",
            "createdAt": new Date().getTime(),
            "updateAt": new Date().getTime()
        }),
    })
    .then(res => res.json())
    .then(data => {
        formAddTodo.reset();
        renderTodo();
        Swal.fire(
            'Success',
            'Your todo has been added.',
            'success'
        )
    })

    
};

formAddTodo.addEventListener('submit', addTodo);

// delete

function deleteTodo(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this todo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${endpoint}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(res => res.json())
            .then(data => {
                renderTodo()
                Swal.fire(
                    'Deleted!',
                    'Your todo has been deleted.',
                    'success'
                )
            })
        }
      })
}

// UPDATE

function updateStatus(id) {
    fetch(`${endpoint}/${id}`)
    .then(res => res.json())
    .then(data => {
        if(data.data.status === 'open') {
            
            fetch(`${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "status": "close",
                    "updateAt": new Date().getTime()
                })
            })
            .then(res => res.json())
            .then(data => renderTodo())
        } else {
            
            fetch(`${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "status": "open",
                    "updateAt": new Date().getTime()
                })
            })
            .then(res => res.json())
            .then(data => renderTodo())
        }
    })

}

// pagination

async function handlePagination(page) {
    document.querySelector('.pagination').innerHTML = '';
    await fetch(`https://tony-json-server.herokuapp.com/api/todos?_page=${page}&_limit=`)
    .then(res => res.json())
    .then(data => {
        let totalCount = data.pagination.totalCount;
        let limit = 5;
        let pages = Math.ceil(totalCount / limit);
        for(i = 1; i <= pages; i++) {
            document.querySelector('.pagination').innerHTML += `
                <li class="page-item">
                    <span class="page-link">${i}</span>
                </li>
            `;
        }
        let pageNow = data.pagination.page - 1;
        document.querySelectorAll('.page-item')[pageNow].classList.add('active');
    })
    await document.querySelectorAll('.page-item').forEach(li => {
        li.addEventListener('click', function(e) {
            renderTodo(li.textContent, 5);
        })
    });

}

// search

 function searchByDesc() {
    search.addEventListener('input', function() {
        const todoDesc = document.querySelectorAll('.todo-desc');
        todoDesc.forEach(todo => {
            todo.parentElement.parentElement.parentElement.style.display = 'none';
            if(todo.textContent.includes(this.value)) {
                todo.parentElement.parentElement.parentElement.style.display = 'block';
            }
        })
    })
}


// filter

function filterTodo() {
    
    filterAll.addEventListener('click', function() {
        search.value = '';
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.style.display = 'block');
    })

    filterOpen.addEventListener('click', function() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.style.display = 'block');
        const cardsStatus = document.querySelectorAll('.todo-status');
        cardsStatus.forEach(status => {
            if(status.textContent == 'close') {
                status.parentElement.parentElement.style.display = 'none';
            }
        });
    })
    filterClose.addEventListener('click', function() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.style.display = 'block');
        const cardsStatus = document.querySelectorAll('.todo-status');
        cardsStatus.forEach(status => {
            if(status.textContent == 'open') {
                status.parentElement.parentElement.style.display = 'none';
            }
        });
    })
}

filterTodo();


// sort

todoOrder.addEventListener('input', function() {
    if(todoOrder.value === 'ASC') {
        sortTodo(1);
    } else {
        sortTodo(-1);
    }
})

function sortTodo(sortBy) {
    if(sortBy === 1) {
       //
    } else if (sortBy === -1) {
        //
    }
}








