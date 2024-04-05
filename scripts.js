document.addEventListener("DOMContentLoaded", function () {
  const slackJsonContainer = document.getElementById("slack-json");
  const blockKitContainer = document.getElementById("block-kit-container");
  const sidebar = document.querySelector(".sidebar");
  const sourceCode = document.querySelector(".source-code");

  const drake = dragula([sidebar, blockKitContainer]);

  drake.on("drop", function (el, target) {
    updateJson();
    addDeleteButton(el);
    updatePreview(); // Call updatePreview when a component is dropped
  });

  function updateJson() {
    const blockElements = Array.from(blockKitContainer.children);
    const updatedJson = {
      fields: blockElements.map((element) => {
        const dataBlock = JSON.parse(element.dataset.block);
        return {
          type: dataBlock.type,
          label: dataBlock.label,
          value: getValueFromInput(element), // Include value in JSON
          options: dataBlock.options || [],
        };
      }),
    };
    slackJsonContainer.textContent = JSON.stringify(updatedJson, null, 2);
  }

  sidebar.querySelectorAll(".drag-item").forEach(function (item) {
    item.addEventListener("mousedown", function () {
      const type = item.dataset.type;
      const newName = prompt("Enter new component name:");
      if (newName) {
        const newElement = createNewElement(type, newName);
        blockKitContainer.appendChild(newElement);
      }
    });
  });

  function createNewElement(type, label) {
    const newElement = document.createElement("div");
    newElement.className = "form-group";
    newElement.dataset.block = JSON.stringify({
      type: type,
      label: label,
    });

    switch (type) {
      case "text":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <input type="text" class="form-control" placeholder="Enter ${label}" oninput="updatePreview()">
                        `;
        break;
      case "email": // Added email type
        newElement.innerHTML = `
                            <label>${label}</label>
                            <input type="email" class="form-control" placeholder="Enter ${label}" oninput="updatePreview()">
                            <div class="invalid-feedback">Please enter a valid email address.</div>
                        `;
        break;
      case "radio":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="${label}" id="${label}-1" value="Option 1" onchange="updatePreview()">
                                <label class="form-check-label" for="${label}-1">Male</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="${label}" id="${label}-2" value="Option 2" onchange="updatePreview()">
                                <label class="form-check-label" for="${label}-2">Female</label>
                            </div>
                        `;
        break;
      case "checkbox":
        newElement.innerHTML = `
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="${label}" value="${label}" onchange="updatePreview()">
                                <label class="form-check-label" for="${label}">${label}</label>
                            </div>
                        `;
        break;
      case "paragraph":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <textarea class="form-control" rows="3" placeholder="Enter ${label} text" oninput="updatePreview()"></textarea>
                        `;
        break;
      case "bold":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <span class="bold" contenteditable="true" oninput="updatePreview()">Enter ${label} text</span>
                        `;
        break;
      case "italic":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <span class="italic" contenteditable="true" oninput="updatePreview()">Enter ${label} text</span>
                        `;
        break;
      case "horizontal-line":
        newElement.innerHTML = `
                            <hr>
                        `;
        break;
      case "image":
        newElement.innerHTML = `
                            <label>${label}</label>
                            <input type="file" id="${label}" accept="image/*" onchange="updatePreview()">
                            <img id="preview-${label}" src="#" alt="Preview" style="max-width: 100%; display: none;">
                        `;
        break;
    }
    addDeleteButton(newElement); // Add delete button to newly created element
    return newElement;
  }

  function addDeleteButton(element) {
    const deleteButton = document.createElement("span");
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = "&#10006;";
    deleteButton.addEventListener("click", function () {
      blockKitContainer.removeChild(element);
      updateJson();
      updatePreview();
    });
    element.appendChild(deleteButton);
  }

  window.deleteElement = function (element) {
    blockKitContainer.removeChild(element);
    updateJson();
    updatePreview();
  };

  window.previewContent = function () {
    updatePreview();
  };

  function updatePreview() {
    const blockElements = Array.from(blockKitContainer.children);
    let previewContent = '<form id="registration-form">';
    blockElements.forEach((element) => {
      const dataBlock = JSON.parse(element.dataset.block);
      switch (dataBlock.type) {
        case "text":
        case "paragraph":
        case "email": // Added email type
        case "bold":
        case "italic":
          const inputElement = element.querySelector(
            "input, textarea, .bold, .italic"
          );
          const inputValue = inputElement.innerText || inputElement.value;
          // Check for bold and italic types and wrap content accordingly
          if (dataBlock.type === "bold") {
            previewContent += `<div class="form-group"><label>${dataBlock.label}</label><input class="form-control" name="${dataBlock.label}" value="${inputValue}" readonly style="font-weight: bold;"></div>`;
          } else if (dataBlock.type === "italic") {
            previewContent += `<div class="form-group"><label>${dataBlock.label}</label><input class="form-control" name="${dataBlock.label}" value="${inputValue}" readonly style="font-style: italic;"></div>`;
          } else {
            previewContent += `<div class="form-group"><label>${dataBlock.label}</label><input class="form-control" name="${dataBlock.label}" value="${inputValue}" readonly></div>`;
          }
          break;
        case "radio":
          const radioChecked = element.querySelector("input:checked");
          if (radioChecked) {
            const radioValue = radioChecked.value;
            previewContent += `<div class="form-group"><label>${
              dataBlock.label
            }</label><div class="form-check"><input class="form-check-input" type="radio" name="${
              dataBlock.label
            }" value="Option 1" ${
              radioValue === "Option 1" ? "checked" : ""
            }><label class="form-check-label" for="${
              dataBlock.label
            }-1">Male</label></div><div class="form-check"><input class="form-check-input" type="radio" name="${
              dataBlock.label
            }" value="Option 2" ${
              radioValue === "Option 2" ? "checked" : ""
            }><label class="form-check-label" for="${
              dataBlock.label
            }-2">Female</label></div></div>`;
          } else {
            previewContent += `<div class="form-group"><label>${dataBlock.label}</label><div class="form-check"><input class="form-check-input" type="radio" name="${dataBlock.label}" value="Option 1"><label class="form-check-label" for="${dataBlock.label}-1">Male</label></div><div class="form-check"><input class="form-check-input" type="radio" name="${dataBlock.label}" value="Option 2"><label class="form-check-label" for="${dataBlock.label}-2">Female</label></div></div>`;
          }
          break;
        case "checkbox":
          previewContent += `<div class="form-group"><div class="form-check"><input class="form-check-input" type="checkbox" id="${
            dataBlock.label
          }" name="${dataBlock.label}" value="${dataBlock.label}" ${
            dataBlock.value === "true" ? "checked" : ""
          }><label class="form-check-label" for="${dataBlock.label}">${
            dataBlock.label
          }</label></div></div>`;
          break;
        case "horizontal-line":
          previewContent += `<hr>`;
          break;
        case "image":
          const fileInput = element.querySelector("input[type=file]");
          const previewImage = element.querySelector("img");
          if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
              previewImage.src = e.target.result;
              previewImage.style.display = "block";
            };
            reader.readAsDataURL(fileInput.files[0]);
          }
          break;
      }
    });
    previewContent +=
      '<button type="button" class="btn btn-primary" onclick="downloadRegistrationForm()">Download Registration Form</button></form>';
    document.getElementById("preview-content").innerHTML = previewContent;
  }

  function downloadRegistrationForm() {
    const formData = new FormData();
    const blockElements = Array.from(blockKitContainer.children);
    blockElements.forEach((element) => {
      const dataBlock = JSON.parse(element.dataset.block);
      const inputElement = element.querySelector(
        "input, textarea, .bold, .italic"
      );
      const inputValue = inputElement.innerText || inputElement.value;
      formData.append(dataBlock.label, inputValue);
    });

    let formDataText = "";
    for (const [key, value] of formData.entries()) {
      formDataText += `${key}: ${value}\n`;
    }

    const fileBlob = new Blob([formDataText], {
      type: "text/plain",
    });
    const fileName = "registration_form.txt";
    const downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.href = window.URL.createObjectURL(fileBlob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
  window.convertJsonToHtml = function () {
    const jsonContent = slackJsonContainer.textContent;
    try {
      const jsonData = JSON.parse(jsonContent);
      let htmlContent = "";
      if (jsonData.fields) {
        jsonData.fields.forEach((field) => {
          switch (field.type) {
            case "text":
            case "paragraph":
            case "email": // Added email type
              htmlContent += `<div class="form-group"><label>${field.label}</label><input class="form-control" name="${field.label}" value="${field.value}" placeholder="Enter ${field.label}" readonly></div>`;
              break;
            case "bold":
              htmlContent += `<div class="form-group"><label>${field.label}</label><b>${field.value}</b></div>`;
              break;
            case "italic":
              htmlContent += `<div class="form-group"><label>${field.label}</label><i>${field.value}</i></div>`;
              break;
            case "radio":
              htmlContent += `<div class="form-group"><label>${
                field.label
              }</label><div class="form-check"><input class="form-check-input" type="radio" name="${
                field.label
              }" id="${field.label}-1" value="Option 1" ${
                field.value === "Option 1" ? "checked" : ""
              }><label class="form-check-label" for="${
                field.label
              }-1">Option 1</label></div><div class="form-check"><input class="form-check-input" type="radio" name="${
                field.label
              }" id="${field.label}-2" value="Option 2" ${
                field.value === "Option 2" ? "checked" : ""
              }><label class="form-check-label" for="${
                field.label
              }-2">Option 2</label></div></div>`;
              break;
            case "checkbox":
              htmlContent += `<div class="form-group"><div class="form-check"><input class="form-check-input" type="checkbox" id="${
                field.label
              }" name="${field.label}" value="${field.label}" ${
                field.value === "true" ? "checked" : ""
              }><label class="form-check-label" for="${field.label}">${
                field.label
              }</label></div></div>`;
              break;
            case "horizontal-line":
              htmlContent += `<hr>`;
              break;
          }
        });
        const htmlBlob = new Blob([htmlContent], {
          type: "text/html",
        });
        const htmlFileName = "generated_form.html";
        const downloadHtmlLink = document.createElement("a");
        downloadHtmlLink.download = htmlFileName;
        downloadHtmlLink.href = window.URL.createObjectURL(htmlBlob);
        downloadHtmlLink.style.display = "none";
        document.body.appendChild(downloadHtmlLink);
        downloadHtmlLink.click();
        document.body.removeChild(downloadHtmlLink);
      } else {
        alert("Invalid JSON format! Please check your JSON content.");
      }
    } catch (error) {
      alert("Error parsing JSON: " + error.message);
    }
  };

  function getValueFromInput(element) {
    const inputElement = element.querySelector(
      "input, textarea, .bold, .italic"
    );
    return inputElement ? inputElement.innerText || inputElement.value : "";
  }
});
