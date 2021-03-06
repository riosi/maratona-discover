const Modal = {
    open() {
      // Abrir modal -- adicionar class active ao modal
      document.querySelector('.modal-overlay')
      .classList.add('active')

    },

    // Abrir modal remoção de item
    delete(index) {
      let modal = document.querySelector('#confirmDelete')
      const html = `
      <h2>Deseja excluir item?</h2>
      <div class="input-group actions">
        <a href="#" onclick="Modal.close()" class="button cancel">Cancelar</a>
        <button onclick="Transaction.remove(${index})">Excluir Item</button>
      </div>
      ` 
      modal.innerHTML = html
      document.querySelector('.modal-delete')
      .classList.add('active')
    },

    close() {
      // Fechar modal -- remover class active o modal
      document.querySelector('.modal-overlay', ).classList.remove('active')
      document.querySelector('.modal-delete', ).classList.remove('active')
    }
  }

  const Storage = {
    get() {
      return JSON.parse(localStorage.getItem('devfinances:transactions')) || []
    },

    set(transactions) {
      localStorage.setItem("devfinances:transactions", JSON.stringify(transactions))
    }
  }

  const Transaction = {

    all: Storage.get(),

    add(transaction) {
      Transaction.all.push(transaction)
      App.reload()
    },

    remove(index) {
      Transaction.all.splice(index, 1)
      App.reload()
      Modal.close()
    },

    incomes() {
      // somar as entradas
      let income = 0;
      Transaction.all.forEach(transaction => {
        if (transaction.amount > 0) {
          income += transaction.amount
        }
      })

      return income
    },

    expenses() {
      // somar as saídas
      let expense = 0;
      Transaction.all.forEach(transaction => {
        if (transaction.amount < 0) {
          expense += transaction.amount
        }
      })

      return expense
    },

    total() {
      // entradas - saídas
      return Transaction.incomes() + Transaction.expenses()
    }
  }

  // Substituir os dados do HTML com os dados do JS

  const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
      const tr = document.createElement('tr')
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
      tr.dataset.index = index

      DOM.transactionsContainer.appendChild(tr)   
    },

    innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense"
    const amount = utils.formatCurrency(transaction.amount)
    const html = `
      <tr>
              <td class="description">${transaction.description}</td>
              <td class="${cssClass}">${amount}</td>
              <td class="data">${transaction.date}</td>
              <td>
                <img onclick="Modal.delete(${index})" src="./assets/minus.svg" alt="Remover transação" />
              </td>
            </tr>
      ` 
      return html
    },

    updateBalance() {
      document
      .getElementById('incomeDisplay')
      .innerHTML = utils.formatCurrency(Transaction.incomes())

      document
      .getElementById('expenseDisplay')
      .innerHTML = utils.formatCurrency(Transaction.expenses())

      document
      .getElementById('totalDisplay')
      .innerHTML = utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
      DOM.transactionsContainer.innerHTML = ""
    }
  }

  const utils = {
    formatCurrency(value) {
      const signal = Number(value) < 0 ? "-" : ""

      value = String(value).replace(/\D/g, "")

      value = Number(value) / 100

      value = value.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL"
      })

      return signal + value

    },

    formatAmount(value) {
      value = value * 100
      return Math.round(value)
    },

    formatDate(date) {
      
      const splittedDate = date.split("-")
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` 
    }
  }

  const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector("input#date"), 

    toggleEntradaSaida(tipo) {
      let valorAtual = Form.amount.value;
      if ((tipo === 'entrada' && valorAtual < 0) || (tipo === 'saida' && valorAtual > 0)) {
        Form.amount.value = valorAtual * -1;
      }
    }, 

    getValues() {
      return {
        description: Form.description.value,
        amount: Form.amount.value,
        date: Form.date.value
      }
    },

    validateFields() {
      const {description, amount, date} = Form.getValues()
      
      if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
        throw new Error("Por favor, preencha todos os campos")
      }
    },

    formatValues() {
      let {description, amount, date} = Form.getValues()

      amount = utils.formatAmount(amount)
      date = utils.formatDate(date)

      return {
        description,
        amount,
        date
      }
    },

    clearFields() {
      Form.description.value = ""
      Form.amount.value = ""
      Form.date.value = ""
    },

    submit(event) {
      event.preventDefault()

      try {
        Form.validateFields()

        const transaction = Form.formatValues()

        Transaction.add(transaction)

        Form.clearFields()
        Modal.close()

      } catch (error) {
        alert(error.message)
      }
    }
  
  }

  const App = {
    init() {
      
      
      Transaction.all.forEach(DOM.addTransaction) 

      DOM.updateBalance()

      Storage.set(Transaction.all)
    },
    reload() {
      DOM.clearTransactions()
      App.init()
    }
  }

  App.init()

  
