'use strict';

/////////////////////////////////////////////////

// ---> Data <---

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2024-08-18T21:31:17.178Z',
    '2024-09-23T07:42:02.383Z',
    '2024-10-28T09:15:04.904Z',
    '2024-11-01T10:17:24.185Z',
    '2024-12-08T14:11:59.604Z',
    '2025-01-08T17:01:17.194Z',
    '2025-01-09T23:36:17.929Z',
    '2025-01-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'John Doe',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2024-08-20T13:15:33.035Z',
    '2024-09-25T09:48:16.867Z',
    '2024-11-05T06:04:23.907Z',
    '2024-11-25T14:18:46.235Z',
    '2024-12-13T16:33:06.386Z',
    '2025-01-08T14:43:26.374Z',
    '2025-01-09T18:49:59.371Z',
    '2025-01-10T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Mohamed Gamal',
  movements: [4500, 6400, -1500, -900, -2200, -500, 10000, -90],
  interestRate: 1.8,
  pin: 3333,
  movementsDates: [
    '2024-09-25T13:15:33.035Z',
    '2024-10-27T09:48:16.867Z',
    '2024-12-09T06:04:23.907Z',
    '2024-12-15T14:18:46.235Z',
    '2025-01-02T16:33:06.386Z',
    '2025-01-06T14:43:26.374Z',
    '2025-01-08T18:49:59.371Z',
    '2025-01-10T12:01:20.894Z',
  ],
  currency: 'EGP',
  locale: 'ar-EG',
};

const accounts = [account1, account2, account3];
/////////////////////////////////////////////////

// ---> DOM Elements <---

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
/////////////////////////////////////////////////

// ---> Functions and Objects <---

const userLocale = navigator.language;

const dateTimeOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short'
};

const formatDate = function (date, locale, options) {
  return Intl.DateTimeFormat(locale, options).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return Intl.NumberFormat(locale, { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(value);
};

const createUsername = function (accountsArr) {
  accountsArr.forEach(function (account) {
    account.username = account.owner.toLowerCase().split(' ').map(function (name) {
      return name[0];
    }).join('');
  })
};
createUsername(accounts);

const displayMovements = function (acc, sorted = false) {
  containerMovements.innerHTML = '';

  // Combine movements and dates then sort
  const combinedMovsDates = acc.movements.map((mov, i) => ({
    mov,
    date: acc.movementsDates.at(i),
  }));
  if (sorted) combinedMovsDates.sort((a, b) => a.mov - b.mov);

  combinedMovsDates.forEach(function (movObj, i) {
    const transType = movObj.mov > 0 ? 'deposit' : 'withdrawal';

    const formattedDate = formatDate(new Date(movObj.date), acc.locale, dateTimeOptions);
    const formattedCurrency = formatCurrency(movObj.mov, acc.locale, acc.currency);

    // Template literal to insert variables in HTML code
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${transType}">${i + 1}: ${transType}</div>
        <div class="movements__date">${formattedDate}</div>
        <div class="movements__value">${formattedCurrency}</div>
      </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelDate.textContent = formatDate(new Date(), acc.locale, dateTimeOptions);
  labelBalance.textContent = formatCurrency(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const deposits = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(deposits, acc.locale, acc.currency);

  const withdrawals = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => (acc + mov), 0);
  labelSumOut.textContent = formatCurrency(Math.abs(withdrawals), acc.locale, acc.currency);

  const interest = acc.movements.filter(mov => mov > 0).map(mov => mov * acc.interestRate / 100).filter(interest => interest >= 1).reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = formatCurrency(interest, acc.locale, acc.currency);
};

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const hideUI = function () {
  setTimeout(function () {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }, 1000)
};

const blurCursor = function (input) {
  input.blur();
};

const startLogoutTimer = function () {
  let loginTime = 600;
  const tickFunction = function () {
    const minutes = String(Math.trunc(loginTime / 60)).padStart(2, '0');
    const seconds = String(loginTime % 60).padStart(2, '0');
    labelTimer.textContent = `${minutes}:${seconds}`;
    if (loginTime === 0) {
      clearInterval(timer);
      hideUI();
    }
    loginTime--;
  }
  tickFunction();
  const timer = setInterval(tickFunction, 1000);
  return timer;
};

const resetLogoutTimer = function (variable) {
  clearInterval(variable);
  variable = startLogoutTimer();
};
///////////////////////////////////////

// ---> Global variables <---

let currentAccount, timerGlobal;
let sort = false;
///////////////////////////////////////

// ---> Event handlers <---

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  // Find account object
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  // Check credentials
  if (currentAccount) {
    if (currentAccount.pin === Number(inputLoginPin.value)) {
      labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]} ❤️`;

      containerApp.style.opacity = 1;
      updateUI(currentAccount);

      // Hide credentials after successful login
      document.getElementById('credentials').style.display = 'none';

      inputLoginUsername.value = inputLoginPin.value = '';
      blurCursor(inputLoginUsername, inputLoginPin);

      // Clear close account fields
      inputCloseUsername.value = inputClosePin.value = '';

      // Preventing dual timers
      if (timerGlobal) clearInterval(timerGlobal);
      timerGlobal = startLogoutTimer();

    } else {
      alert('Password incorrect');
      inputLoginPin.value = '';
    }

  } else {
    alert('Account does not exist')
    inputLoginUsername.value = inputLoginPin.value = '';
    blurCursor(inputLoginUsername, inputLoginPin);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const recipient = accounts.find(acc => acc.username === inputTransferTo.value);
  const transferAmount = Number(inputTransferAmount.value);

  // 1. Account Checks
  if (currentAccount.username === inputTransferTo.value) {
    alert("Can't transfer to your own account!");
    inputTransferTo.value = '';
    blurCursor(inputTransferTo, inputTransferAmount);

  } else if (!recipient) {
    alert("Account doesn't exist!");
    inputTransferTo.value = '';
    blurCursor(inputTransferTo, inputTransferAmount);

    // 2. Balance Checks
  } else {
    if (currentAccount.balance <= 0 || currentAccount.balance < transferAmount) {
      alert("Not enough balance!");
      inputTransferAmount.value = '';
      blurCursor(inputTransferTo, inputTransferAmount);

    } else if (transferAmount < 0) {
      alert("Can't transfer a negative number!");
      inputTransferAmount.value = '';
      blurCursor(inputTransferTo, inputTransferAmount);

      // Proceed after Balance checks
    } else {
      inputTransferTo.value = inputTransferAmount.value = '';
      blurCursor(inputTransferTo, inputTransferAmount);

      // Back from inactive
      resetLogoutTimer(timerGlobal);

      setTimeout(function () {
        // Push a deposit, withdrawal
        recipient.movements.push(transferAmount);
        currentAccount.movements.push(-transferAmount);

        // Push dates accordingly
        recipient.movementsDates.push(new Date().toISOString());
        currentAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
      }, 3000)
    }
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  const checkLoan = currentAccount.movements.some(mov => mov >= 0.1 * loanAmount);

  if (checkLoan && loanAmount > 0) {
    blurCursor(inputLoanAmount);
    inputLoanAmount.value = '';

    // Back from inactive
    resetLogoutTimer(timerGlobal);

    setTimeout(function () {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 3000);

  } else {
    alert("Your request was denied, enter a number or you don't have enough movements!");
    inputLoanAmount.value = '';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const currentAccIndex = accounts.findIndex(acc => acc.username === currentAccount.username);
  const confirmUser = inputCloseUsername.value;
  const confirmPin = Number(inputClosePin.value);

  if (confirmUser === currentAccount.username && confirmPin === currentAccount.pin) {
    accounts.splice(currentAccIndex, 1);
    inputCloseUsername.value = inputClosePin.value = '';
    blurCursor(inputCloseUsername, inputClosePin);
    hideUI();

    // Stop Logout timer
    clearInterval(timerGlobal);

  } else {
    alert("Wrong credintials");
    blurCursor(inputCloseUsername, inputClosePin);
  }
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  // False is default for sort
  displayMovements(currentAccount, !sort);
  sort = !sort;
});
/////////////////////////////////////////////////

