(function () {

	const btnNext = document.querySelector('.tab:first-child .btn'),
		  btnPrev = document.querySelector('.btn_prev'),
		  btnSubmit = document.querySelector('.tab:nth-child(2) .btn'),
		  API_KEY = "6d35ccac1f6a3e601d604597b173d24cbdb02986",
	  	  URL_FIO = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio",
		  URL_ADDRESS = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
		  fioInput = document.querySelector('#fio'),
		  addressInput = document.querySelector('#address'), 
		  form = document.querySelector('.card');

	btnNext.addEventListener('click', formValidate);
	btnNext.addEventListener('click', flipCard);
	btnPrev.addEventListener('click', flipCard);
	btnSubmit.addEventListener('click', click => showData(click));

	fioInput.addEventListener('input', input => showSuggestions(fioInput, API_KEY, URL_FIO));
	addressInput.addEventListener('input', input => showSuggestions(addressInput, API_KEY, URL_ADDRESS));

	form.addEventListener('blur', blur => checkInput(blur.target), true);
	form.addEventListener('click', click => clickForm(click.target), true);
	form.addEventListener('focus', focus => focusInput(focus.target), true);
	form.addEventListener('keypress', keypress  => keypressInput(keypress), true);
	form.addEventListener('keyup', keyup  => keyupInput(keyup), true);
	form.addEventListener('change', change => changeInput(change.target), true);
	form.addEventListener('paste', event => {event.preventDefault()});

})();

function showData(event) {
	let inputs = Array.from(document.querySelectorAll('input')),
		btn = document.querySelector('.tab:not(.tab_hidden) .btn_next');

	event.preventDefault();

	formValidate();

	if (btn.classList.contains('btn_next-inactive')) {
		return;
	}
	
	inputs.forEach(item => console.log(item.id + ': ' + item.value));
};

function keyupInput(event) {
	let item = event.target;

	if (item.dataset.hasOwnProperty('masked')) {
		let mask = item.dataset.mask;

		if (event.keyCode == '8') {
			let diff = mask.length - item.selectionStart;

			item.value = item.value.substring(0,item.selectionStart) + mask.substring(mask.length - diff);
			item.setSelectionRange(item.selectionStart - diff, item.selectionStart - diff);

			return;
		}

		event.preventDefault();
	}

	if (item.dataset.validator == 'price') {
		let info = document.querySelector('.field__info b'),
			btn = document.querySelector('.tab:not(.tab_hidden) .btn_next');

		if (item.value.length >= 5 && !((item.value < 20000) || (item.value > 100000))) {
			let ins = calculateInsurance(item.value);

				info.textContent = ins + '₽/мес';
				info.parentElement.style.visibility = 'visible'; 
				hideWarning(item.parentElement.parentElement.querySelector('.field__warning'));
				changeBlockButton(btn);

				return;
		}

		if (item.value < 20000) {
			info.parentElement.style.visibility = 'hidden'; 
			showWarning(item.parentElement.parentElement.querySelector('.field__warning'), 'Мы работаем с квартирами от 20 000 ₽/мес.\nНапишите на help@pik-arenda.ru и мы найдем решение');
			changeBlockButton(btn);	
		}

		if (item.value > 100000) {
			info.parentElement.style.visibility = 'hidden'; 
			showWarning(item.parentElement.parentElement.querySelector('.field__warning'), 'Мы работаем с квартирами до 100 000 ₽/мес.\nНапишите на help@pik-arenda.ru и мы найдем решение');
			changeBlockButton(btn);	
		}
	}

};

function formValidate() {
	let tab = document.querySelector('.tab:not(.tab_hidden)'),
		btn = tab.querySelector('.btn_next'),
		inputs = Array.from(tab.querySelectorAll('input'));

	inputs.forEach(item => checkInput(item));
	changeBlockButton(btn);
};

function changeInput(item) {

	if (item.type == 'file') {
		let itemLabel = document.querySelector('label[for=' + item.id + ']'),
			btn = document.querySelector('.tab:not(.tab_hidden) .btn_next');

		if (item.value != '') {
			itemLabel.classList.add('document_picked');
			itemLabel.classList.remove('document_unpicked');

			changeBlockButton(btn);
			return;
		}

		itemLabel.classList.add('document_unpicked');
		itemLabel.classList.remove('document_picked');

		changeBlockButton(btn);
	}
};

function clickForm(item) {
	let tab = document.querySelector('.tab:not(.tab_hidden)'), 
		list = tab.querySelector('.field__autocomplete');

	if (list.style.visibility == 'visible' && !item.classList.contains('field__autocomplete-item')) {
		clearElem(list);
		list.style.visibility = 'hidden';

		return;
	}
			
};

function keypressInput(event) {
	let item = event.target;

	if (item.dataset.hasOwnProperty('letters')) {
		const regexp = /^[A-Za-zа-яА-Я ]*$/;

		if (!regexp.test(event.key)) {
			event.preventDefault();
		}
	}

	if (item.dataset.hasOwnProperty('numbers')) {
		const regexp = /^[0-9]*$/;

		if (event.keyCode == 8 && !item.dataset.hasOwnProperty('masked')) {
			return;
		}

		if (!regexp.test(event.key)) {
			event.preventDefault();
		}
		
	}

	if (item.dataset.hasOwnProperty('masked')) {
		let mask = item.dataset.mask,
			digits = ['0','1','2','3','4','5','6','7','8','9'];

		event.preventDefault();

		if (item.value == '') {
			item.value = mask;
		}

		if (digits.includes(event.key)) {
			item.value = item.value.replace('_', event.key);
			item.setSelectionRange(item.value.indexOf('_'), item.value.indexOf('_'));
		}
	}
};

function checkInput(item) {
	let parent = item.parentElement,
		tab = document.querySelector('.tab:not(.tab_hidden)'),
		btn = tab.querySelector('.btn_next');

	if	(item.dataset.hasOwnProperty('masked')) {

		if (item.value == item.dataset.mask) {
			item.value = '';
		} else {
			if (item.value.length < item.dataset.mask.length) {
				let diff = item.dataset.mask.length - item.value.length;
	
				item.value += item.dataset.mask.substring(item.dataset.mask.length - diff);
			}

			if (item.value.indexOf('_') > 0) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'поле заполнено не до конца');
				changeBlockButton(btn);

				return;
			}
		}
	}

	if ((item.dataset.hasOwnProperty('required')) && (item.type == 'file') && (item.value == '')) { 
		let label = document.querySelector('label[for=' + item.id + ']');
		label.classList.add('document_unpicked');

		return;
	}

	if ((item.dataset.hasOwnProperty('required')) && (item.value == '')) {
		if (parent.classList.contains('field__commented-input')) {
			showWarning(parent.parentElement.querySelector('.field__warning'), 'это поле нужно заполнить');
			changeBlockButton(btn);

			return; 
		}
		
		showWarning(parent.querySelector('.field__warning'), 'это поле нужно заполнить');
		changeBlockButton(btn);

		return;
	}

	switch(item.dataset.validator) {
		case 'age':
			var dateOfBirth = createDate(item.value),
				today = new Date(), 
				age = today.getFullYear() - dateOfBirth.getFullYear();

			if (dateOfBirth == 'Invalid Date') {
				showWarning(item.parentElement.querySelector('.field__warning'), 'некорректная дата');
				changeBlockButton(btn);
				
				return;
			}

			if (today.getMonth() < dateOfBirth.getMonth()) {
				age--;
			}

			if ((today.getMonth() == dateOfBirth.getMonth()) && (today.getDate() <= dateOfBirth.getDate())) {
				age--;
			}

			if (age < 18) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'нельзя подписать договор, если вам меньше 18 лет');
				changeBlockButton(btn);
			} 

		break;
		case 'issuing': 
			var dateOfBirth = createDate(document.querySelector('#date_of_birth').value), 
				dateOfIssuing = createDate(item.value),
				today = new Date(), 
				period = dateOfIssuing.getFullYear() - dateOfBirth.getFullYear();

			if (dateOfIssuing == 'Invalid Date') {
				showWarning(item.parentElement.querySelector('.field__warning'), 'некорректная дата');
				changeBlockButton(btn);
					
				return;
			}

			if (document.querySelector('#date_of_birth').value == '') {
				return;
			}

			if (dateOfIssuing.getFullYear() > today.getFullYear()) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfIssuing.getFullYear() == today.getFullYear() && dateOfIssuing.getMonth() > today.getMonth()) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfIssuing.getFullYear() == today.getFullYear() && dateOfIssuing.getMonth() == today.getMonth() && dateOfIssuing.getDate() > today.getDate()) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfIssuing.getMonth() < dateOfBirth.getMonth()) {
				period--;
			}

			if ((dateOfIssuing.getMonth() == dateOfBirth.getMonth()) && (dateOfIssuing.getDate() < dateOfBirth.getDate())) {
				period--;
			}

			if (period < 14) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'некорректная дата выдачи');
				changeBlockButton(btn);
			} 

		break;
		case 'email':
			var email = item.value,
				re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		 
    		 if (!re.test(email.toLowerCase())) {
				showWarning(item.parentElement.querySelector('.field__warning'), 'некорректный email-адрес');
				changeBlockButton(btn);
    		 }

		break;
		case 'price':
			 if (item.value < 20000) {
				showWarning(item.parentElement.parentElement.querySelector('.field__warning'), 'Мы работаем с квартирами от 20 000 ₽/мес.\nНапишите на help@pik-arenda.ru и мы найдем решение');
				changeBlockButton(btn);	

				return;
			 }

			 if (item.value > 100000 ) {
				showWarning(item.parentElement.parentElement.querySelector('.field__warning'), 'Мы работаем с квартирами до 100 000 ₽/мес.\nНапишите на help@pik-arenda.ru и мы найдем решение');
				changeBlockButton(btn);	
			 }

		break;
	}

};

function createDate(value) {
	let parsedValue = value.split('.'),
		day = parsedValue[0], 
		month = parsedValue[1],
		year = parsedValue[2];

		return new Date(year + '-' + month + '-' + day);
};

function focusInput(item) {
	let tab = document.querySelector('.tab:not(.tab_hidden)'),
		btn = tab.querySelector('.btn_next'),
		parent = item.parentElement;

	if (parent.classList.contains('field__commented-input')) {
		hideWarning(parent.parentElement.querySelector('.field__warning'));
		changeBlockButton(btn);

		return;
	} 

	hideWarning(parent.querySelector('.field__warning'));
	changeBlockButton(btn);
	
};

function changeBlockButton(btn) {
	let warnings = Array.from(btn.parentElement.querySelectorAll('.field__warning')),
		incompletedInputs = btn.parentElement.querySelector('.document_unpicked'),
		error = warnings.some(item => {return item.style.visibility == 'visible';});

	if (error || incompletedInputs) {
		btn.classList.add('btn_next-inactive');
	} else {
		btn.classList.remove('btn_next-inactive');
	}
};

function flipCard () {
	let card = document.querySelector('.card'),
		tab1 = card.querySelector('.tab:first-child'),
		tab2 = card.querySelector('.tab:nth-child(2)');

		if (card.classList.contains('card_flip')) {
			tab1.classList.remove('tab_hidden');
			tab2.classList.add('tab_hidden');
			card.classList.remove('card_flip');

			return;
		}

	if (!this.classList.contains('btn_next-inactive')) {
		tab1.classList.add('tab_hidden');
		tab2.classList.remove('tab_hidden');
		card.classList.add('card_flip');
	}
};

function showSuggestions (input, key, url) {
	let request = url + "?token=" + key + "&query=" + input.value,
		httpReq = new XMLHttpRequest();  
	  
  	httpReq.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			let list = document.querySelector('#' + input.id + '_autocomplete');

    	   	onSuggest(input, list, JSON.parse(this.responseText));
    	} else if (this.readyState == 4) {
      		console.log("Query failed with " + this.status + " error code:");
      		console.log(this.responseText);
    	}
	};
	  
  	httpReq.open("GET", request, true);
  	httpReq.send();
};

function onSuggest(input, list, suggestions) {
	clearElem(list);

	list.addEventListener('click', function(event) {
		input.value = event.target.textContent;
		
		clearElem(list);
		list.style.visibility = 'hidden';
	})

	if (suggestions.suggestions == '') {
		let parent = input.parentElement;

		if (input.id == 'fio') {
			showWarning(parent.querySelector('.field__warning'), 'ФИО не найдено');
			list.style.visibility = 'hidden';
		} else if (input.id == 'address') {
			showWarning(parent.querySelector('.field__warning'), 'Адрес не найден');
			list.style.visibility = 'hidden';
		}

		return;
	}

	if (input.value == '') {
		let parent = input.parentElement;

		if (input.id == 'fio') {
			showWarning(parent.querySelector('.field__warning'), 'это поле нужно заполнить');
			list.style.visibility = 'hidden';
		} else if (input.id == 'address') {
			showWarning(parent.querySelector('.field__warning'), 'это поле нужно заполнить');
			list.style.visibility = 'hidden';
		}

		return;
	}

	suggestions.suggestions.forEach((item) => createList(item, list));
  }

  function clearElem(el) {
  	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
  };

  function showWarning(el, text) {
  	el.style.visibility = 'visible';
  	el.textContent = text;
  };

  function hideWarning(el) {
  	el.style.visibility = 'hidden';
  	el.textContent = '';
  };

  function createList(item, list) {
	let li = document.createElement('li');
		
	li.textContent = item.value;
	li.classList.add('field__autocomplete-item');

	list.style.visibility = 'visible';
	list.append(li);
  };

  function calculateInsurance(price) {
	if (price >= 45000) {
		console.log('check');
		let ins = 654 + (price * 1.5 * 0.05) / 11 + price * 0.0097;
		console.log(Math.floor(ins/10) * 10);
		return Math.floor(ins/10) * 10;
	}

	let ins = 454 + (price * 1.5 * 0.05) / 11 + price * 0.0097;
	return Math.ceil(ins/10) * 10;

  };