
const todoDesc = document.querySelector('#todo-description');
const severity = document.querySelector('#select-severity');
const addTodoBtn = document.querySelector('#add-todo');
const formAddTodo = document.querySelector('#form');
const loading = document.querySelector('#loading');
const btnDeleteTodo = document.querySelector('.btn.btn-danger');
const search = document.querySelector('#search');

const endpoint = 'https://tony-json-server.herokuapp.com/api/todos';

// render
function renderTodo(page = 1, limit = 5) {
    loading.classList.add('loading');
    setTimeout(function() {
        loading.classList.remove('loading');
    }, 500);


    fetch(`${endpoint}/?_page=${page}&_limit=${limit}`)
    .then(res => res.json())
    .then(data => {
        
        let todoList = data.data;
        if(todoList.length > 0) {
            document.querySelector('#container-todo').innerHTML = '';
            todoList.forEach((todo) => {
                const todoTemplate = `
                <div class="card">
                        <div class="card-header">
                            ${todo.id}
                            <span class="todo-status badge badge-secondary">${todo.status}</span>
                        </div>
                        <div class="card-body">
                            <div class="card-title">
                                <p class="font-weight-bold">${todo.description}</p>
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
                    <br>
                `;
                document.querySelector('#container-todo').insertAdjacentHTML('beforeend', todoTemplate);
                
                setTimeout(function() {
                    loading.classList.remove('loading');
                }, 500);

                
            })
            handlePagination(page);
            searchByDesc(page);
        } else {
            document.querySelector('#container-todo').innerHTML = 'KHÔNG CÓ TODO NÀO.';
        }
    });
}

renderTodo();

// add
function addTodo(e) {
    e.preventDefault();
    // if(!todoDesc.value) {
    //     alert('Chua co dau vao')
    //     return;
    // }
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
            "id": new Date().getTime(),
            "description": todoDesc.value,
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
            .then(data => renderTodo())
            setTimeout(function() {
                Swal.fire(
                    'Deleted!',
                    'Your todo has been deleted.',
                    'success'
                  )
            }, 700)
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
            renderTodo(li.textContent);
        })
    });

}

// search

 function searchByDesc(page = 1) {
    
    fetch(`${endpoint}/?_page=${page}&_limit=5`)
    .then(res => res.json())
    .then(data => {
        let todos = data.data;
        search.addEventListener('input', function() {
            todos.forEach(todo => {
                console.log(todo)
                if(todo.description.includes(this.value)) {
                    todo.style.display = 'block';
                }
            })
        })
    });

}





