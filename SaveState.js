/*
Copyright (c) 2024 Cameron Belt

This software is provided under the terms of the MIT license.
For the full license text, please see the LICENSE file in the root directory
of this software distribution or visit:
https://github.com/aws/mit-0

This library is for use on forms or inputs to save and read the state of those inputs to either the URL or browser cache. 
*/
var queryArgs = {};

window.addEventListener('load', function () {
    RunOnloadEventsSelect();
    UpdateFormValuesFromUrl();
    UpdateFormValuesFromCache();
    AddOnChangeEvents();
    RunOnloadFunctions();
});

function RunOnloadEventsSelect() {
    var inputs = document.querySelectorAll("[data-watch-select-onload]");
    inputs.forEach(el => {
        var onload = el.getAttribute("data-watch-select-onload");
        if (onload !== null) {
            var events = onload.split(',');
            events.forEach(event => {
                evalWithPromise(event);
            });
        }
    });
}

//usage: delay(500) - delays 500 milliseconds
const delay = ms => new Promise(res => setTimeout(res, ms));

function UpdateArgs() {
    queryArgs = {};
    var forms = document.querySelectorAll("[data-watch-url='form'],[data-watch-cache='form']");
    forms.forEach(form => {
        Array.from(form.elements).forEach(element => {
            UpdateQueryArgs(element);
        });
    });
    
    var inputs = document.querySelectorAll("[data-watch-url='input'],[data-watch-cache='input']");
    inputs.forEach(input => {
        UpdateQueryArgs(input);
    });
}

function UpdateQueryArgs(element) {
    if (element.nodeName === 'INPUT') queryArgs[element.id] = element.value;
    if (element.nodeName === 'SELECT') {
        if (element.getAttribute('data-watch-select') === 'value') queryArgs[element.id] = element.value;
        else if (element.getAttribute('data-watch-select') === 'label') queryArgs[element.id] =
            document.getElementById(element.id).options[document.getElementById(element.id).selectedIndex].text;
        else queryArgs[element.id] = element.value;
    }
}

function evalWithPromise(functionString) {
    return new Promise((resolve, reject) => {
        try {
            const result = eval(functionString);
            if (typeof result === 'function') {
                Promise.resolve(result.call())
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve(result);
            }
        } catch (error) {
            reject(error);
        }
    });
}

function AddOnChangeEvents() {
    var forms = document.querySelectorAll("[data-watch-url='form']");
    if (forms.count === 0) forms = document.querySelectorAll("[data-watch-url='input']");
    forms.forEach(form => {        
        Array.from(form.elements).forEach(element => {
            AddOnChangeEventUrl(element);
        });
    });

    var inputs = document.querySelectorAll("[data-watch-url='input']");
    inputs.forEach(input => {
        AddOnChangeEventUrl(input);
    });

    var forms = document.querySelectorAll("[data-watch-cache='form']");
    if (forms.count === 0) forms = document.querySelectorAll("[data-watch-cache='input']");
    forms.forEach(form => {        
        Array.from(form.elements).forEach(element => {
            AddOnChangeEventCache(element);
        });
    });

    var inputs = document.querySelectorAll("[data-watch-cache='input']");
    inputs.forEach(input => {
        AddOnChangeEventCache(input);
    });
}

function AddOnChangeEventCache(input) {
    if (input.nodeName === 'INPUT' || input.nodeName === 'SELECT') {
        appendAttribute(input, 'onchange', 'UpdateCache()');
    }
}

function AddOnChangeEventUrl(input) {
    if (input.nodeName === 'INPUT' || input.nodeName === 'SELECT') {
        appendAttribute(input, 'onchange', 'UpdateUrl()');
    }
}

function RunOnloadFunctions() {
    var forms = document.querySelectorAll("form");
    forms.forEach(el => {
        var onload = el.getAttribute("data-watch-onload");
        if (onload !== null) {
            var events = onload.split(',');
            events.forEach(event => {
                eval(event).call();
            });
            //if (onload === 'form' && document.getElementById("formLoaded").value !== 'true') {//this will cause an infinite reload loop. As of right now there is no solution to this problem.
            //    document.getElementById("formLoaded").value = 'true';
            //    el.submit();
            //}
            //else
        }
    });

    var divsAndButtons = document.querySelectorAll("div,button");

    divsAndButtons.forEach(el => {
        var onload = el.getAttribute("data-watch-onload");
        if (onload !== null) {
            eval(onload).call();
        }
    });
}

function UpdateFormValuesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    UpdateFormValues(urlParams);
}

function UpdateFormValuesFromCache() {
    const urlParams = new URLSearchParams(localStorage.getItem(window.location.pathname));
    UpdateFormValues(urlParams);
}

function UpdateFormValues(urlParams) {
    queryArgs = Array.from(urlParams.entries());
    for (const [key, value] of queryArgs) {
        if (key === 'null' || key === '') continue;
        var element = document.getElementById(key);
        if (element.nodeName === 'INPUT') element.value = value;
        if (element.nodeName === 'SELECT') {
            //Select the value from the list if its loaded with the page.
            try {
                if (element.getAttribute('data-watch-select') === 'value') SelectOptionByValue2(element, value);
                else if (element.getAttribute('data-watch-select') === 'label') SelectOption2(element, value);
                else SelectOptionByValue2(element, value);
            }
            catch (error) {
                console.log(error);
            }
            //add an observer so when the list is loaded for the select, it picks the correct one in the list from the url
            //This method is only useful for drop down lists that are loaded after the page loads
            const observer = new MutationObserver((mutations) => {
                var selectElement = mutations[0].target;
                if (selectElement.options.length > 0) {
                    if (selectElement.getAttribute('data-watch-select') === 'value') SelectOptionByValue2(selectElement, value);
                    else if (selectElement.getAttribute('data-watch-select') === 'label') SelectOption2(selectElement, value);
                    else SelectOptionByValue2(selectElement, value);
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

function UpdateCache() {
    var loc = window.location;
    var path = loc.pathname;
    UpdateArgs();
    var queryString = GetParams(queryArgs);
    localStorage.setItem(path, queryString);
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

function appendAttribute(el, attributeName, value) {
    var attribute = el.getAttribute(attributeName);
    if (attribute !== '') attribute += `;${value};`
    else attribute = `${value};`
    el.setAttribute(attributeName, attribute)
}
