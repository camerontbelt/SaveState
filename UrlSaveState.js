var queryArgs = [];

window.addEventListener('load', function () {
    UpdateFormValuesFromUrl();
    AddOnChangeEvents();
    RunOnloadFunctions();
});

function UpdateArgs() {
    queryArgs = [];
    var forms = document.querySelectorAll("[data-watch='form']");
    forms.forEach(form => {
        Array.from(form.elements).forEach(element => {
            UpdateQueryArgs(element);
        });
    });
    
    var inputs = document.querySelectorAll("[data-watch='input']");
    inputs.forEach(input => {
        UpdateQueryArgs(input);
    });
}

function UpdateQueryArgs(element) {
    if (element.nodeName === 'INPUT') queryArgs[element.id] = element.value;
    if (element.nodeName === 'SELECT') {
        if (element.getAttribute('data-watch-select') === 'value') queryArgs[element.id] = element.value;
        if (element.getAttribute('data-watch-select') === 'label') queryArgs[element.id] =
            document.getElementById(element.id).options[document.getElementById(element.id).selectedIndex].text;
    }
}

function AddOnChangeEvents() {
    var forms = document.querySelectorAll("[data-watch='form']");
    if (forms.count === 0) forms = document.querySelectorAll("[data-watch='input']");
    forms.forEach(form => {        
        Array.from(form.elements).forEach(element => {
            AddOnChangeEvent(element);
        });
    });

    var inputs = document.querySelectorAll("[data-watch='input']");
    inputs.forEach(input => {
        AddOnChangeEvent(input);
    });
}

function AddOnChangeEvent(input) {
    if (input.nodeName === 'INPUT' || input.nodeName === 'SELECT') {
        input.setAttribute('onchange', 'UpdateUrl()');
    }
}

function RunOnloadFunctions() {
    var forms = document.querySelectorAll("[data-watch='form']");
    forms.forEach(form => {
        var onload = form.getAttribute("data-watch-onload");
        if (onload !== null) {
            eval(onload).call();
        }
    });
}

function UpdateFormValuesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    queryArgs = Array.from(urlParams.entries());
    for (const [key, value] of queryArgs) {
        var element = document.getElementById(key);
        if (element.nodeName === 'INPUT') element.value = value;
        if (element.nodeName === 'SELECT') {
            //add an observer so when the list is loaded for the select, it picks the correct one in the list from the url
            const observer = new MutationObserver((mutations) => {
                if (element.options.length > 0) {
                    if (element.getAttribute('data-watch-select') === 'value') SelectOptionByValue2(element, value);
                    if (element.getAttribute('data-watch-select') === 'label') SelectOption2(element, value);
                }
            });
            observer.observe(element, { childList: true, subtree: true });
        }
    }
}

function UpdateUrl() {
    var loc = window.location;
    var path = loc.pathname;
    UpdateArgs();
    var queryString = GetParams(queryArgs);
    if(queryString !== '') history.pushState(null, '', `${path}?${queryString.toString()}`)
}

function GetParams(queryArgs) {
    var esc = encodeURIComponent;
    var query = Object.keys(queryArgs)
        .map(k => esc(k) + '=' + esc(queryArgs[k]))
        .join('&');
    return query;
}

function SelectOption2(el, option) {
    var opts = el.options;
    if (opts.length === 0) return;
    for (var j = 0; j <= opts.length; j++) {
        var opt = opts[j];
        if (opt.label === option) {
            el.selectedIndex = j;
            break;
        }
    }
}

function SelectOptionByValue2(el, option) {
    var opts = el.options;
    if (opts.length === 0) return;
    for (var j = 0; j <= opts.length; j++) {
        var opt = opts[j];
        if (opt.value === option) {
            el.selectedIndex = j;
            break;
        }
    }
}

function SelectOptionByAttribute2(el, option, attribute) {
    var opts = el.options;
    if (opts.length === 0) return;
    for (var j = 0; j <= opts.length; j++) {
        var opt = opts[j];
        if (opt.getAttribute(attribute) === option) {
            el.selectedIndex = j;
            break;
        }
    }
}
