import { createFormEditDelete } from "./form.js";
//import { updateList, deleteNodes, getFilteredInfo } from "./controller_crud_local_xhr.js";
import { updateList, deleteNodes, calcularPromedio } from "./controller_crud_local_fetch.js";
//import { updateList, deleteNodes, getFilteredInfo } from "./controller_crud_local_axios.js";
export { createTable, createFilters, hideColumns, loadColumnsMenu };


function createTable(list) {
    const table = document.createElement("table");

    table.className = "table table-responsive table-bordered table-striped table-hover";
    table.id = 'tableInfo';

    if (list.length > 0) {
        //inserts headers
        table.appendChild(createHeader(list[0]));
        //inserts body
        table.appendChild(createBody(list));
    }
    return table;
}

function createHeader(item) {
    const thead = document.createElement("thead");
    const trow = document.createElement("tr");

    thead.className = "thead-dark"

    for (const key in item) {
        const th = document.createElement("th");
        const text = document.createTextNode(key);
        th.appendChild(text);
        trow.appendChild(th);
    }

    thead.appendChild(trow);

    return thead;
}

function createBody(lista) {
    const tbody = document.createElement("tbody");

    lista.forEach(element => {
        const trow = document.createElement("tr");

        for (const key in element) {
            const tdata = document.createElement("td");
            const text = document.createTextNode(element[key]);
            tdata.appendChild(text);
            trow.appendChild(tdata);
        }
        setRowAttributes(trow, element);
        addRowHandler(trow);
        tbody.appendChild(trow);
    });

    return tbody;
}

function addRowHandler(tr) {
    if (tr) {
        tr.addEventListener("click", function(e) {
            const formDiv = document.getElementById("formDiv");

            while (formDiv.firstChild) {
                formDiv.removeChild(formDiv.lastChild);
            }
            formDiv.appendChild(createFormEditDelete());

            document.getElementById("txtID").value = e.target.parentElement.getAttribute("data-id");
            document.getElementById("txtTitulo").value = e.target.parentElement.getAttribute("data-titulo");
            document.getElementById("txtDescripción").value = e.target.parentElement.getAttribute("data-descripcion");
            document.getElementById("txtPrecio").value = parseInt(e.target.parentElement.getAttribute("data-precio"));
            document.getElementById("txtPuertas").value = e.target.parentElement.getAttribute("data-puertas");
            document.getElementById("txtKMs").value = e.target.parentElement.getAttribute("data-kilometros");
            document.getElementById("txtPotencia").value = e.target.parentElement.getAttribute("data-potencia");

            //if there's more than one option, use a switch statement
            if (e.target.parentElement.getAttribute("data-transaccion") == "Venta") {
                document.getElementById("rdoVenta").checked = true;
            } else {
                document.getElementById("rdoAlq").checked = true;
            }
        })
    }
}

function setRowAttributes(tr, item) {
    if (tr) {
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                tr.setAttribute("data-" + key, item[key]);
            }
        }
    }
}

function createFilters() {

    const mainDiv = document.createElement('div');
    const divListaFiltros = document.createElement('div');
    const divPromedio = document.createElement('div');

    //mainDiv.className = "d-flex flex-wrap";
    divListaFiltros.className = "input-group mb-3";

    createFilterSelect(divListaFiltros);
    createAvgDiv(divPromedio);
    mainDiv.appendChild(divListaFiltros);
    mainDiv.appendChild(divPromedio);

    return mainDiv;
}

function createAvgDiv(div) {
    const divNombre = document.createElement('div');
    const labelNombre = document.createElement('label');
    const avg = document.createElement('input');

    divNombre.className = "input-group-prepend";
    labelNombre.className = "input-group-text";
    labelNombre.setAttribute('for', 'inputAvg');
    labelNombre.innerHTML += 'Promedio';

    avg.className = "form-control";
    avg.id = 'inputAvg';
    avg.type = 'number';
    avg.value = 0;
    //avg.placeholder = 'N/A';
    avg.readOnly = true;

    divNombre.appendChild(labelNombre);
    divNombre.appendChild(avg);
    div.appendChild(divNombre);
}

function createFilterSelect(div) {
    const divNombre = document.createElement('div');
    const labelNombre = document.createElement('label');
    const select = document.createElement('select');
    const placeholder = document.createElement('option');
    const opcionA = document.createElement('option');
    const opcionB = document.createElement('option');
    const opcionC = document.createElement('option');

    divNombre.className = "input-group-prepend";
    labelNombre.className = "input-group-text";
    labelNombre.setAttribute('for', 'opcionesFiltro');
    labelNombre.innerHTML += 'Filtrar';

    select.className = "custom-select";
    select.id = 'opcionesFiltro';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.id = 'optionPlaceholder';
    placeholder.innerHTML += 'N/A'

    opcionA.value = 'Todos';
    opcionA.id = 'option' + opcionA.value;
    opcionA.innerHTML += opcionA.value;
    opcionB.value = 'Venta';
    opcionB.id = 'option' + opcionB.value;
    opcionB.innerHTML += opcionB.value;
    opcionC.value = 'Alquiler';
    opcionC.id = 'option' + opcionC.value;
    opcionC.innerHTML += opcionC.value;

    divNombre.appendChild(labelNombre);
    select.appendChild(placeholder);
    select.appendChild(opcionA);
    select.appendChild(opcionB);
    select.appendChild(opcionC);

    div.appendChild(divNombre);
    div.appendChild(select);
}

function loadColumnsMenu() {
    const div = document.createElement('div');
    const table = document.getElementById('tableDiv');

    if (table.firstElementChild) {
        const headers = [].slice.call(table.firstElementChild.querySelectorAll('th'));

        headers.forEach(function(th, index) {
            const checkDiv = document.createElement('div');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');

            div.className = 'form-check form-check-inline d-flex flex-wrap';

            checkbox.type = 'checkbox';
            checkbox.className = "form-check-input";
            checkbox.id = 'check' + th.textContent;
            checkbox.value = th.textContent;
            checkbox.checked = true;

            label.id = 'lblchk' + th.textContent;
            label.htmlFor = checkbox.id;
            label.className = "form-check-label";
            label.innerHTML += th.textContent.toUpperCase();

            checkDiv.appendChild(label);
            checkDiv.appendChild(checkbox)
            div.appendChild(checkDiv);
        });

    }

    return div;
}

function hideColumns(unselected, activeFilters) {
    //variables
    const tableDiv = document.getElementById('tableDiv');
    const info = JSON.parse(localStorage.getItem("anuncios")) || [];
    let newInfo = info;

    if (activeFilters != 'N/A') {
        if (activeFilters != 'Todos') {
            newInfo = info.filter((element) => {
                return element.transaccion == activeFilters;
            });
        }
    }

    calcularPromedio(newInfo);

    if (unselected) {
        newInfo.forEach(element => {
            unselected.forEach(key => {
                if (element.hasOwnProperty(key)) {
                    delete element[key];
                }
            });
        });
    }

    deleteNodes(tableDiv);

    tableDiv.appendChild(createTable(newInfo));
}