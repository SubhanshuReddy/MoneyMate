let expenseList = [];
let chartInstance = null;
let count = 0;
let editingId = null;
//Dom GetElements
let nameInput = document.getElementById("expenseName");
let expenseAmountInput = document.getElementById("expenseAmount"); 
let addButton = document.getElementById("AddExpenseButton"); 
let expenseContainer = document.getElementById("expenseContainer"); 
let categoryInput = document.getElementById("expenseCategory"); 
let totalAmountValue = document.getElementById("totalExpense"); 
let totalBalanceValue = document.getElementById("totalBalance");
let totalIncomeValue = document.getElementById("totalIncome")
let savedData = localStorage.getItem("expenses"); 
let searchInput = document.getElementById("searchInput"); 
let dateInput = document.getElementById("expenseDate"); 
let resetButton = document.getElementById("resetBtn");
let exportBtn = document.getElementById("exportPdfBtn");
let sortSelect = document.getElementById("sortSelect");
let formValue = document.getElementById("formValue");

//form-Values
let nameError = document.getElementById("nameError");
let amountError = document.getElementById("amountError");
let dateError = document.getElementById("dateError");
let categoryError = document.getElementById("categoryError");
// Expense Name Validation
nameInput.addEventListener("blur", function () {
    if (nameInput.value === "") {
        nameError.textContent = "Expense name is required";
    } else {
        nameError.textContent = "";
    }
}); 
//Expense Amount Validation
expenseAmountInput.addEventListener("blur", function () {
    if (expenseAmountInput.value === "") {
        amountError.textContent = "Amount is required";
    } else if (expenseAmountInput.value <= 0) {
        amountError.textContent = "Amount should be greater than 0";
    } else {
        amountError.textContent = "";
    }
});


// Date Validation
dateInput.addEventListener("blur", function () {
    if (dateInput.value === "") {
        dateError.textContent = "Please select a date";
    } else {
        dateError.textContent = "";
    }
});
const categoryIcons = {
  Income: "💰",
  Food: "🍔",
  Travel: "✈️",
  Bills: "📄",
  Shopping: "🛍️",
  Other: "📦"
};

// Category Validation
categoryInput.addEventListener("blur", function () {
    if (categoryInput.value === "") {
        categoryError.textContent = "Please choose a category";
    } else {
        categoryError.textContent = "";
    }
});

//form element preventDefault
formValue.addEventListener("submit",function(event){
    event.preventDefault();
})

//Download option
exportBtn.addEventListener("click", function () {
    let section = document.getElementById("exportSection");

    html2canvas(section, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jspdf.jsPDF("p", "mm", "a4");
        let pdfWidth = pdf.internal.pageSize.getWidth();
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save("Money_Report.pdf");
    });
});

//sorting element
sortSelect.addEventListener("change", function () {
    let value = sortSelect.value;

    if (value === "date-new") {
        expenseList.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    else if (value === "date-old") {
        expenseList.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    else if (value === "amount-high") {
        expenseList.sort((a, b) => b.amount - a.amount);
    }
    else if (value === "amount-low") {
        expenseList.sort((a, b) => a.amount - b.amount);
    }

    displayExpenses();
});

//Resset Button function
resetButton.addEventListener("click",function(){
    nameInput.value="";
    dateInput.value="";
    expenseAmountInput.value ="";
    categoryInput.value =""; 
    expenseList = [];
    localStorage.removeItem("expenses");
    displayExpenses();
    updateTotal();
    
})

//Display the serach Values in the expesnes List
searchInput.addEventListener("input",function(){
    displayExpenses(searchInput.value.trim().toLowerCase())
})

//Append the expense list in localStorage
if (savedData){
    expenseList = JSON.parse(savedData);
    count = expenseList.length;
    displayExpenses();
    updateTotal();
}

// Add Button function
addButton.addEventListener("click",function(){
    let nameValue = nameInput.value; 
    let amountValue = expenseAmountInput.value; 
    let categoryValue = categoryInput.value;
    let dateValue = dateInput.value
    
    if (nameValue==="" || amountValue==="" || categoryValue==="" || dateValue===""){
        alert("Enter the Valid Input");
        return;
    }

   // Edit the expense list
    if (editingId !==null){
        for(let i=0;i<expenseList.length;i++){
            if(expenseList[i].id ===editingId){
                expenseList[i].name = nameValue;
                expenseList[i].amount =parseFloat(amountValue);
                expenseList[i].category = categoryValue;
                expenseList[i].date =dateValue
            }
        }
        editingId=null 
        addButton.textContent="➕ Add Expense"
    } 
    //Append the object value in the expense list
    else{
          count = count+1 
    let object = {
        id:count,
        name:nameValue,
        amount:parseFloat(amountValue),
        category:categoryValue,
        date:dateValue
    } 
     expenseList.push(object); 
    }
    
    localStorage.setItem("expenses",JSON.stringify(expenseList))

    nameInput.value="";
    expenseAmountInput.value="" ;
    categoryInput.value="";
    dateInput.value ="";

    displayExpenses(); 
    updateTotal()
})


//Display the expense list in the web page
function displayExpenses(filter=""){
    expenseContainer.innerHTML=""
     
    for (let i=0;i<expenseList.length;i++){

        let item = expenseList[i]  

        if(filter && !item.name.toLowerCase().includes(filter) && !item.category.toLowerCase().includes(filter)){
            continue;
        }
        
        
        let containerEle = document.createElement("div"); 
        if (item.category ==="Income"){
            containerEle.classList.add("item-box-green")
        }else{
            containerEle.classList.add("item-box-red")
        }
       
        let rowConteiner = document.createElement("div");
        rowConteiner.classList.add("rowContainer");
        

        let textEle = document.createElement('p')
        let icon = categoryIcons[item.category] || "📌";

        textEle.innerHTML = `
        <span class="icon">${icon}</span>
        ${item.name} 
        <span class="category-badge">${item.category}</span>
        - ₹${item.amount} 
        <small>(${item.date})</small>
        `;
        
        //Call the edit function
        let editButton = document.createElement("button");
        editButton.textContent="Edit";
        editButton.classList.add("edit-btn");
        editButton.addEventListener("click",function(){ 
            editingId = item.id
           
            dateInput.value = item.date;
            nameInput.value = item.name;
            expenseAmountInput.value = item.amount;
            categoryInput.value = item.category

            addButton.textContent="Update";
        })

         // Call the delete function
        let delButton = document.createElement("button"); 
        delButton.textContent ="Delete";
        delButton.classList.add("del-btn"); 

        delButton.addEventListener("click",function(){
            deleteExpenses(item.id);
        })  
       //Append all the values in respective mother node
        rowConteiner.appendChild(textEle);
        rowConteiner.appendChild(editButton);
        rowConteiner.appendChild(delButton); 
        containerEle.appendChild(rowConteiner);
        expenseContainer.appendChild(containerEle);
    }
    updateTotal();
} 
addButton.textContent = editingId ? "✅ Update Expense" : "➕ Add Expense"; 
       
//deleteExpenses function
function deleteExpenses(id){
    let newList = [] 
    for (let i=0;i<expenseList.length;i++){
        if (expenseList[i].id !==id){
            newList.push(expenseList[i])
        }
    }
    expenseList = newList;
    localStorage.setItem("expenses", JSON.stringify(expenseList));

    displayExpenses();
    updateTotal();
    
}
document.addEventListener("DOMContentLoaded", function () {
window.addEventListener("scroll", function () {
    document.querySelector(".navbar")
        ?.classList.toggle("sticky", window.scrollY > 50);
});

    const autoDate = document.getElementById("autodate");
    if (autoDate) {
        autoDate.innerHTML = new Date().getFullYear();
    }
});

function updateAnalysis(totalIncome, totalExpense) {
    const savings = totalIncome - totalExpense;

    const savingsText = document.getElementById("savingsAnalysis");
    savingsText.textContent = "Savings: ₹ " + savings;

    savingsText.className = "";
    if (totalIncome > 0) {
        const savingRate = (savings / totalIncome) * 100;
        if (savingRate >= 20) savingsText.classList.add("good");
        else if (savingRate >= 10) savingsText.classList.add("warning-text");
        else savingsText.classList.add("danger-text");
    }

    findHighestExpense();
    calculateDailyAverage();
}
function findHighestExpense() {
    let maxExpense = 0;
    let expenseName = "";

    for (let item of expenseList) {
        if (item.category !== "Income" && item.amount > maxExpense) {
            maxExpense = item.amount;
            expenseName = item.name;
        }
    }

    const el = document.getElementById("highestExpenseAnalysis");

    if (maxExpense > 0) {
        el.textContent = `Highest Expense: ₹ ${maxExpense} (${expenseName})`;
        el.className = "danger-text";
    } else {
        el.textContent = "Highest Expense: ₹ 0";
        el.className = "";
    }
}

function calculateDailyAverage() {
    let total = 0;
    let dateSet = new Set();

    for (let item of expenseList) {
        if (item.category !== "Income") {
            total += item.amount;
            dateSet.add(item.date);
        }
    }

    const dailyAvg =
        dateSet.size > 0 ? Math.round(total / dateSet.size) : 0;

    const el = document.getElementById("dailyAverageAnalysis");

    el.textContent = "Daily Avg: ₹ " + dailyAvg;
    el.className = dailyAvg > 500 ? "warning-text" : "safe-text";
}
//Chart
function renderChart(totalIncome, totalExpense) {
    const ctx = document.getElementById("financeChart").getContext("2d");

    // Destroy old chart before creating new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
datasets: [{
    data: [totalIncome, totalExpense],

    backgroundColor: [
        "rgba(34,197,94,0.9)",   // green
        "rgba(239,68,68,0.9)"    // red
    ],

    borderWidth: 0,
    hoverOffset: 12
}]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
function updateTotal(){
    let totalIncome=0;
    let totalExpense =0 ;

    for (let i=0;i<expenseList.length;i++){
        let item = expenseList[i]
        if (item.category ==="Income"){
            totalIncome += item.amount;
        }else{
            totalExpense += item.amount;
        }
    } 

    let balance = totalIncome-totalExpense;

    totalBalanceValue.textContent = "₹ " + balance;
    totalIncomeValue.textContent = "₹ " + totalIncome;
    totalAmountValue.textContent = "₹ " + totalExpense;

updateAnalysis(totalIncome, totalExpense);
renderChart(totalIncome, totalExpense);
renderCategoryChart(); 
}
function renderCategoryChart() {
    const ctx = document.getElementById("categoryChart").getContext("2d");

    let categoryMap = {};

    for (let item of expenseList) {
        if (item.category !== "Income") {
            let category = item.category.trim();

            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }

            categoryMap[category] += item.amount;
        }
    }


    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }

    window.categoryChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
backgroundColor: [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#3b82f6",
    "#ec4899"
],
borderWidth: 0,
hoverOffset: 10
            }]
        },
        
options: {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                padding: 18,
                usePointStyle: true,
                font: {
                    size: 13
                }
            }
        }
    }
}

    });
}
