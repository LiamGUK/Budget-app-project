// Budget controller function keeps track of all incomes and expenses on page.
var budgetController = (function () { 

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // New property added for new Expense prototype below (calcPercentages).
    };

    Expense.prototype.calcPercentages = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // Structure to hold all data in one location
    var data = {
        // Store values of above function constructor into an array.
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        // function creates a new Income or Expense object based on the function constructor above
        addItem: function (type, des, val) { 
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) { 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem); 

            // Return new element
            return newItem;
        },

        // Delete item function - identfies if item is an exp or inc item
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) { 
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // Calculates total and total expenses.
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate % of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentages(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentages();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };


})(); // budgetController function IIFE ends here.


// next module - UI controller - controls how the items are displayed on page.
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec;

        num = Math.abs(num); // abs = absolute (removes sign from number)
        num = num.toFixed(2); // Puts two decimal numbers on number value of num

        numSplit = num.split('.')

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            // Return an object using the below properties.
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text - place HTML code below into a string.
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description); 
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into DOM - insert adjacent HTML method.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        // function to delete item from page - ID or class name required inorder to delete item.
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Clearing HTML fields on page after adding item to page
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            // Set focus back to first element of page once values have been inputted
            fieldsArr[0].focus();
        },

        // function to print budget values to top of page section
        displayBudget: function (obj) { 
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            // Add if/else statement for display of % sign on form
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, month, months, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
                nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})(); // UIController IFFE ends here.

// Controls what happens to each event - delegates tasks to other controllers above.
var controller = (function (budgetCTRL, UICtrl) {

    // Function to setup event listeners on page
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    // Function for the budget value display on page - total displays at top of page
    var updateBudget = function () {

        // 1. Calculate budget
        budgetCTRL.calculateBudget();

        // 2. Return the budget
        var budget = budgetCTRL.getBudget();

        // 3. Display budget on UI.
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function () {

        // 1. Calculate percentages
        budgetCTRL.calculatePercentages();

        // 2. Read % from budget controller
        var percentages = budgetCTRL.getPercentages();

        //3. Update UI with new %
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get field input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to budget controller
            newItem = budgetCTRL.addItem(input.type, input.description, input.value);

            // 3. Add new item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages(); 
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0]; 
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure.
            budgetCTRL.deleteItem(type, ID);

            // 2. Delete item from UI.
            UICtrl.deleteListItem(itemID);

            //3. Update and show new budget.
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);
controller.init();