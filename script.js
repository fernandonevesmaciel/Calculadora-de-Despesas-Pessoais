// 1. Selecionar os elementos do HTML que vamos manipular
const balanceValue = document.getElementById('balance-value');
const incomeValue = document.getElementById('income-value');
const expenseValue = document.getElementById('expense-value');
const historyList = document.getElementById('history');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const incomeRadio = document.getElementById('income-radio');
const expenseRadio = document.getElementById('expense-radio');

const categoryInput = document.getElementById('category');
const showHistoryBtn = document.getElementById('show-history-btn');
const showChartBtn = document.getElementById('show-chart-btn');

const historyContainer = document.querySelector('.transactions-list');
const chartContainer = document.querySelector('.chart-container');

let transactions = [];
let myChart;

// 2. Função para atualizar os saldos e o gráfico na tela
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    
    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    balanceValue.innerText = `R$ ${total}`;
    incomeValue.innerText = `R$ ${income}`;
    expenseValue.innerText = `R$ ${expense}`;
    
    createChart();
}

// 3. Função para adicionar uma nova transação à lista na tela
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? 'expense' : 'income';

    const li = document.createElement('li');
    li.classList.add(sign);
    li.innerHTML = `
        ${transaction.description} (${transaction.category}) <span>R$ ${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn">x</button>
    `;

    const deleteButton = li.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
        deleteTransaction(transaction.id);
    });

    historyList.appendChild(li);
}

// 4. Função para lidar com a submissão do formulário
function addTransaction(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    let amount = +amountInput.value;
    const category = categoryInput.value;

    if (description === '' || amount === 0) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (expenseRadio.checked) {
        amount = -Math.abs(amount);
    }
    
    const newTransaction = {
        id: generateID(),
        description,
        amount,
        category
    };

    transactions.push(newTransaction);
    renderTransactions(transactions);
    updateValues();
    saveTransactions();

    descriptionInput.value = '';
    amountInput.value = '';
    incomeRadio.checked = true;
}

// 5. Função para gerar um ID único
function generateID() {
    return Math.floor(Math.random() * 1000000);
}

// 6. Função para deletar uma transação
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions();
    renderTransactions(transactions);
    updateValues();
}

// 7. Função para salvar as transações no LocalStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// 8. Função de renderização para evitar duplicação de código
function renderTransactions(list) {
    historyList.innerHTML = '';
    list.forEach(addTransactionDOM);
}

// 9. Função para criar e atualizar o gráfico de despesas
function createChart() {
    const expenseData = transactions.filter(t => t.amount < 0);
    
    const categoryTotals = expenseData.reduce((acc, transaction) => {
        const { category, amount } = transaction;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += Math.abs(amount);
        return acc;
    }, {});
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Despesas por Categoria',
                data: data,
                backgroundColor: [
                    '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#9966ff'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Despesas'
                }
            }
        }
    });
}

// 10. Função de inicialização
function init() {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions'));
    if (savedTransactions) {
        transactions = savedTransactions;
    }
    renderTransactions(transactions);
    updateValues();
}

// 11. Adicionar ouvintes de evento
transactionForm.addEventListener('submit', addTransaction);

showHistoryBtn.addEventListener('click', () => {
    historyContainer.classList.toggle('hidden');
    chartContainer.classList.add('hidden');
    
    if (!historyContainer.classList.contains('hidden')) {
        renderTransactions(transactions);
    }
});

showChartBtn.addEventListener('click', () => {
    chartContainer.classList.toggle('hidden');
    historyContainer.classList.add('hidden');
});

init();