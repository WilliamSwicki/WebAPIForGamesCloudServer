const itemContainer = document.getElementById("item-container");

const fetchItems = async ()=>{
    try{
        const responce = await fetch("/testjson");

        if(!responce.ok){
            throw new Error("Failed to get items");
        }

        const items = await responce.json();
        // console.log(items);
        itemContainer.innerHTML = "";
        console.log(window.location.pathname);
        items.forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            if(window.location.pathname ==="/logedIndex"||window.location.pathname ==="/logedIndex.html")
            {
                itemDiv.innerHTML =`<li>${item.item} 
            
            <button onclick="updateItem('${item._id}')">Update</button> 

            <button onclick="deleteItem('${item._id}')">Delete</button>

            </li>`
            itemContainer.appendChild(itemDiv);
            }
            else{
                itemDiv.innerHTML =`<li>${item.item} </li>`
            itemContainer.appendChild(itemDiv);
            }
            
        });

    }catch(err){
        console.error("Error: ",err);
        itemContainer.innerHTML="<p style='color:red'>Failed to get users</p>";
    }
}

const updateItem = async(id)=>{
    try{
        console.log(id);
        window.location.href = `/update/${id}`;
        // const responce = await fetch(`/update/${id}`);
    }catch(err){
        console.error("Failed to connect");
    }
}

const deleteItem = async(id)=>{
    if(!confirm("Are you sure you want to delete this?"))return;
    try{
        console.log(id);
        const responce = await fetch(`/deleteitem/${id}`,{method: 'DELETE'});
        
        if(!responce.ok){
            throw new Error("Failed to delete");
        }

        fetchItems();
    }catch(err){
        console.error("Error deleteing item: ",err)
    }
}

fetchItems();