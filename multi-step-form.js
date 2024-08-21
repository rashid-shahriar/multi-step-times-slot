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
  let currentStep = 0;
  let selectedDate = ""; // Track the selected date

  function updateForm() {
    formCards.forEach((card, index) => {
      if (index === currentStep) {
        card.classList.add("active");
        progressbarSteps[index].classList.add("active");
      } else {
        card.classList.remove("active");
        progressbarSteps[index].classList.remove("active");
      }
    });

    const progressPercent = (currentStep / (formCards.length - 1)) * 100;
    progressBar.style.width = progressPercent + "%";
  }

  function nextStep() {
    if (currentStep < formCards.length - 1) {
      currentStep++;
      updateForm();
      if (currentStep === formCards.length - 1) {
        showSelectedData(); // Show selected data in the confirmation step
      }
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      currentStep--;
      updateForm();
    }
  }

  form.addEventListener("click", function (event) {
    if (event.target.classList.contains("next")) {
      nextStep();
    } else if (event.target.classList.contains("previous")) {
      previousStep();
    }
  });

  updateForm();

  // Fetch the JSON data
  fetch("timeslots.json")
    .then((response) => response.json())
    .then((data) => {
      populateWorkerSelect(data.workers);
      checkDateAvailability(data.workers);
    })
    .catch((error) => console.error("Error fetching JSON data:", error));

  // Function to populate the worker select element
  function populateWorkerSelect(workers) {
    // Loop through each worker and create an option element
    for (const workerId in workers) {
      const worker = workers[workerId];
      const option = document.createElement("option");
      option.value = workerId; // Use worker ID as the value
      option.text = worker.name; // Use worker name as the text
      workerSelect.appendChild(option);
    }

    // Add an event listener to handle worker selection
    workerSelect.addEventListener("change", function () {
      const selectedWorkerId = this.value;
      console.log("Selected Worker ID:", selectedWorkerId);
      resetSelectedData(); // Clear previously selected data
    });
  }

  // Function to reset previously selected data
  function resetSelectedData() {
    // Clear previously selected date and time slots
    daysClicked.querySelectorAll(".selected").forEach((el) => {
      el.classList.remove("selected");
    });
    timeSlotsDiv.innerHTML = "";
  }

  // Function to check if the selected date has time slots
  function checkDateAvailability(workers) {
    // Ensure this script runs after the calendar script
    daysClicked.addEventListener("dateSelected", (event) => {
      const { day, month, year } = event.detail;

      // Format the date to match the JSON key format (YYYY-MM-DD)
      selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      console.log(`Selected Date: ${selectedDate}`);

      // Get the selected worker ID from the dropdown
      const selectedWorkerId = workerSelect.value;

      // Find the worker in the data
      const selectedWorker = workers[selectedWorkerId];

      if (selectedWorker && selectedWorker.schedule[selectedDate]) {
        console.log(
          `Time slots available for ${selectedDate} for ${selectedWorker.name}`
        );

        // Display all slots, highlighting available and unavailable
        displayAvailableSlots(selectedWorker.schedule[selectedDate]);
      } else {
        console.log(`No time slots available for ${selectedDate}`);
        timeSlotsDiv.innerHTML =
          "<p>No time slots available for the selected date.</p>";
      }
    });
  }

  // Function to display all slots, highlighting available and unavailable slots
  function displayAvailableSlots(slots) {
    timeSlotsDiv.innerHTML = ""; // Clear previous slots

    slots.forEach((slot) => {
      const slotDiv = document.createElement("div");
      slotDiv.textContent = slot.time;
      // Add a class based on availability
      if (slot.available) {
        slotDiv.classList.add("available-slot");
      } else {
        slotDiv.classList.add("unavailable-slot");
      }
      // Optionally, make unavailable slots unclickable
      slotDiv.classList.add("time-slot");
      slotDiv.setAttribute("data-available", slot.available);

      // Add event listener for clicking on the slot
      slotDiv.addEventListener("click", function () {
        if (slot.available) {
          // Deselect other time slots
          timeSlotsDiv.querySelectorAll(".time-slot").forEach((el) => {
            el.classList.remove("selected-time");
          });

          // Mark this slot as selected
          slotDiv.classList.add("selected-time");
        }
      });

      timeSlotsDiv.appendChild(slotDiv);
    });
  }

  // Function to get all the selected information to show
  function getSelectedData() {
    return {
      location: locationSelect.value || "Not Selected",
      service: serviceSelect.value || "Not Selected",
      worker: workerSelect.value || "Not Selected",
      date: selectedDate || "Not Selected",
      time: timeSlotsDiv.querySelector(".selected-time")
        ? timeSlotsDiv.querySelector(".selected-time").textContent
        : "Not Selected",
      customer: customerSelect.value || "Not Selected",
    };
  }

  function showSelectedData() {
    const selectedData = getSelectedData();

    const showDiv = document.getElementById("show");
    showDiv.style.display = "block";

    showDiv.innerHTML = `
      <p>Selected Location: ${selectedData.location}</p>
      <p>Selected Service: ${selectedData.service}</p>
      <p>Selected Worker: ${selectedData.worker}</p>
      <p>Selected Date: ${selectedData.date}</p>
      <p>Selected Time: ${selectedData.time}</p>
      <p>Customer Check: ${selectedData.customer}</p>
    `;
  }

  // Add event listener to submit button
  const submitBtn = document.querySelector('input[type="submit"].submit');
  submitBtn.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the form from submitting
    showSelectedData();
  });
});
