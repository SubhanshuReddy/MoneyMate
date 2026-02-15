let expenseList = [];
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
let darkModeSwitch = document.getElementById("darkModeSwitch"); 
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
                expenseList[i].amount = parseInt(amountValue);
                expenseList[i].category = categoryValue;
                expenseList[i].date =dateValue
            }
        }
        editingId=null 
        addButton.textContent="Add Expenses"
    } 
    //Append the object value in the expense list
    else{
          count = count+1 
    let object = {
        id:count,
        name:nameValue,
        amount:parseInt(amountValue),
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

//update the Income , Expense,Balcnce function
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
    totalBalanceValue.textContent="Balance: ₹ "+balance;
    totalIncomeValue.textContent="Income: ₹ "  +totalIncome
    totalAmountValue.textContent = "Expenses: ₹ " + totalExpense;
    updateAnalysis(totalIncome, totalExpense);
} 

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
        textEle.textContent = `${item.name} - ₹${item.amount} (${item.category}) - ${item.date}`; 
        
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
$(document).ready(function () {

  // Sticky header on scroll
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $("header").addClass("sticky");
    } else {
      $("header").removeClass("sticky");
    }
  });

  // Set current year automatically
  function newDate() {
    return new Date().getFullYear();
  }

  const autoDate = document.getElementById("autodate");
  if (autoDate) {
    autoDate.innerHTML = newDate();
  }

});
//
function updateAnalysis(totalIncome, totalExpense) {
    const savings = totalIncome - totalExpense;

    const savingsText = document.getElementById("savingsAnalysis");
    savingsText.textContent = "Savings: ₹ " + savings;

    savingsText.className = "";
    if (totalIncome > 0) {
        const savingRate = (savings / totalIncome) * 100;
        if (savingRate >= 20) savingsText.classList.add("good");
        else if (savingRate >= 10) savingsText.classList.add("warning");
        else savingsText.classList.add("danger");
    }

    findHighestExpense();
    calculateDailyAverage();
}
function findHighestExpense() {
    let maxExpense = 0;
    let expenseName = "";

    for (let item of expenseList) {
        if (item.category === "Expense" && item.amount > maxExpense) {
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
        if (item.category === "Expense") {
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
//                     Monthly comparision
function monthlyComparison() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    for (let item of expenseList) {
        if (item.category !== "Expense") continue;

        const itemDate = new Date(item.date);
        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();

        // This month
        if (itemMonth === currentMonth && itemYear === currentYear) {
            thisMonthTotal += item.amount;
        }

        // Previous month (handles year change)
        if (
            (itemMonth === currentMonth - 1 && itemYear === currentYear) ||
            (currentMonth === 0 && itemMonth === 11 && itemYear === currentYear - 1)
        ) {
            lastMonthTotal += item.amount;
        }
    }

    const compareEl = document.getElementById("monthlyCompare");

    if (thisMonthTotal === 0 && lastMonthTotal === 0) {
        compareEl.textContent = "No monthly data available";
        compareEl.className = "neutral";
        return;
    }

    const diff = thisMonthTotal - lastMonthTotal;

    if (diff > 0) {
        compareEl.textContent =
          `📈 Spending increased by ₹ ${diff} compared to last month`;
        compareEl.className = "increase";
    } 
    else if (diff < 0) {
        compareEl.textContent =
          `📉 Spending decreased by ₹ ${Math.abs(diff)} compared to last month`;
        compareEl.className = "decrease";
    } 
    else {
        compareEl.textContent = "➖ Spending unchanged from last month";
        compareEl.className = "neutral";
    }
}
