document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("multiStepForm");
  const progressBar = document.querySelector(".progress-bar");
  const progressbarSteps = document.querySelectorAll("#progressbar li");
  const formCards = document.querySelectorAll(".form-card");
  const locationSelect = document.getElementById("locationSelect");
  const serviceSelect = document.getElementById("serviceSelect");
  const customerSelect = document.getElementById("customerSelect");
  const workerSelect = document.getElementById("workerSelect");
  const timeSlotsDiv = document.querySelector(".time-slots");
  const daysClicked = document.querySelector(".days");
  const locationCard = document.getElementById("form-card-1");
  const locationProgress = document.getElementById("progress-step-1");
  const servicePrev = document.getElementById("servicePrev");
  let currentStep = 0;
  let selectedDate = "";
  let workersData = {}; // Store workers data by location

  function updateForm() {
    formCards.forEach((card, index) => {
      const isActive = index === currentStep;
      card.classList.toggle("active", isActive);
      progressbarSteps[index].classList.toggle("active", isActive);
    });

    progressBar.style.width = `${
      (currentStep / (formCards.length - 1)) * 100
    }%`;
  }

  function moveStep(increment) {
    currentStep = Math.max(
      0,
      Math.min(currentStep + increment, formCards.length - 1)
    );
    updateForm();
    if (currentStep === formCards.length - 1) {
      showSelectedData(); // Show selected data in the confirmation step
    }
  }

  form.addEventListener("click", function (event) {
    if (event.target.classList.contains("next")) {
      moveStep(1);
    } else if (event.target.classList.contains("previous")) {
      moveStep(-1);
    }
  });

  function fetchData(url) {
    return fetch(url).then((response) => response.json());
  }

  function populateSelect(element, items) {
    element.innerHTML = `<option value="">Select an option</option>`;
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.text = item;
      element.appendChild(option);
    });
  }

  function resetSelectedData() {
    daysClicked
      .querySelectorAll(".selected")
      .forEach((el) => el.classList.remove("selected"));
    timeSlotsDiv.innerHTML = "";
  }

  // Function to handle the display of available time slots
  function displayAvailableSlots(slots) {
    timeSlotsDiv.innerHTML = slots
      .map((slot) => {
        const availableClass = slot.available
          ? "available-slot"
          : "unavailable-slot";
        return `<div class="time-slot ${availableClass}" data-available="${slot.available}">
                  ${slot.time}
                </div>`;
      })
      .join("");

    timeSlotsDiv.querySelectorAll(".available-slot").forEach((slotDiv) => {
      slotDiv.addEventListener("click", function () {
        timeSlotsDiv
          .querySelectorAll(".time-slot")
          .forEach((el) => el.classList.remove("selected-time"));
        slotDiv.classList.add("selected-time");
      });
    });
  }

  function checkDateAvailability(workers) {
    daysClicked.addEventListener("dateSelected", (event) => {
      const { day, month, year } = event.detail;
      selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const selectedWorkerId = workerSelect.value;
      const selectedWorker = workers[selectedWorkerId];

      if (selectedWorker && selectedWorker.schedule[selectedDate]) {
        displayAvailableSlots(selectedWorker.schedule[selectedDate]);
      } else {
        timeSlotsDiv.innerHTML =
          "<p>No time slots available for the selected date.</p>";
      }
    });
  }

  function getSelectedData() {
    return {
      location: locationSelect.value || "Not Selected",
      service: serviceSelect.value || "Not Selected",
      worker: workerSelect.value || "Not Selected",
      date: selectedDate || "Not Selected",
      time:
        timeSlotsDiv.querySelector(".selected-time")?.textContent ||
        "Not Selected",
      customer: customerSelect.value || "Not Selected",
    };
  }

  function showSelectedData() {
    const selectedData = getSelectedData();
    const showDiv = document.getElementById("show");
    showDiv.style.display = "block";

    fetchData("timeslots.json").then((data) => {
      const locations = data.locations || [];
      const locationHtml =
        locations.length === 1
          ? `<p>Selected Location: ${locations[0]}</p>`
          : `<p>Selected Location: ${selectedData.location}</p>`;

      showDiv.innerHTML = `
        ${locationHtml}
        <p>Selected Service: ${selectedData.service}</p>
        <p>Selected Worker: ${selectedData.worker}</p>
        <p>Selected Date: ${selectedData.date}</p>
        <p>Selected Time: ${selectedData.time}</p>
        <p>Customer Check: ${selectedData.customer}</p>
      `;
    });
  }

  // Function to populate worker select options based on the JSON data
  function populateWorkerSelect(workers) {
    workerSelect.innerHTML = `<option value="">Select a Worker</option>`;
    for (const workerId in workers) {
      const worker = workers[workerId];
      const option = document.createElement("option");
      option.value = workerId;
      option.text = worker.name;
      workerSelect.appendChild(option);
    }

    workerSelect.addEventListener("change", function () {
      resetSelectedData();
      checkDateAvailability(workers);
    });
  }

  // Function to update the workers list based on the selected location
  function updateWorkersByLocation(location) {
    if (workersData[location]) {
      populateWorkerSelect(workersData[location].workers);
    } else {
      workerSelect.innerHTML = `<option value="">No Workers Available</option>`;
    }
  }

  // Fetch and initialize the form data from the JSON file
  fetchData("timeslots.json")
    .then((data) => {
      const locations = Object.keys(data.locations);

      if (locations.length <= 1) {
        locationCard.style.display = "none";
        locationProgress.style.display = "none";
        servicePrev.style.display = "none";
        moveStep(1); // Skip the location step
      } else {
        populateSelect(locationSelect, locations);
      }

      workersData = data.locations; // Store the workers by location

      locationSelect.addEventListener("change", function () {
        resetSelectedData();
        updateWorkersByLocation(locationSelect.value);
      });

      checkDateAvailability(workersData[locationSelect.value]?.workers);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));

  updateForm();

  // Show selected data when submitting the form
  document
    .querySelector('input[type="submit"].submit')
    .addEventListener("click", function (event) {
      event.preventDefault();
      showSelectedData();
    });
});
