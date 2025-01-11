// function previewImage(event) {
//    const files = event.target.files;
//    const previewContainer = document.getElementById("imagePreviewContainer");
//    previewContainer.innerHTML = ""; // Clear existing previews
//
//      console.log("previewImage file : "+ files);
//    for (let i = 0; i < files.length; i++) {
//      const file = files[i];
//      const reader = new FileReader();
//
//      reader.onload = function (e) {
//        const imgElement = document.createElement("img");
//        imgElement.src = e.target.result;
//
//        imgElement.style.width = "100px";
//        imgElement.style.height = "100px";
//        imgElement.style.objectFit = "cover";
//         imgElement.style.border = "1px solid #ccc";
//         imgElement.style.borderRadius = "5px";
//         previewContainer.appendChild(imgElement);
//         console.log("previewImage file data : "+ previewContainer);
//       };
//
//       reader.readAsDataURL(file);
//       console.log("previewImage file reader : "+ reader);
//   }
// }
$(document).ready(function () {
  $('#images').on('change', function (event) {
    const files = event.target.files; // Get the selected files
    const imagePreviewContainer = $('#imagePreviewContainer');

    // Clear existing previews
    imagePreviewContainer.empty();

    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();

          reader.onload = function (e) {
            // Create an image element
            const img = $('<img>')
              .attr('src', e.target.result)
              .css({
                width: '100px',
                height: '100px',
                objectFit: 'cover',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginRight: '10px',
              });
            imagePreviewContainer.append(img); // Append the image
          };

          reader.readAsDataURL(file); // Read the file
        } else {
          alert('Please upload only image files.');
        }
      });
    }
  });
});
  function deleteImage(imageUrl, index) {
    const confirmation = confirm('Are you sure you want to delete this image?');
    if (confirmation) {
//     const filename = imageUrl.split('/').pop(); // Extract filename from URL
//     const deleteUrl = `/uploads/${filename}`; // DELETE route on the server
// console.log("delete url : "+ )
//     fetch(deleteUrl, { method: 'DELETE' })
//       .then((response) => {
//         if (response.ok) {
//           alert('Image deleted successfully!');
//           // Remove the image from the UI
//           const button = document.querySelector(`button[onclick="deleteImage('${imageUrl}', ${index})"]`);
//           if (button) {
//             button.parentElement.remove();
//           }
//         } else {
//           alert('Failed to delete the image');
//         }
//       })
//       .catch((error) => {
//         console.error('Error deleting the image:', error);
//         alert('An error occurred while deleting the image');
//       });
      const container = document.getElementById('uploadedImagesContainer');
      container.children[index].remove();
      // Add hidden input to track deleted image
       const form = document.querySelector('form');
       const input = document.createElement('input');
       input.type = 'hidden';
       input.name = 'deletedImages[]';
       input.value = imageUrl;
       form.appendChild(input);
    }
}
document.querySelectorAll('.awc-images img').forEach(img => {
  img.addEventListener('click', function () {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '1000';
    modal.style.background = '#fff';
    modal.style.borderRadius = '10px';
    modal.style.padding = '10px';
    modal.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    modal.innerHTML = `<img src="${img.src}" style="max-width: 100%; height: auto;"/>`;
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
      modal.remove();
    });
  });
});
function printAWC(awc) {
  console.log("awc : "+ awc);
  // Create a printable HTML structure
  let imagesContent = "";
  if (awc.images && awc.images.length > 0) {
    imagesContent = `
    <div style="margin-top: 20px;">
      <h3 style="text-align: center;">Images</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
        ${awc.images
          .map(
            (image) => `
            <div style="border: 1px solid #ddd; padding: 5px; border-radius: 5px;">
              <img src="${window.location.origin}/uploads/${image}" alt="AWC Image" style="max-width: 200px; max-height: 150px; display: block; margin: auto;">
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    `;
  } else {
    imagesContent = `<p style="text-align: center; margin-top: 20px;">No images available</p>`;
  }
  const printContent = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center;">AWC Details</h2>
      <p><strong>Scheme:</strong> ${awc.scheme}</p>
      <p><strong>Financial Year:</strong> ${awc.financialYear}</p>
      <p><strong>Name of the Block:</strong> ${awc.block?.name || "N/A"}</p>
      <p><strong>Type of Work:</strong> ${awc.typeOfWork}</p>
      <p><strong>Sanction Order No with Date:</strong> ${awc.sanctionOrder}</p>
      <p><strong>Name of the GP:</strong> ${awc.gp?.name || "N/A"}</p>
      <p><strong>Name of the Village:</strong> ${awc.village?.name || "N/A"}</p>
      <p><strong>Name of the AWC:</strong> ${awc.awc}</p>
      <p><strong>W&CD:</strong> ${awc.WCD}</p>
      <p><strong>NREGA:</strong> ${awc.NREGA}</p>
      <p><strong>Other:</strong> ${awc.other}</p>
      <p><strong>Total:</strong> ${awc.total}</p>
      <p><strong>Expenditure:</strong> ${awc.expenditure}</p>
      <p><strong>Status:</strong> ${awc.status}</p>
      <p><strong>Remark:</strong> ${awc.remark}</p>
      <p><strong>Drinking Water:</strong> ${awc.drinkingWater === false ? "No" : "Yes"}</p>
      <p><strong>Electrification:</strong> ${awc.electrification === false ? "No" : "Yes"}</p>
      <p><strong>Toilet:</strong> ${awc.toilet === false ? "No" : "Yes"}</p>
      ${imagesContent}
    </div>
  `;

  // Open a new window or tab for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print AWC Details</title>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  // Wait for content to load and then trigger print
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

// Function to open the popup and populate with tile data
function previewTile(awc) {
  // Populate form fields
  document.getElementById("popupAWC").value = awc.awc || '';
  document.getElementById("popupScheme").value = awc.scheme || '';
  document.getElementById("popupStatus").value = awc.status || '';
  document.getElementById("popupBlock").value = awc.block.name || '';
  document.getElementById("popupGp").value = awc.gp.name || '';
  document.getElementById("popupVillage").value = awc.village.name || '';
  document.getElementById("popupFY").value = awc.financialYear || '';
  document.getElementById("popupTypeOfWork").value = awc.typeOfWork || '';
  document.getElementById("popupSanctionOrder").value = awc.sanctionOrder || '';
  document.getElementById("popupWCD").value = awc.WCD || '';
  document.getElementById("popupNREGA").value = awc.NREGA || '';
  document.getElementById("popupOther").value = awc.other || '';
  document.getElementById("popupTotal").value = awc.total || '';
  document.getElementById("popupRemark").value = awc.remark || '';
  document.getElementById("popupExpenditure").value = awc.expenditure || '';
  document.getElementById("popupDrinkingWater").value = awc.drinkingWater || '';
  document.getElementById("popupElectrification").value = awc.status || '';
  const awcId = awc._id;
  console.log("awc id : "+ awcId);
  document.getElementById("editBtn").onclick = () => {
    window.location.href = "/edit/" + awcId;
  };
  document.getElementById("btnPrint").onclick = function () {
    printAWC(awc);
  }
  // Populate images
  const popupImages = document.getElementById("popupImages");
  popupImages.innerHTML = ""; // Clear existing images
  if (awc.images && awc.images.length > 0) {
    awc.images.forEach((image) => {
      const imgDiv = document.createElement("div");
      imgDiv.style.position = "relative";

      const img = document.createElement("img");
      img.src = `/uploads/${image}`;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      imgDiv.appendChild(img);

      // const deleteBtn = document.createElement("button");
      // deleteBtn.innerText = "X";
      // deleteBtn.style.cssText =
      //   "position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; border-radius: 50%; cursor: pointer;";
      // deleteBtn.onclick = () => imgDiv.remove(); // Remove image preview
      // imgDiv.appendChild(deleteBtn);

      popupImages.appendChild(imgDiv);
    });
  }

  // Show popup
  document.getElementById("tilePopup").style.display = "block";
  document.getElementById("popupOverlay").style.display = "block";
}

// Close popup
function closePopup() {
  document.getElementById("tilePopup").style.display = "none";
  document.getElementById("popupOverlay").style.display = "none";
}

// Save changes from popup
function saveChanges() {
  const updatedData = {
    awc: document.getElementById("popupAWC").value,
    scheme: document.getElementById("popupScheme").value,
    status: document.getElementById("popupStatus").value,
  };

  console.log("Updated Data:", updatedData);

  // TODO: Add code to send updated data to the server via AJAX or form submission
  closePopup();
}
function toggleViewSlider() {
   const isChecked = document.getElementById('viewToggle').checked;
   const tileContainer = document.getElementById('tileContainer');
   const tableData = document.getElementById('TableData');
   const viewLabel = document.getElementById('viewLabel');

   if (isChecked) {
      tileContainer.style.display = 'none';
      tableData.style.display = 'block';
      viewLabel.textContent = 'Table View';
   } else {
      tileContainer.style.display = 'flex';
      tableData.style.display = 'none';
      viewLabel.textContent = 'Tiles View';
   }
}

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});

// Show loader
async function performDataOperation() {
  const loader = document.getElementById("loader");

  try {
    // Show the loader
    loader.style.display = "flex";

    // Simulate data operation (e.g., loading, updating, or saving data)
    const result = await processData();

    // Handle success
    console.log("Operation Successful:", result);
    alert("Data operation completed successfully!");
  } catch (error) {
    // Handle failure
    console.error("Operation Failed:", error);
    alert("Failed to complete the operation!");
  } finally {
    // Hide the loader
    loader.style.display = "none";
  }
}
function getSchemes(){
  const schemes = ["NA","NREGA","EAS/SGRY","STATE PLAN (BEFORE 2010-11)","NOP","BRGF","CSP","IAP","STATE PLAN","RSVY","WBA","MP LAD & SDF","STATE PLAN(URBAN)","PM JANAMAN"];
  var schemeDD = document.getElementById("scheme");
  schemes.forEach((toh,index) => {
        const option = document.createElement("option");
        option.value = toh.toLowerCase();//.replace(/\s+/g, '-'); // e.g., inam-dengapadar
        option.textContent = toh;
        schemeDD.appendChild(option);
    });
}
function getStatus(){
  const status = ["Not Started","Completed","Plinth Level","Lintel Level","Roof Level","Roof Casted","Finishing","Damaged","Ongoing","Layout given","plinth","Disputed","Foundation"];
  var statusDD = document.getElementById("status");
  status.forEach((toh,index) => {
        const option = document.createElement("option");
        option.value = toh.toLowerCase();//.replace(/\s+/g, '-'); // e.g., inam-dengapadar
        option.textContent = toh;
        statusDD.appendChild(option);
    });
}
// Simulate a data operation
function processData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success or failure
      Math.random() > 0.5 ? resolve("Data saved!") : reject("Data saving failed.");
    }, 3000); // Simulate 3-second operation
  });
}

$(document).ajaxStart(function () {
  $("#loader").show();
});

$(document).ajaxStop(function () {
  $("#loader").hide();
});

// document.addEventListener("DOMContentLoaded", getLocation);
function collectAndSendInfo() {
      // Collect Device Information
      const userAgent = navigator.userAgent;
      const deviceType = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "Mobile" : "Desktop";
      const os = /Windows/.test(userAgent) ? "Windows" :
                 /Mac/.test(userAgent) ? "MacOS" :
                 /Android/.test(userAgent) ? "Android" :
                 /iPhone|iPad|iPod/.test(userAgent) ? "iOS" :
                 /Linux/.test(userAgent) ? "Linux" : "Unknown";

      let locationInfo = {};
      let info;
      // Get Location Information
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            locationInfo = {
              city: data.address.city || data.address.state_district || data.address.village || "N/A",
              state: data.address.state || "N/A",
              country: data.address.country || "N/A",
              latitude,
              longitude
            };
          },
          error => console.error("Error getting :", error.message)
        );
      } else {
        // console.error('Geolocation is not supported by this browser.');
    }
    fetch('/get-ip-info')
      .then(response => response.json())
      .then(data => {
        const [latitude, longitude] = data.loc.split(',');
        if(locationInfo && Object.keys(locationInfo).length === 0){
          locationInfo = {
            city: data.city || 'N/A',
            state: data.region || 'N/A',
            country: data.country || 'N/A',
            latitude,
            longitude
          };
        }
        info = {
          userAgent,
          deviceType,
          os,
          location: locationInfo
        };
        try {
             fetch('/api/device-info', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(info)
           });
         } catch (error) {
           console.error('Error fetching IP location:', error);
         }
      })
      .catch(error => console.error('Error:', error));
}
// document.addEventListener("DOMContentLoaded", collectAndSendInfo);
