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
	fioInput.addEventListener('focus', input => showSuggestions(fioInput, API_KEY, URL_FIO));
	addressInput.addEventListener('focus', input => showSuggestions(addressInput, API_KEY, URL_ADDRESS));

	form.addEventListener('blur', blur => checkInput(blur.target), true);
	form.addEventListener('click', click => clickForm(click.target), true);
	form.addEventListener('focus', focus => focusInput(focus.target), true);
	form.addEventListener('input', input  => inputHandler(input), true);
	form.addEventListener('keydown', keydown  => keydownHandler(keydown), true);
	form.addEventListener('keyup', keyup  => keyupHandler(keyup), true);
	form.addEventListener('change', change => changeInput(change.target), true);

	form.addEventListener('paste', paste  => pasteInput(paste), true);

})();

function keydownHandler(event) {
	let item = event.target;

	if (event.keyCode != '8') {
		return;
	}

	if (item.dataset.hasOwnProperty('masked')) {
		let mask = item.dataset.mask;
		
		event.preventDefault();

		if (event.keyCode == '8') {
			let diff =  mask.length - item.selectionStart + 1;

			if (item.value == mask) {
				item.value = mask;

				return;
			}

			item.value = item.value.substring(0, item.selectionStart - 1) + mask.substring(item.selectionStart - 1, mask.length);
			item.setSelectionRange(mask.length - diff, mask.length - diff);

			return;
		}
	}

};

function pasteInput(event) {
	let item = event.target;

	if (item.dataset.hasOwnProperty('masked')) {
		event.preventDefault();

		let mask = item.dataset.mask,
			digits = ['0','1','2','3','4','5','6','7','8','9'],
			value = event.clipboardData.getData('text/plain');

			item.value = mask;

		for (let i = 0; i < value.length; i++) {
			if (digits.includes(value[i])) {
				item.value = item.value.replace('_', value[i]);
				item.setSelectionRange(item.value.indexOf('_'), item.value.indexOf('_'));
			}
		}
	}
};

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

function keyupHandler(event) {
	let item = event.target;

	if (item.dataset.validator == 'price') {
		let info = document.querySelector('.field__info b'),
			btn = document.querySelector('.tab:not(.tab_hidden) .btn_next');

		if (item.value.length < 5) {
			hideWarning(item);
			
			return;
		}

		if (item.value < 20000) {
			info.parentElement.style.visibility = 'hidden'; 
			showWarning(item, 'Мы работаем с квартирами от 20 000 ₽/мес. <br> Напишите на help@pik-arenda.ru и мы найдем решение</span>', true);
			changeBlockButton(btn);	

			return;
		} 
		
		if (item.value > 100000) {
			info.parentElement.style.visibility = 'hidden'; 
			showWarning(item, 'Мы работаем с квартирами до 100 000 ₽/мес. <br> Напишите на help@pik-arenda.ru и мы найдем решение</span>', true);
			changeBlockButton(btn);	

			return;
		}

		let ins = calculateInsurance(item.value);

		info.textContent = ins + '₽/мес';
		info.parentElement.style.visibility = 'visible'; 
		hideWarning(item);
		changeBlockButton(btn);
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
			btn = document.querySelector('.tab:not(.tab_hidden) .btn_next'),
			documentLabels = Array.from(document.querySelectorAll('.tab_side2 .document'));

		if (item.value != '') {
			itemLabel.classList.add('document_picked');
			itemLabel.classList.remove('document_unpicked');

			let isPicked = documentLabels.every(item => {return document.querySelector('#' + item.htmlFor).value != ''});

			if (isPicked) {
				createNewAddFileButton(documentLabels);
			}

			changeBlockButton(btn);
			return;
		}

		itemLabel.classList.add('document_unpicked');
		itemLabel.classList.remove('document_picked');

		changeBlockButton(btn);
	}
};

function createNewAddFileButton(documentLabels) {
	let newDocInput = document.createElement('input'),
		newDocLabel = document.createElement('label')
		plusSign = document.createElement('span'), 
		labelText = document.createElement('span'), 
		closeSign = document.createElement('span'), 
		holder = document.querySelector('.tab_side2 .data__wrapper_documents'),
		index = ++documentLabels.length;


	newDocInput.id = 'document' + index;
	newDocInput.type = 'file';
	newDocInput.dataset.required = '';

	newDocLabel.classList.add('document');
	newDocLabel.htmlFor = 'document' + index;

	plusSign.textContent = '+';
	plusSign.classList.add('document__plus');

	labelText.textContent = 'выбрать файл';
	labelText.classList.add('document__title');

	closeSign.textContent = 'x';
	closeSign.classList.add('document__close');
	closeSign.id = 'close_document' + index;

	newDocLabel.appendChild(plusSign);
	newDocLabel.appendChild(labelText);
	newDocLabel.appendChild(closeSign);

	holder.appendChild(newDocLabel);
	holder.appendChild(newDocInput);

};

function clickForm(item) {
	let tab = document.querySelector('.tab:not(.tab_hidden)'), 
		list = tab.querySelector('.field__autocomplete');

	if (item.classList.contains('document__close'))	{
		let id = item.id.split('_')[1]
			fileInput = document.querySelector('#' + id)
			inputLabel = document.querySelector('label[for=' + id + ']'),
			documentLabels = Array.from(document.querySelectorAll('.tab_side2 .document'));

		event.preventDefault();

		fileInput.value = '';
		inputLabel.classList.remove('document_picked');

		if (documentLabels.length > 3) {
			fileInput.remove();
			inputLabel.remove();

			documentLabels = Array.from(document.querySelectorAll('.tab_side2 .document'))
			documentLabels.forEach((item, index) => {
				let count = index + 1;

				document.querySelector('#' + item.htmlFor).id = 'document' + count;
				item.querySelector('.document__close').id = 'close_document' + count;
				item.htmlFor = 'document' + count;
			});
		}

		return;
	}

	if (list.style.visibility == 'visible' && !item.classList.contains('field__autocomplete-item')) {
		clearElem(list);
		list.style.visibility = 'hidden';

		return;
	}
			
};

function inputHandler(event) {
	let item = event.target;

	if (item.dataset.hasOwnProperty('letters')) {
		let newValue = '',
			oldValue = item.value;
		const regexp = /^[A-Za-zа-яА-Я ]*$/;

		for (let i = 0; i < oldValue.length; i++) {
			if (regexp.test(oldValue[i])) {
				newValue += oldValue[i];
			}
		}

		item.value = newValue;
	}

	if (item.dataset.hasOwnProperty('numbers')) {
		let newValue = '',
			oldValue = item.value;
		const regexp = /^[0-9]*$/;

		for (let i = 0; i < oldValue.length; i++) {
			if (regexp.test(oldValue[i])) {
				newValue += oldValue[i];
			}
		}

		item.value = newValue;
		
	}

	if (item.dataset.hasOwnProperty('masked')) {
		let newValue = item.dataset.mask,
			oldValue = item.value;
		const regexp = /^[0-9]*$/;

		for (let i = 0; i < oldValue.length; i++) {
			if (regexp.test(oldValue[i])) {
				newValue = newValue.replace('_', oldValue[i]);
			}
		}

		item.value = newValue;
	}
};

function checkInput(item) {
	let parent = item.parentElement,
		tab = document.querySelector('.tab:not(.tab_hidden)'),
		btn = tab.querySelector('.btn_next');
	
	item.classList.remove('field__input_correct');
	item.classList.remove('field__input_focused');
	
	if	(item.dataset.hasOwnProperty('masked')) {

		if (item.value == item.dataset.mask) {
			item.value = '';
		} else if (item.value != '') {
			if (item.value.length < item.dataset.mask.length) {
				let diff = item.dataset.mask.length - item.value.length;
	
				item.value += item.dataset.mask.substring(item.dataset.mask.length - diff);
			}

			if (item.value.indexOf('_') > 0) {
				showWarning(item, 'поле заполнено не до конца');
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
		showWarning(item, 'это поле нужно заполнить');
		changeBlockButton(btn);

		return;
	}

	if ((item.dataset.hasOwnProperty('required')) && (item.dataset.suggections == 'none')) {
		return;
	}

	switch(item.dataset.validator) {
		case 'age':
			var dateOfBirth = createDate(item.value),
				today = new Date(), 
				age = today.getFullYear() - dateOfBirth.getFullYear(),
				issuingDateInput = document.querySelector('#date_of_issuing'),
				dateTest = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19|2[0-9])\d{2}$/;

			if (!dateTest.test(item.value)) {
				showWarning(item, 'некорректная дата');
				changeBlockButton(btn);
				
				return;
			}

			if (dateOfBirth.getFullYear() > today.getFullYear()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfBirth.getFullYear() == today.getFullYear() && dateOfBirth.getMonth() > today.getMonth()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfBirth.getFullYear() == today.getFullYear() && dateOfBirth.getMonth() == today.getMonth() && dateOfBirth.getDate() > today.getDate()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}


			if (today.getMonth() < dateOfBirth.getMonth()) {
				age--;
			}

			if ((today.getMonth() == dateOfBirth.getMonth()) && (today.getDate() <= dateOfBirth.getDate())) {
				age--;
			}

			if (issuingDateInput.value != '') {
				checkInput(issuingDateInput);
			}

			if (age < 18) {
				showWarning(item, 'нельзя подписать договор, если вам меньше 18 лет');
				changeBlockButton(btn);

				return;
			}
		break;
		case 'issuing': 
			var birthValue = document.querySelector('#date_of_birth').value,
				dateOfBirth = createDate(document.querySelector('#date_of_birth').value), 
				issuingValue = item.value,
				dateOfIssuing = createDate(item.value),
				today = new Date(), 
				period = dateOfIssuing.getFullYear() - dateOfBirth.getFullYear(),
				dateTest = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.(19|2[0-9])\d{2}$/;;

			if (!dateTest.test(issuingValue)) {
				showWarning(item, 'некорректная дата');
				changeBlockButton(btn);
					
				return;
			}

			if (!dateTest.test(birthValue)) {
				showWarning(item, 'укажите корректную дату рождения');
				return;
			}

			if (dateOfIssuing.getFullYear() > today.getFullYear()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfIssuing.getFullYear() == today.getFullYear() && dateOfIssuing.getMonth() > today.getMonth()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
				changeBlockButton(btn);

				return;
			}

			if (dateOfIssuing.getFullYear() == today.getFullYear() && dateOfIssuing.getMonth() == today.getMonth() && dateOfIssuing.getDate() > today.getDate()) {
				showWarning(item, 'введенная дата не может быть позже сегодняшнего числа');
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
				showWarning(item, 'некорректная дата выдачи');
				changeBlockButton(btn);

				return;
			} 
		break;
		case 'email':
			var email = item.value,
				re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		 
    		 if (!re.test(email.toLowerCase())) {
				showWarning(item, 'некорректный email-адрес');
				changeBlockButton(btn);

				return;
    		 }

		break;
		case 'price':
			 if (item.value < 20000) {
				showWarning(item, 'Мы работаем с квартирами от 20 000 ₽/мес. <br> Напишите на help@pik-arenda.ru и мы найдем решение', true);
				changeBlockButton(btn);	

				return;
			 }

			 if (item.value > 100000 ) {
				showWarning(item, 'Мы работаем с квартирами до 100 000 ₽/мес. <br> Напишите на help@pik-arenda.ru и мы найдем решение', true);
				changeBlockButton(btn);	

				return;
			 }

		break;
	}

	if (item.tagName == "INPUT") {
		item.classList.add('field__input_correct');
		hideWarning(item);
	}

	changeBlockButton(btn);

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

	if (item.type == 'file' || item.tag != 'INPUT') {
		return;
	}
	
	item.classList.add('field__input_focus');
	hideWarning(item);
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

	if (!input.dataset.suggestions) {
		input.dataset.suggestions = 'search';

		return;
	}
	  
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

	input.dataset.suggections = 'search';

	list.addEventListener('click', function(event) {
		input.value = event.target.textContent;
		
		clearElem(list);
		list.style.visibility = 'hidden';
	})

	if (suggestions.suggestions == '') {
		let parent = input.parentElement;

		input.dataset.suggections = 'none';

		if (input.id == 'fio') {
			showWarning(input, 'ФИО не найдено');
			list.style.visibility = 'hidden';
		} else if (input.id == 'address') {
			showWarning(input, 'Адрес не найден');
			list.style.visibility = 'hidden';
		}

		return;
	}

	if (input.value == '') {
		let parent = input.parentElement;

		if (input.id == 'fio') {
			showWarning(input, 'это поле нужно заполнить');
			list.style.visibility = 'hidden';
		} else if (input.id == 'address') {
			showWarning(input, 'это поле нужно заполнить');
			list.style.visibility = 'hidden';
		}

		return;
	}

	hideWarning(input);
	suggestions.suggestions.forEach((item) => createList(item, list));
  }

  function clearElem(el) {
  	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
  };

  function showWarning(input, text, isMultiline) {
  	let message = document.querySelector("span[id=warning_" + input.id + "]");

	input.classList.remove('field__input_correct');
	input.classList.add('field__input_warning');
	message.style.visibility = 'visible';
	  
	if (isMultiline)  {	
		let warning = document.createElement('span');

		warning.innerHTML = text;

		message.innerHTML = '';
		message.appendChild(warning);

		return;
	}

	message.textContent = text;
  };

  function hideWarning(input) {
  	let message =  document.querySelector("span[id=warning_" + input.id + "]");

	input.classList.remove('field__input_warning');
  	message.style.visibility = 'hidden';
  	message.textContent = '';
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
		let ins = 654 + (price * 1.5 * 0.05) / 11 + price * 0.0097;

		return Math.floor(ins/10) * 10;
	}

	let ins = 454 + (price * 1.5 * 0.05) / 11 + price * 0.0097;
	
	return Math.ceil(ins/10) * 10;

  };