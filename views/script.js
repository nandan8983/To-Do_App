
let inputArea = document.getElementById('inputArea');
let list = document.getElementById('todoList');
let listAA = document.getElementById('listAA');


// inputArea.addEventListener('keypress', (event) => {
//     if (event.key === "Enter" && inputArea.value !== '') {
//         fetch('/add', {
//             method: 'POST',
//             body: JSON.stringify({ item: inputArea.value, checked: false, id: Date.now() }),
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         }).then((res) => {
//             res.json().then(async (data) => {
//                 await renderList(data);
//             }); });
//         inputArea.value = '';
//     }
// });

// fetch('/todoData').then((res) => {
//     res.json().then(async (data) => {
//         await renderList(data);
//     });
// });


// async function renderList(data){
//     console.log(data);
//     debugger;
//     list.innerHTML = '';
//     await data.forEach((item) => {
//         console.log(item);
//         let listItem = document.createElement('li');
//         listItem.className = "listItem";
//         listItem.id = item.id;
//         let checkBox = document.createElement('input');
//         let imageBox = document.createElement('img');
//         imageBox.src = item.image;
//         checkBox.type = "checkbox";
//         checkBox.className = "check";
//         if (item.cheched == true) {
//             checkBox.checked = true;
//             var InputValue = document.createElement('del');
//             console.log();
//         } else {
//             checkBox.checked = false;
//             var InputValue = document.createElement('p');
//             console.log(InputValue);
//         }
//         InputValue.className = "listContent";
//         InputValue.innerHTML = item.item;
//         let deleteButton = document.createElement('button');
//         deleteButton.className = "deleteBtn";
//         deleteButton.innerHTML = "X";
//         listItem.appendChild(InputValue);
//         listItem.appendChild(checkBox);
//         listItem.appendChild(deleteButton);
//         listItem.appendChild(imageBox);
//         list.appendChild(listItem);
//     });
//     // inputArea.style.height = list.offsetHeight+ 143 + "px";
    

// }


list.addEventListener('click', (e)=>{
    if(e.target.tagName === 'INPUT' && e.target.checked === true){
        updateStatus(e.target.parentElement.firstChild.innerHTML, true, e.target.parentElement.id);
    }
    else if(e.target.tagName === 'INPUT' && e.target.checked === false){
        updateStatus(e.target.parentElement.firstChild.innerHTML, false, e.target.parentElement.id);
    }
    else if(e.target.tagName === 'IMG'){
        deleteItem(e.target.parentElement.id);

    }
}, false)


function updateStatus(item, checked, id ) {
    fetch('/update', {
        method: 'POST',
        body: JSON.stringify({ item: item, checked: checked, id: id }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        console.log(res.status);
        window.location.reload();
        }); 
}
    


function deleteItem(id) {
    fetch('/delete', {
        method: 'POST',
        body: JSON.stringify({ id: id }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        console.log(res.status);
        window.location.reload();
    }); 
}
