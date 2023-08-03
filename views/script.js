
let inputArea = document.getElementById('inputArea');
let list = document.getElementById('todoList');
let listAA = document.getElementById('listAA');


async function renderList(data){
    list.innerHTML = '';
    await data.forEach((item) => {
        let listItem = document.createElement('li');
        listItem.className = "listItem";
        listItem.id = item.id;
        let checkBox = document.createElement('input');
        let image = document.createElement('img');
        image.src = "https://res.cloudinary.com/dciyhiktq/image/upload/v1691085514/"+ item.public_id +".png";
        image.alt = item.image;
        image.className = "imagebox";
        checkBox.type = "checkbox";
        checkBox.className = "check";
        if (item.checked === true) {
            checkBox.checked = true;
            var InputValue = document.createElement('del');
        } else if (item.checked === false) {
            checkBox.checked = false;
            var InputValue = document.createElement('p');
        }
        InputValue.className = "listContent";
        InputValue.innerHTML = item.item;
        let deleteButton = document.createElement('img');
        deleteButton.src = "icons8-delete-24.png";
        deleteButton.className = "deleteBtn";
        listItem.appendChild(InputValue);
        listItem.appendChild(image);
        listItem.appendChild(checkBox);
        listItem.appendChild(deleteButton);
        list.appendChild(listItem);
    });

}


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
        res.json().then(async (data) => {
                    await renderList(data);
                });
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
        res.json().then(async (data) => {
            await renderList(data);
        });
    }); 
}
