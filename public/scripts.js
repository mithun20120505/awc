

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
